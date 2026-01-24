"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import {
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  LogOut,
  RefreshCw,
  MapPin,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Eye,
  Search,
  Filter,
  X,
} from "lucide-react";

interface EventStats {
  total_registrations: number;
  total_participants: number;
  checked_in_participants: number;
  not_checked_in_participants: number;
}

interface EventData {
  $id: string;
  event_name: string;
  category: string;
  venue: string;
  date: string;
  time: string;
  completed: boolean;
  slots: number;
  remaining_slots: number;
  stats: EventStats;
}

interface Participant {
  team_name: string | null;
  student_name: string;
  email: string;
  phone: string;
  college: string;
  stud_id: string;
  checked_in: boolean;
}

export default function CoordinatorOverview() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [loadingParticipants, setLoadingParticipants] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "category" | "date" | "registrations" | "slots">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchAllEvents();
  }, []);

  async function fetchAllEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/coordinator/all-events");
      const data = await res.json();

      if (data.ok) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEventParticipants(eventId: string) {
    if (participants[eventId]) {
      // Already loaded, just toggle
      setExpandedEvent(expandedEvent === eventId ? null : eventId);
      return;
    }

    setLoadingParticipants(eventId);
    try {
      const res = await fetch(`/api/coordinator/event-participants?event_id=${eventId}`);
      const data = await res.json();

      if (data.ok) {
        setParticipants((prev) => ({
          ...prev,
          [eventId]: data.participants,
        }));
        setExpandedEvent(eventId);
      }
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    } finally {
      setLoadingParticipants(null);
    }
  }

  function toggleTeam(teamKey: string) {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamKey)) {
        newSet.delete(teamKey);
      } else {
        newSet.add(teamKey);
      }
      return newSet;
    });
  }

  async function logout() {
    try {
      await fetch("/api/coordinator/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.href = "/coordinator/login";
  }

  // Calculate overall stats
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => !e.completed).length;
  const totalRegistrations = events.reduce((sum, e) => sum + e.stats.total_registrations, 0);
  const totalParticipants = events.reduce((sum, e) => sum + e.stats.total_participants, 0);
  const totalCheckedIn = events.reduce((sum, e) => sum + e.stats.checked_in_participants, 0);

  // Filter events based on search query
  const filteredEvents = events.filter((event) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      event.event_name.toLowerCase().includes(searchLower) ||
      event.category?.toLowerCase().includes(searchLower) ||
      event.venue?.toLowerCase().includes(searchLower)
    );
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case "name":
        compareValue = a.event_name.localeCompare(b.event_name);
        break;
      case "category":
        compareValue = (a.category || "").localeCompare(b.category || "");
        break;
      case "date":
        compareValue = (a.date || "").localeCompare(b.date || "");
        break;
      case "registrations":
        compareValue = a.stats.total_registrations - b.stats.total_registrations;
        break;
      case "slots":
        compareValue = a.remaining_slots - b.remaining_slots;
        break;
    }
    
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg lg:text-xl">
              M
            </div>
            <div>
              <p className="text-white font-medium text-sm lg:text-lg">Main Coordinator</p>
              <p className="text-xs lg:text-sm text-slate-500">All Events Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllEvents}
              className="p-2 lg:p-3 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={clsx("w-5 h-5 lg:w-6 lg:h-6 text-slate-400", loading && "animate-spin")} />
            </button>
            <button
              onClick={logout}
              className="p-2 lg:p-3 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />
            </button>
          </div>
        </header>

        {/* Overall Stats */}
        <div className="p-6 lg:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400" />
            <h2 className="text-xl lg:text-2xl font-bold text-white">Overall Statistics</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
              <p className="text-xl lg:text-2xl font-bold text-indigo-400">{totalEvents}</p>
              <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">Total Events</p>
            </div>
            <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
              <p className="text-xl lg:text-2xl font-bold text-emerald-400">{activeEvents}</p>
              <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">Active Events</p>
            </div>
            <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
              <p className="text-xl lg:text-2xl font-bold text-purple-400">{totalRegistrations}</p>
              <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">Total Registrations</p>
            </div>
            <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
              <p className="text-xl lg:text-2xl font-bold text-amber-400">{totalParticipants}</p>
              <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">Total Participants</p>
            </div>
            <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
              <p className="text-xl lg:text-2xl font-bold text-rose-400">{totalCheckedIn}</p>
              <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">Checked In</p>
            </div>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-6 p-4 lg:p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event name, category, or venue..."
                className="w-full pl-10 pr-10 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-800 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="name">Sort by Name</option>
                  <option value="category">Sort by Category</option>
                  <option value="date">Sort by Date</option>
                  <option value="registrations">Sort by Registrations</option>
                  <option value="slots">Sort by Remaining Slots</option>
                </select>
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-3 bg-slate-950/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortOrder === "asc" ? (
                  <ChevronUp className="w-5 h-5 text-amber-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400" />
            All Events ({sortedEvents.length} {sortedEvents.length !== events.length && `of ${events.length}`})
          </h2>

          {sortedEvents.length === 0 ? (
            <div className="text-center py-12 lg:py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <Calendar className="w-12 h-12 lg:w-16 lg:h-16 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 lg:text-lg">
                {searchQuery ? "No events match your search" : "No events found"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEvents.map((event) => {
                const eventParticipants = participants[event.$id] || [];
                const isExpanded = expandedEvent === event.$id;
                const isLoadingThis = loadingParticipants === event.$id;

                // Group participants by team
                const participantsByTeam = eventParticipants.reduce((acc, participant) => {
                  const teamName = participant.team_name || "Individual Participants";
                  if (!acc[teamName]) {
                    acc[teamName] = [];
                  }
                  acc[teamName].push(participant);
                  return acc;
                }, {} as Record<string, Participant[]>);

                const teamNames = Object.keys(participantsByTeam).sort((a, b) => {
                  if (a === "Individual Participants") return 1;
                  if (b === "Individual Participants") return -1;
                  return a.localeCompare(b);
                });

                return (
                  <div
                    key={event.$id}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all"
                  >
                    {/* Event Header */}
                    <div className="p-4 lg:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg lg:text-xl font-bold text-white">{event.event_name}</h3>
                            <span
                              className={clsx(
                                "px-2 py-1 rounded-full text-xs font-semibold",
                                event.completed
                                  ? "bg-slate-600 text-slate-300"
                                  : "bg-emerald-500 text-white"
                              )}
                            >
                              {event.completed ? "Completed" : "Active"}
                            </span>
                          </div>
                          {event.category && (
                            <p className="text-sm text-slate-400 mb-2">Category: {event.category}</p>
                          )}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            {event.venue && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="truncate">{event.venue}</span>
                              </div>
                            )}
                            {event.date && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                <span>{event.date}</span>
                              </div>
                            )}
                            {event.time && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3.5 h-3.5 text-purple-400" />
                                <span>{event.time}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Event Stats */}
                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-3 mb-4">
                        <div className="p-2 lg:p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                          <p className="text-base lg:text-lg font-bold text-indigo-400">{event.stats.total_registrations}</p>
                          <p className="text-xs text-slate-500">Registrations</p>
                        </div>
                        <div className="p-2 lg:p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                          <p className="text-base lg:text-lg font-bold text-purple-400">{event.stats.total_participants}</p>
                          <p className="text-xs text-slate-500">Participants</p>
                        </div>
                        <div className="p-2 lg:p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                          <p className="text-base lg:text-lg font-bold text-emerald-400">{event.stats.checked_in_participants}</p>
                          <p className="text-xs text-slate-500">Checked In</p>
                        </div>
                        <div className="p-2 lg:p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                          <p className="text-base lg:text-lg font-bold text-amber-400">{event.stats.not_checked_in_participants}</p>
                          <p className="text-xs text-slate-500">Pending</p>
                        </div>
                        <div className="p-2 lg:p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                          <p className="text-base lg:text-lg font-bold text-blue-400">{event.slots}</p>
                          <p className="text-xs text-slate-500">Total Slots</p>
                        </div>
                        <div className="p-2 lg:p-3 bg-slate-950/50 border border-emerald-500/30 rounded-lg bg-emerald-500/5">
                          <p className="text-base lg:text-lg font-bold text-emerald-400">{event.remaining_slots}</p>
                          <p className="text-xs text-emerald-400">Remaining</p>
                        </div>
                      </div>

                      {/* View Participants Button */}
                      <button
                        onClick={() => fetchEventParticipants(event.$id)}
                        disabled={isLoadingThis}
                        className="w-full py-2 lg:py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm lg:text-base"
                      >
                        {isLoadingThis ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading Participants...
                          </>
                        ) : isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Participants
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            View Participants ({event.stats.total_participants})
                          </>
                        )}
                      </button>
                    </div>

                    {/* Participants List (Expanded) */}
                    {isExpanded && eventParticipants.length > 0 && (
                      <div className="border-t border-slate-800 p-4 lg:p-6 bg-slate-950/30">
                        <h4 className="text-sm lg:text-base font-semibold text-white mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-400" />
                          Participants ({eventParticipants.length})
                        </h4>
                        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                          {teamNames.map((teamName) => {
                            const teamMembers = participantsByTeam[teamName];
                            const checkedInCount = teamMembers.filter((m) => m.checked_in).length;
                            const teamKey = `${event.$id}-${teamName}`;
                            const isTeamExpanded = expandedTeams.has(teamKey);

                            return (
                              <div
                                key={teamKey}
                                className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden"
                              >
                                {/* Team Header */}
                                <button
                                  onClick={() => toggleTeam(teamKey)}
                                  className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                                      {teamName === "Individual Participants"
                                        ? "👤"
                                        : teamName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-white">{teamName}</p>
                                      <p className="text-xs text-slate-500">
                                        {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"} • {checkedInCount} checked in
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                                      {checkedInCount}/{teamMembers.length}
                                    </div>
                                    {isTeamExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-slate-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                </button>

                                {/* Team Members */}
                                {isTeamExpanded && (
                                  <div className="border-t border-slate-700 divide-y divide-slate-700">
                                    {teamMembers.map((participant, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3 pl-12 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <div
                                            className={clsx(
                                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                              participant.checked_in
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                : "bg-slate-800 text-slate-400 border border-slate-700"
                                            )}
                                          >
                                            {participant.student_name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-white truncate">
                                              {participant.student_name}
                                            </p>
                                            {participant.email && (
                                              <p className="text-xs text-slate-500 truncate">{participant.email}</p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-2">
                                          {participant.checked_in ? (
                                            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                            </span>
                                          ) : (
                                            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                              <XCircle className="w-3.5 h-3.5" />
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isExpanded && eventParticipants.length === 0 && (
                      <div className="border-t border-slate-800 p-4 lg:p-6 bg-slate-950/30 text-center">
                        <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No participants yet</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
