"use client";

import { useState } from "react";

export default function LoginPage(){
  const [data, setData] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);

  async function handleLogin(){
    setLoading(true);
    const res = await fetch("/api/auth/login",{
      method:"POST",
      headers:{ "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    setLoading(false);

    if(result.success){
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      alert("Login Successful ✔");
      window.location.href="/profile";
    } else alert(result.message || result.error);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          onChange={e=>setData({...data,email:e.target.value})}
        />

        <input
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Password"
          onChange={e=>setData({...data,password:e.target.value})}
        />

        <button
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          New User? <a className="text-blue-600" href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
