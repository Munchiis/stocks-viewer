import { StockData } from '../utils/types/stock';

const api_key = import.meta.env.VITE_API_KEY;
const secret = import.meta.env.VITE_SECRET;
const BASE_URL = 'https://data.alpaca.markets';

const headers = {
    accept: 'application/json',
    'APCA-API-KEY-ID': api_key,
    'APCA-API-SECRET-KEY': secret
};

export async function getStockSnapshot(symbol: string): Promise<StockData> {
    try {
        const url = `${BASE_URL}/v2/stocks/${symbol}/snapshot`;
        const response = await fetch(url, { headers });
        const data = await response.json();
        return data;
    } catch {
        return {
            latestTrade: {
                p: 0.00
            },
            prevDailyBar: {
                c: 0.00
            },
            dailyBar: {
                o: 0.00,
                h: 0.00,
                l: 0.00
            }
        };
    }
}
