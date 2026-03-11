/**
 * Internationalization (i18n) hook
 * Provides translation function based on current language setting
 */

import { useSettings } from '../contexts/SettingsContext';
import { translations, type Translations } from './translations';

type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeys<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = DeepKeys<Translations>;

/**
 * Custom hook for accessing translations
 * @returns Translation function that accepts dot-notation keys
 * @example
 * const { t } = useTranslation();
 * return <h1>{t('nav.home')}</h1>; // Returns "Home" in English or "Inicio" in Spanish
 */
export const useTranslation = () => {
  const { settings } = useSettings();
  const currentLanguage = settings.language;

  /**
   * Get translation by dot-notation key
   * @param key - Translation key in dot notation (e.g., "nav.home")
   * @returns Translated string or the key itself if translation not found
   */
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Translation not found, return the key
        console.warn(`Translation not found for key: ${key} in language: ${currentLanguage}`);
        return key;
      }
    }

    if (typeof value === 'string') {
      return value;
    }

    // If we ended up with an object instead of a string, return the key
    console.warn(`Translation key ${key} does not point to a string value`);
    return key;
  };

  return { t, language: currentLanguage };
};
