import React, { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import { LogIn } from 'lucide-react';
import { API_BASE } from '../../App';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { t } = useI18n();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Example inside your admin login handler
const res = await fetch(`${API_BASE}/users/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: o.username, password: o.password })
});

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // Save JWT token
      localStorage.setItem("adminToken", data.token);

      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="flex flex-col items-center mb-6">
        <div className="p-3 bg-indigo-100 rounded-full mb-2">
          <LogIn className="text-indigo-600" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center">{t('login')}</h2>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('username')}</label>
          <input type="text" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
          <input type="password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition">{t('loginBtn')}</button>
        <p className="text-sm text-gray-500 text-center">{t('adminLoginPrompt')}</p>
      </form>
    </div>
  );
};

export default AdminLogin;
