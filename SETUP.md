# Development Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Supabase (backend and database)
   # Create a project at https://supabase.com and copy these from Project Settings > API
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

## Troubleshooting White Screen Issues

If you encounter a white screen, check the following:

### 1. Environment Variables
- Ensure `.env` file exists with proper Supabase credentials
- The app will show warnings but should still work without Supabase

### 2. Console Errors
- Open browser dev tools (F12)
- Check Console tab for any error messages
- Network tab for failed requests

### 3. Common Issues
- **Missing Supabase config**: App will show warnings but should still render
- **Import errors**: Check if all components are properly exported
- **TypeScript errors**: Run `npm run lint` to check for issues

## Development Features

- **Error Boundaries**: Catches and displays rendering errors
- **Graceful Degradation**: App works without Supabase configuration
- **Hot Reload**: Vite provides fast development refresh
- **TypeScript**: Full type safety throughout the application

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components (shadcn/ui)
│   ├── layout/      # Header, Footer
│   └── home/        # Homepage sections
├── pages/           # Route components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
├── types/           # TypeScript type definitions
└── services/        # API and data services
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
