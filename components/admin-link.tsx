import Link from "next/link";

// Shortcut to the admin panel, rendered only in local development (`next dev`).
export function AdminLink() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <Link href="/admin" className="theme-toggle" aria-label="Panel admin" title="Panel admin">
      <span className="theme-icon">⚙</span>
    </Link>
  );
}
