import { ZoomableImage } from "./zoomable-image";

type ListItem = { text: string; children: List | null };
type List = { ordered: boolean; start: number; items: ListItem[] };
type ImageValue = { src: string; alt: string; caption: string };
type Align = "left" | "center" | "right" | null;
type TableValue = { header: string[]; align: Align[]; rows: string[][] };
type Container = { name: string; blocks: Block[] };
type VideoValue = { src: string; title: string; vertical: boolean };
type RankingEntry = { rank: number; title: string; score: string; tags: string[]; notes: string[] };
type Block = { kind: "h2" | "h3" | "p" | "list" | "code" | "img" | "table" | "container" | "ranking" | "video"; value: string | List | ImageValue | TableValue | Container | RankingEntry[] | VideoValue };

function inline(value: string) {
  const pieces = value.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s](?:[^*]*[^*\s])?\*|<mark>[\s\S]*?<\/mark>)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith("`") && piece.endsWith("`")) return <code key={index}>{piece.slice(1, -1)}</code>;
    if (piece.startsWith("**") && piece.endsWith("**")) return <strong key={index}>{piece.slice(2, -2)}</strong>;
    if (piece.length > 2 && piece.startsWith("*") && piece.endsWith("*")) return <em key={index}>{piece.slice(1, -1)}</em>;
    if (piece.startsWith("<mark>") && piece.endsWith("</mark>")) return <mark key={index}>{piece.slice(6, -7)}</mark>;
    return piece;
  });
}

// "- item" (unordered) or "1. item" / "1) item" (ordered).
function matchListItem(line: string) {
  const match = line.match(/^(\s*)(?:-|(\d+)[.)])\s+(.*)$/);
  return match ? { indent: match[1].length, ordered: match[2] !== undefined, number: Number(match[2] ?? 1), text: match[3] } : null;
}

function parseList(lines: string[], start: number, indent: number): { list: List; next: number } {
  const first = matchListItem(lines[start])!;
  const list: List = { ordered: first.ordered, start: first.number, items: [] };
  let i = start;
  while (i < lines.length) {
    const match = matchListItem(lines[i]);
    if (!match || match.indent < indent || match.ordered !== list.ordered) break;
    const item: ListItem = { text: match.text, children: null };
    i++;
    const next = i < lines.length ? matchListItem(lines[i]) : null;
    if (next && next.indent > indent) {
      const nested = parseList(lines, i, next.indent);
      item.children = nested.list;
      i = nested.next;
    }
    list.items.push(item);
  }
  return { list, next: i };
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

// Ranking entry: "1. **Title** — 9 · Genre, Genre", followed by optional comment lines.
// Without a numeric score, the text after "—" is treated as a comment.
function parseRanking(lines: string[]): RankingEntry[] {
  const entries: RankingEntry[] = [];
  for (const line of lines) {
    const text = line.trim();
    if (!text) continue;
    const item = text.match(/^(\d+)[.)]\s+(.*)$/);
    if (!item) { entries.at(-1)?.notes.push(text.replace(/^[-*]\s+/, "")); continue; }
    const [title, ...rest] = item[2].split(/\s+[—–]\s+/);
    const meta = rest.join(" — ");
    const [score, ...tags] = meta.split(/\s+·\s+/);
    const hasScore = /^\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?$/.test(score);
    entries.push({
      rank: Number(item[1]),
      title,
      score: hasScore ? score : "",
      tags: hasScore ? tags.join(",").split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      notes: meta && !hasScore ? [meta] : [],
    });
  }
  return entries;
}

