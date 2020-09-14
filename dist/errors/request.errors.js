"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyResponseError = void 0;
class EmptyResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, EmptyResponseError);
    }
}
exports.EmptyResponseError = EmptyResponseError;
