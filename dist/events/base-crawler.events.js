"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrawlerEvents = exports.BaseCrawlerEmitter = void 0;
const events_1 = require("events");
class BaseCrawlerEmitter extends events_1.EventEmitter {
}
exports.BaseCrawlerEmitter = BaseCrawlerEmitter;
exports.BaseCrawlerEvents = new BaseCrawlerEmitter();
