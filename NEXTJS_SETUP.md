# Next.js Project Setup Guide

## Quick Start

```bash
# Create Next.js project
npx create-next-app@latest tinyfish-nextjs --typescript --tailwind --app --no-src-dir

cd tinyfish-nextjs

# Install additional dependencies
npm install prisma @prisma/client
npm install @tanstack/react-query swr
npm install zod  # For validation
npm install form-data  # For file uploads

# Initialize Prisma
npx prisma init --datasource-provider sqlite
```

## Project Structure

See `MIGRATION_PLAN.md` for complete structure.

## Environment Variables

Create `.env.local`:

```env
# Mino API
MINO_API_KEY=sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf

# Database
DATABASE_URL="file:./dev.db"

# App URL (for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps

1. Follow the migration plan in `MIGRATION_PLAN.md`
2. Start with Phase 1: Setup & Infrastructure
3. Reference code examples in migration guide

