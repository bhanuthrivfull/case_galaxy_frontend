import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const LanguageContext = createContext();

// Language names
const languageNames = {
  en: "English",
  zh: "中文",
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem("preferredLanguage") || "en");
  const [translations, setTranslations] = useState({});
  
  // Fetch translations from API whenever the language changes
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/translations/${language}`);
        setTranslations(response.data);
      } catch (error) {
        console.error("Error fetching translations:", error);
      }
    };

    fetchTranslations();
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translations, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
