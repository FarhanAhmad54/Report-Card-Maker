"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ClassData {
  id: string;
  academicYear: string;
  className: string;
  section: string;
  _count: { students: number };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchClasses = useCallback(async (teacherId: string) => {
    try {
      const res = await fetch(`/api/classes?teacherId=${teacherId}`);
      const data = await res.json();
      setClasses(data);
    } catch {
      console.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("teacher");
    if (!stored) {
      router.push("/");
      return;
    }
    const t = JSON.parse(stored) as Teacher;
    setTeacher(t);
    fetchClasses(t.id);
  }, [router, fetchClasses]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicYear, className, section, teacherId: teacher.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setShowCreateModal(false);
      setClassName("");
      setSection("");
      fetchClasses(teacher.id);
    } catch {
      setError("Failed to create class");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure? This will delete all students and marks in this class.")) return;
    try {
      await fetch(`/api/classes/${classId}`, { method: "DELETE" });
      if (teacher) fetchClasses(teacher.id);
    } catch {
      console.error("Failed to delete class");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacher");
    router.push("/");
  };

  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Navbar */}
      <nav className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-text">Report Card Maker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted hidden sm:block">Welcome, <span className="text-primary-400 font-medium">{teacher.name}</span></span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-text-muted hover:text-danger border border-border rounded-lg hover:border-danger/50 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text">My Classes</h2>
            <p className="text-text-muted text-sm mt-1">Manage your classes and student report cards</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-500/40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Class
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && classes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-surface-lighter rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text mb-1">No classes yet</h3>
            <p className="text-text-muted text-sm">Create your first class to start managing report cards</p>
          </div>
        )}

        {/* Classes Grid */}
        {!loading && classes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary-500/30 hover:bg-card-hover transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/class/${cls.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-primary-400 font-bold text-lg">{cls.className}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClass(cls.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-text mb-1">
                  Class {cls.className} — Section {cls.section}
                </h3>
                <p className="text-sm text-text-muted mb-3">{cls.academicYear}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-primary-500/10 text-primary-400 rounded-lg font-medium">
                    {cls._count.students} students
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-text mb-4">Create New Class</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Class</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    required
                    placeholder="e.g., 5, 10"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    required
                    placeholder="e.g., A, B"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-border text-text-muted rounded-xl hover:bg-surface-lighter transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
