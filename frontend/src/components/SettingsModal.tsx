"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Settings, Bell, Shield, Database, User, Monitor } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";

type TabKey = "general" | "notifications" | "security" | "data" | "account";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "general", label: "General", icon: <Monitor className="w-4 h-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { key: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  { key: "data", label: "Data Control", icon: <Database className="w-4 h-4" /> },
  { key: "account", label: "Account", icon: <User className="w-4 h-4" /> },
];

export function SettingsModal() {
  const { settings, updateSetting, isSettingsOpen, closeSettings, clearChatHistory, exportChats, deleteAllData } = useChatStore() as any;
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  useEffect(() => {
    if (!isSettingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSettingsOpen, closeSettings]);

  const mobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 768, []);

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
            className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#12151c]/90 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Settings className="w-5 h-5" />
                Settings
              </div>
              <button
                onClick={closeSettings}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="md:w-56 border-r border-white/10 p-3">
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

              <div className="flex-1 p-4 md:p-6">
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
                                  onClick={() => { updateSetting("theme", t); setTheme(t as any); }}
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
                              onChange={(e) => updateSetting("language", e.target.value)}
                              className="w-full bg-white/10 text-white rounded-lg p-2"
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
                                  onClick={() => updateSetting("fontSize", s)}
                                  className={`px-3 py-2 rounded-lg text-sm ${settings.fontSize === s ? "bg-white/15 text-white" : "text-gray-300 hover:bg-white/10"}`}
                                >
                                  {s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-300">Typing animation</div>
                              <input type="checkbox" checked={settings.typingAnimation} onChange={(e) => updateSetting("typingAnimation", e.target.checked)} />
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="text-sm text-gray-300">Auto scroll</div>
                              <input type="checkbox" checked={settings.autoScroll} onChange={(e) => updateSetting("autoScroll", e.target.checked)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "notifications" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300">Sound on AI response</div>
                            <input type="checkbox" checked={settings.soundNotification} onChange={(e) => updateSetting("soundNotification", e.target.checked)} />
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-sm text-gray-300">Desktop notifications</div>
                            <input type="checkbox" checked={settings.desktopNotifications} onChange={(e) => updateSetting("desktopNotifications", e.target.checked)} />
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-sm text-gray-300">Email updates</div>
                            <input type="checkbox" checked={settings.emailUpdates} onChange={(e) => updateSetting("emailUpdates", e.target.checked)} />
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                if ("Notification" in window) {
                                  if (Notification.permission === "granted") {
                                    new Notification("TAJ AI", { body: "This is a preview notification." });
                                  } else {
                                    Notification.requestPermission();
                                  }
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15"
                            >
                              Preview notification
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "security" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-sm text-gray-300 mb-2">Change password</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input className="bg-white/10 text-white rounded-lg p-2" placeholder="Current password" type="password" />
                            <input className="bg-white/10 text-white rounded-lg p-2" placeholder="New password" type="password" />
                            <button className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">Update</button>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300">Two-factor authentication</div>
                            <input type="checkbox" checked={settings.twoFactorEnabled} onChange={(e) => updateSetting("twoFactorEnabled", e.target.checked)} />
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-sm text-gray-300 mb-2">Login activity</div>
                          <div className="text-xs text-gray-400">Recent logins are shown here.</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div className="text-sm text-gray-300">Logout from all devices</div>
                          <button onClick={logout} className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">Logout</button>
                        </div>
                      </div>
                    )}

                    {activeTab === "data" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div className="text-sm text-gray-300">Save chat history</div>
                          <input type="checkbox" checked={settings.saveHistory} onChange={(e) => updateSetting("saveHistory", e.target.checked)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button onClick={clearChatHistory} className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">Clear chat history</button>
                          <button onClick={() => exportChats("json")} className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">Export JSON</button>
                          <button onClick={() => exportChats("txt")} className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">Export TXT</button>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-sm text-gray-300 mb-2">Data usage</div>
                          <div className="text-xs text-gray-400">TAJ AI stores your chats locally. You can delete them anytime.</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div className="text-sm text-red-400">Delete all data</div>
                          <button onClick={deleteAllData} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30">Delete</button>
                        </div>
                      </div>
                    )}

                    {activeTab === "account" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-sm text-gray-300 mb-2">Profile</div>
                          <div className="text-sm text-gray-200">{user?.name}</div>
                          <div className="text-xs text-gray-400">{user?.email}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">Change picture</button>
                          <button className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">Manage Google</button>
                          <button className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">View Subscription</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button onClick={logout} className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15">Logout</button>
                          <button className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30">Delete account</button>
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
