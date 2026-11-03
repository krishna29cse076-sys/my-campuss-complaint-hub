import React from 'react';
import { ComplaintStatus } from '../types';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  if (status === 'Raised') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50 ${sizeClasses[size]}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <AlertCircle className="w-3.5 h-3.5" />
        Raised
      </span>
    );
  }

  if (status === 'In Progress') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50 ${sizeClasses[size]}`}
      >
        <Clock className="w-3.5 h-3.5 animate-spin-slow text-amber-600 dark:text-amber-400" />
        In Progress
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50 ${sizeClasses[size]}`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      Resolved
    </span>
  );
};

