export declare function removeExtraSlashesFromUrl(url: string): string;
export declare function timeoutPromise(timeout: number): Promise<unknown>;
export declare function restartIndex(products: Array<any>, lastEAN: string | number): number;
export declare function createGTINWithZeros(ean: any): any;
export declare function stripLeftZerosFromGTIN(ean: string): string;
export declare function readCSVFromFile(filePath: string, delimiter: string): Promise<any>;
export declare function extractNumbersFromString(text: string): RegExpMatchArray;
export declare function extractPriceFromString(priceInText: string): number;
