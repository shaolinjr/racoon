import { ObjectId } from 'mongodb'
export enum RenewalFrequencyEnum {
    MONTHLY = "MONTHLY",
    WEEKLY = "WEEKLY",
    DAILY = "DAILY",
    ONE_TIME = "ONE_TIME"
}

export interface ProviderLimits {
    _id?: ObjectId,
    provider: { name: string, url: string },
    totalAmount: number,
    used: number,
    remaining: number,
    renewal: { frequency: RenewalFrequencyEnum, lastRenewal: Date | string | null, nextRenewal: Date | string | null },
    activePeriod: { startDate: Date | string, endDate: Date | string },
    active: boolean
}