// Public URL used for share links, so links copied from the local admin point to production.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://koddeur.com").replace(/\/$/, "");

export const articleUrl = (slug: string) => `${siteUrl}/articles/${slug}`;
