
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

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ type: 'bot', text: t('chatGreeting') }]);
    }
  }, [isOpen, lang, t, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    try {
      const botResponse = await generatePetitionText(input);
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: t('apiError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg hover:shadow-xl transition-transform hover:scale-110 flex items-center justify-center text-white z-40 animate-bounce"
        aria-label="Open Chatbot"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[calc(100%-3rem)] sm:w-96 h-[60vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-orange-400 to-yellow-400 p-4 rounded-t-2xl flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-2xl">🌞</div>
          <div>
            <h3 className="font-bold">{t('suryaName')}</h3>
            <p className="text-xs opacity-90">{t('aiAssistant')}</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200" aria-label="Close Chatbot"><X size={24} /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'bot' && <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">🌞</div>}
            <div className={`max-w-[80%] p-3 rounded-xl ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">🌞</div>
             <div className="p-3 bg-gray-100 rounded-xl rounded-bl-none">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chatPlaceholder')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <button onClick={handleSend} disabled={isLoading} className="w-10 h-10 flex-shrink-0 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center transition">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
