"use client";

import { motion } from "framer-motion";

interface EventCardProps {
    event: any;
    onEdit: (event: any) => void;
    onDelete: (event: any) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
    // Fallback image if poster is missing or invalid URL
    const posterUrl = event.poster && event.poster.startsWith("http")
        ? event.poster
        : "https://via.placeholder.com/400x600?text=No+Poster";

    // Format date readable
    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            className="relative group rounded-xl overflow-hidden bg-gray-800 shadow-lg border border-gray-700 hover:shadow-2xl hover:border-purple-500/50 transition-all"
        >
            {/* Poster Image */}
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={posterUrl}
                    alt={event.event_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x200?text=No+Image")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />

                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase ${event.completed ? "bg-green-500 text-white" : "bg-yellow-500 text-black"}`}>
                    {event.completed ? "Completed" : "Active"}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 relative mt-[-2rem]">
                <h3 className="text-xl font-bold text-white mb-1 truncate">{event.event_name}</h3>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                    <span className="mr-2">📅 {formattedDate}</span>
                    <span>⏰ {event.time}</span>
                </div>

                <div className="text-sm text-gray-400 mb-4 line-clamp-2">
                    📍 {event.venue}
                    <br />
                    👤 {Array.isArray(event.coordinator) ? event.coordinator.join(", ") : event.coordinator}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-700">
                    <button
                        onClick={() => onEdit(event)}
                        className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(event)}
                        className="flex-1 py-2 px-3 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-900 rounded-lg text-sm font-medium transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
