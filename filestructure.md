### TAJ_AI File Structures

```
TAJ_AI/
 ├── .github/
 │   ├── ISSUE_TEMPLATE/
 │   │   └── custom.md
 │   ├── FUNDING.yml
 │   └── (github config files)
 │
 ├── frontend/
 │   ├── public/
 │   │   ├── TAJ-AI.svg
 │   │   ├── robots.txt
 │   │   └── sitemap.xml
 │   │
 │   ├── src/
 │   │   ├── app/
 │   │   │   ├── [mode]/
 │   │   │   │   └── page.tsx
 │   │   │   ├── chat/
 │   │   │   │   └── [id]/
 │   │   │   │       └── page.tsx
 │   │   │   ├── globals.css
 │   │   │   ├── layout.tsx
 │   │   │   └── page.tsx
 │   │   │
 │   │   ├── components/
 │   │   │   ├── Settings/
 │   │   │   │   ├── SettingsModal.tsx
 │   │   │   │   └── ThemeToggle.tsx
 │   │   │   ├── Sidebar/
 │   │   │   │   ├── Sidebar.tsx
 │   │   │   │   ├── SidebarFooter.tsx
 │   │   │   │   ├── SidebarHeader.tsx
 │   │   │   │   ├── SidebarSections.tsx
 │   │   │   │   └── UserProfile.tsx
 │   │   │   ├── Tools/
 │   │   │   │   ├── ToolMenu.tsx
 │   │   │   │   └── tools.ts
 │   │   │   ├── auth/
 │   │   │   │   ├── AuthError.tsx
 │   │   │   │   ├── AuthModal.tsx
 │   │   │   │   ├── AuthTabs.tsx
 │   │   │   │   ├── EmailOTPForm.tsx
 │   │   │   │   ├── GoogleButton.tsx
 │   │   │   │   ├── GoogleIcon.tsx
 │   │   │   │   ├── LoginTab.tsx
 │   │   │   │   ├── SignUpTab.tsx
 │   │   │   │   └── withAuth.tsx
 │   │   │   ├── chat/
 │   │   │   │   ├── AttachmentPreview.tsx
 │   │   │   │   ├── ChatInterface.tsx
 │   │   │   │   ├── ChatItem.tsx
 │   │   │   │   ├── ChatList.tsx
 │   │   │   │   ├── FileUploader.tsx
 │   │   │   │   ├── ImagePreview.tsx
 │   │   │   │   ├── MessageBubble.tsx
 │   │   │   │   ├── ModelSelector.tsx
 │   │   │   │   ├── SuggestionChips.tsx
 │   │   │   │   └── ThinkingIndicator.tsx
 │   │   │   ├── layout/
 │   │   │   │   └── ClientLayout.tsx
 │   │   │   ├── ui/
 │   │   │   │   ├── Avatar.tsx
 │   │   │   │   ├── Badge.tsx
 │   │   │   │   ├── Button.tsx
 │   │   │   │   ├── Card.tsx
 │   │   │   │   ├── Dialog.tsx
 │   │   │   │   ├── Input.tsx
 │   │   │   │   ├── Label.tsx
 │   │   │   │   ├── Separator.tsx
 │   │   │   │   ├── Tabs.tsx
 │   │   │   │   ├── Toast.tsx
 │   │   │   │   └── input-otp.tsx
 │   │   │   ├── MessageBubble.tsx
 │   │   │   └── theme-provider.tsx
 │   │   │
 │   │   ├── constants/
 │   │   │   └── index.ts
 │   │   ├── hooks/
 │   │   │   ├── useAuth.tsx
 │   │   │   ├── useChat.ts
 │   │   │   └── useOTP.ts
 │   │   ├── lib/
 │   │   │   ├── aiRouter.ts
 │   │   │   ├── api.ts
 │   │   │   ├── markdown.tsx
 │   │   │   ├── streaming.ts
 │   │   │   └── utils.ts
 │   │   ├── services/
 │   │   │   ├── authService.ts
 │   │   │   └── chat.ts
 │   │   ├── stores/
 │   │   │   ├── authStore.ts
 │   │   │   ├── chatStore.ts
 │   │   │   ├── settingsStore.ts
 │   │   │   └── uiStore.ts
 │   │   └── types/
 │   │       ├── chat.ts
 │   │       ├── index.ts
 │   │       └── message.ts
 │   │
 │   ├── .eslintrc.json
 │   ├── .gitignore
 │   ├── components.json
 │   ├── next-env.d.ts
 │   ├── next.config.mjs
 │   ├── package-lock.json
 │   ├── package.json
 │   ├── postcss.config.mjs
 │   ├── tailwind.config.ts
 │   └── tsconfig.json
 │
 ├── CODE_OF_CONDUCT.md
 ├── CONTRIBUTING.md
 ├── LICENSE
 ├── README.md
 ├── SECURITY.md
 └── filestructure.md
```
