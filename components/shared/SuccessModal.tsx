import React from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  petitionId: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, petitionId }) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-auto text-center transform transition-all animate-fade-in-up">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('success')}</h3>

        <p className="text-gray-600 mb-6">
          {t('petitionId')}{' '}
          <strong className="text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
            {petitionId}
          </strong>
        </p>

        <button
          onClick={onClose}
          className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;