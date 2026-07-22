import React from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-16 px-4 flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-zinc-300 dark:text-zinc-600" weight="regular" />
      </div>
      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h4>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 max-w-xs leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
