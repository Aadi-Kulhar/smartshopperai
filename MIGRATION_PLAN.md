# Flask to Next.js Migration Plan

## Executive Summary

This document outlines the complete migration strategy from Flask (Python) to Next.js 15+ (TypeScript) for the TinyFish Smart Shopping platform.

**Current Stack:**
- Flask (Python) with Jinja2 templates
- SQLite database
- Vanilla JavaScript frontend
- Mino API integration

**Target Stack:**
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM (for database)
- Server Actions & Route Handlers

---

## 1. Project Structure Comparison

### Current Flask Structure
```
TinyFish/
├── app.py                    # Flask app & routes
├── mino_integration.py       # Mino API client & DB
├── templates/
│   └── index.html           # Jinja2 template
├── static/
│   ├── app.js              # Vanilla JS
│   └── styles.css         # Custom CSS
├── uploads/                # File storage
├── price_monitor.db        # SQLite
└── requirements.txt
```

### Target Next.js Structure
```
tinyfish-nextjs/
├── app/                      # App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (replaces /)
│   ├── api/
│   │   ├── search/
│   │   │   ├── text/
│   │   │   │   └── route.ts    # POST /api/search/text
│   │   │   └── image/
│   │   │       └── route.ts    # POST /api/search/image
│   │   ├── products/
│   │   │   └── compare/
│   │   │       └── route.ts     # POST /api/products/compare
│   │   └── example-prompts/
│   │       └── route.ts         # GET /api/example-prompts
│   └── uploads/             # File uploads
├── components/               # React components
│   ├── ui/                  # Reusable UI components
│   ├── search/
│   │   ├── TextSearch.tsx
│   │   ├── ImageSearch.tsx
│   │   └── SearchTabs.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ComparisonView.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/                      # Utilities
│   ├── mino-client.ts       # Mino API client (TypeScript)
│   ├── db/
│   │   ├── prisma.ts        # Prisma client
│   │   └── schema.prisma    # Database schema
│   └── utils.ts             # Helper functions
├── types/                    # TypeScript types
│   ├── product.ts
│   ├── api.ts
│   └── mino.ts
├── hooks/                    # Custom React hooks
│   ├── useSearch.ts
│   └── useProducts.ts
├── public/                   # Static assets
├── .env.local                # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 2. Route Mapping

| Flask Route | Next.js Equivalent | Type |
|------------|-------------------|------|
| `GET /` | `app/page.tsx` | Server Component |
| `POST /api/search/text` | `app/api/search/text/route.ts` | Route Handler |
| `POST /api/search/image` | `app/api/search/image/route.ts` | Route Handler |
| `GET /api/example-prompts` | `app/api/example-prompts/route.ts` | Route Handler |
| `POST /api/products/compare` | `app/api/products/compare/route.ts` | Route Handler |

---

## 3. Technology Stack Migration

### Backend
- **Flask → Next.js Route Handlers**: API endpoints as TypeScript functions
- **SQLite → Prisma**: Type-safe database access
- **Python Mino Client → TypeScript**: Rewrite in TypeScript/Node.js

### Frontend
- **Jinja2 Templates → React Server Components**: Server-side rendering
- **Vanilla JS → React + TypeScript**: Component-based architecture
- **Custom CSS → Tailwind CSS**: Utility-first styling

### State Management
- **Server Sessions → React State**: `useState`, `useOptimistic`
- **SSE Streaming → Server Actions**: Real-time updates
- **Data Fetching → SWR/TanStack Query**: Client-side caching

---

## 4. Key Migration Tasks

### Phase 1: Setup & Infrastructure
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up Prisma with SQLite (or PostgreSQL)
- [ ] Create TypeScript type definitions
- [ ] Configure environment variables

### Phase 2: API Migration
- [ ] Migrate Mino API client to TypeScript
- [ ] Convert Flask routes to Next.js Route Handlers
- [ ] Implement Server Actions for form submissions
- [ ] Add error handling and validation

### Phase 3: Frontend Migration
- [ ] Convert HTML template to React components
- [ ] Implement search functionality with React hooks
- [ ] Add product comparison feature
- [ ] Implement sorting and filtering
- [ ] Add loading states and error handling

### Phase 4: Database Migration
- [ ] Create Prisma schema from SQLite
- [ ] Migrate PriceMonitor logic to Prisma
- [ ] Update database operations

### Phase 5: Testing & Deployment
- [ ] Test all features
- [ ] Optimize performance
- [ ] Deploy to Vercel/Render
- [ ] Monitor and fix issues

---

## 5. Environment Variables Mapping

| Flask (.env) | Next.js (.env.local) | Type |
|-------------|---------------------|------|
| `MINO_API_KEY` | `MINO_API_KEY` | Server-only |
| `DB_PATH` | `DATABASE_URL` | Server-only |
| N/A | `NEXT_PUBLIC_APP_URL` | Public (if needed) |

---

## 6. Performance Improvements

### Expected Gains:
- **Lighthouse Score**: 60-70 → 90+ (SSR, optimized assets)
- **First Contentful Paint**: -40% (Server Components)
- **Time to Interactive**: -50% (Code splitting)
- **SEO**: Improved (Server-side rendering)

---

## 7. Migration Timeline

**Estimated Duration**: 2-3 weeks

- Week 1: Setup, API migration, core components
- Week 2: Frontend migration, database migration
- Week 3: Testing, optimization, deployment

---

## Next Steps

1. Review this plan
2. Initialize Next.js project
3. Begin Phase 1 implementation

