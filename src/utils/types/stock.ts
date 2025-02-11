export interface StockData {
    latestTrade: {
        p: number;
    };
    prevDailyBar: {
        c: number;
    };
    dailyBar: {
        l: number;
        h: number;
        o: number;
    };
}
