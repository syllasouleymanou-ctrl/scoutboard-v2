const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  // Get Basic Auth header
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Basic ')) {
    const base64 = authHeader.slice(6);
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [username, ...passParts] = decoded.split(':');
    const password = passParts.join(':'); // handle colons in password

    const validUser = process.env.AUTH_USER || 'admin';
    const validPass = process.env.AUTH_PASSWORD || 'scoutboard2024';

    if (username === validUser && password === validPass) {
      // ✅ Authorized — serve the dashboard
      try {
        const htmlPath = path.join(process.cwd(), 'index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        return res.status(200).send(html);
      } catch (err) {
        return res.status(500).send('Erreur serveur : fichier index.html introuvable.');
      }
    }
  }

  // ❌ Not authorized — show login prompt
  res.setHeader('WWW-Authenticate', 'Basic realm="ScoutBoard Pro — Accès privé"');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(401).send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>ScoutBoard — Accès refusé</title>
      <style>
        body { background: #0a1628; color: #f0f4ff; font-family: 'Inter', sans-serif;
               display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .box { text-align: center; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
        .green { color: #00c853; }
        p { color: #8ca0c0; font-size: 14px; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="logo">Scout<span class="green">Board</span> Pro</div>
        <p>Accès refusé. Identifiants incorrects.</p>
        <p style="margin-top:16px"><a href="/" style="color:#00c853">↩ Réessayer</a></p>
      </div>
    </body>
    </html>
  `);
}
