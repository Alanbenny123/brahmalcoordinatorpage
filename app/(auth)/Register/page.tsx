"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [data, setData] = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(){
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method:"POST",
      headers:{ "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    setLoading(false);

    if(result.success){
      alert("Registration successful ✔");
      window.location.href="/login";
    } else alert(result.error);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>

        <input
          className="w-full p-2 border rounded"
          placeholder="Full Name"
          onChange={e=>setData({...data, name:e.target.value})}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          type="email"
          onChange={e=>setData({...data, email:e.target.value})}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Password"
          type="password"
          onChange={e=>setData({...data, password:e.target.value})}
        />

        <button
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account? <a className="text-blue-600" href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
