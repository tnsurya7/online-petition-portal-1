// components/UserLogin.tsx
import React, { useState } from "react";
import { API_BASE } from "../App";

interface Props {
  onUserLogin: (token: string) => void;
  onSwitchToRegister?: () => void;
}

const UserLogin: React.FC<Props> = ({ onUserLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // ⭐ SAVE TOKEN
      localStorage.setItem("user_token", data.token);

      // ⭐ SAVE EMAIL (Required for petition form)
      if (data.user && data.user.email) {
        localStorage.setItem("user_email", data.user.email);
      }

      onUserLogin(data.token);
    } catch (err: any) {
      setError(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">User Login</h2>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            className="text-sm text-gray-500"
            onClick={() => onSwitchToRegister && onSwitchToRegister()}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserLogin;