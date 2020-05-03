import { Db } from 'mongodb';
import { ProviderLimits } from "./models";
export declare class ProviderManager {
    private db;
    private providersLimitsCollection;
    private providersLimitsHistory;
    constructor(db: Db, providersLimitsCollection?: string, providersLimitsHistory?: string);
    getLimits(providerFilter: any): Promise<ProviderLimits>;
    private updateProviderLimitsHistory;
    private updateProviderLimits;
    increaseCurrentDateUsage(providerLimitId: string, amount?: number): Promise<void>;
    canMakeRequest(providerFilter: any): Promise<boolean>;
}
