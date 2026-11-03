import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { EmptyState } from '../components/EmptyState';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
} from 'lucide-react';

const CATEGORIES: ('All' | ComplaintCategory)[] = [
  'All',
  'Wi-Fi',
  'Hostel',
  'Classroom',
  'Laboratory',
  'Electricity',
  'Cleanliness',
  'Infrastructure',
  'Other',
];

const STATUSES: ('All' | ComplaintStatus)[] = [
  'All',
  'Raised',
  'In Progress',
  'Resolved',
];

export const AdminDashboard: React.FC = () => {
  const {
    complaints,
    refreshComplaints,
    setSelectedComplaint,
    setIsDetailOpen,
    setActiveTab,
    addToast,
    loading,
  } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ComplaintCategory>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | ComplaintStatus>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'urgency-desc' | 'urgency-asc'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter & Sort Logic
  const filtered = complaints.filter((c) => {
    // Category filter
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    // Status filter
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchId = c.id.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchLoc = c.location && c.location.toLowerCase().includes(q);
      const matchStudent = c.studentName && c.studentName.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchLoc && !matchStudent) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'urgency-desc') {
      return b.urgencyScore - a.urgencyScore;
    }
    if (sortBy === 'urgency-asc') {
      return a.urgencyScore - b.urgencyScore;
    }
    // Default newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // KPI Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Raised').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const criticalCount = complaints.filter((c) => c.status !== 'Resolved' && c.urgencyScore >= 4).length;

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedComplaints = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Quick Status Advance
  const handleQuickStatus = async (c: Complaint, nextStatus: ComplaintStatus, e: React.MouseEvent) => {
    e.stopPropagation();
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
        title: 'Update Failed',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Command Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-premium border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              CAMPUS ADMIN DESK
            </span>
            <span className="text-xs text-slate-300">Operations Command Center</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Campus Complaint Management Hub
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Triage, monitor, and coordinate physical maintenance tasks across campus hostels, academic laboratories, Wi-Fi mesh, and classroom infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('priority-queue')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Flame className="w-4 h-4 fill-white/20" />
            <span>Priority Queue ({criticalCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Reports</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-400">All registered issues</span>
        </div>

        {/* Pending (Raised) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Raised (Pending)</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            {pendingCount}
          </div>
          <span className="text-[11px] text-slate-400">Awaiting investigation</span>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {inProgressCount}
          </div>
          <span className="text-[11px] text-slate-400">Technicians assigned</span>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {resolvedCount}
          </div>
          <span className="text-[11px] text-slate-400">Verified & closed</span>
        </div>

        {/* Critical Complaints */}
        <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-subtle space-y-1.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Critical Issues</span>
            <Flame className="w-4 h-4 text-rose-600 fill-rose-500/20 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 font-mono">
            {criticalCount}
          </div>
          <span className="text-[11px] text-rose-600/80 dark:text-rose-400">Urgency Score &ge; 4</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden space-y-4">
        {/* Table Filters & Toolbar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, title, facility or student..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs outline-none"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="urgency-desc">Urgency: High to Low</option>
                <option value="urgency-asc">Urgency: Low to High</option>
              </select>
            </div>

            <button
              onClick={() => refreshComplaints()}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Complaint Table */}
        {paginatedComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-mono">ID</th>
                  <th className="py-3.5 px-4">Complaint Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Urgency Score</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedComplaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => {
                      setSelectedComplaint(c);
                      setIsDetailOpen(true);
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      #{c.id}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {c.location} • By {c.studentName}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {c.category}
                      </span>
                    </td>

                    {/* Submitted */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <div>{new Date(c.createdAt).toLocaleDateString()}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{c.hoursPending}h ago</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Urgency Score */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <UrgencyBadge score={c.urgencyScore} categoryWeight={c.categoryWeight} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === 'Raised' && (
                          <button
                            onClick={(e) => handleQuickStatus(c, 'In Progress', e)}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 transition"
                          >
                            Dispatch
                          </button>
                        )}
                        {c.status === 'In Progress' && (
                          <button
                            onClick={(e) => handleQuickStatus(c, 'Resolved', e)}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 transition"
                          >
                            Resolve
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No complaints match filters"
              description="Try adjusting your search criteria, category selection, or status filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
            />
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * itemsPerPage, filtered.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filtered.length}
            </span>{' '}
            complaints
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

