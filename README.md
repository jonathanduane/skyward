# Skyward Digital Lead Management Dashboard

A professional lead management dashboard displaying Facebook advertising leads for Australian businesses. Built with React, Express.js, and TypeScript.

## Features

- **Dashboard Analytics**: Summary cards showing total leads, ad spend, reach, and high-priority leads
- **Lead Management**: Sortable table with filtering by state, search term, and text search
- **Australian Focus**: State-wise lead distribution visualization
- **Export Functionality**: CSV export for all leads or selected leads
- **Real-time Updates**: Hot reload development environment
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **TanStack Query** for server state management
- **Wouter** for routing
- **Tailwind CSS** for styling
- **shadcn/ui** components built on Radix UI

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **In-memory storage** for development
- **PostgreSQL** support for production

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd skyward-digital-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open http://localhost:5000 in your browser

## Project Structure

```
├── api/                    # Vercel serverless functions
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities and config
├── server/                 # Express backend
├── shared/                 # Shared types and schemas
└── attached_assets/        # Lead data and images
```

## Data Overview

The dashboard displays 123 Facebook advertising leads with:
- **Total Ad Spend**: $31,920
- **Total Reach**: 2.1M impressions
- **Geographic Coverage**: Australian states
- **Lead Information**: Contact details, websites, ad performance

## Deployment

### Development
Runs on port 5000 with hot reload for both frontend and backend.

### Production
- Frontend builds to `dist/public`
- Backend compiles to `dist/index.js`
- Supports deployment on Vercel with serverless functions

## Environment Variables

For production deployment:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to 'production'

## Color Scheme

- **Primary**: Salmon (#E55A4C)
- **Secondary**: Black (#000000)
- **Background**: Light gray (#F5F5F5)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary to Skyward Digital.