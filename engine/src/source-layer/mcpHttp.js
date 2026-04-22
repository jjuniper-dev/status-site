export async function fetchMcpHttp(source) {
  const endpoint = source.url.endsWith('/mcp') ? source.url : source.url;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    return {
      type: 'mcp',
      name: source.name || 'MCP Server',
      url: endpoint,
      capabilities: data.capabilities || [],
      summary: `MCP server (${data.server || 'unknown'}) with capabilities: ${Object.keys(data.capabilities || {}).join(', ')}`
    };
  } catch (e) {
    return {
      type: 'mcp',
      name: source.name || 'MCP Server',
      url: endpoint,
      error: true,
      summary: 'Failed to reach MCP server'
    };
  }
}
