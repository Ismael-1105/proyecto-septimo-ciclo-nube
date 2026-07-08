/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string; // ID token/number
  name: string;
  career: string;
  lab: string;
  photoUrl: string;
  matchPercentage: number;
  status: 'allowed' | 'denied';
  avatarInitials: string;
}

export interface AccessLog {
  id: string;
  studentId: string;
  studentName: string;
  avatarInitials: string;
  date: string;
  time: string;
  result: 'Permitido' | 'Denegado';
  similarity: number;
}

export interface CloudService {
  id: string;
  name: string;
  iconName: string;
  tag: string;
  description: string;
  actionLabel: string;
  status: 'operational' | 'busy' | 'alert';
}

export type AppView = 'home' | 'demo' | 'admin' | 'architecture';

export type UserRole = 'docente' | 'estudiante';

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  studentId?: string;
}

export type StudentViewType = 'kiosk' | 'profile';

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}
