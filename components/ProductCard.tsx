'use client';

import { ExternalLink, Star, TrendingDown } from 'lucide-react';
import { Product } from '@/app/actions/search';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group relative bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col h-full">
            {/* Discount Badge */}
            {product.discount_percentage && product.discount_percentage > 0 && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {product.discount_percentage}% OFF
                </div>
            )}

            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-white p-4">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-zinc-800">
                        No Image
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Retailer */}
                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">
                    {product.seller}
                </div>

                {/* Title */}
                <h3 className="text-lg font-medium text-white mb-2 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                    {product.title}
                </h3>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1 text-yellow-500 text-sm mb-3">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{product.rating}</span>
                    </div>
                )}

                {/* Price Section */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-2xl font-bold text-white">
                            {formatPrice(product.price, product.currency)}
                        </span>
                        {product.original_price && (
                            <span className="text-sm text-zinc-500 line-through">
                                {formatPrice(product.original_price, product.currency)}
                            </span>
                        )}
                    </div>

                    <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                        View Deal <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
