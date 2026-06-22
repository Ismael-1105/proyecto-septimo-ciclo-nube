/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import Header from './components/Header.tsx';
import HomeView from './components/HomeView.tsx';
import DemoView from './components/DemoView.tsx';
import AdminView from './components/AdminView.tsx';
import ArchitectureView from './components/ArchitectureView.tsx';
import { AppView, Student, AccessLog } from './types.ts';
import { INITIAL_STUDENTS, INITIAL_LOGS, DAILY_STATS } from './data.ts';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [currentView, setView] = useState<AppView>('home');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.classList.toggle('light', next === 'light');
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, []);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [logs, setLogs] = useState<AccessLog[]>(INITIAL_LOGS);

  const [stats, setStats] = useState({
    registered: DAILY_STATS.registered,
    accessesToday: DAILY_STATS.accessesToday,
    deniedToday: DAILY_STATS.deniedToday,
    alertsActive: DAILY_STATS.alertsActive
  });

  const handleToggleStudent = (id: string) => {
    setStudents(prev =>
      prev.map(student => {
        if (student.id === id) {
          const nextStatus = student.status === 'allowed' ? 'denied' : 'allowed';
          return { ...student, status: nextStatus };
        }
        return student;
      })
    );
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
    setStats(prev => ({ ...prev, registered: prev.registered + 1 }));
  };

  const handleAddLog = (newLog: AccessLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  const handleIncrementStats = (isAllowed: boolean) => {
    setStats(prev => ({
      ...prev,
      accessesToday: prev.accessesToday + 1,
      deniedToday: isAllowed ? prev.deniedToday : prev.deniedToday + 1,
      alertsActive: isAllowed ? prev.alertsActive : prev.alertsActive + 1
    }));
  };

  const handleClearAlerts = () => {
    setStats(prev => ({ ...prev, alertsActive: 0 }));
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen flex flex-col font-sans antialiased bg-surface dark:bg-zinc-950 text-text-primary dark:text-zinc-100 transition-colors duration-300">
        <Header
          currentView={currentView}
          setView={setView}
          logsCount={logs.length}
          alertsCount={stats.alertsActive}
          onClearAlerts={handleClearAlerts}
        />
        <div className="flex-grow">
          {currentView === 'home' && <HomeView setView={setView} />}
          {currentView === 'demo' && (
            <DemoView
              students={students}
              onAddLog={handleAddLog}
              incrementStats={handleIncrementStats}
            />
          )}
          {currentView === 'admin' && (
            <AdminView
              students={students}
              logs={logs}
              registeredCount={stats.registered}
              accessesToday={stats.accessesToday}
              deniedToday={stats.deniedToday}
              alertsActive={stats.alertsActive}
              onToggleStudent={handleToggleStudent}
              onAddStudent={handleAddStudent}
              onClearLogs={handleClearLogs}
            />
          )}
          {currentView === 'architecture' && <ArchitectureView />}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
