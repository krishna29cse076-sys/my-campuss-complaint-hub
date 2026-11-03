import React, { useState } from 'react';
import { ComplaintCategory, ComplaintStatus } from '../types';
import { CATEGORY_WEIGHTS } from '../services/api';
import {
  Calculator,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

const CATEGORIES: ComplaintCategory[] = [
  'Wi-Fi',
  'Hostel',
  'Classroom',
  'Laboratory',
  'Electricity',
  'Cleanliness',
  'Infrastructure',
  'Other',
];

export const PrioritySimulatorWidget: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<ComplaintCategory>('Wi-Fi');
  const [hoursPending, setHoursPending] = useState<number>(48);
  const [status, setStatus] = useState<ComplaintStatus>('Raised');

  const weight = CATEGORY_WEIGHTS[selectedCat] || 1;
  const daysPending = Math.floor(hoursPending / 24);
  const urgencyScore = weight + daysPending;
  const isExcluded = status === 'Resolved';

  return (
    <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-premium space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Interactive Urgency Score & Queue Simulator
            </h3>
            <p className="text-[11px] text-slate-400">
              Live algorithmic test tool based on the Code Crack 3.0 problem statement
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 self-start sm:self-auto">
          Formula: Weight + floor(Hours / 24)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input 1: Category */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            1. Select Category
          </label>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value as ComplaintCategory)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} (Weight: {CATEGORY_WEIGHTS[cat]})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 block font-mono">
            Category Weight = <strong className="text-blue-400">{weight}</strong>
          </span>
        </div>

        {/* Input 2: Hours Pending */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              2. Hours Pending ({hoursPending}h)
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              = {daysPending} full day(s)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="1"
            value={hoursPending}
            onChange={(e) => setHoursPending(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <button onClick={() => setHoursPending(8)} className="hover:text-blue-400">8h (C02)</button>
            <button onClick={() => setHoursPending(24)} className="hover:text-blue-400">24h (C04)</button>
            <button onClick={() => setHoursPending(48)} className="hover:text-blue-400">48h (C01)</button>
            <button onClick={() => setHoursPending(72)} className="hover:text-blue-400">72h (C03)</button>
            <button onClick={() => setHoursPending(96)} className="hover:text-blue-400">96h</button>
          </div>
        </div>

        {/* Input 3: Status */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            3. Current Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Raised">Raised</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <span className="text-[10px] text-slate-400 block font-mono">
            {isExcluded ? (
              <span className="text-rose-400 font-bold">Constraint: Excluded from Priority Queue</span>
            ) : (
              <span className="text-emerald-400 font-semibold">Eligible for Priority Queue</span>
            )}
          </span>
        </div>
      </div>

      {/* Real-time Math Output Card */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Calculation Breakdown:
            </span>
            <span className="font-mono text-xs text-blue-400 font-semibold">
              {weight} (Weight) + floor({hoursPending}/24 = {daysPending}) = {urgencyScore}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isExcluded ? (
              <span className="text-rose-300 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                This ticket has status <strong>Resolved</strong>. As per problem constraints, resolved complaints are strictly excluded from the queue.
              </span>
            ) : (
              <span className="text-emerald-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ticket is active ({status}). Urgency Score is <strong>{urgencyScore}</strong>.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Final Urgency Score</span>
            <span className={`text-2xl font-extrabold font-mono ${isExcluded ? 'text-slate-500 line-through' : 'text-rose-400'}`}>
              {urgencyScore}
            </span>
          </div>

          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${
            isExcluded
              ? 'bg-slate-800 text-slate-400 border-slate-700'
              : urgencyScore >= 4
              ? 'bg-rose-950 text-rose-300 border-rose-800'
              : 'bg-blue-950 text-blue-300 border-blue-800'
          }`}>
            {isExcluded ? 'EXCLUDED' : urgencyScore >= 4 ? 'HIGH PRIORITY' : 'NORMAL'}
          </div>
        </div>
      </div>
    </div>
  );
};

