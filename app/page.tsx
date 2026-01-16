'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { ProductCard } from '@/components/ProductCard';
import { searchProducts, searchImage, Product } from '@/app/actions/search';
import { ShoppingBag, Zap, Shield, Sparkles } from 'lucide-react';

export const maxDuration = 60; // Set max duration for Server Actions in this route

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={`${product.product_url}-${index}`} product={product} />
                ))}
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
