/**
 * Settings context for user preferences and configuration
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { SettingsContextValue, UserSettings } from '../types/settings';
import { defaultSettings } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'smart-lube-settings';

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Load settings from localStorage
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  // Apply density setting to document
  useEffect(() => {
    document.documentElement.classList.remove('density-compact', 'density-comfortable');
    document.documentElement.classList.add(`density-${settings.density}`);
  }, [settings.density]);

  const openSettings = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }, []);

  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart-lube-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [settings]);

  const importSettings = useCallback((newSettings: UserSettings) => {
    setSettings({ ...defaultSettings, ...newSettings });
  }, []);

  const value: SettingsContextValue = {
    settings,
    isOpen,
    openSettings,
    closeSettings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
