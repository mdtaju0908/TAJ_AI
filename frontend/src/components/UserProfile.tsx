"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, HelpCircle, UserCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatStore } from '@/hooks/useChatStore';
import toast from 'react-hot-toast';

export function UserProfile() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openSettings } = useChatStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(prev => !prev)} className="w-9 h-9 rounded-full bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] flex items-center justify-center text-white">
        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a]/80 backdrop-blur-xl border border-[rgba(59,130,246,0.2)] rounded-lg shadow-lg p-2"
          >
            <div className="p-2 border-b border-[rgba(59,130,246,0.2)] mb-2">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                toast('Profile view coming soon');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-[rgba(59,130,246,0.1)] rounded-md"
            >
              <UserCircle className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                openSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-[rgba(59,130,246,0.1)] rounded-md"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                toast('Help is on the way');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-[rgba(59,130,246,0.1)] rounded-md"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
