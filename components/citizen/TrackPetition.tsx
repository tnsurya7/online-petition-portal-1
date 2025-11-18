import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

const TrackPetition: React.FC = () => {
  const { t, t_categories, t_status } = useI18n();

  const [query, setQuery] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

  const handleTrack = async () => {
    if (!query.trim()) {
      setError("Please enter Petition ID or Phone Number");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(
        `${API_BASE}/petitions/track?query=${query.trim()}`
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "No petition found.");
        setLoading(false);
        return;
      }

      setData(json);
    } catch (err: any) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusChipClass = (status: string) => {
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
    <div className="bg-white border border-blue-200 rounded-2xl shadow-xl p-8 md:p-10 max-w-3xl mx-auto">

      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center border-b pb-3">
        Track Your Petition
      </h2>

      {/* INPUT */}
      <div className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter Petition ID or Phone Number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleTrack}
          disabled={loading}
          className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-white text-lg font-medium transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Search size={20} /> {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {loading && (
        <p className="text-gray-500 text-center animate-pulse">
          Fetching petition details...
        </p>
      )}

      {error && !loading && (
        <p className="text-red-600 text-center font-medium">{error}</p>
      )}

      {/* RESULT */}
      {data && !loading && (
        <div className="border border-blue-100 rounded-xl p-6 bg-blue-50/40 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <strong className="text-gray-700">Petition ID:</strong>
              <p className="text-gray-900 mt-1">{data.petition_code}</p>
            </div>

            <div>
              <strong className="text-gray-700">Status:</strong>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusChipClass(
                  data.status
                )}`}
              >
                {t_status(data.status)}
              </span>
            </div>

            <div>
              <strong className="text-gray-700">Title:</strong>
              <p className="text-gray-900 mt-1">{data.title}</p>
            </div>

            <div>
              <strong className="text-gray-700">Category:</strong>
              <p className="text-gray-900 mt-1">{t_categories(data.category)}</p>
            </div>

            <div className="col-span-2">
              <strong className="text-gray-700">Description:</strong>
              <p className="text-gray-800 mt-1 bg-white p-3 rounded-lg border">
                {data.description}
              </p>
            </div>

            {data.remarks && (
              <div className="col-span-2">
                <strong className="text-gray-700">Remarks:</strong>
                <p className="text-gray-800 mt-1 bg-white p-3 rounded-lg border">
                  {data.remarks}
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPetition;