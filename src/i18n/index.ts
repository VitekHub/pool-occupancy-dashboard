import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import common_cs from './locales/cs/common.json';
import dashboard_cs from './locales/cs/dashboard.json';
import charts_cs from './locales/cs/charts.json';
import tables_cs from './locales/cs/tables.json';
import heatmaps_cs from './locales/cs/heatmaps.json';

import common_en from './locales/en/common.json';
import dashboard_en from './locales/en/dashboard.json';
import charts_en from './locales/en/charts.json';
import tables_en from './locales/en/tables.json';
import heatmaps_en from './locales/en/heatmaps.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      cs: {
        common: common_cs,
        dashboard: dashboard_cs,
        charts: charts_cs,
        tables: tables_cs,
        heatmaps: heatmaps_cs,
      },
      en: {
        common: common_en,
        dashboard: dashboard_en,
        charts: charts_en,
        tables: tables_en,
        heatmaps: heatmaps_en,
      },
    },
    lng: 'cs', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    ns: ['common', 'dashboard', 'charts', 'tables', 'heatmaps'],
    defaultNS: 'common',
  });

export default i18n;