type ListItem = { text: string; children: ListItem[] };
type ImageValue = { src: string; alt: string; caption: string };
type Align = "left" | "center" | "right" | null;
type TableValue = { header: string[]; align: Align[]; rows: string[][] };
type Block = { kind: "h2" | "h3" | "p" | "ul" | "code" | "img" | "table"; value: string | ListItem[] | ImageValue | TableValue };

function inline(value: string) {
  const pieces = value.split(/(`[^`]+`|\*\*[^*]+\*\*|<mark>[\s\S]*?<\/mark>)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith("`") && piece.endsWith("`")) return <code key={index}>{piece.slice(1, -1)}</code>;
    if (piece.startsWith("**") && piece.endsWith("**")) return <strong key={index}>{piece.slice(2, -2)}</strong>;
    if (piece.startsWith("<mark>") && piece.endsWith("</mark>")) return <mark key={index}>{piece.slice(6, -7)}</mark>;
    return piece;
  });
}

function matchListItem(line: string) {
  const match = line.match(/^(\s*)-\s+(.*)$/);
  return match ? { indent: match[1].length, text: match[2] } : null;
}

function parseListItems(lines: string[], start: number, indent: number): { items: ListItem[]; next: number } {
  const items: ListItem[] = [];
  let i = start;
  while (i < lines.length) {
    const match = matchListItem(lines[i]);
    if (!match || match.indent < indent) break;
    const item: ListItem = { text: match.text, children: [] };
    i++;
    const next = i < lines.length ? matchListItem(lines[i]) : null;
    if (next && next.indent > indent) {
      const nested = parseListItems(lines, i, next.indent);
      item.children = nested.items;
      i = nested.next;
    }
    items.push(item);
  }
  return { items, next: i };
}

// Splits a "| a | b |" row on unescaped pipes outside inline code.
function splitRow(line: string) {
  const cells: string[] = [];
  let cell = "";
  let inCode = false;
  const row = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === "\\" && row[i + 1] === "|") { cell += "|"; i++; continue; }
    if (char === "`") inCode = !inCode;
    if (char === "|" && !inCode) { cells.push(cell.trim()); cell = ""; continue; }
    cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

const isTableSeparator = (line: string | undefined) => !!line && line.includes("-") && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(line);
const isTableStart = (lines: string[], i: number) => lines[i].includes("|") && isTableSeparator(lines[i + 1]);

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("```")) {
      const code: string[] = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++; blocks.push({ kind: "code", value: code.join("\n") }); continue;
    }
    if (line.startsWith("### ")) { blocks.push({ kind: "h3", value: line.slice(4) }); i++; continue; }
    if (line.startsWith("## ")) { blocks.push({ kind: "h2", value: line.slice(3) }); i++; continue; }
    if (isTableStart(lines, i)) {
      const header = splitRow(line);
      const align = splitRow(lines[i + 1]).map((cell): Align => cell.startsWith(":") && cell.endsWith(":") ? "center" : cell.endsWith(":") ? "right" : cell.startsWith(":") ? "left" : null);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        const cells = splitRow(lines[i++]);
        rows.push(header.map((_, column) => cells[column] ?? ""));
      }
      blocks.push({ kind: "table", value: { header, align, rows } });
      continue;
    }
    const list = matchListItem(line);
    if (list) {
      const result = parseListItems(lines, i, list.indent);
      blocks.push({ kind: "ul", value: result.items });
      i = result.next;
      continue;
    }
    const image = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (image) {
      blocks.push({ kind: "img", value: { alt: image[1], src: image[2], caption: image[3] || "" } });
      i++;
      continue;
    }
    const paragraph: string[] = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |```)/.test(lines[i]) && !matchListItem(lines[i]) && !isTableStart(lines, i) && !/^!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)$/.test(lines[i].trim())) paragraph.push(lines[i++]);
    blocks.push({ kind: "p", value: paragraph.join(" ") });
  }
  return blocks;
}

function renderList(items: ListItem[], key?: number) {
  return <ul key={key}>{items.map((item, itemIndex) => (
    <li key={itemIndex}>{inline(item.text)}{item.children.length ? renderList(item.children) : null}</li>
  ))}</ul>;
}

export function MarkdownContent({ content }: { content: string }) {
  return <div className="prose">{parseMarkdown(content).map((block, index) => {
    if (block.kind === "h2") return <h2 key={index}>{inline(block.value as string)}</h2>;
    if (block.kind === "h3") return <h3 key={index}>{inline(block.value as string)}</h3>;
    if (block.kind === "code") return <pre key={index}><code>{block.value as string}</code></pre>;
    if (block.kind === "ul") return renderList(block.value as ListItem[], index);
    if (block.kind === "table") {
      const { header, align, rows } = block.value as TableValue;
      return <div className="prose-table" key={index}><table>
        <thead><tr>{header.map((cell, column) => <th key={column} style={align[column] ? { textAlign: align[column] } : undefined}>{inline(cell)}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, column) => <td key={column} style={align[column] ? { textAlign: align[column] } : undefined}>{inline(cell)}</td>)}</tr>)}</tbody>
      </table></div>;
    }
    if (block.kind === "img") {
      const { src, alt, caption } = block.value as ImageValue;
      return <figure className="prose-figure" key={index}>
        <img src={src} alt={alt} />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>;
    }
    return <p key={index}>{inline(block.value as string)}</p>;
  })}</div>;
}
