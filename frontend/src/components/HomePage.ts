import { AlpacaService } from "../api/AlpacaService";
import { debounce } from '../utils/debug/logger';
import { CustomDropDown } from "./CustomDropdown";


export class HomePage {
    private container: HTMLElement;
    private alpacaService: AlpacaService;
    // Add two maps for dual indexing
    private symbolMap: Map<string, any> = new Map();
    private nameMap: Map<string, any> = new Map();

    constructor() {
        this.alpacaService = AlpacaService.getInstance();
        this.container = document.createElement('div');
        this.container.id = 'home'
        this.container.className = 'h-screen w-screen flex flex-col justify-center items-center';
        this.init();

    }

    private async init() {
        this.render();
        const stocks = await this.alpacaService.fetchActiveStocks() as Set<any>;
        if (this.symbolMap.size === 0) {
            stocks.forEach(stock => {
                const stockData = {
                    symbol: stock.symbol,
                    name: stock.name,
                    exchange: stock.exchange,
                    id: stock.id
                };
                this.symbolMap.set(stock.symbol, stockData);
                this.nameMap.set(stock.name.toUpperCase(), stockData);
            });
        }

    }

    private render() {
        this.container.innerHTML = `
        <h1 id="title" class="w-full max-w-3/5 xl:max-w-2/5 text-2xl md:text-4xl font-black mb-8 text-center bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform transition-all duration-300  uppercase tracking-wider">stock viewer</h1>
            <div id="search-container" class="w-full max-w-3/5 xl:max-w-2/5">
                <input autofocus type="text" id="stock-search" placeholder="Search for a stock..."
                 class="w-full p-4 text-xl md:text-2xl border-4 border-black text-center sm:text-left bg-white placeholder:text-gray-800 placeholder:font-bold focus:outline-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                 autocomplete="off">
                 <div id='search-results' class="select-dropdown translate-x-2 translate-y-1"></div
                 </div>
        `;

        document.getElementById('app')?.appendChild(this.container);
        this.setupListeners();
    }


    private setupListeners(): void {
        const input = document.getElementById('stock-search') as HTMLInputElement;
        const autocompleteResults = document.getElementById('search-results') as HTMLDivElement;
        input.addEventListener('focus', () => {
            input.classList.add('search-active');
        });

        const handleSearch = debounce(async (e: Event) => {
            autocompleteResults.innerHTML = ''

            const searchTerm = (e.target as HTMLInputElement).value.toUpperCase();
            if (searchTerm.length > 0) {
                const matchesMap = new Map();
                let matchCount = 0;
                const MAX_MATCHES = 10;

                this.symbolMap.forEach((value, key) => {
                    if (matchCount >= MAX_MATCHES) return;
                    if (key.includes(searchTerm)) {
                        matchesMap.set(value.id, value);
                        matchCount++;
                    }
                });

                if (matchCount < MAX_MATCHES) {
                    this.nameMap.forEach((value, key) => {
                        if (matchCount >= MAX_MATCHES) return;
                        if (key.includes(searchTerm)) {
                            matchesMap.set(value.id, value);
                            matchCount++;
                        }
                    });
                }

                matchesMap.forEach((match) => {
                    const autocompleteOption = new CustomDropDown(match.symbol, match.name, match.id);
                    console.log(autocompleteOption);
                    autocompleteResults.appendChild(autocompleteOption.getDiv());
                })
            }
        }, 300);

        input.addEventListener('input', handleSearch);
    }



}
