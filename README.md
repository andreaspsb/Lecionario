# Lecionário Revisado Comum (RCL) em Português

Coleção de arquivos Markdown com as leituras do **Lecionário Revisado Comum** (*Revised Common Lectionary*) organizados por ano litúrgico, prontos para uso como devocionário ou material de estudo.

## Estrutura

```
ano-a/                  # Ano A (Mateus) — leituras dominicais
  advento/
  natal/
  epifania/
  quaresma/
  semana-santa/
  pascoa/
  tempo-comum/
ano-b/                  # Ano B (Marcos)
  ...
ano-c/                  # Ano C (Lucas)
  ...
sumario.md              # Índice das leituras dominicais

leituras-diarias/       # Leituras feriais (dias úteis)
  ano-a/
    advento/semana-1.md ... semana-4.md
    tempo-comum/semana-1.md ... semana-N.md
    ...
  ano-b/
  ano-c/
  sumario-diario.md     # Índice das leituras diárias
```

## Conteúdo

### Leituras Dominicais e Festivas

- **222 arquivos** de leituras litúrgicas
- **3 anos litúrgicos** completos (A, B, C)
- Cada arquivo inclui:
  - Antigo Testamento, Salmo, Novo Testamento e Evangelho
  - Seções para Reflexão e Oração
  - Frontmatter YAML com metadados

### Leituras Diárias (Feriais)

- **158 arquivos** — um por semana litúrgica, para os 3 anos
- Cada arquivo cobre 6 dias da semana (Qui–Sáb + Seg–Qua)
- **Tempo Comum**: inclui as duas vias de leitura:
  - **Via Semicontínua (SC)** — leitura contínua do AT
  - **Via Complementar (C)** — leituras tematicamente relacionadas ao domingo

## Ciclo dos Evangelhos

| Ano | Evangelho Principal | Período |
|-----|---------------------|---------|
| A   | Mateus              | 2025-26, 2028-29, 2031-32 |
| B   | Marcos              | 2026-27, 2029-30, 2032-33 |
| C   | Lucas               | 2027-28, 2030-31, 2033-34 |

## Como Gerar / Atualizar

```bash
cd scripts
npm install

# Leituras dominicais (222 arquivos em ano-a/, ano-b/, ano-c/)
npm run generate

# Leituras diárias (158 arquivos em leituras-diarias/)
npm run generate-daily
```

Os scripts recriamos todos os arquivos e os índices (`sumario.md` e `leituras-diarias/sumario-diario.md`).

## Fonte

As leituras seguem o *Revised Common Lectionary* publicado pela
[Consultation on Common Texts](https://www.commontexts.org/), com
referências adaptadas para o português.

## Ver Também

- [Sumário das leituras dominicais](sumario.md)
- [Sumário das leituras diárias](leituras-diarias/sumario-diario.md)
- [Vanderbilt Divinity Library — RCL](https://lectionary.library.vanderbilt.edu/)
