# Overview

This is a WhatsApp-style customer support chat application with intelligent MCP (Model Context Protocol) agent integration. Built with React (frontend) and Express.js (backend), the application provides real-time messaging functionality between users and an AI-powered customer service agent. It features a modern UI with WhatsApp-inspired design elements, conversation management, real-time WebSocket communication, and MCP agent integration for intelligent responses.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using **React with TypeScript** and follows a component-based architecture:

- **UI Framework**: Uses shadcn/ui components built on top of Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for WhatsApp-inspired theming (greens, message bubbles, etc.)
- **State Management**: React Query for server state management and WebSocket integration for real-time updates
- **Routing**: Uses Wouter for lightweight client-side routing
- **Build System**: Vite for fast development and optimized production builds

The component structure follows a clear separation between UI components (`/components/ui/`), chat-specific components (`/components/`), and page-level components (`/pages/`).

## Backend Architecture

The backend uses **Express.js with TypeScript** in an ESM module setup:

- **API Structure**: RESTful endpoints for conversation and message management
- **Real-time Communication**: WebSocket server for instant messaging and typing indicators  
- **MCP Agent Integration**: Intelligent agent using Model Context Protocol for automated responses
- **Database Layer**: Drizzle ORM with PostgreSQL for data persistence
- **Session Management**: In-memory storage implementation with interface for easy database migration
- **Development Setup**: Custom Vite integration for seamless full-stack development

### MCP Agent Features
- **Intelligent Responses**: Uses MCP protocol to call Filazero service for smart replies
- **Local Fallback**: Built-in intent detection and response generation when MCP service is unavailable
- **Context Awareness**: Maintains conversation history and user context for better responses
- **Real-time Processing**: Integrates with WebSocket for immediate response delivery

## Data Storage Solutions

**Database Schema** (using Drizzle ORM):
- `conversations`: Manages chat sessions with user, agent assignment, status, and queue position
- `messages`: Stores all messages with sender information, content, and read status
- `agents`: Tracks customer service agents and their availability status

**Storage Pattern**: Repository pattern with `IStorage` interface allows switching between in-memory storage (development) and database storage (production) without code changes.

## Authentication and Authorization

Currently implements **basic session-based authentication** without user accounts:
- Generates random user IDs for anonymous users
- Agent identification through simple ID-based system
- No complex role-based permissions (designed for customer support use case)

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless deployments
- **drizzle-orm & drizzle-kit**: Type-safe database ORM with schema migrations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React

### UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant handling for component styling
- **lucide-react**: Modern icon library

### Real-time Communication
- **ws**: WebSocket implementation for real-time messaging
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and developer experience
- **@replit/vite-plugin-***: Replit-specific development plugins

The application is designed to be easily deployable on Replit with built-in support for PostgreSQL databases and includes development-specific tooling for the Replit environment.

## Deployment Configuration

The project is configured for production deployment with:

### Production Scripts
- `npm run build`: Creates optimized production builds for both frontend (Vite) and backend (esbuild)
- `npm start`: Runs the production server from built files
- `./start.sh`: Alternative production script that handles build + start with error handling
- Frontend builds to `dist/public/` with static asset optimization
- Backend builds to `dist/index.js` as a bundled Node.js module

### Environment Handling
- Development: Uses Vite dev server with HMR and real-time compilation
- Production: Serves pre-built static files with Express.js
- Server automatically detects environment via `NODE_ENV` variable
- Port configuration via `PORT` environment variable (defaults to 5000)

### Deployment Ready Features
- Static file serving optimized for production
- WebSocket support in both dev and production modes
- Environment variable configuration for external services
- Built-in error handling and logging for production monitoring

### Recent Deployment Fixes (August 10, 2025)
- ✅ Fixed build configuration for production deployment
- ✅ Updated production scripts to use correct NODE_ENV
- ✅ Verified build process creates optimized assets (21.5kb backend, 283kb frontend)
- ✅ Created alternative start.sh script for deployment
- ✅ Created comprehensive DEPLOYMENT_FIX.md with manual steps
- ⚠️ **MANUAL FIX REQUIRED**: Update .replit file to change deployment run command from "npm run dev" to "npm start" and add build command "npm run build"

### Deployment Issue Resolution
The deployment error "Security block: Run command contains 'dev' which is not allowed for production deployments" occurs because the .replit file still references development commands. All production scripts are correctly configured in package.json, but the deployment configuration needs manual updating through the Replit interface (see DEPLOYMENT_FIX.md for detailed instructions).