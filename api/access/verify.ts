// POST /api/access/verify
// Orquesta la decision de acceso: valida que el estudiante este enrolado y
// habilitado, compara la similitud contra el umbral y registra el evento en la
// bitacora, tal como lo hara la Lambda orquestadora con Rekognition y DynamoDB.

import { addAccessLog, findStudent, SIMILARITY_THRESHOLD } from '../_lib/store';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo no permitido' });
    return;
  }

  const { studentId, similarity } = req.body ?? {};
  if (!studentId || typeof similarity !== 'number') {
    res.status(400).json({ error: 'Campos requeridos: studentId, similarity (numero)' });
    return;
  }

  const student = findStudent(studentId);
  if (!student) {
    const log = addAccessLog({
      studentId,
      studentName: 'No reconocido',
      avatarInitials: '??',
      result: 'Denegado',
      similarity
    });
    res.status(200).json({ granted: false, reason: 'Estudiante no enrolado', log });
    return;
  }

  const granted = student.status === 'allowed' && similarity >= SIMILARITY_THRESHOLD;
  const log = addAccessLog({
    studentId: student.id,
    studentName: student.name,
    avatarInitials: student.avatarInitials,
    result: granted ? 'Permitido' : 'Denegado',
    similarity
  });

  res.status(200).json({
    granted,
    reason: granted
      ? 'Acceso concedido'
      : student.status !== 'allowed'
        ? 'Estudiante deshabilitado'
        : `Similitud ${similarity} bajo el umbral ${SIMILARITY_THRESHOLD}`,
    log
  });
}
