import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  view?: string;
  setView?: (view: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, view, setView, onLogout }) => {
  const { lang, setLang } = useI18n();

  // Manual label mapping so we never use missing translation keys
  const labels: Record<string, Record<string, string>> = {
    home: { en: "Home", ta: "முகப்பு" },
    submit: { en: "Submit Petition", ta: "மனு சமர்ப்பிக்க" },
    track: { en: "Track Petition", ta: "மனு நிலை" },
    admin: { en: "Admin", ta: "நிர்வாகம்" },
  };

  const NavButton: React.FC<{ tab: string }> = ({ tab }) => (
    <button
      onClick={() => setView && setView(tab)}
      className={`px-4 md:px-6 py-3 font-medium transition-all duration-200 text-sm md:text-base ${
        view === tab
          ? "text-indigo-600 border-b-2 border-indigo-600"
          : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
      }`}
    >
      {labels[tab][lang]}
    </button>
  );

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">

          {/* SHOW TITLE ONLY ON HOME PAGE */}
          {!isAdmin && view === "home" && (
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-indigo-700">
                Tamil Nadu Online Petition Portal
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                Submit your grievances and requests online.
              </p>
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setLang(lang === "en" ? "ta" : "en")}
              className="px-3 py-2 text-sm md:text-base bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition"
            >
              {lang === "en" ? "தமிழ்" : "English"}
            </button>

            {isAdmin && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm md:text-base"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* NAVIGATION ONLY FOR CITIZENS */}
        {!isAdmin && setView && (
          <nav className="mt-4 border-t pt-1">
            <div className="flex items-center justify-start -mb-px">
              {['home', 'submit', 'track', 'admin'].map((tab) => (
                <NavButton key={tab} tab={tab} />
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;