'use server';

import {
    MinoClient,
    createExtractionGoal,
    getRetailerSearchUrls,
    normalizeImageUrl
} from '@/lib/mino-client';

const MINO_API_KEY = process.env.MINO_API_KEY || '';
const minoClient = new MinoClient(MINO_API_KEY);




export type Product = {
    title: string;
    price: string;
    original_price: string | null;
    discount_percentage: number | null;
    offers: string[];
    currency: string;
    seller: string;
    availability: string;
    shipping_cost: string;
    rating: number | string | null;
    image_url: string | null;
    product_url: string;
    confidence_score: number;
};

export type SearchResult = {
    success: boolean;
    products: Product[];
    error?: string;
    query?: string;
};

function normalizeProductData(extractedData: any, sourceUrl: string, retailerName: string): Product[] {
    let products: any[] = [];

    if (Array.isArray(extractedData)) {
        products = extractedData;
    } else if (extractedData.products && Array.isArray(extractedData.products)) {
        products = extractedData.products;
    } else if (extractedData.results && Array.isArray(extractedData.results)) {
        products = extractedData.results;
    } else if (extractedData.title || extractedData.price) {
        products = [extractedData];
    }

    return products.map(item => {
        const currentPrice = item.price || 'N/A';
        const originalPrice = item.original_price || item.originalPrice || null;
        let discount = item.discount_percentage || item.discountPercentage || null;

        // Calculate discount if missing
        if (originalPrice && !discount) {
            try {
                const curr = parseFloat(String(currentPrice).replace(/[^0-9.]/g, ''));
                const orig = parseFloat(String(originalPrice).replace(/[^0-9.]/g, ''));
                if (orig > 0 && curr < orig) {
                    discount = ((orig - curr) / orig) * 100;
                }
            } catch (e) { }
        }

        return {
            title: String(item.title || item.name || 'Product'),
            price: String(currentPrice),
            original_price: originalPrice ? String(originalPrice) : null,
            discount_percentage: discount ? parseFloat(Number(discount).toFixed(1)) : null,
            offers: Array.isArray(item.offers) ? item.offers : (item.offers ? [item.offers] : []),
            currency: item.currency || '$',
            seller: retailerName, // Use the retailer name we searched
            availability: item.availability || item.stock || 'Unknown',
            shipping_cost: item.shipping_cost || item.shipping || 'N/A',
            rating: item.rating || null,
            image_url: normalizeImageUrl(item.image_url || item.image || item.imageUrl, sourceUrl),
            product_url: item.product_url || item.url || sourceUrl,
            confidence_score: Number(item.confidence_score || 0.7),
        };
    });
}

export async function searchProducts(query: string): Promise<SearchResult> {
    if (!query.trim()) {
        return { success: false, products: [], error: 'Query is required' };
    }

    try {
        const retailers = getRetailerSearchUrls(query, 'text').slice(0, 3); // Reduce to top 3 for speed
        const goal = createExtractionGoal('text', query);

        // Run searches in parallel
        const promises = retailers.map(async ([retailerName, url]) => {
            try {
                const data = await minoClient.extractData(url, goal);
                if (data) {
                    return normalizeProductData(data, url, retailerName);
                }
            } catch (e) {
                console.error(`Error searching ${retailerName}:`, e);
            }
            return [];
        });

        const results = await Promise.all(promises);
        const allProducts = results.flat();

        if (allProducts.length === 0) {
            return {
                success: false,
                products: [],
                error: 'No products found. Please try a different search query.'
            };
        }

        return {
            success: true,
            products: allProducts,
            query,
        };

    } catch (error) {
        console.error('Search error:', error);
        return { success: false, products: [], error: String(error) };
    }
}

export async function searchImage(formData: FormData): Promise<SearchResult> {
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
        return { success: false, products: [], error: 'No image provided' };
    }

    // NOTE: In a real app, we would upload this image to Blob storage (e.g. Vercel Blob)
    // and pass the public URL to Mino. 
    // For this migration, we mirror the Python app's logic which used a generic 'similar product' 
    // query to retailers, as the original logic for passing image context was implicit/incomplete.

    console.log(`Processing image search: ${imageFile.name} (${imageFile.size} bytes)`);

    try {
        // We search for "similar product" on retailers, just like the Python app did
        // The Mino extraction goal will contain instructions to look for similar products
        const retailers = getRetailerSearchUrls('similar product', 'image').slice(0, 3);
        const goal = createExtractionGoal('image', 'product in uploaded image');

        const promises = retailers.map(async ([retailerName, url]) => {
            try {
                const data = await minoClient.extractData(url, goal);
                if (data) {
                    return normalizeProductData(data, url, retailerName);
                }
            } catch (e) {
                console.error(`Error searching ${retailerName}:`, e);
            }
            return [];
        });

        const results = await Promise.all(promises);
        const allProducts = results.flat();

        if (allProducts.length === 0) {
            return {
                success: false,
                products: [],
                error: 'No similar products found.'
            };
        }

        return {
            success: true,
            products: allProducts,
            query: 'Image Search',
        };

    } catch (error) {
        console.error('Image search error:', error);
        return { success: false, products: [], error: String(error) };
    }
}
