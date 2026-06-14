const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
    const [username, ...passParts] = decoded.split(':');
    const password = passParts.join(':');
    const validUser = process.env.AUTH_USER || 'admin';
    const validPass = process.env.AUTH_PASSWORD || 'scoutboard2024';
    if (username === validUser && password === validPass) {
      const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="ScoutBoard Pro"');
  return res.status(401).send('Accès refusé');
}
