import * as fs from 'fs'
import * as path from 'path'
import { FILE_EXTENSIONS } from '../constants/fileExtensions.constants'


export function fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
}

export function validFileExtension(filePath: string, allowedExtensions: FILE_EXTENSIONS[]): boolean {
    return allowedExtensions.includes(path.extname(filePath) as FILE_EXTENSIONS)
}

export function getFileExtension(filePath: string): string {
    return path.extname(filePath)
}

export function checkFile(filePath: string, allowedExtensions: FILE_EXTENSIONS[]) {
    if (!fileExists(filePath)) {
        throw new Error("Make sure the file provided exists")
    } else if (!validFileExtension(filePath, allowedExtensions)) {
        throw new Error(`File format not allowed. The allowed extensions are: ${allowedExtensions.join(", ")}`)
    }
}