import { fetchHealthWeb } from './healthWeb.js';
import { fetchMcpHttp } from './mcpHttp.js';

export async function fetchSources(sources) {
  const results = [];

  for (const s of sources) {
    if (s.type === 'health_web') {
      results.push(await fetchHealthWeb(s));
    }

    if (s.type === 'mcp' && (s.transport === 'http' || s.transport === 'https' || !s.transport)) {
      results.push(await fetchMcpHttp(s));
    }
  }

  return results;
}
