import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { usePetitions } from '../../context/PetitionContext';
import { Petition } from '../../types';

const TrackPetition: React.FC = () => {
  const { t, t_categories, t_status, lang } = useI18n();
  const { getPetitionByIdOrPhone, refreshPetitionsFromDB } = usePetitions();
  const [trackId, setTrackId] = useState('');
  const [trackedPetition, setTrackedPetition] = useState<Petition | undefined | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!trackId.trim()) return;
    setLoading(true);
    setTrackedPetition(null);

    try {
      await refreshPetitionsFromDB(); // ✅ fetch latest petitions from backend
      const found = getPetitionByIdOrPhone(trackId.trim());
      setTrackedPetition(found);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChipClass = (status: Petition['status']) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending':
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('track')}</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder={t('trackId')}
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={handleTrack}
          disabled={loading}
          className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
            loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Search size={18} />
          {loading ? t('searching') || 'Searching...' : t('search')}
        </button>
      </div>

      {loading && (
        <p className="text-gray-500 text-center animate-pulse">{t('loading') || 'Fetching petition...'}</p>
      )}

      {trackedPetition && !loading && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/50 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div><strong>{t('id')}:</strong> {trackedPetition.id}</div>
            <div><strong>{t('name')}:</strong> {trackedPetition.name}</div>
            <div><strong>{t('category')}:</strong> {t_categories(trackedPetition.category)}</div>
            <div>
              <strong>{lang === 'en' ? 'Status' : 'நிலை'}:</strong>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusChipClass(
                  trackedPetition.status
                )}`}
              >
                {t_status(trackedPetition.status)}
              </span>
            </div>
            <div className="col-span-1 md:col-span-2">
              <strong>{t('description')}:</strong>
              <p className="mt-1 text-gray-700">{trackedPetition.description}</p>
            </div>
            {trackedPetition.remarks && (
              <div className="col-span-1 md:col-span-2">
                <strong>{t('remarks')}:</strong>
                <p className="mt-1 text-gray-700">{trackedPetition.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {trackedPetition === undefined && !loading && (
        <p className="text-red-600 text-center">{t('noPetitionFound') || 'No petition found with that ID or phone number.'}</p>
      )}
    </div>
  );
};

export default TrackPetition;