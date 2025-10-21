// Datei: /api/api_proxy.js
// Funktioniert automatisch auf Vercel (Node.js 18+)
// Diese API dient als Proxy zwischen deiner WebApp und JustWatch.de
// Verhindert CORS-Probleme & hält die App mit echten deutschen Streaming-Daten aktuell

import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Fehlender Parameter ?query=" });
    }

    const region = "DE";
    const searchUrl = `https://apis.justwatch.com/content/titles/${region}/popular?body=${encodeURIComponent(
      JSON.stringify({
        content_types: ["movie", "show"],
        page_size: 1,
        page: 1,
        query,
      })
    )}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ message: "Kein Treffer gefunden" });
    }

    const item = data.items[0];
    const offers =
      item.offers
        ?.filter((o) => o.monetization_type === "flatrate")
        ?.map((o) => ({
          provider: o.provider_id,
          url: o.urls?.standard_web,
        })) || [];

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({
      title: item.title,
      offers,
    });
  } catch (err) {
    console.error("Proxy-Fehler:", err);
    res.status(500).json({ error: "Interner Proxy-Fehler" });
  }
}
