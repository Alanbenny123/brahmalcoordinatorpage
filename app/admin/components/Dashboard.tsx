"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Dashboard({ setActive }: { setActive: (page: string) => void }) {
    const [stats, setStats] = useState({
        events: 0,
        users: 0,
        tickets: 0,
        attendance: 0,
    });

    useEffect(() => {
        // Simulate fetching stats or fetch real ones if APIs exist
        const fetchStats = async () => {
            try {
                // Fetch events count
                const eventRes = await fetch("/api/events");
                const events = await eventRes.json();

                // You would ideally have endpoints for these or calculate them
                // For now, let's use the events count and mock others for visual structure
                // purely to demonstrate the UI until those APIs are robust
                setStats({
                    events: Array.isArray(events) ? events.length : 0,
                    users: 120, // Mock
                    tickets: 45, // Mock
                    attendance: 30, // Mock
                });

            } catch (e) {
                console.error("Failed to load stats", e);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: "Total Events", value: stats.events, color: "from-blue-500 to-cyan-400", page: "events" },
        { title: "Registered Users", value: stats.users, color: "from-purple-500 to-pink-400", page: "users" },
        { title: "Tickets Sold", value: stats.tickets, color: "from-orange-500 to-amber-400", page: "tickets" },
        { title: "Attendance", value: stats.attendance, color: "from-green-500 to-emerald-400", page: "attendance" },
    ];

    return (
        <div className="p-8 w-full min-h-screen bg-gray-900 text-white">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Fest Dashboard
                </h1>
                <p className="text-gray-400 mb-8">Welcome back, Admin. Here's what's happening.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg cursor-pointer transform transition hover:scale-105`}
                        onClick={() => setActive(card.page)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <h3 className="text-lg font-medium text-white/80">{card.title}</h3>
                        <p className="text-4xl font-bold text-white mt-2">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions or Recent Activity placeholder */}
                <motion.div
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-xl font-semibold mb-4 text-purple-300">Quick Actions</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActive('events')}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                        >
                            Add New Event
                        </button>
                        <button
                            onClick={() => setActive('users')}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                        >
                            Manage Users
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">System Status</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-gray-300">All systems operational</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
                </motion.div>
            </div>
        </div>
    );
}
