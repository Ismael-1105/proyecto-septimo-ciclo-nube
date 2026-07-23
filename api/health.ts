// GET /api/health
// Endpoint de salud del backend. Confirma que las funciones serverless
// responden y que la peticion llego cifrada a traves del borde de Vercel.

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo no permitido' });
    return;
  }
  res.status(200).json({
    status: 'ok',
    service: 'faceaccess-lab-api',
    protocol: req.headers['x-forwarded-proto'] ?? 'desconocido',
    timestamp: new Date().toISOString()
  });
}
