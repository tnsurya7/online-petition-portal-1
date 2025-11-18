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

  // ⭐ Main navigation
  const [view, setView] = useState<"home" | "login" | "register">("home");

  const [chatOpen, setChatOpen] = useState(false);

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
                    onClick={() => setView("login")}
                  >
                    Login
                  </button>

                  <button
                    className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition"
                    onClick={() => setView("register")}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* BODY */}
          <div className="flex-grow">

            {/* ADMIN SECTION */}
            {isAdmin && (
              <AdminPortal
                onLogout={() => {
                  localStorage.removeItem("admin_token");
                  setIsAdmin(false);
                  setView("home");
                }}
              />
            )}

            {/* USER SECTION */}
            {isUser && (
              <CitizenPortal
                view={view}
                setView={setView}
                isUser={true}
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
                  setView("home");
                }}
                onSwitchToRegister={() => setView("register")}
              />
            )}

            {/* REGISTER PAGE */}
            {!isAdmin && !isUser && view === "register" && (
              <UserRegister
                onRegistered={(token, email) => {
                  localStorage.setItem("user_token", token);
                  localStorage.setItem("user_email", email);
                  setIsUser(true);
                  setView("home");
                }}
                onCancel={() => setView("login")}
              />
            )}

            {/* HOME LANDING PAGE */}
            {!isAdmin && !isUser && view === "home" && (
              <div className="text-center py-20">
                <h2 className="text-4xl text-indigo-600 font-bold mb-6">
                  Welcome to Online Petition Portal
                </h2>
                <p className="text-gray-700 text-lg">
                  Please login or register to continue.
                </p>
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