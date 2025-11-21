import React, { useState } from "react";
import { API_BASE } from "../../App";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/users/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid admin credentials");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      onLoginSuccess();
    } catch (err) {
      setError("Server error, try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg p-8 mt-8 rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>

      <form onSubmit={handleLogin} className="space-y-4">

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-4 py-2 rounded"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-4 py-2 rounded"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;