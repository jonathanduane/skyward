# replit.md

## Overview
This is a full-stack leads management application built with React and Express.js. The application displays and manages marketing lead data for Australian businesses, focusing on Facebook advertising campaigns. It features a dashboard with statistics, filtering capabilities, and export functionality for lead data.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with Vite middleware integration

## Key Components

### Database Schema
- **Leads Table**: Stores marketing lead information including search terms, ad spend, reach metrics, contact details, and lead scoring
- **Users Table**: Basic user management (partially implemented)
- **Schema Location**: `shared/schema.ts` with Drizzle ORM definitions

### API Endpoints
- `GET /api/leads` - Fetch leads with optional filtering (search, state, search term)
- `GET /api/leads/stats` - Get aggregated lead statistics
- `GET /api/leads/states` - Get state-wise lead distribution
- `GET /api/leads/new` - Get recently added leads

### Frontend Pages
- **Dashboard**: Main view with summary cards, charts, and lead table
- **Not Found**: 404 error page

### UI Components
- **SummaryCards**: Display key metrics (total leads, spend, reach, priority leads)
- **TopStates**: Show lead distribution across Australian states
- **NewLeads**: Display recently added leads
- **LeadsTable**: Sortable, filterable table with export functionality

## Data Flow

1. **Data Source**: Lead data is loaded from JSON file (`attached_assets/leads4_1750103502675.json`)
2. **Storage Layer**: In-memory storage implementation (`MemStorage`) loads and manages lead data
3. **API Layer**: Express routes serve data through RESTful endpoints
4. **Frontend**: React components fetch data using TanStack Query and display in dashboard

## External Dependencies

### Key Libraries
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router
- **react-hook-form**: Form validation and handling

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and development experience
- **ESLint/Prettier**: Code formatting and linting

## Deployment Strategy

### Development
- Runs on port 5000 locally
- Uses Vite dev server with HMR
- In-memory storage for development data
- Hot reload for both frontend and backend

### Production
- Builds frontend assets to `dist/public`
- Compiles backend to `dist/index.js`
- Serves static files from Express
- Uses PostgreSQL database in production
- Deployed on Replit with autoscale configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)

## Changelog
- June 16, 2025. Initial setup
- June 16, 2025. Updated color scheme: changed dark purple to salmon color, light purple to black

## User Preferences
Preferred communication style: Simple, everyday language.
Color preferences: Salmon color instead of dark purple, black instead of light purple.