import type { ReactNode } from "react";

export function Bi({ fr, en }: { fr: ReactNode; en: ReactNode }) {
  return (
    <>
      <span data-i18n="fr">{fr}</span>
      <span data-i18n="en">{en}</span>
    </>
  );
}
