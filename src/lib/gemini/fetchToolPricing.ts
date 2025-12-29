import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ToolPricing {
    toolName: string;
    tiers: {
        name: string;
        price: string;
        features: string[];
    }[];
    lastUpdated: string;
    source: string;
}

/**
 * Fetches current pricing information for a tool using Gemini AI
 * @param toolName - Name of the tool (e.g., "Supabase", "n8n", "OpenAI")
 * @returns Pricing information structured by tiers
 */
export async function fetchToolPricing(toolName: string): Promise<ToolPricing> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
You are a pricing research assistant. Find the current pricing information for "${toolName}".

Please provide the pricing in the following JSON format:
{
  "toolName": "${toolName}",
  "tiers": [
    {
      "name": "Tier name (e.g., Free, Pro, Enterprise)",
      "price": "Price in USD (e.g., $0/month, $25/month, Contact Sales)",
      "features": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ],
  "lastUpdated": "Current date in YYYY-MM-DD format",
  "source": "Official website URL"
}

Important:
- Only include official pricing from the tool's website
- Be accurate with prices and features
- If pricing is not publicly available, use "Contact Sales" or "Custom"
- Include at least 3 key features per tier
- Return ONLY valid JSON, no markdown or extra text
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Remove markdown code blocks if present
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse JSON response
        const pricing: ToolPricing = JSON.parse(cleanedText);

        // Cache the result in localStorage (24h TTL)
        const cacheKey = `tool_pricing_${toolName.toLowerCase().replace(/\s+/g, '_')}`;
        const cacheData = {
            pricing,
            timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));

        return pricing;
    } catch (error: any) {
        console.error('Error fetching tool pricing:', error);

        // Try to get from cache if API fails
        const cacheKey = `tool_pricing_${toolName.toLowerCase().replace(/\s+/g, '_')}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            const { pricing, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (age < maxAge) {
                console.log('Using cached pricing data');
                return pricing;
            }
        }

        throw new Error(`Failed to fetch pricing for ${toolName}: ${error.message}`);
    }
}

/**
 * Gets cached pricing if available and not expired
 */
export function getCachedPricing(toolName: string): ToolPricing | null {
    const cacheKey = `tool_pricing_${toolName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    try {
        const { pricing, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (age < maxAge) {
            return pricing;
        }
    } catch (error) {
        console.error('Error reading cached pricing:', error);
    }

    return null;
}
