# Voxta AI Assistant Frontend

A modern web application for managing your calendar, emails, and tasks with AI assistance.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
```bash
cd packages/frontend
npm install
```

3. Set up Clerk Authentication:
   - Go to [clerk.com](https://clerk.com) and create an account
   - Create a new application
   - Copy your Publishable Key from the Clerk Dashboard
   - Create a `.env` file in the `packages/frontend` directory with the following content:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
```bash
npm run dev
```

## Features

- 🔐 Secure authentication with Clerk
- 🌓 Dark mode support
- 📅 Calendar integration
- 📧 Email management
- 🤖 AI-powered assistance
- 💬 Voice input support

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key (required for authentication) |
| `VITE_API_URL` | Backend API URL (defaults to http://localhost:3000) |

## Development Mode

When `VITE_CLERK_PUBLISHABLE_KEY` is not set, the application runs in development mode with the following features:
- Authentication is bypassed
- A default development user is shown
- All protected routes are accessible

To enable proper authentication:
1. Set up your Clerk account
2. Add your publishable key to the `.env` file
3. Restart the development server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 