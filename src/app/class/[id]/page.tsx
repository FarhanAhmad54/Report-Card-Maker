"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  rollNumber: number;
  name: string;
  marks?: { grandTotal?: number; percentage?: number; rank?: number; division?: string; result?: string } | null;
}

interface ClassInfo {
  id: string;
  academicYear: string;
  className: string;
  section: string;
  students: Student[];
}

export default function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newRollNumber, setNewRollNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchClass = useCallback(async () => {
    try {
      const res = await fetch(`/api/classes/${id}`);
      const data = await res.json();
      setClassInfo(data);
    } catch {
      console.error("Failed to fetch class");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const stored = localStorage.getItem("teacher");
    if (!stored) { router.push("/"); return; }
    fetchClass();
  }, [fetchClass, router]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");

    try {
      const res = await fetch(`/api/classes/${id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber: newRollNumber, name: newName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setNewRollNumber("");
      setNewName("");
      setShowAddStudent(false);
      fetchClass();
    } catch {
      setError("Failed to add student");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Delete this student?")) return;
    try {
      await fetch(`/api/students/${studentId}`, { method: "DELETE" });
      fetchClass();
    } catch {
      console.error("Failed to delete student");
    }
  };

  if (loading || !classInfo) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard")} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-lighter transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-text">Class {classInfo.className} — {classInfo.section}</h1>
              <p className="text-xs text-text-muted">{classInfo.academicYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/class/${id}/marks`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-600/25"
            >
              📝 Enter Marks
            </button>
            <button
              onClick={() => router.push(`/class/${id}/report`)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-primary-600/25"
            >
              🖨️ Report Cards
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-text-muted text-sm">Total Students</p>
            <p className="text-3xl font-bold text-text mt-1">{classInfo.students.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-text-muted text-sm">Class</p>
            <p className="text-3xl font-bold text-primary-400 mt-1">{classInfo.className}-{classInfo.section}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-text-muted text-sm">Academic Year</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{classInfo.academicYear}</p>
          </div>
        </div>

        {/* Student List Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">Student List</h2>
          <button
            onClick={() => setShowAddStudent(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
        </div>

        {/* Students Table */}
        {classInfo.students.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Roll No</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">%</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Rank</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Division</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Result</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classInfo.students.map((student, i) => (
                    <tr key={student.id} className={`border-b border-border/50 hover:bg-card-hover transition-colors ${i % 2 === 0 ? "bg-surface/20" : ""}`}>
                      <td className="px-6 py-4 text-sm font-mono text-primary-400">{student.rollNumber}</td>
                      <td className="px-6 py-4 text-sm font-medium text-text">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-center text-text-muted">{student.marks?.grandTotal ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-center text-text-muted">{student.marks?.percentage != null ? `${student.marks.percentage}%` : "—"}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        {student.marks?.rank ? (
                          <span className="px-2 py-0.5 bg-warning/10 text-warning rounded-md text-xs font-medium">#{student.marks.rank}</span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-text-muted">{student.marks?.division ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        {student.marks?.result ? (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${student.marks.result === "Pass" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                            {student.marks.result}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-all"
                          title="Delete student"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="text-text-muted">No students yet. Add students to get started.</p>
          </div>
        )}
      </main>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-text mb-4">Add Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Roll Number</label>
                <input
                  type="number"
                  value={newRollNumber}
                  onChange={(e) => setNewRollNumber(e.target.value)}
                  required
                  placeholder="e.g., 1"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Student Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="Full name"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddStudent(false)} className="flex-1 py-3 border border-border text-text-muted rounded-xl hover:bg-surface-lighter transition-all">Cancel</button>
                <button type="submit" disabled={adding} className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50">
                  {adding ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
