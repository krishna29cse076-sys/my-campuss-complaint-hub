import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, sortPriorityQueue, CATEGORY_WEIGHTS } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { PrioritySimulatorWidget } from '../components/PrioritySimulatorWidget';
import { Complaint, ComplaintStatus } from '../types';
import {
  Flame,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Calculator,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const PriorityQueueView: React.FC = () => {
  const {
    complaints,
    refreshComplaints,
    setSelectedComplaint,
    setIsDetailOpen,
    addToast,
  } = useApp();

  // Get strictly sorted priority queue
  const queue = sortPriorityQueue(complaints);
  const top3 = queue.slice(0, 3);
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const handleQuickStatus = async (c: Complaint, nextStatus: ComplaintStatus) => {
    try {
      await api.updateComplaint(c.id, { status: nextStatus });
      await refreshComplaints();
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Complaint #${c.id} updated to ${nextStatus}.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to update status',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white shadow-premium border border-rose-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <Flame className="w-3 h-3 fill-rose-400" />
                SMART PRIORITY QUEUE
              </span>
              <span className="text-xs text-slate-300">Unresolved Escalation Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dynamic Campus Priority Queue
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Unresolved student complaints automatically ranked using an objective urgency algorithm. The longer an issue is pending, the higher it climbs in priority.
            </p>
          </div>

          <button
            onClick={() => refreshComplaints()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition active:scale-95 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalculate Scores
          </button>
        </div>

        {/* Algorithm Formula Card */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-semibold font-mono">
              <Calculator className="w-4 h-4 text-rose-400" />
              Formula: Urgency Score = Category Weight + floor(Hours Pending / 24)
            </div>
            <span className="text-[11px] text-slate-400">
              Only Raised & In-Progress issues are admitted (Resolved strictly excluded)
            </span>
          </div>

          {/* Category Weights Legend */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="text-slate-400 font-medium">Category Weights:</span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-mono font-semibold">
              Wi-Fi = 2
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-mono font-semibold">
              Hostel = 2
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-mono font-semibold">
              Classroom = 1
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-mono font-semibold">
              Laboratory = 3
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              Other categories = 1
            </span>
          </div>
        </div>

        {/* Tie-Breaking Rule Documentation Card */}
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-300 font-bold uppercase tracking-wider text-[11px]">
            <Info className="w-4 h-4 text-blue-400" />
            Official Contest Tie-Breaking Rules & Queue Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
            <div className="p-2.5 rounded-lg bg-blue-900/30 border border-blue-800/40">
              <strong className="text-white block mb-0.5">Rule 1: Highest Urgency Score</strong>
              Complaints with higher numerical urgency scores rank first.
            </div>
            <div className="p-2.5 rounded-lg bg-blue-900/30 border border-blue-800/40">
              <strong className="text-white block mb-0.5">Tie-Breaker 1: Oldest Submission</strong>
              When scores are tied (e.g. C03 vs C01 both score 4), the older ticket ranks higher (C03 at 72h &gt; C01 at 48h).
            </div>
            <div className="p-2.5 rounded-lg bg-blue-900/30 border border-blue-800/40">
              <strong className="text-white block mb-0.5">Constraint: Exclude Resolved</strong>
              Resolved tickets (e.g. C04) are strictly excluded from the queue at all times.
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulator */}
      <PrioritySimulatorWidget />

      {/* TOP 3 HIGHEST PRIORITY COMPLAINTS SPOTLIGHT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Top 3 Highest-Priority Unresolved Complaints
            </h2>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 font-mono">
              Immediate Action Required
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {queue.length} total unresolved in queue
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3.map((c, index) => {
            const rank = index + 1;
            const daysPending = Math.floor(c.hoursPending / 24);

            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedComplaint(c);
                  setIsDetailOpen(true);
                }}
                className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-300/80 dark:border-rose-900/60 shadow-premium hover:shadow-elevated hover:border-rose-500 transition cursor-pointer flex flex-col justify-between gap-4 group"
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-sm">
                      #{rank}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      Complaint ID: {c.id}
                    </span>
                  </div>
                  <UrgencyBadge
                    score={c.urgencyScore}
                    categoryWeight={c.categoryWeight}
                    hoursPending={c.hoursPending}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                    {c.title}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        Waiting Time:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {c.hoursPending} hours ago ({daysPending} days)
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Priority Reason Explanation */}
                  <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/40 text-[11px] text-rose-900 dark:text-rose-200 leading-relaxed">
                    <strong className="block text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 mb-0.5">
                      Reason for Priority:
                    </strong>
                    {c.reason ||
                      `Category impact weight (${c.categoryWeight}) plus elapsed delay factor (+${daysPending} points).`}
                  </div>
                </div>

                {/* Action buttons */}
                <div
                  className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setIsDetailOpen(true);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect
                  </button>

                  {c.status === 'Raised' ? (
                    <button
                      onClick={() => handleQuickStatus(c, 'In Progress')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition active:scale-95"
                    >
                      Assign Tech
                    </button>
                  ) : (
                    <button
                      onClick={() => handleQuickStatus(c, 'Resolved')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition active:scale-95"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL RANKED PRIORITY QUEUE TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete Ranked Priority Queue ({queue.length} Active)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked by: 1. Highest Urgency Score &rarr; 2. Oldest Submission Time &rarr; 3. Higher Category Weight
            </p>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{resolvedCount} complaints</span> resolved and excluded from queue.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-mono">Rank</th>
                <th className="py-3 px-4 font-mono">Complaint ID</th>
                <th className="py-3 px-4">Title & Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Waiting Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Urgency Score</th>
                <th className="py-3 px-4">Priority Reason</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {queue.map((c, idx) => (
                <tr
                  key={c.id}
                  onClick={() => {
                    setSelectedComplaint(c);
                    setIsDetailOpen(true);
                  }}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition ${
                    idx < 3 ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    #{c.id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-semibold text-slate-900 dark:text-white block truncate">
                      {c.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                      {c.location}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.hoursPending}h
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({Math.floor(c.hoursPending / 24)} days)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <UrgencyBadge
                      score={c.urgencyScore}
                      categoryWeight={c.categoryWeight}
                      hoursPending={c.hoursPending}
                    />
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {c.reason}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setIsDetailOpen(true);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

