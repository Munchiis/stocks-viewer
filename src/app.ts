import { StockWindow } from "./components/StockWindow";
import "./style.css";

const stocks: string[] = ['BB', 'RR', 'REKR', 'BGI', 'OPTT', 'RVSN'];
const windowMap: Map<string, StockWindow> = new Map();

stocks.forEach(async (symbol: string) => {
    const stockWindow = new StockWindow(symbol);
    windowMap.set(symbol, stockWindow);
    await stockWindow.update();
});
