
import React from 'react';
import { Home, FileText } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface HomePageProps {
  setView: (view: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  const { t } = useI18n();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center transform hover:scale-[1.01] transition-transform duration-300">
      <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
        <Home className="text-indigo-600" size={48} />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{t('homeWelcome')}</h2>
      <p className="text-base md:text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
        {t('homeDescription')}
      </p>
      <button
        onClick={() => setView('submit')}
        className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
      >
        <FileText size={20} />
        {t('getStarted')}
      </button>
    </div>
  );
};

export default HomePage;
