import { fetchHealthWeb } from './healthWeb.js';

export async function fetchSources(sources) {
  const results = [];

  for (const s of sources) {
    if (s.type === 'health_web') {
      results.push(await fetchHealthWeb(s));
    }
  }

  return results;
}
