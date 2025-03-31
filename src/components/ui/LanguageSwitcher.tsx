import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'cs' ? 'en' : 'cs';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center px-3 py-2 text-sm font-medium text-blue-100 hover:text-white transition-colors"
      title={i18n.language === 'cs' ? 'Switch to English' : 'Přepnout do češtiny'}
    >
      <Languages className="w-5 h-5 mr-2" />
      {i18n.language === 'cs' ? 'EN' : 'CS'}
    </button>
  );
};

export default LanguageSwitcher;