import React, { useState } from 'react';
import Header from './shared/Header';
import HomePage from './citizen/HomePage';
import SubmitPetitionForm from './citizen/SubmitPetitionForm';
import TrackPetition from './citizen/TrackPetition';
import AdminLogin from './admin/AdminLogin';
import Chatbot from './citizen/Chatbot';

interface CitizenPortalProps {
  view: string;
  setView: (view: string) => void;
  onAdminLogin: () => void;
  isUser: boolean;             // ⭐ get from App.tsx
}

const CitizenPortal: React.FC<CitizenPortalProps> = ({ view, setView, onAdminLogin, isUser }) => {
  const [chatOpen, setChatOpen] = useState(false);

  // ⭐ USER LOGOUT HANDLER
  const handleUserLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_email");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2ff] via-white to-[#cfe8ff]">

      {/* ⭐ Header now shows logout only when isUser = true */}
      <Header
        view={view}
        setView={setView}
        isAdmin={false}
        isUser={isUser}            // ✔ dynamic
        onLogout={handleUserLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && <HomePage setView={setView} />}
        {view === 'submit' && <SubmitPetitionForm />}
        {view === 'track' && <TrackPetition />}
        {view === 'admin' && <AdminLogin onLoginSuccess={onAdminLogin} />}
      </main>

      {/* Chatbot */}
      <Chatbot isOpen={chatOpen} setIsOpen={setChatOpen} />
    </div>
  );
};

export default CitizenPortal;