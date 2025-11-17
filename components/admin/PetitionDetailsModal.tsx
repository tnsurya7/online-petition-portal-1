import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { useI18n } from "../../context/I18nContext";
import { usePetitions } from "../../context/PetitionContext";
import { Petition, PetitionStatus } from "../../types";
import { translations } from "../../constants/translations";

const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

interface PetitionDetailsModalProps {
  petition: Petition;
  onClose: () => void;
}

const PetitionDetailsModal: React.FC<PetitionDetailsModalProps> = ({
  petition,
  onClose,
}) => {
  const { t, t_categories, t_status } = useI18n();
  const { updatePetition, refreshPetitionsFromDB } = usePetitions();

  const [editStatus, setEditStatus] = useState<PetitionStatus>(
    petition.status
  );
  const [editRemarks, setEditRemarks] = useState(petition.remarks || "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  /* 🔵 SAVE BUTTON HANDLER */
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        alert("Admin login required.");
        return;
      }

      const res = await fetch(
        `${API_BASE}/petitions/${petition.petition_code}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🟢 Correct Admin Auth
          },
          body: JSON.stringify({
            status: editStatus,
            remarks: editRemarks,
          }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      // 🟢 Update state instantly
      updatePetition(
        petition.petition_code,
        editStatus,
        editRemarks
      );

      // 🟢 Also refresh DB to sync with backend
      await refreshPetitionsFromDB();

      setToast("Petition updated successfully!");
      setTimeout(() => {
        setToast("");
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update petition.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Success Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border-t-4 border-indigo-600">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
              <CheckCircle size={22} />
              {t("petitionDetails")}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Petition Info */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Info label="Petition ID" value={petition.petition_code} />
              <Info label="Name" value={petition.name} />
              <Info label="Phone" value={petition.phone} />
              <Info label="Email" value={petition.email || "N/A"} />
              <Info label="Pincode" value={petition.pincode || "—"} />
              <Info
                label="Category"
                value={t_categories(petition.category)}
              />
              <Info label="Date" value={petition.date} />

              {/* Address full width */}
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold">{petition.address}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="p-4 bg-gray-50 rounded-lg border">
                {petition.description}
              </p>
            </div>

            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Status
              </label>
              <select
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value as PetitionStatus)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {(Object.keys(translations.en.status) as PetitionStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {t_status(s)}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : t("save")}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

const Info = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default PetitionDetailsModal;