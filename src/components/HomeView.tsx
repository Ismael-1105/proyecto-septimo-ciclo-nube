/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, Lightning, Crosshair, Cloud,
  DeviceMobile, Cpu, Key, Database, ShieldWarning, CheckCircle, X
} from '@phosphor-icons/react';
import { AppView } from '../types.ts';

interface HomeViewProps {
  setView: (view: AppView) => void;
}

const FLOW_STEPS = [
  { num: 1, title: 'Captura', subtitle: 'Kiosco local', desc: 'El terminal captura la imagen del alumno optimizando iluminación y enfoque para evitar falsos negativos.', icon: DeviceMobile, accent: 'from-accent-500 to-accent-600' },
  { num: 2, title: 'Gateway', subtitle: 'API segura', desc: 'AWS API Gateway canaliza la petición cifrada mediante TLS 1.3 protegiendo la red del campus.', icon: Key, accent: 'from-zinc-600 to-zinc-700' },
  { num: 3, title: 'Lambda', subtitle: 'Serverless', desc: 'AWS Lambda orquesta el procesamiento de firmas faciales de forma instantánea sin servidores.', icon: Cpu, accent: 'from-zinc-600 to-zinc-700' },
  { num: 4, title: 'Rekognition', subtitle: 'IA biométrica', desc: 'Amazon Rekognition compara la biometría activa contra el banco de datos en menos de 500 ms.', icon: Crosshair, accent: 'from-zinc-600 to-zinc-700' },
  { num: 5, title: 'DynamoDB', subtitle: 'NoSQL veloz', desc: 'DynamoDB almacena y consulta registros y permisos del alumno garantizando accesos inmediatos.', icon: Database, accent: 'from-zinc-600 to-zinc-700' },
  { num: 6, title: 'Acceso', subtitle: 'Relé activado', desc: 'Un token seguro activa la cerradura electromagnética del laboratorio liberando el cerrojo.', icon: Lightning, accent: 'from-accent-500 to-accent-600' },
];

