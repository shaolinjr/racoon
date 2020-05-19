---
description: >-
  O primeiro passo na criação da lógica para extrair os resultados dos websites
  é criar a estratégia de extração de links
---

# Extrair Links

## Exemplo

Veja um exemplo da função de extrair links retirado de um Crawler criado anteriormente

```typescript
import { CrawlerRunOptions } from 'rakoon/dist/models'
import { BaseCrawler } from 'rakoon/dist/crawlers'
import { CrawlerStorage } from 'rakoon/dist/storage';

export class PharmacyCrawler extends BaseCrawler {
    private categories = ["alimentos", "bebe-e-gestante"]
    constructor(public storage: CrawlerStorage){ super(storage) }
    
    private async extractLinksFromCategory(category: string): Promise<string[]> {
        // Esta função busca os links específicos 
        // de cada categoria do site em questão
    }
    
    protected async extractLinks(options:ExtractLinksOptions){
        let links = []
        await Promise.map(this.categories, (category) => {
            const categoryLinks = this.extractLinksFromCategory(category)
            const rest = Helper.timeoutPromise(options.waitFor)
            return this.join(categoryLinks, rest, (categoryLinks, rest) => {
                return categoryLinks
            }).reflect()
        }, { concurrency: options.concurrency }).each((promise: Inspection<any>) => {
            if (promise.isFulfilled()) {
                links.push(...promise.value() || [])
            } else {
                console.error(`Couldn't extract links: ${JSON.stringify(promise.reason())}`)
            }
        })
        console.log(`Found ${links.length} in total for DrogaClara`)
        return links
    }
}
```

{% hint style="info" %}
 Super-powers are granted randomly so please submit an issue if you're not happy with yours.
{% endhint %}

Once you're strong enough, save the world:

{% code title="hello.sh" %}
```bash
# Ain't no code for that yet, sorry
echo 'You got to trust me on this, I saved the world'
```
{% endcode %}



