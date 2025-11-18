import React, { useState } from "react";
import Header from "./shared/Header";
import HomePage from "./citizen/HomePage";
import SubmitPetitionForm from "./citizen/SubmitPetitionForm";
import TrackPetition from "./citizen/TrackPetition";
import Chatbot from "./citizen/Chatbot";

interface Props {
  onUserLogout: () => void;
}

const CitizenPortal: React.FC<Props> = ({ onUserLogout }) => {
  const [view, setView] = useState<"home" | "submit" | "track">("home");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div>
      <Header isAdmin={false} isUser={true} onLogout={onUserLogout} view={view} setView={setView} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === "home" && <HomePage setView={setView} />}
        {view === "submit" && <SubmitPetitionForm />}
        {view === "track" && <TrackPetition />}
      </main>

      <Chatbot isOpen={chatOpen} setIsOpen={setChatOpen} />
    </div>
  );
};

export default CitizenPortal;