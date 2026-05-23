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
- Gerador do **Lecionário Revisado Comum (RCL)** em português, anos litúrgicos A, B e C
- Stack: **TypeScript + tsx** (sem compilação), scripts em `scripts/src/`
- `npm run generate` → 222 arquivos dominicais; `npm run generate-daily` → 875 arquivos diários (usa API HTTP Vanderbilt — lento)
- Saída: `ano-[a|b|c]/[estacao]/` + `sumario.md` na raiz como índice interativo
- Estações: `advento`, `natal`, `epifania`, `quaresma`, `semana-santa`, `pascoa`, `tempo-comum`
- Meta de cobertura: **875 arquivos diários, 0 não linkados** no sumario.md

## Regras do Projeto
- Nunca compilar — usar sempre `tsx` para executar scripts TypeScript diretamente
- Rodar `npm run generate-daily` a partir de `scripts/` (não da raiz)
- Ao adicionar novos mapeamentos Vanderbilt → português, editar `SUNDAY_NAMES` em `scripts/src/generate-daily.ts`
- Verificar cobertura após qualquer geração: Total 875, Missing 0
- Não criar estrutura `leituras-diarias/` (removida) — arquivos diários ficam em `ano-[a|b|c]/[estacao]/`
- Atualizar `Memoria/Projetos/Lecionario.md` via MCP quando houver mudanças relevantes na arquitetura
