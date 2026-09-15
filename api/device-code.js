// Vercel Serverless Function
// 代理 GitHub OAuth Device Flow 第一步：申请设备码
// 说明：GitHub 的 OAuth 端点未开启 CORS，浏览器无法直接调用，必须由后端中转。
// Device Flow 不需要 client_secret，此处仅透明转发，不存储任何敏感信息。
export default async function handler(req, res) {
  // CORS：允许面板前端（GitHub Pages / Vercel）跨域调用
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GH_CLIENT_ID = process.env.GH_CLIENT_ID || 'YOUR_CLIENT_ID';

  try {
    const r = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: GH_CLIENT_ID, scope: 'repo workflow' }),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to request device code' });
  }
}
