import React, { useState } from "react";
import Footer from "./components/Footer";
import CitizenPortal from "./components/CitizenPortal";
import AdminPortal from "./components/AdminPortal";
import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";
import { I18nProvider } from "./context/I18nContext";
import { PetitionProvider } from "./context/PetitionContext";
import Chatbot from "./components/citizen/Chatbot";

export const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  // Navigation: home | login | register
  const [view, setView] = useState<"home" | "login" | "register">("home");

  const [chatOpen, setChatOpen] = useState(false);

  // Smooth page-switcher
  const goTo = (page: any) => setView(page);

  return (
    <I18nProvider>
      <PetitionProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100 flex flex-col">

          {/* HEADER */}
          <header className="bg-white py-4 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-indigo-700">Online Petition Portal</h1>

              {/* LOGIN/REGISTER buttons only when logged out */}
              {!isAdmin && !isUser && (
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => goTo("login")}
                  >
                    Login
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                    onClick={() => goTo("register")}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* MAIN BODY */}
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

            {/* LOGIN PAGE */}
            {!isAdmin && !isUser && view === "login" && (
              <UserLogin
                onUserLogin={(token, email) => {
                  localStorage.setItem("user_token", token);
                  localStorage.setItem("user_email", email);
                  setIsUser(true);
                }}
                onSwitchToRegister={() => goTo("register")}
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
              <div className="text-center py-20 transition-all duration-300">
                <h2 className="text-4xl font-bold text-indigo-600 mb-4">
                  Welcome to the Online Petition Portal
                </h2>
                <p className="text-gray-700">Please login or register to continue.</p>
              </div>
            )}
          </div>

          {/* CHATBOT */}
          <Chatbot isOpen={chatOpen} setIsOpen={setChatOpen} />
          <Footer />
        </div>
      </PetitionProvider>
    </I18nProvider>
  );
};

export default App;