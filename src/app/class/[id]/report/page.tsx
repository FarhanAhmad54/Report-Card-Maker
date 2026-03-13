"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS, SUBJECT_GROUPS, GRADE_SUBJECTS } from "@/lib/subjects";
import { calcSubjectTotal, calcGroupTotal, calcGrandTotal, calcPercentage, calcDivision, calcResult } from "@/lib/calculations";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface StudentData {
  id: string;
  rollNumber: number;
  name: string;
  marks: any;
  grades: any;
  attendance: any;
  evaluation: any;
}

export default function ReportCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/classes/${id}`);
      const data = await res.json();
      setClassInfo(data);
      setStudents((data.students || []).sort((a: StudentData, b: StudentData) => a.rollNumber - b.rollNumber));
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const stored = localStorage.getItem("teacher");
    if (!stored) { router.push("/"); return; }
    fetchData();
  }, [fetchData, router]);

  const handlePrint = () => {
    window.print();
  };

  const displayStudents = selectedStudent === "all" ? students : students.filter(s => s.id === selectedStudent);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Controls - Hidden during print */}
      <div className="no-print bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/class/${id}`)} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-lighter transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base font-bold text-text">
              Report Cards — Class {classInfo?.className}-{classInfo?.section}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-4 py-2 bg-surface border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50"
            >
              <option value="all">All Students ({students.length})</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>Roll {s.rollNumber} — {s.name}</option>
              ))}
            </select>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div ref={printRef} className="max-w-[220mm] mx-auto py-4 no-print:px-4">
        {displayStudents.map((student) => (
          <ReportCard
            key={student.id}
            student={student}
            classInfo={classInfo}
            allStudents={students}
          />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ student, classInfo, allStudents }: { student: StudentData; classInfo: any; allStudents: StudentData[] }) {
  const marks = student.marks || {};
  const grades = student.grades || {};
  const attendance = student.attendance || {};
  const evaluation = student.evaluation || {};

  const grandTotal = calcGrandTotal(marks);
  const percentage = calcPercentage(grandTotal);
  const division = calcDivision(percentage);
  const result = calcResult(percentage);

  // Find rank from stored data or calculate
  const rank = marks.rank || "—";

  // Calculate individual subject totals for display
  const getSubjectMarks = (key: string) => {
    const m = marks[key] || { ut: null, cp: null, hye: null };
    return {
      ut: m.ut ?? "",
      cp: m.cp ?? "",
      hye: m.hye ?? "",
      total: calcSubjectTotal(m),
    };
  };

  void allStudents;

  return (
    <div className="report-card-page bg-white text-black my-4 print:my-0 border print:border-0 shadow-xl print:shadow-none rounded-lg print:rounded-none overflow-hidden" style={{ fontFamily: "'Times New Roman', serif" }}>
      <div className="p-6 print:p-[8mm]">
        {/* School Header */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h1 className="text-xl font-bold uppercase tracking-wide">School Report Card</h1>
          <p className="text-sm mt-1">Half Yearly Examination — {classInfo?.academicYear || "2025-2026"}</p>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <span className="font-semibold">Student Name: </span>
            <span className="border-b border-black pb-0.5">{student.name}</span>
          </div>
          <div>
            <span className="font-semibold">Class: </span>
            <span className="border-b border-black pb-0.5">{classInfo?.className}-{classInfo?.section}</span>
          </div>
          <div>
            <span className="font-semibold">Roll No: </span>
            <span className="border-b border-black pb-0.5">{student.rollNumber}</span>
          </div>
        </div>

        {/* Main Marks Table */}
        <table className="w-full border-collapse border border-black text-xs mb-3">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1.5 text-left w-8">S.No</th>
              <th className="border border-black px-2 py-1.5 text-left" colSpan={2}>SUBJECTS</th>
              <th className="border border-black px-1 py-1.5 text-center w-14">
                <div className="text-[9px]">Unit Test</div>
                <div className="text-[8px]">(20 M)</div>
              </th>
              <th className="border border-black px-1 py-1.5 text-center w-14">
                <div className="text-[9px]">Class Perf.</div>
                <div className="text-[8px]">(10 M)</div>
              </th>
              <th className="border border-black px-1 py-1.5 text-center w-14">
                <div className="text-[9px]">Half Yearly</div>
                <div className="text-[8px]">Exam (70 M)</div>
              </th>
              <th className="border border-black px-1 py-1.5 text-center w-14">
                <div className="text-[9px]">Total</div>
                <div className="text-[8px]">(100 M)</div>
              </th>
              <th className="border border-black px-1 py-1.5 text-center w-20" rowSpan={1}>
                <div className="text-[9px]">Class Teacher&apos;s</div>
                <div className="text-[8px]">Evaluation</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {SUBJECT_GROUPS.map((group) => {
              const groupTotal = calcGroupTotal(marks, group.subjects);
              const isMultiSubject = group.subjects.length > 1;

              return group.subjects.map((subjKey, si) => {
                const subj = SUBJECTS.find(s => s.key === subjKey)!;
                const sm = getSubjectMarks(subjKey);

                return (
                  <tr key={subjKey}>
                    {si === 0 && (
                      <>
                        <td className="border border-black px-2 py-1 text-center" rowSpan={group.subjects.length}>{group.number}</td>
                        <td className="border border-black px-2 py-1 font-semibold" rowSpan={isMultiSubject ? 1 : group.subjects.length}>
                          {group.label}
                        </td>
                      </>
                    )}
                    {isMultiSubject && (
                      <td className="border border-black px-2 py-1">
                        {subj.label}
                      </td>
                    )}
                    {!isMultiSubject && si === 0 && (
                      <td className="border border-black px-2 py-1"></td>
                    )}
                    <td className="border border-black px-1 py-1 text-center">{sm.ut}</td>
                    <td className="border border-black px-1 py-1 text-center">{sm.cp}</td>
                    <td className="border border-black px-1 py-1 text-center">{sm.hye}</td>
                    <td className="border border-black px-1 py-1 text-center font-semibold">{sm.total || ""}</td>
                    {si === 0 && (
                      <td className="border border-black px-2 py-1 text-center font-bold" rowSpan={group.subjects.length}>
                        {groupTotal || ""}
                      </td>
                    )}
                  </tr>
                );
              });
            })}

            {/* Total Row */}
            <tr className="bg-gray-50 font-bold">
              <td className="border border-black px-2 py-1.5" colSpan={6}>10. Total / Maximum Marks</td>
              <td className="border border-black px-1 py-1.5 text-center">{grandTotal}/800</td>
              <td className="border border-black px-1 py-1.5"></td>
            </tr>
            <tr className="font-bold">
              <td className="border border-black px-2 py-1" colSpan={6}>11. Percentage</td>
              <td className="border border-black px-1 py-1 text-center" colSpan={2}>{percentage}%</td>
            </tr>
            <tr className="font-bold">
              <td className="border border-black px-2 py-1" colSpan={6}>12. Rank in Class</td>
              <td className="border border-black px-1 py-1 text-center" colSpan={2}>{rank}</td>
            </tr>
            <tr className="font-bold">
              <td className="border border-black px-2 py-1" colSpan={6}>13. Division</td>
              <td className="border border-black px-1 py-1 text-center" colSpan={2}>{division}</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1" colSpan={6}>14. Attendance</td>
              <td className="border border-black px-1 py-1 text-center" colSpan={2}>
                {attendance.daysPresent ?? "—"} / {attendance.workingDays ?? "—"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Grade-based subjects */}
        <table className="w-full border-collapse border border-black text-xs mb-3">
          <tbody>
            {GRADE_SUBJECTS.map((gs, i) => (
              <tr key={gs.key}>
                <td className="border border-black px-2 py-1 w-8 text-center">{15 + i}</td>
                <td className="border border-black px-2 py-1">{gs.label}</td>
                <td className="border border-black px-2 py-1 text-center w-20">{grades[gs.key] || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Result Section */}
        <div className="border border-black p-3 mb-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <p><span className="font-semibold">Result: </span>{result}</p>
            <p><span className="font-semibold">Division: </span>{division}</p>
          </div>
        </div>

        {/* Half Yearly Examination - Grades */}
        <div className="border border-black mb-3">
          <div className="bg-gray-100 px-3 py-1 text-xs font-bold border-b border-black text-center">HALF YEARLY EXAMINATION</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1"></th>
                <th className="border border-black px-2 py-1 text-center" colSpan={2}>English</th>
                <th className="border border-black px-2 py-1 text-center" colSpan={2}>Hindi</th>
              </tr>
            </thead>
            <tbody>
              {["Reading", "Recitation", "Writing"].map(skill => (
                <tr key={skill}>
                  <td className="border border-black px-2 py-1">{skill}</td>
                  <td className="border border-black px-2 py-1 text-center" colSpan={2}></td>
                  <td className="border border-black px-2 py-1 text-center" colSpan={2}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Teacher Evaluation */}
        {(evaluation.evalText || evaluation.remarks) && (
          <div className="border border-black p-3 mb-3 text-sm">
            <p className="font-semibold mb-1">Teacher&apos;s Evaluation:</p>
            {evaluation.evalText && <p>{evaluation.evalText}</p>}
            {evaluation.remarks && <p className="mt-1 italic">{evaluation.remarks}</p>}
          </div>
        )}

        {/* Remarks */}
        <div className="mb-4 text-sm">
          <p><span className="font-semibold">5. Remarks: </span>{evaluation.remarks || "_______________________________________________"}</p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 mt-8 pt-4 text-sm text-center">
          <div>
            <div className="border-t border-black pt-2">Parent&apos;s Signature</div>
          </div>
          <div>
            <div className="border-t border-black pt-2">Class Teacher&apos;s Signature</div>
          </div>
          <div>
            <div className="border-t border-black pt-2">Principal&apos;s Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}
