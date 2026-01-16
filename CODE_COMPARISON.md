# Code Comparison: Flask vs Next.js

This document shows side-by-side comparisons of Flask code and its Next.js equivalent.

---

## 1. Route: Home Page

### Flask (Before)
```python
# app.py
@app.route('/')
def index():
    """Render main dashboard page."""
    return render_template('index.html')
```

### Next.js (After)
```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <Header />
      <SearchSection />
      <ResultsSection />
      <Footer />
    </main>
  );
}
```

---

## 2. API Route: Text Search

### Flask (Before)
```python
# app.py
@app.route('/api/search/text', methods=['POST'])
def search_text():
    """Handle text-based product search."""
    data = request.get_json()
    query = data.get('query', '').strip()
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    try:
        goal = create_extraction_goal('text', query)
        retailers = get_retailer_search_urls(query, 'text')
        
        all_products = []
        for retailer_name, url in retailers[:6]:
            extracted_data = mino_client.extract_data(url, goal)
            if extracted_data:
                products = normalize_product_data(extracted_data, url)
                all_products.extend(products)
        
        return jsonify({
            'success': True,
            'products': all_products,
            'total_results': len(all_products)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Next.js (After)
```typescript
// app/api/search/text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MinoClient } from '@/lib/mino-client';
import { normalizeProductData } from '@/lib/utils';
import { getRetailerSearchUrls } from '@/lib/retailers';
import { createExtractionGoal } from '@/lib/mino-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const minoClient = new MinoClient(process.env.MINO_API_KEY!);
    const goal = createExtractionGoal('text', query);
    const retailers = getRetailerSearchUrls(query, 'text');

    const allProducts = [];

    for (const [retailerName, url] of retailers.slice(0, 6)) {
      try {
        const extractedData = await minoClient.extractData(url, goal);
        if (extractedData) {
          const products = normalizeProductData(extractedData, url);
          products.forEach(product => {
            product.seller = retailerName;
          });
          allProducts.push(...products);
        }
      } catch (error) {
        console.error(`Error searching ${retailerName}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      products: allProducts,
      total_results: allProducts.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 3. Mino API Client

### Flask (Before)
```python
# mino_integration.py
class MinoAPIClient:
    def __init__(self, api_key: str, api_url: str = MINO_API_URL):
        self.api_key = api_key
        self.api_url = api_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
    
    def extract_data(self, url: str, goal: str, max_retries: int = 3):
        payload = {
            "url": url,
            "goal": goal
        }
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    stream=True,
                    timeout=120
                )
                # Parse SSE stream...
                return result_json
            except Exception as e:
                # Handle error...
```

### Next.js (After)
```typescript
// lib/mino-client.ts
import { EventSource } from 'eventsource';

export class MinoClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl = 'https://mino.ai/v1/automation/run-sse') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async extractData(
    url: string,
    goal: string,
    maxRetries = 3
  ): Promise<any> {
    const payload = { url, goal };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        // Parse SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let result: any = null;

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.status === 'COMPLETED') {
                result = data.resultJson;
                return result;
              } else if (data.status === 'FAILED') {
                throw new Error(data.error || 'Extraction failed');
              }
            }
          }
        }

        return result;
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000));
      }
    }

    throw new Error('Max retries exceeded');
  }
}
```

---

## 4. Component: Product Card

### Flask (Before)
```html
<!-- templates/index.html -->
<div class="product-card">
  <img src="{{ product.image_url }}" alt="{{ product.title }}">
  <h3>{{ product.title }}</h3>
  <p class="price">{{ product.price }}</p>
  <p class="seller">{{ product.seller }}</p>
</div>
```

### Next.js (After)
```typescript
// components/products/ProductCard.tsx
import Image from 'next/image';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isSelected?: boolean;
}

export function ProductCard({ product, onSelect, isSelected }: ProductCardProps) {
  return (
    <div className={`product-card ${isSelected ? 'selected' : ''}`}>
      <Image
        src={product.image_url || '/placeholder.png'}
        alt={product.title}
        width={300}
        height={300}
      />
      <h3>{product.title}</h3>
      <p className="price">{product.price}</p>
      <p className="seller">{product.seller}</p>
      {onSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product)}
        />
      )}
    </div>
  );
}
```

---

## 5. State Management: Search

### Flask (Before)
```javascript
// static/app.js
let currentProducts = [];

async function handleTextSearch() {
  const query = document.getElementById('text-query').value;
  const response = await fetch('/api/search/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  currentProducts = data.products;
  displayProducts(currentProducts);
}
```

### Next.js (After)
```typescript
// hooks/useSearch.ts
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Product } from '@/types/product';

export function useSearch() {
  const [products, setProducts] = useState<Product[]>([]);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch('/api/search/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    onSuccess: (data) => {
      setProducts(data.products);
    },
  });

  return {
    products,
    search: searchMutation.mutate,
    isLoading: searchMutation.isPending,
    error: searchMutation.error,
  };
}
```

---

## 6. Database: Price Monitor

### Flask (Before)
```python
# mino_integration.py
class PriceMonitor:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.mino_client = MinoAPIClient(MINO_API_KEY)
        self._init_database()
    
    def store_price_data(self, competitor_id: int, url: str, extracted_data: Dict):
        price = extracted_data.get('price', '')
        currency = extracted_data.get('currency', '')
        extracted_json = json.dumps(extracted_data)
        
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO price_data (competitor_id, url, price, currency, extracted_data)
                VALUES (?, ?, ?, ?, ?)
            ''', (competitor_id, url, price, currency, extracted_json))
```

### Next.js (After)
```typescript
// lib/db/price-monitor.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PriceMonitor {
  async storePriceData(
    competitorId: number,
    url: string,
    extractedData: any
  ) {
    await prisma.priceData.create({
      data: {
        competitorId,
        url,
        price: extractedData.price || '',
        currency: extractedData.currency || '',
        extractedData: JSON.stringify(extractedData),
      },
    });
  }

  async getLatestPrice(competitorId: number) {
    return prisma.priceData.findFirst({
      where: { competitorId },
      orderBy: { extractedAt: 'desc' },
    });
  }
}
```

---

## 7. Type Definitions

### Next.js (New)
```typescript
// types/product.ts
export interface Product {
  title: string;
  price: string;
  original_price?: string | null;
  discount_percentage?: number | null;
  offers: string[];
  currency: string;
  seller: string;
  availability: string;
  shipping_cost: string;
  rating?: number | null;
  image_url?: string | null;
  product_url: string;
  confidence_score: number;
  condition?: string;
  return_policy?: string;
  estimated_delivery?: string;
}

// types/api.ts
export interface SearchResponse {
  success: boolean;
  products: Product[];
  total_results: number;
  query?: string;
  error?: string;
}

// types/mino.ts
export interface MinoExtractionGoal {
  query_type: 'text' | 'image';
  query_data: string;
}

export interface MinoResponse {
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  resultJson?: any;
  error?: string;
}
```

---

## Key Differences Summary

1. **Type Safety**: TypeScript provides compile-time type checking
2. **Server Components**: Automatic code splitting and SSR
3. **API Routes**: Type-safe route handlers with Next.js
4. **State Management**: React hooks + TanStack Query for better UX
5. **Database**: Prisma provides type-safe database access
6. **Performance**: Automatic optimizations (image, font, code splitting)

