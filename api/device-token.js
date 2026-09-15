// Vercel Serverless Function
// 代理 GitHub OAuth Device Flow 第二步：用设备码轮询换取 access_token
// 说明：GitHub 的 OAuth 端点未开启 CORS，浏览器无法直接调用，必须由后端中转。
// Device Flow 不需要 client_secret，此处仅透明转发，不存储任何敏感信息。
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { device_code } = req.body || {};
  if (!device_code) return res.status(400).json({ error: 'missing device_code' });

  const GH_CLIENT_ID = process.env.GH_CLIENT_ID || 'YOUR_CLIENT_ID';

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: GH_CLIENT_ID,
        device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to exchange device code' });
  }
}
