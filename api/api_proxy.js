// Datei: /api/api_proxy.js
// Funktioniert automatisch auf Vercel (Node.js 18+)
// Diese API dient als Proxy zwischen deiner WebApp und JustWatch.de
// Verhindert CORS-Probleme & hält die App mit echten deutschen Streaming-Daten aktuell

import fetch from "node-fetch";

export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Fehlender query-Parameter" });

  try {
    const response = await fetch(`https://apis.justwatch.com/content/titles/de_DE/popular`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const data = await response.json();
    const item = data.items?.find(i => i.title.toLowerCase().includes(query.toLowerCase())) || {};
    const offers = item.offers?.filter(o => o.monetization_type === "flatrate")
      .map(o => ({ provider: o.provider_id, url: o.urls?.standard_web })) || [];
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ title: item.title || query, offers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen von JustWatch" });
  }
}

