"use client";

import { useState } from "react";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function MainCoordinatorLoginPage() {
  const [data, setData] = useState({ coordinator_id: "", coordinator_pass: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ coordinator_id: "", coordinator_pass: "", global: "" });
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setErrors({ coordinator_id: "", coordinator_pass: "", global: "" });

    // Quick client-side guardrails
    const nextErrors = { coordinator_id: "", coordinator_pass: "", global: "" };
    if (!data.coordinator_id.trim()) nextErrors.coordinator_id = "Coordinator ID is required";
    if (!data.coordinator_pass.trim()) nextErrors.coordinator_pass = "Password is required";
    const hasLocalErrors = Object.values(nextErrors).some(Boolean);
    if (hasLocalErrors) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coordinator/main-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setLoading(false);

      if (result.success) {
        // Cookies are set by server, just redirect
        window.location.href = "/coordinator/overview";
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Main Coordinator
          </h2>
          <p className="text-slate-400">Access all events overview</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Coordinator ID</label>
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              placeholder="Enter your coordinator ID"
              value={data.coordinator_id}
              onChange={(e) => setData({ ...data, coordinator_id: e.target.value })}
            />
            {errors.coordinator_id && <p className="text-sm text-rose-400">{errors.coordinator_id}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="••••••••"
                value={data.coordinator_pass}
                onChange={(e) => setData({ ...data, coordinator_pass: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.coordinator_pass && <p className="text-sm text-rose-400">{errors.coordinator_pass}</p>}
          </div>
        </div>

        {errors.global && <p className="text-sm text-rose-400 text-center">{errors.global}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="text-center">
          <Link
            href="/coordinator/login"
            className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            Event Coordinator Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
