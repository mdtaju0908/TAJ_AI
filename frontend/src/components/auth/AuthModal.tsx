"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "../ui/Dialog";
import { AuthTabs } from "./AuthTabs";
import { useUIStore } from "../../stores/uiStore";
import { Button } from "../ui/Button";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setShowAuthModal } = useUIStore();

  const handleContinueAsGuest = () => {
    setShowAuthModal(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v: boolean) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-[420px] p-0 bg-[#020617] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl relative">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-8 space-y-8">
          <DialogHeader className="space-y-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center p-2">
              <img src="/TAJ-AI.svg" alt="TAJ AI" className="w-full h-full" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">Welcome to TAJ AI</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                Unlock smarter conversations with Gemini 2026.
              </DialogDescription>
            </div>
          </DialogHeader>

          <AuthTabs onSuccess={onClose} />

          <div className="pt-2">
            <Button
              variant="ghost"
              onClick={handleContinueAsGuest}
              className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Continue as guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
