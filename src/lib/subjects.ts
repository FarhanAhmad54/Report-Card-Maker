// Subject configuration for the report card system
export interface SubjectMarks {
  ut: number | null;  // Unit Test (max 20)
  cp: number | null;  // Class Performance (max 10)
  hye: number | null; // Half Yearly Exam (max 70)
}

export interface SubjectConfig {
  key: string;
  label: string;
  parentKey?: string;
  parentLabel?: string;
  maxUt: number;
  maxCp: number;
  maxHye: number;
  maxTotal: number;
}

// All scored subjects with sub-subjects
export const SUBJECTS: SubjectConfig[] = [
  { key: "englishLit", label: "English Literature", parentKey: "english", parentLabel: "English", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "englishLang", label: "English Language", parentKey: "english", parentLabel: "English", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "hindiLit", label: "Hindi Literature", parentKey: "hindi", parentLabel: "Hindi", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "hindiLang", label: "Hindi Language", parentKey: "hindi", parentLabel: "Hindi", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "mathArith", label: "Arithmetic", parentKey: "maths", parentLabel: "Maths", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "mathAlgGeo", label: "Algebra & Geometry", parentKey: "maths", parentLabel: "Maths", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "ssHistory", label: "History", parentKey: "socialStudies", parentLabel: "Social Studies", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "ssCivics", label: "Civics", parentKey: "socialStudies", parentLabel: "Social Studies", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "ssGeography", label: "Geography", parentKey: "socialStudies", parentLabel: "Social Studies", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "sciPhysics", label: "Physics", parentKey: "science", parentLabel: "Science", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "sciChemistry", label: "Chemistry", parentKey: "science", parentLabel: "Science", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "sciBiology", label: "Biology", parentKey: "science", parentLabel: "Science", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "computerSci", label: "Computer Science", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "gk", label: "G.K.", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "arts", label: "Arts", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
  { key: "project", label: "Project", maxUt: 20, maxCp: 10, maxHye: 70, maxTotal: 100 },
];

// Subjects grouped by parent for display in report card
export const SUBJECT_GROUPS = [
  { number: 1, label: "English", subjects: ["englishLit", "englishLang"] },
  { number: 2, label: "Hindi", subjects: ["hindiLit", "hindiLang"] },
  { number: 3, label: "Maths", subjects: ["mathArith", "mathAlgGeo"] },
  { number: 4, label: "Social Studies", subjects: ["ssHistory", "ssCivics", "ssGeography"] },
  { number: 5, label: "Science", subjects: ["sciPhysics", "sciChemistry", "sciBiology"] },
  { number: 6, label: "Computer Science", subjects: ["computerSci"] },
  { number: 7, label: "G.K.", subjects: ["gk"] },
  { number: 8, label: "Arts", subjects: ["arts"] },
  { number: 9, label: "Project", subjects: ["project"] },
];

// Grade-based subjects (not counted in total)
export const GRADE_SUBJECTS = [
  { key: "urduSanskrit", label: "Urdu / Sanskrit" },
  { key: "moralTeaching", label: "Moral Teaching" },
  { key: "supw", label: "SUPW (Socially Useful & Productive Work)" },
  { key: "arabic", label: "Arabic" },
];

export const GRADE_OPTIONS = ["A", "B", "C", "D"];

// Maximum marks constants
// 8 main subject groups contribute to total:
// English(100+100=200), Hindi(200), Maths(200), SS(300), Science(300), CS(100), GK(100), Arts(100) 
// BUT the report card shows max 800, meaning each main group is capped at 100
// Looking at the image: Total/Max = 518/800, so 8 rows × 100 = 800
// Actually from the image the "Total" column says "Total 100 M" per subject GROUP
// So each of the 8 main subjects (1-8 including project as 9th... wait the image shows Total/Max Marks as 800)
// The image shows 8 subjects numbered 1-8 (excluding Project) but total is 800
// Wait, let me recount from image: 1.English, 2.Hindi, 3.Maths, 4.Social Studies, 5.Science, 6.CS, 7.GK, 8.Arts, 9.Project
// 9 subjects but total is 800... That means only 8 are counted
// Actually re-reading: the image shows subjects 1-8, and row 9 is Project with separate marks
// Then Total/Max = 518/800 aligns with 8×100=800
// Project must NOT be in the 800 total
export const GRAND_TOTAL_MAX = 800;

// The subjects that contribute to the grand total (8 main rows)
export const SCORED_SUBJECT_GROUPS = SUBJECT_GROUPS.filter(g => g.label !== "Project");

// Division thresholds
export const DIVISION_THRESHOLDS = {
  first: 60,  // >= 60%
  second: 45, // >= 45%
  third: 33,  // >= 33%
  // < 33% = Fail
};

// Predefined teacher evaluation sentences
export const EVALUATION_SENTENCES = [
  "Works with enthusiasm",
  "Needs to improve in studies",
  "A more careful with homework will be beneficial",
  "Has/Has taken increased interest in class activities",
  "Needs to be more regular and punctual",
  "Hardworking and sincere student",
  "Shows good progress in academics",
  "Needs to pay attention in class",
  "Excellent performance, keep it up",
  "Can do better with more practice",
  "Participates actively in class discussions",
  "Needs improvement in written work",
  "Shows creative thinking",
  "Should focus more on weak subjects",
  "Regular in attendance and homework",
  "Satisfactory performance overall",
];
