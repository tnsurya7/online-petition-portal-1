import React, { useState, useEffect } from "react";
import { Bell, Sun, Moon, User as UserIcon } from "lucide-react";

interface TopbarProps {
  userName?: string;
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
  onToggleDark?: (dark: boolean) => void;
}

const Topbar: React.FC<TopbarProps> = ({ userName = "User", onToggleSidebar, onOpenNotifications, onToggleDark }) => {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setDark(saved === "dark");
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    if (onToggleDark) onToggleDark(next);
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1 rounded bg-[#e7f0ff] dark:bg-gray-800" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          ☰
        </button>
        <h1 className="text-lg font-semibold text-[#0b3c8c] dark:text-white">Welcome, {userName}</h1>
      </div>

      <div className="flex items-center gap-4">
        <select
          className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
          defaultValue={localStorage.getItem("lang") || "en"}
          onChange={(e) => { localStorage.setItem("lang", e.target.value); window.location.reload(); }}
          aria-label="Language selector"
        >
          <option value="en">EN</option>
          <option value="ta">தமிழ்</option>
        </select>

        <button onClick={onOpenNotifications} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <button onClick={toggleDark} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle theme">
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="flex items-center gap-2 px-3 py-1 border rounded bg-white dark:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-[#0b3c8c] text-white flex items-center justify-center font-medium"><UserIcon size={14} /></div>
          <div className="text-sm text-gray-700 dark:text-gray-200">{userName}</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
import React, { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { API_BASE } from "../../App";

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; colorClass?: string }> = ({ title, value, icon, colorClass = "text-[#0b3c8c]" }) => (
  <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
    </div>
    <div className="p-3 bg-[#e7f0ff] rounded-full">
      {icon}
    </div>
  </div>
);

const UserHome: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
  const [myPetitions, setMyPetitions] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("user_token") || "";
        const res = await fetch(`${API_BASE}/petitions/summary`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
        if (res.ok) {
          const d = await res.json();
          setStats({ total: d.total || 0, pending: d.pending || 0, resolved: d.resolved || 0, rejected: d.rejected || 0 });
        }
      } catch (err) {
        // ignore
      }
    };

    const fetchMy = async () => {
      try {
        const token = localStorage.getItem("user_token") || "";
        // try common user endpoint, fall back to public petitions filtered by user email if server doesn't support
        let res = await fetch(`${API_BASE}/users/me/petitions`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
        if (!res.ok) {
          res = await fetch(`${API_BASE}/petitions?mine=true`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
        }
        if (res.ok) {
          const d = await res.json();
          setMyPetitions(Array.isArray(d) ? d : d.rows || []);
        }
      } catch (err) {
        // ignore
      }
    };

    fetchStats();
    fetchMy();
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Petitions" value={stats.total} icon={<FileText size={20} />} />
        <StatCard title="Pending" value={stats.pending} icon={<Clock size={20} />} colorClass="text-yellow-600" />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle size={20} />} colorClass="text-green-600" />
        <StatCard title="Rejected" value={stats.rejected} icon={<XCircle size={20} />} colorClass="text-red-600" />
      </div>

      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold text-[#0b3c8c] mb-2">Quick Actions</h2>
        <p className="text-gray-600 mb-4">Submit a new petition, track existing petitions, or manage your profile.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => onNavigate?.("submit")} className="px-4 py-3 bg-[#0b3c8c] text-white rounded">Submit Petition</button>
          <button onClick={() => onNavigate?.("track")} className="px-4 py-3 bg-white border rounded">Track Petition</button>
          <button onClick={() => onNavigate?.("profile")} className="px-4 py-3 bg-white border rounded">My Profile</button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-3">My Recent Petitions</h3>
        {myPetitions.length === 0 ? (
          <p className="text-gray-600">No petitions submitted yet.</p>
        ) : (
          <ul className="space-y-3">
            {myPetitions.slice(0, 6).map((p, idx) => (
              <li key={p.petition_code || p.id || idx} className="p-3 border rounded flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium">{p.petition_code || p.id}</div>
                  <div className="text-sm text-gray-700">{p.title || p.name || p.description?.slice(0, 80)}</div>
                </div>
                <div className="text-sm text-gray-500">{(p.status || p.petition_status || 'pending')}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserHome;
import React, { useState, useEffect } from "react";
import Sidebar from "./UserSidebar";
import Topbar from "./UserTopbar";
import UserHome from "./UserHome";
import { API_BASE } from "../../App";

interface LayoutProps {
  initialView?: string;
  onLogout: () => void;
}

const decodeTokenPayload = (token: string | null) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
};

const UserDashboardLayout: React.FC<LayoutProps> = ({ initialView = "home", onLogout }) => {
  const [view, setView] = useState<string>(initialView);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Citizen User");

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const payload = decodeTokenPayload(token);
    if (payload && (payload.name || payload.full_name || payload.email)) {
      setUserName(payload.name || payload.full_name || payload.email.split("@")[0]);
    }
  }, []);

  const handleNavigate = (v: string) => {
    setView(v);
    setSidebarOpen(false);
  };

  // Submit Petition state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const submitPetition = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitMessage(null);
    if (!title || !description) {
      setSubmitMessage("Please provide title and description.");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("user_token") || "";
      const form = new FormData();
      form.append("title", title);
      form.append("category", category);
      form.append("description", description);
      if (attachment) form.append("attachment", attachment);

      const res = await fetch(`${API_BASE}/petitions`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: form
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to submit");
      setSubmitMessage("Petition submitted successfully. Reference: " + (data.petition_code || data.id || "-"));
      // reset
      setTitle(""); setCategory(""); setDescription(""); setAttachment(null);
      setView("track");
    } catch (err: any) {
      setSubmitMessage(err.message || "Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  // Track Petition state
  const [searchCode, setSearchCode] = useState("");
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [tracking, setTracking] = useState(false);
  const [detailModal, setDetailModal] = useState<any | null>(null);

  const trackPetition = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode) return setTrackResult({ error: "Enter petition id/code" });
    setTracking(true);
    setTrackResult(null);
    try {
      const res = await fetch(`${API_BASE}/petitions/${encodeURIComponent(searchCode)}`);
      if (res.status === 404) {
        setTrackResult({ error: "Not found" });
      } else {
        const d = await res.json();
        if (!res.ok) setTrackResult({ error: d.error || d.message || "Error" });
        else setTrackResult(d);
      }
    } catch (err: any) {
      setTrackResult({ error: err.message || "Network error" });
    } finally {
      setTracking(false);
    }
  };

  // Profile state
  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem("user_token") || "";
      const res = await fetch(`${API_BASE}/users/me`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
      if (res.ok) {
        const d = await res.json();
        setProfile(d);
      }
    } catch (err) {
      // ignore
    } finally { setProfileLoading(false); }
  };

  useEffect(() => {
    if (view === "profile") loadProfile();
  }, [view]);

  const saveProfile = async () => {
    setProfileMsg(null);
    try {
      const token = localStorage.getItem("user_token") || "";
      // If avatarFile present, use FormData
      if (avatarFile) {
        const fd = new FormData();
        fd.append("name", profile?.name || "");
        fd.append("email", profile?.email || "");
        fd.append("avatar", avatarFile);
        const res = await fetch(`${API_BASE}/users/me`, {
          method: "PATCH",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          body: fd
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || d.message || "Update failed");
        setProfileMsg("Profile updated");
        return;
      }

      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ name: profile?.name, email: profile?.email })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.message || "Update failed");
      setProfileMsg("Profile updated");
    } catch (err: any) {
      setProfileMsg(err.message || "Error saving profile");
    }
  };

  const renderTimeline = (timeline: any[]) => {
    if (!Array.isArray(timeline)) return null;
    return (
      <div className="space-y-2 mt-3">
        {timeline.map((t, i) => (
          <div key={i} className="p-3 bg-white border rounded">
            <div className="text-sm font-medium">{t.status || t.event}</div>
            <div className="text-xs text-gray-500">{t.by || t.actor || ''} • {t.at || t.timestamp || t.date}</div>
            {t.note && <div className="text-sm mt-1">{t.note}</div>}
          </div>
        ))}
      </div>
    );
  };

  const renderScreen = () => {
    switch (view) {
      case "submit":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#0b3c8c] mb-3">Submit Petition</h2>
            <form onSubmit={submitPetition} className="max-w-xl bg-white p-6 rounded shadow">
              <div className="mb-3">
                <label className="block text-sm font-medium">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium">Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g. Public Works" />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" rows={6} />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium">Attachment (optional)</label>
                <input type="file" onChange={(e: any) => setAttachment(e.target.files?.[0] ?? null)} />
              </div>

              {submitMessage && <p className="text-sm mb-2 text-green-700">{submitMessage}</p>}

              <div className="flex items-center gap-3">
                <button disabled={submitting} className="px-4 py-2 bg-[#0b3c8c] text-white rounded">{submitting ? "Submitting..." : "Submit"}</button>
                <button type="button" onClick={() => setView("home")} className="px-4 py-2 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        );

      case "track":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#0b3c8c] mb-3">Track Petition</h2>
            <div className="max-w-xl bg-white p-6 rounded shadow">
              <form onSubmit={trackPetition} className="space-y-3">
                <div>
                  <label className="block text-sm">Enter Petition ID (e.g. PET000123)</label>
                  <input value={searchCode} onChange={(e) => setSearchCode(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-[#0b3c8c] text-white rounded">{tracking ? "Searching..." : "Search"}</button>
                  <button type="button" onClick={() => { setSearchCode(""); setTrackResult(null); }} className="px-4 py-2 border rounded">Clear</button>
                </div>
              </form>

              <div className="mt-4">
                {trackResult?.error && <p className="text-sm text-red-600">{trackResult.error}</p>}
                {trackResult && !trackResult.error && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p><strong>Petition:</strong> {trackResult.petition_code || trackResult.id}</p>
                    <p><strong>Title:</strong> {trackResult.title || trackResult.name || trackResult.description?.slice(0,80)}</p>
                    <p><strong>Status:</strong> {trackResult.status}</p>
                    <p><strong>Submitted:</strong> {trackResult.created_at || trackResult.date}</p>
                    <p><strong>Remarks:</strong> {trackResult.remarks || '—'}</p>

                    {renderTimeline(trackResult.timeline || trackResult.history || trackResult.events || [])}

                    <div className="mt-3">
                      <button onClick={() => setDetailModal(trackResult)} className="px-3 py-2 bg-white border rounded">View Details</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal */}
            {detailModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white w-full max-w-2xl p-6 rounded shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Petition Details</h3>
                    <button onClick={() => setDetailModal(null)} className="text-sm text-gray-500">Close</button>
                  </div>

                  <div>
                    <p><strong>Code:</strong> {detailModal.petition_code || detailModal.id}</p>
                    <p><strong>Title:</strong> {detailModal.title || detailModal.name}</p>
                    <p><strong>Description:</strong> {detailModal.description || detailModal.petition_description}</p>
                    <p><strong>Status:</strong> {detailModal.status}</p>
                    <p><strong>Submitted:</strong> {detailModal.created_at || detailModal.date}</p>

                    {renderTimeline(detailModal.timeline || detailModal.history || detailModal.events || [])}

                    {detailModal.attachment && (
                      <div className="mt-3">
                        <a href={detailModal.attachment} target="_blank" rel="noreferrer" className="text-blue-600 underline">View attachment</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        );

      case "profile":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#0b3c8c] mb-3">My Profile</h2>
            <div className="max-w-xl bg-white p-6 rounded shadow">
              {profileLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm block">Name</label>
                    <input value={profile?.name || ""} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-sm block">Email</label>
                    <input value={profile?.email || ""} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full px-3 py-2 border rounded" />
                  </div>

                  <div>
                    <label className="text-sm block">Avatar</label>
                    <input type="file" onChange={(e: any) => setAvatarFile(e.target.files?.[0] ?? null)} />
                  </div>

                  {profileMsg && <p className="text-sm text-green-700">{profileMsg}</p>}

                  <div className="flex items-center gap-3">
                    <button onClick={saveProfile} className="px-4 py-2 bg-[#0b3c8c] text-white rounded">Save</button>
                    <button onClick={() => setView("home")} className="px-4 py-2 border rounded">Back</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <UserHome onNavigate={(v: string) => setView(v)} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f6f9ff]">

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar active={view} onNavigate={handleNavigate} onLogout={onLogout} />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`absolute left-0 top-0 z-50 md:hidden transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="w-64">
          <Sidebar active={view} onNavigate={handleNavigate} onLogout={onLogout} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        <Topbar userName={userName} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onOpenNotifications={() => alert('No notifications yet')} />
        <main className="flex-1 overflow-y-auto">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;