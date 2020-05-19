# Conceito

O Rakoon nasceu com o intuito de facilitar o processo de criação de Crawlers para a web com foco em execução em produção permitindo a execução agendada, de forma contínua e monitorada.

### Objetivos

* Facilitar o processo de criação de Crawlers
* Permitir agendamento da execução dos robôs
* Permitir a distribuição da carga em determinado período de tempo 
* Ter persistência das informações _out-of-the-box_ 
* Fácil exportação dos resultados em diversos formatos \(CSV, JSON, AWS S3\)
* ...

### Estágio do desenvolvimento

* [x] Criar camada de persistência
* [x] Criar os primeiros exportadores de dados
* [x] Criar a lógica inicial para execução dos robôs
* [ ] Criar serviço de agendamento de execução
* [ ] Criar serviço de distribuição de carga de execução
* [ ] ...

### Princípios para criação de Crawlers com o Rakoon

Para criar os robôs utilizando a biblioteca é preciso adotar um pensamento quanto a forma de criar os scripts.

A execução dos robôs acontece de forma bem definida. Primeiro os links são extraídos e na sequência, os detalhes dos links adquiridos na fase anterior são extraídos.

Dê uma olhada nos conceitos de forma mais detalhada:

{% page-ref page="funcionamento/extract-links.md" %}

{% page-ref page="funcionamento/extrair-detalhes.md" %}

### Estrutura do projeto \[Não terminado\]

```text
-src
    |- constants
    |- crawlers
        |- baseCrawler.ts
        |- index.ts
    |- data-exporters
    |- helpers
    |- loggers
    |- models
    |- index.ts
    |- errors.ts
    |- storage.ts
    |- manageProviders.ts
    |- ...
-dist

```



{% hint style="danger" %}
Esta documentação está em rascunho e mais informações serão adicionadas.
{% endhint %}

