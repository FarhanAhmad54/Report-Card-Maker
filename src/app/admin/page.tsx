"use client";

import { useState, useEffect } from "react";

interface GlobalStats {
  totalTeachers: number;
  totalClasses: number;
  totalStudents: number;
}

interface TeacherAnalytics {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  createdAt: string;
  totalClasses: number;
  totalStudents: number;
}

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [teachers, setTeachers] = useState<TeacherAnalytics[]>([]);

  useEffect(() => {
    // Check if previously authenticated in session
    const savedPasscode = sessionStorage.getItem("adminPasscode");
    if (savedPasscode) {
      setPasscode(savedPasscode);
      handleLogin(savedPasscode);
    }
  }, []);

  const handleLogin = async (codeToUse = passcode) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${codeToUse}`,
        },
      });

      if (!res.ok) {
        throw new Error("Invalid Passcode");
      }

      const data = await res.json();
      setGlobalStats(data.globalStats);
      setTeachers(data.teachers);
      setIsAuthenticated(true);
      sessionStorage.setItem("adminPasscode", codeToUse);
    } catch (err: any) {
      setError(err.message);
      sessionStorage.removeItem("adminPasscode");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("adminPasscode");
    setIsAuthenticated(false);
    setPasscode("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-gray-200 flex items-center justify-center p-6">
        <div className="bg-[#1F2833] p-8 rounded-2xl border border-[#3C4A5A] shadow-2xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400 mb-8">Enter passcode to view global analytics.</p>
          
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter Admin Passcode"
            className="w-full bg-[#0B0C10] border border-[#3C4A5A] rounded-xl px-4 py-3 mb-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          
          {error && <p className="text-red-400 mb-4">{error}</p>}
          
          <button
            onClick={() => handleLogin()}
            disabled={loading || !passcode}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading ? "Verifying..." : "Access Analytics"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Global Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Overview of all users and platform activity</p>
          </div>
          <button 
            onClick={logout}
            className="bg-[#1F2833] hover:bg-[#2A3644] border border-[#3C4A5A] px-5 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Lock Dashboard
          </button>
        </div>

        {/* Global Stats Cards */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#1F2833] border border-[#3C4A5A] rounded-2xl p-6 shadow-xl">
              <h3 className="text-gray-400 text-sm font-medium mb-1">Total Registered Users</h3>
              <p className="text-4xl font-bold text-white">{globalStats.totalTeachers}</p>
            </div>
            <div className="bg-[#1F2833] border border-[#3C4A5A] rounded-2xl p-6 shadow-xl">
              <h3 className="text-gray-400 text-sm font-medium mb-1">Total Classes Created</h3>
              <p className="text-4xl font-bold text-emerald-400">{globalStats.totalClasses}</p>
            </div>
            <div className="bg-[#1F2833] border border-[#3C4A5A] rounded-2xl p-6 shadow-xl">
              <h3 className="text-gray-400 text-sm font-medium mb-1">Total Students Managed</h3>
              <p className="text-4xl font-bold text-indigo-400">{globalStats.totalStudents}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-[#1F2833] border border-[#3C4A5A] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-[#3C4A5A]">
            <h2 className="text-xl font-bold text-white">All Users (Teachers)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161D26] text-gray-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Hashed Password</th>
                  <th className="px-6 py-4 font-medium text-center">Classes</th>
                  <th className="px-6 py-4 font-medium text-center">Students</th>
                  <th className="px-6 py-4 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3C4A5A]">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-[#2A3644] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{teacher.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-indigo-300">{teacher.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-[#0B0C10] text-gray-400 px-2 py-1 rounded max-w-[200px] truncate inline-block" title={teacher.hashedPassword}>
                        {teacher.hashedPassword.substring(0, 20)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-emerald-400">
                      {teacher.totalClasses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-indigo-400">
                      {teacher.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No users registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
