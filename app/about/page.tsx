import Image from "next/image";
import Link from "next/link";
import { highlightTitle } from "@/components/highlighted-title";
import { Bi } from "@/components/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const experiences = [
  {
    role: "Ingénieur logiciel",
    roleEn: "Software Engineer",
    company: "Freelance",
    range: "Janvier 2026 → présent",
    rangeEn: "January 2026 → present",
    location: "Lille, France",
    locationEn: "Lille, France",
  },
  {
    role: "Ingénieur logiciel",
    roleEn: "Software Engineer",
    company: "Decathlon France",
    range: "Sept 2020 → Décembre 2025",
    rangeEn: "Sept 2020 → December 2025",
    location: "Croix, France",
    locationEn: "Croix, France",
  },
  {
    role: "Ingénieur logiciel junior",
    roleEn: "Junior Software Engineer",
    company: "Decathlon USA LLC",
    range: "Avril 2019 → Septembre 2019",
    rangeEn: "April 2019 → September 2019",
    location: "San Francisco, USA",
    locationEn: "San Francisco, USA",
  },
];

const education = [
  {
    degree: "Master Informatique (E-services)",
    degreeEn: "Master's in Computer Science (E-services)",
    school: "Université de Lille, Villeneuve-d'Ascq",
    range: "2019 → 2021",
  },
  {
    degree: "Licence en Ingénierie Informatique",
    degreeEn: "Bachelor's in Computer Engineering",
    school: "Université de Lille, Villeneuve-d'Ascq",
    range: "2016 → 2019",
  },
  {
    degree: "Baccalauréat Scientifique",
    degreeEn: "Science Baccalaureate (French high-school diploma)",
    school: "Lycée Raymond Queneau, Villeneuve-d'Ascq",
    range: "2012 → 2015",
  },
];

export default function AboutPage() {
  return (
    <main className="shell">
      <header className="home-header">
        <div className="home-nav"><Logo href="/" mark={false} /><div className="nav-actions"><LanguageToggle /><ThemeToggle /></div></div>
        <h1 className="home-title">About</h1>
      </header>

      <section className="about-profile">
        <span className="about-photo"><Image src="/koddevr-logo.jpg" alt="Mael Avennec" width={184} height={184} /></span>
        <div className="about-identity">
          <h2>Mael Avennec</h2>
          <p><Bi fr="29 ans · Développeur Full-stack · Lille, France" en="29 y/o · Full-stack Developer · Lille, France" /></p>
        </div>
      </section>

      <p className="about-bio">
        <Bi
          fr={<>Développeur passionné, j&rsquo;aime apprendre, créer et développer afin de résoudre des problèmes du quotidien ou d&rsquo;apporter des solutions complètes à mes clients.<br /><br />Fan de football ⚽️, de football américain 🏈 et de formule 1 🏎️</>}
          en={<>Passionate developer, I love learning, building and coding to solve everyday problems or deliver complete solutions for my clients.<br /><br />Fan of football ⚽️, American football 🏈 and Formula 1 🏎️</>}
        />
      </p>

      <section className="about-section">
        <h2><Bi fr={highlightTitle("Expériences *professionnelles*")} en={highlightTitle("Professional *experience*")} /></h2>
        {experiences.map((experience) => (
          <div className="about-item" key={experience.company}>
            <h3><Bi fr={`${experience.role} — ${experience.company}`} en={`${experience.roleEn} — ${experience.company}`} /></h3>
            <span className="about-meta"><Bi fr={experience.range} en={experience.rangeEn} /></span>
            <p><Bi fr={experience.location} en={experience.locationEn} /></p>
          </div>
        ))}
      </section>

      <section className="about-section">
        <h2><Bi fr={highlightTitle("Parcours *scolaire*")} en={highlightTitle("*Academic* background")} /></h2>
        {education.map((entry) => (
          <div className="about-item" key={entry.degree}>
            <h3><Bi fr={entry.degree} en={entry.degreeEn} /></h3>
            <span className="about-meta">{entry.range}</span>
            <p>{entry.school}</p>
          </div>
        ))}
      </section>

      <div className="about-resume">
        <a href="/files/avennec_mael_resume_fr.pdf" target="_blank" rel="noreferrer" className="read-link"><Bi fr="Télécharger mon CV" en="Download my resume" /> - FR <span className="arrow">↓</span></a>
        <a href="/files/avennec_mael_resume_en.pdf" target="_blank" rel="noreferrer" className="read-link"><Bi fr="Télécharger mon CV" en="Download my resume" /> - EN <span className="arrow">↓</span></a>
      </div>

      <footer>
        <span>© {new Date().getFullYear()} koddeur</span>
        <nav className="footer-links">
          <Link href="/"><Bi fr="Accueil" en="Home" /></Link>
          <Link href="/blog">Blog</Link>
          <Link href="/projects"><Bi fr="Projets" en="Projects" /></Link>
          <Link href="/about">About</Link>
        </nav>
      </footer>
    </main>
  );
}
