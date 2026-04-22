export const geminiProvider = {
  async generate({ prompt, schema }) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          response_json_schema: schema
        }
      })
    });

    const data = await res.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  }
};
