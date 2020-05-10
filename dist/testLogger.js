"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const loggers_1 = require("./loggers");
const winston_2 = require("winston");
(() => {
    const loggerName = loggers_1.setupCrawlerLogger();
    const logger = winston_1.default.loggers.get(loggerName);
    const child = logger.child({
        format: winston_2.format.combine(winston_2.format.label({ label: "BaseCrawler > makeRequest: " }), 
        // format.logstash()
        winston_2.format.prettyPrint())
    });
    // logger.info("Testing parent logger from setupCrawlerLogger")
    child.info("Testing child infor log");
})();
