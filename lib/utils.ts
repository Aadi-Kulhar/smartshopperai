import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | null, currency: string = '$'): string {
    if (price === null || price === undefined) return 'N/A';

    // if it's already a string with currency, just return it
    if (typeof price === 'string' && (price.includes('$') || price.includes('€') || price.includes('£'))) {
        return price;
    }

    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;

    if (isNaN(numPrice)) return String(price);

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency === '$' ? 'USD' : currency,
    }).format(numPrice);
}
