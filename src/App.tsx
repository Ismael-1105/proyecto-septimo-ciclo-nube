import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.tsx';
import Layout from './Layout.tsx';
import HomeView from './components/HomeView.tsx';
import AdminView from './components/AdminView.tsx';
import LoginView from './LoginView.tsx';
import ForgotPasswordView from './ForgotPasswordView.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import StudentKioskView from './components/StudentView.tsx';
import DemoView from './components/DemoView.tsx';
import ArchitectureView from './components/ArchitectureView.tsx';
import CameraPermissionGate from './components/CameraPermissionGate.tsx';

function KioskGuard() {
  const { hasCameraPermission, setHasCameraPermission, setShowPermissionGate, showPermissionGate, logs, students, handleAddLog, handleIncrementStats } = useApp();

  if (showPermissionGate) {
    return (
      <CameraPermissionGate
        onProceed={() => {
          setShowPermissionGate(false);
          setHasCameraPermission(true);
        }}
        onCancel={() => setShowPermissionGate(false)}
      />
    );
  }

  return (
    <StudentKioskView
      students={students}
      logs={logs}
      onAddLog={handleAddLog}
      incrementStats={handleIncrementStats}
      onBackToLanding={() => window.history.back()}
      hasCameraPermission={hasCameraPermission}
    />
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) {
    return (
      <div className="pt-20 p-8 text-center">
        <p className="text-zinc-500">Debes iniciar sesión para acceder.</p>
      </div>
    );
  }
  return <>{children}</>;
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { setShowPermissionGate } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeView />} />
        <Route
          path="kiosco"
          element={<KioskGuard />}
        />
        <Route
          path="login"
          element={<LoginView />}
        />
        <Route
          path="recuperar"
          element={<ForgotPasswordView />}
        />
        <Route
          path="docente"
          element={
            <ProtectedRoute>
              <AdminView />
            </ProtectedRoute>
          }
        />
        <Route
          path="docente/demo"
          element={
            <ProtectedRoute>
              <DemoView />
            </ProtectedRoute>
          }
        />
        <Route
          path="docente/arquitectura"
          element={
            <ProtectedRoute>
              <ArchitectureView />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
