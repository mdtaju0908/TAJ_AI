"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Settings, Bell, Shield, Database, User, Monitor, LogOut, Trash2, Download } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useUIStore } from "../../stores/uiStore";
import { useTheme } from "next-themes";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import toast from "react-hot-toast";

type TabKey = "general" | "notifications" | "security" | "data" | "account";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "general", label: "General", icon: <Monitor className="w-4 h-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { key: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  { key: "data", label: "Data Control", icon: <Database className="w-4 h-4" /> },
  { key: "account", label: "Account", icon: <User className="w-4 h-4" /> },
];

export function SettingsModal() {
  const { clearHistory, exportChats } = useChatStore();
  const { isSettingsOpen, setSettingsOpen } = useUIStore();
  const settings = useSettingsStore();
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Sync theme with settings store
  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSettingsOpen, setSettingsOpen]);

  const mobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 768, []);

  const handleLogout = () => {
    logout();
    setSettingsOpen(false);
  };

  const handleDeleteAllData = () => {
    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      clearHistory();
      settings.resetSettings();
      toast.success("All data cleared");
    }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#12151c]/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Settings className="w-5 h-5" />
                Settings
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="md:w-56 border-r border-white/10 p-3 shrink-0 overflow-y-auto">
                {mobile ? (
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as TabKey)}
                    className="w-full bg-white/10 text-white rounded-lg p-2"
                  >
                    {tabs.map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex flex-col gap-1">
                    {tabs.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === t.key ? "bg-white/15 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="space-y-4"
                  >
                    {activeTab === "general" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-sm text-gray-300 mb-2">Theme</div>
                            <div className="flex items-center gap-2">
                              {["dark","light","system"].map(t => (
                                <button
                                  key={t}
                                  onClick={() => settings.updateSetting("theme", t)}
                                  className={`px-3 py-2 rounded-lg text-sm ${settings.theme === t ? "bg-white/15 text-white" : "text-gray-300 hover:bg-white/10"}`}
                                >
                                  {t[0].toUpperCase() + t.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-sm text-gray-300 mb-2">Language</div>
                            <select
                              value={settings.language}
                              onChange={(e) => settings.updateSetting("language", e.target.value)}
                              className="w-full bg-white/10 text-white rounded-lg p-2 border-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="en">English</option>
                              <option value="es">Español</option>
                              <option value="fr">Français</option>
                              <option value="de">Deutsch</option>
                              <option value="hi">हिन्दी</option>
                            </select>
                          </div>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-sm text-gray-300 mb-2">Chat font size</div>
                            <div className="flex items-center gap-2">
                              {["sm","md","lg"].map(s => (
                                <button
                                  key={s}
                                  onClick={() => settings.updateSetting("fontSize", s)}
                                  className={`px-3 py-2 rounded-lg text-sm ${settings.fontSize === s ? "bg-white/15 text-white" : "text-gray-300 hover:bg-white/10"}`}
                                >
                                  {s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-300">Typing animation</div>
                              <input 
                                type="checkbox" 
                                checked={settings.typingAnimation} 
                                onChange={(e) => settings.updateSetting("typingAnimation", e.target.checked)}
                                className="toggle-checkbox"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-300">Auto scroll</div>
                              <input 
                                type="checkbox" 
                                checked={settings.autoScroll} 
                                onChange={(e) => settings.updateSetting("autoScroll", e.target.checked)} 
                                className="toggle-checkbox"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "notifications" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300">Sound on AI response</div>
                            <input 
                              type="checkbox" 
                              checked={settings.soundNotification} 
                              onChange={(e) => settings.updateSetting("soundNotification", e.target.checked)} 
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300">Desktop notifications</div>
                            <input 
                              type="checkbox" 
                              checked={settings.desktopNotifications} 
                              onChange={(e) => settings.updateSetting("desktopNotifications", e.target.checked)} 
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300">Email updates</div>
                            <input 
                              type="checkbox" 
                              checked={settings.emailUpdates} 
                              onChange={(e) => settings.updateSetting("emailUpdates", e.target.checked)} 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "security" && (
                      <div className="space-y-4">
                         <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-white font-medium mb-4">Password & Security</h3>
                            <Button variant="outline" className="w-full justify-start mb-2">Change Password</Button>
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-sm text-gray-300">Two-factor authentication</div>
                              <input 
                                type="checkbox" 
                                checked={settings.twoFactorEnabled} 
                                onChange={(e) => settings.updateSetting("twoFactorEnabled", e.target.checked)} 
                              />
                            </div>
                         </div>
                      </div>
                    )}

                    {activeTab === "data" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300">Save chat history</div>
                            <input 
                              type="checkbox" 
                              checked={settings.saveHistory} 
                              onChange={(e) => settings.updateSetting("saveHistory", e.target.checked)} 
                            />
                          </div>
                          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                             <Button variant="outline" onClick={() => exportChats('json')} className="justify-start gap-2">
                               <Download className="w-4 h-4" /> Export Chats (JSON)
                             </Button>
                             <Button variant="outline" onClick={() => exportChats('txt')} className="justify-start gap-2">
                               <Download className="w-4 h-4" /> Export Chats (TXT)
                             </Button>
                             <Button variant="destructive" onClick={clearHistory} className="justify-start gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20">
                               <Trash2 className="w-4 h-4" /> Clear Chat History
                             </Button>
                             <Button variant="destructive" onClick={handleDeleteAllData} className="justify-start gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20">
                               <Trash2 className="w-4 h-4" /> Delete All Data
                             </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "account" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                                {user?.name?.[0] || "G"}
                              </div>
                              <div>
                                <div className="text-white font-medium text-lg">{user?.name || "Guest User"}</div>
                                <div className="text-gray-400 text-sm">{user?.email || "Not logged in"}</div>
                              </div>
                           </div>
                           <Button variant="destructive" onClick={handleLogout} className="w-full justify-start gap-2">
                             <LogOut className="w-4 h-4" /> Log out
                           </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
