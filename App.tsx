import React, { useState, useMemo, useEffect } from "react";
import Footer from "./components/Footer";
import CitizenPortal from "./components/CitizenPortal";
import AdminPortal from "./components/AdminPortal";
import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";
import { I18nProvider, Language } from "./context/I18nContext";
import { PetitionProvider } from "./context/PetitionContext";

export const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>("en");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [view, setView] = useState("home");

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // NEW: Prevent flicker — wait for auth check
  const [checkingAuth, setCheckingAuth] = useState(true);

  // -----------------------------
  // Auto-check authentication
  // -----------------------------
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/users/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setIsAdmin(true);
        else localStorage.removeItem("admin_token");
      } catch {}
    };

    const checkUser = async () => {
      const token = localStorage.getItem("user_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/users/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setIsUser(true);
        else localStorage.removeItem("user_token");
      } catch {}
    };

    Promise.all([checkAdmin(), checkUser()]).finally(() =>
      setCheckingAuth(false)
    );
  }, []);

  // Show loading... prevents flicker
  if (checkingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  const i18nValue = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <I18nProvider value={i18nValue}>
      <PetitionProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 font-sans flex flex-col">
          <div className="flex-grow">
            {isAdmin ? (
              <AdminPortal
                onLogout={() => {
                  localStorage.removeItem("admin_token");
                  setIsAdmin(false);
                  setView("home");
                }}
              />
            ) : isUser ? (
              <CitizenPortal
                view={view}
                setView={setView}
                onAdminLogin={() => setIsAdmin(true)}
              />
            ) : (
              <>
                {/* LOGIN & REGISTER BUTTONS */}
                <div className="max-w-7xl mx-auto px-4 py-6 flex justify-end gap-4">
                  <button
                    className="px-3 py-2 bg-indigo-600 text-white rounded"
                    onClick={() => {
                      setShowLogin(true);
                      setShowRegister(false);
                    }}
                  >
                    User Login
                  </button>

                  <button
                    className="px-3 py-2 bg-white border rounded"
                    onClick={() => {
                      setShowRegister(true);
                      setShowLogin(false);
                    }}
                  >
                    Register
                  </button>
                </div>

                {/* LOGIN / REGISTER SCREENS */}
                {showLogin ? (
                  <UserLogin
                    onUserLogin={(token) => {
                      localStorage.setItem("user_token", token);
                      setIsUser(true);
                      setShowLogin(false);
                    }}
                    onSwitchToRegister={() => {
                      setShowLogin(false);
                      setShowRegister(true);
                    }}
                  />
                ) : showRegister ? (
                  <UserRegister
                    onRegistered={(token) => {
                      localStorage.setItem("user_token", token);
                      setIsUser(true);
                      setShowRegister(false);
                    }}
                    onCancel={() => setShowRegister(false)}
                  />
                ) : (
                  // NEVER show CitizenPortal before login
                  <div className="text-center text-gray-500 mt-10">
                    Please login or register to continue.
                  </div>
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