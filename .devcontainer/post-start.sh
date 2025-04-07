#!/bin/bash

# Print welcome message
echo "🚀 Welcome to OpenAI Chat App Development Environment!"
echo "==============================================="

# Check if .env exists, if not create a template
if [ ! -f "/workspace/.env" ]; then
  echo "Creating .env template file..."
  echo "# API Configuration" > /workspace/.env
  echo "PORT=3000" >> /workspace/.env
  echo "OPENAI_API_KEY=" >> /workspace/.env
  echo "AZURE_OPENAI_ENDPOINT=" >> /workspace/.env
  echo "AZURE_OPENAI_KEY=" >> /workspace/.env
  echo "AZURE_OPENAI_DEPLOYMENT=" >> /workspace/.env
  echo "# Development Settings" >> /workspace/.env
  echo "NODE_ENV=development" >> /workspace/.env
  echo ".env template created. Please fill in your API keys."
fi

# Setup git hooks if git directory exists
if [ -d "/workspace/.git" ]; then
  echo "Setting up git hooks..."
  # Add any git hook setup here
fi

# Print helpful information
echo ""
echo "📋 Development Commands:"
echo "- npm run dev: Start both client and server in development mode"
echo "- npm run server:dev: Start just the server with nodemon"
echo "- npm run client:dev: Start just the client with Vite"
echo ""
echo "📁 Project Structure:"
echo "- /client: React frontend with Fluent UI"
echo "- /server: Express.js backend"
echo "- /docs: Documentation"
echo ""
echo "🔧 Environment setup complete! Happy coding! 🎉"