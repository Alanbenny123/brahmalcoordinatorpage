"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  User,
  Mail,
  Ticket,
  Award,
  LogOut,
  Edit2,
  X,
  Check,
  Loader2
} from "lucide-react";
import { clsx } from "clsx";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  certificates: string[];
  tickets: string[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<"tickets" | "certificates">("tickets");

  // Edit Form State
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate verifying session or mostly just reading generic user data
    // In a real app this might hit /api/auth/me
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        setForm({ name: u.name, email: u.email, password: "" });
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
    setLoading(false);
  }, []);

  async function updateProfile() {
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          certificates: user.certificates,
          tickets: user.tickets,
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user)); // update local
        // Merge updates back to state, keeping tickets/certs which might not be in response if not requested
        setUser({ ...user, ...data.user });
        setEdit(false);
        // Could add toast here
      } else {
        alert(data.error || "Update failed");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Access Denied
        </h2>
        <p className="text-slate-400">Please log in to view your profile.</p>
        <button
          onClick={() => window.location.href = "/login"}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-medium transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="text-slate-400 text-lg">Manage your festival pass and achievements.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setEdit(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full transition-all backdrop-blur-md group"
            >
              <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="font-medium text-slate-400 group-hover:text-white">Edit</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-full transition-all backdrop-blur-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </header>

        {/* User Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Identity Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-slate-400 flex items-center gap-2 text-sm">
                  <Mail className="w-3 h-3" /> {user.email}
                </p>

                <div className="mt-6 flex gap-3 w-full">
                  <div className="flex-1 p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col items-center">
                    <span className="text-2xl font-bold text-indigo-400">{user.tickets?.length || 0}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tickets</span>
                  </div>
                  <div className="flex-1 p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col items-center">
                    <span className="text-2xl font-bold text-purple-400">{user.certificates?.length || 0}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Awards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="md:col-span-2">

            {/* Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm w-fit">
              <button
                onClick={() => setActiveTab("tickets")}
                className={clsx(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === "tickets"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Ticket className="w-4 h-4" />
                My Tickets
              </button>
              <button
                onClick={() => setActiveTab("certificates")}
                className={clsx(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === "certificates"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Award className="w-4 h-4" />
                Certificates
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === "tickets" && (
                <div className="space-y-4">
                  {!user.tickets || user.tickets.length === 0 ? (
                    <EmptyState
                      icon={Ticket}
                      title="No tickets found"
                      desc="You haven't purchased any tickets yet. Browse events to get started!"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.tickets.map((ticketId, idx) => (
                        <TicketCard key={idx} ticketId={ticketId} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "certificates" && (
                <div className="space-y-4">
                  {!user.certificates || user.certificates.length === 0 ? (
                    <EmptyState
                      icon={Award}
                      title="No certificates yet"
                      desc="Participate in events and workshops to earn certificates."
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {user.certificates.map((certId, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-950 flex items-center justify-center text-purple-500 border border-slate-800">
                              <Award className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-200">Certificate ID: {certId}</h3>
                              <p className="text-sm text-slate-500">Issued for event participation</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 text-sm bg-slate-950 border border-slate-800 text-slate-300 rounded-lg hover:text-white hover:border-slate-600 transition-colors">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* MODAL */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button onClick={() => setEdit(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <input
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-slate-500 cursor-not-allowed"
                  value={form.email}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">New Password <span className="text-xs text-slate-600">(leave empty to keep current)</span></label>
                <input
                  type="password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEdit(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                disabled={saving}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function TicketCard({ ticketId }: { ticketId: string }) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(ticketId, { width: 256, margin: 2, color: { dark: "#000", light: "#FFF" } })
      .then(setSrc)
      .catch((err) => console.error("QR Gen Error", err));
  }, [ticketId]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl overflow-hidden relative flex flex-col items-center gap-4 group">
      {/* Ticket Design Stub - mimicing a physical ticket */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="w-full flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Ticket className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900">Event Pass</span>
        </div>
        <span className="text-xs font-mono text-slate-400">{ticketId.substring(0, 8)}...</span>
      </div>

      <div className="bg-white p-2 rounded-lg border-2 border-slate-900 w-full flex justify-center">
        {src ? (
          <img
            src={src}
            alt="Ticket QR"
            className="w-full max-w-[140px] h-auto"
          />
        ) : (
          <div className="w-[140px] h-[140px] bg-slate-100 animate-pulse rounded" />
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Scan to Enter</p>
        <p className="text-xs text-slate-300">ID: {ticketId}</p>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-slate-400 max-w-xs">{desc}</p>
    </div>
  )
}
