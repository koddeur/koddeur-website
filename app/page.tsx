import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const socials = [
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

export default function Landing() {
  return (
    <main className="shell landing-shell">
      <div className="landing-content">
        <h1 className="landing-title">koddeur</h1>
        <ul className="social-grid">
          {socials.map((social) => {
            const external = !social.href.startsWith("mailto:");
            return (
              <li key={social.id}>
                <a href={social.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={`social-tile social-${social.id}`}>
                  <Image src={`/social/${social.id}.png`} alt="" width={35} height={35} />
                </a>
              </li>
            );
          })}
        </ul>
        <div className="landing-links">
          <Link href="/projects" className="landing-link">Projects</Link>
          <Link href="/blog" className="landing-link">Blog</Link>
          <Link href="/about" className="landing-link">About</Link>
        </div>
      </div>
      <footer><span>© {new Date().getFullYear()} koddeur</span></footer>
    </main>
  );
}
