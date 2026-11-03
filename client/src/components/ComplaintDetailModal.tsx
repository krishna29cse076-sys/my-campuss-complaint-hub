import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { ConfirmationDialog } from './ConfirmationDialog';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Trash2,
  Tag,
  ShieldAlert,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { ComplaintStatus } from '../types';

export const ComplaintDetailModal: React.FC = () => {
  const {
    selectedComplaint,
    setSelectedComplaint,
    isDetailOpen,
    setIsDetailOpen,
    role,
    refreshComplaints,
    addToast,
    complaints,
  } = useApp();

  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!isDetailOpen || !selectedComplaint) return null;

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    setIsUpdating(true);
    try {
      const updated = await api.updateComplaint(selectedComplaint.id, {
        status: newStatus,
      });
      setSelectedComplaint(updated);
      await refreshComplaints();
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Complaint #${selectedComplaint.id} marked as ${newStatus}.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not change status.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsUpdating(true);
    try {
      const updated = await api.updateComplaint(selectedComplaint.id, {
        newNote: `[${role.toUpperCase()}] ${newNote.trim()}`,
      });
      setSelectedComplaint(updated);
      setNewNote('');
      await refreshComplaints();
      addToast({
        type: 'success',
        title: 'Note Added',
        message: 'Internal activity log updated.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to add note',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteComplaint(selectedComplaint.id);
      setIsDetailOpen(false);
      setSelectedComplaint(null);
      await refreshComplaints();
      addToast({
        type: 'info',
        title: 'Complaint Removed',
        message: `Complaint #${selectedComplaint.id} has been deleted.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Delete Failed',
      });
    }
  };

  // Find related complaints for duplicate linking
  const relatedIssues = complaints.filter(
    (c) =>
      c.id !== selectedComplaint.id &&
      (c.category === selectedComplaint.category ||
        (c.location && selectedComplaint.location && c.location.toLowerCase() === selectedComplaint.location.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              #{selectedComplaint.id}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-200/70 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {selectedComplaint.category}
            </span>
            <StatusBadge status={selectedComplaint.status} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                title="Delete Complaint"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsDetailOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {selectedComplaint.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedComplaint.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Submitted {new Date(selectedComplaint.createdAt).toLocaleDateString()} at{' '}
                {new Date(selectedComplaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Pending: {selectedComplaint.hoursPending} hours
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {selectedComplaint.studentName} ({selectedComplaint.studentRoll})
              </span>
            </div>
          </div>

          {/* Urgency Calculation Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Smart Priority Metric
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded font-mono">
                  Score: Weight ({selectedComplaint.categoryWeight}) + Days ({Math.floor(selectedComplaint.hoursPending / 24)})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {selectedComplaint.reason || 'Calculated using dynamic campus response algorithm.'}
              </p>
            </div>
            <UrgencyBadge
              score={selectedComplaint.urgencyScore}
              categoryWeight={selectedComplaint.categoryWeight}
              hoursPending={selectedComplaint.hoursPending}
            />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Detailed Complaint Description
            </h4>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line shadow-subtle">
              {selectedComplaint.description}
            </div>
          </div>

          {/* AI Complaint Assistant & Triage Insights */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/70 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                AI Complaint Triage & Solution Assistant
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Gemini / NLP Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Automated Summary
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedComplaint.description.length > 100
                    ? `${selectedComplaint.title} - ${selectedComplaint.description.slice(0, 120)}...`
                    : selectedComplaint.description}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Extracted Keywords
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[selectedComplaint.category, selectedComplaint.location.split(',')[0], 'Urgent', 'Facility'].map(
                    (tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Recommended Action for Campus Administrators
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                <li>
                  Dispatch {selectedComplaint.assignedDepartment || 'Campus Facilities Team'} to inspect{' '}
                  {selectedComplaint.location}.
                </li>
                <li>Verify electrical and structural safety before reopening affected zone.</li>
                <li>Send automated SMS/email update to reporting student upon status transition.</li>
              </ul>
            </div>
          </div>

          {/* Duplicate Detection Warning (if any similar issues) */}
          {relatedIssues.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Duplicate / Similar Campus Reports Detected ({relatedIssues.length} nearby)
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                Multiple reports share the same facility location or category. Consider merging work orders.
              </p>
              <div className="space-y-1.5 pt-1">
                {relatedIssues.slice(0, 2).map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-100 dark:border-amber-900/30 text-xs"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-sm">
                      #{rel.id} - {rel.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{rel.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Workflow Controls */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Update Status Workflow (Raised → In Progress → Resolved)
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                disabled={isUpdating || selectedComplaint.status === 'Raised'}
                onClick={() => handleStatusChange('Raised')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                  selectedComplaint.status === 'Raised'
                    ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/50 dark:border-rose-700 dark:text-rose-300 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Raised
              </button>

              <button
                disabled={isUpdating || selectedComplaint.status === 'In Progress'}
                onClick={() => handleStatusChange('In Progress')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                  selectedComplaint.status === 'In Progress'
                    ? 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-300 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                In Progress
              </button>

              <button
                disabled={isUpdating || selectedComplaint.status === 'Resolved'}
                onClick={() => handleStatusChange('Resolved')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                  selectedComplaint.status === 'Resolved'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Resolved
              </button>
            </div>
          </div>

          {/* Activity Log & Internal Notes */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Activity History & Internal Notes
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedComplaint.notes && selectedComplaint.notes.length > 0 ? (
                selectedComplaint.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                  >
                    {note}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
              )}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add maintenance update or internal dispatch note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isUpdating || !newNote.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                Log Note
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <span>Assigned: {selectedComplaint.assignedDepartment || 'Campus IT & Facilities'}</span>
          <button
            onClick={() => setIsDetailOpen(false)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Complaint?"
        message={`Are you sure you want to permanently delete complaint #${selectedComplaint.id}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

