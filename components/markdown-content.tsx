type ListItem = { text: string; children: ListItem[] };
type ImageValue = { src: string; alt: string; caption: string };
type Block = { kind: "h2" | "h3" | "p" | "ul" | "code" | "img"; value: string | ListItem[] | ImageValue };

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
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |```)/.test(lines[i]) && !matchListItem(lines[i]) && !/^!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)$/.test(lines[i].trim())) paragraph.push(lines[i++]);
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
