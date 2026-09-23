import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "koddeur",
  description: "Notes, snippets et retours d'expérience autour du code.",
};

const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark" ? stored : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();`;

const langInitScript = `(function () {
  try {
    var stored = localStorage.getItem("lang");
    var lang = stored === "en" ? "en" : "fr";
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang);
  } catch (e) {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        {children}
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Script id="lang-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: langInitScript }} />
      </body>
    </html>
  );
}
