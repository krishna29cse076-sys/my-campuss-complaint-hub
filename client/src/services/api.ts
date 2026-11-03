import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  AIAnalysisResult,
  AIInsightsData,
  AnalyticsData,
  DuplicateMatch,
} from '../types';

const API_BASE = '/api';

export const CATEGORY_WEIGHTS: Record<ComplaintCategory, number> = {
  'Wi-Fi': 2,
  'Hostel': 2,
  'Classroom': 1,
  'Laboratory': 3,
  'Electricity': 1,
  'Cleanliness': 1,
  'Infrastructure': 1,
  'Other': 1,
};

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/**
 * Code Crack 3.0 Official Problem Statement Input Data (Exact 4 Records):
 * C01 | Wi-Fi      | 48h ago | Raised      -> Urgency: 2 + floor(48/24) = 4
 * C02 | Hostel     | 8h ago  | In Progress -> Urgency: 2 + floor(8/24)  = 2
 * C03 | Classroom  | 72h ago | Raised      -> Urgency: 1 + floor(72/24) = 4
 * C04 | Laboratory | 24h ago | Resolved    -> Urgency: 3 + floor(24/24) = 4 (Excluded from priority queue!)
 */
export const BOOKLET_COMPLAINTS: Complaint[] = [
  {
    id: 'C01',
    title: 'Wi-Fi connection drops repeatedly in Nelson Hostel',
    category: 'Wi-Fi',
    description: 'Students report packet loss and frequent disconnections on the 2nd floor corridor router of Nelson Hostel.',
    location: 'Nelson Hostel, 2nd Floor Corridor',
    status: 'Raised',
    hoursPending: 48,
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(48),
    studentName: 'Alex Rivera',
    studentEmail: 'alex.rivera@campus.edu',
    studentRoll: 'CS-2023-042',
    urgencyScore: 4, // 2 (Wi-Fi) + floor(48/24 = 2) = 4
    categoryWeight: 2,
    assignedDepartment: 'Network & IT Services',
    notes: ['Reported 48 hours ago. Status: Raised.'],
  },
  {
    id: 'C02',
    title: 'Hostel Block C washroom hot water geyser failure',
    category: 'Hostel',
    description: 'Hot water geyser in C-Wing 1st floor bathroom tripped with burning smell. Needs repair.',
    location: 'Hostel Block C, 1st Floor Washroom',
    status: 'In Progress',
    hoursPending: 8,
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(2),
    studentName: 'Priya Sharma',
    studentEmail: 'priya.s@campus.edu',
    studentRoll: 'EE-2024-118',
    urgencyScore: 2, // 2 (Hostel) + floor(8/24 = 0) = 2
    categoryWeight: 2,
    assignedDepartment: 'Hostel Maintenance',
    notes: ['Assigned to plumbing technician 2 hours ago.'],
  },
  {
    id: 'C03',
    title: 'Classroom LH-201 ceiling projector flickering and shutting down',
    category: 'Classroom',
    description: 'Ceiling projector lamp warning indicator blinks amber and display shuts off during lectures.',
    location: 'Main Academic Block, LH-201',
    status: 'Raised',
    hoursPending: 72,
    createdAt: hoursAgo(72),
    updatedAt: hoursAgo(72),
    studentName: 'David Chen',
    studentEmail: 'david.c@campus.edu',
    studentRoll: 'ME-2022-089',
    urgencyScore: 4, // 1 (Classroom) + floor(72/24 = 3) = 4
    categoryWeight: 1,
    assignedDepartment: 'AV & Classroom Media',
    notes: ['Pending for 72 hours. Ranks above C01 due to older age tie-breaker.'],
  },
  {
    id: 'C04',
    title: 'Chemistry Laboratory 104 fume hood exhaust motor repair',
    category: 'Laboratory',
    description: 'Fume hood #3 exhaust motor failed in Organic Chemistry Lab 104. Ventilator filter replaced and tested.',
    location: 'Science Complex, Chem Lab 104',
    status: 'Resolved',
    hoursPending: 24,
    createdAt: hoursAgo(24),
    updatedAt: hoursAgo(1),
    resolvedAt: hoursAgo(1),
    resolutionHours: 23,
    studentName: 'Amina Yusuf',
    studentEmail: 'amina.y@campus.edu',
    studentRoll: 'CH-2023-015',
    urgencyScore: 4, // 3 + 1 = 4, but strictly excluded from priority queue
    categoryWeight: 3,
    assignedDepartment: 'Lab Equipment Maintenance',
    notes: ['Exhaust motor replaced and certified by campus technician.'],
  },
];

