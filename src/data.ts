/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, AccessLog, CloudService } from './types.ts';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-ismael',
    name: 'Ismael González',
    career: 'Ingeniería TI',
    lab: 'LAB-02',
    photoUrl: '/images/students/ismael-gonzalez.jpg',
    matchPercentage: 99.8,
    status: 'allowed',
    avatarInitials: 'IG'
  },
  {
    id: 'student-alejandro',
    name: 'Alejandro Morales',
    career: 'Ingeniería de Sistemas',
    lab: 'LAB-02',
    photoUrl: '/images/students/alejandro-morales.jpg',
    matchPercentage: 98.4,
    status: 'allowed',
    avatarInitials: 'AM'
  },
  {
    id: 'student-sofia',
    name: 'Sofia Villarreal',
    career: 'Ciencias de la Computación',
    lab: 'LAB-01',
    photoUrl: '/images/students/sofia-villarreal.jpg',
    matchPercentage: 94.1,
    status: 'allowed',
    avatarInitials: 'SV'
  },
  {
    id: 'student-julian',
    name: 'Julian Rivas',
    career: 'Ingeniería en Telecomunicaciones',
    lab: 'LAB-02',
    photoUrl: '/images/students/julian-rivas.jpg',
    matchPercentage: 91.5,
    status: 'allowed',
    avatarInitials: 'JR'
  },
  {
    id: 'student-unknown',
    name: 'Persona Desconocida',
    career: 'No Registrado / Alerta',
    lab: 'Acceso Denegado',
    photoUrl: '/images/students/persona-desconocida.jpg',
    matchPercentage: 22.8,
    status: 'denied',
    avatarInitials: '?'
  }
];

export const INITIAL_LOGS: AccessLog[] = [
  {
    id: 'log-1',
    studentId: 'student-alejandro',
    studentName: 'Alejandro Morales',
    avatarInitials: 'AM',
    date: 'Oct 24, 2024',
    time: '14:22:10',
    result: 'Permitido',
    similarity: 98.4
  },
  {
    id: 'log-2',
    studentId: 'student-sofia',
    studentName: 'Sofia Villarreal',
    avatarInitials: 'SV',
    date: 'Oct 24, 2024',
    time: '14:15:05',
    result: 'Permitido',
    similarity: 94.1
  },
  {
    id: 'log-3',
    studentId: 'student-unknown',
    studentName: 'Unknown Person',
    avatarInitials: '?',
    date: 'Oct 24, 2024',
    time: '14:10:48',
    result: 'Denegado',
    similarity: 22.8
  },
  {
    id: 'log-4',
    studentId: 'student-julian',
    studentName: 'Julian Rivas',
    avatarInitials: 'JR',
    date: 'Oct 24, 2024',
    time: '13:58:22',
    result: 'Permitido',
    similarity: 91.5
  }
];

export const DAILY_STATS = {
  registered: 324,
  accessesToday: 128,
  deniedToday: 12,
  alertsActive: 3,
  chartData: [
    { day: 'Mon', count: 45 },
    { day: 'Tue', count: 72 },
    { day: 'Wed', count: 61 },
    { day: 'Thu', count: 94 },
    { day: 'Fri', count: 128 },
    { day: 'Sat', count: 78 },
    { day: 'Sun', count: 50 }
  ]
};

export const CLOUD_SERVICES: CloudService[] = [
  {
    id: 'aws-rekognition',
    name: 'Amazon Rekognition',
    iconName: 'ScanFace',
    tag: 'VISION',
    description: 'Motor principal para análisis facial, extracción de puntos de referencia biométricos y comparación de alta precisión contra base de datos oficial.',
    actionLabel: 'Biometric Matching',
    status: 'operational'
  },
  {
    id: 'aws-liveness',
    name: 'Face Liveness',
    iconName: 'ShieldCheck',
    tag: 'ANTI-SPOOF',
    description: 'Detección avanzada de vivacidad y prevención de spoofing para verificar presencia física real ante la cámara en lugar de fotos o pantallas.',
    actionLabel: 'Active Liveness',
    status: 'operational'
  },
  {
    id: 'aws-lambda',
    name: 'AWS Lambda',
    iconName: 'Terminal',
    tag: 'COMPUTE',
    description: 'Ejecución de lógica serverless para flujos de trabajo basados en eventos, procesado rápido de firmas faciales sin aprovisionamiento de servidores.',
    actionLabel: 'Execution Layer',
    status: 'operational'
  },
  {
    id: 'aws-api',
    name: 'AWS API Gateway',
    iconName: 'Hub',
    tag: 'GATEWAY',
    description: 'Punto de conexión seguro para dispositivos periféricos (kioscos), encargado de control de tráfico, balanceo y autenticación segura con firma TLS 1.3.',
    actionLabel: 'Interface Control',
    status: 'operational'
  },
  {
    id: 'aws-dynamo',
    name: 'Amazon DynamoDB',
    iconName: 'Database',
    tag: 'STORAGE',
    description: 'Base de datos NoSQL ultra rápida de baja latencia para almacenar plantillas faciales, credenciales académicas, permisos de acceso y logs temporales.',
    actionLabel: 'Metadata Persistence',
    status: 'operational'
  },
  {
    id: 'aws-s3',
    name: 'Amazon S3',
    iconName: 'FolderArchive',
    tag: 'OBJECT',
    description: 'Almacenamiento de objetos seguro y de alta disponibilidad para guardar capturas del feed original durante auditorías y fotos de perfil de registro.',
    actionLabel: 'Secure Assets',
    status: 'operational'
  },
  {
    id: 'aws-cognito',
    name: 'Amazon Cognito',
    iconName: 'Users',
    tag: 'IDENTITY',
    description: 'Gestión de identidad y directorios de personal administrativo para otorgar acceso basado en roles con soporte MFA y auditoría integrada.',
    actionLabel: 'Auth Framework',
    status: 'operational'
  },
  {
    id: 'aws-sns',
    name: 'Amazon SNS',
    iconName: 'BellRing',
    tag: 'ALERTS',
    description: 'Servicio de notificaciones del sistema para alertar a los supervisores por e-mail, SMS o push móvil en caso de intentos repetidos de acceso denegado.',
    actionLabel: 'Real-time Comms',
    status: 'operational'
  },
  {
    id: 'aws-cloudwatch',
    name: 'Amazon CloudWatch',
    iconName: 'LineChart',
    tag: 'METRICS',
    description: 'Monitoreo de latencia, tasa de aciertos y estado del hardware, recopilando métricas detalladas para el correcto funcionamiento del ecosistema.',
    actionLabel: 'Health Monitoring',
    status: 'operational'
  }
];
