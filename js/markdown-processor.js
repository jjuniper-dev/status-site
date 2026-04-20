// Markdown Processor — Converts markdown to HTML for live preview
// Uses lightweight regex-based parsing (no external dependencies)

class MarkdownProcessor {
  constructor() {
    this.codeBlockLanguage = null;
  }

  // Main conversion function
  toHtml(markdown) {
    if (!markdown) return '';

    let html = markdown;

    // Escape HTML in code blocks first (before processing markdown)
    html = this.escapeCodeBlocks(html);

    // Process markdown line by line
    html = html.split('\n').map(line => this.processLine(line)).join('\n');

    // Handle code blocks
    html = this.processCodeBlocks(html);

    // Handle tables
    html = this.processTables(html);

    // Handle lists
    html = this.processLists(html);

    // Wrap in paragraph tags where needed
    html = this.wrapParagraphs(html);

    return html;
  }

  // Escape HTML special characters in code blocks
  escapeCodeBlocks(markdown) {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeInlineRegex = /`[^`]+`/g;

    // Store code blocks for later
    const codeBlocks = [];
    markdown = markdown.replace(codeBlockRegex, match => {
      codeBlocks.push(match);
      return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });

    // Store inline code
    const inlineCode = [];
    markdown = markdown.replace(codeInlineRegex, match => {
      inlineCode.push(match);
      return `__INLINECODE_${inlineCode.length - 1}__`;
    });

    // Restore for processing (they'll be properly escaped during processing)
    markdown = markdown.replace(/__CODEBLOCK_\d+__/g, match => {
      const index = parseInt(match.match(/\d+/)[0]);
      return codeBlocks[index];
    });

    markdown = markdown.replace(/__INLINECODE_\d+__/g, match => {
      const index = parseInt(match.match(/\d+/)[0]);
      return inlineCode[index];
    });

    return markdown;
  }

  // Process individual line
  processLine(line) {
    // Headers
    if (line.match(/^#{1,6}\s/)) {
      const level = line.match(/^#+/)[0].length;
      const content = line.replace(/^#+\s/, '');
      return `<h${level}>${this.processInline(content)}</h${level}>`;
    }

    // Blockquotes
    if (line.match(/^>\s/)) {
      const content = line.replace(/^>\s/, '');
      return `<blockquote><p>${this.processInline(content)}</p></blockquote>`;
    }

    // Horizontal rule
    if (line.match(/^(---|\*\*\*|___)/)) {
      return '<hr>';
    }

    // Code block (triple backtick)
    if (line.match(/^```/)) {
      return `<pre><code>${line}</code></pre>`;
    }

    // Regular content
    return `<p>${this.processInline(line)}</p>`;
  }

  // Process inline markdown (bold, italic, links, code)
  processInline(text) {
    if (!text) return '';

    // Bold (** or __)
    text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic (* or _)
    text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

    return text;
  }

  // Process code blocks
  processCodeBlocks(html) {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    return html.replace(codeBlockRegex, (match, language, code) => {
      const escapedCode = this.escapeHtml(code.trim());
      const langAttr = language ? ` class="language-${language}"` : '';
      return `<pre><code${langAttr}>${escapedCode}</code></pre>`;
    });
  }

  // Process tables (simple markdown table format)
  processTables(html) {
    // Match markdown tables
    const lines = html.split('\n');
    let inTable = false;
    let tableLines = [];
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line is a table row (contains |)
      if (line.includes('|') && line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableLines = [line];
        } else {
          tableLines.push(line);
        }
      } else {
        if (inTable && tableLines.length > 0) {
          // Process accumulated table lines
          result.push(this.buildTable(tableLines));
          tableLines = [];
          inTable = false;
        }
        result.push(lines[i]);
      }
    }

    // Handle last table if exists
    if (inTable && tableLines.length > 0) {
      result.push(this.buildTable(tableLines));
    }

    return result.join('\n');
  }

  // Build HTML table from markdown table lines
  buildTable(lines) {
    if (lines.length < 2) return lines.join('\n');

    const rows = lines.map(line => {
      const cells = line.split('|').filter(cell => cell.trim());
      return cells.map(cell => cell.trim());
    });

    // Check if second row is separator (all dashes/colons)
    const isSeparator = rows[1] && rows[1].every(cell => /^:?-+:?$/.test(cell));

    let html = '<table>\n';

    // Header (first row)
    if (rows.length > 0) {
      html += '<thead>\n<tr>\n';
      rows[0].forEach(cell => {
        html += `<th>${this.processInline(cell)}</th>\n`;
      });
      html += '</tr>\n</thead>\n';
    }

    // Body (skip separator row if exists)
    const bodyStart = isSeparator ? 2 : 1;
    if (rows.length > bodyStart) {
      html += '<tbody>\n';
      for (let i = bodyStart; i < rows.length; i++) {
        html += '<tr>\n';
        rows[i].forEach(cell => {
          html += `<td>${this.processInline(cell)}</td>\n`;
        });
        html += '</tr>\n';
      }
      html += '</tbody>\n';
    }

    html += '</table>';
    return html;
  }

  // Process lists (bullet and numbered)
  processLists(html) {
    let result = html;

    // Unordered lists (lines starting with -)
    result = result.replace(/^(\s*)-\s(.+)$/gm, '$1<li>$2</li>');

    // Wrap consecutive <li> in <ul>
    result = result.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
      if (!match.includes('<ul>')) {
        return `<ul>\n${match}\n</ul>`;
      }
      return match;
    });

    // Numbered lists
    result = result.replace(/^(\s*)\d+\.\s(.+)$/gm, '$1<li>$2</li>');

    // Wrap in <ol> if needed
    // (simplified — could improve)

    return result;
  }

  // Wrap loose text in paragraphs
  wrapParagraphs(html) {
    const lines = html.split('\n');
    let result = [];
    let inBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and existing block elements
      if (!trimmed || trimmed.match(/^<(p|h\d|pre|blockquote|table|ul|ol|hr|div|li)/)) {
        if (inBlock && result.length) {
          inBlock = false;
        }
        result.push(line);
      } else {
        // This is text that needs wrapping
        if (!line.match(/^<|>$/)) {
          if (!inBlock) {
            result.push(`<p>${line}</p>`);
          } else {
            result[result.length - 1] += ` ${line}`;
          }
          inBlock = true;
        } else {
          result.push(line);
          inBlock = false;
        }
      }
    }

    return result.join('\n');
  }

  // Escape HTML special characters
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  // Get plain text (strip all markdown)
  getPlainText(markdown) {
    return markdown
      .replace(/^#+\s/gm, '')  // Remove headers
      .replace(/\*\*([^\*]+)\*\*/g, '$1')  // Remove bold
      .replace(/\*([^\*]+)\*/g, '$1')  // Remove italic
      .replace(/`([^`]+)`/g, '$1')  // Remove code
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')  // Remove links
      .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
      .trim();
  }
}

// Export for use in intelligence-editor.js
window.MarkdownProcessor = MarkdownProcessor;
