import { StockWindow } from "./components/StockWindow.js";
import "./style.css"
const stocks = ['BB', 'RR', 'REKR', 'BGI', 'OPTT', 'RVSN']
// const stocks = ['BB', 'RR']
const windowMap = new Map();
console.log(import.meta.env)

stocks.forEach(async (symbol) => {
    const stockWindow = new StockWindow(symbol);
    windowMap.set(symbol, stockWindow);
    await stockWindow.update()
}
)

