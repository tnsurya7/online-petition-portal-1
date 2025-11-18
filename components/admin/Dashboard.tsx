import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../context/I18nContext";
import { usePetitions } from "../../context/PetitionContext";
import PetitionDetailsModal from "./PetitionDetailsModal";
import {
  Petition,
  PetitionCategory,
  PetitionStatus,
} from "../../types";
import { translations } from "../../constants/translations";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

const Dashboard: React.FC = () => {
  const { t, t_categories, t_status } = useI18n();
  const { petitions, refreshPetitionsFromDB, deletePetitionLocal } =
    usePetitions();

  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [editPetition, setEditPetition] = useState<Petition | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PetitionCategory | "all">(
    "all"
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // New states for delete popup + notice message
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    refreshPetitionsFromDB();
  }, [refreshPetitionsFromDB]);

  const parseDate = (value: string | undefined | null) => {
    if (!value) return null;
    const onlyDate = value.split(" ")[0];
    const d = new Date(onlyDate);
    return isNaN(d.getTime()) ? null : d;
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return petitions.filter((p) => {
      if (s) {
        const hay = [
          p.petition_code,
          p.name,
          p.title,
          p.phone,
          p.email,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(s)) return false;
      }

      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;

      const created = parseDate(p.date);
      if (created) {
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (created < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (created > to) return false;
        }
      }

      return true;
    });
  }, [petitions, search, categoryFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  const stats = useMemo(
    () => ({
      total: petitions.length,
      pending: petitions.filter((p) => p.status === "pending").length,
      resolved: petitions.filter((p) => p.status === "resolved").length,
      rejected: petitions.filter((p) => p.status === "rejected").length,
    }),
    [petitions]
  );

  const getStatusChipClass = (status: PetitionStatus) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (code: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setNotice("Admin login required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/petitions/${code}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice(data.error || "Delete failed");
        return;
      }

      deletePetitionLocal(code);
      await refreshPetitionsFromDB();

      setNotice("Petition deleted successfully.");
      setTimeout(() => setNotice(""), 3000);

      setConfirmDelete(null);
    } catch {
      setNotice("Error deleting petition.");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Petition Code",
      "Name",
      "Category",
      "Status",
      "Phone",
      "Email",
      "Date",
    ];
    const rows = filtered.map((p) => [
      p.petition_code,
      p.name,
      p.category,
      p.status,
      p.phone,
      p.email,
      p.date,
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `petitions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;

    const html = `
      <html>
        <head>
          <title>Petitions Report</title>
          <style>
            body { font-family: system-ui; padding: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Petitions Report</h1>
          <table>
            <thead>
              <tr>
                <th>Petition Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (p) => `
                  <tr>
                    <td>${p.petition_code}</td>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td>${p.status}</td>
                    <td>${p.phone}</td>
                    <td>${p.email ?? ""}</td>
                    <td>${p.date}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto py-8 px-4">

        {/* SUCCESS MESSAGE */}
        {notice && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg">
            {notice}
          </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{t("dashboard")}</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              <Download size={16} /> CSV
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              <Download size={16} /> PDF
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Petitions" value={stats.total} icon={<FileText size={22} />} color="bg-indigo-100 text-indigo-700" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock size={22} />} color="bg-yellow-100 text-yellow-700" />
          <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle size={22} />} color="bg-green-100 text-green-700" />
          <StatCard label="Rejected" value={stats.rejected} icon={<XCircle size={22} />} color="bg-red-100 text-red-700" />
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow mb-6 p-4 flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="block text-sm mb-1">Search (ID / Name / Phone / Email)</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white"
                placeholder="Type to search..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as PetitionCategory | "all")}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="all">All</option>
              {(Object.keys(translations.en.categories) as PetitionCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {t_categories(cat)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr
                    key={p.petition_code}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{p.petition_code}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{t_categories(p.category) || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusChipClass(p.status)}`}>
                        {t_status(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 justify-center text-sm">
                        <button
                          onClick={() => setSelectedPetition(p)}
                          className="text-indigo-500 hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setEditPetition(p)}
                          className="text-blue-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p.petition_code)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No petitions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-sm">
            <div>
              Showing{" "}
              <strong>
                {filtered.length === 0 ? 0 : startIndex + 1} -{" "}
                {Math.min(startIndex + pageSize, filtered.length)}
              </strong>{" "}
              of <strong>{filtered.length}</strong> petitions
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 py-1 border rounded disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span>
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 py-1 border rounded disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS & EDIT MODALS */}
        {selectedPetition && (
          <PetitionDetailsModal
            petition={selectedPetition}
            onClose={() => setSelectedPetition(null)}
          />
        )}
        {editPetition && (
          <PetitionDetailsModal
            petition={editPetition}
            onClose={() => setEditPetition(null)}
          />
        )}

        {/* DELETE CONFIRM POPUP */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this petition?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  onClick={() => handleDelete(confirmDelete)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className={`rounded-xl shadow px-4 py-3 flex items-center justify-between ${color}`}>
    <div>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div>{icon}</div>
  </div>
);

export default Dashboard;