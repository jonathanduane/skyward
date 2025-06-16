export default async function handler(req, res) {
  const targetUrl = "https://skyward-lead-tracker-jonathanduane.replit.app" + req.url;

  try {
    const response = await fetch(targetUrl);
    const body = await response.text();

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (!["x-frame-options", "content-security-policy"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.send(body);
  } catch (err) {
    res.status(500).send("Proxy failed: " + err.message);
  }
}
