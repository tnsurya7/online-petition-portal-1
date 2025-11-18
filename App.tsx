import React, { useState, useEffect } from "react";
import Footer from "./components/Footer";
import CitizenPortal from "./components/CitizenPortal";
import AdminPortal from "./components/AdminPortal";
import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";
import { I18nProvider } from "./context/I18nContext";
import { PetitionProvider } from "./context/PetitionContext";

import GenieAssistant from "./components/common/GenieAssistant";   // ⭐ ADDED

export const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [view, setView] = useState("home");

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);

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

  if (checkingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <I18nProvider>
      <PetitionProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100 flex flex-col">
          
          {/* HEADER */}
          <header className="bg-white shadow-md py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <h1 className="text-2xl font-extrabold text-indigo-700 tracking-wide">
                Online Petition Portal
              </h1>

              {!isAdmin && !isUser && (
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
                    onClick={() => {
                      setShowLogin(true);
                      setShowRegister(false);
                    }}
                  >
                    User Login
                  </button>

                  <button
                    className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition"
                    onClick={() => {
                      setShowRegister(true);
                      setShowLogin(false);
                    }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </header>

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
                {/* HERO SECTION */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 shadow-lg animate-fadeIn">
                  <div className="max-w-5xl mx-auto text-center px-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
                      Raise Your Voice,  
                      <br />  
                      Strengthen Your Community
                    </h2>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                      Submit petitions, track progress, and bring real improvements
                      to your city or village.
                    </p>
                  </div>
                </div>

                {/* CENTER LOGIN PANEL */}
                <div className="flex justify-center items-center mt-10">
                  <div className="bg-white border shadow-xl rounded-2xl p-10 w-full max-w-md animate-slideUp">
                    <h3 className="text-2xl font-bold text-indigo-700 mb-2 text-center">
                      Welcome to the Citizen Portal
                    </h3>

                    <p className="text-gray-600 text-center mb-6">
                      Login or Register to submit and track petitions.
                    </p>

                    <div className="flex flex-col gap-4">
                      <button
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        onClick={() => {
                          setShowLogin(true);
                          setShowRegister(false);
                        }}
                      >
                        Login
                      </button>

                      <button
                        className="w-full py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                        onClick={() => {
                          setShowRegister(true);
                          setShowLogin(false);
                        }}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>

                {/* SHOW LOGIN */}
                {showLogin && (
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
                )}

                {/* SHOW REGISTER */}
                {showRegister && (
                  <UserRegister
                    onRegistered={(token) => {
                      localStorage.setItem("user_token", token);
                      setIsUser(true);
                      setShowRegister(false);
                    }}
                    onCancel={() => setShowRegister(false)}
                  />
                )}
              </>
            )}
          </div>

          {/* ⭐ AI Assistant (Genie Effect) */}
          <GenieAssistant />

          <Footer />
        </div>
      </PetitionProvider>
    </I18nProvider>
  );
};

export default App;