// components/dashboard/UserTopbar.tsx
import React, { useState, useEffect } from "react";
import { Bell, Sun, Moon, User as UserIcon } from "lucide-react";

interface TopbarProps {
  userName?: string;
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
  onToggleDark?: (dark: boolean) => void;
}

const Topbar: React.FC<TopbarProps> = ({
  userName = "User",
  onToggleSidebar,
  onOpenNotifications,
  onToggleDark,
}) => {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setDark(saved === "dark");
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    if (onToggleDark) onToggleDark(next);
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1 rounded bg-[#e7f0ff] dark:bg-gray-800"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold text-[#0b3c8c] dark:text-white">
          Welcome, {userName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <select
          className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
          defaultValue={localStorage.getItem("lang") || "en"}
          onChange={(e) => {
            localStorage.setItem("lang", e.target.value);
            window.location.reload();
          }}
          aria-label="Language selector"
        >
          <option value="en">EN</option>
          <option value="ta">தமிழ்</option>
        </select>

        <button
          onClick={onOpenNotifications}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          onClick={toggleDark}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="flex items-center gap-2 px-3 py-1 border rounded bg-white dark:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-[#0b3c8c] text-white flex items-center justify-center font-medium">
            <UserIcon size={14} />
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200">{userName}</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;