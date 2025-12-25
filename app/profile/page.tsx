"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setForm({ name: u.name, email: u.email, password: "" });
    }
  }, []);

  async function updateProfile() {
    if (!user) return;

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        name: form.name,
        email: form.email,
        password: form.password || undefined,
      })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user)); // update local
      setUser(data.user);
      setEdit(false);
      alert("Profile Updated ✔");
    } else {
      alert(data.error);
    }
  }

  function logout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Not logged in
      </div>
    );

  return (
    <div className="p-6 max-w-xl mx-auto h-screen">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setEdit(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-800"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ✏ Edit Modal */}
      {edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md space-y-4 shadow-lg">
            <h2 className="text-xl font-bold">Edit Profile</h2>

            <input
              className="w-full p-2 border rounded"
              placeholder="Name"
              value={form.name}
              onChange={(e)=>setForm({...form, name:e.target.value})}
            />

            <input
              className="w-full p-2 border rounded"
              placeholder="Email"
              value={form.email}
              onChange={(e)=>setForm({...form, email:e.target.value})}
            />

            <input
              type="password"
              className="w-full p-2 border rounded"
              placeholder="New Password (optional)"
              onChange={(e)=>setForm({...form, password:e.target.value})}
            />

            <div className="flex gap-3 mt-2">
              <button
                className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={updateProfile}
              >
                Save
              </button>

              <button
                className="flex-1 py-2 bg-gray-300 rounded"
                onClick={() => setEdit(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
