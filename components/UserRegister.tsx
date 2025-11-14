// components/UserRegister.tsx
import React, { useState, useRef } from "react";
import { API_BASE } from "../App";

interface Props {
  onRegistered: (token: string) => void;
  onCancel?: () => void;
}

const UserRegister: React.FC<Props> = ({ onRegistered, onCancel }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    if (!email.includes("@")) {
      setErr("Invalid email format");
      emailRef.current?.focus();
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      passwordRef.current?.focus();
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      confirmRef.current?.focus();
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Register failed");

      localStorage.setItem("user_token", data.token);

      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        onRegistered(data.token);
      }, 1200);
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
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm">Email</label>
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm">Password</label>
          <div className="relative">
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                if (val.length < 6) setStrength("Weak");
                else if (val.length < 10) setStrength("Medium");
                else setStrength("Strong");
              }}
              className="w-full px-3 py-2 border rounded-md"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {strength && (
            <p className="text-xs mt-1">
              Password strength:{" "}
              <span
                className={
                  strength === "Weak"
                    ? "text-red-600"
                    : strength === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }
              >
                {strength}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm">Confirm Password</label>
          <div className="relative">
            <input
              ref={confirmRef}
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2 text-sm text-gray-500"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => onCancel && onCancel()}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>

      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          Account created successfully!
        </div>
      )}
    </div>
  );
};

export default UserRegister;