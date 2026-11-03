import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getAllComplaints,
  saveComplaints,
  resetToDefaults,
  importCustomComplaints,
  initStorage,
} from './services/storage.js';
import {
  calculateUrgency,
  getSortedPriorityQueue,
  CATEGORY_WEIGHTS,
} from './services/priorityEngine.js';
import {
  analyzeComplaint,
  detectDuplicates,
  generateCampusInsights,
} from './services/aiEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize persistent storage
initStorage();

/**
 * Health & Config Status
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    system: 'CAMPUS CARE – Smart Campus Complaint Management System',
  });
});

/**
 * GET /api/complaints
 * Filter by search, category, status; sort by newest, oldest, urgency
 */
app.get('/api/complaints', (req, res) => {
  try {
    const { search, category, status, sort } = req.query;
    let list = getAllComplaints().map((c) => {
      const urgency = calculateUrgency(c);
      return { ...c, ...urgency };
    });

    // Category filter
    if (category && category !== 'All') {
      list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }

    // Status filter
    if (status && status !== 'All') {
      list = list.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    // Search query filter
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.location && c.location.toLowerCase().includes(q)) ||
          (c.studentName && c.studentName.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'urgency-desc') {
      list.sort((a, b) => b.urgencyScore - a.urgencyScore);
    } else if (sort === 'urgency-asc') {
      list.sort((a, b) => a.urgencyScore - b.urgencyScore);
    } else {
      // Default: newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({
      success: true,
      count: list.length,
      complaints: list,
    });
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/complaints/:id
 */
app.get('/api/complaints/:id', (req, res) => {
  try {
    const list = getAllComplaints();
    const complaint = list.find((c) => c.id.toLowerCase() === req.params.id.toLowerCase());
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const urgency = calculateUrgency(complaint);
    const enriched = { ...complaint, ...urgency };

    // Check potential duplicates
    const duplicates = detectDuplicates(enriched, list);

    res.json({
      success: true,
      complaint: enriched,
      duplicates,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/complaints
 * Create a new complaint with auto-generated ID and validation
 */
app.post('/api/complaints', (req, res) => {
  try {
    const { title, description, category, location, studentName, studentEmail, studentRoll, imageUrl } = req.body;

    // Validation
    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, error: 'Category is required.' });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ success: false, error: 'Detailed description is required.' });
    }
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Complaint title is required.' });
    }

    const list = getAllComplaints();

    // Auto-generate Next Unique ID (e.g. C01, C02 ... C09, C10)
    let maxNumber = 0;
    list.forEach((c) => {
      const match = c.id.match(/^C(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    const nextId = `C${String(maxNumber + 1).padStart(2, '0')}`;

    const nowIso = new Date().toISOString();
    const newComplaint = {
      id: nextId,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: (location || 'Campus Facility').trim(),
      status: 'Raised',
      hoursPending: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      studentName: studentName || 'Alex Rivera',
      studentEmail: studentEmail || 'student@campus.edu',
      studentRoll: studentRoll || 'STU-2024-001',
      imageUrl: imageUrl || '',
      notes: ['Complaint registered successfully.'],
    };

    // Calculate urgency score
    const urgency = calculateUrgency(newComplaint);
    Object.assign(newComplaint, urgency);

    // Duplicate detection check
    const duplicates = detectDuplicates(newComplaint, list);

    // Save
    list.unshift(newComplaint);
    saveComplaints(list);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint: newComplaint,
      potentialDuplicates: duplicates,
    });
  } catch (err) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/complaints/:id
 * Update status workflow: Raised -> In Progress -> Resolved, or edit details
 */
app.patch('/api/complaints/:id', (req, res) => {
  try {
    const list = getAllComplaints();
    const index = list.findIndex((c) => c.id.toLowerCase() === req.params.id.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const current = list[index];
    const updates = req.body;

    // Track status workflow change
    if (updates.status && updates.status !== current.status) {
      if (!['Raised', 'In Progress', 'Resolved'].includes(updates.status)) {
        return res.status(400).json({ success: false, error: 'Status must be Raised, In Progress, or Resolved.' });
      }
      current.status = updates.status;
      current.notes = current.notes || [];
      current.notes.push(`Status changed to ${updates.status} on ${new Date().toLocaleString()}`);

      if (updates.status === 'Resolved') {
        current.resolvedAt = new Date().toISOString();
        const start = new Date(current.createdAt).getTime();
        current.resolutionHours = Math.max(1, Math.round((Date.now() - start) / (1000 * 60 * 60)));
      }
    }

    if (updates.title) current.title = updates.title.trim();
    if (updates.description) current.description = updates.description.trim();
    if (updates.category) current.category = updates.category.trim();
    if (updates.location) current.location = updates.location.trim();
    if (updates.assignedDepartment) current.assignedDepartment = updates.assignedDepartment.trim();
    if (updates.newNote) {
      current.notes = current.notes || [];
      current.notes.push(updates.newNote.trim());
    }

    current.updatedAt = new Date().toISOString();

    const urgency = calculateUrgency(current);
    Object.assign(current, urgency);

    list[index] = current;
    saveComplaints(list);

    res.json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint: current,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/complaints/:id
 */
app.delete('/api/complaints/:id', (req, res) => {
  try {
    let list = getAllComplaints();
    const initialLen = list.length;
    list = list.filter((c) => c.id.toLowerCase() !== req.params.id.toLowerCase());
    if (list.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }
    saveComplaints(list);
    res.json({ success: true, message: `Complaint ${req.params.id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/priority-queue
 * Smart Priority Queue:
 * - Excludes resolved complaints
 * - Sorted by: Highest urgency score -> Oldest submission time -> Higher category weight
 * - Returns top 3 highest priority unresolved complaints prominently
 */
app.get('/api/priority-queue', (req, res) => {
  try {
    const list = getAllComplaints();
    const sortedQueue = getSortedPriorityQueue(list);
    const top3 = sortedQueue.slice(0, 3);

    res.json({
      success: true,
      formula: 'Urgency Score = Category Weight + floor(Hours Pending / 24)',
      categoryWeights: CATEGORY_WEIGHTS,
      totalUnresolved: sortedQueue.length,
      top3,
      queue: sortedQueue,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/analyze-complaint
 * AI Complaint Assistant
 */
app.post('/api/ai/analyze-complaint', async (req, res) => {
  try {
    const { title, description, location, userApiKey } = req.body;
    const analysis = await analyzeComplaint({ title, description, location }, userApiKey);
    res.json({
      success: true,
      ...analysis,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/detect-duplicates
 */
app.post('/api/ai/detect-duplicates', (req, res) => {
  try {
    const list = getAllComplaints();
    const duplicates = detectDuplicates(req.body, list);
    res.json({
      success: true,
      duplicates,
      count: duplicates.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/insights
 */
app.get('/api/ai/insights', async (req, res) => {
  try {
    const userApiKey = req.query.userApiKey || null;
    const list = getAllComplaints();
    const insights = await generateCampusInsights(list, userApiKey);
    res.json({
      success: true,
      ...insights,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analytics
 * Data for Recharts visualizations
 */
app.get('/api/analytics', (req, res) => {
  try {
    const list = getAllComplaints().map((c) => ({
      ...c,
      ...calculateUrgency(c),
    }));

    // Status counts
    const statusCounts = {
      Raised: 0,
      'In Progress': 0,
      Resolved: 0,
    };

    // Category counts
    const categoryCounts = {};
    const categoryResolutionTimes = {};
    const facilityCounts = {};

    list.forEach((c) => {
      // Status
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }

      // Category
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;

      // Location / facility
      const loc = c.location ? c.location.split(',')[0].trim() : 'General Campus';
      facilityCounts[loc] = (facilityCounts[loc] || 0) + 1;

      // Resolution time
      if (c.status === 'Resolved') {
        const time = c.resolutionHours || 24;
        if (!categoryResolutionTimes[c.category]) {
          categoryResolutionTimes[c.category] = { total: 0, count: 0 };
        }
        categoryResolutionTimes[c.category].total += time;
        categoryResolutionTimes[c.category].count += 1;
      }
    });

    // Format Pie chart data: Complaints by Category
    const categoryPieData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Format Status distribution
    const statusData = [
      { status: 'Raised', count: statusCounts['Raised'], fill: '#EF4444' },
      { status: 'In Progress', count: statusCounts['In Progress'], fill: '#F59E0B' },
      { status: 'Resolved', count: statusCounts['Resolved'], fill: '#10B981' },
    ];

    // Weekly trend (simulated 7 days leading to today)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyTrends = days.map((day, idx) => ({
      day,
      newComplaints: 2 + (idx * 2) % 5 + (idx % 2),
      resolvedComplaints: 1 + ((idx + 2) * 2) % 4,
    }));

    // Average resolution time
    const resolutionData = Object.entries(categoryResolutionTimes).map(([category, info]) => ({
      category,
      avgHours: Math.round((info.total / info.count) * 10) / 10,
    }));
    // Fill categories if not resolved yet
    ['Wi-Fi', 'Hostel', 'Classroom', 'Laboratory'].forEach((cat) => {
      if (!resolutionData.some((r) => r.category === cat)) {
        resolutionData.push({ category: cat, avgHours: cat === 'Wi-Fi' ? 18 : cat === 'Laboratory' ? 24 : 32 });
      }
    });

    // Top problematic campus facilities
    const problematicFacilities = Object.entries(facilityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([facility, count]) => ({ facility, count }));

    // Critical complaints count (urgencyScore >= 4 and not resolved)
    const criticalComplaints = list.filter((c) => c.status !== 'Resolved' && c.urgencyScore >= 4);

    res.json({
      success: true,
      summary: {
        total: list.length,
        raised: statusCounts['Raised'],
        inProgress: statusCounts['In Progress'],
        resolved: statusCounts['Resolved'],
        critical: criticalComplaints.length,
      },
      categoryPieData,
      statusData,
      weeklyTrends,
      resolutionData,
      problematicFacilities,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reset-data
 * Resets database to initial required state (booklet or extended)
 */
app.post('/api/reset-data', (req, res) => {
  try {
    const mode = req.body?.mode || 'booklet';
    const data = resetToDefaults(mode);
    res.json({
      success: true,
      message: `Dataset reset to ${mode === 'extended' ? 'extended 8-complaint demo' : 'official 4-complaint contest booklet'} mode.`,
      mode,
      count: data.length,
      complaints: data,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/import-data
 * Organizers may supply additional records
 */
app.post('/api/import-data', (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'Records must be an array of complaints.' });
    }
    const imported = importCustomComplaints(records);
    res.json({
      success: true,
      message: `Successfully imported ${imported.length} records.`,
      count: imported.length,
      complaints: imported,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/export-data
 * Download complaints as JSON
 */
app.get('/api/export-data', (req, res) => {
  try {
    const data = getAllComplaints();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="campus_care_complaints.json"');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve client production build if available
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Campus Care API] Server listening on http://localhost:${PORT}`);
});
