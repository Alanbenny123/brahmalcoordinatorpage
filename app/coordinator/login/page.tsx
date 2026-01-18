"use client";

import { useState } from "react";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";

export default function CoordinatorLoginPage() {
  const [data, setData] = useState({ event_id: "", event_pass: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ event_id: "", event_pass: "", global: "" });
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setErrors({ event_id: "", event_pass: "", global: "" });

    // Quick client-side guardrails
    const nextErrors = { event_id: "", event_pass: "", global: "" };
    if (!data.event_id.trim()) nextErrors.event_id = "Event ID is required";
    if (!data.event_pass.trim()) nextErrors.event_pass = "Password is required";
    const hasLocalErrors = Object.values(nextErrors).some(Boolean);
    if (hasLocalErrors) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coordinator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setLoading(false);

      if (result.success) {
        // Cookies are set by server, just redirect
        window.location.href = "/coordinator";
      } else {
        const message = result.message || result.error || "Login failed";
        setErrors((err) => ({ ...err, global: message }));
      }
    } catch (error) {
      setLoading(false);
      setErrors((err) => ({ ...err, global: "Something went wrong" }));
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px]" />

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Coordinator Login
          </h2>
          <p className="text-slate-400">Sign in to manage your assigned event</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Event ID</label>
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              placeholder="Enter your event ID"
              value={data.event_id}
              onChange={(e) => setData({ ...data, event_id: e.target.value })}
            />
            {errors.event_id && <p className="text-sm text-rose-400">{errors.event_id}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Event Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="••••••••"
                value={data.event_pass}
                onChange={(e) => setData({ ...data, event_pass: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.event_pass && <p className="text-sm text-rose-400">{errors.event_pass}</p>}
          </div>
        </div>

        {errors.global && <p className="text-sm text-rose-400 text-center">{errors.global}</p>}

        <button
          className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In as Coordinator"}
        </button>


      </div>
    </div>
  );
}
