import { AboutPhoto } from "@/components/about-photo";
import { highlightTitle } from "@/components/highlighted-title";
import { Bi } from "@/components/i18n";

// Booking link behind "Parlons-en" in the bio.
const calUrl = "https://cal.com/mael-avennec/diagnostic";

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

// About content (profile, bio, experience, education), shared by /about and the home page
// laptop's right panel.
export function AboutContent() {
  return (
    <>
      <section className="about-profile">
        <AboutPhoto />
        <div className="about-identity">
          <h2>Mael</h2>
          <p><Bi fr="29 ans · Développeur Full-stack · Lille, France" en="29 y/o · Full-stack Developer · Lille, France" /></p>
        </div>
      </section>

      <p className="about-bio">
        <Bi
          fr={<>Développeur fullstack avec plus de 5 ans d&rsquo;expérience, dont plusieurs années chez Decathlon. Je conçois des sites, des apps et des automatisations sur mesure pour aider les entreprises et les indépendants à gagner du temps et à se développer.<br /><br />Je travaille actuellement à distance avec des clients partout dans le monde. Un projet en tête ? <a href={calUrl} target="_blank" rel="noopener noreferrer">Parlons-en</a>.<br /><br /><em>« Il n&rsquo;y a pas de problème, il n&rsquo;y a que des solutions. »</em> — André Gide<br /><br />Fan de football ⚽️, de football américain 🏈 et de formule 1 🏎️</>}
          en={<>Fullstack developer with more than 5 years of experience, including several years at Decathlon. I build custom websites, apps and automations that help businesses and freelancers save time and grow.<br /><br />I currently work remotely with clients all over the world. Got a project in mind? <a href={calUrl} target="_blank" rel="noopener noreferrer">Let&rsquo;s talk</a>.<br /><br /><em>&ldquo;There are no problems, only solutions.&rdquo;</em> — André Gide<br /><br />Fan of football ⚽️, American football 🏈 and Formula 1 🏎️</>}
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
    </>
  );
}
