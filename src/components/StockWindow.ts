import { getStockSnapshot } from "../api/stockApi";
import { priceChange } from "../utils/calculations";
import { logger } from "../utils/debug/logger";
import { StockData } from "../utils/types/stock";

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
        <article id="stock-window-${this.symbol}" class="stock-window" draggable="true">
            <header class="window-header">
                <h3>${this.symbol}</h3>
                <nav class="window-controls" aria-label="Window controls">
                <button type="button" class="control-btn close" aria-label="Close window">
                    <span aria-hidden="true">×</span>
                </button>
                </nav>
            </header>
            <main class="chart-container">
                <section class="stock-overview"></section>
            </main>
        </article>`;
    }

    public async update(): Promise<void> {
        const stockData: StockData = await getStockSnapshot(this.symbol);
        const currentPrice: number = stockData.latestTrade.p;
        const closePrice: number = stockData.prevDailyBar.c;
        const [change, positiveChange] = priceChange(currentPrice, closePrice);
        const style: string = `style="color:${positiveChange ? "green" : "red"}"`;
        const chartContainer: HTMLElement | null = document.querySelector(
            `#stock-window-${this.symbol} .chart-container > .stock-overview`
        );

        if (chartContainer) {
            chartContainer.innerHTML = `
                <div>Current Price: ${currentPrice}</div>
                <div ${style}>Change: ${change}%</div>
                <div>Low: ${stockData.dailyBar.l}</div>
                <div>High: ${stockData.dailyBar.h}</div>
                <div>Open Price: ${stockData.dailyBar.o}</div>
                <div>Closing Price: ${closePrice}</div>
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
