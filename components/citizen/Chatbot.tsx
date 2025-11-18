import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { ChatMessage } from '../../types';
import { generatePetitionText } from '../../services/geminiService';

interface ChatbotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen }) => {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** Greeting on first open */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { type: 'bot', text: t('chatGreeting') || 'Hello! How can I assist you today?' }
      ]);
    }
  }, [isOpen, lang, t, messages.length]);

  /** Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Send Message */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await generatePetitionText(input);
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { type: 'bot', text: t('apiError') || 'AI service unavailable.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------ CLOSED BUTTON ------------------------ */
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-transform hover:scale-105 flex items-center justify-center z-40"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  /* ------------------------ OPEN CHATBOT ------------------------ */
  return (
    <div className="fixed bottom-6 right-6 w-[calc(100%-3rem)] sm:w-96 h-[60vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up border border-indigo-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 p-4 rounded-t-2xl flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          {/* SURYA AI Avatar (Professional) */}
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-semibold text-sm">
            SA
          </div>
          <div>
            <h3 className="font-bold text-base">SURYA AI</h3>
            <p className="text-xs opacity-90">Virtual Assistant</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="hover:text-gray-300 transition"
        >
          <X size={24} />
        </button>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Bot Icon */}
            {msg.type === 'bot' && (
              <div className="w-8 h-8 bg-indigo-300 rounded-full flex items-center justify-center text-xs font-semibold">
                SA
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-[80%] p-3 rounded-xl text-sm shadow ${
                msg.type === 'user'
                  ? 'bg-indigo-700 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 bg-indigo-300 rounded-full flex items-center justify-center text-xs font-semibold">
              SA
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl rounded-bl-none">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-3 border-t bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="w-10 h-10 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full flex items-center justify-center disabled:bg-indigo-400 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Chatbot;