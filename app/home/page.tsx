import type { Metadata } from "next";
import { AboutContent } from "@/components/about-content";
import { ContactForm } from "@/components/contact-form";
import { HomeKeyboard } from "@/components/home-keyboard";
import { MacWindow } from "@/components/mac-window";
import { Bi } from "@/components/i18n";
import { ProjectsContent } from "@/components/projects-content";
import { getProjects } from "@/lib/projects";
import { socials } from "@/lib/site";

// Test page for the future home page.
export const metadata: Metadata = {
  title: "koddeur",
  robots: { index: false },
};

// Promethee only lives on the keyboard for now: the current home page grid is a 3x3 of `socials`.
const socialKeys = [...socials, { id: "promethee", href: "https://www.promethee.io/koddeur" }];

// Projects are read from content/projects at request time, like /projects.
export const dynamic = "force-dynamic";

export default async function HomeTest() {
  const projects = await getProjects();
  return (
    <main className="shell home-test">
      <HomeKeyboard
        socials={socialKeys}
        contact={<MacWindow className="mac-window-compose" title={<Bi fr="Nouveau message" en="New message" />}><ContactForm /></MacWindow>}
        projects={<MacWindow title={<Bi fr="Projets" en="Projects" />}><ProjectsContent projects={projects} /></MacWindow>}
        about={<MacWindow title={<Bi fr="À propos" en="About" />}><AboutContent /></MacWindow>}
      />
    </main>
  );
}
