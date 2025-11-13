
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 font-sans">
          {isAdmin ? (
            <AdminPortal onLogout={() => {
              setIsAdmin(false);
              setView('home');
            }} />
          ) : (
            <CitizenPortal
              view={view}
              setView={setView}
              onAdminLogin={() => setIsAdmin(true)}
            />
          )}
        </div>
      </PetitionProvider>
    </I18nProvider>
  );
};

export default App;
export const API_BASE = "http://localhost:5001/api";