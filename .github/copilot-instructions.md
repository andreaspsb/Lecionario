---
applyTo: '**'
---

# Contexto do Projeto Lecionario

Antes de responder qualquer pergunta neste repositório, leia o arquivo de memória do projeto via ferramenta MCP `obsidian-vault`:

```
Memoria/Projetos/Lecionario.md
```

E os arquivos de contexto global:
```
Memoria/Global/preferencias.md
Memoria/Global/decisoes.md
```

## Resumo Rápido
- Site estático e gerador do **Lecionário Comum Revisado (RCL)** em português, anos litúrgicos A, B e C
- Interface web: **Astro 7 + Tailwind CSS 4 + Pagefind**, com deploy em GitHub Pages (`/Lecionario`)
- Scripts de geração: **TypeScript + tsx** em `scripts/src/`
- `npm run build` na raiz → `astro build && pagefind --site dist --output-path dist/pagefind`
- `npm run generate` → 222 arquivos dominicais; `npm run generate-daily` → 875 arquivos diários (usa API HTTP Vanderbilt — lento)
- Saída de conteúdo: `ano-[a|b|c]/[estacao]/` + `sumario.md` na raiz como índice canônico
- Rotas principais: `/`, `/hoje`, `/data`, `/navegar`, `/buscar`, `/leitura/[...slug]`
- Estações: `advento`, `natal`, `epifania`, `quaresma`, `semana-santa`, `pascoa`, `tempo-comum`
- Meta de cobertura: **875 arquivos diários, 0 não linkados** no sumario.md

## Regras do Projeto
- Para scripts de geração, não compilar: usar sempre `tsx` via npm scripts em `scripts/`
- Tailwind CSS roda pelo plugin Vite `@tailwindcss/vite`; não usar `@astrojs/tailwind`
- Para validação completa, rodar `npm.cmd run validate` na raiz
- Para a interface web, validar no mínimo com `npm.cmd run build` na raiz quando houver mudança em páginas, layout, calendário, busca ou conteúdo
- Rodar `npm run generate-daily` a partir de `scripts/` (não da raiz)
- Ao adicionar novos mapeamentos Vanderbilt → português, editar `SUNDAY_NAMES` em `scripts/src/generate-daily.ts`
- Verificar cobertura após qualquer geração: Total 875, Missing 0
- Não criar estrutura `leituras-diarias/` (removida) — arquivos diários ficam em `ano-[a|b|c]/[estacao]/`
- Manter `sumario.md` como fonte canônica de ordenação; `navegar.astro` e `leitura/[...slug].astro` dependem dele em build time
- Consulta por data e lista de próximos dias usam `src/lib/dateNavigation.ts`; manter testes em `tests/dateNavigation.test.ts`
- Não sobrescrever devocionais preenchidos: `generate` e `generate-daily` devem preservar arquivos existentes quando o placeholder `<!-- Texto devocional aqui -->` já foi substituído
- Rodar `npm.cmd test` na raiz após mudanças em calendário, `sumario.md`, navegação ou conteúdo; rodar `npm.cmd test` em `scripts/` após mudanças nos geradores
- Atualizar `Memoria/Projetos/Lecionario.md` via MCP quando houver mudanças relevantes na arquitetura
