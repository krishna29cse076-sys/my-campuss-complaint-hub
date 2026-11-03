import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateUrgency, CATEGORY_WEIGHTS } from './priorityEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'complaints.json');

/**
 * Helper to compute timestamp N hours in the past
 */
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/**
 * Code Crack 3.0 Official Problem Statement Input Data (Exact 4 Records):
 * C01 | Wi-Fi      | 48h ago | Raised      -> Urgency: 2 + floor(48/24) = 4
 * C02 | Hostel     | 8h ago  | In Progress -> Urgency: 2 + floor(8/24)  = 2
 * C03 | Classroom  | 72h ago | Raised      -> Urgency: 1 + floor(72/24) = 4
 * C04 | Laboratory | 24h ago | Resolved    -> Urgency: 3 + floor(24/24) = 4 (Excluded from priority queue!)
 */
export function getBookletSampleComplaints() {
  return [
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
      imageUrl: '',
      urgencyScore: 4, // 2 + floor(48/24) = 4
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
      imageUrl: '',
      urgencyScore: 2, // 2 + floor(8/24) = 2
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
      imageUrl: '',
      urgencyScore: 4, // 1 + floor(72/24) = 4
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
      imageUrl: '',
      urgencyScore: 4, // 3 + 1 = 4, but strictly excluded from priority queue
      categoryWeight: 3,
      assignedDepartment: 'Lab Equipment Maintenance',
      notes: ['Exhaust motor replaced and certified by campus technician.'],
    },
  ];
}

/**
 * Extended sample dataset (8 records for richer analytics)
 */
export function getDefaultSampleComplaints() {
  const booklet = getBookletSampleComplaints();
  const extra = [
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
      imageUrl: '',
      urgencyScore: 1, // 1 + 0 = 1
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
      imageUrl: '',
      urgencyScore: 2, // 1 + floor(34/24) = 2
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
      imageUrl: '',
      urgencyScore: 5, // 1 + floor(96/24) = 5
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
      imageUrl: '',
      urgencyScore: 5, // 3 + floor(52/24) = 5
      categoryWeight: 3,
      assignedDepartment: 'Lab Equipment Maintenance',
      notes: ['High impact research lab issue pending for over 2 days.'],
    }
  ];

  return [...booklet, ...extra];
}

/**
 * Initialize storage directory and file
 */
export function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const defaults = getBookletSampleComplaints();
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
  }
}

/**
 * Read all complaints
 */
export function getAllComplaints() {
  initStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading complaints file, returning defaults:', err);
    return getBookletSampleComplaints();
  }
}

/**
 * Save all complaints
 */
export function saveComplaints(complaints) {
  initStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(complaints, null, 2), 'utf-8');
}

/**
 * Reset complaints to initial sample dataset (supports 'booklet' or 'extended')
 */
export function resetToDefaults(mode = 'booklet') {
  const defaults = mode === 'extended' ? getDefaultSampleComplaints() : getBookletSampleComplaints();
  saveComplaints(defaults);
  return defaults;
}

/**
 * Import custom organizer records
 */
export function importCustomComplaints(records) {
  initStorage();
  const current = getAllComplaints();
  
  const processed = records.map((rec, index) => {
    const category = rec.category || 'Other';
    const hoursPending = rec.hoursPending !== undefined ? Number(rec.hoursPending) : 0;
    const createdAt = rec.createdAt || hoursAgo(hoursPending);
    const id = rec.id || `C${String(current.length + index + 1).padStart(2, '0')}`;
    const status = ['Raised', 'In Progress', 'Resolved'].includes(rec.status) ? rec.status : 'Raised';

    const item = {
      id,
      title: rec.title || `${category} issue #${id}`,
      category,
      description: rec.description || 'Reported campus facility issue.',
      location: rec.location || 'Campus Facilities',
      status,
      hoursPending,
      createdAt,
      updatedAt: createdAt,
      studentName: rec.studentName || 'Student Reporter',
      studentEmail: rec.studentEmail || 'student@campus.edu',
      studentRoll: rec.studentRoll || 'ROLL-001',
      imageUrl: rec.imageUrl || '',
      notes: rec.notes || ['Imported via organizer test suite.'],
    };

    const urgency = calculateUrgency(item);
    return { ...item, ...urgency };
  });

  saveComplaints(processed);
  return processed;
}
