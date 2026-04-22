import { generateDiagram } from './engine.js';
import fs from 'fs';

const command = process.argv[2];

if (command === 'generate') {
  const inputPath = process.argv[3];
  if (!inputPath) {
    console.error('Provide path to request JSON');
    process.exit(1);
  }

  const request = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  generateDiagram(request).then(result => {
    const outPath = `artifacts/diagrams/renders/${Date.now()}.json`;
    fs.mkdirSync('artifacts/diagrams/renders', { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log('Diagram generated:', outPath);
  });
}
