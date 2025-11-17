import React, { useMemo, useEffect, useState } from "react";
import { useI18n } from "../../context/I18nContext";
import { Petition, PetitionStatus } from "../../types";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import PetitionDetailsModal from "./PetitionDetailsModal";
import { translations } from "../../constants/translations";
import { usePetitions } from "../../context/PetitionContext";

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between hover:scale-105 transition">
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-full bg-opacity-10 ${color.replace("text-", "bg-")}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { t, t_categories, t_status, lang } = useI18n();
  const { petitions, refreshPetitionsFromDB } = usePetitions();
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [filter, setFilter] = useState<PetitionStatus | "all">("all");

  /* Load petitions at start */
  useEffect(() => {
    refreshPetitionsFromDB();
  }, [refreshPetitionsFromDB]);

  /* Stats */
  const stats = useMemo(
    () => ({
      total: petitions.length,
      pending: petitions.filter((p) => p.status === "pending").length,
      resolved: petitions.filter((p) => p.status === "resolved").length,
      rejected: petitions.filter((p) => p.status === "rejected").length,
    }),
    [petitions]
  );

  /* Filter */
  const filteredPetitions =
    filter === "all"
      ? petitions
      : petitions.filter((p) => p.status === filter);

  const getStatusChipClass = (status: PetitionStatus) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{t("dashboard")}</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title={t("totalPetitions")} value={stats.total} icon={<FileText />} color="text-indigo-600" />
        <StatCard title={t("pending")} value={stats.pending} icon={<Clock />} color="text-yellow-600" />
        <StatCard title={t("resolved")} value={stats.resolved} icon={<CheckCircle />} color="text-green-600" />
        <StatCard title={t("rejected")} value={stats.rejected} icon={<XCircle />} color="text-red-600" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">{t("petitionList")}</h3>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PetitionStatus | "all")}
            className="px-4 py-2 border rounded"
          >
            <option value="all">{t("all")}</option>
            {(Object.keys(translations.en.status) as PetitionStatus[]).map((s) => (
              <option key={s} value={s}>
                {t_status(s)}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">{t("id")}</th>
                <th className="px-6 py-3">{t("name")}</th>
                <th className="px-6 py-3">{t("category")}</th>
                <th className="px-6 py-3">{lang === "en" ? "Status" : "நிலை"}</th>
                <th className="px-6 py-3">{t("action")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredPetitions.map((p) => (
                <tr key={p.petition_code} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{p.petition_code}</td>
                  <td className="px-6 py-4">{p.name || "—"}</td>
                  <td className="px-6 py-4">{t_categories(p.category)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full ${getStatusChipClass(p.status)}`}>
                      {t_status(p.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedPetition(p)}
                      className="text-indigo-600 hover:underline"
                    >
                      {t("viewDetails")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPetitions.length === 0 && (
            <p className="text-center py-7 text-gray-500">No petitions found</p>
          )}
        </div>
      </div>

      {selectedPetition && (
        <PetitionDetailsModal
          petition={selectedPetition}
          onClose={() => setSelectedPetition(null)}
          refresh={refreshPetitionsFromDB}  // ← LIVE AUTO REFRESH
        />
      )}
    </>
  );
};

export default Dashboard;