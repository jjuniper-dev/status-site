export function renderExcalidraw(plan) {
  return {
    type: 'excalidraw',
    elements: plan.nodes.map((n, i) => ({
      id: `node-${i}`,
      type: 'rectangle',
      x: 100,
      y: 100 + i * 80,
      width: 200,
      height: 50,
      text: n.label || n.name
    }))
  };
}
