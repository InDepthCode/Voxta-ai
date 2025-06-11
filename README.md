# Voxta - AI-Powered Personal Assistant

Voxta is a modern web application that serves as your personal AI assistant, helping you manage your calendar, emails, and reminders efficiently. It features voice input capabilities and integrates with Google services.

## Features

- 🎙️ Voice and text input interface
- 📅 Google Calendar integration
- 📧 Gmail integration
- ⏰ Reminder system
- 🎨 Modern, responsive UI
- 🤖 AI-powered conversations

## Tech Stack

- **Frontend:**
  - React with TypeScript
  - Vite for build tooling
  - TailwindCSS for styling
  - React Router for navigation

- **Backend:**
  - Node.js with Express
  - Passport.js for authentication
  - Google OAuth2 integration
  - OpenAI API integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Platform account with OAuth2 credentials
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/voxta.git
   cd voxta
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env` files in both frontend and backend packages:

   Backend (.env):
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   SESSION_SECRET=your_session_secret
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   ```

4. Start the development servers:
   ```bash
   # Start backend
   cd packages/backend
   npm run dev

   # Start frontend (in a new terminal)
   cd packages/frontend
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Project Structure

```
voxta/
├── packages/
│   ├── frontend/          # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── backend/           # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── config/
│       │   └── app.ts
│       └── package.json
│
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for the AI capabilities
- Google Cloud Platform for OAuth and API integrations
- The open-source community for the amazing tools and libraries 