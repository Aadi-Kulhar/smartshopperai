'use client';

import { useState, useMemo } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { ProductCard } from '@/components/ProductCard';
import { searchProducts, searchImage, Product } from '@/app/actions/search';
import { ShoppingBag, Zap, Shield, Sparkles, ArrowUpDown } from 'lucide-react';

export const maxDuration = 60;

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'discount';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSortBy('relevance'); // Reset sort on new search

    try {
      const result = await searchProducts(query);
      if (result.success) {
        setProducts(result.products);
      } else {
        setProducts([]);
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to perform search');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSearch = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSortBy('relevance');

    try {
      const result = await searchImage(formData);
      if (result.success) {
        setProducts(result.products);
      } else {
        setProducts([]);
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to perform image search');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedProducts = useMemo(() => {
    if (!products.length) return [];

    const sorted = [...products];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || Infinity;
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || Infinity;
          return priceA - priceB;
        });
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
          return priceB - priceA;
        });
      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0);
          const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0);
          return ratingB - ratingA;
        });
      case 'discount':
        return sorted.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
      case 'relevance':
      default:
        // Assume default order from API is relevance
        return sorted;
    }
  }, [products, sortBy]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center min-h-screen">

        {/* Header */}
        <header className="text-center mb-12 md:mb-16 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-4 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>AI-Powered Price Comparison</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 tracking-tight">
            Smart Shopper
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
            Find the best prices across the web. Analyzing millions of products with <a href="https://mino.ai" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">Mino AI</a> to save you money.
          </p>
        </header>

        {/* Search Section */}
        <div className="w-full mb-16">
          <SearchForm
            onSearch={handleSearch}
            onImageSearch={handleImageSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Features / Empty State */}
        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl opacity-50 hover:opacity-100 transition-opacity duration-500">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShoppingBag className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-Retailer</h3>
              <p className="text-sm text-zinc-400">Instantly compare prices from Amazon, eBay, Walmart, and more.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-Time AI</h3>
              <p className="text-sm text-zinc-400">Live data extraction ensures you see the most current deals.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Price History</h3>
              <p className="text-sm text-zinc-400">Track price changes over time to buy at the perfect moment.</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            {error && (
              <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 mb-8">
                {error}
              </div>
            )}

            {products.length > 0 && (
              <div className="space-y-6">
                {/* Sorting Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                  <span className="text-zinc-400 text-sm">Found {products.length} results</span>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-sm text-zinc-500 whitespace-nowrap">Sort by:</span>
                    {[
                      { value: 'relevance', label: 'Relevance' },
                      { value: 'price-asc', label: 'By Price (Low)' },
                      { value: 'price-desc', label: 'By Price (High)' },
                      { value: 'discount', label: 'Best Deals' },
                      { value: 'rating', label: 'Rating' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as SortOption)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${sortBy === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map((product, index) => (
                    <ProductCard key={`${product.product_url}-${index}`} product={product} />
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !error && products.length === 0 && (
              <div className="text-center text-zinc-500 mt-12">
                No products found. Try a different search query.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-zinc-600 text-sm border-t border-white/5 mt-auto bg-black/50 backdrop-blur-lg">
        <p className="flex items-center justify-center gap-2">
          © {new Date().getFullYear()} Smart Shopper.
          <span className="flex items-center gap-1">
            Powered by <a href="https://mino.ai" target="_blank" className="text-zinc-400 hover:text-white transition-colors">Mino AI</a>
          </span>
        </p>
      </footer>
    </div>
  );
}
