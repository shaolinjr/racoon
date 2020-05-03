import { ObjectId } from "mongodb";
import { ProviderLimits } from "./providerLimits.model";

export interface ProviderLimitsHistory {
    _id?: ObjectId,
    provider: ProviderLimits | ObjectId,
    date: Date | string,
    usage: number,
    createdAt: Date,
    lastUpdate: Date
}