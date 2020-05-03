export interface ILink {
    /** URL específica do site, geralmente url que leva diretamente aos detalhes do curso */
    url: string,
    /** URL do site base */
    source: string
    /** Data e hora de coleta da URL em UTC */
    extractedAt: Date | string,
    /** Flag para marcar um link como já utilizado ou não */
    used: boolean,
    /** Data e hora de utilização da URL em UTC */
    usedAt?: Date | string
}