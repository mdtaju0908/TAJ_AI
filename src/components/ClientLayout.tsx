"use client";

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300 bg-[linear-gradient(135deg,#0f172a,#020617)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full relative w-full md:pl-[280px]">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-24 w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-3xl animate-pulse" />
        </div>
        <header className="fixed top-0 left-0 right-0 md:left-[280px] h-[70px] z-40 flex items-center justify-between px-4 md:px-6 rounded-none md:rounded-2xl md:m-4 md:mr-6 border-b md:border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.4)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-200"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center rounded-xl p-2 border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 hover:scale-105">
                <img src="/logo.png" alt="TAJ AI" className="h-8 w-auto" />
              </div>
              <span className="font-semibold text-lg text-white">TAJ AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[20px] flex items-center justify-center text-white shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.4)]">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative pt-[86px] md:pt-[100px] px-3 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
