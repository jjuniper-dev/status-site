export const hfProvider = {
  async generate({ prompt }) {
    const res = await fetch('https://api-inference.huggingface.co/models/google/gemma-2-2b-it', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await res.json();

    return {
      nodes: [],
      edges: [],
      raw: data
    };
  }
};
