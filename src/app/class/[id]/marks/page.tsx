"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS, SUBJECT_GROUPS, GRADE_SUBJECTS, GRADE_OPTIONS, EVALUATION_SENTENCES } from "@/lib/subjects";
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

export default function MarksEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");
  const [localData, setLocalData] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/classes/${id}`);
      const data = await res.json();
      setClassInfo(data);
      setStudents(data.students || []);

      // Build local state
      const local: Record<string, any> = {};
      for (const student of data.students || []) {
        local[student.id] = {
          marks: {},
          grades: student.grades || {},
          attendance: student.attendance || {},
          evaluation: student.evaluation || {},
        };
        for (const subj of SUBJECTS) {
          local[student.id].marks[subj.key] = student.marks?.[subj.key] || { ut: null, cp: null, hye: null };
        }
      }
      setLocalData(local);
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

  const updateMark = (studentId: string, subjectKey: string, field: "ut" | "cp" | "hye", value: string) => {
    setLocalData(prev => {
      const next = { ...prev };
      if (!next[studentId]) return prev;
      next[studentId] = { ...next[studentId], marks: { ...next[studentId].marks } };
      const existing = next[studentId].marks[subjectKey] || { ut: null, cp: null, hye: null };
      next[studentId].marks[subjectKey] = { ...existing, [field]: value === "" ? null : parseInt(value) };
      return next;
    });
  };

  const updateGrade = (studentId: string, gradeKey: string, value: string) => {
    setLocalData(prev => {
      const next = { ...prev };
      next[studentId] = { ...next[studentId], grades: { ...next[studentId].grades, [gradeKey]: value } };
      return next;
    });
  };

  const updateAttendance = (studentId: string, field: string, value: string) => {
    setLocalData(prev => {
      const next = { ...prev };
      next[studentId] = { ...next[studentId], attendance: { ...next[studentId].attendance, [field]: value === "" ? null : parseInt(value) } };
      return next;
    });
  };

  const updateEvaluation = (studentId: string, field: string, value: string) => {
    setLocalData(prev => {
      const next = { ...prev };
      next[studentId] = { ...next[studentId], evaluation: { ...next[studentId].evaluation, [field]: value } };
      return next;
    });
  };

  const getStudentCalcs = (studentId: string) => {
    const marks = localData[studentId]?.marks || {};
    const grandTotal = calcGrandTotal(marks);
    const percentage = calcPercentage(grandTotal);
    const division = calcDivision(percentage);
    const result = calcResult(percentage);
    return { grandTotal, percentage, division, result };
  };

  const saveAll = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      const studentsPayload = students.map(s => ({
        studentId: s.id,
        marks: localData[s.id]?.marks || {},
        grades: {
          urduSanskrit: localData[s.id]?.grades?.urduSanskrit || null,
          moralTeaching: localData[s.id]?.grades?.moralTeaching || null,
          supw: localData[s.id]?.grades?.supw || null,
          arabic: localData[s.id]?.grades?.arabic || null,
        },
        attendance: {
          workingDays: localData[s.id]?.attendance?.workingDays ?? null,
          daysPresent: localData[s.id]?.attendance?.daysPresent ?? null,
        },
        evaluation: {
          evalText: localData[s.id]?.evaluation?.evalText || null,
          remarks: localData[s.id]?.evaluation?.remarks || null,
        },
      }));

      const res = await fetch(`/api/classes/${id}/marks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: studentsPayload }),
      });

      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <nav className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/class/${id}`)} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-lighter transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base font-bold text-text">
              Marks Entry — Class {classInfo?.className}-{classInfo?.section}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === "saved" && (
              <span className="text-sm text-success flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Saved!
              </span>
            )}
            {saveStatus === "error" && <span className="text-sm text-danger">Error saving</span>}
            <button
              onClick={saveAll}
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50"
            >
              {saving ? "Saving..." : "💾 Save All & Calculate Ranks"}
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4 overflow-x-auto">
        {students.length === 0 ? (
          <div className="text-center py-20 text-text-muted">No students in this class. Add students first.</div>
        ) : (
          <div className="space-y-8">
            {/* For each student */}
            {students.map((student) => {
              const calcs = getStudentCalcs(student.id);

              return (
                <div key={student.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  {/* Student header */}
                  <div className="bg-surface-lighter/50 px-6 py-4 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-primary-500/20 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 font-bold">
                        {student.rollNumber}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-text">{student.name}</h3>
                        <p className="text-xs text-text-muted">Roll No. {student.rollNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-text-muted text-xs">Total</p>
                        <p className="font-bold text-text">{calcs.grandTotal}/800</p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-muted text-xs">%</p>
                        <p className="font-bold text-primary-400">{calcs.percentage}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-muted text-xs">Division</p>
                        <p className="font-bold text-emerald-400">{calcs.division}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-muted text-xs">Result</p>
                        <p className={`font-bold ${calcs.result === "Pass" ? "text-success" : "text-danger"}`}>{calcs.result}</p>
                      </div>
                    </div>
                  </div>

                  {/* Marks table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface/50 border-b border-border">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted uppercase w-8">S.No</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted uppercase">Subject</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted uppercase">Sub-Subject</th>
                          <th className="text-center px-3 py-2 text-xs font-semibold text-text-muted uppercase w-20">UT (20)</th>
                          <th className="text-center px-3 py-2 text-xs font-semibold text-text-muted uppercase w-20">CP (10)</th>
                          <th className="text-center px-3 py-2 text-xs font-semibold text-text-muted uppercase w-20">HYE (70)</th>
                          <th className="text-center px-3 py-2 text-xs font-semibold text-text-muted uppercase w-20">Total (100)</th>
                          <th className="text-center px-3 py-2 text-xs font-semibold text-text-muted uppercase w-24">Group Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SUBJECT_GROUPS.map((group) => {
                          const groupTotal = calcGroupTotal(localData[student.id]?.marks || {}, group.subjects);

                          return group.subjects.map((subjKey, si) => {
                            const subj = SUBJECTS.find(s => s.key === subjKey)!;
                            const marks = localData[student.id]?.marks?.[subjKey] || { ut: null, cp: null, hye: null };
                            const subjectTotal = calcSubjectTotal(marks);

                            return (
                              <tr key={subjKey} className="border-b border-border/30 hover:bg-card-hover transition-colors">
                                {si === 0 && (
                                  <>
                                    <td className="px-4 py-2 font-medium text-text-muted" rowSpan={group.subjects.length}>{group.number}</td>
                                    <td className="px-4 py-2 font-medium text-text" rowSpan={group.subjects.length}>{group.label}</td>
                                  </>
                                )}
                                <td className="px-4 py-2 text-text-muted">{group.subjects.length > 1 ? subj.label : "—"}</td>
                                <td className="px-3 py-1 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={20}
                                    value={marks.ut ?? ""}
                                    onChange={(e) => updateMark(student.id, subjKey, "ut", e.target.value)}
                                    className="w-16 px-2 py-1.5 bg-surface border border-border rounded-lg text-center text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                                  />
                                </td>
                                <td className="px-3 py-1 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={marks.cp ?? ""}
                                    onChange={(e) => updateMark(student.id, subjKey, "cp", e.target.value)}
                                    className="w-16 px-2 py-1.5 bg-surface border border-border rounded-lg text-center text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                                  />
                                </td>
                                <td className="px-3 py-1 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={70}
                                    value={marks.hye ?? ""}
                                    onChange={(e) => updateMark(student.id, subjKey, "hye", e.target.value)}
                                    className="w-16 px-2 py-1.5 bg-surface border border-border rounded-lg text-center text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center font-medium text-text">{subjectTotal}</td>
                                {si === 0 && (
                                  <td className="px-3 py-2 text-center font-bold text-primary-400" rowSpan={group.subjects.length}>
                                    {groupTotal}/100
                                  </td>
                                )}
                              </tr>
                            );
                          });
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Additional fields */}
                  <div className="px-6 py-4 border-t border-border space-y-4">
                    {/* Grade-based subjects */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Grade-Based Subjects (A–D)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {GRADE_SUBJECTS.map((gs) => (
                          <div key={gs.key}>
                            <label className="block text-xs text-text-muted mb-1">{gs.label}</label>
                            <select
                              value={localData[student.id]?.grades?.[gs.key] || ""}
                              onChange={(e) => updateGrade(student.id, gs.key, e.target.value)}
                              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                            >
                              <option value="">—</option>
                              {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Attendance */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Attendance</h4>
                      <div className="grid grid-cols-2 gap-3 max-w-sm">
                        <div>
                          <label className="block text-xs text-text-muted mb-1">Working Days</label>
                          <input
                            type="number"
                            value={localData[student.id]?.attendance?.workingDays ?? ""}
                            onChange={(e) => updateAttendance(student.id, "workingDays", e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-muted mb-1">Days Present</label>
                          <input
                            type="number"
                            value={localData[student.id]?.attendance?.daysPresent ?? ""}
                            onChange={(e) => updateAttendance(student.id, "daysPresent", e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Evaluation */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Teacher Evaluation</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-text-muted mb-1">Evaluation</label>
                          <select
                            value={localData[student.id]?.evaluation?.evalText || ""}
                            onChange={(e) => updateEvaluation(student.id, "evalText", e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                          >
                            <option value="">Select evaluation...</option>
                            {EVALUATION_SENTENCES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-text-muted mb-1">Additional Remarks</label>
                          <input
                            type="text"
                            value={localData[student.id]?.evaluation?.remarks || ""}
                            onChange={(e) => updateEvaluation(student.id, "remarks", e.target.value)}
                            placeholder="Any additional remarks..."
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
