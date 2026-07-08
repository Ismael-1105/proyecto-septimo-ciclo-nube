import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  WarningOctagon, WarningCircle, Info, CheckCircle, Eye, EyeSlash,
  Trash, Funnel, Clock, MagnifyingGlass
} from '@phosphor-icons/react';
import type { Alert } from '../types.ts';

interface AlertsCenterProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const SEVERITY_ORDER = ['critical', 'warning', 'info'] as const;

export default function AlertsCenter({ alerts, onAcknowledge, onResolve }: AlertsCenterProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sorted = [...alerts].sort((a, b) => {
    const sa = SEVERITY_ORDER.indexOf(a.severity as typeof SEVERITY_ORDER[number]);
    const sb = SEVERITY_ORDER.indexOf(b.severity as typeof SEVERITY_ORDER[number]);
    if (sa !== sb) return sa - sb;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const filtered = sorted.filter(a => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (searchQuery && !a.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.source.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const acknowledgedCount = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  const severityIcon = (sev: Alert['severity']) => {
    switch (sev) {
      case 'critical': return <WarningOctagon className="w-4 h-4 text-red-500" weight="fill" />;
      case 'warning': return <WarningCircle className="w-4 h-4 text-amber-500" weight="fill" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" weight="fill" />;
    }
  };

  const statusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'active': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">ACTIVA</span>;
      case 'acknowledged': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">RECONOCIDA</span>;
      case 'resolved': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">RESUELTA</span>;
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
          Centro de Alertas
          {activeCount > 0 && (
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 align-middle">
              {activeCount} activa{activeCount !== 1 ? 's' : ''}
            </span>
          )}
        </h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Monitoreo de incidencias del ecosistema biométrico.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Activas', value: activeCount, icon: WarningOctagon, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' },
          { label: 'Reconocidas', value: acknowledgedCount, icon: Eye, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Resueltas', value: resolvedCount, icon: CheckCircle, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{value}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" weight="fill" />
              </div>
            </div>
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm text-xs">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" weight="regular" />
          <input type="text" placeholder="Buscar alerta..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs transition-all" />
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Funnel className="w-4 h-4 text-zinc-400" weight="regular" />
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
            className="text-xs p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none transition-all">
            <option value="all">Todas las severidades</option>
            <option value="critical">Críticas</option>
            <option value="warning">Advertencias</option>
            <option value="info">Informativas</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-xs p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none transition-all">
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="acknowledged">Reconocidas</option>
            <option value="resolved">Resueltas</option>
          </select>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-2.5">
        {filtered.length > 0 ? (
          <AnimatePresence>
            {filtered.map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className={`p-4 rounded-xl border text-xs transition-all ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50'
                    : alert.severity === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50'
                    : 'bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">
                      {severityIcon(alert.severity)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-900 dark:text-white text-xs">{alert.source}</span>
                        <span className="text-zinc-400 dark:text-zinc-500">·</span>
                        {statusBadge(alert.status)}
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed break-words">{alert.message}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-zinc-400 dark:text-zinc-500">
                        <Clock className="w-3 h-3" weight="regular" />
                        <span className="text-[10px]">{formatTimestamp(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {alert.status === 'active' && (
                      <button onClick={() => onAcknowledge(alert.id)}
                        className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-all"
                        title="Reconocer">
                        <Eye className="w-4 h-4" weight="regular" />
                      </button>
                    )}
                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                      <button onClick={() => onResolve(alert.id)}
                        className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/30 transition-all"
                        title="Resolver">
                        <CheckCircle className="w-4 h-4" weight="regular" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-14 text-center text-zinc-400 dark:text-zinc-500 text-xs">
            No se encontraron alertas con los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
}
