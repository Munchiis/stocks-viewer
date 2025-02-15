import { AlpacaSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { AlpacaService } from './AlpacaService';


export async function getStockSnapshot(symbol: string): Promise<AlpacaSnapshot| {}> {
    try {
        const data = await AlpacaService.getInstance().client.getSnapshot(symbol);
        return data;
    } catch {
        return {}
    }
}
