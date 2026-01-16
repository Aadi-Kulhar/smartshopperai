import { prisma } from './prisma';
import { MinoClient, createExtractionGoal } from './mino-client';
import { formatPrice } from './utils';

// Re-export types
export type { Competitor, PriceData, PriceChange } from '@prisma/client';

const MINO_API_KEY = process.env.MINO_API_KEY || '';

export class PriceMonitor {
    private minoClient: MinoClient;

    constructor() {
        this.minoClient = new MinoClient(MINO_API_KEY);
    }

    /**
     * Add a competitor to monitor
     */
    async addCompetitor(name: string, url: string, extractionGoal?: string) {
        const defaultGoal =
            "Extract the current price of the product from this page. " +
            "Return a JSON object with 'price' (as string), 'currency' (if available), " +
            "and any other relevant product information like 'title', 'availability', etc.";

        const goal = extractionGoal || defaultGoal;

        try {
            const competitor = await prisma.competitor.create({
                data: {
                    name,
                    url,
                    extraction_goal: goal,
                },
            });
            console.log(`Added competitor: ${name} (${url})`);
            return competitor;
        } catch (error) {
            console.error(`Error adding competitor ${url}:`, error);
            // Check if it's a unique constraint violation
            // Prisma error code P2002 is unique constraint failed
            if ((error as any).code === 'P2002') {
                console.warn(`Competitor with URL ${url} already exists`);
                return await prisma.competitor.findUnique({ where: { url } });
            }
            throw error;
        }
    }

    /**
     * Get all active competitors
     */
    async getCompetitors() {
        return prisma.competitor.findMany({
            where: { is_active: true },
        });
    }

    /**
     * Get the most recent price data for a competitor
     */
    async getLatestPrice(competitorId: number) {
        return prisma.priceData.findFirst({
            where: { competitor_id: competitorId },
            orderBy: { extracted_at: 'desc' },
        });
    }

    /**
     * Store extracted price data
     */
    async storePriceData(competitorId: number, url: string, extractedData: any) {
        const price = extractedData.price ? String(extractedData.price) : null;
        const currency = extractedData.currency ? String(extractedData.currency) : null;
        const extractedJson = JSON.stringify(extractedData);

        const priceData = await prisma.priceData.create({
            data: {
                competitor_id: competitorId,
                url,
                price,
                currency,
                extracted_data: extractedJson,
            },
        });

        console.log(`Stored price data for competitor_id ${competitorId}: ${price} ${currency}`);
        return priceData;
    }

    /**
     * Detect and log price changes
     */
    async detectPriceChange(competitorId: number, newPrice: string | null, oldPrice: string | null) {
        if (!oldPrice || !newPrice) return false;

        const normalizePrice = (priceStr: string) => {
            // Remove common currency symbols and whitespace
            // This regex matches anything that NOT digit, dot, comma, or hyphen and removes it
            const cleaned = priceStr.replace(/[^0-9.,-]/g, '');
            const parsed = parseFloat(cleaned.replace(/,/g, '')); // assume comma is thousands separator
            return isNaN(parsed) ? null : parsed;
        };

        const oldNorm = normalizePrice(oldPrice);
        const newNorm = normalizePrice(newPrice);

        let changed = false;
        let changePercentage = 0.0;

        if (oldNorm === null || newNorm === null) {
            // String comparison fallback
            changed = oldPrice !== newPrice;
        } else {
            if (oldNorm !== newNorm) {
                changed = true;
                if (oldNorm > 0) {
                    changePercentage = ((newNorm - oldNorm) / oldNorm) * 100;
                }
            }
        }

        if (changed) {
            // Get URL from competitor
            const competitor = await prisma.competitor.findUnique({
                where: { id: competitorId },
                select: { url: true, name: true },
            });

            if (competitor) {
                await prisma.priceChange.create({
                    data: {
                        competitor_id: competitorId,
                        url: competitor.url,
                        old_price: oldPrice,
                        new_price: newPrice,
                        change_percentage: changePercentage,
                    },
                });

                console.log(
                    `Price change detected for ${competitor.name}: ${oldPrice} -> ${newPrice} (${changePercentage.toFixed(2)}%)`
                );
            }
            return true;
        }

        return false;
    }

    /**
     * Monitor all active competitors and extract pricing data
     */
    async monitorAllCompetitors(delayBetweenRequests = 2000) {
        const competitors = await this.getCompetitors();

        if (competitors.length === 0) {
            console.warn("No active competitors found.");
            return;
        }

        console.log(`Starting monitoring for ${competitors.length} competitor(s)`);

        for (const competitor of competitors) {
            try {
                console.log(`Processing ${competitor.name} (${competitor.url})`);

                // Extract data
                const goal = competitor.extraction_goal || ''; // Should not be empty based on addCompetitor logic
                const extractedData = await this.minoClient.extractData(competitor.url, goal);

                if (!extractedData) {
                    console.error(`Failed to extract data from ${competitor.url}`);
                    continue;
                }

                // Get previous price
                const latest = await this.getLatestPrice(competitor.id);
                const oldPrice = latest?.price || null;
                const newPrice = extractedData.price ? String(extractedData.price) : '';

                // Store new data
                await this.storePriceData(competitor.id, competitor.url, extractedData);

                // Detect change
                if (oldPrice) {
                    await this.detectPriceChange(competitor.id, newPrice, oldPrice);
                } else {
                    console.log(`First price recorded for ${competitor.name}: ${newPrice}`);
                }

                // Delay
                if (delayBetweenRequests > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
                }

            } catch (error) {
                console.error(`Error processing ${competitor.name}:`, error);
            }
        }

        console.log("Monitoring cycle completed");
    }

    async getPriceHistory(competitorId: number, limit = 30) {
        return prisma.priceData.findMany({
            where: { competitor_id: competitorId },
            orderBy: { extracted_at: 'desc' },
            take: limit,
        });
    }

    async getRecentChanges(days = 7) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        return prisma.priceChange.findMany({
            where: {
                detected_at: {
                    gte: dateLimit,
                },
            },
            orderBy: { detected_at: 'desc' },
            include: {
                competitor: {
                    select: { name: true },
                },
            },
        });
    }
}
