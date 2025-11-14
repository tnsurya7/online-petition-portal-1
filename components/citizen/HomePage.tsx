import React from 'react';
import { Home, FileText } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface HomePageProps {
  setView: (view: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white">

      {/* 🔵 TN GOVT HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10 px-6 md:px-12 text-center">
        <div className="flex flex-col items-center gap-4">

          {/* TN Govt emblem (safe SVG) */}
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shadow-md">
            <span className="text-4xl">🏛️</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-wide drop-shadow">
            Tamil Nadu Online Petition Portal
          </h1>

          <p className="text-sm md:text-base text-white/90 max-w-2xl">
            {t('homeDescription')}
          </p>
        </div>
      </div>

      {/* ⚪ CONTENT AREA */}
      <div className="p-8 md:p-12 text-center">
        <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4 shadow-inner">
          <Home className="text-indigo-600" size={48} />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          {t('homeWelcome')}
        </h2>

        <p className="text-base md:text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Easily submit your grievances and requests to your District Collector / MLA.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => setView('submit')}
          className="inline-flex items-center gap-2 px-10 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          <FileText size={22} />
          {t('getStarted')}
        </button>
      </div>

      {/* Decorative gradient bottom */}
      <div className="bg-gradient-to-r from-indigo-100 to-blue-100 h-3 w-full" />
    </div>
  );
};

export default HomePage;