# Lecionário Comum Revisado (RCL) em Português

Site estático com as leituras do **Lecionário Comum Revisado** (*Revised Common Lectionary*) em português, organizado em três anos litúrgicos (A, B, C). Inclui leituras dominicais, festivas e feriais com busca full-text integrada.

🔗 **[andreaspsb.github.io/Lecionario](https://andreaspsb.github.io/Lecionario)**

## Funcionalidades

- **Página inicial** — exibe a leitura litúrgica corrente ou o domingo mais recente
- **Próximos 7 dias** — atalhos na home para leituras próximas por data
- **Hoje** — redireciona para a leitura calculada para a data atual
- **Data** — seletor de data para localizar a leitura correspondente
- **Navegar** — índice completo por ano e estação, com badges de cores litúrgicas
- **Buscar** — busca full-text em todos os 1097 arquivos de leituras (Pagefind)
- **Tema dark** com cores litúrgicas por estação (roxo, branco, vermelho, verde)
- **Deploy automático** para GitHub Pages via GitHub Actions

## Conteúdo

| Tipo | Arquivos | Descrição |
|------|----------|-----------|
| Leituras dominicais e festivas | 222 | AT, Salmo, NT e Evangelho por domingo/festa |
| Leituras feriais (seg–sáb) | 875 | Tempo Comum com vias Semicontínua e Complementar |

**3 anos litúrgicos completos:**

| Ano | Evangelho | Ciclos |
|-----|-----------|--------|
| A | Mateus | 2025-26, 2028-29, 2031-32 |
| B | Marcos | 2026-27, 2029-30, 2032-33 |
| C | Lucas | 2027-28, 2030-31, 2033-34 |

## Estrutura do Repositório

```
ano-a/ ano-b/ ano-c/     # Arquivos .md das leituras (Astro content collection)
  advento/
  natal/
  epifania/
  quaresma/
  semana-santa/
  pascoa/
  tempo-comum/
sumario.md               # Índice completo (fonte de verdade da ordenação)
src/                     # Interface web (Astro + Tailwind)
  pages/
    index.astro          # Home — dia litúrgico atual
    hoje.astro           # Redirecionamento para a leitura de hoje
    data.astro           # Consulta por data
    navegar.astro        # Índice por ano/estação
    buscar.astro         # Busca full-text (Pagefind)
    leitura/[...slug]    # Página individual de leitura
  lib/
    liturgicalCalendar.ts  # Cálculo de Páscoa, ano litúrgico, dia atual
    dateNavigation.ts      # Consulta por data e próximos dias
    sumarioParser.ts       # Parse do sumario.md para navegação anterior/próximo
scripts/                 # Gerador de conteúdo (Node + TypeScript)
  src/
    generate.ts          # Gera 222 arquivos dominicais
    generate-daily.ts    # Gera 875 arquivos feriais (API Vanderbilt)
    fix-reflexao.ts      # Adiciona seção ## Reflexão (idempotente)
    format-reflexao.ts   # Insere/reformata texto devocional
```

## Stack Técnica

- **[Astro](https://astro.build/)** — SSG (Static Site Generation)
- **[Tailwind CSS](https://tailwindcss.com/)** 4 via `@tailwindcss/vite` + `@tailwindcss/typography`
- **[Pagefind](https://pagefind.app/)** — busca full-text em build time, zero servidor
- **GitHub Pages** — deploy via GitHub Actions

## Desenvolvimento

```bash
# Interface web
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build + indexação Pagefind
npm run preview  # preview do build

# Scripts de conteúdo (executar a partir de scripts/)
cd scripts
npm install
npm run generate        # gera 222 arquivos dominicais
npm run generate-daily  # gera 875 arquivos feriais (lento — chama API Vanderbilt)
npm run fix-reflexao    # adiciona ## Reflexão nos arquivos que não têm (idempotente)
```

> No PowerShell, se `npm` for bloqueado pela política de execução de scripts, use `npm.cmd` nos mesmos comandos.

## Proteção de Devocionais

Os scripts de geração preservam arquivos que já tiveram o placeholder `<!-- Texto devocional aqui -->` substituído por conteúdo real. Nesses casos, a regeneração não sobrescreve o arquivo, evitando perda de reflexões já preenchidas.

Para inserir ou reformatar uma reflexão individual, use `npm run format-reflexao` a partir de `scripts/`.

## Validação

```bash
npm.cmd run validate
```

`npm.cmd run validate` executa testes e typecheck da raiz, testes e typecheck de `scripts/`, build Astro e indexação Pagefind.

`npm.cmd test` na raiz valida regras de calendário litúrgico, navegação por data, parsing do `sumario.md` e integridade dos 1097 arquivos de leitura. O teste em `scripts/` valida a proteção contra sobrescrita de devocionais preenchidos.

O build gera o site estático em `dist/` e indexa as páginas com Pagefind. Em 2026-06-30, a validação local gerou 1102 páginas HTML e indexou 1097 páginas de leituras.

## Fonte

Leituras seguem o *Revised Common Lectionary* publicado pela
[Consultation on Common Texts](https://www.commontexts.org/), com referências
adaptadas para o português. Dados feriais obtidos da
[Vanderbilt Divinity Library — RCL API](https://lectionary.library.vanderbilt.edu/).