export const EXTENDED_COMPLAINTS: Complaint[] = [
  ...BOOKLET_COMPLAINTS,
  {
    id: 'C05',
    title: 'Main power outlet bank sparking on workbench 4',
    category: 'Electricity',
    description: 'Sparks observed when plugging in 230V test bench power supply in Electrical Machines Lab. Safety breaker did not trip immediately.',
    location: 'Engineering Annex, Room 102',
    status: 'Raised',
    hoursPending: 18,
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(18),
    studentName: 'Marcus Vance',
    studentEmail: 'marcus.v@campus.edu',
    studentRoll: 'EE-2023-071',
    urgencyScore: 1,
    categoryWeight: 1,
    assignedDepartment: 'Campus Electrical Engineering',
    notes: [],
  },
  {
    id: 'C06',
    title: 'Overflowing recycling and waste bins behind library',
    category: 'Cleanliness',
    description: 'Litter scattering due to high wind around Central Library back stairs. Stray cats getting into unsealed plastic bins.',
    location: 'Central Library, North Pathway',
    status: 'In Progress',
    hoursPending: 34,
    createdAt: hoursAgo(34),
    updatedAt: hoursAgo(10),
    studentName: 'Sophie Taylor',
    studentEmail: 'sophie.t@campus.edu',
    studentRoll: 'BT-2024-033',
    urgencyScore: 2,
    categoryWeight: 1,
    assignedDepartment: 'Campus Sanitation & Housekeeping',
    notes: ['Sanitation team scheduled for afternoon clearing.'],
  },
  {
    id: 'C07',
    title: 'Broken handrail on 3rd floor staircase posing fall risk',
    category: 'Infrastructure',
    description: 'Heavy steel handrail weld broke loose near stairway landing between floors 2 and 3. Shakes dangerously when leaned upon.',
    location: 'Computer Science Building, West Staircase',
    status: 'Raised',
    hoursPending: 96,
    createdAt: hoursAgo(96),
    updatedAt: hoursAgo(96),
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.v@campus.edu',
    studentRoll: 'CS-2022-105',
    urgencyScore: 5, // 1 + floor(96/24 = 4) = 5
    categoryWeight: 1,
    assignedDepartment: 'Civil Works & Estate Maintenance',
    notes: ['Urgent safety hazard reported by faculty and students.'],
  },
  {
    id: 'C08',
    title: 'Physics Dark Room spectrophotometer sensor calibration failed',
    category: 'Laboratory',
    description: 'UV-Vis spectrophotometer in Advanced Optics Lab returns negative transmittance readings for standard calibration blanks.',
    location: 'Physics Wing, Optics Lab 202',
    status: 'Raised',
    hoursPending: 52,
    createdAt: hoursAgo(52),
    updatedAt: hoursAgo(52),
    studentName: 'Elena Rostova',
    studentEmail: 'elena.r@campus.edu',
    studentRoll: 'PH-2023-019',
    urgencyScore: 5, // 3 (Lab) + floor(52/24 = 2) = 5
    categoryWeight: 3,
    assignedDepartment: 'Lab Equipment Maintenance',
    notes: ['High impact research lab issue pending for over 2 days.'],
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = BOOKLET_COMPLAINTS;

const LOCAL_STORAGE_KEY = 'campus_care_complaints_v1';
const GEMINI_KEY_STORAGE = 'campus_care_gemini_key';

export function getStoredGeminiKey(): string {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

export function saveStoredGeminiKey(key: string): void {
  if (key) {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  }
}

/**
 * LocalStorage Fallback Handlers
 */
function getLocalComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMPLAINTS;
  }
}

function saveLocalComplaints(complaints: Complaint[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(complaints));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

export function calculateUrgency(complaint: Partial<Complaint>): {
  urgencyScore: number;
  hoursPending: number;
  categoryWeight: number;
  reason: string;
} {
  const category = (complaint.category || 'Other') as ComplaintCategory;
  const weight = CATEGORY_WEIGHTS[category] !== undefined ? CATEGORY_WEIGHTS[category] : 1;
  
  let hours = complaint.hoursPending;
  if (hours === undefined && complaint.createdAt) {
    const diff = Math.max(0, Date.now() - new Date(complaint.createdAt).getTime());
    hours = Math.floor(diff / (1000 * 60 * 60));
  }
  hours = hours || 0;

  const daysPending = Math.floor(hours / 24);
  const urgencyScore = weight + daysPending;

  let reason = '';
  if (daysPending >= 3) {
    reason = `Critical delay (${hours}h pending, +${daysPending} age factor) combined with ${category} facility impact (weight ${weight}).`;
  } else if (daysPending >= 2) {
    reason = `Elevated delay (${hours}h pending, +${daysPending} age factor) requires prompt resolution.`;
  } else if (weight >= 3) {
    reason = `High-impact category (${category}, base weight ${weight}) requiring specialized intervention.`;
  } else if (weight === 2) {
    reason = `Core student facility issue (${category}, base weight ${weight}) pending for ${hours} hours.`;
  } else {
    reason = `Standard urgency issue with ${hours} hours elapsed since submission.`;
  }

  return {
    urgencyScore,
    hoursPending: hours,
    categoryWeight: weight,
    reason,
  };
}

/**
 * Smart Priority Queue Sorting:
 * 1. Exclude resolved complaints
 * 2. Highest urgency score
 * 3. Oldest submission time when scores are equal
 * 4. Higher category weight tie-breaker
 */
export function sortPriorityQueue(complaints: Complaint[]): Complaint[] {
  const unresolved = complaints
    .filter((c) => c.status !== 'Resolved')
    .map((c) => {
      const u = calculateUrgency(c);
      return { ...c, ...u };
    });

  unresolved.sort((a, b) => {
    // 1. Highest Urgency Score
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    // 2. Oldest submission time (earlier date has smaller timestamp)
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    // 3. Higher category weight
    return b.categoryWeight - a.categoryWeight;
  });

  return unresolved;
}

/**
 * Local AI Assistant (Rule-based Fallback Engine)
 */
export function runLocalAIAssistant(title: string, description: string, location: string): AIAnalysisResult {
  const text = `${title} ${description} ${location}`.toLowerCase();
  
  const kw = {
    'Wi-Fi': ['wifi', 'wi-fi', 'internet', 'router', 'network', 'signal', 'bandwidth', 'disconnect', 'dns', 'packet loss', 'hotspot'],
    'Hostel': ['hostel', 'dorm', 'room', 'bed', 'warden', 'geyser', 'mess', 'dining', 'laundry', 'roommate', 'wing'],
    'Classroom': ['classroom', 'projector', 'lecture', 'podium', 'board', 'benches', 'desk', 'speaker', 'mic', 'hall'],
    'Laboratory': ['laboratory', 'lab', 'oscilloscope', 'microscope', 'fume hood', 'beaker', 'chemical', 'pc lab', 'specimen'],
    'Electricity': ['electricity', 'socket', 'switchboard', 'plug', 'power cut', 'outage', 'voltage', 'short circuit', 'breaker', 'spark'],
    'Cleanliness': ['cleanliness', 'trash', 'dustbin', 'garbage', 'dirty', 'restroom', 'toilet', 'washroom', 'odor', 'mop', 'sweep'],
    'Infrastructure': ['infrastructure', 'leak', 'ceiling', 'plumbing', 'pipe', 'tap', 'door', 'lock', 'window', 'crack', 'elevator', 'lift'],
  };

  let bestCat: ComplaintCategory = 'Other';
  let bestScore = 0;

  for (const [cat, words] of Object.entries(kw)) {
    let score = 0;
    for (const w of words) {
      if (text.includes(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat as ComplaintCategory;
    }
  }

  const solutionsMap: Record<ComplaintCategory, string[]> = {
    'Wi-Fi': [
      'Reboot edge AP switches and re-distribute 5GHz channel load.',
      'Dispatch IT campus technician to test packet drop and DHCP lease exhaustion.',
      'Replace damaged copper drop cable or reset access point radio credentials.'
    ],
    'Hostel': [
      'Assign residential facility supervisor for physical inspection within 4 hours.',
      'Issue repair work-order to hostel carpentry and maintenance staff.',
      'Coordinate with hostel warden if student room relocation is temporarily needed.'
    ],
    'Classroom': [
      'Test projector HDMI/VGA signal and lamp ballast status before next lecture.',
      'Dispatch AV support team to replace faulty ceiling lights, fan, or microphones.',
      'Seal broken benches or desk screws to ensure student safety.'
    ],
    'Laboratory': [
      'Isolate affected laboratory apparatus and apply safety lockout tag.',
      'Notify Lab In-Charge and schedule calibration/technical vendor inspection.',
      'Replenish required lab safety materials and verify exhaust ventilation.'
    ],
    'Electricity': [
      'Dispatch certified campus electrician immediately with circuit multimeter.',
      'Inspect Main Distribution Board (MDB) for tripped MCBs or burnt wiring.',
      'Test grounding and replace damaged electrical outlets or heavy switches.'
    ],
    'Cleanliness': [
      'Notify campus housekeeping contractor for expedited sanitization.',
      'Deploy secondary garbage bins and schedule bi-hourly trash clearances.',
      'Apply odor neutralizers and deep wash tiles and drainage traps.'
    ],
    'Infrastructure': [
      'Engage campus civil engineering wing to inspect structural integrity.',
      'Turn off upstream supply valve in case of water leaks and repair pipe joint.',
      'Schedule carpenter or mason for door hinges, window latches, or tile fixing.'
    ],
    'Other': [
      'Acknowledge student complaint and assign to general campus administrative desk.',
      'Contact reporting student for clarifying details or photos.',
      'Review complaint in next weekly campus operations committee.'
    ]
  };

  const words = text.match(/[a-z0-9_-]{4,}/g) || [];
  const freq: Record<string, number> = {};
  words.forEach(w => {
    if (!['this', 'that', 'with', 'from', 'have', 'there', 'some'].includes(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });

  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  return {
    suggestedCategory: bestCat,
    summary: `${title || 'Complaint'}: ${description.slice(0, 85)}...`,
    keywords: keywords.length > 0 ? keywords : [bestCat, 'Campus', 'Maintenance'],
    suggestedSolutions: solutionsMap[bestCat] || solutionsMap['Other'],
    confidence: bestScore > 0 ? Math.min(0.92, 0.70 + bestScore * 0.08) : 0.6,
    engineUsed: 'rule-engine',
  };
}

/**
 * Local duplicate detection
 */
export function checkLocalDuplicates(
  newComplaint: { title: string; description: string; category: ComplaintCategory; location: string },
  existing: Complaint[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const wordsA = new Set(
    `${newComplaint.title} ${newComplaint.description}`.toLowerCase().match(/\w{3,}/g) || []
  );

  for (const ex of existing) {
    if (ex.status === 'Resolved') continue;
    const wordsB = new Set(`${ex.title} ${ex.description}`.toLowerCase().match(/\w{3,}/g) || []);

    let common = 0;
    wordsA.forEach((w) => {
      if (wordsB.has(w)) common++;
    });

    const union = new Set([...wordsA, ...wordsB]).size;
    const tokenSim = union > 0 ? common / union : 0;
    const categoryMatch = ex.category === newComplaint.category;
    const locA = (newComplaint.location || '').toLowerCase();
    const locB = (ex.location || '').toLowerCase();
    const locationMatch = locA && locB && (locA.includes(locB) || locB.includes(locA));

    let score = tokenSim * 0.5;
    if (categoryMatch) score += 0.25;
    if (locationMatch) score += 0.3;

    if (score >= 0.35) {
      matches.push({
        matchedComplaintId: ex.id,
        matchedTitle: ex.title,
        matchedCategory: ex.category,
        matchedLocation: ex.location,
        status: ex.status,
        similarityScore: Math.round(Math.min(0.99, score) * 100),
        reason: categoryMatch && locationMatch
          ? `Same category (${ex.category}) and matching location (${ex.location}).`
          : `High textual similarity with issue #${ex.id}.`,
      });
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Public Unified API Service
 */
export const api = {
  /**
   * Fetch all complaints with filters
   */
  async getComplaints(params?: {
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
  }): Promise<{ complaints: Complaint[]; count: number }> {
    try {
      const qs = new URLSearchParams();
      if (params?.search) qs.append('search', params.search);
      if (params?.category) qs.append('category', params.category);
      if (params?.status) qs.append('status', params.status);
      if (params?.sort) qs.append('sort', params.sort);

      const res = await fetch(`${API_BASE}/complaints?${qs.toString()}`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      if (data.complaints) {
        saveLocalComplaints(data.complaints);
        return data;
      }
    } catch {
      // Fallback to localStorage
    }

    let list = getLocalComplaints().map((c) => ({
      ...c,
      ...calculateUrgency(c),
    }));

    if (params?.category && params.category !== 'All') {
      list = list.filter((c) => c.category.toLowerCase() === params.category?.toLowerCase());
    }
    if (params?.status && params.status !== 'All') {
      list = list.filter((c) => c.status.toLowerCase() === params.status?.toLowerCase());
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q)
      );
    }
    if (params?.sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (params?.sort === 'urgency-desc') {
      list.sort((a, b) => b.urgencyScore - a.urgencyScore);
    } else if (params?.sort === 'urgency-asc') {
      list.sort((a, b) => a.urgencyScore - b.urgencyScore);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return { complaints: list, count: list.length };
  },

  /**
   * Submit new complaint
   */
  async createComplaint(data: {
    title: string;
    category: ComplaintCategory;
    description: string;
    location: string;
    studentName?: string;
    studentEmail?: string;
    studentRoll?: string;
    imageUrl?: string;
  }): Promise<{ complaint: Complaint; potentialDuplicates: DuplicateMatch[] }> {
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        // Update local cache
        const local = getLocalComplaints();
        local.unshift(result.complaint);
        saveLocalComplaints(local);
        return result;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalComplaints();
    let maxNum = 0;
    local.forEach((c) => {
      const match = c.id.match(/^C(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextId = `C${String(maxNum + 1).padStart(2, '0')}`;
    const nowIso = new Date().toISOString();

    const newComp: Complaint = {
      id: nextId,
      title: data.title.trim(),
      category: data.category,
      description: data.description.trim(),
      location: data.location.trim() || 'Campus Facility',
      status: 'Raised',
      hoursPending: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      studentName: data.studentName || 'Alex Rivera',
      studentEmail: data.studentEmail || 'alex.rivera@campus.edu',
      studentRoll: data.studentRoll || 'CS-2023-042',
      imageUrl: data.imageUrl || '',
      urgencyScore: CATEGORY_WEIGHTS[data.category] || 1,
      categoryWeight: CATEGORY_WEIGHTS[data.category] || 1,
      notes: ['Complaint registered.'],
    };

    const urgency = calculateUrgency(newComp);
    Object.assign(newComp, urgency);

    const duplicates = checkLocalDuplicates(newComp, local);
    newComp.duplicateWarnings = duplicates;

    local.unshift(newComp);
    saveLocalComplaints(local);

    return { complaint: newComp, potentialDuplicates: duplicates };
  },

  /**
   * Update complaint status or details
   */
  async updateComplaint(
    id: string,
    updates: Partial<Complaint> & { newNote?: string }
  ): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        return data.complaint;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalComplaints();
    const idx = local.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) throw new Error('Complaint not found');

    const curr = local[idx];
    if (updates.status && updates.status !== curr.status) {
      curr.status = updates.status;
      curr.notes = curr.notes || [];
      curr.notes.push(`Status changed to ${updates.status} on ${new Date().toLocaleString()}`);
      if (updates.status === 'Resolved') {
        curr.resolvedAt = new Date().toISOString();
        const start = new Date(curr.createdAt).getTime();
        curr.resolutionHours = Math.max(1, Math.round((Date.now() - start) / (1000 * 60 * 60)));
      }
    }
    if (updates.title) curr.title = updates.title;
    if (updates.description) curr.description = updates.description;
    if (updates.category) curr.category = updates.category;
    if (updates.location) curr.location = updates.location;
    if (updates.assignedDepartment) curr.assignedDepartment = updates.assignedDepartment;
    if (updates.newNote) {
      curr.notes = curr.notes || [];
      curr.notes.push(updates.newNote);
    }
    curr.updatedAt = new Date().toISOString();

    const u = calculateUrgency(curr);
    Object.assign(curr, u);

    local[idx] = curr;
    saveLocalComplaints(local);
    return curr;
  },

  /**
   * Delete complaint
   */
  async deleteComplaint(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const local = getLocalComplaints().filter((c) => c.id.toLowerCase() !== id.toLowerCase());
        saveLocalComplaints(local);
        return true;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalComplaints().filter((c) => c.id.toLowerCase() !== id.toLowerCase());
    saveLocalComplaints(local);
    return true;
  },

  /**
   * Get Priority Queue data
   */
  async getPriorityQueue(): Promise<{
    top3: Complaint[];
    queue: Complaint[];
    totalUnresolved: number;
    formula: string;
    categoryWeights: Record<string, number>;
  }> {
    try {
      const res = await fetch(`${API_BASE}/priority-queue`);
      if (res.ok) return await res.json();
    } catch {
      // Local fallback
    }

    const local = getLocalComplaints();
    const sorted = sortPriorityQueue(local);

    return {
      top3: sorted.slice(0, 3),
      queue: sorted,
      totalUnresolved: sorted.length,
      formula: 'Urgency Score = Category Weight + floor(Hours Pending / 24)',
      categoryWeights: CATEGORY_WEIGHTS,
    };
  },

  /**
   * AI Analysis
   */
  async analyzeComplaint(data: {
    title: string;
    description: string;
    location: string;
  }): Promise<AIAnalysisResult> {
    const userApiKey = getStoredGeminiKey();
    try {
      const res = await fetch(`${API_BASE}/ai/analyze-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userApiKey }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return runLocalAIAssistant(data.title, data.description, data.location);
  },

  /**
   * AI Campus Insights
   */
  async getAiInsights(): Promise<AIInsightsData> {
    const userApiKey = getStoredGeminiKey();
    try {
      const res = await fetch(`${API_BASE}/ai/insights?userApiKey=${encodeURIComponent(userApiKey)}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const local = getLocalComplaints();
    const catCounts: Record<string, number> = {};
    let resolvedCnt = 0;
    let totalResTime = 0;

    local.forEach((c) => {
      catCounts[c.category] = (catCounts[c.category] || 0) + 1;
      if (c.status === 'Resolved') {
        resolvedCnt++;
        totalResTime += c.resolutionHours || 24;
      }
    });

    let topCat = 'Wi-Fi';
    let maxCnt = 0;
    Object.entries(catCounts).forEach(([cat, cnt]) => {
      if (cnt > maxCnt) {
        maxCnt = cnt;
        topCat = cat;
      }
    });

    return {
      mostFrequentCategory: topCat,
      mostFrequentCount: maxCnt,
      trendingCategories: Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([c, n]) => ({ category: c, count: n, trend: '+18% this week' })),
      avgResolutionTimeHours: resolvedCnt > 0 ? Math.round((totalResTime / resolvedCnt) * 10) / 10 : 28.5,
      suggestions: [
        {
          title: 'Upgrade Edge AP Mesh in Hostels & Engineering Blocks',
          description: 'Wi-Fi complaints account for significant volume. Installing dual-band 802.11ax access points will mitigate evening congestion.',
          impact: 'High',
          estimatedCost: 'Medium',
          category: 'Wi-Fi',
        },
        {
          title: 'Preventative Maintenance for Science Lab Power Drops',
          description: 'Laboratory complaints carry a priority weight of 3. Implementing scheduled weekly inspections prevents experimental equipment downtime.',
          impact: 'Critical',
          estimatedCost: 'Low',
          category: 'Laboratory',
        },
        {
          title: 'Hostel Plumbing & Fixture Overhaul Schedule',
          description: 'Hostel living condition reports exhibit extended pending hours. Deploy dedicated plumbing rounds on Mondays and Thursdays.',
          impact: 'High',
          estimatedCost: 'Low',
          category: 'Hostel',
        },
        {
          title: 'Classroom AV Standardized Replacement Kits',
          description: 'Spare projector remotes, HDMI adaptors, and wireless microphones kept at department reception desks reduce lecture disruption by 75%.',
          impact: 'Medium',
          estimatedCost: 'Minimal',
          category: 'Classroom',
        },
      ],
      engineUsed: 'rule-engine',
    };
  },

  /**
   * Analytics Data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (res.ok) return await res.json();
    } catch {
      // Local fallback
    }

    const local = getLocalComplaints().map((c) => ({
      ...c,
      ...calculateUrgency(c),
    }));

    const statusCounts = { Raised: 0, 'In Progress': 0, Resolved: 0 };
    const categoryCounts: Record<string, number> = {};
    const facilityCounts: Record<string, number> = {};
    const categoryResolutionTimes: Record<string, { total: number; count: number }> = {};

    local.forEach((c) => {
      if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      const loc = c.location ? c.location.split(',')[0].trim() : 'General Campus';
      facilityCounts[loc] = (facilityCounts[loc] || 0) + 1;

      if (c.status === 'Resolved') {
        const time = c.resolutionHours || 24;
        if (!categoryResolutionTimes[c.category]) {
          categoryResolutionTimes[c.category] = { total: 0, count: 0 };
        }
        categoryResolutionTimes[c.category].total += time;
        categoryResolutionTimes[c.category].count += 1;
      }
    });

    const categoryPieData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const statusData = [
      { status: 'Raised', count: statusCounts['Raised'], fill: '#EF4444' },
      { status: 'In Progress', count: statusCounts['In Progress'], fill: '#F59E0B' },
      { status: 'Resolved', count: statusCounts['Resolved'], fill: '#10B981' },
    ];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyTrends = days.map((day, idx) => ({
      day,
      newComplaints: 2 + (idx * 2) % 5 + (idx % 2),
      resolvedComplaints: 1 + ((idx + 2) * 2) % 4,
    }));

    const resolutionData = Object.entries(categoryResolutionTimes).map(([cat, info]) => ({
      category: cat,
      avgHours: Math.round((info.total / info.count) * 10) / 10,
    }));
    ['Wi-Fi', 'Hostel', 'Classroom', 'Laboratory'].forEach((cat) => {
      if (!resolutionData.some((r) => r.category === cat)) {
        resolutionData.push({ category: cat, avgHours: cat === 'Wi-Fi' ? 18 : cat === 'Laboratory' ? 24 : 32 });
      }
    });

    const problematicFacilities = Object.entries(facilityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([facility, count]) => ({ facility, count }));

    const criticalCount = local.filter((c) => c.status !== 'Resolved' && c.urgencyScore >= 4).length;

    return {
      summary: {
        total: local.length,
        raised: statusCounts['Raised'],
        inProgress: statusCounts['In Progress'],
        resolved: statusCounts['Resolved'],
        critical: criticalCount,
      },
      categoryPieData,
      statusData,
      weeklyTrends,
      resolutionData,
      problematicFacilities,
    };
  },

  /**
   * Reset data to initial state ('booklet' = official 4 complaints, 'extended' = 8 demo complaints)
   */
  async resetData(mode: 'booklet' | 'extended' = 'booklet'): Promise<Complaint[]> {
    const targetSet = mode === 'extended' ? EXTENDED_COMPLAINTS : BOOKLET_COMPLAINTS;
    try {
      const res = await fetch(`${API_BASE}/reset-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.complaints) {
          saveLocalComplaints(data.complaints);
          return data.complaints;
        }
      }
    } catch {
      // Local fallback
    }
    saveLocalComplaints(targetSet);
    return targetSet;
  },

  /**
   * Import custom organizer test records
   */
  async importData(records: any[]): Promise<Complaint[]> {
    try {
      const res = await fetch(`${API_BASE}/import-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalComplaints(data.complaints);
        return data.complaints;
      }
    } catch {
      // Fallback
    }

    const current = getLocalComplaints();
    const processed: Complaint[] = records.map((rec, idx) => {
      const cat = (rec.category || 'Other') as ComplaintCategory;
      const hours = Number(rec.hoursPending || 0);
      const id = rec.id || `C${String(current.length + idx + 1).padStart(2, '0')}`;
      const status = (['Raised', 'In Progress', 'Resolved'].includes(rec.status) ? rec.status : 'Raised') as ComplaintStatus;
      const c: Complaint = {
        id,
        title: rec.title || `${cat} issue #${id}`,
        category: cat,
        description: rec.description || 'Reported campus facility issue.',
        location: rec.location || 'Campus Facilities',
        status,
        hoursPending: hours,
        createdAt: rec.createdAt || hoursAgo(hours),
        updatedAt: rec.updatedAt || hoursAgo(hours),
        studentName: rec.studentName || 'Student Reporter',
        studentEmail: rec.studentEmail || 'student@campus.edu',
        studentRoll: rec.studentRoll || 'ROLL-001',
        imageUrl: rec.imageUrl || '',
        urgencyScore: CATEGORY_WEIGHTS[cat] || 1,
        categoryWeight: CATEGORY_WEIGHTS[cat] || 1,
        notes: ['Imported via organizer test suite.'],
      };
      Object.assign(c, calculateUrgency(c));
      return c;
    });

    saveLocalComplaints(processed);
    return processed;
  },
};

