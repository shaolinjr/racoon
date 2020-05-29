import { EventEmitter } from 'events'

export class BaseCrawlerEmitter extends EventEmitter { }

export const BaseCrawlerEvents = new BaseCrawlerEmitter()