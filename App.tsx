import React, { useState } from "react";
import Footer from "./components/Footer";
import CitizenPortal from "./components/CitizenPortal";
import AdminPortal from "./components/AdminPortal";
import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";
import AdminLogin from "./components/admin/AdminLogin";
import { I18nProvider } from "./context/I18nContext";
import { PetitionProvider } from "./context/PetitionContext";
import Chatbot from "./components/citizen/Chatbot";

export const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  // home | login | register | admin-login
  const [view, setView] = useState<"home" | "login" | "register" | "admin-login">("home");

  const [chatOpen, setChatOpen] = useState(false);

  const goTo = (page: any) => setView(page);

  return (
    <I18nProvider>
      <PetitionProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100 flex flex-col">

          {/* HEADER */}
          <header className="bg-white py-4 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-indigo-700">
                Online Petition Portal
              </h1>

              {/* Buttons only when logged out */}
              {!isAdmin && !isUser && (
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                    onClick={() => goTo("login")}
                  >
                    User Login
                  </button>

                  <button
                    className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600"
                    onClick={() => goTo("register")}
                  >
                    Register
                  </button>

                  <button
                    className="px-4 py-2 rounded-lg bg-red-600 text-white"
                    onClick={() => goTo("admin-login")}
                  >
                    Admin Login
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* MAIN */}
          <div className="flex-grow">

            {/* ADMIN PORTAL */}
            {isAdmin && (
              <AdminPortal
                onLogout={() => {
                  localStorage.removeItem("admin_token");
                  setIsAdmin(false);
                  goTo("home");
                }}
              />
            )}

            {/* USER PORTAL */}
            {isUser && (
              <CitizenPortal
                view="home"
                setView={() => {}}
                onAdminLogin={() => setIsAdmin(true)}
              />
            )}

            {/* USER LOGIN */}
            {!isAdmin && !isUser && view === "login" && (
              <UserLogin
                onUserLogin={(token, email, role) => {
                  if (role === "admin") {
                    localStorage.setItem("admin_token", token);
                    setIsAdmin(true);
                  } else {
                    localStorage.setItem("user_token", token);
                    localStorage.setItem("user_email", email);
                    setIsUser(true);
                  }
                }}
                onSwitchToRegister={() => goTo("register")}
              />
            )}

            {/* ADMIN LOGIN */}
            {!isAdmin && !isUser && view === "admin-login" && (
              <AdminLogin
                onLoginSuccess={() => {
                  setIsAdmin(true);
                }}
              />
            )}

            {/* REGISTER PAGE */}
            {!isAdmin && !isUser && view === "register" && (
              <UserRegister
                onRegistered={(token, email) => {
                  localStorage.setItem("user_token", token);
                  localStorage.setItem("user_email", email);
                  setIsUser(true);
                }}
                onCancel={() => goTo("login")}
              />
            )}

            {/* HOME PAGE */}
            {!isAdmin && !isUser && view === "home" && (
              <div className="text-center py-20">
                <h2 className="text-4xl font-bold text-indigo-600 mb-4">
                  Welcome to the Online Petition Portal
                </h2>
                <p className="text-gray-700">Please login or register to continue.</p>
              </div>
            )}
          </div>

          <Chatbot isOpen={chatOpen} setIsOpen={setChatOpen} />
          <Footer />
        </div>
      </PetitionProvider>
    </I18nProvider>
  );
};

export default App;