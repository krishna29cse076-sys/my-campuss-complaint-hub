import React from 'react';
import { Flame, AlertTriangle, ShieldCheck } from 'lucide-react';

interface UrgencyBadgeProps {
  score: number;
  categoryWeight?: number;
  hoursPending?: number;
  showDetails?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  score,
  categoryWeight = 1,
  hoursPending = 0,
  showDetails = false,
}) => {
  const daysPending = Math.floor(hoursPending / 24);

  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let icon = <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />;
  let label = 'Normal';

  if (score >= 5) {
    badgeColor = 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
    icon = <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-400 fill-red-500/20" />;
    label = 'Critical';
  } else if (score >= 3) {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    label = 'Elevated';
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        title={`Urgency: ${score} (Weight ${categoryWeight} + ${daysPending}d pending)`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${badgeColor}`}
      >
        {icon}
        <span>Score {score}</span>
        <span className="text-[10px] font-medium opacity-75 uppercase tracking-wider">({label})</span>
      </span>
      {showDetails && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Weight: {categoryWeight} + Delay: {daysPending}d ({hoursPending}h)
        </span>
      )}
    </div>
  );
};

