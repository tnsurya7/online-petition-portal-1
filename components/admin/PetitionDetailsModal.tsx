import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { usePetitions } from '../../context/PetitionContext';
import { Petition, PetitionStatus } from '../../types';
import { translations } from '../../constants/translations';

interface PetitionDetailsModalProps {
  petition: Petition;
  onClose: () => void;
}

const PetitionDetailsModal: React.FC<PetitionDetailsModalProps> = ({ petition, onClose }) => {
  const { t, t_categories, t_status } = useI18n();
  const { updatePetition, refreshPetitionsFromDB } = usePetitions(); // ✅ Added refresh function
  const [editStatus, setEditStatus] = useState<PetitionStatus>(petition.status);
  const [editRemarks, setEditRemarks] = useState(petition.remarks || '');
  const [saving, setSaving] = useState(false);

  // ✅ Update petition in DB + context + auto-refresh
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const response = await fetch(`http://localhost:5001/api/petitions/${petition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          remarks: editRemarks,
        }),
      });

      if (!response.ok) throw new Error('Failed to update petition in database');

      // ✅ Update frontend immediately
      updatePetition(petition.id, editStatus, editRemarks);

      // ✅ Fetch latest data from DB (auto-refresh dashboard)
      await refreshPetitionsFromDB();

      alert('✅ Petition updated successfully!');
      onClose();
    } catch (error) {
      console.error('❌ Error updating petition:', error);
      alert('Failed to update petition. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-indigo-600" size={22} />
            {t('petitionDetails')}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {/* Petition Info */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-600">{t('id')}</p><p className="font-semibold">{petition.id}</p></div>
            <div><p className="text-sm text-gray-600">{t('date')}</p><p className="font-semibold">{petition.date}</p></div>
            <div><p className="text-sm text-gray-600">{t('name')}</p><p className="font-semibold">{petition.name}</p></div>
            <div><p className="text-sm text-gray-600">{t('phone')}</p><p className="font-semibold">{petition.phone}</p></div>
            <div><p className="text-sm text-gray-600">{t('email')}</p><p className="font-semibold">{petition.email || 'N/A'}</p></div>
            <div><p className="text-sm text-gray-600">{t('category')}</p><p className="font-semibold">{t_categories(petition.category)}</p></div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('description')}</p>
            <p className="p-4 bg-gray-50 rounded-lg border">{petition.description}</p>
          </div>

          {/* Update Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('updateStatus')}</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as PetitionStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {(Object.keys(translations.en.status) as PetitionStatus[]).map(status => (
                <option key={status} value={status}>{t_status(status)}</option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('remarks')}</label>
            <textarea
              value={editRemarks}
              onChange={(e) => setEditRemarks(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-60"
          >
            {saving ? 'Saving...' : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetitionDetailsModal;