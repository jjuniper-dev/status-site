// LocalLLMAnalyzer — Browser-based LLM using Transformers.js (Hugging Face)
// Zero external API calls, all inference runs locally in browser
// Models: Distilbert for classification, DistilGPT2 for text generation

class LocalLLMAnalyzer {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.classificationPipeline = null;
    this.summarizationPipeline = null;
    this.modelStatus = 'uninitialized';
    this.onStatusChange = null;
  }

  setStatusCallback(callback) {
    this.onStatusChange = callback;
  }

  updateStatus(status, message = '') {
    this.modelStatus = status;
    if (this.onStatusChange) {
      this.onStatusChange(status, message);
    }
  }

  async ensureTransformersLoaded() {
    if (window.transformers) {
      return;
    }

    this.updateStatus('loading', 'Loading Transformers.js library...');

    // Load from CDN with fallback
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';
      script.onload = () => {
        this.updateStatus('ready', 'Transformers.js loaded');
        resolve();
      };
      script.onerror = () => {
        this.updateStatus('error', 'Failed to load Transformers.js');
        reject(new Error('Failed to load Transformers.js'));
      };
      document.head.appendChild(script);
    });
  }

  async initModels() {
    if (this.isLoaded) return;
    if (this.isLoading) return;

    this.isLoading = true;
    this.updateStatus('loading', 'Initializing local models (first time is slower)...');

    try {
      await this.ensureTransformersLoaded();

      const { pipeline } = window.transformers;

      // Load zero-shot classification model (for relevance assessment)
      this.updateStatus('loading', 'Loading zero-shot classifier...');
      this.classificationPipeline = await pipeline(
        'zero-shot-classification',
        'Xenova/distilbert-base-uncased-mnli'
      );

      // Load summarization model (for key insights extraction)
      this.updateStatus('loading', 'Loading summarization model...');
      this.summarizationPipeline = await pipeline(
        'summarization',
        'Xenova/distilbart-cnn-6-6'
      );

      this.isLoaded = true;
      this.isLoading = false;
      this.updateStatus('ready', 'Local LLM ready (no external calls)');
    } catch (error) {
      this.isLoading = false;
      this.updateStatus('error', `Failed to initialize models: ${error.message}`);
      throw error;
    }
  }

  async assessRelevance(content, metadata) {
    if (!this.isLoaded) await this.initModels();

    this.updateStatus('analyzing', 'Assessing relevance...');

    try {
      const candidateLabels = [
        'relevant to enterprise AI governance',
        'relevant to architecture and platform',
        'relevant to operational concerns',
        'relevant to compliance and control',
        'not relevant to intelligence page'
      ];

      const contentPreview = content.substring(0, 500);

      const result = await this.classificationPipeline(
        contentPreview,
        candidateLabels,
        { multi_class: true }
      );

      const topLabel = result.labels[0];
      const topScore = result.scores[0];
      const isRelevant = topScore > 0.3 && !topLabel.includes('not relevant');

      return {
        isRelevant,
        relevance: `${topLabel.charAt(0).toUpperCase() + topLabel.slice(1)} (confidence: ${(topScore * 100).toFixed(0)}%)`,
        confidence: topScore
      };
    } catch (error) {
      throw new Error(`Relevance assessment failed: ${error.message}`);
    }
  }

  async extractKeyInsights(content, metadata) {
    if (!this.isLoaded) await this.initModels();

    this.updateStatus('analyzing', 'Extracting key insights...');

    try {
      // Limit content for summarization (models have token limits)
      const contentChunk = content.substring(0, 1024);

      if (contentChunk.length < 100) {
        return contentChunk;
      }

      const summary = await this.summarizationPipeline(contentChunk, {
        max_length: 150,
        min_length: 50
      });

      return summary[0]?.summary_text || contentChunk.substring(0, 200);
    } catch (error) {
      // Fallback to excerpt if summarization fails
      return content.substring(0, 300);
    }
  }

  async suggestIncorporation(content, metadata) {
    if (!this.isLoaded) await this.initModels();

    // Rule-based suggestions (local, no LLM call)
    const suggestions = [];

    if (metadata.isImage) {
      suggestions.push('Include as embedded image with caption');
      suggestions.push('Reference in relevant section with visual context');
    } else {
      if (content.length > 500) {
        suggestions.push('Summarize and synthesize into existing sections');
      } else {
        suggestions.push('Can be appended directly or integrated by topic');
      }

      if (this.hasGovernanceKeywords(content)) {
        suggestions.push('Should inform governance/control sections');
      }
      if (this.hasArchitectureKeywords(content)) {
        suggestions.push('Should inform architecture/platform sections');
      }
      if (this.hasRiskKeywords(content)) {
        suggestions.push('Should inform risk/mitigation sections');
      }
    }

    return suggestions.length > 0
      ? suggestions.join(' | ')
      : 'Can be appended to relevant section';
  }

  hasGovernanceKeywords(text) {
    return /governance|control|audit|compliance|policy|authority|approval/i.test(text);
  }

  hasArchitectureKeywords(text) {
    return /architecture|platform|infrastructure|system|component|design|integration/i.test(text);
  }

  hasRiskKeywords(text) {
    return /risk|threat|exposure|vulnerability|gap|issue|concern|failure/i.test(text);
  }

  async analyzeImportedContent(content, metadata) {
    if (!this.isLoaded) {
      this.updateStatus('initializing', 'Initializing local models (one-time download)...');
      await this.initModels();
    }

    try {
      const relevance = await this.assessRelevance(content, metadata);
      const insights = await this.extractKeyInsights(content, metadata);
      const approach = await this.suggestIncorporation(content, metadata);

      this.updateStatus('ready', 'Analysis complete');

      return {
        isRelevant: relevance.isRelevant,
        relevance: relevance.relevance,
        suggestedSections: approach,
        keyInsights: insights,
        incorporationApproach: `${approach}. Content appears ${relevance.isRelevant ? 'relevant' : 'potentially marginal'} to intelligence page.`,
        concerns: relevance.confidence < 0.5 ? 'Low confidence assessment - review manually recommended' : null
      };
    } catch (error) {
      throw new Error(`Local analysis failed: ${error.message}`);
    }
  }

  // Get current model status for UI display
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      status: this.modelStatus
    };
  }

  // Clear models from memory (frees up RAM)
  clearModels() {
    this.classificationPipeline = null;
    this.summarizationPipeline = null;
    this.isLoaded = false;
    this.updateStatus('uninitialized', 'Models cleared');
  }
}

// Export for use in intelligence-editor.js
window.LocalLLMAnalyzer = LocalLLMAnalyzer;
