import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { EmptyState } from '../components/EmptyState';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    complaints,
    currentUser,
    setActiveTab,
    setSelectedComplaint,
    setIsDetailOpen,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Filter complaints filed by this student (or matching roll / Alex Rivera for demo)
  const myComplaints = complaints.filter(
    (c) =>
      c.studentEmail === currentUser.email ||
      c.studentName.toLowerCase().includes('alex') ||
      c.studentRoll === currentUser.roll
  );

  const totalSubmitted = myComplaints.length;
  const pendingCount = myComplaints.filter((c) => c.status === 'Raised').length;
  const inProgressCount = myComplaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved').length;

  const filteredList = myComplaints.filter((c) => {
    if (filterCategory !== 'All' && c.category !== filterCategory) return false;
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Submit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-premium">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 inline-block font-mono">
            STUDENT DASHBOARD
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-blue-200 max-w-lg">
            Track your campus maintenance requests in real-time. Our AI assistant analyzes every ticket for expedited facility resolution.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('submit')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs shadow-lg transition active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Submit New Complaint
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submitted */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Submitted
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {totalSubmitted}
          </div>
          <span className="text-[11px] text-slate-400">Total campus reports logged</span>
        </div>

        {/* Pending (Raised) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Pending Complaints
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
            {pendingCount}
          </div>
          <span className="text-[11px] text-slate-400">Awaiting admin review</span>
        </div>

        {/* In Progress */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              In-Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {inProgressCount}
          </div>
          <span className="text-[11px] text-slate-400">Maintenance assigned</span>
        </div>

        {/* Resolved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Resolved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {resolvedCount}
          </div>
          <span className="text-[11px] text-slate-400">Issues fully fixed</span>
        </div>
      </div>

      {/* Complaints List & Activity Overview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              My Campus Complaints & Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review current status, waiting time, and administrator updates.
            </p>
          </div>

          {/* Category & Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Hostel">Hostel</option>
              <option value="Classroom">Classroom</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Electricity">Electricity</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Raised">Raised</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints Cards / Feed */}
        {filteredList.length > 0 ? (
          <div className="space-y-3">
            {filteredList.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedComplaint(c);
                  setIsDetailOpen(true);
                }}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      #{c.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                    {c.urgencyScore >= 4 && c.status !== 'Resolved' && (
                      <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-rose-500/20" />
                        Urgent
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition">
                    {c.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {c.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Pending: {c.hoursPending}h</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <UrgencyBadge score={c.urgencyScore} categoryWeight={c.categoryWeight} />
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No complaints filed yet"
            description="You have not submitted any complaints matching this filter. Notice an issue on campus? Submit it now for instant triage."
            actionLabel="Submit New Complaint"
            onAction={() => setActiveTab('submit')}
          />
        )}
      </div>
    </div>
  );
};

