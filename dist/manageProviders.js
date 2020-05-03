"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const date_fns_1 = require("date-fns");
class ProviderManager {
    constructor(db, providersLimitsCollection = "providersLimits", providersLimitsHistory = "providersHistoryLimit") {
        this.db = db;
        this.providersLimitsCollection = providersLimitsCollection;
        this.providersLimitsHistory = providersLimitsHistory;
    }
    async getLimits(providerFilter) {
        return await this.db.collection(this.providersLimitsCollection).findOne(providerFilter);
    }
    async updateProviderLimitsHistory(providerFilter, amount) {
        return this.db.collection(this.providersLimitsHistory).updateOne(providerFilter, {
            $set: { provider: providerFilter.provider, date: date_fns_1.startOfDay(new Date()), lastUpdate: new Date() },
            $setOnInsert: { createdAt: new Date() },
            $inc: { usage: amount }
        }, { upsert: true });
    }
    async updateProviderLimits(providerId, amount) {
        // const providerToUpdate = <ProviderLimits>await this.db.collection(this.providersLimitsCollection).findOne(providerFilter)
        // if (providerFilter) {
        // } else {
        //     throw new Error(`ProviderLimit not found with the filter specified: ${JSON.stringify(providerFilter)}`)
        // }
        const updateResult = (await this.db.collection(this.providersLimitsCollection).findOneAndUpdate(providerId, { $inc: { used: amount, remaining: -amount } }, { returnOriginal: false }));
        if (!updateResult) {
            throw new Error("Couldn't  find the result to update.");
        }
        else if (updateResult.remaining < 0) {
            throw new Error("Provider limit reached. Should not make more requests");
        }
        else {
            return updateResult;
        }
    }
    async increaseCurrentDateUsage(providerLimitId, amount = 1) {
        try {
            const providerId = new mongodb_1.ObjectId(providerLimitId);
            await this.updateProviderLimitsHistory({ provider: providerId, date: { $lte: date_fns_1.endOfDay(new Date()), $gte: date_fns_1.startOfDay(new Date()) } }, amount);
            await this.updateProviderLimits({ _id: providerId }, amount);
        }
        catch (error) {
            throw error;
        }
    }
    async canMakeRequest(providerFilter) {
        let providerLimits = (await this.getLimits(providerFilter));
        if (providerLimits) {
            return providerFilter.remaining > 0;
        }
        else {
            throw new Error(`Couldn't find the provider with this filter: ${JSON.stringify(providerFilter)}`);
        }
    }
}
exports.ProviderManager = ProviderManager;
