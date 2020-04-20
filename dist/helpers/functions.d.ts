export declare function removeExtraSlashesFromUrl(url: string): string;
export declare function timeoutPromise(timeout: number): Promise<unknown>;
export declare function restartIndex(products: Array<any>, lastEAN: string | number): number;
export declare function createGTINWithZeros(ean: any): any;
export declare function stripLeftZerosFromGTIN(ean: string): string;
export declare function readCSVFromFile(filePath: string, delimiter: string): Promise<any>;
export declare function extractNumbersFromString(text: string): RegExpMatchArray;
export declare function extractPriceFromString(priceInText: string): number;
/**
 * This function will trigger a automatic scroll on the page and will stop when it reaches the bottom
 * @param page {puppeteer.Page} Puppeteer Page instance
 * @param distanceToScroll {number} Distance in pixels to scroll the page per cycle
 * @param speed {number} Control how fast the page is scrolled (in ms)
 */
export declare function autoScroll(page: any, distanceToScroll: number, speed: number): Promise<void>;
export declare function extractHoursAmountFromString(text: string): number;
export declare function extractDurationFromString(text: string): number;
