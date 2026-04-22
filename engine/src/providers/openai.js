export const openaiProvider = {
  async generate({ prompt, schema }) {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        response_format: {
          type: 'json_schema',
          json_schema: schema
        }
      })
    });

    const data = await res.json();
    return JSON.parse(data.output[0].content[0].text);
  }
};
