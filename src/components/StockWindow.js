import { getStockSnapshot } from "../api/stockApi.js";
import { priceChange } from "../utils/calculations.js";
import { logger } from "../utils/debug/logger.js";

export class StockWindow {
    constructor(symbol) {
        this.symbol = symbol;

        this.mount();
    }
    mount() {
        const container = document.querySelector(".grid-container");
        container.insertAdjacentHTML("beforeend", this.render());
        this.setupWindowControlListeners();
        this.setupDragListeners();
    }
    render() {
        /*
         <button type="button" class="control-btn minimize" aria-label="Minimize window">
                    <span aria-hidden="true">−</span>
        </button>
        <button type="button" class="control-btn maximize" aria-label="Maximize window">
            <span aria-hidden="true">□</span>
        </button>
        */
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

    async update() {
        const stockData = await getStockSnapshot(this.symbol);
        const currentPrice = stockData.latestTrade.p;
        const closePrice = stockData.prevDailyBar.c;
        const [change, positiveChange] = priceChange(currentPrice, closePrice);
        const style = `style="color:${positiveChange ? "green" : "red"}"`;
        const chartContainer = document.querySelector(
            `#stock-window-${this.symbol} .chart-container > .stock-overview`
        );
        chartContainer.innerHTML = `
            <div>Current Price: ${currentPrice}</div>
            <div ${style}>Change: ${change}%</div>
            <div>Low: ${stockData.dailyBar.l}</div>
            <div>High: ${stockData.dailyBar.h}</div>
            <div>Open Price: ${stockData.dailyBar.o}</div>
            <div>Closing Price: ${closePrice}</div>
        `;
    }

    destroy() {
        document
            .querySelector(".grid-container")
            .removeChild(document.querySelector(`#stock-window-${this.symbol}`));
    }

    setupDragListeners() {
        const windowElement = document.querySelector(
            `#stock-window-${this.symbol}`
        );
        windowElement.addEventListener('drag', (e) => {
            logger.delay('drag: curr', e.currentTarget, "--targe", e.target)
        })

        windowElement.addEventListener("dragstart", (e) => {
            e.dataTransfer.clearData();
            e.dataTransfer.setData("windowId", e.target.id);
            e.dataTransfer.effectAllowed = "move";
            e.target.classList.add('dragging');
            logger.delay('dragstart: curr', e.currentTarget, '\n-- target', e.target);
        });


        windowElement.addEventListener("dragover", (e) => {
            // signal that other elements are valid drop targets
            e.preventDefault();
            logger.delay('dragover: curr', e.currentTarget, '\n-- target', e.target)
        });

        window.addEventListener("dragenter", (e) => {
            const stwin = e.target.closest('.stock-window') || undefined;
            if (stwin && !e.target.classList.contains('.dragging')) {
                e.target.closest('.stock-window').classList.add('drop-zone', 'drop-zone-dry-run')
            }
            logger.delay('dragenter: curr', e.currentTarget, '\n-- target', e.target)
        })
        window.addEventListener('dragleave', (e) => {
            logger.delay('dragleave: curr', e.currentTarget, '\n-- target', e.target)
            e.target.classList.remove('drop-zone', 'drop-zone-dry-run');
        })
        windowElement.addEventListener("drop", (e) => {
            e.preventDefault();
            const elementBeingDragged = document.getElementById(
                e.dataTransfer.getData("windowId")
            );
            const dropTargetElement = e.currentTarget;
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
            originalPositions.target.parent.insertBefore(
                elementBeingDragged,
                dropTargetElement
            );
            originalPositions.dragged.parent.insertBefore(
                dropTargetElement,
                originalPositions.dragged.nextSibling
            );
            e.target.classList.remove('drop-zone');
        });

        windowElement.addEventListener("dragend", (e) => {
            e.target.classList.remove('dragging', 'drop-zone')
            logger.delay('dragend: curr', e.currentTarget, '\n-- target', e.target)
        });
    }

    setupWindowControlListeners() {
        const window = document.querySelector(`#stock-window-${this.symbol} .window-controls`);
        window.querySelector('.close').addEventListener('click', (e) => {
            this.destroy()
        })
    }
}
