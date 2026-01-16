/**
 * Text Search API Route
 * Migrated from app.py @app.route('/api/search/text', methods=['POST'])
 */

import { NextRequest, NextResponse } from 'next/server';
import { MinoClient, createExtractionGoal, getRetailerSearchUrls } from '@/lib/mino-client';
import { normalizeProductData } from '@/lib/utils';
import { SearchResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, stream } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json<SearchResponse>(
        { 
          success: false,
          error: 'Query is required',
          products: [],
          total_results: 0
        },
        { status: 400 }
      );
    }

    const minoApiKey = process.env.MINO_API_KEY;
    if (!minoApiKey) {
      return NextResponse.json<SearchResponse>(
        {
          success: false,
          error: 'Mino API key not configured',
          products: [],
          total_results: 0
        },
        { status: 500 }
      );
    }

    const minoClient = new MinoClient(minoApiKey);
    const goal = createExtractionGoal('text', query);
    const retailers = getRetailerSearchUrls(query, 'text');

    const allProducts = [];

    // Search top 6 retailers
    for (const [retailerName, url] of retailers.slice(0, 6)) {
      try {
        const extractedData = await minoClient.extractData(url, goal);
        
        if (extractedData) {
          const products = normalizeProductData(extractedData, url);
          
          // Set retailer name for each product
          products.forEach((product) => {
            product.seller = retailerName;
            if (!product.product_url) {
              product.product_url = url;
            }
          });
          
          allProducts.push(...products);
        }
      } catch (error) {
        console.error(`Error searching ${retailerName}:`, error);
        continue;
      }
    }

    if (allProducts.length > 0) {
      return NextResponse.json<SearchResponse>({
        success: true,
        products: allProducts,
        query,
        total_results: allProducts.length,
      });
    } else {
      return NextResponse.json<SearchResponse>(
        {
          success: false,
          error: 'No products found. Please try a different search query.',
          products: [],
          total_results: 0,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in text search:', error);
    return NextResponse.json<SearchResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        products: [],
        total_results: 0,
      },
      { status: 500 }
    );
  }
}

