import path from "node:path";

// In local dev, articles/projects live in a separate, gitignored folder so anything
// added or edited through the admin panel while running `npm run dev` can never end up
// in a `git push` (and therefore never reaches production). Production (`next start`,
// NODE_ENV=production) keeps reading/writing the real, git-tracked `content/` folder.
// Override with CONTENT_DIR if you deliberately want a different folder name.
const contentFolderName = process.env.CONTENT_DIR || (process.env.NODE_ENV === "production" ? "content" : "content-local");

export const contentRoot = path.join(process.cwd(), contentFolderName);
