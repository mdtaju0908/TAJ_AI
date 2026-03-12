import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';
export type FontSize = 'sm' | 'md' | 'lg';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'hi';

export interface SettingsState {
  theme: Theme;
  language: Language;
  fontSize: FontSize;
  typingAnimation: boolean;
  autoScroll: boolean;
  soundNotification: boolean;
  desktopNotifications: boolean;
  emailUpdates: boolean;
  twoFactorEnabled: boolean;
  saveHistory: boolean;
  
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setFontSize: (size: FontSize) => void;
  toggleTypingAnimation: () => void;
  toggleAutoScroll: () => void;
  toggleSoundNotification: () => void;
  toggleDesktopNotifications: () => void;
  toggleEmailUpdates: () => void;
  toggleTwoFactor: () => void;
  toggleSaveHistory: () => void;
  resetSettings: () => void;
  updateSetting: (key: keyof SettingsState, value: any) => void;
}

const defaultSettings = {
  theme: 'system' as Theme,
  language: 'en' as Language,
  fontSize: 'md' as FontSize,
  typingAnimation: true,
  autoScroll: true,
  soundNotification: false,
  desktopNotifications: false,
  emailUpdates: false,
  twoFactorEnabled: false,
  saveHistory: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleTypingAnimation: () => set((state) => ({ typingAnimation: !state.typingAnimation })),
      toggleAutoScroll: () => set((state) => ({ autoScroll: !state.autoScroll })),
      toggleSoundNotification: () => set((state) => ({ soundNotification: !state.soundNotification })),
      toggleDesktopNotifications: () => set((state) => ({ desktopNotifications: !state.desktopNotifications })),
      toggleEmailUpdates: () => set((state) => ({ emailUpdates: !state.emailUpdates })),
      toggleTwoFactor: () => set((state) => ({ twoFactorEnabled: !state.twoFactorEnabled })),
      toggleSaveHistory: () => set((state) => ({ saveHistory: !state.saveHistory })),
      resetSettings: () => set(defaultSettings),
      updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
