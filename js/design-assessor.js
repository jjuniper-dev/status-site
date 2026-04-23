export class DesignAssessor {
  constructor() {
    this.modelsLoaded = false;
    this.classifier = null;
  }

  async loadModels() {
    if (this.modelsLoaded) return;

    try {
      // Using ml5.js for fast inference
      // Initialize text classification model
      this.classifier = await ml5.textClassification('https://storage.googleapis.com/tfjs-models/tfjs-seq2seq/translation_en_es/model.json', {
        maxLength: 512
      });
      this.modelsLoaded = true;
    } catch (err) {
      console.warn('ML5 model failed, using fallback analysis:', err);
      // Fallback: use pattern-based analysis
      this.classifier = null;
    }
  }

  async assessDesign(imageData, criteria) {
    await this.loadModels();

    const criteriaList = criteria
      .split('\n')
      .filter(c => c.trim())
      .map(c => c.replace(/^[-•]\s*/, '').trim());

    // Analyze image with vision-based insights
    const imageAnalysis = await this.analyzeImageContent(imageData);

    // Score criteria against image analysis
    const scores = criteriaList.map(criterion => ({
      criterion,
      score: this.scoreCriterion(criterion, imageAnalysis),
      feedback: this.generateCriterionFeedback(criterion, imageAnalysis)
    }));

    const overallScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);

    return {
      score: overallScore,
      summary: this.generateSummary(overallScore, imageAnalysis),
      criterionScores: scores,
      strengths: this.extractStrengths(scores, imageAnalysis),
      improvements: this.extractImprovements(scores, imageAnalysis),
      recommendations: this.generateRecommendations(scores, imageAnalysis)
    };
  }

  async analyzeImageContent(imageData) {
    // Extract visual features from image
    const canvas = document.createElement('canvas');
    const img = new Image();

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const analysis = {
          width: canvas.width,
          height: canvas.height,
          hasText: this.detectText(canvas),
          colorDiversity: this.analyzeColors(imageData),
          density: this.analyzeDensity(imageData),
          hasStructure: this.detectStructure(imageData),
          hasImages: this.detectImages(canvas),
          contrast: this.analyzeContrast(imageData),
          whitespace: this.analyzeWhitespace(imageData)
        };
        resolve(analysis);
      };
      img.src = imageData;
    });
  }

  detectText(canvas) {
    // Simple heuristic: check for filled pixel areas that suggest text
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let darkPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
      if (brightness < 128) darkPixels++;
    }
    return darkPixels / (data.length / 4) > 0.05;
  }

  analyzeColors(imageData) {
    const data = imageData.data;
    const colors = new Set();
    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
      const r = Math.round(data[i] / 51) * 51;
      const g = Math.round(data[i+1] / 51) * 51;
      const b = Math.round(data[i+2] / 51) * 51;
      colors.add(`${r},${g},${b}`);
    }
    return Math.min(colors.size, 10) / 10; // Normalize to 0-1
  }

  analyzeDensity(imageData) {
    const data = imageData.data;
    let nonWhitePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      if (!(r > 240 && g > 240 && b > 240)) nonWhitePixels++;
    }
    return Math.min(nonWhitePixels / (data.length / 4), 1);
  }

  detectStructure(imageData) {
    const data = imageData.data;
    const width = 256; // Assume standard width
    const gridSize = 32;
    const regions = {};

    for (let i = 0; i < data.length; i += 4) {
      const x = Math.floor((i / 4) % width / gridSize);
      const y = Math.floor((i / 4) / width / gridSize);
      const key = `${x},${y}`;
      const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
      regions[key] = (regions[key] || 0) + (brightness < 200 ? 1 : 0);
    }

    const filledRegions = Object.values(regions).filter(v => v > 0).length;
    return filledRegions / Object.keys(regions).length > 0.2;
  }

  detectImages(canvas) {
    // Simple heuristic: varied color patterns suggest images
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return this.analyzeColors({ data }) > 0.5;
  }

  analyzeContrast(imageData) {
    const data = imageData.data;
    let minBrightness = 255, maxBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }
    return (maxBrightness - minBrightness) / 255;
  }

  analyzeWhitespace(imageData) {
    const data = imageData.data;
    let whitePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      if (r > 240 && g > 240 && b > 240) whitePixels++;
    }
    return whitePixels / (data.length / 4);
  }

  scoreCriterion(criterion, analysis) {
    const lower = criterion.toLowerCase();

    // Pattern matching for scoring
    if (lower.includes('hierarchy') || lower.includes('structure')) {
      return Math.round(analysis.hasStructure ? 75 : 50);
    }
    if (lower.includes('contrast') || lower.includes('accessibility')) {
      return Math.round(analysis.contrast * 100);
    }
    if (lower.includes('whitespace') || lower.includes('spacing')) {
      return Math.round(analysis.whitespace * 60 + 40);
    }
    if (lower.includes('color') || lower.includes('visual')) {
      return Math.round(analysis.colorDiversity * 100);
    }
    if (lower.includes('label') || lower.includes('text')) {
      return analysis.hasText ? 80 : 50;
    }
    if (lower.includes('component') || lower.includes('relationship')) {
      return analysis.hasStructure ? 75 : 55;
    }
    if (lower.includes('readable') || lower.includes('legible')) {
      return Math.round((analysis.contrast + 0.5) * 100);
    }

    // Default score based on overall density
    return Math.round(Math.min(analysis.density * 100, 100));
  }

  generateCriterionFeedback(criterion, analysis) {
    const score = this.scoreCriterion(criterion, analysis);
    if (score >= 80) return "Meets expectations";
    if (score >= 60) return "Generally good with minor gaps";
    if (score >= 40) return "Needs some attention";
    return "Needs significant improvement";
  }

  generateSummary(score, analysis) {
    const density = (analysis.density * 100).toFixed(0);
    const contrast = (analysis.contrast * 100).toFixed(0);

    if (score >= 80) {
      return `Strong design with clear organization. Good visual hierarchy and contrast (${contrast}%). Content density is appropriate (${density}%).`;
    } else if (score >= 60) {
      return `Solid foundational design. Some areas could benefit from improved visual hierarchy or spacing. Contrast is ${contrast}% and density is ${density}%.`;
    } else {
      return `Design has potential but needs refinement. Consider reviewing layout, contrast (${contrast}%), and whitespace allocation (${analysis.whitespace * 100}%).`;
    }
  }

  extractStrengths(scores, analysis) {
    const strengths = [];

    if (analysis.hasStructure) strengths.push("Clear hierarchical organization");
    if (analysis.contrast > 0.5) strengths.push("Good contrast and readability");
    if (analysis.whitespace > 0.4) strengths.push("Effective use of whitespace");
    if (analysis.colorDiversity > 0.5) strengths.push("Diverse and intentional color palette");

    const highScores = scores.filter(s => s.score >= 75);
    if (highScores.length > 0) {
      strengths.push(`Strong performance in ${highScores[0].criterion}`);
    }

    return strengths.length > 0 ? strengths : ["Design demonstrates foundational principles"];
  }

  extractImprovements(scores, analysis) {
    const improvements = [];

    const lowScores = scores.filter(s => s.score < 60);
    lowScores.forEach(s => {
      improvements.push(`Review: ${s.criterion}`);
    });

    if (analysis.contrast < 0.4) improvements.push("Increase contrast for accessibility");
    if (analysis.whitespace < 0.2) improvements.push("Add more whitespace/breathing room");

    return improvements.slice(0, 3);
  }

  generateRecommendations(scores, analysis) {
    return [
      "Validate design with accessibility checklist (WCAG 2.1)",
      "Test with actual users to validate information architecture",
      "Consider creating a design system for consistency",
      "Review typography hierarchy and sizing",
      "Audit color usage for colorblind-friendly palette"
    ];
  }
}
