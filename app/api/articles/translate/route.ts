import { spawn } from "node:child_process";
import os from "node:os";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const limits = { title: 50, description: 300, content: 50000 } as const;
type Field = keyof typeof limits;

const system = `You translate French blog content into natural, idiomatic English.
Keep the author's tone and first-person voice.
Preserve Markdown exactly: headings, lists, emphasis, links, image paths, code blocks and inline code stay unchanged except for the human-readable text, which you translate. Never translate URLs, file paths or code.
Reply with the translation only: no preamble, no quotes, no notes.`;

// Runs the local Claude Code CLI (uses the logged-in Claude subscription, no API key).
// Isolated from settings, CLAUDE.md, tools and MCP so only the translation comes back.
function runClaude(systemPrompt: string, text: string) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn("claude", ["-p", "--model", "haiku", "--tools", "", "--setting-sources", "", "--strict-mcp-config", "--disable-slash-commands", "--no-session-persistence", "--system-prompt", systemPrompt], { cwd: os.tmpdir(), timeout: 5 * 60 * 1000 });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve(stdout.trim()) : reject(new Error(stderr.trim() || `claude exited with code ${code}`)));
    child.stdin.end(text);
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "La traduction n'est disponible qu'en local." }, { status: 403 });
  try {
    const payload = await request.json();
    const field = payload.field as Field;
    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    if (!(field in limits)) return NextResponse.json({ error: "Champ inconnu." }, { status: 400 });
    if (!text) return NextResponse.json({ error: "Le champ français est vide." }, { status: 400 });
    if (text.length > limits[field]) return NextResponse.json({ error: "Le texte dépasse la limite autorisée." }, { status: 400 });

    const instruction = field === "content" ? "" : `\nThis is the article ${field}: keep it under ${limits[field]} characters.`;
    const translation = await runClaude(system + instruction, text);
    if (!translation) return NextResponse.json({ error: "Traduction vide." }, { status: 502 });

    return NextResponse.json({ translation: translation.slice(0, limits[field]) });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return NextResponse.json({ error: "Commande claude introuvable : installez Claude Code et connectez-vous." }, { status: 500 });
    return NextResponse.json({ error: `Impossible de traduire le texte. ${error instanceof Error ? error.message : ""}`.trim() }, { status: 500 });
  }
}
