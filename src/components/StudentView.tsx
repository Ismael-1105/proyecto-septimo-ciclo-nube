import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, House, CheckCircle, WarningOctagon,
  Lock, LockOpen, Printer, Camera, Fingerprint
} from '@phosphor-icons/react';
import { StudentViewType, Student, AccessLog } from '../types.ts';
import StudentProfile from './StudentProfile.tsx';

interface StudentViewProps {
  students: Student[];
  logs: AccessLog[];
  onAddLog: (log: AccessLog) => void;
  incrementStats: (isAllowed: boolean) => void;
  onBackToLanding: () => void;
}

function pickRandomStudent(students: Student[]): Student {
  const idx = Math.floor(Math.random() * students.length);
  return students[idx];
}

export default function StudentView({ students, logs, onAddLog, incrementStats, onBackToLanding }: StudentViewProps) {
  const [activeView, setActiveView] = useState<StudentViewType>('kiosk');
  const [scannedStudent, setScannedStudent] = useState<Student>(() => pickRandomStudent(students));

  const [flowState, setFlowState] = useState<'idle' | 'scanning' | 'processing' | 'result'>('idle');
  const [globalProgress, setGlobalProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [simulatedMatchPct, setSimulatedMatchPct] = useState(scannedStudent.matchPercentage);
  const [lockCountdown, setLockCountdown] = useState(10);
  const [activeDots, setActiveDots] = useState<{ x: number; y: number }[]>([]);
  const [autoScanCountdown, setAutoScanCountdown] = useState(3);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    stopWebcam();
    return () => { stopWebcam(); };
  }, []);

  const startScan = useCallback(() => {
    const newStudent = pickRandomStudent(students);
    setScannedStudent(newStudent);
    setSimulatedMatchPct(newStudent.matchPercentage);
    setFlowState('scanning');
    setGlobalProgress(0);
    setCurrentStepIndex(0);
    setAutoScanCountdown(3);
  }, [students]);

  useEffect(() => {
    if (flowState === 'idle') {
      setAutoScanCountdown(3);
      countdownTimerRef.current = setInterval(() => {
        setAutoScanCountdown(prev => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      idleTimerRef.current = setTimeout(() => {
        startScan();
      }, 3200);
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    }
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [flowState, startScan]);

  useEffect(() => {
    if (flowState === 'scanning' || flowState === 'processing') {
      const interval = setInterval(() => {
        const dots = Array.from({ length: 6 }).map(() => ({
          x: Math.floor(Math.random() * 80) + 10,
          y: Math.floor(Math.random() * 80) + 10
        }));
        setActiveDots(dots);
      }, 900);
      return () => clearInterval(interval);
    } else {
      setActiveDots([]);
    }
  }, [flowState]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (flowState === 'scanning') {
      if (scannedStudent.status === 'denied') {
        setSimulatedMatchPct(22.8);
      } else {
        const dev = parseFloat((Math.random() * 0.9).toFixed(1));
        setSimulatedMatchPct(parseFloat((scannedStudent.matchPercentage - dev).toFixed(1)));
      }
      timer = setTimeout(() => {
        setFlowState('processing');
        setGlobalProgress(25);
        setCurrentStepIndex(0);
      }, 2200);
    } else if (flowState === 'processing') {
      const interval = setInterval(() => {
        setGlobalProgress(prev => {
          const nextVal = prev + Math.floor(Math.random() * 6) + 3;
          if (nextVal >= 100) {
            clearInterval(interval);
            setFlowState('result');
            setLockCountdown(10);

            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            const h = pad(now.getHours());
            const m = pad(now.getMinutes());
            const s = pad(now.getSeconds());

            const isAllowed = scannedStudent.status === 'allowed';
            const similarityScore = isAllowed ? simulatedMatchPct : 22.8;

            const newLog: AccessLog = {
              id: 'log-' + Math.random().toString(36).substr(2, 9),
              studentId: scannedStudent.id,
              studentName: isAllowed ? scannedStudent.name : 'Unknown Person',
              avatarInitials: scannedStudent.avatarInitials,
              date: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
              time: `${h}:${m}:${s}`,
              result: isAllowed ? 'Permitido' : 'Denegado',
              similarity: parseFloat(similarityScore.toFixed(1))
            };

            onAddLog(newLog);
            incrementStats(isAllowed);

            if (isAllowed) {
              setTimeout(() => {
                setActiveView('profile');
              }, 2500);
            }

            return 100;
          }
          if (nextVal >= 80) setCurrentStepIndex(3);
          else if (nextVal >= 60) setCurrentStepIndex(2);
          else if (nextVal >= 40) setCurrentStepIndex(1);
          return nextVal;
        });
      }, 180);
      return () => clearInterval(interval);
    }
    return () => clearTimeout(timer);
  }, [flowState]);

  useEffect(() => {
    let countdownTimer: ReturnType<typeof setTimeout>;
    if (flowState === 'result' && lockCountdown > 0) {
      countdownTimer = setTimeout(() => { setLockCountdown(prev => prev - 1); }, 1000);
    }
    return () => clearTimeout(countdownTimer);
  }, [flowState, lockCountdown]);

  const handlePrintReceipt = () => {
    const text = `
=============================================
         FACACCESS LAB ENTRY RECIPE
=============================================
Dispositivo: Terminal Kiosk #042
Ubicacion: Edificio de Computacion, Lab-02
Servidor Cloud: AWS Virginia (us-east-1)
Fecha: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
Resultados:
  - Estudiante: ${scannedStudent.name}
  - Especialidad: ${scannedStudent.career}
  - Coincidencia Biometrica: ${scannedStudent.status === 'allowed' ? simulatedMatchPct : '22.8'}%
  - Estado Cerradura: DESBLOQUEADA
=============================================
MANTENGA LA SEGURIDAD DEL CAMPUS EN TODO MOMENTO!
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FaceAccess_Recibo_${scannedStudent.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (activeView === 'profile') {
    const studentLogs = logs.filter(l => l.studentId === scannedStudent.id);
    return (
      <StudentProfile
        student={scannedStudent}
        logs={studentLogs}
        onBack={() => setActiveView('kiosk')}
        onBackToLanding={onBackToLanding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" weight="regular" />
          Salir del Kiosco
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center">
            <Fingerprint className="w-3.5 h-3.5 text-white" weight="fill" />
          </div>
          <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">FaceAccess Lab</span>
        </div>
        <div className="w-20" />
      </div>

      {/* Main terminal */}
      <main className="flex-grow flex items-center justify-center p-5 md:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch">

          {/* LEFT: Camera view */}
          <div className="md:col-span-7 flex flex-col">
            <div className="relative bg-zinc-900 rounded-2xl overflow-hidden flex-1 min-h-[360px] md:min-h-[440px] border border-zinc-800 shadow-2xl flex flex-col justify-between">
              <div className="absolute inset-0 z-0">
                {flowState === 'idle' ? (
                  <div className="w-full h-full relative">
                    <img
                      className="w-full h-full object-cover opacity-40 filter blur-[1px]"
                      alt="Lab corridor camera feed"
                      src="/images/camera-feed-bg.jpg"
                      onError={(e) => { e.currentTarget.src = '/images/camera-feed-bg.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-accent-950/10 mix-blend-color" />
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <img
                      className="w-full h-full object-cover opacity-75"
                      alt="Student biometric scanning"
                      src={scannedStudent.photoUrl}
                      onError={(e) => { e.currentTarget.src = '/images/camera-feed-bg.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent" />
                  </div>
                )}
              </div>

              {/* HUD overlays */}
              <div className="relative z-10 p-5 flex flex-col justify-between h-full pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="bg-zinc-950/90 text-white text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-lg uppercase backdrop-blur">
                      Feed Real-Time // 001
                    </span>
                    <span className="bg-zinc-900/80 text-[9px] text-zinc-400 font-mono px-2.5 py-1 rounded-lg backdrop-blur border border-zinc-800/50">
                      ISO: 400 | SHUTTER: 1/120 | LENS: F1.8
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 text-[9px] text-accent-400 font-mono px-3 py-1 rounded-lg backdrop-blur border border-zinc-800/50">
                    SIM_NODE_K042
                  </div>
                </div>

                {(flowState === 'scanning' || flowState === 'processing') && (
                  <div className="self-center relative w-48 h-56 rounded-xl flex items-center justify-center">
                    <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl" />
                    <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr" />
                    <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl" />
                    <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br" />
                    <img
                      src="/images/scan-demo-profile.jpg"
                      alt="Escaneo facial"
                      className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-60"
                      onError={(e) => { e.currentTarget.src = '/images/camera-feed-bg.jpg'; }}
                    />
                    {activeDots.map((dot, index) => (
                      <span
                        key={index}
                        style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                        className="absolute w-1 h-1 bg-accent-300 rounded-full animate-ping"
                      />
                    ))}
                    <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase z-10">
                      Deteccion Activa
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <div className="bg-zinc-950/95 px-4 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur">
                    <span className={`w-2 h-2 rounded-full ${flowState !== 'idle' ? 'bg-accent-400 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-white text-[10px] tracking-wider font-mono uppercase">
                      {flowState === 'idle' && 'BIOMETRIC SENSOR LISTO'}
                      {flowState === 'scanning' && 'ESCANER PREPARADO'}
                      {flowState === 'processing' && 'EXTRAYENDO ATRIBUTOS...'}
                      {flowState === 'result' && 'PROCESAMIENTO COMPLETADO'}
                    </span>
                  </div>
                  {flowState === 'processing' && (
                    <div className="bg-zinc-950/90 px-3 py-1.5 rounded-lg backdrop-blur">
                      <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider">Similitud:</span>
                      <p className="text-xs text-green-400 font-mono font-bold">
                        {scannedStudent.status === 'allowed' ? simulatedMatchPct : '22.8'}% match
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Status panel */}
          <div className="md:col-span-5 flex flex-col gap-5">
            {flowState !== 'result' ? (
              <div className="flex flex-col gap-5 h-full justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg uppercase font-semibold inline-block">
                    Estado de verificacion
                  </span>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-3">
                    {flowState === 'idle' ? 'Kiosco de Acceso' : 'Procesando Biometria'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1.5">
                    Coloquese frente a la camara para verificar su identidad.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex-grow flex flex-col justify-center gap-4">
                  <div className={`flex gap-3 items-start ${flowState === 'idle' ? 'opacity-30' : ''}`}>
                    <div className="flex flex-col items-center mt-0.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                        flowState === 'scanning' ? 'bg-accent-600 text-white border-accent-600 animate-spin' :
                        flowState === 'processing' && globalProgress > 25 ? 'bg-green-600 text-white border-green-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {flowState === 'processing' && globalProgress > 25 ? '\u2713' : '1'}
                      </div>
                      <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mt-1" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Detectando rostro</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {flowState === 'idle' && 'Esperando...'}
                        {flowState === 'scanning' && 'En progreso...'}
                        {flowState === 'processing' && globalProgress <= 25 && 'Buscando orbita ocular...'}
                        {flowState === 'processing' && globalProgress > 25 && 'Rostro localizado.'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex gap-3 items-start ${globalProgress < 40 ? 'opacity-30' : ''}`}>
                    <div className="flex flex-col items-center mt-0.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                        flowState === 'processing' && currentStepIndex === 1 ? 'bg-accent-600 text-white border-accent-600' :
                        flowState === 'processing' && globalProgress > 53 ? 'bg-green-600 text-white border-green-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {globalProgress > 53 ? '\u2713' : '2'}
                      </div>
                      <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mt-1" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Deteccion de vivacidad</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {globalProgress < 40 && 'Esperando...'}
                        {flowState === 'processing' && currentStepIndex === 1 && 'Examinando micro-reflejos...'}
                        {globalProgress > 53 && 'Sujeto vivo verificado.'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex gap-3 items-start ${globalProgress < 60 ? 'opacity-30' : ''}`}>
                    <div className="flex flex-col items-center mt-0.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                        flowState === 'processing' && currentStepIndex === 2 ? 'bg-accent-600 text-white border-accent-600' :
                        flowState === 'processing' && globalProgress > 78 ? 'bg-green-600 text-white border-green-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {globalProgress > 78 ? '\u2713' : '3'}
                      </div>
                      <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mt-1" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Comparacion biometrica</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {globalProgress < 60 && 'Esperando...'}
                        {flowState === 'processing' && currentStepIndex === 2 && 'Mapeando rasgos faciales...'}
                        {globalProgress > 78 && 'Base de datos contrastada.'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex gap-3 items-start ${globalProgress < 80 ? 'opacity-30' : ''}`}>
                    <div className="flex flex-col items-center mt-0.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                        flowState === 'processing' && currentStepIndex === 3 ? 'bg-accent-600 text-white border-accent-600' :
                        globalProgress >= 100 ? 'bg-green-600 text-white border-green-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {globalProgress >= 100 ? '\u2713' : '4'}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Permisos y horarios</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {globalProgress < 80 && 'Esperando...'}
                        {flowState === 'processing' && currentStepIndex === 3 && 'Validando credencial...'}
                        {globalProgress >= 100 && 'Permiso academico concedido.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase font-mono">Progreso</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">{globalProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-600 transition-all duration-150 ease-out rounded-full"
                      style={{ width: `${globalProgress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    {flowState === 'idle' && (
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-accent-500 animate-pulse" weight="regular" />
                          Detectando en {autoScanCountdown}s...
                        </span>
                        <button
                          onClick={() => startScan()}
                          className="bg-accent-600 hover:bg-accent-700 text-white font-semibold py-2.5 px-5 rounded-lg text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
                        >
                          Escanear ahora
                        </button>
                      </div>
                    )}
                    {flowState !== 'idle' && (
                      <button
                        onClick={() => { setFlowState('idle'); setGlobalProgress(0); setCurrentStepIndex(0); }}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
                      >
                        Abortar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full justify-between">
                {scannedStudent.status === 'allowed' ? (
                  <div className="bg-green-600 text-white px-5 py-6 text-center select-none">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-white" weight="fill" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Acceso Concedido</h3>
                    <p className="text-[11px] opacity-80 mt-1 uppercase tracking-widest font-mono">Identidad Verificada</p>
                    <p className="text-[10px] opacity-60 mt-3 font-mono">Redirigiendo a tu panel...</p>
                  </div>
                ) : (
                  <div className="bg-red-600 text-white px-5 py-6 text-center select-none">
                    <div className="w-14 h-14 bg-white/40 rounded-full flex items-center justify-center mx-auto mb-3">
                      <WarningOctagon className="w-8 h-8 text-white" weight="fill" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Acceso Denegado</h3>
                    <p className="text-[11px] opacity-80 mt-1 uppercase tracking-widest font-mono">Rostro No Identificado</p>
                  </div>
                )}

                <div className="p-5 flex-grow flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                    <div className="flex flex-col items-center">
                      <div className={`w-28 h-28 rounded-xl border-2 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative ${scannedStudent.status === 'allowed' ? 'border-green-500' : 'border-red-500'}`}>
                        <img
                          className="w-full h-full object-cover"
                          alt={scannedStudent.name}
                          src={scannedStudent.photoUrl}
                          onError={(e) => { e.currentTarget.src = '/images/camera-feed-bg.jpg'; }}
                        />
                        <span className="absolute text-4xl font-bold text-zinc-400 dark:text-zinc-500">{scannedStudent.avatarInitials}</span>
                      </div>
                      <span className={`mt-2.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        scannedStudent.status === 'allowed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        Match: {scannedStudent.status === 'allowed' ? simulatedMatchPct : '22.8'}%
                      </span>
                    </div>

                    <div className="flex-grow text-left space-y-3.5 pl-0 sm:pl-4">
                      <div>
                        <span className="text-[9px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 block font-bold uppercase">Estudiante</span>
                        <p className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">{scannedStudent.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[9px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 block font-bold uppercase">Carrera</span>
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{scannedStudent.career}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 block font-bold uppercase">Laboratorio</span>
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{scannedStudent.lab}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {scannedStudent.status === 'allowed' ? (
                            <>
                              <LockOpen className="w-5 h-5 text-green-600 dark:text-green-400" weight="fill" />
                              <div>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 tracking-wider font-mono uppercase font-bold block">Perno</span>
                                <span className="text-xs font-bold text-green-700 dark:text-green-400">Desbloqueado</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" weight="fill" />
                              <div>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 tracking-wider font-mono uppercase font-bold block">Perno</span>
                                <span className="text-xs font-bold text-red-700 dark:text-red-400">Bloqueado</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${scannedStudent.status === 'allowed' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                          <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Sistema Activo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700 px-5 py-3.5 flex justify-between items-center gap-2">
                  <button
                    onClick={handlePrintReceipt}
                    className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" weight="regular" />
                    Bajar Recibo
                  </button>
                  {scannedStudent.status === 'denied' && (
                    <button
                      onClick={() => { setFlowState('idle'); setGlobalProgress(0); setCurrentStepIndex(0); }}
                      className="bg-accent-600 hover:bg-accent-700 text-white font-semibold py-2.5 px-5 text-xs uppercase tracking-wider rounded-lg active:scale-[0.98] transition-all"
                    >
                      Nuevo Intento
                    </button>
                  )}
                </div>

                {scannedStudent.status === 'allowed' && (
                  <div className="bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-400 py-2 px-4 text-center text-[10px] font-mono font-medium">
                    Acceso registrado. Abriendo tu panel personal...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
