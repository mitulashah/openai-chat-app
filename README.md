# AI Chat Application

A modern chat application built with React and Node.js that integrates with Azure OpenAI for intelligent conversations. The application features a beautiful Dracula-inspired theme and supports image attachments in conversations.

## Features

- Real-time chat interface with Azure OpenAI integration
- Image attachment support (up to 5MB per image)
- Dracula-inspired light and dark themes
- Admin panel for Azure OpenAI configuration
- Responsive design using Microsoft's Fluent UI 2
- Automatic cleanup of uploaded files after 24 hours

## Tech Stack

- Frontend:
  - React
  - Microsoft Fluent UI 2
  - Vite (Build tool)
- Backend:
  - Node.js
  - Express
  - Multer (File uploads)
  - Azure OpenAI SDK

## Prerequisites

- Node.js (v14 or higher)
- Azure OpenAI API access
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd openai-chat-app
```

2. Install dependencies:
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. Start the development servers:
```bash
# Start the backend server (from root directory)
npm start

# Start the frontend development server (from client directory)
cd client
npm run dev
```

4. Configure Azure OpenAI:
   - Open the application in your browser
   - Click the Menu button and select Settings
   - Enter your Azure OpenAI configuration details
   - Save the configuration

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
PORT=3001
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 