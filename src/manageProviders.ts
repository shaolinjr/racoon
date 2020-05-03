import { CrawlerStorage } from "./storage";
import { Db, ObjectId } from 'mongodb'
import { ProviderLimits } from "./models";

import { endOfDay, startOfDay } from 'date-fns'


export class ProviderManager {

    constructor(private db: Db, private providersLimitsCollection: string = "providersLimits", private providersLimitsHistory: string = "providersHistoryLimit", ) { }

    public async getLimits(providerFilter): Promise<ProviderLimits> {
        return <ProviderLimits>await this.db.collection(this.providersLimitsCollection).findOne(providerFilter)
    }

    private async updateProviderLimitsHistory(providerFilter: Partial<{ provider: ObjectId, date: any }>, amount: number) {
        return this.db.collection(this.providersLimitsHistory).updateOne(
            providerFilter,
            {
                $set: { provider: providerFilter.provider, date: startOfDay(new Date()), lastUpdate: new Date() },
                $setOnInsert: { createdAt: new Date() },
                $inc: { usage: amount }
            },
            { upsert: true })
    }

    private async updateProviderLimits(providerId: { _id: ObjectId }, amount: number) {
        // const providerToUpdate = <ProviderLimits>await this.db.collection(this.providersLimitsCollection).findOne(providerFilter)
        // if (providerFilter) {

        // } else {
        //     throw new Error(`ProviderLimit not found with the filter specified: ${JSON.stringify(providerFilter)}`)
        // }
        const updateResult = <ProviderLimits>(await this.db.collection(this.providersLimitsCollection).findOneAndUpdate(
            providerId,
            { $inc: { used: amount, remaining: -amount } },
            { returnOriginal: false }))

        if (!updateResult) {
            throw new Error("Couldn't  find the result to update.")
        }
        else if (updateResult.remaining < 0) {
            throw new Error("Provider limit reached. Should not make more requests")
        } else {
            return updateResult
        }
    }

    public async increaseCurrentDateUsage(providerLimitId: string, amount: number = 1) {
        try {
            const providerId = new ObjectId(providerLimitId)
            await this.updateProviderLimitsHistory({ provider: providerId, date: { $lte: endOfDay(new Date()), $gte: startOfDay(new Date()) } }, amount)
            await this.updateProviderLimits({ _id: providerId }, amount)
        } catch (error) {
            throw error
        }
    }

    public async canMakeRequest(providerFilter): Promise<boolean> {
        let providerLimits: ProviderLimits = <ProviderLimits>(await this.getLimits(providerFilter))
        if (providerLimits) {
            return providerFilter.remaining > 0
        } else {
            throw new Error(`Couldn't find the provider with this filter: ${JSON.stringify(providerFilter)}`)
        }
    }
}