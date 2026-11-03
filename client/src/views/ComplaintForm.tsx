import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, checkLocalDuplicates } from '../services/api';
import { ComplaintCategory, DuplicateMatch, AIAnalysisResult } from '../types';
import {
  Sparkles,
  Send,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Tag,
  Lightbulb,
  Building,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
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

const LOCATION_SUGGESTIONS = [
  'Nelson Hostel, 2nd Floor Corridor',
  'Hostel Block C, 1st Floor Washroom',
  'Main Academic Block, LH-201',
  'Science Complex, Chem Lab 104',
  'Engineering Annex, Room 102',
  'Central Library, North Pathway',
  'Computer Science Building, West Staircase',
  'Physics Wing, Optics Lab 202',
  'Student Cafeteria Dining Hall',
  'Administrative Block 2nd Floor',
];

export const ComplaintForm: React.FC = () => {
  const {
    currentUser,
    addToast,
    refreshComplaints,
    setActiveTab,
    complaints,
  } = useApp();

  // Auto-generate predicted next complaint ID
  const [nextId, setNextId] = useState<string>('C09');
  useEffect(() => {
    let maxNum = 0;
    complaints.forEach((c) => {
      const match = c.id.match(/^C(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    setNextId(`C${String(maxNum + 1).padStart(2, '0')}`);
  }, [complaints]);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  // Validation Errors
  const [errors, setErrors] = useState<{
    title?: string;
    category?: string;
    description?: string;
  }>({});

  // AI Assistant State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Duplicate Warnings State
  const [duplicateWarnings, setDuplicateWarnings] = useState<DuplicateMatch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current Date Time string
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check duplicate complaints in real-time as user types
  useEffect(() => {
    if (description.length > 15 || title.length > 8) {
      const dups = checkLocalDuplicates(
        {
          title,
          description,
          category: (category || 'Other') as ComplaintCategory,
          location,
        },
        complaints
      );
      setDuplicateWarnings(dups);
    } else {
      setDuplicateWarnings([]);
    }
  }, [title, description, category, location, complaints]);

  // Trigger AI Complaint Assistant
  const handleAIAssist = async () => {
    if (!description.trim() && !title.trim()) {
      setErrors((prev) => ({
        ...prev,
        description: 'Please type a few words about the issue first for the AI to analyze.',
      }));
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await api.analyzeComplaint({
        title: title || 'Campus Issue',
        description,
        location,
      });

      setAiResult(result);

      // Auto-populate category if empty or AI found a high-confidence match
      if (result.suggestedCategory && CATEGORIES.includes(result.suggestedCategory)) {
        setCategory(result.suggestedCategory);
      }

      addToast({
        type: 'success',
        title: 'AI Analysis Complete',
        message: `Suggested: ${result.suggestedCategory} (${Math.round(result.confidence * 100)}% confidence via ${result.engineUsed}).`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'AI Assistant Unavailable',
        message: 'Could not analyze description.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Image Upload Handler (simulated base64 / preview)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { title?: string; category?: string; description?: string } = {};
    if (!title.trim()) newErrors.title = 'Complaint title is required.';
    if (!category) newErrors.category = 'Category is required.';
    if (!description.trim()) newErrors.description = 'Detailed description is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please complete all required fields.',
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await api.createComplaint({
        title: title.trim(),
        category: category as ComplaintCategory,
        description: description.trim(),
        location: location.trim() || 'Campus Facilities',
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        studentRoll: currentUser.roll,
        imageUrl: imagePreview,
      });

      await refreshComplaints();

      addToast({
        type: 'success',
        title: 'Complaint Submitted Successfully!',
        message: `Ticket #${res.complaint.id} created with initial Urgency Score of ${res.complaint.urgencyScore}.`,
      });

      // Reset Form
      setTitle('');
      setCategory('');
      setDescription('');
      setLocation('');
      setImagePreview('');
      setAiResult(null);

      // Navigate to My Complaints / Overview
      setActiveTab('overview');
    } catch {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Could not register complaint.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              ID: {nextId}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Auto-Generated Unique Identifier
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Submit a Campus Problem
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill in the details below. Our AI assistant will analyze your report and triage it immediately.
          </p>
        </div>

        <div className="text-right shrink-0 hidden sm:block">
          <span className="text-[11px] text-slate-400 block font-medium">Submission Timestamp</span>
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            {currentTime}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wi-Fi router on 2nd floor dropping connection continuously"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border ${
                errors.title
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
              } text-slate-900 dark:text-white outline-none focus:ring-2 transition`}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Category <span className="text-rose-500">*</span>
                </label>
                {category && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    Priority Weight:{' '}
                    {category === 'Laboratory'
                      ? '3 (High)'
                      : category === 'Wi-Fi' || category === 'Hostel'
                      ? '2 (Core)'
                      : '1 (Standard)'}
                  </span>
                )}
              </div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as ComplaintCategory);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                }}
                className={`w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border ${
                  errors.category
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                } text-slate-900 dark:text-white outline-none focus:ring-2 transition`}
              >
                <option value="" disabled>
                  Select campus facility category...
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.category}</p>
              )}
            </div>

            {/* Location or Building */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Location or Building
              </label>
              <input
                type="text"
                list="campus-locations"
                placeholder="e.g. Nelson Hostel, LH-201, Chemistry Lab..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <datalist id="campus-locations">
                {LOCATION_SUGGESTIONS.map((loc, idx) => (
                  <option key={idx} value={loc} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Description & AI Assistant Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Description <span className="text-rose-500">*</span>
              </label>

              {/* AI Complaint Assistant Button */}
              <button
                type="button"
                onClick={handleAIAssist}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800 transition active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>AI Complaint Assistant</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="Describe the issue in detail: what happened, how often it occurs, and the impact on students or classes..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              className={`w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border ${
                errors.description
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
              } text-slate-900 dark:text-white outline-none focus:ring-2 transition leading-relaxed`}
            ></textarea>
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.description}</p>
            )}
          </div>

          {/* AI Analysis Preview Box (if analyzed) */}
          {aiResult && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Assistant Analysis ({Math.round(aiResult.confidence * 100)}% Confidence)
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Engine: {aiResult.engineUsed}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Suggested Category:
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {aiResult.suggestedCategory}
                  </span>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Extracted Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {aiResult.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Draft Summary:
                </span>
                <p className="text-slate-600 dark:text-slate-400">{aiResult.summary}</p>
              </div>
            </div>
          )}

          {/* Duplicate Detection Warning Banner */}
          {duplicateWarnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Potential Duplicate Warning: Similar issues already reported
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed">
                We detected existing open complaints with high similarity. You can still proceed, but your report may be grouped with an existing work ticket.
              </p>
              <div className="space-y-1.5 pt-1">
                {duplicateWarnings.slice(0, 2).map((dup, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-600">
                        #{dup.matchedComplaintId}
                      </span>{' '}
                      - <span className="font-medium text-slate-800 dark:text-slate-200">{dup.matchedTitle}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">{dup.reason}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                      {dup.similarityScore}% match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Image Attachment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Optional Photo Attachment
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload Photo from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview('')}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Registering...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

