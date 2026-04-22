export async function planDiagram(request, sources, provider) {
  const prompt = buildPrompt(request, sources);

  const schema = {
    type: 'object',
    properties: {
      nodes: { type: 'array', items: { type: 'object' } },
      edges: { type: 'array', items: { type: 'object' } }
    },
    required: ['nodes', 'edges']
  };

  const result = await provider.generate({ prompt, schema });

  return result;
}

function buildPrompt(request, sources) {
  return `Generate an EA diagram plan.\nTitle: ${request.title}\nLayers: ${request.layers.join(', ')}\nSources: ${sources.map(s => s.summary).join('\n')}`;
}
