// Contact notification e-mail through Resend's HTTP API (no SDK dependency).
// Env: RESEND_API_KEY (required to send), CONTACT_TO (default koddeur@gmail.com),
// CONTACT_FROM (default Resend's test sender, which only delivers to the Resend account's address).

export async function sendContactNotification({ email, subject, message }: { email: string; subject: string; message: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante : message enregistré sans e-mail de notification.");
    return false;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || "koddeur <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO || "koddeur@gmail.com"],
      reply_to: email,
      subject: `[${subject}] Nouveau message de ${email}`,
      text: `${message}\n\n— Envoyé depuis koddeur.com par ${email} (répondre à ce mail lui répond directement).`,
    }),
  });
  if (!response.ok) console.error("Envoi Resend échoué :", response.status, await response.text().catch(() => ""));
  return response.ok;
}
