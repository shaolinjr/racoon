import winston from 'winston'
import { format } from 'winston'


export function setupDataExporterLogger() {
    winston.loggers.add("data-exporter", {
        format: format.combine(
            format.label({ label: "Data Exporter" }),
            format.json()
        ),
        transports: [
            new winston.transports.Console({ level: 'silly' }),
            new winston.transports.File({ filename: 'data-exporter.log' }),
        ]
    })

}

export function setupCrawlerLogger() {
    winston.loggers.add("crawler", {
        format: format.combine(
            format.colorize(),
            format.label({ label: "Crawler" }),
            // format.json(),
            format.prettyPrint(),
            format.simple()
        ),
        level: 'info',
        transports: [
            new winston.transports.Console({ level: 'debug' }),
            new winston.transports.File({ filename: 'crawler.log' }),
        ]
    })
    return 'crawler'
}

