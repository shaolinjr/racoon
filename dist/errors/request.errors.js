"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmptyResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, EmptyResponseError);
    }
}
exports.EmptyResponseError = EmptyResponseError;
