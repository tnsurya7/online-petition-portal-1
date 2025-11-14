// App.tsx (replace)
import Footer from './components/Footer';
import React, { useState, useMemo, useEffect } from 'react';
import CitizenPortal from './components/CitizenPortal';
import AdminPortal from './components/AdminPortal';
import { I18nProvider, Language } from './context/I18nContext';
import { PetitionProvider } from './context/PetitionContext';
import UserLogin from './components/UserLogin';
import UserRegister from './components/UserRegister';

export const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<boolean>(false);
  const [view, setView] = useState<string>('home');

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check admin token
    const checkAdmin = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return setIsAdmin(false);
      try {
        const res = await fetch(`${API_BASE}/users/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setIsAdmin(true);
        else {
          localStorage.removeItem("admin_token");
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };

    // Check normal user token
    const checkUser = async () => {
      const token = localStorage.getItem("user_token");
      if (!token) return setIsUser(false);
      try {
        const res = await fetch(`${API_BASE}/users/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setIsUser(true);
        else {
          localStorage.removeItem("user_token");
          setIsUser(false);
        }
      } catch {
        setIsUser(false);
      }
    };

    checkAdmin();
    checkUser();
  }, []);

  const i18nValue = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <I18nProvider value={i18nValue}>
      <PetitionProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 font-sans flex flex-col">
          <div className="flex-grow">
            {isAdmin ? (
              <AdminPortal onLogout={() => {
                localStorage.removeItem("admin_token");
                setIsAdmin(false);
                setView('home');
              }} />
            ) : isUser ? (
              // Logged-in normal user sees citizen portal (you can also adjust to show more user-only features)
              <CitizenPortal view={view} setView={setView} onAdminLogin={() => setIsAdmin(true)} />
            ) : (
              // Not logged in: show citizen portal but provide login/register buttons inside it,
              // or show login UI modal. Here we show buttons at top to open login/register.
              <>
                <div className="max-w-7xl mx-auto px-4 py-6 flex justify-end gap-4">
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => { setShowLogin(true); setShowRegister(false); }}>
                    User Login
                  </button>
                  <button className="px-3 py-2 bg-white border rounded" onClick={() => { setShowRegister(true); setShowLogin(false); }}>
                    Register
                  </button>
                </div>

                {showLogin ? (
                  <UserLogin onUserLogin={(token) => { localStorage.setItem("user_token", token); setIsUser(true); setShowLogin(false); }} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
                ) : showRegister ? (
                  <UserRegister onRegistered={(token) => { localStorage.setItem("user_token", token); setIsUser(true); setShowRegister(false); }} onCancel={() => setShowRegister(false)} />
                ) : (
                  <CitizenPortal view={view} setView={setView} onAdminLogin={() => setIsAdmin(true)} />
                )}
              </>
            )}
          </div>

          <Footer />
        </div>
      </PetitionProvider>
    </I18nProvider>
  );
};

export default App;