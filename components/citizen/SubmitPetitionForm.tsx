import React, { useState } from "react";
import { Upload } from "lucide-react";
import { useI18n } from "../../context/I18nContext";
import SuccessModal from "../shared/SuccessModal";
import { PetitionCategory } from "../../types";
import { translations } from "../../constants/translations";

const SubmitPetitionForm: React.FC = () => {
  const { t, t_categories } = useI18n();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCode, setCreatedCode] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    pincode: "",
    title: "",
    category: "road" as PetitionCategory,
    description: "",
    file: undefined as File | undefined,
  });

  const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("user_token");
    if (!token) {
      alert("⚠ Please login to submit petition.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("address", formData.address);
      fd.append("phone", formData.phone);
      fd.append("pincode", formData.pincode);
      fd.append("title", formData.title);
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      if (formData.file) fd.append("file", formData.file);

      const res = await fetch(`${API_BASE}/petitions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) return alert("❌ " + (json.error || "Error submitting petition"));

      setCreatedCode(json.petition.petition_code);
      setShowSuccess(true);

      setFormData({
        name: "",
        address: "",
        phone: "",
        pincode: "",
        title: "",
        category: "road",
        description: "",
        file: undefined,
      });
    } catch {
      alert("❌ Network error. Please try again.");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-2xl mx-auto border border-blue-200">
        <div className="border-b pb-3 mb-6">
          <h2 className="text-3xl font-bold text-blue-700">{t("submit")}</h2>
          <p className="text-gray-600 text-sm mt-1">
            Submit your grievance securely to the Government of Tamil Nadu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              required
              value={formData.name}
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
                pattern="[0-9]{10}"
                required
                value={formData.phone}
                onChange={handleInput}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                name="pincode"
                type="number"
                required
                value={formData.pincode}
                onChange={handleInput}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Petition Title</label>
            <input
              name="title"
              required
              value={formData.title}
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("category")}</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(translations.en.categories) as PetitionCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {t_categories(cat)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("description")}</label>
            <textarea
              name="description"
              rows={5}
              required
              value={formData.description}
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("upload")}</label>
            <div className="border-2 border-blue-300 border-dashed rounded-xl p-6 text-center bg-blue-50/30">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-blue-500" />
                <label className="text-blue-700 hover:text-blue-900 cursor-pointer font-semibold">
                  Browse file
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
                {formData.file ? (
                  <p className="text-sm text-green-600">{formData.file.name}</p>
                ) : (
                  <p className="text-xs text-gray-500">PNG, JPG, PDF — Max size 10MB</p>
                )}\div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-md transition"
          >
            {t("submitBtn")}
          </button>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        petitionId={createdCode}
      />
    </>
  );
};

export default SubmitPetitionForm;
