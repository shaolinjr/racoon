import * as csv from 'csvtojson'

export class Helper {

    constructor() { }

    static removeExtraSlashesFromUrl(url: string) {
        return url.replace(/([^:]\/)\/+/g, "$1")
    }

    static async timeoutPromise(timeout: number) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    static restartIndex(products: Array<any>, lastEAN: string | number) {
        let index = products.findIndex(el => el.ean.toString() == lastEAN.toString());
        if (index >= 0) {
            return index
        }
        return 0
    }

    static createGTINWithZeros(ean: any) {
        let newEAN = ean.toString();
        while (newEAN.length < 14) {
            newEAN = "0" + newEAN;
        }
        return newEAN;
    }

    static stripLeftZerosFromGTIN(ean: string) {
        for (let i = 0; i < ean.length; i++) {
            if (ean[i] != "0") {
                ean = ean.slice(i)
                break
            }
        }
        return ean
    }


    // static readCSVFromFile(filePath: string, delimiter: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         csv.default({ delimiter }).fromFile(filePath)
    //             .then((result: any) => resolve(result))
    //     });
    // }
    static extractNumbersFromString(text: string) {
        const numbersOnly = new RegExp("[0-9]+", "g")
        return text.match(numbersOnly)
    }

    static extractPriceFromString(priceInText: string): number {
        // Example: R$ 240,00 até 5 dia(s) antes do início do curso.
        const priceRegex = new RegExp("(?<price>(?:(?:[0-9]{1,3}[.]{1})+[0-9]{3,}|[0-9]+),[0-9]{2})")
        const match = priceInText.match(priceRegex)
        if (match) {
            return parseInt(match.groups.price.replace(/[,.]/g, "")) / 100
        } else {
            return null
        }
    }
}