// Video embed from a bare YouTube/Vimeo link on its own line, or from a pasted <iframe> tag.
// Only the video id is kept: the iframe is rebuilt from a whitelist, pasted HTML is never rendered.
function parseVideo(text: string): VideoValue | null {
  const trimmed = text.trim();
  const iframe = trimmed.match(/^<iframe\b[^>]*\ssrc=["']([^"']+)["'][^>]*>\s*(?:<\/iframe>)?$/i);
  const title = iframe?.[0].match(/\stitle=["']([^"']*)["']/i)?.[1] ?? "";
  const raw = iframe ? iframe[1] : /^https?:\/\/\S+$/.test(trimmed) ? trimmed : null;
  if (!raw) return null;
  let url: URL;
  try { url = new URL(raw.replace(/&amp;/g, "&")); } catch { return null; }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const start = Number.parseInt(url.searchParams.get("t") ?? url.searchParams.get("start") ?? "", 10);
  const query = start > 0 ? `?start=${start}` : "";
  let id: string | undefined;
  let vertical = false;
  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const path = url.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
    id = path ? path[2] : url.pathname === "/watch" ? url.searchParams.get("v") ?? undefined : undefined;
    vertical = path?.[1] === "shorts";
  } else if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vimeoId = url.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1];
    return vimeoId ? { src: `https://player.vimeo.com/video/${vimeoId}?dnt=1`, title: title || "Vidéo Vimeo", vertical: false } : null;
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return null;
  return { src: `https://www.youtube-nocookie.com/embed/${id}${query}`, title: title || "Vidéo YouTube", vertical };
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
    const container = line.trim().match(/^:::\s*([\w-]+)\s*$/);
    if (container) {
      const inner: string[] = []; i++;
      while (i < lines.length && lines[i].trim() !== ":::") inner.push(lines[i++]);
      i++;
      const name = container[1].toLowerCase();
      if (name === "classement" || name === "ranking") blocks.push({ kind: "ranking", value: parseRanking(inner) });
      else blocks.push({ kind: "container", value: { name, blocks: parseMarkdown(inner.join("\n")) } });
      continue;
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
      const result = parseList(lines, i, list.indent);
      blocks.push({ kind: "list", value: result.list });
      i = result.next;
      continue;
    }
    // A pasted <iframe> may span several lines: join them up to the closing tag.
    let videoEnd = i;
    if (/^<iframe\b/i.test(line.trim()) && !/<\/iframe>|\/?>\s*$/i.test(line)) {
      while (videoEnd + 1 < lines.length && videoEnd - i < 10 && !/>\s*$/.test(lines[videoEnd])) videoEnd++;
    }
    const video = parseVideo(lines.slice(i, videoEnd + 1).join(" "));
    if (video) {
      blocks.push({ kind: "video", value: video });
      i = videoEnd + 1;
      if (i < lines.length && /^\s*<\/iframe>\s*$/i.test(lines[i])) i++;
      continue;
    }
    const image = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (image) {
      blocks.push({ kind: "img", value: { alt: image[1], src: image[2], caption: image[3] || "" } });
      i++;
      continue;
    }
    const paragraph: string[] = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |```|:::)/.test(lines[i].trimStart()) && !matchListItem(lines[i]) && !isTableStart(lines, i) && !/^!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)$/.test(lines[i].trim()) && !/^<iframe\b/i.test(lines[i].trim()) && !parseVideo(lines[i])) paragraph.push(lines[i++]);
    blocks.push({ kind: "p", value: paragraph.join(" ") });
  }
  return blocks;
}

function renderList(list: List, key?: number) {
  const items = list.items.map((item, itemIndex) => (
    <li key={itemIndex}>{inline(item.text)}{item.children ? renderList(item.children) : null}</li>
  ));
  return list.ordered ? <ol key={key} start={list.start !== 1 ? list.start : undefined}>{items}</ol> : <ul key={key}>{items}</ul>;
}

function renderRanking(entries: RankingEntry[], key: number) {
  return <ol key={key} className="ranking-list" start={entries[0] && entries[0].rank !== 1 ? entries[0].rank : undefined}>{entries.map((entry, index) => (
    <li key={index} className={entry.rank <= 3 ? `ranking-item top-${entry.rank}` : "ranking-item"}>
      <span className="ranking-rank" aria-hidden="true">{String(entry.rank).padStart(2, "0")}</span>
      <div className="ranking-body">
        <span className="ranking-title">{inline(entry.title)}</span>
        {entry.tags.length ? <span className="ranking-tags">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</span> : null}
        {entry.notes.map((note, noteIndex) => <span key={noteIndex} className="ranking-comment">{inline(note)}</span>)}
      </div>
      {entry.score ? <span className="ranking-score">{entry.score}</span> : null}
    </li>
  ))}</ol>;
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((block, index) => {
    if (block.kind === "ranking") return renderRanking(block.value as RankingEntry[], index);
    if (block.kind === "container") {
      const { name, blocks: inner } = block.value as Container;
      return <div key={index} className={`prose-container prose-${name}`}>{renderBlocks(inner)}</div>;
    }
    if (block.kind === "h2") return <h2 key={index}>{inline(block.value as string)}</h2>;
    if (block.kind === "h3") return <h3 key={index}>{inline(block.value as string)}</h3>;
    if (block.kind === "code") return <pre key={index}><code>{block.value as string}</code></pre>;
    if (block.kind === "list") return renderList(block.value as List, index);
    if (block.kind === "table") {
      const { header, align, rows } = block.value as TableValue;
      return <div className="prose-table" key={index}><table>
        <thead><tr>{header.map((cell, column) => <th key={column} style={align[column] ? { textAlign: align[column] } : undefined}>{inline(cell)}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, column) => <td key={column} style={align[column] ? { textAlign: align[column] } : undefined}>{inline(cell)}</td>)}</tr>)}</tbody>
      </table></div>;
    }
    if (block.kind === "video") {
      const { src, title, vertical } = block.value as VideoValue;
      return <div key={index} className={vertical ? "prose-video vertical" : "prose-video"}>
        <iframe src={src} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      </div>;
    }
    if (block.kind === "img") {
      const { src, alt: rawAlt, caption } = block.value as ImageValue;
      // A file name ("IMG_1460.jpg") left as alt text describes nothing.
      const alt = /\.(jpe?g|png|webp|gif|svg|heic)$/i.test(rawAlt.trim()) ? "" : rawAlt;
      return <figure className="prose-figure" key={index}>
        <ZoomableImage src={src} alt={alt} caption={caption} />
        <figcaption>{caption}</figcaption>
      </figure>;
    }
    return <p key={index}>{inline(block.value as string)}</p>;
  });
}

export function MarkdownContent({ content }: { content: string }) {
  return <div className="prose">{renderBlocks(parseMarkdown(content))}</div>;
}
