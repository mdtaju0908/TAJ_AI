"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Settings, HelpCircle, UserCircle, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';

interface UserProfileProps {
  collapsed?: boolean;
}

export function UserProfile({ collapsed }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const setSettingsOpen = useUIStore((state) => state.setSettingsOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(prev => !prev)} 
        className="w-9 h-9 rounded-full bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] flex items-center justify-center text-white overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all"
        title={user.name}
      >
        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <User className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/10 bg-white/5">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            
            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSettingsOpen(true);
                  // TODO: Navigate to Account tab if possible
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
              >
                <UserCircle className="w-4 h-4 text-blue-400" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSettingsOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-blue-400" />
                <span>Settings</span>
              </button>
              <div className="my-1 h-[1px] bg-white/10" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
