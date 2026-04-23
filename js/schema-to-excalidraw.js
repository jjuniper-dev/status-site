export function schemaToExcalidraw(schema) {
  const elements = [];
  let elementId = 0;

  const theme = schema.theme;
  const padding = 10;

  function createRect(x, y, w, h, label, style = {}, options = {}) {
    const id = String(elementId++);
    return {
      id,
      type: 'rectangle',
      x,
      y,
      width: w,
      height: h,
      strokeColor: style.stroke || theme.line_color,
      backgroundColor: style.fill || theme.layer_fill,
      fillStyle: 'solid',
      strokeWidth: style.stroke_width || theme.stroke_width,
      strokeStyle: style.stroke_style === 'dashed' ? 'dashed' : 'solid',
      roughness: 0,
      opacity: 100,
      text: label,
      fontSize: options.fontSize || 14,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      ...(style.text_color && { color: style.text_color }),
      ...options
    };
  }

  function createText(x, y, text, fontSize = 12, color = theme.text_color) {
    const id = String(elementId++);
    return {
      id,
      type: 'text',
      x,
      y,
      width: 500,
      height: 30,
      text,
      fontSize,
      fontFamily: 1,
      textAlign: 'left',
      color,
      opacity: 100
    };
  }

  function createArrow(fromX, fromY, toX, toY, style = 'solid', label = '') {
    const id = String(elementId++);
    const isStartArrow = false;
    const isEndArrow = true;

    return {
      id,
      type: 'arrow',
      x: fromX,
      y: fromY,
      width: toX - fromX,
      height: toY - fromY,
      angle: 0,
      strokeColor: theme.line_color,
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: theme.stroke_width,
      strokeStyle: style === 'dotted_arrow' ? 'dotted' : 'solid',
      roughness: 0,
      opacity: 100,
      startArrowType: isStartArrow ? 'arrow' : null,
      endArrowType: isEndArrow ? 'arrow' : null,
      startBinding: null,
      endBinding: null,
      text: label,
      fontSize: 12,
      fontFamily: 1,
      textAlign: 'center'
    };
  }

  // Header title
  if (schema.header) {
    const h = schema.header;
    elements.push(createText(h.x, h.y, h.title, 24, theme.title_color));
    elements.push(createText(h.x, h.y + 28, h.subtitle, 14, theme.text_color));
  }

  // Ownership zones (background rectangles)
  schema.ownership_zones.forEach(zone => {
    elements.push(createRect(zone.x, zone.y, zone.w, zone.h, '', zone.style, {
      fontSize: 12,
      opacity: 30
    }));
    // Zone labels
    elements.push(createText(zone.x + 10, zone.y + 5, zone.label, 12, theme.text_color));
  });

  // Layers with their components
  const componentMap = {}; // Track component positions for connectors

  schema.layers.forEach(layer => {
    // Layer background
    elements.push(createRect(layer.x, layer.y, layer.w, layer.h, '', layer.style, {
      opacity: 40
    }));
    // Layer label
    elements.push(createText(layer.x + 10, layer.y + 5, layer.label, 12, theme.text_color));

    // Components within layer
    layer.components.forEach(comp => {
      const compRect = createRect(comp.x, comp.y, comp.w, comp.h, comp.label, comp.style, {
        fontSize: 13
      });
      elements.push(compRect);

      // Store position for connector endpoints
      componentMap[comp.id] = {
        x: comp.x + comp.w / 2,
        y: comp.y + comp.h / 2,
        element: compRect
      };

      // Add annotation if present
      if (comp.annotation) {
        const annotY = comp.annotation.position === 'below'
          ? comp.y + comp.h + 8
          : comp.y - 20;
        elements.push(createText(
          comp.x,
          annotY,
          comp.annotation.text,
          comp.annotation.font_size || 12,
          theme.text_color
        ));
      }

      // Add tag if present
      if (comp.tag) {
        const tagWidth = 80;
        const tagHeight = 20;
        elements.push(createRect(
          comp.x + comp.w - tagWidth - 5,
          comp.y - 25,
          tagWidth,
          tagHeight,
          comp.tag.text,
          { fill: comp.tag.fill, stroke: comp.tag.fill, text_color: comp.tag.text_color },
          { fontSize: 10 }
        ));
      }
    });
  });

  // Connectors between components
  schema.connectors.forEach(conn => {
    const from = componentMap[conn.from];
    const to = componentMap[conn.to];
    if (from && to) {
      elements.push(createArrow(from.x, from.y, to.x, to.y, conn.style, conn.label || ''));
    }
  });

  // Side notes
  schema.side_notes?.forEach(note => {
    const noteBox = createRect(note.x, note.y, note.w, note.h, '', note.style);
    elements.push(noteBox);
    elements.push(createText(note.x + 10, note.y + 10, note.title, 12, theme.text_color));

    // Bullets
    let bulletY = note.y + 30;
    note.bullets?.forEach(bullet => {
      elements.push(createText(note.x + 15, bulletY, `• ${bullet}`, 11, theme.text_color));
      bulletY += 20;
    });
  });

  // Top progression text
  if (schema.top_progression) {
    const prog = schema.top_progression;
    elements.push(createText(
      prog.x,
      prog.y,
      prog.label,
      12,
      prog.style.text_color
    ));
  }

  // Footer
  if (schema.footer) {
    const footer = schema.footer;
    elements.push(createText(footer.x, footer.y, footer.left_text, 10, theme.text_color));
    elements.push(createText(footer.x + 1000, footer.y, footer.right_text, 10, theme.text_color));
  }

  return {
    type: 'excalidraw',
    version: 2,
    source: 'schema-to-excalidraw',
    elements,
    appState: {
      gridMode: true,
      gridSize: schema.global_rules.grid_size,
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
      name: schema.title
    }
  };
}

export function saveAsExcalidrawJSON(schemaData) {
  const excalidraw = schemaToExcalidraw(schemaData);
  return JSON.stringify(excalidraw, null, 2);
}
