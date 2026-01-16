/**
 * Product type definitions
 * Migrated from Flask app.py product normalization
 */

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

export interface ProductComparison {
  products: Product[];
  comparison_fields: string[];
}

export type SortOption = 
  | 'relevance'
  | 'price-low'
  | 'price-high'
  | 'discount'
  | 'offers'
  | 'rating'
  | 'confidence';

export type FilterOption = 
  | 'all'
  | 'in-stock'
  | 'free-shipping'
  | 'high-rating';

