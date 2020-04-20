import * as csv from 'csvtojson'

export function removeExtraSlashesFromUrl(url: string) {
    return url.replace(/([^:]\/)\/+/g, "$1")
}

export async function timeoutPromise(timeout: number) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export function restartIndex(products: Array<any>, lastEAN: string | number) {
    let index = products.findIndex(el => el.ean.toString() == lastEAN.toString());
    if (index >= 0) {
        return index
    }
    return 0
}

export function createGTINWithZeros(ean: any) {
    let newEAN = ean.toString();
    while (newEAN.length < 14) {
        newEAN = "0" + newEAN;
    }
    return newEAN;
}

export function stripLeftZerosFromGTIN(ean: string) {
    for (let i = 0; i < ean.length; i++) {
        if (ean[i] != "0") {
            ean = ean.slice(i)
            break
        }
    }
    return ean
}


export function readCSVFromFile(filePath: string, delimiter: string): Promise<any> {
    return new Promise((resolve, reject) => {
        csv.default({ delimiter }).fromFile(filePath)
            .then((result: any) => resolve(result))
    });
}

export function extractNumbersFromString(text: string) {
    const numbersOnly = new RegExp("[0-9]+", "g")
    return text.match(numbersOnly)
}

export function extractPriceFromString(priceInText: string): number {
    // Example: R$ 240,00 até 5 dia(s) antes do início do curso.
    const priceRegex = new RegExp("(?<price>(?:(?:[0-9]{1,3}[.]{1})+[0-9]{3,}|[0-9]+),[0-9]{2})")
    const match = priceInText.match(priceRegex)
    if (match) {
        const price = priceRegex.exec(priceInText).groups.price
        return parseInt(price.replace(/[,.]/g, "")) / 100
    } else {
        return null
    }
}

/**
 * This function will trigger a automatic scroll on the page and will stop when it reaches the bottom
 * @param page {puppeteer.Page} Puppeteer Page instance
 * @param distanceToScroll {number} Distance in pixels to scroll the page per cycle
 * @param speed {number} Control how fast the page is scrolled (in ms)
 */
export async function autoScroll(page: any, distanceToScroll: number, speed: number) {
    await page.evaluate(async (speed, distanceToScroll) => {
        await new Promise((resolve, reject) => {
            let scrolledHeight = 0;
            const timer = setInterval(() => {
                var windowScrollHeight = document.body.scrollHeight;
                console.log("WindowHeight: ", windowScrollHeight)
                window.scrollBy(0, distanceToScroll)
                scrolledHeight += distanceToScroll
                if (scrolledHeight >= windowScrollHeight) {
                    clearInterval(timer)
                    resolve()
                }
            }, speed);
        });
    }, speed, distanceToScroll);
}

// This function can be in the rakoon helper
export function extractHoursAmountFromString(text: string): number {
    // 440 h – 12 meses
    // 12 meses - 400h
    let hoursPattern = new RegExp("(?:(?<hours>[0-9]+)\\s*h)", "gi")
    let result = hoursPattern.exec(text)
    if (result) {
        return parseInt(result.groups.hours)
    }
    return null
}
// This function can be in the rakoon helper
export function extractDurationFromString(text: string): number {
    // 440 h – 12 meses
    // 12 meses - 400h
    let durationPattern = new RegExp("(?<months>[0-9]+)\\s*m(?:ês|eses)", "gi")
    let result = durationPattern.exec(text)
    if (result) {
        return parseInt(result.groups.months)
    }
    return null
}