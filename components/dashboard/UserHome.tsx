// components/dashboard/UserHome.tsx
import React, { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { API_BASE } from "../../App";

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; colorClass?: string }> = ({
  title,
  value,
  icon,
  colorClass = "text-[#0b3c8c]"
}) => (
  <div className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-semibold ${colorClass}`}>{value}</p>
    </div>
    <div className="p-3 bg-[#e7f0ff] rounded-full">{icon}</div>
  </div>
);

const UserHome: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
  const [myPetitions, setMyPetitions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMyList, setLoadingMyList] = useState(true);

  // -------------------------------
  // FETCH USER STATS
  // -------------------------------
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("user_token") || "";

        const res = await fetch(`${API_BASE}/petitions/summary`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        });

        if (res.ok) {
          const d = await res.json();
          setStats({
            total: d.total || 0,
            pending: d.pending || 0,
            resolved: d.resolved || 0,
            rejected: d.rejected || 0
          });
        }
      } finally {
        setLoadingStats(false);
      }
    };

    // -------------------------------
    // FETCH MY PETITIONS
    // -------------------------------
    const fetchMy = async () => {
      try {
        const token = localStorage.getItem("user_token") || "";

        let res = await fetch(`${API_BASE}/users/me/petitions`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        });

        if (!res.ok) {
          res = await fetch(`${API_BASE}/petitions?mine=true`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" }
          });
        }

        if (res.ok) {
          const d = await res.json();
          setMyPetitions(Array.isArray(d) ? d : d.rows || []);
        }
      } finally {
        setLoadingMyList(false);
      }
    };

    fetchStats();
    fetchMy();
  }, []);

  const getStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status === "resolved") return "text-green-600";
    if (status === "rejected") return "text-red-600";
    if (status === "review") return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="p-6">

      {/* ----------------------- */}
      {/* STATS CARDS */}
      {/* ----------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Petitions" value={stats.total} icon={<FileText size={22} />} />
        <StatCard title="Pending" value={stats.pending} icon={<Clock size={22} />} colorClass="text-yellow-600" />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle size={22} />} colorClass="text-green-600" />
        <StatCard title="Rejected" value={stats.rejected} icon={<XCircle size={22} />} colorClass="text-red-600" />
      </div>

      {/* ----------------------- */}
      {/* QUICK ACTIONS */}
      {/* ----------------------- */}
      <div className="bg-white rounded-xl p-6 shadow mb-8 border border-blue-100">
        <h2 className="text-xl font-semibold text-[#0b3c8c] mb-2">Quick Actions</h2>
        <p className="text-gray-600 mb-4">Submit a new petition, track status, or manage your profile.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => onNavigate?.("submit")} className="px-4 py-3 bg-[#0b3c8c] text-white rounded-lg">
            Submit Petition
          </button>
          <button onClick={() => onNavigate?.("track")} className="px-4 py-3 bg-white border rounded-lg">
            Track Petition
          </button>
          <button onClick={() => onNavigate?.("profile")} className="px-4 py-3 bg-white border rounded-lg">
            My Profile
          </button>
        </div>
      </div>

      {/* ----------------------- */}
      {/* MY PETITIONS */}
      {/* ----------------------- */}
      <div className="bg-white rounded-xl p-6 shadow border border-blue-50">
        <h3 className="text-xl font-semibold text-[#0b3c8c] mb-3">My Recent Petitions</h3>

        {loadingMyList ? (
          <p className="text-gray-500">Loading...</p>
        ) : myPetitions.length === 0 ? (
          <p className="text-gray-600">You haven’t submitted any petitions yet.</p>
        ) : (
          <ul className="space-y-3">
            {myPetitions.slice(0, 6).map((p, i) => (
              <li
                key={p.petition_code || p.id || i}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition flex justify-between"
              >
                <div>
                  <p className="font-medium text-sm text-[#0b3c8c]">
                    {p.petition_code || p.id}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {p.title || p.name || p.description?.slice(0, 70)}
                  </p>
                </div>
                <p className={`text-sm font-medium ${getStatusColor(p.status || p.petition_status)}`}>
                  {(p.status || p.petition_status || "Pending")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserHome;