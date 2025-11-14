// components/dashboard/UserHome.tsx
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