import React, { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';
import { usePetitions } from '../../context/PetitionContext';
import { Petition, PetitionStatus } from '../../types';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import PetitionDetailsModal from './PetitionDetailsModal';
import { translations } from '../../constants/translations';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between transition-transform hover:scale-105">
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>{icon}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const { t, t_categories, t_status, lang } = useI18n();
  const { petitions, setPetitions } = usePetitions();
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [filter, setFilter] = useState<PetitionStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // ✅ Fetch petitions from backend on mount
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/petitions');
        const data = await res.json();

        // ✅ Normalize backend response
        const normalized = data.map((p: any) => ({
          id: p.id || p.petition_id,
          name: p.name || p.full_name || '',
          category: p.category || p.petition_category || '',
          status: (p.status || p.petition_status || 'pending').toLowerCase(),
          phone: p.phone || p.mobile || '',
          email: p.email || '',
          description: p.description || p.petition_description || '',
          date: p.date || p.created_at || '',
          remarks: p.remarks || '',
        }));

        setPetitions(normalized);
      } catch (err) {
        console.error('❌ Failed to fetch petitions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPetitions();
  }, [setPetitions]);

  const stats = useMemo(() => ({
    total: petitions.length,
    pending: petitions.filter(p => p.status === 'pending').length,
    resolved: petitions.filter(p => p.status === 'resolved').length,
    rejected: petitions.filter(p => p.status === 'rejected').length,
  }), [petitions]);

  const filteredPetitions = useMemo(
    () => (filter === 'all' ? petitions : petitions.filter(p => p.status === filter)),
    [filter, petitions]
  );

  const getStatusChipClass = (status: PetitionStatus) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  // ✅ All hooks above; return below — no conditional hooks.
  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('dashboard')}</h2>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading petitions...</p>
      ) : (
        <>
          {/* ✅ Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title={t('totalPetitions')} value={stats.total} icon={<FileText size={24} />} color="text-indigo-600" />
            <StatCard title={t('pending')} value={stats.pending} icon={<Clock size={24} />} color="text-yellow-600" />
            <StatCard title={t('resolved')} value={stats.resolved} icon={<CheckCircle size={24} />} color="text-green-600" />
            <StatCard title={t('rejected')} value={stats.rejected} icon={<XCircle size={24} />} color="text-red-600" />
          </div>

          {/* ✅ Petition Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-xl font-bold text-gray-800">{t('petitionList')}</h3>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">{t('all')}</option>
                {(Object.keys(translations.en.status) as PetitionStatus[]).map(status => (
                  <option key={status} value={status}>{t_status(status)}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">{t('id')}</th>
                    <th scope="col" className="px-6 py-3">{t('name')}</th>
                    <th scope="col" className="px-6 py-3">{t('category')}</th>
                    <th scope="col" className="px-6 py-3">{lang === 'en' ? 'Status' : 'நிலை'}</th>
                    <th scope="col" className="px-6 py-3">{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPetitions.map(p => (
                    <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.id}</td>
                      <td className="px-6 py-4">{p.name || '—'}</td>
                      <td className="px-6 py-4">{t_categories(p.category) || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full font-medium ${getStatusChipClass(p.status)}`}>
                          {capitalize(p.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPetition(p)}
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          {t('viewDetails')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPetitions.length === 0 && (
                <p className="text-center py-8 text-gray-500">No petitions to display.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ✅ Modal */}
      {selectedPetition && (
        <PetitionDetailsModal petition={selectedPetition} onClose={() => setSelectedPetition(null)} />
      )}
    </>
  );
};

export default Dashboard;