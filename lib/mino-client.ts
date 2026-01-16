import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type MinoExtractionGoal = {
  query_type: 'text' | 'image';
  query_data: string;
};

export type MinoResponse = {
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  resultJson?: any;
  error?: string;
};

export class MinoClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(
    apiKey: string,
    apiUrl = 'https://mino.ai/v1/automation/run-sse'
  ) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Extract data from a URL using Mino API
   */
  async extractData(
    url: string,
    goal: string,
    maxRetries = 3
  ): Promise<any> {
    const payload = { url, goal };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(
          `Extracting data from ${url} (attempt ${attempt + 1}/${maxRetries})`
        );

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Mino API error: ${response.status} - ${errorText}`);
          if (attempt < maxRetries - 1) {
            await this.delay(2 ** attempt * 1000); // Exponential backoff
            continue;
          }
          return null;
        }

        // Parse SSE stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let resultJson: any = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim()) continue;

            // SSE format: "data: {...}"
            let dataLine = line;
            if (line.startsWith('data: ')) {
              dataLine = line.slice(6);
            }

            try {
              const data: MinoResponse = JSON.parse(dataLine);
              
              if (data.status === 'COMPLETED') {
                resultJson = data.resultJson;
                if (resultJson) {
                  return resultJson;
                }
              } else if (data.status === 'FAILED') {
                const errorMsg = data.error || 'Unknown error';
                console.error(`Extraction failed for ${url}: ${errorMsg}`);
                return null;
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }

        if (resultJson === null) {
          console.warn(`No result found in SSE stream for ${url}`);
          if (attempt < maxRetries - 1) {
            await this.delay(2 ** attempt * 1000);
            continue;
          }
        }

        return resultJson;
      } catch (error) {
        console.error(`Request error for ${url}:`, error);
        if (attempt < maxRetries - 1) {
          await this.delay(2 ** attempt * 1000);
          continue;
        }
        return null;
      }
    }

    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Get retailer search URLs for a query
 */
export function getRetailerSearchUrls(
  query: string,
  queryType: 'text' | 'image' = 'text'
): Array<[string, string]> {
  const encodedQuery = query.replace(/ /g, '+');

  const retailers: Array<[string, string]> = [
    ['Amazon', `https://www.amazon.com/s?k=${encodedQuery}`],
    ['eBay', `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`],
    ['Walmart', `https://www.walmart.com/search?q=${encodedQuery}`],
    ['Target', `https://www.target.com/s?searchTerm=${encodedQuery}`],
    ['Best Buy', `https://www.bestbuy.com/site/searchpage.jsp?st=${encodedQuery}`],
    ['Home Depot', `https://www.homedepot.com/s/${encodedQuery}`],
    ['Etsy', `https://www.etsy.com/search?q=${encodedQuery}`],
  ];

  return retailers;
}

/**
 * Create extraction goal for Mino API
 */
export function createExtractionGoal(
  queryType: 'text' | 'image',
  queryData: string
): string {
  if (queryType === 'text') {
    return (
      `Search for products matching this description: ${queryData}. ` +
      'On this search results page, extract information for the top 3-5 most relevant products. ' +
      'For each product, extract: product title, current price (as string with currency symbol), ' +
      'original price (if on sale/discount), discount percentage (if available), special offers or deals (if any), ' +
      'seller/retailer name, stock availability status (in stock/out of stock), shipping cost, ' +
      'seller rating (if available), product image URL, and the product\'s detail page URL. ' +
      'Return as a JSON array of objects, each with fields: title, price, original_price, discount_percentage, ' +
      'offers (array of special offers/deals), currency, seller, availability, shipping_cost, rating, ' +
      'image_url, product_url, confidence_score. ' +
      'If this is a search results page, extract multiple products. If it\'s a product detail page, extract that single product.'
    );
  } else {
    // image
    return (
      `Identify the product in this image and search for similar products. ` +
      'On this search results page, extract information for the top 3-5 most similar products. ' +
      'For each product, extract: product title, current price (as string with currency symbol), ' +
      'original price (if on sale/discount), discount percentage (if available), special offers or deals (if any), ' +
      'seller/retailer name, stock availability status, shipping cost, seller rating (if available), ' +
      'product image URL, and the product\'s detail page URL. ' +
      'Return as a JSON array of objects, each with fields: title, price, original_price, discount_percentage, ' +
      'offers (array of special offers/deals), currency, seller, availability, shipping_cost, rating, ' +
      'image_url, product_url, confidence_score.'
    );
  }
}

export function normalizeImageUrl(imageUrl: string | null | undefined, sourceUrl?: string): string | null {
  if (!imageUrl || imageUrl === 'N/A' || imageUrl.trim() === '') {
    return null;
  }
  
  imageUrl = imageUrl.trim();
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  if (sourceUrl) {
    try {
      if (imageUrl.startsWith('/')) {
        const urlObj = new URL(sourceUrl);
        return `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
      } else {
        return new URL(imageUrl, sourceUrl).toString();
      }
    } catch (e) {
      return null;
    }
  }
  
  return null;
}
