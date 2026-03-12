"use client";

import { create } from "zustand";

interface UIStore {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  guestMessageCount: number;
  incrementGuestMessageCount: () => void;
  resetGuestMessageCount: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),
  isSettingsOpen: false,
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  guestMessageCount: 0,
  incrementGuestMessageCount: () => set((state) => ({ guestMessageCount: state.guestMessageCount + 1 })),
  resetGuestMessageCount: () => set({ guestMessageCount: 0 }),
}));
