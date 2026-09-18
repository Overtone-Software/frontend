import type { ReactNode } from 'react';

/**
 * Renderer for the memo's markdown.
 *
 * Scoped deliberately to the subset `render_markdown` on the server emits —
 * headings, bold, links, bullets, blockquotes and one GFM table — rather than
 * pulling in a general markdown engine. The memo is the product's deliverable and
 * its shape is ours, so the renderer can be small and exact.
 *
 * It builds React elements and never sets HTML. Bullet text is model output, and
 * `dangerouslySetInnerHTML` on model output is an injection waiting to happen.
 */

type Token = { text: string; href?: string; bold?: boolean };

/** Split one line into text, `**bold**` and `[label](href)` runs. */
function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index) });
    if (match[1] !== undefined) tokens.push({ text: match[1], bold: true });
    else if (match[2] !== undefined && match[3] !== undefined) {
      // Only http(s). A memo link is always a timestamped source URL, and anything
      // else — javascript:, data: — has no business being clickable here. A rejected
      // link keeps its original source text rather than being silently reshaped, so
      // nothing disappears from a document an analyst may have to defend.
      tokens.push(
        /^https?:\/\//i.test(match[3])
          ? { text: match[2], href: match[3] }
          : { text: match[0] },
      );
    }
    last = pattern.lastIndex;
  }
  if (last < line.length) tokens.push({ text: line.slice(last) });
  return tokens;
}

function Inline({ line }: { line: string }): ReactNode {
  return tokenize(line).map((token, i) => {
    if (token.href) {
      return (
        <a key={i} href={token.href} target="_blank" rel="noreferrer noopener">
          {token.text}
        </a>
      );
    }
    if (token.bold) return <strong key={i}>{token.text}</strong>;
    return <span key={i}>{token.text}</span>;
  });
}

const isTableRow = (line: string) => line.trimStart().startsWith('|');
/** The `|---|---|` separator under a GFM table header carries no content. */
const isTableRule = (line: string) => /^\s*\|[\s:|-]+\|\s*$/.test(line);
const cells = (line: string) =>
  line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

export function Markdown({ source }: { source: string }): ReactNode {
  const lines = source.split('\n');
  const out: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (isTableRow(line)) {
      const block: string[] = [];
      while (i < lines.length && isTableRow(lines[i] ?? '')) {
        block.push(lines[i] ?? '');
        i += 1;
      }
      const rows = block.filter((r) => !isTableRule(r)).map(cells);
      const [header, ...body] = rows;
      out.push(
        <div className="md-table" key={`t${i}`}>
          <table>
            {header && (
              <thead>
                <tr>{header.map((c, n) => <th key={n}><Inline line={c} /></th>)}</tr>
              </thead>
            )}
            <tbody>
              {body.map((row, n) => (
                <tr key={n}>{row.map((c, m) => <td key={m}><Inline line={c} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? '').startsWith('- ')) {
        items.push((lines[i] ?? '').slice(2));
        i += 1;
      }
      out.push(
        <ul key={`u${i}`}>
          {items.map((item, n) => <li key={n}><Inline line={item} /></li>)}
        </ul>,
      );
      continue;
    }

    if (line.startsWith('> ')) {
      out.push(<blockquote key={`q${i}`}><Inline line={line.slice(2)} /></blockquote>);
      i += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      out.push(<h4 key={i}><Inline line={line.slice(4)} /></h4>);
    } else if (line.startsWith('## ')) {
      out.push(<h3 key={i}><Inline line={line.slice(3)} /></h3>);
    } else if (line.startsWith('# ')) {
      out.push(<h2 className="md-title" key={i}><Inline line={line.slice(2)} /></h2>);
    } else {
      out.push(<p key={i}><Inline line={line} /></p>);
    }
    i += 1;
  }

  return <div className="md">{out}</div>;
}
