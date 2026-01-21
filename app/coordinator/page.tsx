"use client";

import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import {
  Calendar,
  QrCode,
  Users,
  Trophy,
  Loader2,
  CheckCircle2,
  XCircle,
  Award,
  LogOut,
  RefreshCw,
  Camera,
  X,
  Settings,
  MapPin,
  Clock,
  Save,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

// Types
interface CoordinatorData {
  id: string;
  event_name: string;
}

interface EventData {
  event_name: string;
  completed: boolean;
  venue?: string;
  date?: string;
  time?: string;
  slot?: string;
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

interface DashboardStats {
  total_registrations: number;
  total_participants: number;
  checked_in_participants: number;
  not_checked_in_participants: number;
}

interface ScanResult {
  ok: boolean;
  error?: string;
  ticket_active?: boolean;
  members?: { stud_id: string; name: string; present: boolean }[];
}

type MainTab = "scanner" | "participants" | "winners" | "settings";

export default function CoordinatorDashboard() {
  // Auth state
  const [coordinator, setCoordinator] = useState<CoordinatorData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Event state
  const [event, setEvent] = useState<EventData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [mainTab, setMainTab] = useState<MainTab>("scanner");

  // Scanner state
  const [ticketInput, setTicketInput] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Winners state
  const [winners, setWinners] = useState<{
    first: string;
    second: string;
    third: string;
  }>({ first: "", second: "", third: "" });
  const [savingWinners, setSavingWinners] = useState(false);

  // Event settings state
  const [eventSettings, setEventSettings] = useState({
    venue: "",
    date: "",
    time: "",
    slot: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [closingEvent, setClosingEvent] = useState(false);

  // Participants state
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Camera scanner state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Get unique team names from participants
  const uniqueTeams = Array.from(
    new Set(
      participants
        .filter((p) => p.team_name)
        .map((p) => p.team_name as string)
    )
  ).sort();

  // Group participants by team
  const participantsByTeam = participants.reduce((acc, participant) => {
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

  // Toggle team expansion
  const toggleTeam = (teamName: string) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamName)) {
        newSet.delete(teamName);
      } else {
        newSet.add(teamName);
      }
      return newSet;
    });
  };

  // Check authentication on mount (fetch coordinator info from server)
  useEffect(() => {
    async function loadCoordinator() {
      try {
        // Fetch dashboard data which will validate session
        const statsRes = await fetch("/api/coordinator/dashboard");
        const statsData = await statsRes.json();

        if (statsData.ok && statsData.event) {
          // Extract coordinator info from event data
          setCoordinator({
            id: statsData.event.$id || 'unknown',
            event_name: statsData.event.event_name || 'Event',
          });
        } else {
          // Not authenticated, middleware should redirect but as backup
          window.location.href = "/coordinator/login";
        }
      } catch (error) {
        console.error("Failed to load coordinator:", error);
        window.location.href = "/coordinator/login";
      } finally {
        setAuthLoading(false);
      }
    }

    loadCoordinator();
  }, []);

  // Fetch event data when coordinator is loaded
  useEffect(() => {
    if (!coordinator?.id) return;
    fetchDashboardData();
  }, [coordinator]);

  async function fetchDashboardData() {
    if (!coordinator?.id) return;
    setLoading(true);

    try {
      // Fetch dashboard stats and event info (event ID from cookie)
      const statsRes = await fetch("/api/coordinator/dashboard");
      const statsData = await statsRes.json();

      if (statsData.ok) {
        setEvent(statsData.event);
        setStats(statsData.stats);
        
        // Set event settings from dashboard data as initial values
        setEventSettings({
          venue: statsData.event.venue || "",
          date: statsData.event.date || "",
          time: statsData.event.time || "",
          slot: statsData.event.slot || "",
        });
      }

      // Fetch participants (event ID from cookie)
      const participantsRes = await fetch("/api/coordinator/participants");
      const participantsData = await participantsRes.json();

      if (participantsData.ok) {
        setParticipants(participantsData.participants);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Scan ticket
  async function handleScan() {
    if (!ticketInput.trim() || !coordinator?.id) return;

    setScanning(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/tickets/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketInput.trim(),
          event_id: coordinator.id,
        }),
      });

      const data = await res.json();
      setScanResult(data);
    } catch (error) {
      setScanResult({ ok: false, error: "Failed to scan ticket" });
    } finally {
      setScanning(false);
    }
  }

  // Mark attendance
  async function markAttendance(studId: string) {
    if (!coordinator?.id || !ticketInput.trim()) return;

    try {
      const res = await fetch("/api/tickets/mark-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketInput.trim(),
          event_id: coordinator.id,
          stud_id: studId,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setToast(`${studId} checked in ✓`);
        setTimeout(() => setToast(null), 3000);

        // Re-scan to update status
        handleScan();
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        setToast(data.error || "Failed to mark attendance");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      setToast("Failed to mark attendance");
      setTimeout(() => setToast(null), 3000);
    }
  }

  // Save winners
  async function saveWinners() {
    if (!coordinator?.id) return;
    setSavingWinners(true);

    try {
      const winnersData = [];
      if (winners.first) winnersData.push({ position: 1, name: winners.first });
      if (winners.second) winnersData.push({ position: 2, name: winners.second });
      if (winners.third) winnersData.push({ position: 3, name: winners.third });

      const res = await fetch("/api/coordinator/winners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: coordinator.id,
          winners: winnersData,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("Winners saved successfully!");
      } else {
        alert(data.error || "Failed to save winners");
      }
    } catch (error) {
      console.error("Failed to save winners:", error);
      alert("Failed to save winners");
    } finally {
      setSavingWinners(false);
    }
  }

  // Save event settings (venue, date, time, slot)
  async function saveEventSettings() {
    if (!coordinator?.id) return;
    setSavingSettings(true);

    try {
      const res = await fetch("/api/coordinator/update-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventSettings),
      });

      const data = await res.json();
      if (data.ok) {
        setToast("Event settings saved successfully! ✓");
        setTimeout(() => setToast(null), 3000);
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        setToast(data.error || "Failed to save settings");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Failed to save event settings:", error);
      setToast("Failed to save settings");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingSettings(false);
    }
  }

  // Close event manually
  async function closeEvent() {
    if (!coordinator?.id) return;
    
    const confirmed = confirm("Are you sure you want to close this event? This action cannot be undone.");
    if (!confirmed) return;

    setClosingEvent(true);

    try {
      const res = await fetch("/api/coordinator/update-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      const data = await res.json();
      if (data.ok) {
        setToast("Event closed successfully! ✓");
        setTimeout(() => setToast(null), 3000);
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        setToast(data.error || "Failed to close event");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Failed to close event:", error);
      setToast("Failed to close event");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setClosingEvent(false);
    }
  }

  // Logout
  async function logout() {
    try {
      // Call logout API to clear cookies
      await fetch("/api/coordinator/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.href = "/coordinator/login";
  }

  // Open camera for QR scanning
  async function openCamera() {
    setCameraOpen(true);
    setCameraError(null);

    // Ensure any existing scanner is stopped first
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {
        // Ignore errors when stopping
      }
      html5QrCodeRef.current = null;
    }

    // Wait for the container to be mounted
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;

        // Try environment camera first, fallback to user camera
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            async (decodedText) => {
              await stopCamera();
              setTicketInput(decodedText);
              scanTicketById(decodedText);
            },
            () => {}
          );
        } catch {
          // Fallback: try user-facing camera (for laptops)
          await html5QrCode.start(
            { facingMode: "user" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            async (decodedText) => {
              await stopCamera();
              setTicketInput(decodedText);
              scanTicketById(decodedText);
            },
            () => {}
          );
        }
      } catch (err) {
        console.error("Camera error:", err);
        let errorMessage = "Failed to access camera";
        
        if (err instanceof Error) {
          if (err.name === "NotReadableError" || err.message.includes("NotReadableError")) {
            errorMessage = "Camera is in use by another app. Please close other apps using the camera and try again.";
          } else if (err.name === "NotAllowedError" || err.message.includes("NotAllowedError")) {
            errorMessage = "Camera permission denied. Please allow camera access and try again.";
          } else if (err.name === "NotFoundError" || err.message.includes("NotFoundError")) {
            errorMessage = "No camera found on this device.";
          } else {
            errorMessage = err.message;
          }
        }
        
        setCameraError(errorMessage);
      }
    }, 200);
  }

  // Stop camera
  async function stopCamera() {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // Html5QrcodeScannerState.SCANNING
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stopping camera:", err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
    setCameraOpen(false);
    setCameraError(null);
  }

  // Scan ticket by ID (called after QR scan)
  async function scanTicketById(ticketId: string) {
    if (!ticketId.trim() || !coordinator?.id) return;

    setScanning(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/tickets/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketId.trim(),
          event_id: coordinator.id,
        }),
      });

      const data = await res.json();
      setScanResult(data);
    } catch (error) {
      setScanResult({ ok: false, error: "Failed to scan ticket" });
    } finally {
      setScanning(false);
    }
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          const state = html5QrCodeRef.current.getState();
          if (state === 2) { // Html5QrcodeScannerState.SCANNING
            html5QrCodeRef.current.stop().catch(console.error);
          }
          html5QrCodeRef.current.clear();
        } catch {
          // Ignore cleanup errors
        }
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Not authenticated
  if (!coordinator) {
    return null;
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
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg lg:text-xl">
              {coordinator.event_name?.charAt(0).toUpperCase() || "C"}
            </div>
            <div>
              <p className="text-white font-medium text-sm lg:text-lg">{coordinator.event_name || "Coordinator"}</p>
              <p className="text-xs lg:text-sm text-slate-500">Event ID: {coordinator.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
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

        {/* Event Info Card */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : event ? (
          <>
            {/* Event Header */}
            <div className="p-6 lg:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl mb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 lg:mb-6 gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">{event.event_name}</h1>
                  {event.slot && (
                    <p className="text-sm lg:text-base text-slate-400">Slot: {event.slot}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={clsx(
                      "px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-semibold",
                      event.completed
                        ? "bg-slate-600 text-slate-300"
                        : "bg-emerald-500 text-white"
                    )}
                  >
                    {event.completed ? "Completed" : "Active"}
                  </span>
                  {!event.completed && (
                    <button
                      onClick={closeEvent}
                      className="px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
                    >
                      Close Event
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
                  <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xl lg:text-2xl font-bold text-indigo-400">
                      {stats.total_registrations}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">
                      Registrations
                    </p>
                  </div>
                  <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xl lg:text-2xl font-bold text-purple-400">
                      {stats.total_participants}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">
                      Participants
                    </p>
                  </div>
                  <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xl lg:text-2xl font-bold text-emerald-400">
                      {stats.checked_in_participants}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">
                      Checked In
                    </p>
                  </div>
                  <div className="p-3 lg:p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xl lg:text-2xl font-bold text-amber-400">
                      {stats.not_checked_in_participants}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-wider">
                      Not Checked In
                    </p>
                  </div>
                </div>
              )}

              {/* Event Details */}
              {(event.venue || event.date || event.time || event.slot) && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs lg:text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Event Details</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Venue</p>
                          <p className="text-sm lg:text-base text-white font-medium truncate">{event.venue}</p>
                        </div>
                      </div>
                    )}
                    {event.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Date</p>
                          <p className="text-sm lg:text-base text-white font-medium truncate">{event.date}</p>
                        </div>
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Time</p>
                          <p className="text-sm lg:text-base text-white font-medium truncate">{event.time}</p>
                        </div>
                      </div>
                    )}
                    {event.slot && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Current Slot</p>
                          <p className="text-sm lg:text-base text-white font-medium truncate">{event.slot}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
              <button
                onClick={() => setMainTab("scanner")}
                className={clsx(
                  "flex-1 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all flex items-center justify-center gap-2 min-w-[80px] lg:min-w-[120px]",
                  mainTab === "scanner"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <QrCode className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Scanner</span>
              </button>
              <button
                onClick={() => setMainTab("participants")}
                className={clsx(
                  "flex-1 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all flex items-center justify-center gap-2 min-w-[80px] lg:min-w-[120px]",
                  mainTab === "participants"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Participants</span>
              </button>
              <button
                onClick={() => setMainTab("winners")}
                className={clsx(
                  "flex-1 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all flex items-center justify-center gap-2 min-w-[80px] lg:min-w-[120px]",
                  mainTab === "winners"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Trophy className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Winners</span>
              </button>
              <button
                onClick={() => setMainTab("settings")}
                className={clsx(
                  "flex-1 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all flex items-center justify-center gap-2 min-w-[80px] lg:min-w-[120px]",
                  mainTab === "settings"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>

            {/* Scanner Tab */}
            {mainTab === "scanner" && (
              <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                <div className="p-6 lg:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Scan Ticket</h3>
                  <p className="text-sm lg:text-base text-slate-400 mb-4">
                    Enter ticket ID or scan QR code to verify attendance
                  </p>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Enter Ticket ID..."
                      value={ticketInput}
                      onChange={(e) => setTicketInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 lg:py-4 px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm lg:text-base"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={handleScan}
                        disabled={scanning || !ticketInput.trim()}
                        className="flex-1 py-3 lg:py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm lg:text-base"
                      >
                        {scanning ? (
                          <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                        ) : (
                          <QrCode className="w-4 h-4 lg:w-5 lg:h-5" />
                        )}
                        {scanning ? "Scanning..." : "Verify Ticket"}
                      </button>
                      
                      <button
                        onClick={openCamera}
                        className="px-4 lg:px-6 py-3 lg:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <Camera className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scan Result */}
                {scanResult && (
                  <div
                    className={clsx(
                      "p-6 lg:p-8 rounded-2xl border lg:col-span-2",
                      scanResult.ok
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {scanResult.ok ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {scanResult.ok ? "Valid Ticket" : "Invalid Ticket"}
                        </h3>
                        {scanResult.ok && scanResult.ticket_active !== undefined && (
                          <p className={clsx("text-sm", scanResult.ticket_active ? "text-emerald-400" : "text-red-400")}>
                            {scanResult.ticket_active ? "Active" : "Inactive"}
                          </p>
                        )}
                      </div>
                    </div>

                    {scanResult.ok && scanResult.members && (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-400">
                          Members ({scanResult.members.filter(m => m.present).length}/{scanResult.members.length} checked in):
                        </p>
                        {scanResult.members.map((member, idx) => (
                          <div
                            key={member.stud_id}
                            className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={clsx(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                  member.present
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-slate-800 text-slate-400"
                                )}
                              >
                                {member.present ? "✓" : idx + 1}
                              </div>
                              <span className="text-white text-sm">{member.name}</span>
                            </div>
                            {member.present ? (
                              <span className="text-xs text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded-lg">
                                ✓ Present
                              </span>
                            ) : (
                              <button
                                onClick={() => markAttendance(member.stud_id)}
                                className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all font-medium"
                              >
                                Mark Present
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {scanResult.error && (
                      <p className="text-sm text-red-400">{scanResult.error}</p>
                    )}
                  </div>
                )}



                {/* Camera Modal */}
                {cameraOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-md mx-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Scan QR Code</h3>
                        <button
                          onClick={stopCamera}
                          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>

                      {cameraError ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-red-400 text-sm">{cameraError}</p>
                          <div className="flex gap-2 justify-center mt-4">
                            <button
                              onClick={() => {
                                setCameraError(null);
                                stopCamera().then(() => openCamera());
                              }}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-sm"
                            >
                              Retry
                            </button>
                            <button
                              onClick={stopCamera}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            id="qr-reader"
                            ref={scannerContainerRef}
                            className="rounded-xl overflow-hidden bg-black"
                          />
                          <p className="text-center text-slate-400 text-sm mt-4">
                            Point camera at QR code to scan
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Participants Tab */}
            {mainTab === "participants" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg lg:text-xl font-bold text-white">All Participants</h3>
                  <span className="text-sm lg:text-base text-slate-400">{participants.length} total</span>
                </div>

                {participants.length === 0 ? (
                  <div className="text-center py-12 lg:py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <Users className="w-12 h-12 lg:w-16 lg:h-16 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 lg:text-lg">No participants yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                    {teamNames.map((teamName) => {
                      const teamMembers = participantsByTeam[teamName];
                      const checkedInCount = teamMembers.filter(m => m.checked_in).length;
                      const isExpanded = expandedTeams.has(teamName);

                      return (
                        <div
                          key={teamName}
                          className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all"
                        >
                          {/* Team Header */}
                          <button
                            onClick={() => toggleTeam(teamName)}
                            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white">
                                {teamName === "Individual Participants" ? "👤" : teamName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-semibold">{teamName}</p>
                                <p className="text-xs text-slate-500">
                                  {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'} • {checkedInCount} checked in
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                                {checkedInCount}/{teamMembers.length}
                              </div>
                              <svg
                                className={clsx(
                                  "w-5 h-5 text-slate-400 transition-transform",
                                  isExpanded && "rotate-180"
                                )}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* Team Members */}
                          {isExpanded && (
                            <div className="border-t border-slate-800 divide-y divide-slate-800">
                              {teamMembers.map((participant, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 pl-16 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                      className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                                        participant.checked_in
                                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                          : "bg-slate-800 text-slate-400 border border-slate-700"
                                      )}
                                    >
                                      {participant.student_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-white text-sm font-medium truncate">{participant.student_name}</p>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        {participant.email && (
                                          <p className="text-slate-400 text-xs truncate">📧 {participant.email}</p>
                                        )}
                                        {participant.phone && (
                                          <p className="text-slate-400 text-xs">📱 {participant.phone}</p>
                                        )}
                                        {participant.college && (
                                          <p className="text-slate-400 text-xs truncate">🏫 {participant.college}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    {participant.checked_in ? (
                                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Present
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                        <XCircle className="w-4 h-4" />
                                        Absent
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
                )}
              </div>
            )}

            {/* Winners Tab */}
            {mainTab === "winners" && (
              <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                <div className="p-6 lg:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400" />
                    Declare Winners
                  </h3>
                  <p className="text-sm lg:text-base text-slate-400 mb-6">
                    Select winning teams from the registered participants
                  </p>

                  <div className="space-y-4">
                    {/* First Place */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-slate-300">
                        <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs lg:text-sm font-bold text-white">
                          1
                        </div>
                        First Place
                      </label>
                      <select
                        value={winners.first}
                        onChange={(e) => setWinners({ ...winners, first: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 lg:py-4 px-4 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm lg:text-base"
                      >
                        <option value="">Select winner...</option>
                        {uniqueTeams.map((teamName, idx) => (
                          <option key={idx} value={teamName}>
                            {teamName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Second Place */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-slate-300">
                        <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-slate-400 flex items-center justify-center text-xs lg:text-sm font-bold text-white">
                          2
                        </div>
                        Second Place
                      </label>
                      <select
                        value={winners.second}
                        onChange={(e) => setWinners({ ...winners, second: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 lg:py-4 px-4 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm lg:text-base"
                      >
                        <option value="">Select winner...</option>
                        {uniqueTeams.map((teamName, idx) => (
                          <option key={idx} value={teamName}>
                            {teamName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Third Place */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-slate-300">
                        <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-amber-700 flex items-center justify-center text-xs lg:text-sm font-bold text-white">
                          3
                        </div>
                        Third Place
                      </label>
                      <select
                        value={winners.third}
                        onChange={(e) => setWinners({ ...winners, third: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 lg:py-4 px-4 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm lg:text-base"
                      >
                        <option value="">Select winner...</option>
                        {uniqueTeams.map((teamName, idx) => (
                          <option key={idx} value={teamName}>
                            {teamName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={saveWinners}
                    disabled={savingWinners}
                    className="w-full mt-6 py-3 lg:py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 text-sm lg:text-base"
                  >
                    {savingWinners ? (
                      <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                    ) : (
                      <Award className="w-4 h-4 lg:w-5 lg:h-5" />
                    )}
                    Save Winners
                  </button>
                </div>

                {/* Winner Preview Cards */}
                {(winners.first || winners.second || winners.third) && (
                  <div className="space-y-3 lg:space-y-4">
                    <h4 className="text-sm lg:text-base font-medium text-slate-400">Preview</h4>
                    {winners.first && (
                      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">
                            1st Place
                          </p>
                          <p className="text-white font-bold">{winners.first}</p>
                        </div>
                      </div>
                    )}
                    {winners.second && (
                      <div className="p-4 bg-slate-500/10 border border-slate-500/30 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            2nd Place
                          </p>
                          <p className="text-white font-bold">{winners.second}</p>
                        </div>
                      </div>
                    )}
                    {winners.third && (
                      <div className="p-4 bg-amber-700/10 border border-amber-700/30 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">
                            3rd Place
                          </p>
                          <p className="text-white font-bold">{winners.third}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab - Event Details Manipulation */}
            {mainTab === "settings" && (
              <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                <div className="p-6 lg:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-400" />
                    Event Settings
                  </h3>
                  <p className="text-sm lg:text-base text-slate-400 mb-6">
                    Update venue, date, time, and slot details for your event
                  </p>

                  <div className="space-y-4">
                    {/* Venue */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-slate-300">
                        <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
                        Venue
                      </label>
                      <input
                        type="text"
                        value={eventSettings.venue}
                        onChange={(e) => setEventSettings({ ...eventSettings, venue: e.target.value })}
                        placeholder="Enter venue location..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 lg:py-4 px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm lg:text-base"
                      />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-slate-300">
                        <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                        Date
                      </label>
                      <input
                        type="text"
                        value={eventSettings.date}
                        onChange={(e) => setEventSettings({ ...eventSettings, date: e.target.value })}
                        placeholder="Enter date (e.g. 2026-01-25 or Jan 25)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 lg:py-4 px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm lg:text-base"
                      />
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-slate-300">
                        <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                        Time
                      </label>
                      <input
                        type="text"
                        value={eventSettings.time}
                        onChange={(e) => setEventSettings({ ...eventSettings, time: e.target.value })}
                        placeholder="Enter time (e.g. 10:30 AM)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 lg:py-4 px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm lg:text-base"
                      />
                    </div>

                    {/* Slot */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-slate-300">
                        <Award className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" />
                        Slot
                      </label>
                      <input
                        type="text"
                        value={eventSettings.slot}
                        onChange={(e) => setEventSettings({ ...eventSettings, slot: e.target.value })}
                        placeholder="Enter slot (e.g. 1, 2, 3...)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 lg:py-4 px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm lg:text-base"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveEventSettings}
                    disabled={savingSettings}
                    className="w-full mt-6 py-3 lg:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 text-sm lg:text-base"
                  >
                    {savingSettings ? (
                      <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                    )}
                    Save Settings
                  </button>
                </div>

                {/* Current Settings Preview */}
                {(eventSettings.venue || eventSettings.date || eventSettings.time || eventSettings.slot) && (
                  <div className="p-6 lg:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h4 className="text-sm lg:text-base font-medium text-slate-400 mb-4">Current Event Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {eventSettings.venue && (
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Venue</p>
                          </div>
                          <p className="text-sm font-medium text-white">{eventSettings.venue}</p>
                        </div>
                      )}
                      {eventSettings.date && (
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3 h-3 text-blue-400" />
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Date</p>
                          </div>
                          <p className="text-sm font-medium text-white">{eventSettings.date}</p>
                        </div>
                      )}
                      {eventSettings.time && (
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Time</p>
                          </div>
                          <p className="text-sm font-medium text-white">{eventSettings.time}</p>
                        </div>
                      )}
                      {eventSettings.slot && (
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Slot</p>
                          </div>
                          <p className="text-sm font-medium text-white">{eventSettings.slot}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 lg:py-32 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Calendar className="w-16 h-16 lg:w-20 lg:h-20 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">No Event Assigned</h3>
            <p className="text-slate-400 lg:text-lg">Contact admin to get assigned to an event</p>
          </div>
        )}

        {/* Floating QR Button - Mobile Only */}
        <button
          onClick={() => {
            setMainTab("scanner");
            openCamera();
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 hover:bg-amber-500 transition-all lg:hidden"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 lg:px-6 py-2 lg:py-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <p className="text-sm lg:text-base text-white font-medium">{toast}</p>
        </div>
      )}
    </div>
  );
}
