"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
function setupDataExporterLogger() {
    winston_1.default.loggers.add("data-exporter", {
        format: winston_2.format.combine(winston_2.format.label({ label: "Data Exporter" }), winston_2.format.json()),
        transports: [
            new winston_1.default.transports.Console({ level: 'silly' }),
            new winston_1.default.transports.File({ filename: 'data-exporter.log' }),
        ]
    });
}
exports.setupDataExporterLogger = setupDataExporterLogger;
function setupCrawlerLogger() {
    winston_1.default.loggers.add("crawler", {
        format: winston_2.format.combine(winston_2.format.colorize(), winston_2.format.label({ label: "Crawler" }), 
        // format.json(),
        winston_2.format.prettyPrint(), winston_2.format.simple()),
        level: 'info',
        transports: [
            new winston_1.default.transports.Console({ level: 'debug' }),
            new winston_1.default.transports.File({ filename: 'crawler.log' }),
        ]
    });
    return 'crawler';
}
exports.setupCrawlerLogger = setupCrawlerLogger;
