// src/context/LanguageContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import i18n from "../i18n";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("pl");

  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    if (storedLang) {
      setLanguage(storedLang);
      i18n.changeLanguage(storedLang); // sync i18n on load
    } else {
      i18n.changeLanguage(language); // default language sync
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "pl" ? "en" : "pl";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    i18n.changeLanguage(newLang); // sync i18n on toggle
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
