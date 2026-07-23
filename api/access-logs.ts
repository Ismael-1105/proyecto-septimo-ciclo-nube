// GET /api/access-logs -> bitacora de accesos (mas recientes primero)
// Equivale a la consulta de la bitacora en DynamoDB de la arquitectura final.

import { listAccessLogs } from './_lib/store';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo no permitido' });
    return;
  }
  res.status(200).json({ logs: listAccessLogs() });
}
