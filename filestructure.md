TAJ_AI/
 ├── public/
 │   ├── TAJ-AI.svg
 │   ├── robots.txt
 │   └── sitemap.xml
 │
 ├── src/
 │   ├── app/
 │   │   ├── [mode]/
 │   │   │   └── page.tsx
 │   │   ├── chat/
 │   │   │   └── [id]/
 │   │   │       └── page.tsx
 │   │   ├── globals.css
 │   │   ├── layout.tsx
 │   │   └── page.tsx
 │   │
 │   ├── components/
 │   │   ├── AttachmentPreview.tsx
 │   │   ├── AuthModal.tsx
 │   │   ├── ChatInterface.tsx
 │   │   ├── ChatItem.tsx
 │   │   ├── ChatList.tsx
 │   │   ├── ClientLayout.tsx
 │   │   ├── GoogleIcon.tsx
 │   │   ├── LoginTab.tsx
 │   │   ├── MessageBubble.tsx
 │   │   ├── ModelSelector.tsx
 │   │   ├── SettingsModal.tsx
 │   │   ├── Sidebar.tsx
 │   │   ├── SidebarFooter.tsx
 │   │   ├── SidebarHeader.tsx
 │   │   ├── SidebarSections.tsx
 │   │   ├── SignUpTab.tsx
 │   │   ├── ThemeToggle.tsx
 │   │   ├── UserProfile.tsx
 │   │   ├── theme-provider.tsx
 │   │   └── withAuth.tsx
 │   │
 │   ├── hooks/
 │   │   ├── useAuth.tsx
 │   │   └── useChatStore.tsx
 │   │
 │   └── lib/
 │       ├── aiRouter.ts
 │       ├── api.ts
 │       └── utils.ts
 │
 ├── .eslintrc.json
 ├── .gitignore
 ├── README.md
 ├── next-env.d.ts
 ├── next.config.mjs
 ├── package-lock.json
 ├── package.json
 ├── postcss.config.mjs
 ├── tailwind.config.ts
 └── tsconfig.json

Descriptions
 - src/app/layout.tsx: root HTML and providers; wraps pages with ThemeProvider and ClientLayout
 - src/app/page.tsx: home page; renders ChatInterface
 - src/app/[mode]/page.tsx: renders ModelSelector and ChatInterface based on mode
 - src/app/chat/[id]/page.tsx: dynamic chat route scoped by chat id
 - src/components/ClientLayout.tsx: app shell; header, sidebar, and auth modal integration
 - src/components/Sidebar*.tsx: sidebar header/sections/footer with collapse, search, new chat
 - src/components/ChatInterface.tsx: message list, input bar, tools menu, attachments, mock AI flow
 - src/components/MessageBubble.tsx: markdown rendering, code highlight, actions
 - src/components/SettingsModal.tsx: tabbed settings with localStorage persistence
 - src/hooks/useChatStore.tsx: local state store for chats and settings; persistence helpers
 - src/hooks/useAuth.tsx: simple auth context using localStorage token
 - src/lib/*: utilities and routing helpers
