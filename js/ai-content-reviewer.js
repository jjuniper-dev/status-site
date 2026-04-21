// AI Content Reviewer — Claude API integration for intelligence page content analysis
// Analyzes draft content for accuracy, impact, consistency, and governance implications

class AIContentReviewer {
  constructor() {
    this.apiKey = null;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-opus-4-7';
    this.loadApiKey();
  }

  // Load API key from localStorage
  loadApiKey() {
    const stored = localStorage.getItem('anthropic_api_key');
    if (stored) {
      this.apiKey = stored;
    }
  }

  // Save API key to localStorage (with warning)
  setApiKey(key) {
    if (!key) return false;
    localStorage.setItem('anthropic_api_key', key);
    this.apiKey = key;
    return true;
  }

  // Clear API key
  clearApiKey() {
    localStorage.removeItem('anthropic_api_key');
    this.apiKey = null;
  }

  // Check if API key is configured
  hasApiKey() {
    return this.apiKey && this.apiKey.length > 0;
  }

  // Build system prompt for intelligence content review
  buildSystemPrompt() {
    return `You are an AI content reviewer for an enterprise architecture intelligence page focused on AI governance and platform strategy for a Canadian government health agency (Health Canada / PHAC).

Your role is to analyze drafts of intelligence page updates and provide structured feedback on:

1. **What Changed**: Explicitly identify sections added, modified, or removed
2. **Why It Matters**: Explain the significance of changes for architecture, governance, or risk
3. **Consistency**: Flag any contradictions with existing content on the page
4. **Accuracy**: Assess factual claims against the context provided
5. **Implications**: Identify strategic, governance, or operational impacts
6. **Risk Factors**: Call out potential governance exposures or decision impacts
7. **Recommendations**: Suggest refinements or clarifications

Focus areas for this intelligence page:
- PATH (Enterprise AI Control Plane) vs HAIL (Runtime)
- Governance gaps and shadow AI risks
- Architectural fragmentation concerns
- Operational signals and their implications
- Production readiness vs. deployment completion
- Enterprise scale and control inheritance

Be precise, evidence-based, and focused on helping the author improve clarity, accuracy, and governance alignment.`;
  }

  // Build review request prompt
  buildReviewPrompt(draftContent, currentContent) {
    return `Please review the following draft update to the intelligence page.

CURRENT PUBLISHED CONTENT:
---
${currentContent}
---

DRAFT UPDATE:
---
${draftContent}
---

Provide structured analysis in the following format:

## What Changed
[List specific sections added, modified, or removed]

## Why It Matters
[Explain strategic and governance significance]

## Consistency Check
[Flag any contradictions with existing content]

## Accuracy Assessment
[Evaluate factual claims in the context of HC/PHAC AI landscape]

## Implications
- Governance implications
- Architectural impact
- Operational signal clarity

## Risk Factors Identified
[List governance, scale, or decision risks]

## Recommendations
[Suggest specific improvements or clarifications]

## Overall Assessment
[Summary: Is this ready to publish? Any critical issues?]`;
  }

