// Questions of the /devis pre-quote form, shared by the form (labels) and /api/quote (whitelist).
// The form sends the keys; the API stores the French labels in a plain-text message.

export type QuoteOption = { key: string; fr: string; en: string };

export const PROJECT_TYPES: QuoteOption[] = [
  { key: "showcase", fr: "Site vitrine", en: "Showcase website" },
  { key: "ecommerce", fr: "E-commerce", en: "E-commerce" },
  { key: "webapp", fr: "Application web / SaaS", en: "Web app / SaaS" },
  { key: "mobile", fr: "Application mobile", en: "Mobile app" },
  { key: "automation", fr: "Automatisation", en: "Automation" },
  { key: "redesign", fr: "Refonte d'un existant", en: "Redesign of an existing one" },
  { key: "other", fr: "Autre", en: "Other" },
];

export const FEATURES: QuoteOption[] = [
  { key: "accounts", fr: "Comptes utilisateurs / connexion", en: "User accounts / login" },
  { key: "payments", fr: "Paiement en ligne", en: "Online payments" },
  { key: "booking", fr: "Prise de rendez-vous / réservation", en: "Booking / appointments" },
  { key: "cms", fr: "Blog ou contenus modifiables", en: "Blog or editable content" },
  { key: "admin", fr: "Back-office / tableau de bord", en: "Back office / dashboard" },
  { key: "multilingual", fr: "Plusieurs langues", en: "Multiple languages" },
  { key: "integrations", fr: "Connexion à d'autres outils (CRM, Notion, Google…)", en: "Connecting other tools (CRM, Notion, Google…)" },
  { key: "notifications", fr: "Notifications e-mail / SMS", en: "E-mail / SMS notifications" },
  { key: "ai", fr: "IA / assistant / chatbot", en: "AI / assistant / chatbot" },
];

export const READINESS: QuoteOption[] = [
  { key: "yes", fr: "Oui", en: "Yes" },
  { key: "partial", fr: "En partie", en: "Partly" },
  { key: "no", fr: "Non", en: "No" },
];

export const DEADLINES: QuoteOption[] = [
  { key: "urgent", fr: "Moins d'un mois", en: "Under a month" },
  { key: "1-3", fr: "1 à 3 mois", en: "1 to 3 months" },
  { key: "3-6", fr: "3 à 6 mois", en: "3 to 6 months" },
  { key: "flexible", fr: "Pas de date fixe", en: "No fixed date" },
];

export const MAINTENANCE: QuoteOption[] = [
  { key: "yes", fr: "Oui", en: "Yes" },
  { key: "no", fr: "Non", en: "No" },
  { key: "discuss", fr: "À discuter", en: "To discuss" },
];

// Max length of each free-text answer, and of the whole stored message (see supabase/schema.sql).
export const QUOTE_LIMITS = { name: 120, company: 160, industry: 160, website: 300, description: 3000, audience: 600, tools: 600, references: 600, notes: 1500 } as const;
export const QUOTE_MESSAGE_MAX = 8000;
