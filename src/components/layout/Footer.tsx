import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation(['common']);

  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-400">
          {t('common:footer.text')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;