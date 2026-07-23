// Almacen en memoria para el backend serverless.
// En la arquitectura final estos datos viven en Amazon DynamoDB;
// aqui se mantienen en memoria por instancia para la demo desplegada en Vercel.

export interface StudentRecord {
  id: string;
  name: string;
  career: string;
  lab: string;
  status: 'allowed' | 'denied';
  avatarInitials: string;
  enrolledAt: string;
}

export interface AccessLogRecord {
  id: string;
  studentId: string;
  studentName: string;
  avatarInitials: string;
  date: string;
  time: string;
  result: 'Permitido' | 'Denegado';
  similarity: number;
}

export const SIMILARITY_THRESHOLD = 95;

const students: StudentRecord[] = [
  {
    id: 'student-ismael',
    name: 'Ismael Gonzalez',
    career: 'Ingenieria TI',
    lab: 'LAB-02',
    status: 'allowed',
    avatarInitials: 'IG',
    enrolledAt: '2026-07-01T10:00:00.000Z'
  },
  {
    id: 'student-nicolas',
    name: 'Nicolas Cevallos',
    career: 'Ingenieria TI',
    lab: 'LAB-02',
    status: 'allowed',
    avatarInitials: 'NC',
    enrolledAt: '2026-07-01T10:05:00.000Z'
  }
];

const accessLogs: AccessLogRecord[] = [];

export function listStudents(): StudentRecord[] {
  return students;
}

export function findStudent(id: string): StudentRecord | undefined {
  return students.find((s) => s.id === id);
}

export function addStudent(data: Omit<StudentRecord, 'enrolledAt'>): StudentRecord {
  const record: StudentRecord = { ...data, enrolledAt: new Date().toISOString() };
  students.push(record);
  return record;
}

export function listAccessLogs(): AccessLogRecord[] {
  return accessLogs;
}

export function addAccessLog(entry: Omit<AccessLogRecord, 'id' | 'date' | 'time'>): AccessLogRecord {
  const now = new Date();
  const record: AccessLogRecord = {
    id: `log-${now.getTime()}`,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 8),
    ...entry
  };
  accessLogs.unshift(record);
  return record;
}
