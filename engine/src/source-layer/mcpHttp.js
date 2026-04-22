import { McpHttpClient } from '../mcp/client.js';

export async function fetchMcpHttp(source) {
  const endpoint = source.url;
  const client = new McpHttpClient({ url: endpoint });

  try {
    // 1. Initialize session
    await client.initialize();

    // 2. Discover tools
    let tools = [];
    try {
      const toolList = await client.listTools();
      tools = toolList?.tools || toolList || [];
    } catch {
      // some servers may not expose listTools
    }

    // 3. Optionally call tools if specified
    let toolResults = [];
    if (Array.isArray(source.toolCalls)) {
      for (const call of source.toolCalls) {
        try {
          const result = await client.callTool(call.name, call.arguments || {});
          toolResults.push({ name: call.name, result });
        } catch (err) {
          toolResults.push({ name: call.name, error: err.message });
        }
      }
    }

    return {
      type: 'mcp',
      name: source.name || 'MCP Server',
      url: endpoint,
      tools: tools.map(t => t.name || t),
      toolResults,
      summary: buildSummary(tools, toolResults)
    };
  } catch (e) {
    return {
      type: 'mcp',
      name: source.name || 'MCP Server',
      url: endpoint,
      error: true,
      summary: `MCP error: ${e.message}`
    };
  }
}

function buildSummary(tools, results) {
  const toolNames = tools.map(t => t.name || t).slice(0, 5).join(', ');

  let summary = `MCP tools available: ${toolNames}`;

  if (results?.length) {
    summary += '\nExecuted tool calls: ' + results.map(r => r.name).join(', ');
  }

  return summary;
}
