import React from "react";
import { LogOut } from "lucide-react";
import { useI18n } from "../../context/I18nContext";

const Header = ({ isAdmin, isUser, view, setView, onLogout }) => {
  const { lang, setLang } = useI18n();

  const NavButton = ({ label, keyName }) => (
    <button
      onClick={() => setView(keyName)}
      className={`px-4 py-2 ${
        view === keyName ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">

        <h1 className="text-xl font-bold text-indigo-700">
          Tamil Nadu Online Petition Portal
        </h1>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg"
          >
            {lang === "en" ? "தமிழ்" : "English"}
          </button>

          {(isUser || isAdmin) && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg"
            >
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      </div>

      {!isAdmin && isUser && (
        <nav className="border-t mt-3 flex gap-4 px-4">
          <NavButton keyName="home" label="Home" />
          <NavButton keyName="submit" label="Submit Petition" />
          <NavButton keyName="track" label="Track Petition" />
        </nav>
      )}
    </header>
  );
};

export default Header;