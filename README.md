# EveryHour - Time Tracking App

A mobile-first time tracking application built with Next.js, TypeScript, and Supabase. Track your time with an intuitive spreadsheet-like interface featuring color-coded categories and flexible cell editing.

## Features

- **Spreadsheet-like Interface**: Click cells to log time or select categories for paint-bucket style editing
- **Color-coded Categories**: Visual time tracking with customizable categories
- **Quick Actions Bar**: Rapid logging with category shortcuts
- **Flexible Editing**: No forced chronological order - edit any cell anytime
- **Multiple Views**: Day, Week, and Month views for different planning needs
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface
- **Real-time Sync**: Supabase backend for data persistence and real-time updates
- **Dark Mode Support**: Automatic dark/light theme switching

## How to Use EveryHour

### Quick Start
1. **Sign In** with your email
2. **Click category buttons** in the top bar to select them
3. **Click empty cells** in the spreadsheet to log time
4. **Export your data** anytime using the Export button

### Tips
- Current hour is highlighted in yellow
- Use arrow buttons or calendar to navigate dates
- Mobile-friendly with touch gestures

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Deployment**: Vercel

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd track-every-hour
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Database Setup

The app uses Supabase. Run the migrations in `supabase/migrations/` to set up the database schema.

## Deployment

Deploy to Vercel with the following build settings:
- **Framework Preset**: Next.js
- **Root Directory**: (leave empty)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

Add your Supabase environment variables in the Vercel dashboard.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
