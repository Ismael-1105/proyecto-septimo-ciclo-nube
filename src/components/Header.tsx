/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint, Bell, User, List, X, Moon, Sun } from '@phosphor-icons/react';
import { AppView } from '../types.ts';
import { useTheme } from '../App.tsx';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  logsCount: number;
  alertsCount: number;
  onClearAlerts?: () => void;
}

const NAV_ITEMS: { view: AppView; label: string }[] = [
  { view: 'home', label: 'Inicio' },
  { view: 'demo', label: 'Demo Kiosco' },
  { view: 'admin', label: 'Dashboard' },
  { view: 'architecture', label: 'Arquitectura' },
];

export default function Header({ currentView, setView, alertsCount, onClearAlerts }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [currentView]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-5 md:px-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 cursor-pointer select-none group"
        onClick={() => setView('home')}
      >
        <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
          <Fingerprint className="w-4 h-4 text-white" weight="fill" />
        </div>
        <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
          FaceAccess
        </span>
        <span className="hidden sm:inline text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mt-0.5">
          Lab
        </span>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-0.5">
        {NAV_ITEMS.map(({ view, label }) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
              currentView === view
                ? 'text-accent-600 dark:text-accent-400'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {label}
            {currentView === view && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent-600 dark:bg-accent-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? <Moon className="w-[18px] h-[18px]" weight="regular" /> : <Sun className="w-[18px] h-[18px]" weight="regular" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all relative"
          >
            <Bell className="w-[18px] h-[18px]" weight="regular" />
            {alertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white dark:ring-zinc-950" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Alertas</span>
                {alertsCount > 0 && (
                  <button onClick={onClearAlerts} className="text-xs text-accent-600 dark:text-accent-400 hover:underline font-medium">
                    Marcar leídas
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {alertsCount > 0 ? (
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex gap-2.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">Intruso Denegado</p>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">Intento de acceso al LAB-02 con 22.8% de similitud.</p>
                      </div>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 flex gap-2.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">Kiosk-042 En Línea</p>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">Terminal conectado y calibrado correctamente.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    Sin alertas activas
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="hidden sm:flex items-center gap-2 pl-2">
          <User className="w-[18px] h-[18px] text-zinc-400 dark:text-zinc-500" weight="regular" />
          <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Operario
          </span>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" weight="regular" /> : <List className="w-5 h-5" weight="regular" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl z-40 flex flex-col p-3 gap-1 md:hidden">
          {NAV_ITEMS.map(({ view, label }) => (
            <button
              key={view}
              onClick={() => { setView(view); setMobileMenuOpen(false); }}
              className={`w-full py-3 px-4 text-left rounded-lg text-sm font-medium transition-all ${
                currentView === view
                  ? 'bg-accent-50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
