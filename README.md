# TAJ AI - Your Smart AI Assistant

TAJ AI is a full-stack AI assistant web application built with Next.js 14, Tailwind CSS, and OpenAI GPT-4o. It features a modern, clean UI similar to Gemini/ChatGPT, with real-time streaming responses, chat history, and dark mode.

## Features

- **Modern UI**: Clean, responsive interface with dark/light mode support.
- **AI Integration**: Powered by Google Gemini API (via Vercel AI SDK).
- **Streaming Responses**: Real-time text generation for a smooth user experience.
- **Chat History**: Automatically saves conversations to MongoDB.
- **Markdown Support**: Renders code blocks and formatted text beautifully.
- **Sidebar**: Easy navigation between different chat sessions.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB (via Mongoose)
- **AI**: OpenAI (GPT-4o / GPT-4.1 via Vercel AI SDK)

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    Copy `.env.example` to `.env.local` and fill in your values.
    ```bash
    cp .env.example .env.local
    ```
    You need:
    - `OPENAI_API_KEY`: Get it from OpenAI.
    - `MONGODB_URI`: Your MongoDB connection string.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open in browser**:
    Navigate to `http://localhost:3000`.

## License

MIT
