/**
 * API response type definitions
 */

import { Product } from './product';

export interface SearchRequest {
  query: string;
  stream?: boolean;
}

export interface SearchResponse {
  success: boolean;
  products: Product[];
  total_results: number;
  query?: string;
  error?: string;
}

export interface ImageSearchRequest {
  image: File;
  stream?: boolean;
}

export interface CompareRequest {
  product_ids: string[];
}

export interface CompareResponse {
  success: boolean;
  products: Product[];
  error?: string;
}

export interface ExamplePromptsResponse {
  examples: string[];
}

export interface SSEEvent {
  type: 'status' | 'searching' | 'products' | 'no_results' | 'error' | 'complete';
  message?: string;
  retailer?: string;
  url?: string;
  progress?: string;
  products?: Product[];
  count?: number;
  error?: string;
  total_results?: number;
}

