---
description: Após extrair os links é necessário extrair os detalhes de cada link
---

# Extrair Detalhes

## Exemplo

Veja um exemplo mais detalhado, sendo uma continuação do exemplo visto em[ Extrair Links](extract-links.md):

```typescript
import { CrawlerRunOptions } from 'rakoon/dist/models'
import { BaseCrawler } from 'rakoon/dist/crawlers'
import { CrawlerStorage } from 'rakoon/dist/storage';

export class PharmacyCrawler extends BaseCrawler {
    private categories = ["alimentos", "bebe-e-gestante"]
    constructor(public storage: CrawlerStorage){ super(storage) }
    
    /* Codigo de extrair links ocultado
    * this.SELECTORS foi ocultado para facilitar a clareza.
    * Imagine que this.SELECTORS é um objeto com atributos
    * com valores de seletores HTML utilizados para extrair
    * cada informação que esteja sendo buscada.
    */
    async extractDetails(url: string): Promise<WebProduct> {
        try {
            const response = await this.makeRequest(`${url}`)
            let $ = cheerio.load(response)
            const name = $(this.SELECTORS.productName).text()
            const oldPrice = Helper.extractPriceFromString(($(this.SELECTORS.oldPrice).eq(0).text() || "0"))
            const regularPrice = $(this.SELECTORS.regularPrice).eq(0).text() || "0"
            const productId = Helper.extractNumbersFromString($(this.SELECTORS.productId).text() || "")
            const brand = $(this.SELECTORS.brand).eq(0).text()
            let prod:any = { name, regularPrice, productId: productId ? +productId[0] : null, url, brand}

            return prod
        } catch (error) {
            console.log("Could not fetch details for this link")
            console.log("Look at this error: ", error)
        }
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



