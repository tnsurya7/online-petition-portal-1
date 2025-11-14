import React, { createContext, useContext, useState } from "react";
import { translations } from "../constants/translations";

export type Language = "en" | "ta";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// ✅ Correct Provider Component
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>("en");

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");

  const { lang, setLang } = context;

  const t = (key: keyof typeof translations.en) => {
    const text = translations[lang][key];
    return typeof text === "string" ? text : translations.en[key];
  };

  const t_categories = (key: keyof typeof translations.en.categories) =>
    translations[lang].categories[key] ?? translations.en.categories[key];

  const t_status = (key: keyof typeof translations.en.status) =>
    translations[lang].status[key] ?? translations.en.status[key];

  return { lang, setLang, t, t_categories, t_status };
};