  // Call Claude API for content review
  async reviewContent(draftContent, currentContent) {
    if (!this.hasApiKey()) {
      throw new Error('Anthropic API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildReviewPrompt(draftContent, currentContent);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          throw new Error('Invalid Anthropic API key. Please verify and try again.');
        }
        throw new Error(`API Error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const reviewText = data.content[0].text;

      return {
        status: 'success',
        review: reviewText,
        timestamp: new Date().toISOString(),
        model: this.model
      };
    } catch (error) {
      console.error('AI Review Error:', error);
      throw error;
    }
  }

  // Parse review into structured sections
  parseReview(reviewText) {
    const sections = {
      whatChanged: '',
      whyItMatters: '',
      consistency: '',
      accuracy: '',
      implications: [],
      riskFactors: [],
      recommendations: [],
      overallAssessment: ''
    };

    const lines = reviewText.split('\n');
    let currentSection = null;
    let buffer = [];

    for (const line of lines) {
      if (line.match(/^## What Changed/i)) {
        if (buffer.length) sections[currentSection] = buffer.join('\n').trim();
        currentSection = 'whatChanged';
        buffer = [];
      } else if (line.match(/^## Why It Matters/i)) {
        if (buffer.length) sections[currentSection] = buffer.join('\n').trim();
        currentSection = 'whyItMatters';
        buffer = [];
      } else if (line.match(/^## Consistency/i)) {
        if (buffer.length) sections[currentSection] = buffer.join('\n').trim();
        currentSection = 'consistency';
        buffer = [];
      } else if (line.match(/^## Accuracy/i)) {
        if (buffer.length) sections[currentSection] = buffer.join('\n').trim();
        currentSection = 'accuracy';
        buffer = [];
      } else if (line.match(/^## Implications/i)) {
        if (buffer.length && currentSection) sections[currentSection] = Array.isArray(sections[currentSection]) ? sections[currentSection] : [buffer.join('\n').trim()];
        currentSection = 'implications';
        buffer = [];
      } else if (line.match(/^## Risk Factors/i)) {
        if (buffer.length && currentSection) sections[currentSection] = Array.isArray(sections[currentSection]) ? sections[currentSection] : [buffer.join('\n').trim()];
        currentSection = 'riskFactors';
        buffer = [];
      } else if (line.match(/^## Recommendations/i)) {
        if (buffer.length && currentSection) sections[currentSection] = Array.isArray(sections[currentSection]) ? sections[currentSection] : [buffer.join('\n').trim()];
        currentSection = 'recommendations';
        buffer = [];
      } else if (line.match(/^## Overall Assessment/i)) {
        if (buffer.length && currentSection) sections[currentSection] = Array.isArray(sections[currentSection]) ? sections[currentSection] : [buffer.join('\n').trim()];
        currentSection = 'overallAssessment';
        buffer = [];
      } else if (line.trim()) {
        buffer.push(line);
      }
    }

    // Flush final buffer
    if (buffer.length && currentSection) {
      if (Array.isArray(sections[currentSection])) {
        sections[currentSection] = [...sections[currentSection], buffer.join('\n').trim()];
      } else {
        sections[currentSection] = buffer.join('\n').trim();
      }
    }

    return sections;
  }

  // Cache review in localStorage
  cacheReview(review) {
    localStorage.setItem('intelligence_ai_review', JSON.stringify({
      review: review.review,
      timestamp: review.timestamp,
      parsed: this.parseReview(review.review)
    }));
  }

  // Get cached review
  getCachedReview() {
    const cached = localStorage.getItem('intelligence_ai_review');
    return cached ? JSON.parse(cached) : null;
  }

  // Clear cached review
  clearCachedReview() {
    localStorage.removeItem('intelligence_ai_review');
  }

  // Analyze imported content (text or image) for relevance and incorporation approach
  async analyzeImportedContent(content, prompt, metadata) {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const systemPrompt = `You are analyzing imported content for an enterprise AI governance intelligence page.
Determine: (1) Is this relevant? (2) What sections should it inform? (3) Key insights? (4) How to incorporate?
Respond with a structured analysis that helps the author decide whether and how to use this content.`;

    const messages = [
      {
        role: 'user',
        content: this.buildImportAnalysisPrompt(content, metadata, prompt)
      }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1000,
          system: systemPrompt,
          messages
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.content[0]?.text || '';

      return this.parseImportAnalysis(analysisText);
    } catch (error) {
      throw new Error(`Failed to analyze imported content: ${error.message}`);
    }
  }

  buildImportAnalysisPrompt(content, metadata, customPrompt) {
    const contentPreview = metadata.isImage
      ? `[Image: ${metadata.fileName}]`
      : content.substring(0, 1000);

    return `${customPrompt}

IMPORTED CONTENT:
---
${contentPreview}
---

Provide a concise analysis with:
- Relevance assessment (is this useful for the intelligence page?)
- Suggested sections/areas it should inform
- Key insights to extract
- How it should be incorporated (as-is, synthesized, referenced, etc.)
- Any concerns or caveats`;
  }

  parseImportAnalysis(analysisText) {
    const analysis = {
      isRelevant: !analysisText.toLowerCase().includes('not relevant'),
      relevance: this.extractSection(analysisText, 'Relevance'),
      suggestedSections: this.extractSection(analysisText, 'Suggested'),
      keyInsights: this.extractSection(analysisText, 'Key Insights'),
      incorporationApproach: this.extractSection(analysisText, 'How|Incorporate'),
      concerns: this.extractSection(analysisText, 'Concerns|Caveats')
    };

    return analysis;
  }

  extractSection(text, keyword) {
    const regex = new RegExp(`${keyword}[^\\n]*\\n([^\\n]+(?:\\n(?!\\n)[^\\n]+)*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }
}

// Export for use in intelligence-editor.js
window.AIContentReviewer = AIContentReviewer;
