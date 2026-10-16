import Image from "next/image";
import Link from "next/link";
import { socials } from "@/lib/site";

export const dynamic = "force-dynamic";

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
