"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Helper {
    constructor() { }
    static removeExtraSlashesFromUrl(url) {
        return url.replace(/([^:]\/)\/+/g, "$1");
    }
    static async timeoutPromise(timeout) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }
    static restartIndex(products, lastEAN) {
        let index = products.findIndex(el => el.ean.toString() == lastEAN.toString());
        if (index >= 0) {
            return index;
        }
        return 0;
    }
    static createGTINWithZeros(ean) {
        let newEAN = ean.toString();
        while (newEAN.length < 14) {
            newEAN = "0" + newEAN;
        }
        return newEAN;
    }
    static stripLeftZerosFromGTIN(ean) {
        for (let i = 0; i < ean.length; i++) {
            if (ean[i] != "0") {
                ean = ean.slice(i);
                break;
            }
        }
        return ean;
    }
    // static readCSVFromFile(filePath: string, delimiter: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         csv.default({ delimiter }).fromFile(filePath)
    //             .then((result: any) => resolve(result))
    //     });
    // }
    static extractNumbersFromString(text) {
        const numbersOnly = new RegExp("[0-9]+", "g");
        return text.match(numbersOnly);
    }
    static extractPriceFromString(priceInText) {
        // Example: R$ 240,00 até 5 dia(s) antes do início do curso.
        const priceRegex = new RegExp("(?<price>(?:(?:[0-9]{1,3}[.]{1})+[0-9]{3,}|[0-9]+),[0-9]{2})");
        const match = priceInText.match(priceRegex);
        if (match) {
            return parseInt(match.groups.price.replace(/[,.]/g, "")) / 100;
        }
        else {
            return null;
        }
    }
}
exports.Helper = Helper;
