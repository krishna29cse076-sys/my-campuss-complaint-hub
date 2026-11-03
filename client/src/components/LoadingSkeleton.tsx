import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-28"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
          </div>
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
          <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-md w-full"></div>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

