# EveryHour

**Live Demo:** [https://track-every-hour.vercel.app](https://track-every-hour.vercel.app/)

A mobile-first time tracking app that lets you log and visualize every hour of your day with color-coded categories and an intuitive spreadsheet-like interface.

## Features

- **24-Hour Grid View** - Track all 24 hours in a clean, visual layout
- **Color-Coded Categories** - 18+ predefined categories with customizable colors
- **Multiple Views** - Switch between Day, Week, and Month views
- **Quick Actions** - One-tap buttons for rapid logging of frequent activities
- **Keyboard Shortcuts** - Fast entry with single-letter shortcuts (S for Sleep, W for Work, etc.)
- **Data Export** - Export to CSV, JSON, or Excel formats
- **Real-time Sync** - Cloud sync with Supabase for multi-device access
- **Offline Support** - Local storage persistence when offline
- **Dark Mode** - Automatic dark/light theme switching

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand with localStorage persistence
- **Database:** Supabase (PostgreSQL)
- **Date Handling:** date-fns
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

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

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:

   Run the SQL migrations in your Supabase SQL Editor:
   - First run `supabase/migrations/001_initial_schema.sql`
   - Then run `supabase/migrations/002_custom_auth.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started

1. **Sign Up/Sign In** with a username and password
2. **Click on any hour** to open the input modal
3. **Select a category** from the grid or use keyboard shortcuts
4. **Add notes** (optional) and save

### Quick Actions

Use the bottom bar for one-tap logging of frequent categories. This automatically fills the first empty hour of the day.

### Keyboard Shortcuts

| Key | Category |
|-----|----------|
| S | Sleep |
| W | Work |
| D | Dev Work |
| R | Research/Intern |
| L | Classes |
| M | MIT Work |
| F | Friends |
| P | Partner |
| Y | Family |
| G | Gym |
| C | Christian |
| H | Medical |
| B | Hobbies |
| N | Events/Networking |
| T | Commute |
| E | Food |
| A | Admin/Life |
| Z | Scrolling |

### Navigation

- Use the **arrow buttons** in the header to move between days
- Click **Today** to jump to the current date
- Current hour is highlighted with a blue background

### Exporting Data

1. Click the **Export** button in the header (when logged in)
2. Choose your format: CSV, JSON, or Excel
3. Data includes: date, hour, category, color, productivity flag, notes, and timestamps

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── SpreadsheetView.tsx    # Main grid UI
│   ├── AuthModal.tsx          # Login/signup modal
│   ├── AuthProvider.tsx       # Auth context
│   ├── ExportModal.tsx        # Export interface
│   ├── HelpModal.tsx          # Help documentation
│   ├── layout/                # Header, action bar
│   ├── input/                 # Input modal
│   └── timeline/              # Hour blocks
├── stores/
│   └── useAppStore.ts     # Zustand state management
├── hooks/
│   └── useSupabaseSync.ts # Database sync logic
├── lib/
│   ├── supabase/          # Supabase client
│   ├── date.ts            # Date utilities
│   ├── parser.ts          # Input parsing
│   └── export.ts          # Export functions
└── types/
    └── index.ts           # TypeScript types
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Database Schema

### Tables

- **users** - User accounts with username/password authentication
- **categories** - Activity categories with colors, shortcuts, and settings
- **time_entries** - Hourly log entries linked to users and categories

### Key Fields

**categories:**
- name, shorthand (single letter), numeric_id
- color, is_productive, is_quick_action, sort_order

**time_entries:**
- date, hour (0-23), notes, custom_label
- Links to user and category

## Deployment

The app is configured for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## License

MIT
