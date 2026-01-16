# Flask to Next.js Migration Checklist

Use this checklist to track your migration progress.

## Phase 1: Setup & Infrastructure ✅

- [ ] Initialize Next.js 15 project with TypeScript
  ```bash
  npx create-next-app@latest tinyfish-nextjs --typescript --tailwind --app
  ```

- [ ] Install additional dependencies
  ```bash
  npm install prisma @prisma/client @tanstack/react-query zod form-data
  ```

- [ ] Set up Prisma with SQLite
  ```bash
  npx prisma init --datasource-provider sqlite
  ```

- [ ] Create `.env.local` with environment variables
  ```env
  MINO_API_KEY=sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf
  DATABASE_URL="file:./dev.db"
  ```

- [ ] Configure `tsconfig.json` paths
- [ ] Set up Tailwind CSS configuration
- [ ] Create folder structure (app/, components/, lib/, types/, hooks/)

## Phase 2: Type Definitions ✅

- [ ] Create `types/product.ts` - Product interfaces
- [ ] Create `types/api.ts` - API request/response types
- [ ] Create `types/mino.ts` - Mino API types (if separate)
- [ ] Export all types from `types/index.ts`

## Phase 3: Core Library Migration ✅

- [ ] Migrate Mino API client to TypeScript (`lib/mino-client.ts`)
  - [ ] Convert `MinoAPIClient` class
  - [ ] Implement SSE stream parsing
  - [ ] Add error handling and retries
  - [ ] Test with Mino API

- [ ] Migrate utility functions (`lib/utils.ts`)
  - [ ] `parsePrice()` function
  - [ ] `normalizeImageUrl()` function
  - [ ] `createProductDict()` function
  - [ ] `normalizeProductData()` function

- [ ] Create retailer URL generator (`lib/retailers.ts` or in mino-client.ts)

## Phase 4: API Routes Migration ✅

- [ ] Create `app/api/search/text/route.ts`
  - [ ] Convert POST handler
  - [ ] Add validation
  - [ ] Implement error handling
  - [ ] Test endpoint

- [ ] Create `app/api/search/image/route.ts`
  - [ ] Handle file uploads
  - [ ] Convert image search logic
  - [ ] Test endpoint

- [ ] Create `app/api/example-prompts/route.ts`
  - [ ] Return example prompts
  - [ ] Test endpoint

- [ ] Create `app/api/products/compare/route.ts`
  - [ ] Implement comparison logic
  - [ ] Test endpoint

## Phase 5: Database Migration ✅

- [ ] Create Prisma schema (`lib/db/schema.prisma`)
  - [ ] Define `Competitor` model
  - [ ] Define `PriceData` model
  - [ ] Define `PriceChange` model
  - [ ] Add indexes

- [ ] Migrate PriceMonitor class (`lib/db/price-monitor.ts`)
  - [ ] Convert `storePriceData()`
  - [ ] Convert `getLatestPrice()`
  - [ ] Convert `detectPriceChange()`
  - [ ] Convert `monitorAllCompetitors()`

- [ ] Run Prisma migrations
  ```bash
  npx prisma migrate dev --name init
  ```

- [ ] Generate Prisma client
  ```bash
  npx prisma generate
  ```

## Phase 6: Frontend Components ✅

### Layout Components
- [ ] Create `components/layout/Header.tsx`
- [ ] Create `components/layout/Footer.tsx`
- [ ] Create `app/layout.tsx` (root layout)

### Search Components
- [ ] Create `components/search/SearchTabs.tsx`
- [ ] Create `components/search/TextSearch.tsx`
- [ ] Create `components/search/ImageSearch.tsx`
- [ ] Create `components/search/AIAgentWindow.tsx` (for progress)

### Product Components
- [ ] Create `components/products/ProductCard.tsx`
- [ ] Create `components/products/ProductGrid.tsx`
- [ ] Create `components/products/ComparisonView.tsx`
- [ ] Create `components/products/ProductFilters.tsx`

### UI Components
- [ ] Create `components/ui/Button.tsx`
- [ ] Create `components/ui/Input.tsx`
- [ ] Create `components/ui/Select.tsx`
- [ ] Create `components/ui/Loading.tsx`
- [ ] Create `components/ui/Error.tsx`

## Phase 7: React Hooks ✅

- [ ] Create `hooks/useSearch.ts`
  - [ ] Text search mutation
  - [ ] Image search mutation
  - [ ] Loading states
  - [ ] Error handling

- [ ] Create `hooks/useProducts.ts`
  - [ ] Product state management
  - [ ] Sorting logic
  - [ ] Filtering logic
  - [ ] Comparison logic

- [ ] Create `hooks/useSSE.ts` (if using Server-Sent Events)
  - [ ] SSE connection management
  - [ ] Event parsing
  - [ ] Cleanup

## Phase 8: Pages ✅

- [ ] Create `app/page.tsx` (home page)
  - [ ] Integrate search components
  - [ ] Integrate product grid
  - [ ] Add layout components

- [ ] Style with Tailwind CSS
  - [ ] Convert CSS classes to Tailwind
  - [ ] Ensure responsive design
  - [ ] Add dark mode (optional)

## Phase 9: Testing ✅

- [ ] Test text search functionality
- [ ] Test image search functionality
- [ ] Test product comparison
- [ ] Test sorting and filtering
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test responsive design
- [ ] Run Lighthouse audit
- [ ] Test SEO (meta tags, etc.)

## Phase 10: Optimization ✅

- [ ] Add Next.js Image optimization
- [ ] Implement code splitting
- [ ] Add loading.tsx files for Suspense
- [ ] Optimize API routes
- [ ] Add caching strategies
- [ ] Implement error boundaries
- [ ] Add analytics (optional)

## Phase 11: Deployment ✅

- [ ] Update environment variables for production
- [ ] Configure database for production (PostgreSQL recommended)
- [ ] Set up CI/CD pipeline
- [ ] Deploy to Vercel/Render
- [ ] Test production deployment
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)

## Phase 12: Documentation ✅

- [ ] Update README.md
- [ ] Document API endpoints
- [ ] Create deployment guide
- [ ] Document environment variables
- [ ] Add code comments
- [ ] Create developer guide

## Migration Complete! 🎉

Once all items are checked:
- [ ] Archive Flask codebase
- [ ] Update documentation
- [ ] Notify team/users
- [ ] Monitor for issues

---

## Quick Reference Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Database
npx prisma studio  # Open database GUI
npx prisma migrate dev  # Create migration
npx prisma generate  # Generate client

# Type checking
npm run type-check  # (if added to package.json)
```

