"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ClassData {
  id: string;
  academicYear: string;
  className: string;
  section: string;
  createdAt: string;
  _count: { students: number };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async (teacherId: string) => {
    try {
      const res = await fetch(`/api/classes?teacherId=${teacherId}`);
      const data = await res.json();
      setClasses(data);
    } catch {
      console.error("Failed to fetch history");
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
    fetchHistory(t.id);
  }, [router, fetchHistory]);

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-text">History</h1>
          </div>
          <div className="flex-1 ml-8 flex items-center gap-6 hidden sm:flex">
            <button onClick={() => router.push('/dashboard')} className="text-sm font-medium text-text-muted hover:text-text transition-colors">Dashboard</button>
            <button onClick={() => router.push('/history')} className="text-sm font-medium text-text hover:text-primary-400 transition-colors">History</button>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text">Class History</h2>
          <p className="text-text-muted text-sm mt-1">Timeline of all classes you have created</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <h3 className="text-lg font-semibold text-text mb-1">No history yet</h3>
            <p className="text-text-muted text-sm">Create a class in the Dashboard to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => (
              <div key={cls.id} onClick={() => router.push(`/class/${cls.id}`)} className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary-500/30 hover:bg-card-hover transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold group-hover:scale-110 transition-transform">
                    {cls.className}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text">Class {cls.className} - Section {cls.section}</h3>
                    <p className="text-sm text-text-muted">Academic Year: {cls.academicYear}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-text">{cls._count.students} Students</p>
                    <p className="text-xs text-text-muted">Enrolled</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text">
                      {new Date(cls.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-text-muted">Created</p>
                  </div>
                  <svg className="w-5 h-5 text-text-muted group-hover:text-primary-400 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
