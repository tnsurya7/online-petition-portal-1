
import React, { createContext, useContext } from 'react';
import { translations } from '../constants/translations';

export type Language = 'en' | 'ta';

interface I18nContextType {
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = I18nContext.Provider;

// FIX: Define a type for keys that map to string values to ensure `t` function returns a string.
type SimpleTranslationKey = {
  [K in keyof typeof translations.en]: (typeof translations.en)[K] extends string ? K : never;
}[keyof typeof translations.en];

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  const t = (key: SimpleTranslationKey) => {
    // This is safe because SimpleTranslationKey ensures we only access string properties
    return translations[context.lang][key] || translations.en[key];
  };

  const t_categories = (key: keyof typeof translations.en.categories) => {
    return translations[context.lang].categories[key] || translations.en.categories[key];
  }

  const t_status = (key: keyof typeof translations.en.status) => {
    return translations[context.lang].status[key] || translations.en.status[key];
  }

  return { ...context, t, t_categories, t_status };
};
