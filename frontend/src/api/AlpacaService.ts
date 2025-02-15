import Alpaca from '@alpacahq/alpaca-trade-api';

export class AlpacaService {
    private alpaca: Alpaca;
    // only one instance should exist singleton pattern
    private static instance: AlpacaService;
    private static init = { init: false, initializing: false };
    private cachedStocks: unknown;
    private initializationPromise: Promise<unknown> | null = null;

    private constructor() {
        this.alpaca = new Alpaca({
            keyId: import.meta.env.VITE_API_KEY,
            secretKey: import.meta.env.VITE_SECRET,
            paper: true
        });


    }

    public static getInstance(): AlpacaService {
        if (!AlpacaService.instance) {
            AlpacaService.instance = new AlpacaService();
        }
        return AlpacaService.instance;
    }

    public get client(): Alpaca {
        return this.alpaca;
    }

    public get assets(): unknown {
        return this.cachedStocks;
    }

    public async fetchActiveStocks() {
        // If already initialized, return cached stocks
        if (AlpacaService.init.init) {
            return this.cachedStocks;
        }

        // If initialization is in progress, wait for it
        if (this.initializationPromise) {
            return await this.initializationPromise;
        }

        // Start initialization
        this.initializationPromise = this.initializeStocks();
        return await this.initializationPromise;
    }

    private async initializeStocks() {
        try {
            AlpacaService.init.initializing = true;
            this.cachedStocks = new Set(await this.getAssets());
            AlpacaService.init.init = true;
            return this.cachedStocks;
        } finally {
            AlpacaService.init.initializing = false;
            this.initializationPromise = null;
        }
    }

    private async getAssets(): Promise<Set<[]> | undefined> {
        try {
            const assets = await this.alpaca.getAssets({
                status: 'active',
                asset_class: 'us_equity'
            });
            this.cachedStocks = new Set(assets);
            console.log('cached stocks', this.cachedStocks)
            return assets;
        } catch {
            return undefined;
        }
    }
}
