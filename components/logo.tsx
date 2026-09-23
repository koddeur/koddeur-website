import Link from "next/link";
import Image from "next/image";

export function Logo({ link = true, href = "/blog", mark = true, text = true }: { link?: boolean; href?: string; mark?: boolean; text?: boolean }) {
  const logo = <span className="logo" aria-label="koddeur">
    {mark ? <span className="logo-mark"><Image src="/koddevr-logo.jpg" width={335} height={335} alt="" priority /></span> : null}
    {text ? <span className="logo-wordmark">koddeur</span> : null}
  </span>;
  return link ? <Link href={href} className="logo-link">{logo}</Link> : logo;
}
