import Footer from './components/Footer';
import React, { useState, useMemo } from 'react';
import CitizenPortal from './components/CitizenPortal';
import AdminPortal from './components/AdminPortal';
import { I18nProvider, Language } from './context/I18nContext';
import { PetitionProvider } from './context/PetitionContext';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [view, setView] = useState<string>('home');

  const i18nValue = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <I18nProvider value={i18nValue}>
      <PetitionProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 font-sans flex flex-col">
          
          {/* --- Main Content --- */}
          <div className="flex-grow">
            {isAdmin ? (
              <AdminPortal
                onLogout={() => {
                  setIsAdmin(false);
                  setView('home');
                }}
              />
            ) : (
              <CitizenPortal
                view={view}
                setView={setView}
                onAdminLogin={() => setIsAdmin(true)}
              />
            )}
          </div>

          {/* --- Footer --- */}
          <Footer />

        </div>
      </PetitionProvider>
    </I18nProvider>
  );
};

export default App;

export const API_BASE = "https://petition-backend-ow0l.onrender.com/api";