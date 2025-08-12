# AI PowerPoint Generator

AI-powered PowerPoint presentation generator that creates professional presentations from simple outlines.

## Features

- 🤖 AI-powered content generation
- 🎨 Multiple professional themes
- 📊 Automatic slide creation
- 👥 User account management
- 📱 Responsive web interface
- 🔒 Secure authentication

## Project Structure

```
ai-powerpoint-generator/
├── packages/
│   ├── shared/          # Shared types and utilities
│   ├── backend/         # Express.js API server
│   └── frontend/        # React web application
├── .github/             # GitHub Actions workflows
└── docs/                # Documentation
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 13
- Redis >= 6

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-powerpoint-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   # Edit the .env file with your configuration
   ```

4. **Build shared package**
   ```bash
   npm run build --workspace=@ai-ppt/shared
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all packages for production
- `npm run test` - Run tests for all packages
- `npm run lint` - Run ESLint on all packages
- `npm run format` - Format code with Prettier

## Technology Stack

### Frontend
- React 18 + TypeScript
- Ant Design UI components
- Redux Toolkit for state management
- Vite for build tooling

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL with pg driver
- Redis for caching
- JWT authentication

### AI Integration
- OpenAI GPT-4 API
- Custom prompt engineering

### PPT Generation
- PptxGenJS library
- Custom template system

## Development Workflow

1. Create feature branch from `develop`
2. Make changes and add tests
3. Run `npm run lint` and `npm run format`
4. Create pull request to `develop`
5. After review, merge to `develop`
6. Deploy to staging for testing
7. Merge to `main` for production deployment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.