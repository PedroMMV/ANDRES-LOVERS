/**
 * Settings modal component
 * Comprehensive settings panel for user preferences
 */

import React, { useState } from 'react';
import { X, Check, Download, Upload, RotateCcw } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import { Checkbox } from './Checkbox';
import { Slider } from './Slider';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    isOpen,
    closeSettings,
    updateSettings,
    resetSettings,
    exportSettings,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<'appearance' | 'dashboard' | 'advanced'>('appearance');

  if (!isOpen) return null;

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            updateSettings(imported);
            alert('Settings imported successfully!');
          } catch (error) {
            alert('Error importing settings. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const tabs = [
    { id: 'appearance' as const, label: 'Appearance' },
    { id: 'dashboard' as const, label: 'Dashboard' },
    { id: 'advanced' as const, label: 'Advanced' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={closeSettings}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <button
              onClick={closeSettings}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 px-6 pt-4 border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Visual Preferences
                  </h3>

                  <div className="space-y-4">
                    <Dropdown
                      label="Theme"
                      value={settings.theme}
                      onChange={(val) => updateSettings({ theme: val as any })}
                      options={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'auto', label: 'Auto (System)' },
                      ]}
                      helperText="Choose your preferred color scheme"
                    />

                    <Dropdown
                      label="Language"
                      value={settings.language}
                      onChange={(val) => updateSettings({ language: val as any })}
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Español' },
                      ]}
                      helperText="Select interface language"
                    />

                    <Dropdown
                      label="Density"
                      value={settings.density}
                      onChange={(val) => updateSettings({ density: val as any })}
                      options={[
                        { value: 'comfortable', label: 'Comfortable' },
                        { value: 'compact', label: 'Compact' },
                      ]}
                      helperText="Adjust spacing and padding"
                    />

                    <Dropdown
                      label="Color Scheme"
                      value={settings.colorScheme}
                      onChange={(val) => updateSettings({ colorScheme: val as any })}
                      options={[
                        { value: 'default', label: 'Default' },
                        { value: 'colorblind', label: 'Colorblind Friendly' },
                        { value: 'monochrome', label: 'Monochrome' },
                      ]}
                      helperText="Choose visualization colors"
                    />

                    <Checkbox
                      label="Enable chart animations"
                      checked={settings.chartAnimations}
                      onChange={(val) => updateSettings({ chartAnimations: val })}
                      helperText="Animate charts when data changes"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Dashboard Preferences
                  </h3>

                  <div className="space-y-4">
                    <Dropdown
                      label="Default Page"
                      value={settings.defaultPage}
                      onChange={(val) => updateSettings({ defaultPage: val as string })}
                      options={[
                        { value: '/', label: 'Home / Recommender' },
                        { value: '/data-explorer', label: 'Data Explorer' },
                        { value: '/regressor', label: 'Regressor' },
                        { value: '/metrics', label: 'Metrics' },
                        { value: '/help', label: 'Help' },
                      ]}
                      helperText="Page to show when you open the app"
                    />

                    <Checkbox
                      label="Show helpful hints"
                      checked={settings.showHints}
                      onChange={(val) => updateSettings({ showHints: val })}
                      helperText="Display tooltips and guidance"
                    />

                    <Checkbox
                      label="Auto-save form data"
                      checked={settings.autoSave}
                      onChange={(val) => updateSettings({ autoSave: val })}
                      helperText="Automatically save form inputs"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Recommendation Defaults
                  </h3>

                  <div className="space-y-4">
                    <Slider
                      label="Default Top K"
                      value={settings.defaultTopK}
                      onChange={(val) => updateSettings({ defaultTopK: val })}
                      min={5}
                      max={20}
                      step={1}
                      helperText="Default number of recommendations to show"
                    />

                    <Checkbox
                      label="Only show active products by default"
                      checked={settings.defaultOnlyActive}
                      onChange={(val) => updateSettings({ defaultOnlyActive: val })}
                      helperText="Filter out inactive products"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Advanced Options
                  </h3>

                  <div className="space-y-4">
                    <Checkbox
                      label="Enable experimental features"
                      checked={settings.enableExperimentalFeatures}
                      onChange={(val) => updateSettings({ enableExperimentalFeatures: val })}
                      helperText="Access beta features (may be unstable)"
                    />

                    <Checkbox
                      label="Debug mode"
                      checked={settings.debugMode}
                      onChange={(val) => updateSettings({ debugMode: val })}
                      helperText="Show additional debugging information"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Data Management
                  </h3>

                  <div className="space-y-4">
                    <Button
                      variant="secondary"
                      onClick={exportSettings}
                      className="w-full justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Settings
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handleImport}
                      className="w-full justify-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Settings
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all settings to defaults?')) {
                          resetSettings();
                        }
                      }}
                      className="w-full justify-center text-red-600 hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              <span>Settings auto-saved</span>
            </div>
            <Button onClick={closeSettings}>Close</Button>
          </div>
        </div>
      </div>
    </>
  );
};
