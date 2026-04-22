import { planDiagram } from './planner.js';
import { renderExcalidraw } from './renderers/excalidraw.js';
import { selectProvider } from './providers/index.js';
import { fetchSources } from './sources/index.js';

export async function generateDiagram(request) {
  const sources = await fetchSources(request.sources || []);

  const provider = selectProvider(request.provider || 'openai');

  const plan = await planDiagram(request, sources, provider);

  const diagram = renderExcalidraw(plan);

  return {
    request,
    plan,
    diagram,
    metadata: {
      provider: request.provider || 'openai',
      timestamp: new Date().toISOString()
    }
  };
}
