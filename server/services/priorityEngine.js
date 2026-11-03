/**
 * CAMPUS CARE - Smart Priority Engine
 * Urgency Score = Category Weight + floor(Hours Pending / 24)
 * 
 * Category weights:
 * Wi-Fi = 2
 * Hostel = 2
 * Classroom = 1
 * Laboratory = 3
 * Other categories = 1
 */

export const CATEGORY_WEIGHTS = {
  'Wi-Fi': 2,
  'Hostel': 2,
  'Classroom': 1,
  'Laboratory': 3,
  'Electricity': 1,
  'Cleanliness': 1,
  'Infrastructure': 1,
  'Other': 1,
};

export function getCategoryWeight(category) {
  return CATEGORY_WEIGHTS[category] !== undefined ? CATEGORY_WEIGHTS[category] : 1;
}

export function calculateHoursPending(createdAtTimestamp) {
  const now = Date.now();
  const created = new Date(createdAtTimestamp).getTime();
  const diffMs = Math.max(0, now - created);
  return Math.floor(diffMs / (1000 * 60 * 60));
}

/**
 * Calculates urgency score and reason
 * @param {Object} complaint
 * @returns {{ urgencyScore: number, hoursPending: number, categoryWeight: number, reason: string }}
 */
export function calculateUrgency(complaint) {
  const categoryWeight = getCategoryWeight(complaint.category);
  const hoursPending = complaint.hoursPending !== undefined 
    ? complaint.hoursPending 
    : calculateHoursPending(complaint.createdAt);

  const daysPending = Math.floor(hoursPending / 24);
  const urgencyScore = categoryWeight + daysPending;

  let reason = '';
  if (daysPending >= 3) {
    reason = `Critical delay (${hoursPending}h pending, +${daysPending} age factor) combined with ${complaint.category} facility impact (weight ${categoryWeight}).`;
  } else if (daysPending >= 2) {
    reason = `Elevated delay (${hoursPending}h pending, +${daysPending} age factor) requires prompt resolution.`;
  } else if (categoryWeight >= 3) {
    reason = `High-impact category (${complaint.category}, base weight ${categoryWeight}) requiring specialized intervention.`;
  } else if (categoryWeight === 2) {
    reason = `Core student facility issue (${complaint.category}, base weight ${categoryWeight}) pending for ${hoursPending} hours.`;
  } else {
    reason = `Standard urgency issue with ${hoursPending} hours elapsed since submission.`;
  }

  return {
    urgencyScore,
    hoursPending,
    categoryWeight,
    reason,
  };
}

/**
 * Filter & sort priority queue
 * Rule 1: Exclude resolved complaints (only Raised or In Progress)
 * Rule 2: Sort by Highest urgency score
 * Rule 3: Tie-breaker 1: Oldest submission time when scores are equal
 * Rule 4: Tie-breaker 2: Higher category weight as additional tie-breaker
 */
export function getSortedPriorityQueue(complaints) {
  const unresolved = complaints
    .filter((c) => c.status !== 'Resolved')
    .map((c) => {
      const urgencyData = calculateUrgency(c);
      return {
        ...c,
        ...urgencyData,
      };
    });

  unresolved.sort((a, b) => {
    // 1. Highest urgency score first
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    // 2. Oldest submission time (lower timestamp or higher hoursPending)
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) {
      return timeA - timeB; // earlier timestamp = older
    }
    // 3. Higher category weight tie-breaker
    return b.categoryWeight - a.categoryWeight;
  });

  return unresolved;
}

