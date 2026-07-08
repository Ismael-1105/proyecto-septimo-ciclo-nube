/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import Header from './components/Header.tsx';
import HomeView from './components/HomeView.tsx';
import AdminView from './components/AdminView.tsx';
import LoginView from './LoginView.tsx';
import ForgotPasswordView from './ForgotPasswordView.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import StudentKioskView from './components/StudentView.tsx';
import { Student, AccessLog, AuthUser } from './types.ts';
import { INITIAL_STUDENTS, INITIAL_LOGS, DAILY_STATS } from './data.ts';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showStudentKiosk, setShowStudentKiosk] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleLogin = (authUser: AuthUser) => {
    setUser(authUser);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <SplashScreen />
      </ThemeContext.Provider>
    );
  }

  if (showStudentKiosk) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <StudentKioskView
          students={students}
          logs={logs}
          onAddLog={handleAddLog}
          incrementStats={handleIncrementStats}
          onBackToLanding={() => setShowStudentKiosk(false)}
        />
      </ThemeContext.Provider>
    );
  }

  if (showForgotPassword) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ForgotPasswordView onBackToLogin={() => setShowForgotPassword(false)} />
      </ThemeContext.Provider>
    );
  }

  if (showLogin) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <LoginView onLogin={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} />
      </ThemeContext.Provider>
    );
  }

  if (user) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
          onLogout={handleLogout}
        />
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen flex flex-col font-sans antialiased bg-surface dark:bg-zinc-950 text-text-primary dark:text-zinc-100 transition-colors duration-300">
        <Header
          onLoginClick={() => setShowLogin(true)}
          onStudentKioskClick={() => setShowStudentKiosk(true)}
        />
        <div className="flex-grow">
          <HomeView
            onLoginClick={() => setShowLogin(true)}
            onStudentKioskClick={() => setShowStudentKiosk(true)}
          />
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
