import { StockWindow } from "./components/StockWindow";
import { HomePage } from "./components/HomePage";
import "./style.css";
import { MarketProgressBar } from "./components/MarketProgressBar";
import { AlpacaService } from "./api/AlpacaService";
class App {
    private alpacaService: AlpacaService;
    private homePage: HomePage;
    private marketPB: MarketProgressBar;
    private windowMap: Map<string, StockWindow> = new Map();

    constructor() {
        this.alpacaService = AlpacaService.getInstance();
        this.homePage = new HomePage();
        this.marketPB = new MarketProgressBar();
        this.setupRouting();
        this.initializeStocks();
    }

    private setupRouting(): void {
        window.addEventListener('popstate', this.handleRoute.bind(this));

        // Handle initial route
        this.handleRoute();
    }

    private async initializeStocks(): Promise<void> {
        this.alpacaService.fetchActiveStocks();
    }

    private handleRoute(): void {
        const path = window.location.pathname;

        if (path === '/stock-viewer') {
            const gridContainer = document.createElement('div')
            gridContainer.classList.add('grid-container')
            document.getElementById('app')?.appendChild(gridContainer)

            //Todo: add real logic for input search/generate windows
            const stocks: string[] = ['BB', 'RR', 'REKR', 'BGI', 'OPTT', 'AAPL', 'PB', 'A', 'B'];
            const windowMap: Map<string, StockWindow> = new Map();

            stocks.forEach(async (symbol: string) => {
                const stockWindow = new StockWindow(symbol);
                windowMap.set(symbol, stockWindow);
                await stockWindow.update();
            });
            // end todo

            document.querySelector('.grid-container')?.classList.add('active');
            document.querySelector('.search-container')?.classList.add('search-active');
        } else {
            // Show home page
            this.marketPB.getMarketProgress();
            document.querySelector('.grid-container')?.classList.remove('active');
        }
    }

    public addStock(symbol: string): void {
        const stockWindow = new StockWindow(symbol);
        this.windowMap.set(symbol, stockWindow);
        stockWindow.update();

        // Update URL
        history.pushState({}, '', '/stock-viewer');
        this.handleRoute();
    }
}

const app = new App();
