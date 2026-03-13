import { SubjectMarks, SUBJECTS, SCORED_SUBJECT_GROUPS, GRAND_TOTAL_MAX, DIVISION_THRESHOLDS } from "./subjects";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarksRecord = Record<string, any>;

/**
 * Calculate the total for a single subject (ut + cp + hye)
 */
export function calcSubjectTotal(marks: SubjectMarks | null | undefined): number {
  if (!marks) return 0;
  return (marks.ut || 0) + (marks.cp || 0) + (marks.hye || 0);
}

/**
 * Calculate the combined total for a subject group
 * (e.g., English = englishLit total + englishLang total, divided proportionally)
 * Each GROUP contributes max 100 to grand total.
 */
export function calcGroupTotal(marksRecord: MarksRecord, subjectKeys: string[]): number {
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;

  for (const key of subjectKeys) {
    const subjectMarks = marksRecord[key] as SubjectMarks | null;
    totalMarksObtained += calcSubjectTotal(subjectMarks);
    const config = SUBJECTS.find(s => s.key === key);
    if (config) {
      totalMaxMarks += config.maxTotal;
    }
  }

  if (totalMaxMarks === 0) return 0;

  // Scale to 100 for multi-subject groups
  // e.g., English has 2 subjects (200 max) → scaled to 100
  return Math.round((totalMarksObtained / totalMaxMarks) * 100);
}

/**
 * Calculate grand total: sum of all scored subject group totals (out of 800)
 * Each of the 8 main groups contributes max 100
 */
export function calcGrandTotal(marksRecord: MarksRecord): number {
  let grandTotal = 0;

  for (const group of SCORED_SUBJECT_GROUPS) {
    grandTotal += calcGroupTotal(marksRecord, group.subjects);
  }

  return grandTotal;
}

/**
 * Calculate percentage
 */
export function calcPercentage(grandTotal: number): number {
  return parseFloat(((grandTotal / GRAND_TOTAL_MAX) * 100).toFixed(2));
}

/**
 * Determine division based on percentage thresholds
 */
export function calcDivision(percentage: number): string {
  if (percentage >= DIVISION_THRESHOLDS.first) return "1st";
  if (percentage >= DIVISION_THRESHOLDS.second) return "2nd";
  if (percentage >= DIVISION_THRESHOLDS.third) return "3rd";
  return "Fail";
}

/**
 * Determine result status
 */
export function calcResult(percentage: number): string {
  return percentage >= DIVISION_THRESHOLDS.third ? "Pass" : "Fail";
}

/**
 * Calculate ranks for all students in a class
 * Returns a map of studentId -> rank
 * Handles ties: students with same total get same rank
 */
export function calcRanks(students: { id: string; grandTotal: number }[]): Map<string, number> {
  const sorted = [...students].sort((a, b) => b.grandTotal - a.grandTotal);
  const rankMap = new Map<string, number>();

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].grandTotal < sorted[i - 1].grandTotal) {
      currentRank = i + 1;
    }
    rankMap.set(sorted[i].id, currentRank);
  }

  return rankMap;
}

/**
 * Full calculation for a single student's marks record
 * Returns the calculated values
 */
export function calculateStudentResults(marksRecord: MarksRecord): {
  grandTotal: number;
  percentage: number;
  division: string;
  result: string;
} {
  const grandTotal = calcGrandTotal(marksRecord);
  const percentage = calcPercentage(grandTotal);
  const division = calcDivision(percentage);
  const result = calcResult(percentage);

  return { grandTotal, percentage, division, result };
}
