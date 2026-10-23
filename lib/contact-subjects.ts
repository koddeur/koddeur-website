// Preset subjects of the home page contact form. The key is what the form sends; the API stores the
// French label (or the visitor's own text for "other").
export const CONTACT_SUBJECTS = [
  { key: "project", fr: "Projet", en: "Project" },
  { key: "question", fr: "Question", en: "Question" },
  { key: "quote", fr: "Devis", en: "Quote" },
  { key: "collaboration", fr: "Collaboration", en: "Collaboration" },
] as const;

export const OTHER_SUBJECT = "other";
export const SUBJECT_MAX = 120;
