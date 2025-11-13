import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { usePetitions } from '../../context/PetitionContext';
import { PetitionCategory } from '../../types';
import SuccessModal from '../shared/SuccessModal';
import { translations } from '../../constants/translations';

const SubmitPetitionForm: React.FC = () => {
  const { t, t_categories } = useI18n();
  const { addPetition } = usePetitions();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'road' as PetitionCategory,
    description: '',
    file: undefined as File | undefined
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPetitionId, setLastPetitionId] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  // ✅ Updated handleSubmit: sends FormData (supports file upload)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', 'Pending');

      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await fetch('http://localhost:5001/api/petitions', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        // Optional: Add locally for instant UI update
        addPetition(result);
        setLastPetitionId(result.petition_id || '');
        setShowSuccess(true);

        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          category: 'road' as PetitionCategory,
          description: '',
          file: undefined
        });
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting petition:', error);
      alert('❌ Failed to submit petition. Please check your backend or network.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('submit')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {(Object.keys(translations.en.categories) as PetitionCategory[]).map(key => (
                <option key={key} value={key}>
                  {t_categories(key as PetitionCategory)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('upload')}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {formData.file ? (
                  <p className="text-sm text-green-600">{formData.file.name}</p>
                ) : (
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-all shadow-md hover:shadow-lg"
          >
            {t('submitBtn')}
          </button>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        petitionId={lastPetitionId}
      />
    </>
  );
};

export default SubmitPetitionForm;