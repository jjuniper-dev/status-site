import { ShapeRenderer } from './shape-renderer.js';

/**
 * CanvasRenderer
 * High-level rendering orchestrator
 * Handles canvas setup, element batching, and drawing pipeline
 */
export class CanvasRenderer {
  constructor(canvas, schema) {
    this.canvas = canvas;
    this.schema = schema;
    this.ctx = canvas.getContext('2d');
    this.shapeRenderer = new ShapeRenderer(this.ctx);
  }

  /**
   * Render complete diagram
   */
  render(elements) {
    // Setup canvas
    this._setupCanvas();

    // Draw elements in order
    elements.forEach(elem => {
      if (elem.type === 'rectangle') {
        this.shapeRenderer.drawRectangle(elem);
      } else if (elem.type === 'text') {
        this.shapeRenderer.drawText(elem);
      } else if (elem.type === 'arrow') {
        this.shapeRenderer.drawArrow(elem);
      }
    });
  }

  /**
   * Private: Setup canvas size and background
   */
  _setupCanvas() {
    this.canvas.width = this.schema.canvas.width;
    this.canvas.height = this.schema.canvas.height;

    // Fill background
    this.ctx.fillStyle = this.schema.canvas.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
