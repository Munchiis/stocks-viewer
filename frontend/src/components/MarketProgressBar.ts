import Alpaca from "@alpacahq/alpaca-trade-api";
import { AlpacaService } from "../api/AlpacaService";


export class MarketProgressBar {
    private alpaca: Alpaca;

    constructor () {
        this.alpaca = AlpacaService.getInstance().client;
    }

    async getMarketProgress(): Promise<{
        percentage: number,
        isOpen: boolean
    }> {
        const clock = await this.alpaca.getClock();

        if (!clock.is_open) {
            return {percentage: 100, isOpen: false}
        }
        const openTime = new Date(clock.next_open).getTime();
        const closeTime = new Date(clock.next_close).getTime();
        const currentTime = new Date().getTime();
        const totalDuration = closeTime - openTime;
        const elapsedTime = currentTime - openTime;
        const percentage = Math.min(
            Math.round((elapsedTime / totalDuration) * 10000) / 100,
            100
        );

        console.log('MarketPB', clock, percentage)
        return {percentage, isOpen: true}
    }
}