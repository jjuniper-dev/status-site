export class DesignAssessor {
  async assessDesign(imageDataUrl, criteriaText) {
    const criteria = criteriaText.split('\n')
      .map(c => c.trim().replace(/^[-*•]\s*/, ''))
      .filter(c => c.length > 0);

    if (criteria.length === 0) {
      throw new Error('No valid criteria found. Please enter at least one criterion.');
    }

    const imageProps = await this._analyzeImage(imageDataUrl);

    const criterionScores = criteria.map(criterion => {
      const score = this._scoreCriterion(criterion, imageProps);
      return { criterion, score, feedback: this._feedback(score, imageProps) };
    });

    const avgScore = Math.round(
      criterionScores.reduce((sum, c) => sum + c.score, 0) / criterionScores.length
    );

    return {
      score: avgScore,
      summary: this._summary(avgScore, imageProps),
      criterionScores,
      strengths: criterionScores.filter(c => c.score >= 75).map(c => c.criterion),
      improvements: criterionScores.filter(c => c.score < 65).map(c => c.criterion),
      recommendations: this._recommendations(criterionScores)
    };
  }

  async _analyzeImage(imageDataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image could not be decoded. Please try a different file.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(img.width, 400);
        canvas.height = Math.min(img.height, 400);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const n = data.length / 4;
        const colorBuckets = new Set();
        let lumSum = 0, lumSqSum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          lumSum += lum;
          lumSqSum += lum * lum;
          colorBuckets.add(
            `${Math.floor(data[i] / 32)},${Math.floor(data[i + 1] / 32)},${Math.floor(data[i + 2] / 32)}`
          );
        }

        const avgLum = lumSum / n;
        const contrast = Math.sqrt(Math.max(0, lumSqSum / n - avgLum * avgLum));

        resolve({
          brightness: avgLum,
          contrast,
          colorVariety: Math.min(colorBuckets.size / 100, 1),
          aspectRatio: img.width / img.height
        });
      };
      img.src = imageDataUrl;
    });
  }

  _scoreCriterion(criterion, props) {
    const kw = criterion.toLowerCase();
    let score;

    if (kw.match(/contrast|readab|legib/)) {
      score = props.contrast > 0.28 ? 87 : props.contrast > 0.18 ? 70 : 48;
    } else if (kw.match(/access|wcag/)) {
      score = props.contrast > 0.30 ? 82 : props.contrast > 0.20 ? 64 : 44;
    } else if (kw.match(/colour|color/)) {
      score = props.colorVariety < 0.25 ? 84 : props.colorVariety < 0.55 ? 74 : 58;
    } else if (kw.match(/whitespace|spacing|padding|margin/)) {
      score = props.brightness > 0.55 ? 80 : props.brightness > 0.35 ? 68 : 58;
    } else if (kw.match(/hierarch|structur|organ/)) {
      score = props.contrast > 0.22 ? 76 : 63;
    } else if (kw.match(/align|consist|grid/)) {
      score = 70 + Math.round(props.contrast * 30);
    } else {
      score = 65 + Math.round(props.contrast * 35);
    }

    return Math.max(30, Math.min(98, score));
  }

  _feedback(score, props) {
    const contrastLabel = props.contrast > 0.25 ? 'high' : props.contrast > 0.15 ? 'moderate' : 'low';
    if (score >= 80) return `Criterion well met. Image shows ${contrastLabel} tonal contrast.`;
    if (score >= 65) return `Criterion partially met. Some refinement may help.`;
    return `Criterion needs attention. ${contrastLabel.charAt(0).toUpperCase() + contrastLabel.slice(1)} contrast detected — review element visibility.`;
  }

  _summary(score, props) {
    const c = props.contrast > 0.25 ? 'high' : props.contrast > 0.15 ? 'moderate' : 'low';
    const b = props.brightness > 0.6 ? 'light' : 'dark';
    if (score >= 80) return `Design scores ${score}%. ${b.charAt(0).toUpperCase() + b.slice(1)} background with ${c} contrast — most criteria are met.`;
    if (score >= 65) return `Design scores ${score}%. ${b.charAt(0).toUpperCase() + b.slice(1)} background with ${c} contrast — some criteria need attention.`;
    return `Design scores ${score}%. ${c.charAt(0).toUpperCase() + c.slice(1)} contrast detected — several criteria require revision before this design is ready.`;
  }

  _recommendations(criterionScores) {
    const weak = criterionScores.filter(c => c.score < 70);
    if (weak.length === 0) return ['Maintain quality standards across future iterations.'];
    return weak.slice(0, 3).map(c => `Review: "${c.criterion.slice(0, 70)}"`);
  }
}
