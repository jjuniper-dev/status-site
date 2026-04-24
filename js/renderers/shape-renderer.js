/**
 * ShapeRenderer
 * Handles low-level canvas drawing primitives (rectangles, text, arrows)
 * Decoupled from schema processing and high-level logic
 */
export class ShapeRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Draw a rectangle with optional dashed stroke
   */
  drawRectangle(elem) {
    const { x, y, width, height, backgroundColor, strokeColor, strokeWidth, strokeStyle, text, fontSize, color } = elem;

    this.ctx.fillStyle = backgroundColor || '#ffffff';
    this.ctx.strokeStyle = strokeColor || '#000000';
    this.ctx.lineWidth = strokeWidth || 2;
    this.ctx.fillRect(x, y, width, height);

    // Apply dashed stroke style if specified
    if (strokeStyle === 'dashed') {
      this.ctx.setLineDash([5, 5]);
    }
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.setLineDash([]);

    // Render text if present
    if (text) {
      this._drawTextInRect(x, y, width, height, text, fontSize, color);
    }
  }

  /**
   * Draw text (standalone)
   */
  drawText(elem) {
    const { x, y, text, fontSize, color } = elem;
    if (!text) return;

    this.ctx.fillStyle = color || '#000000';
    this.ctx.font = `${fontSize || 12}px Arial`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw arrow with optional label
   */
  drawArrow(elem) {
    const { x, y, width, height, strokeColor, strokeWidth, strokeStyle, text, fontSize } = elem;
    const toX = x + width;
    const toY = y + height;

    // Draw line
    this.ctx.strokeStyle = strokeColor || '#000000';
    this.ctx.lineWidth = strokeWidth || 2;

    if (strokeStyle === 'dotted') {
      this.ctx.setLineDash([5, 5]);
    }

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw arrowhead
    this._drawArrowHead(x, y, toX, toY, strokeColor);

    // Render label if present
    if (text) {
      this._drawArrowLabel(x, y, toX, toY, text, fontSize, strokeColor);
    }
  }

  /**
   * Private: Draw arrowhead triangle
   */
  _drawArrowHead(fromX, fromY, toX, toY, color) {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    this.ctx.fillStyle = color || '#000000';
    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Private: Draw label text on arrow, offset perpendicular
   */
  _drawArrowLabel(fromX, fromY, toX, toY, text, fontSize, color) {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    this.ctx.fillStyle = color || '#000000';
    this.ctx.font = `${fontSize || 11}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';

    // Offset label perpendicular to the line
    const lineAngle = Math.atan2(toY - fromY, toX - fromX);
    const perpAngle = lineAngle + Math.PI / 2;
    const offsetDist = 10;

    const labelX = midX + offsetDist * Math.cos(perpAngle);
    const labelY = midY + offsetDist * Math.sin(perpAngle);

    this.ctx.fillText(text, labelX, labelY);
  }

  /**
   * Private: Draw wrapped text inside rectangle bounds
   */
  _drawTextInRect(x, y, width, height, text, fontSize, color) {
    this.ctx.fillStyle = color || '#000000';
    this.ctx.font = `${fontSize || 14}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const maxWidth = width - 10;
    const words = text.split(' ');
    let lines = [];
    let line = '';

    words.forEach(word => {
      const testLine = line ? line + ' ' + word : word;
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });
    if (line) lines.push(line);

    const lineHeight = fontSize || 14;
    const totalHeight = lines.length * lineHeight;
    let textY = y + height / 2 - totalHeight / 2 + lineHeight / 2;

    lines.forEach(l => {
      this.ctx.fillText(l, x + width / 2, textY);
      textY += lineHeight;
    });
  }
}
