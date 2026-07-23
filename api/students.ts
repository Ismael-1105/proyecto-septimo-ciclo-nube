// GET  /api/students  -> lista de estudiantes enrolados
// POST /api/students  -> enrolamiento de un estudiante nuevo
// En la arquitectura final el enrolamiento invoca Amazon Rekognition (IndexFaces)
// y persiste en DynamoDB; aqui se registra el catalogo en el almacen en memoria.

import { addStudent, findStudent, listStudents } from './_lib/store';

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    res.status(200).json({ students: listStudents() });
    return;
  }

  if (req.method === 'POST') {
    const { id, name, career, lab } = req.body ?? {};
    if (!id || !name || !career || !lab) {
      res.status(400).json({ error: 'Campos requeridos: id, name, career, lab' });
      return;
    }
    if (findStudent(id)) {
      res.status(409).json({ error: `El estudiante ${id} ya esta enrolado` });
      return;
    }
    const initials = String(name)
      .split(/\s+/)
      .map((part: string) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    const student = addStudent({
      id,
      name,
      career,
      lab,
      status: 'allowed',
      avatarInitials: initials
    });
    res.status(201).json({ student });
    return;
  }

  res.status(405).json({ error: 'Metodo no permitido' });
}
