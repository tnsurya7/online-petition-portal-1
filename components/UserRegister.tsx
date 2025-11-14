// components/UserRegister.tsx
import React, { useState } from "react";
import { API_BASE } from "../App";

interface Props {
  onRegistered: (token: string) => void;
  onCancel?: () => void;
}

const UserRegister: React.FC<Props> = ({ onRegistered, onCancel }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Register failed");
      localStorage.setItem("user_token", data.token);
      onRegistered(data.token);
    } catch (err: any) {
      setErr(err.message || "Register error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {err && <p className="text-sm text-red-600 mb-2">{err}</p>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="flex justify-between items-center">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            {loading ? "Creating..." : "Create account"}
          </button>
          <button type="button" onClick={() => onCancel && onCancel()} className="text-sm text-gray-500">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UserRegister;