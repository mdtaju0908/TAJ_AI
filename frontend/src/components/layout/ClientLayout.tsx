"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AuthModal } from '../Auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '../Sidebar/UserProfile';
import { Toaster } from 'react-hot-toast';
import { SettingsModal } from '../Settings/SettingsModal';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';

function AppContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showAuthModal, setShowAuthModal } = useUIStore();
  // Using settings store to subscribe to changes if needed, but layout might not need it directly
  // except maybe for theme which is handled by next-themes provider in layout.tsx
  
  useEffect(() => {
    // Reset transient UI state
    setShowAuthModal(false);
    
    const checkWidth = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen text-gray-900 dark:text-gray-100 bg-[linear-gradient(135deg,#0f172a,#020617)] overflow-hidden">
      <Toaster position="top-center" />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isMobile={isMobile}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      
      <div className={cn(
        "flex-1 flex flex-col h-full relative w-full transition-all duration-300 ease-in-out",
        !isMobile && (collapsed ? "ml-[70px]" : "ml-[260px]")
      )}>
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-24 w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-3xl animate-pulse" />
        </div>
        <header className={cn(
          "fixed top-0 right-0 z-30 px-4 md:px-6 transition-all duration-300 ease-in-out",
          isMobile ? "left-0 w-full" : (collapsed ? "left-[70px] w-[calc(100%-70px)]" : "left-[260px] w-[calc(100%-260px)]")
        )}>
          <div className="max-w-[850px] mx-auto h-[70px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] text-gray-200"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="flex items-center gap-3 md:hidden">
                <img src="/TAJ-AI.svg" alt="TAJ AI" className="h-9 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <UserProfile collapsed={false} />
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)} 
                  className="px-4 py-2 rounded-full bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] text-white font-semibold hover:bg-[rgba(59,130,246,0.2)] transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative pt-[70px] md:pt-[80px]">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SettingsModal />
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AppContent>{children}</AppContent>;
}