export default function HomeView({ setView }: HomeViewProps) {
  const [selectedFlowIndex, setSelectedFlowIndex] = useState<number | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditFormData, setAuditFormData] = useState({ contacto: '', email: '', institucion: '', laboratorios: '1-5', notas: '' });
  const [auditSubmitted, setAuditSubmitted] = useState(false);

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditFormData.contacto || !auditFormData.email || !auditFormData.institucion) return;
    setAuditSubmitted(true);
    setTimeout(() => {
      setAuditSubmitted(false);
      setAuditModalOpen(false);
      setAuditFormData({ contacto: '', email: '', institucion: '', laboratorios: '1-5', notas: '' });
    }, 3000);
  };

  return (
    <main className="pt-16">
      {/* HERO - Asymmetric split layout */}
      <section className="relative min-h-[calc(100dvh-64px)] flex items-center overflow-hidden bg-surface dark:bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.06),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_30%_50%,black_30%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10 py-16 md:py-20">
          {/* Left content */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/50 text-accent-700 dark:text-accent-300 text-[11px] font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                Enterprise Cloud Security
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white leading-[1.05] tracking-tight"
            >
              Control de acceso biométrico para tu laboratorio
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed"
            >
              Reconocimiento facial con validación cloud serverless. Implementación de grado industrial para universidades que exigen seguridad real.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => setView('demo')}
                className="inline-flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 active:scale-[0.98] text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/20 dark:shadow-accent-500/10"
              >
                Iniciar demo interactiva
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
              <button
                onClick={() => setView('architecture')}
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.98] text-zinc-700 dark:text-zinc-300 font-semibold px-6 py-3.5 rounded-xl text-sm transition-all"
              >
                Ver arquitectura cloud
              </button>
            </motion.div>
          </div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 aspect-[4/3] bg-zinc-900">
              <img
                className="w-full h-full object-cover opacity-80"
                alt="Facial recognition scanning"
                src="/images/home-hero-preview.jpg"
                onError={(e) => { e.currentTarget.src = '/images/camera-feed-bg.jpg'; }}
              />

              {/* Scanning line animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-0 w-full h-[2px] bg-accent-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] opacity-70 z-10"
                />
              </div>

              {/* HUD overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-5 flex justify-between items-end">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse ring-2 ring-green-500/30" />
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase">Video Feed</p>
                    <p className="text-[11px] text-white font-mono font-medium">CAM_LAB02 // ACTIVO</p>
                  </div>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur px-3 py-1 rounded-lg border border-zinc-700/50">
                  <span className="text-[9px] font-mono text-accent-400 font-medium">SIM_NODE_042</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features - Bento grid layout */}
      <section className="py-24 md:py-32 px-6 md:px-10 bg-white dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Tecnología que protege cada acceso
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - with accent gradient bg */}
            <div className="relative group rounded-2xl bg-accent-600 p-8 flex flex-col justify-between min-h-[280px] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-5">
                  <Lightning className="w-5 h-5 text-white" weight="fill" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">Validación en tiempo real</h3>
                <p className="text-sm text-white/80 leading-relaxed max-w-xs">
                  Reconocimiento facial en menos de 500 ms con algoritmos optimizados localmente en el terminal de acceso.
                </p>
              </div>
            </div>

            {/* Card 2 - subtle bg */}
            <div className="group rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-11 h-11 rounded-xl bg-accent-50 dark:bg-accent-950/40 flex items-center justify-center mb-5">
                  <ShieldWarning className="w-5 h-5 text-accent-600 dark:text-accent-400" weight="regular" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Anti-suplantación</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                  Detección de vivacidad de última generación para evitar fraudes con fotografías o videos en pantalla.
                </p>
              </div>
            </div>

            {/* Card 3 - subtle bg */}
            <div className="group rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-11 h-11 rounded-xl bg-accent-50 dark:bg-accent-950/40 flex items-center justify-center mb-5">
                  <Cloud className="w-5 h-5 text-accent-600 dark:text-accent-400" weight="regular" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Escalabilidad AWS</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                  Arquitectura totalmente serverless que escala automáticamente durante las horas pico del campus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Steps - Interactive pipeline */}
      <section className="py-24 md:py-32 px-6 md:px-10 bg-surface dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
              Flujo de funcionamiento
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Seis fases que transfieren y autentican los metadatos biométricos del alumno en la nube.
            </p>
          </div>

          {/* Pipeline grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
            {FLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = selectedFlowIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFlowIndex(isSelected ? null : idx)}
                  className={`group relative p-5 rounded-xl border text-left transition-all duration-300 ${
                    isSelected
                      ? 'bg-accent-600 border-accent-600 shadow-lg shadow-accent-500/20 -translate-y-1'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                    isSelected ? 'bg-white/20' : 'bg-accent-50 dark:bg-accent-950/30'
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-accent-600 dark:text-accent-400'}`} weight={isSelected ? 'fill' : 'regular'} />
                  </div>
                  <span className={`block text-[10px] font-mono font-bold tracking-wider uppercase mb-1 ${isSelected ? 'text-white/70' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    Fase {step.num}
                  </span>
                  <p className={`text-sm font-bold tracking-tight ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {step.title}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/60' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {step.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="min-h-[72px]">
            <AnimatePresence mode="wait">
              {selectedFlowIndex === null ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-8 px-6 text-center"
                >
                  <p className="text-xs font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-medium">
                    Selecciona una fase para ver el detalle técnico
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedFlowIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-white dark:bg-zinc-900 border-l-[3px] border-accent-600 rounded-r-xl p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {FLOW_STEPS[selectedFlowIndex].num}
                    </span>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {FLOW_STEPS[selectedFlowIndex].title} &mdash; {FLOW_STEPS[selectedFlowIndex].subtitle}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mt-1 max-w-2xl">
                        {FLOW_STEPS[selectedFlowIndex].desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFlowIndex(null)}
                    className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold uppercase tracking-wider flex-shrink-0"
                  >
                    Cerrar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA - Split layout */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-accent-600 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />
            <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-lg">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                  ¿Listo para modernizar tu laboratorio?
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  Análisis gratuito de viabilidad, simulación de tráfico y cotización de hardware biométrico para tu universidad.
                </p>
              </div>
              <button
                onClick={() => setAuditModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-accent-700 hover:bg-zinc-50 active:scale-[0.98] font-bold px-6 py-3.5 rounded-xl text-sm transition-all flex-shrink-0"
              >
                Solicitar auditoría sin costo
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Modal */}
      {auditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl p-6 relative"
          >
            <button
              onClick={() => setAuditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" weight="regular" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mb-1.5">Solicitar evaluación biométrica</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Complete el formulario para recibir un plan de integración personalizado.
            </p>

            {auditSubmitted ? (
              <div className="py-10 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" weight="fill" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Solicitud recibida</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                    Su petición ha sido cargada. Nos comunicaremos a la brevedad.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuditSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    value={auditFormData.contacto}
                    onChange={(e) => setAuditFormData({ ...auditFormData, contacto: e.target.value })}
                    required
                    placeholder="Ej. Ismael González"
                    className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Email institucional</label>
                  <input
                    type="email"
                    value={auditFormData.email}
                    onChange={(e) => setAuditFormData({ ...auditFormData, email: e.target.value })}
                    required
                    placeholder="Ej. email@universidad.edu"
                    className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Institución</label>
                  <input
                    type="text"
                    value={auditFormData.institucion}
                    onChange={(e) => setAuditFormData({ ...auditFormData, institucion: e.target.value })}
                    required
                    placeholder="Ej. Instituto Politécnico de Sistemas"
                    className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Laboratorios a asegurar</label>
                  <select
                    value={auditFormData.laboratorios}
                    onChange={(e) => setAuditFormData({ ...auditFormData, laboratorios: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  >
                    <option value="1-5">De 1 a 5 laboratorios</option>
                    <option value="6-20">De 6 a 20 laboratorios</option>
                    <option value="20+">Más de 20 (Campus completo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Notas adicionales</label>
                  <textarea
                    value={auditFormData.notas}
                    onChange={(e) => setAuditFormData({ ...auditFormData, notas: e.target.value })}
                    placeholder="Ej. Deseo control de acceso con cerraduras electromagnéticas."
                    rows={2}
                    className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none resize-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
                >
                  Enviar petición de auditoría
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </main>
  );
}
