import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, CheckCircle, XCircle, SignIn, Clock, CalendarBlank,
  IdentificationBadge, Flask, User, Fingerprint
} from '@phosphor-icons/react';
import type { Student, AccessLog } from '../types.ts';

interface StudentDetailViewProps {
  student: Student;
  logs: AccessLog[];
  onToggleStatus: (id: string) => void;
  onBack: () => void;
}

export default function StudentDetailView({ student, logs, onToggleStatus, onBack }: StudentDetailViewProps) {
  const studentLogs = logs.filter(l => l.studentId === student.id);
  const total = studentLogs.length;
  const permitidos = studentLogs.filter(l => l.result === 'Permitido').length;
  const denegados = studentLogs.filter(l => l.result === 'Denegado').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back + header */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
        Volver al listado
      </button>

      {/* Profile card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="h-20 bg-gradient-to-r from-accent-600 to-accent-800 relative" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900 shadow-lg flex-shrink-0">
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.src = '/images/camera-feed-bg.jpg'; }}
              />
            </div>
            <div className="flex-1 pt-3 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white">{student.name}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{student.career}</p>
                </div>
                <button
                  onClick={() => onToggleStatus(student.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] inline-flex items-center gap-1.5 ${
                    student.status === 'allowed'
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50'
                      : 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50'
                  }`}
                >
                  {student.status === 'allowed' ? <XCircle className="w-4 h-4" weight="fill" /> : <CheckCircle className="w-4 h-4" weight="fill" />}
                  {student.status === 'allowed' ? 'Suspender' : 'Reintegrar'}
                </button>
              </div>
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <Flask className="w-4 h-4 text-accent-600 dark:text-accent-400" weight="regular" />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{student.lab}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <IdentificationBadge className="w-4 h-4 text-accent-600 dark:text-accent-400" weight="regular" />
              <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">{student.id}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <Fingerprint className={`w-4 h-4 ${student.status === 'allowed' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} weight="regular" />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Match {student.matchPercentage}%
              </span>
            </div>
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border ${
              student.status === 'allowed'
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
            }`}>
              {student.status === 'allowed'
                ? <CheckCircle className="w-4 h-4" weight="fill" />
                : <XCircle className="w-4 h-4" weight="fill" />
              }
              <span className="text-xs font-bold">{student.status === 'allowed' ? 'Habilitado' : 'Suspendido'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total accesos', value: total, icon: SignIn, color: 'text-zinc-600 dark:text-zinc-300' },
          { label: 'Permitidos', value: permitidos, icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
          { label: 'Denegados', value: denegados, icon: XCircle, color: 'text-red-600 dark:text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} weight="regular" />
            <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Access history */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Historial de accesos</h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Registros biométricos del alumno.</p>
        </div>
        {studentLogs.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {studentLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="flex flex-col items-center gap-0.5 text-zinc-400 dark:text-zinc-500">
                    <CalendarBlank className="w-3.5 h-3.5" weight="regular" />
                    <Clock className="w-3.5 h-3.5" weight="regular" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">{log.date}</p>
                    <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{log.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg text-zinc-500 dark:text-zinc-400">
                    {log.similarity}%
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    log.result === 'Permitido'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {log.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
            No hay registros de acceso para este alumno.
          </div>
        )}
      </div>
    </motion.div>
  );
}
