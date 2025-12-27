"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      // alert("Registration successful ✔"); // Removed alert
      window.location.href = "/login";
    } else alert(result.error);
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 relative z-10">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-slate-400">Join the fest and grab your tickets</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              placeholder="John Doe"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              placeholder="you@example.com"
              type="email"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              placeholder="At least 6 characters"
              type="password"
              value={data.password}
              onChange={e => setData({ ...data, password: e.target.value })}
            />
          </div>
        </div>

        <button
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Started"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Already have an account? <a className="text-purple-400 hover:text-purple-300 font-medium transition-colors" href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}
