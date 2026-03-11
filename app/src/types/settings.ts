/**
 * Type definitions for user settings and preferences
 */

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es';
export type Density = 'comfortable' | 'compact';

export interface UserSettings {
  // Appearance
  theme: ThemeMode;
  language: Language;
  density: Density;

  // Dashboard preferences
  defaultPage: string;
  showHints: boolean;
  autoSave: boolean;

  // Recommendations
  defaultTopK: number;
  defaultOnlyActive: boolean;

  // Data visualization
  chartAnimations: boolean;
  colorScheme: 'default' | 'colorblind' | 'monochrome';

  // Advanced
  enableExperimentalFeatures: boolean;
  debugMode: boolean;
}

export interface SettingsContextValue {
  settings: UserSettings;
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => void;
  importSettings: (settings: UserSettings) => void;
}

export const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'en',
  density: 'comfortable',
  defaultPage: '/',
  showHints: true,
  autoSave: true,
  defaultTopK: 5,
  defaultOnlyActive: true,
  chartAnimations: true,
  colorScheme: 'default',
  enableExperimentalFeatures: false,
  debugMode: false,
};
