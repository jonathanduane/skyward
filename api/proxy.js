export default async function handler(req, res) {
  const url = "https://skyward-lead-tracker-jonathanduane.replit.app" + req.url;

  try {
    const response = await fetch(url);
    const body = await response.text();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-security-policy" && key.toLowerCase() !== "x-frame-options") {
        res.setHeader(key, value);
      }
    });
    res.send(body);
  } catch (error) {
    res.status(500).send("Error proxying Replit app.");
  }
}
