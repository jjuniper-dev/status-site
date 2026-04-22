const DEFAULT_PROTOCOL_VERSION = '2025-06-18';

export class McpHttpClient {
  constructor(options = {}) {
    this.endpoint = options.url;
    this.protocolVersion = options.protocolVersion || DEFAULT_PROTOCOL_VERSION;
    this.sessionId = options.sessionId || null;
    this.clientInfo = options.clientInfo || {
      name: 'ea-diagram-engine',
      version: '0.2.0'
    };
    this._id = 1;
  }

  async initialize() {
    const result = await this.request('initialize', {
      protocolVersion: this.protocolVersion,
      capabilities: {},
      clientInfo: this.clientInfo
    }, { includeNameHeader: false, allowMissingSession: true });

    return result;
  }

  async listTools() {
    return this.request('tools/list', {}, { includeNameHeader: false });
  }

  async callTool(name, args = {}) {
    return this.request('tools/call', {
      name,
      arguments: args
    }, { includeNameHeader: true, nameHeader: name });
  }

  async request(method, params = {}, options = {}) {
    const body = {
      jsonrpc: '2.0',
      id: this._id++,
      method,
      params
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'MCP-Protocol-Version': this.protocolVersion,
      'Mcp-Method': method
    };

    if (options.includeNameHeader && options.nameHeader) {
      headers['Mcp-Name'] = options.nameHeader;
    }

    if (this.sessionId && !options.allowMissingSession) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const sessionHeader = response.headers.get('Mcp-Session-Id');
    if (sessionHeader) this.sessionId = sessionHeader;

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MCP request failed (${response.status}): ${errorText}`);
    }

    if (contentType.includes('text/event-stream')) {
      const text = await response.text();
      return parseSseJsonRpcResponse(text, body.id);
    }

    const json = await response.json();
    if (json.error) {
      throw new Error(`MCP error: ${json.error.message || 'Unknown error'}`);
    }
    return json.result;
  }
}

function parseSseJsonRpcResponse(sseText, id) {
  const events = sseText
    .split(/\n\n+/)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  for (const event of events) {
    const dataLines = event
      .split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => line.replace(/^data:\s?/, ''));

    if (!dataLines.length) continue;

    const data = dataLines.join('\n').trim();
    if (!data || data === '[DONE]') continue;

    try {
      const msg = JSON.parse(data);
      if (msg.id === id && msg.result) return msg.result;
      if (msg.id === id && msg.error) {
        throw new Error(`MCP error: ${msg.error.message || 'Unknown error'}`);
      }
    } catch {
      // ignore malformed non-JSON SSE lines
    }
  }

  throw new Error('MCP SSE response did not contain a matching JSON-RPC result');
}
