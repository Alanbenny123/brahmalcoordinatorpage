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
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

// Types
interface CoordinatorData {
  id: string;
  event_id: string;
  event_name: string;
}

interface EventData {
  event_id: string;
  event_name: string;
  completed: boolean;
}

interface Participant {
  team_name: string | null;
  student_name: string;
  checked_in: boolean;
  stud_id?: string;
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

type MainTab = "scanner" | "participants" | "winners";

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

  // Camera scanner state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    const stored = localStorage.getItem("coordinator");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCoordinator(parsed);
      } catch {
        localStorage.removeItem("coordinator");
        localStorage.removeItem("coordinator_token");
        window.location.href = "/coordinator/login";
      }
    } else {
      window.location.href = "/coordinator/login";
    }
    setAuthLoading(false);
  }, []);

  // Fetch event data when coordinator is loaded
  useEffect(() => {
    if (!coordinator?.event_id) return;
    fetchDashboardData();
  }, [coordinator]);

  async function fetchDashboardData() {
    if (!coordinator?.event_id) return;
    setLoading(true);

    try {
      // Fetch dashboard stats and event info
      const statsRes = await fetch("/api/coordinator/dashboard", {
        headers: { "x-event-id": coordinator.event_id },
      });
      const statsData = await statsRes.json();

      if (statsData.ok) {
        setEvent(statsData.event);
        setStats(statsData.stats);
      }

      // Fetch participants
      const participantsRes = await fetch("/api/coordinator/participants", {
        headers: { "x-event-id": coordinator.event_id },
      });
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
    if (!coordinator?.event_id) return;
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
          event_id: coordinator.event_id,
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

  // Logout
  function logout() {
    localStorage.removeItem("coordinator");
    localStorage.removeItem("coordinator_token");
    window.location.href = "/coordinator/login";
  }

  // Open camera for QR scanning
  async function openCamera() {
    setCameraOpen(true);
    setCameraError(null);

    // Wait for the container to be mounted
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;

        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length === 0) {
          setCameraError("No camera found on this device");
          return;
        }

        // Prefer back camera on mobile, otherwise use first available
        const backCamera = devices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;

        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // QR code scanned successfully
            await stopCamera();
            setTicketInput(decodedText);
            // Trigger scan with the decoded ticket ID
            scanTicketById(decodedText);
          },
          () => {
            // QR code not detected (ignore)
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(
          err instanceof Error ? err.message : "Failed to access camera"
        );
      }
    }, 100);
  }

  // Stop camera
  async function stopCamera() {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Error stopping camera:", err);
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
        html5QrCodeRef.current.stop().catch(console.error);
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

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              {coordinator.event_name?.charAt(0).toUpperCase() || "C"}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{coordinator.event_name || "Coordinator"}</p>
              <p className="text-xs text-slate-500">Event ID: {coordinator.event_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={clsx("w-5 h-5 text-slate-400", loading && "animate-spin")} />
            </button>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-red-400" />
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
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{event.event_name}</h1>
                  <p className="text-sm text-slate-400">Event ID: {event.event_id}</p>
                </div>
                <span
                  className={clsx(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    event.completed
                      ? "bg-slate-600 text-slate-300"
                      : "bg-emerald-500 text-white"
                  )}
                >
                  {event.completed ? "Completed" : "Active"}
                </span>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xl font-bold text-indigo-400">
                      {stats.total_registrations}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Registrations
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xl font-bold text-purple-400">
                      {stats.total_participants}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Participants
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xl font-bold text-emerald-400">
                      {stats.checked_in_participants}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Checked In
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xl font-bold text-amber-400">
                      {stats.not_checked_in_participants}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Not Checked In
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
              <button
                onClick={() => setMainTab("scanner")}
                className={clsx(
                  "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                  mainTab === "scanner"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <QrCode className="w-4 h-4" />
                Scanner
              </button>
              <button
                onClick={() => setMainTab("participants")}
                className={clsx(
                  "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                  mainTab === "participants"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Users className="w-4 h-4" />
                Participants
              </button>
              <button
                onClick={() => setMainTab("winners")}
                className={clsx(
                  "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                  mainTab === "winners"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Trophy className="w-4 h-4" />
                Winners
              </button>
            </div>

            {/* Scanner Tab */}
            {mainTab === "scanner" && (
              <div className="space-y-4">
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4">Scan Ticket</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Enter ticket ID or scan QR code to verify attendance
                  </p>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Enter Ticket ID..."
                      value={ticketInput}
                      onChange={(e) => setTicketInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    />

                    <button
                      onClick={handleScan}
                      disabled={scanning || !ticketInput.trim()}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      {scanning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <QrCode className="w-4 h-4" />
                      )}
                      {scanning ? "Scanning..." : "Verify Ticket"}
                    </button>
                  </div>
                </div>

                {/* Scan Result */}
                {scanResult && (
                  <div
                    className={clsx(
                      "p-6 rounded-2xl border",
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

                {/* Quick Actions */}
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={openCamera}
                      className="py-3 bg-amber-600 hover:bg-amber-500 border border-amber-500 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Open Camera
                    </button>
                    <button
                      onClick={() => {
                        setTicketInput("");
                        setScanResult(null);
                      }}
                      className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-white transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

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
                          <button
                            onClick={stopCamera}
                            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm"
                          >
                            Close
                          </button>
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
                  <h3 className="text-lg font-bold text-white">All Participants</h3>
                  <span className="text-sm text-slate-400">{participants.length} total</span>
                </div>

                {participants.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No participants yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {participants.map((participant, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                              participant.checked_in
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            )}
                          >
                            {participant.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{participant.student_name}</p>
                            {participant.team_name && (
                              <p className="text-xs text-slate-500">Team: {participant.team_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
            )}

            {/* Winners Tab */}
            {mainTab === "winners" && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Declare Winners
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Select winners from the registered participants
                  </p>

                  <div className="space-y-4">
                    {/* First Place */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">
                          1
                        </div>
                        First Place
                      </label>
                      <select
                        value={winners.first}
                        onChange={(e) => setWinners({ ...winners, first: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      >
                        <option value="">Select winner...</option>
                        {participants.map((p, idx) => (
                          <option key={idx} value={p.student_name}>
                            {p.student_name}
                            {p.team_name ? ` (${p.team_name})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Second Place */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-xs font-bold text-white">
                          2
                        </div>
                        Second Place
                      </label>
                      <select
                        value={winners.second}
                        onChange={(e) => setWinners({ ...winners, second: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      >
                        <option value="">Select winner...</option>
                        {participants.map((p, idx) => (
                          <option key={idx} value={p.student_name}>
                            {p.student_name}
                            {p.team_name ? ` (${p.team_name})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Third Place */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold text-white">
                          3
                        </div>
                        Third Place
                      </label>
                      <select
                        value={winners.third}
                        onChange={(e) => setWinners({ ...winners, third: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      >
                        <option value="">Select winner...</option>
                        {participants.map((p, idx) => (
                          <option key={idx} value={p.student_name}>
                            {p.student_name}
                            {p.team_name ? ` (${p.team_name})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={saveWinners}
                    disabled={savingWinners}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    {savingWinners ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Award className="w-4 h-4" />
                    )}
                    Save Winners
                  </button>
                </div>

                {/* Winner Preview Cards */}
                {(winners.first || winners.second || winners.third) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-400">Preview</h4>
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
          </>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Event Assigned</h3>
            <p className="text-slate-400">Contact admin to get assigned to an event</p>
          </div>
        )}

        {/* Floating QR Button */}
        <button
          onClick={() => setMainTab("scanner")}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 hover:bg-amber-500 transition-all"
        >
          <QrCode className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <p className="text-sm text-white font-medium">{toast}</p>
        </div>
      )}
    </div>
  );
}
