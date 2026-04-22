import { openaiProvider } from './openai.js';
import { geminiProvider } from './gemini.js';
import { hfProvider } from './huggingface.js';

export function selectProvider(name) {
  if (name === 'openai') return openaiProvider;
  if (name === 'gemini') return geminiProvider;
  if (name === 'huggingface') return hfProvider;
  throw new Error('Unknown provider: ' + name);
}
