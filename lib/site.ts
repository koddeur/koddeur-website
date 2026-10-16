// Public URL used for share links, so links copied from the local admin point to production.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://koddeur.com").replace(/\/$/, "");

export const articleUrl = (slug: string) => `${siteUrl}/articles/${slug}`;

// Social links shown on the home page; each id matches /public/social/<id>.png and a .social-<id> style.
export const socials = [
  { id: "instagram", href: "https://instagram.com/koddeur" },
  { id: "github", href: "https://github.com/koddeur" },
  { id: "daily-dev", href: "https://app.daily.dev/koddeur" },
  { id: "linkedin", href: "https://www.linkedin.com/in/mael-avennec/" },
  { id: "gmail", href: "mailto:koddeur@gmail.com" },
  { id: "codingame", href: "https://www.codingame.com/profile/9c87f98642ce1c438c2e010e79c7198e9241736" },
  { id: "bluesky", href: "https://bsky.app/profile/koddeur.bsky.social" },
  { id: "cal", href: "https://cal.com/mael-avennec" },
  { id: "x", href: "https://x.com/koddeur" },
];
