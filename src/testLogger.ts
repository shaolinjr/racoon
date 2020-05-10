import winston from 'winston'
import { setupCrawlerLogger } from './loggers'
import { format } from 'winston'

(() => {
    const loggerName = setupCrawlerLogger()
    const logger = winston.loggers.get(loggerName)
    const child = logger.child({
        format: format.combine(
            format.label({ label: "BaseCrawler > makeRequest: " }),
            // format.logstash()
            format.prettyPrint()
        )
    })

    // logger.info("Testing parent logger from setupCrawlerLogger")
    child.info("Testing child infor log")
})()