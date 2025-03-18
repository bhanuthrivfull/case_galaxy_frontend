import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, changeLanguage, languageNames } = useLanguage();
  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="form-select d-inline-block w-auto"
    >
      {Object.keys(languageNames).map((code) => (
        <option key={code} value={code}>
          {languageNames[code]}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;