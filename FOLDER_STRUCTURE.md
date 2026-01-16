# Next.js Project Folder Structure

## Complete Directory Tree

```
tinyfish-nextjs/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (replaces base template)
│   ├── page.tsx                 # Home page (replaces /)
│   ├── loading.tsx              # Loading UI
│   ├── error.tsx                # Error boundary
│   ├── not-found.tsx            # 404 page
│   │
│   ├── api/                     # API Routes
│   │   ├── search/
│   │   │   ├── text/
│   │   │   │   └── route.ts     # POST /api/search/text
│   │   │   └── image/
│   │   │       └── route.ts     # POST /api/search/image
│   │   │
│   │   ├── products/
│   │   │   └── compare/
│   │   │       └── route.ts      # POST /api/products/compare
│   │   │
│   │   └── example-prompts/
│   │       └── route.ts          # GET /api/example-prompts
│   │
│   └── uploads/                  # File uploads (server-side)
│
├── components/                   # React Components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   └── Error.tsx
│   │
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx           # Header (replaces header in index.html)
│   │   └── Footer.tsx           # Footer (replaces footer in index.html)
│   │
│   ├── search/                  # Search components
│   │   ├── SearchTabs.tsx       # Tab switcher (text/image)
│   │   ├── TextSearch.tsx       # Text search form
│   │   ├── ImageSearch.tsx      # Image upload/search
│   │   └── AIAgentWindow.tsx    # Progress indicator
│   │
│   └── products/                # Product components
│       ├── ProductCard.tsx      # Individual product card
│       ├── ProductGrid.tsx      # Grid of products
│       ├── ComparisonView.tsx  # Side-by-side comparison
│       └── ProductFilters.tsx  # Sort/filter controls
│
├── lib/                         # Utilities & Libraries
│   ├── mino-client.ts           # Mino API client (TypeScript)
│   ├── utils.ts                 # Helper functions
│   │
│   └── db/                     # Database
│       ├── prisma.ts            # Prisma client instance
│       ├── schema.prisma        # Database schema
│       └── price-monitor.ts     # PriceMonitor class
│
├── types/                       # TypeScript Types
│   ├── product.ts               # Product interfaces
│   ├── api.ts                   # API request/response types
│   ├── mino.ts                  # Mino API types
│   └── index.ts                 # Re-exports
│
├── hooks/                       # Custom React Hooks
│   ├── useSearch.ts             # Search functionality
│   ├── useProducts.ts           # Product state management
│   └── useSSE.ts                # Server-Sent Events (if used)
│
├── public/                      # Static Assets
│   ├── images/
│   └── favicon.ico
│
├── styles/                      # Global Styles (if needed)
│   └── globals.css              # Tailwind imports + custom CSS
│
├── .env.local                   # Environment variables (gitignored)
├── .env.example                 # Example env file
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
├── next.config.js               # Next.js config
├── prisma/
│   └── migrations/              # Database migrations
│
└── README.md                    # Project documentation
```

## Key Differences from Flask

### Flask Structure
```
TinyFish/
├── app.py                      # All routes in one file
├── templates/
│   └── index.html             # Single template
├── static/
│   ├── app.js                 # All JS in one file
│   └── styles.css             # All CSS in one file
└── mino_integration.py         # Separate module
```

### Next.js Structure
```
tinyfish-nextjs/
├── app/                        # File-based routing
│   ├── page.tsx               # Each route is a file
│   └── api/                   # API routes in subdirectories
├── components/                 # Reusable React components
├── lib/                        # Shared utilities
└── types/                      # TypeScript definitions
```

## File Naming Conventions

- **Pages**: `page.tsx` (App Router)
- **Layouts**: `layout.tsx`
- **API Routes**: `route.ts`
- **Components**: `PascalCase.tsx`
- **Hooks**: `useCamelCase.ts`
- **Utils**: `camelCase.ts`
- **Types**: `camelCase.ts`

## Route Mapping

| Flask Route | Next.js File | Type |
|------------|--------------|------|
| `GET /` | `app/page.tsx` | Server Component |
| `POST /api/search/text` | `app/api/search/text/route.ts` | Route Handler |
| `POST /api/search/image` | `app/api/search/image/route.ts` | Route Handler |
| `GET /api/example-prompts` | `app/api/example-prompts/route.ts` | Route Handler |
| `POST /api/products/compare` | `app/api/products/compare/route.ts` | Route Handler |

## Component Hierarchy

```
app/layout.tsx (Root Layout)
├── Header
├── app/page.tsx (Home Page)
│   ├── SearchTabs
│   │   ├── TextSearch
│   │   └── ImageSearch
│   ├── AIAgentWindow (conditional)
│   └── ProductGrid
│       └── ProductCard (multiple)
│   └── ComparisonView (conditional)
└── Footer
```

## Import Paths

Using TypeScript path aliases (configured in `tsconfig.json`):

```typescript
// Instead of relative paths
import { Product } from '../../../types/product';

// Use aliases
import { Product } from '@/types/product';
import { MinoClient } from '@/lib/mino-client';
import { ProductCard } from '@/components/products/ProductCard';
```

## Environment Variables

- **Server-only**: `MINO_API_KEY`, `DATABASE_URL`
- **Public**: `NEXT_PUBLIC_APP_URL` (if needed)

## Database Files

- **Schema**: `lib/db/schema.prisma`
- **Migrations**: `prisma/migrations/`
- **Client**: Generated in `node_modules/.prisma/client`

