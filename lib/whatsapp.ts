// lib/whatsapp.ts

// Very simple wrapper around your WhatsApp API.
// Update URL/body as per your provider (Ultramsg, Gupshup, etc).

export async function sendWhatsAppMessage(to: string, message: string) {
  const url = process.env.WHATSAPP_API_URL;      // e.g. "https://your-wa-api/send"
  const apiToken = process.env.WHATSAPP_API_TOKEN; // if needed

  if (!url) {
    console.warn("WHATSAPP_API_URL not set – skipping WhatsApp message");
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: JSON.stringify({
        to,
        message,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("WhatsApp send failed:", res.status, text);
    }
  } catch (err) {
    console.error("WhatsApp send error:", err);
  }
}
