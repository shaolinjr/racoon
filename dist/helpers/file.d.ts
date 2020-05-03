import { FILE_EXTENSIONS } from '../constants/fileExtensions.constants';
export declare function fileExists(filePath: string): boolean;
export declare function validFileExtension(filePath: string, allowedExtensions: FILE_EXTENSIONS[]): boolean;
export declare function getFileExtension(filePath: string): string;
export declare function checkFile(filePath: string, allowedExtensions: FILE_EXTENSIONS[]): void;
