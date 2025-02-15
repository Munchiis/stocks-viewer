import { AlpacaSnapshot } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2";
import { getStockSnapshot } from "../api/stockApi";
import { priceChange } from "../utils/calculations";
import { logger } from "../utils/debug/logger";

export class StockWindow {
    private symbol: string;

    constructor(symbol: string) {
        this.symbol = symbol;
        this.mount();
    }

    private mount(): void {
        const container: HTMLElement | null = document.querySelector(".grid-container");
        if (container) {
            container.insertAdjacentHTML("beforeend", this.render());
            this.setupWindowControlListeners();
            this.setupDragListeners();
        }
    }

    private render(): string {
        return `
        <article id="stock-window-${this.symbol}" class="stock-window bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none" draggable="true">
            <header class="window-header flex justify-between items-center border-b-4 border-black p-2 m-4 bg-pink-100">
                <h3 class="text-2xl font-black tracking-wide">${this.symbol}</h3>
                <nav class="window-controls" aria-label="Window controls">
                    <button type="button" class="control-btn close w-8 h-8 flex items-center justify-center bg-white border-2 border-black hover:bg-pink-200 transition-colors duration-200" aria-label="Close window">
                        <span aria-hidden="true" class="text-xl font-bold">×</span>
                    </button>
                </nav>
            </header>
            <main class="chart-container p-2">
                <section class="stock-overview space-y-2 text-lg font-bold"></section>
            </main>
        </article>`;
    }

    public async update(): Promise<void> {
        const stockData = await getStockSnapshot(this.symbol) as AlpacaSnapshot;
        const currentPrice: number = stockData.LatestTrade.Price;
        const closePrice: number = stockData.PrevDailyBar.ClosePrice;
        const [change, positiveChange] = priceChange(currentPrice, closePrice);
        const style: string = `class="transition-colors duration-200 ${positiveChange ? "text-green-600" : "text-red-600"} font-black"`;
        const chartContainer: HTMLElement | null = document.querySelector(
            `#stock-window-${this.symbol} .chart-container > .stock-overview`
        );

        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="p-2 border-2 border-black bg-gray-50">Current Price: ${currentPrice}</div>
                <div ${style}>Change: ${change}%</div>
                <div class="p-2 border-2 border-black bg-gray-50">Low: ${stockData.DailyBar.LowPrice}</div>
                <div class="p-2 border-2 border-black bg-gray-50">High: ${stockData.DailyBar.HighPrice}</div>
                <div class="p-2 border-2 border-black bg-gray-50">Open Price: ${stockData.DailyBar.OpenPrice}</div>
                <div class="p-2 border-2 border-black bg-gray-50">Closing Price: ${closePrice}</div>
            `;
        }
    }

    public destroy(): void {
        const container: HTMLElement | null = document.querySelector(".grid-container");
        const element: HTMLElement | null = document.querySelector(`#stock-window-${this.symbol}`);
        if (container && element) {
            container.removeChild(element);
        }
    }

    private setupDragListeners(): void {
        const windowElement: HTMLElement | null = document.querySelector(
            `#stock-window-${this.symbol}`
        );

        if (!windowElement) return;

        windowElement.addEventListener('drag', (e: DragEvent) => {
            logger.delay('drag: curr', e.currentTarget, "--targe", e.target);
        });

        windowElement.addEventListener("dragstart", (e: DragEvent) => {
            if (!e.dataTransfer) return;

            e.dataTransfer.clearData();
            e.dataTransfer.setData("windowId", (e.target as HTMLElement).id);
            e.dataTransfer.effectAllowed = "move";
            (e.target as HTMLElement).classList.add('dragging');
            logger.delay('dragstart: curr', e.currentTarget, '\n-- target', e.target);
        });

        windowElement.addEventListener("dragover", (e: DragEvent) => {
            e.preventDefault();
            logger.delay('dragover: curr', e.currentTarget, '\n-- target', e.target);
        });

        window.addEventListener("dragenter", (e: DragEvent) => {
            const target = e.target as HTMLElement;
            const stwin = target.closest('.stock-window');
            if (stwin && !target.classList.contains('.dragging')) {
                target.closest('.stock-window')?.classList.add('drop-zone', 'drop-zone-dry-run');
            }
            logger.delay('dragenter: curr', e.currentTarget, '\n-- target', e.target);
        });

        window.addEventListener('dragleave', (e: DragEvent) => {
            logger.delay('dragleave: curr', e.currentTarget, '\n-- target', e.target);
            (e.target as HTMLElement).classList.remove('drop-zone', 'drop-zone-dry-run');
        });

        windowElement.addEventListener("drop", (e: DragEvent) => {
            e.preventDefault();
            if (!e.dataTransfer) return;

            const elementBeingDragged = document.getElementById(
                e.dataTransfer.getData("windowId")
            );
            const dropTargetElement = e.currentTarget as HTMLElement;

            if (!elementBeingDragged || !dropTargetElement) return;

            const originalPositions = {
                dragged: {
                    parent: elementBeingDragged.parentNode,
                    nextSibling: elementBeingDragged.nextElementSibling
                },
                target: {
                    parent: dropTargetElement.parentNode,
                    nextSibling: dropTargetElement.nextElementSibling
                }
            };

            if (originalPositions.target.parent) {
                originalPositions.target.parent.insertBefore(
                    elementBeingDragged,
                    dropTargetElement
                );
            }

            if (originalPositions.dragged.parent) {
                originalPositions.dragged.parent.insertBefore(
                    dropTargetElement,
                    originalPositions.dragged.nextSibling
                );
            }

            (e.target as HTMLElement).classList.remove('drop-zone');
        });

        windowElement.addEventListener("dragend", (e: DragEvent) => {
            (e.target as HTMLElement).classList.remove('dragging', 'drop-zone');
            logger.delay('dragend: curr', e.currentTarget, '\n-- target', e.target);
        });
    }

    private setupWindowControlListeners(): void {
        const windowElement: HTMLElement | null = document.querySelector(`#stock-window-${this.symbol} .window-controls`);
        windowElement?.querySelector('.close')?.addEventListener('click', () => {
            this.destroy();
        });
    }
}
