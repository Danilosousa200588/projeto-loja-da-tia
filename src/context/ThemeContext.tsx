import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemePreset, ThemeColors, StoreSettings } from '../types/store';

export const DEFAULT_THEMES: Record<ThemePreset, ThemeColors> = {
  'rose-boutique': {
    bg: '#FAF8F5',
    surface: '#FFFFFF',
    primary: '#B76E79',
    secondary: '#F3E5E6',
    accent: '#D4AF37',
    text: '#2D2522',
    textMuted: '#786C68',
    border: '#EFE7E1',
    buttonBg: '#B76E79',
    buttonText: '#FFFFFF',
    fontHeading: "'Cormorant Garamond', 'Playfair Display', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    cardRadius: '0.75rem',
    buttonRadius: '0.5rem',
    cardStyle: 'soft',
  },
  'minimalista-elegante': {
    bg: '#F7F5F0',
    surface: '#FFFFFF',
    primary: '#7B624D',
    secondary: '#D9CEBE',
    accent: '#A38B74',
    text: '#252220',
    textMuted: '#6E6863',
    border: '#E5DFD5',
    buttonBg: '#252220',
    buttonText: '#FFFFFF',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    cardRadius: '0.375rem',
    buttonRadius: '0.25rem',
    cardStyle: 'border',
  },
  'dark-fashion': {
    bg: '#121212',
    surface: '#1E1E1E',
    primary: '#D4AF37',
    secondary: '#2E2E2E',
    accent: '#F5D77F',
    text: '#F5F5F5',
    textMuted: '#A3A3A3',
    border: '#2A2A2A',
    buttonBg: '#D4AF37',
    buttonText: '#121212',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    cardRadius: '0.5rem',
    buttonRadius: '0.5rem',
    cardStyle: 'border',
  },
  'pink-glamour': {
    bg: '#FFF5F7',
    surface: '#FFFFFF',
    primary: '#E60067',
    secondary: '#FFD1DF',
    accent: '#B8860B',
    text: '#291219',
    textMuted: '#805362',
    border: '#FCD6E2',
    buttonBg: '#E60067',
    buttonText: '#FFFFFF',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Montserrat', sans-serif",
    cardRadius: '1rem',
    buttonRadius: '9999px',
    cardStyle: 'shadow',
  },
  custom: {
    bg: '#FAF8F5',
    surface: '#FFFFFF',
    primary: '#B76E79',
    secondary: '#F3E5E6',
    accent: '#D4AF37',
    text: '#2D2522',
    textMuted: '#786C68',
    border: '#EFE7E1',
    buttonBg: '#B76E79',
    buttonText: '#FFFFFF',
    fontHeading: "'Cormorant Garamond', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    cardRadius: '0.75rem',
    buttonRadius: '0.5rem',
    cardStyle: 'soft',
  },
};

interface ThemeContextType {
  activeTheme: ThemePreset;
  themeSettings: ThemeColors;
  previewTheme: ThemeColors | null;
  isPreviewing: boolean;
  applyTheme: (preset: ThemePreset, custom?: Partial<ThemeColors>) => Promise<boolean>;
  setPreview: (colors: ThemeColors | null) => void;
  resetPreview: () => void;
  settings: StoreSettings | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemePreset>('rose-boutique');
  const [themeSettings, setThemeSettings] = useState<ThemeColors>(DEFAULT_THEMES['rose-boutique']);
  const [previewTheme, setPreviewTheme] = useState<ThemeColors | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Apply CSS variables to root
  const applyCssVariables = useCallback((theme: ThemeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-btn-bg', theme.buttonBg);
    root.style.setProperty('--color-btn-text', theme.buttonText);
    root.style.setProperty('--radius-btn', theme.buttonRadius);
    root.style.setProperty('--radius-card', theme.cardRadius);
    root.style.setProperty('--font-heading', theme.fontHeading);
    root.style.setProperty('--font-body', theme.fontBody);

    // Apply dark class if bg is dark for Tailwind dark support
    if (theme.bg === '#121212' || theme.text === '#F5F5F5') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data: StoreSettings = await res.json();
        setSettings(data);
        if (data.activeTheme) {
          setActiveTheme(data.activeTheme);
        }
        if (data.themeSettings) {
          setThemeSettings(data.themeSettings);
          if (!previewTheme) {
            applyCssVariables(data.themeSettings);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, [applyCssVariables, previewTheme]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // When preview changes or themeSettings changes, apply to DOM
  useEffect(() => {
    if (previewTheme) {
      applyCssVariables(previewTheme);
    } else if (themeSettings) {
      applyCssVariables(themeSettings);
    }
  }, [previewTheme, themeSettings, applyCssVariables]);

  const setPreview = (colors: ThemeColors | null) => {
    setPreviewTheme(colors);
  };

  const resetPreview = () => {
    setPreviewTheme(null);
    if (themeSettings) {
      applyCssVariables(themeSettings);
    }
  };

  const applyTheme = async (preset: ThemePreset, custom?: Partial<ThemeColors>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('bemgarota_admin_token');
      const basePreset = DEFAULT_THEMES[preset] || themeSettings;
      const combined = { ...basePreset, ...(custom || {}) };

      const res = await fetch('/api/themes/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preset, customSettings: combined }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveTheme(data.activeTheme);
        setThemeSettings(data.themeSettings);
        setPreviewTheme(null);
        applyCssVariables(data.themeSettings);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error applying theme:', err);
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('bemgarota_admin_token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });

      if (res.ok) {
        await refreshSettings();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating settings:', err);
      return false;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        themeSettings,
        previewTheme,
        isPreviewing: previewTheme !== null,
        applyTheme,
        setPreview,
        resetPreview,
        settings,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
