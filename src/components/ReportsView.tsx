import React, { useState } from 'react';
import { FileCsv, FilePdf, ChartBar, TrendUp, Users, Clock, CalendarBlank, ArrowRight } from '@phosphor-icons/react';
import type { AccessLog } from '../types.ts';
import { DAILY_STATS } from '../data.ts';

interface ReportsViewProps {
  logs: AccessLog[];
}

const PEAK_HOURS = [
  { hour: '07:00 - 08:00', count: 18 },
  { hour: '08:00 - 09:00', count: 42 },
  { hour: '09:00 - 10:00', count: 35 },
  { hour: '10:00 - 11:00', count: 28 },
  { hour: '11:00 - 12:00', count: 31 },
  { hour: '12:00 - 13:00', count: 45 },
  { hour: '13:00 - 14:00', count: 38 },
  { hour: '14:00 - 15:00', count: 22 },
];

const TOP_STUDENTS = [
  { name: 'Alejandro Morales', accesses: 47, avg: 98.2 },
  { name: 'Sofia Villarreal', accesses: 41, avg: 95.6 },
  { name: 'Ismael González', accesses: 38, avg: 99.1 },
  { name: 'Julian Rivas', accesses: 32, avg: 92.8 },
  { name: 'Valentina López', accesses: 29, avg: 94.3 },
];

export default function ReportsView({ logs }: ReportsViewProps) {
  const [period, setPeriod] = useState('week');

  const totalAccesses = logs.length;
  const permitidos = logs.filter(l => l.result === 'Permitido').length;
  const denegados = logs.filter(l => l.result === 'Denegado').length;
  const avgSimilarity = logs.length > 0
    ? (logs.reduce((sum, l) => sum + l.similarity, 0) / logs.length).toFixed(1)
    : '0';

  const handleExportCSV = () => {
    const header = 'Tipo,Valor\n';
    const rows = [
      `Total Accesos,${totalAccesses}`,
      `Permitidos,${permitidos}`,
      `Denegados,${denegados}`,
      `Similitud Promedio,${avgSimilarity}%`,
      `Pico Semanal,${Math.max(...DAILY_STATS.chartData.map(d => d.count))}`,
      '', '',
      'Alumno,Accesos,Similitud Prom. (%)',
      ...TOP_STUDENTS.map(s => `"${s.name}",${s.accesses},${s.avg}`),
    ];
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FaceAccess_Reporte_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Reportes y Estadísticas</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Métricas de acceso, tendencias y exportación de datos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all">
            <FileCsv className="w-4 h-4" weight="regular" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {['day', 'week', 'month'].map(p => (
          <button key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              period === p
                ? 'bg-accent-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
          </button>
        ))}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Accesos', value: totalAccesses, icon: ChartBar, color: 'bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400' },
          { label: 'Permitidos', value: permitidos, icon: TrendUp, color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' },
          { label: 'Denegados', value: denegados, icon: Users, color: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' },
          { label: 'Similitud Prom.', value: `${avgSimilarity}%`, icon: Clock, color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 block font-bold uppercase">{label}</span>
              <p className="text-2xl font-black tracking-tight mt-1 text-zinc-900 dark:text-white">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" weight="regular" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Accesos por Día</h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Lecturas biométricas procesadas.</p>
          </div>
          <div className="flex justify-between items-end h-48 px-2 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
            {DAILY_STATS.chartData.map((bar, i) => {
              const max = Math.max(...DAILY_STATS.chartData.map(d => d.count));
              const pct = (bar.count / max) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full flex justify-center">
                    <div className="absolute -top-6 scale-0 group-hover:scale-100 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-transform whitespace-nowrap">
                      {bar.count}
                    </div>
                    <div style={{ height: `${pct}%` }}
                      className="w-3/5 rounded-t-lg bg-accent-500 hover:bg-accent-600 transition-all cursor-pointer"
                    />
                  </div>
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 mt-2">{bar.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak hours */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Horas Pico</h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Concentración de accesos por hora.</p>
          </div>
          <div className="space-y-2">
            {PEAK_HOURS.map(({ hour, count }) => {
              const max = Math.max(...PEAK_HOURS.map(h => h.count));
              const pct = (count / max) * 100;
              return (
                <div key={hour} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 w-20 flex-shrink-0">{hour}</span>
                  <div className="flex-1 h-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div style={{ width: `${pct}%` }}
                      className="h-full rounded-lg bg-gradient-to-r from-accent-500 to-accent-600"
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top students */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Top 5 — Alumnos con más accesos</h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Esta semana.</p>
          </div>
        </div>
        <div className="space-y-3">
          {TOP_STUDENTS.map((s, i) => (
            <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  i === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                  i === 1 ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300' :
                  i === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                  'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                }`}>{i + 1}</span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-white">{s.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{s.accesses} accesos</span>
                <span className="text-[10px] font-mono font-bold bg-accent-50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded-lg">{s.avg}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Resumen del Período</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {[
            { label: 'Total Accesos', value: totalAccesses },
            { label: 'Promedio Diario', value: (totalAccesses / 7).toFixed(1) },
            { label: 'Pico Semanal', value: `${Math.max(...DAILY_STATS.chartData.map(d => d.count))} (Vie)` },
            { label: 'Tasa de Autorización', value: totalAccesses > 0 ? `${((permitidos / totalAccesses) * 100).toFixed(1)}%` : '0%' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase">{label}</p>
              <p className="text-sm font-black text-zinc-900 dark:text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
