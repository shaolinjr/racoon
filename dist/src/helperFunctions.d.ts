export declare class Helper {
    constructor();
    static removeExtraSlashesFromUrl(url: string): string;
    static timeoutPromise(timeout: number): Promise<unknown>;
    static restartIndex(products: Array<any>, lastEAN: string | number): number;
    static createGTINWithZeros(ean: any): any;
    static stripLeftZerosFromGTIN(ean: string): string;
    static extractNumbersFromString(text: string): RegExpMatchArray;
    static extractPriceFromString(priceInText: string): number;
}
