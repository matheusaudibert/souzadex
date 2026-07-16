module.exports = async function handler(req, res) {
  try {
    const upstream = await fetch(
      "https://raw.githubusercontent.com/matheusaudibert/souzadex/main/souzas.json",
      { headers: { "User-Agent": "souzadex-proxy" } }
    );
    if (!upstream.ok) {
      res.status(502).json({ error: "upstream fetch failed", status: upstream.status });
      return;
    }
    const body = await upstream.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    res.status(200).send(body);
  } catch (err) {
    res.status(500).json({ error: "proxy error", message: String(err) });
  }
};
