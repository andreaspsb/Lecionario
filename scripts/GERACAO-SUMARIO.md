# Geração do `sumario.md` — Documentação Técnica

O `sumario.md` é o **índice mestre** do Lecionário. Serve tanto como referência humana quanto como **fonte de verdade para a ordenação** usada pelo `navegar.astro`. Ele é construído em **duas etapas sequenciais**, cada uma por um script diferente.

---

## Visão Geral

```
npm run generate        → cria sumario.md com 222 entradas dominicais
npm run generate-daily  → intercala 875 links feriais no sumario.md existente
```

Resultado final: ~1097 linhas de links organizados por Ano → Estação → Semana, com feriais intercalados entre os domingos.

---

## Etapa 1 — `generate.ts` (domingos e dias festos)

### Fonte de dados

Os dados dominicais estão em arquivos TypeScript estáticos:

```
scripts/src/data/year-a.ts   → anoA: DadosAno
scripts/src/data/year-b.ts   → anoB: DadosAno
scripts/src/data/year-c.ts   → anoC: DadosAno
```

Cada `DadosAno` contém um array de `estacoes`, cada estação contendo um array de `dias` (tipo `Domingo | DiaFesto | DiaFerial`).

### O que `gerarSumario()` produz

A função percorre `[anoA, anoB, anoC]` em ordem e gera o seguinte esquema:

```markdown
# Lecionário Revisado Comum — Sumário

> ...

---

## Ano A

### Advento

  ◉ [Primeiro Domingo do Advento](ano-a/advento/01-domingo.md)
  ◉ [Segundo Domingo do Advento](ano-a/advento/02-domingo.md)
  ...

### Natal
  ...

## Ano B
  ...
```

**Símbolos usados:**

| Símbolo | Tipo |
|---------|------|
| `◉` | Domingo |
| `✦` | Dia Festo / Celebração Especial |
| `·` | Dia Ferial |

Cada linha tem **dois espaços de indentação** antes do símbolo — isso é relevante para o regex de intercalação na Etapa 2.

O arquivo é gravado em `sumario.md` na raiz do projeto.

---

## Etapa 2 — `generate-daily.ts` (feriais)

### Fonte de dados

Os dados feriais são obtidos **em tempo de execução** via HTTP da API da Vanderbilt Divinity Library:

```
https://lectionary.library.vanderbilt.edu/daily-readings?y=<code>
```

Códigos usados:

| Ano | Code |
|-----|------|
| A   | 17134 |
| B   | 18921 |
| C   | 19342 |

### Pipeline de processamento

```
fetchHtml(url)
  → parseVanderbiltHtml(html)       → RawEntry[]
  → groupIntoWeeks(entries)          → SemanaLiturgica[]
  → gerarArquivoDia(dia, semana, ano) (grava arquivos .md)
  → intercalarDiariosNoSumario(content, todosSemanas)
  → fs.writeFileSync('sumario.md', ...)
```

### 1. `parseVanderbiltHtml`

Faz parse do HTML usando regex (sem biblioteca DOM). Remove `<script>` e `<style>`, depois localiza tokens `<h2>` (cabeçalhos de estação) e `<li>` (entradas diárias) em ordem de documento.

- `<h2>` → atualiza `currentSeason` (ex.: `"Advent"`, `"Season after Pentecost"`)
- `<li>` → extrai `dayOfWeek`, `date` e `content` via regex:
  ```
  /^(\w+),\s+(\w+ \d+,\s*\d{4}):\s*([\s\S]*)$/
  ```
  - Domingos (`isSunday: true`): `content` = nome do domingo em inglês
  - Feriais: `content` = string de leituras → passa por `parseReadingText()`

### 2. `parseReadingText`

Detecta dois formatos:

**Formato simples** (Advento, Quaresma, etc.):
```
"Psalm 122; Daniel 9:15-19; James 4:1-10;"
→ { simples: { salmo, primeiraLeitura, segundaLeitura } }
```

**Formato dupla via** (Tempo Comum):
```
"Semi-continuous: Psalm 119:41-48; Genesis 18:16-33; Matthew 12:1-8; Complementary: Psalm 40:1-8; ..."
→ { semicontinua: { ... }, complementar: { ... } }
```

Todas as referências passam por `traduzirReferencia()`, que aplica ~75 substituições `[RegExp, string]` para converter nomes de livros do inglês para o português.

### 3. `groupIntoWeeks`

Agrupa as `RawEntry[]` em semanas litúrgicas. O modelo de semana litúrgica é **Qui→Qua** (não Dom→Sáb):

```
Semana N = [Qui, Sex, Sáb] antes do Domingo N  +  [Seg, Ter, Qua] após o Domingo N
           diasAntes                                 diasDepois
```

Para cada domingo (exceto os da Semana Santa):
1. Filtra os dias que caem entre `prevSundayNum < dNum < sundayNum` (→ `diasAntes`)
2. Filtra os dias que caem entre `sundayNum < dNum < nextSundayNum` (→ `diasDepois`)
3. Descarta semanas sem nenhuma leitura
4. Atribui `numeroSemana` = posição dentro da estação (contador incremental por `estacaoSlug`)

Comparação de datas é feita sem `Date`: converte `"November 27, 2025"` em inteiro `20251127` via `parseDateToNum()`.

### 4. `translateSundayName`

Converte o nome inglês do domingo para português usando o dicionário `SUNDAY_NAMES` (≈ 60 entradas fixas). Para domingos do Tempo Comum com padrão `"Proper N"`, usa a regex:

```ts
/Proper (\d+)/ → `Próprio ${N}`
```

Este nome em português é o **identificador de correspondência** na Etapa de intercalação.

### 5. Nomes dos arquivos feriais

```
ano-{a|b|c}/{estacaoSlug}/semana-{numeroSemana}-{slug}.md
```

Onde `slug` é: `segunda`, `terca`, `quarta`, `quinta`, `sexta`, `sabado`.

Exemplo: `ano-a/advento/semana-1-quinta.md`

**Proteção de conteúdo:** se o arquivo já existir e não contiver `<!-- Texto devocional aqui -->`, o script **não sobrescreve** (preserva texto devocional escrito manualmente).

### 6. `intercalarDiariosNoSumario`

Esta é a função que modifica o `sumario.md`. Para cada semana litúrgica de cada ano:

1. **Monta os links** de `diasAntes` e `diasDepois`:
   ```
     · [Quinta-feira](ano-a/advento/semana-1-quinta.md)
   ```

2. **Localiza a linha do domingo** no `sumario.md` com regex dinâmico:
   ```ts
   /([ \t]*[◉✦][ \t]+\[${domingoNomePT}[^\]]*\]\(ano-${ano}\/[^)]+\))/g
   ```

3. **Insere:**
   - `diasAntes` (Qui/Sex/Sáb) **antes** da linha do domingo
   - `diasDepois` (Seg/Ter/Qua) **depois** da linha do domingo

**Idempotência:** antes de intercalar, o script remove qualquer link ferial já intercalado (via regex que casa `· [...](.../semana-N-slug.md)`), garantindo que reexecuções não dupliquem entradas.

Também remove a seção `## Leituras Diárias (Feriais)` caso exista (legado de uma abordagem anterior de append).

---

## Resultado Final no `sumario.md`

```markdown
### Advento

  ◉ [Primeiro Domingo do Advento](ano-a/advento/01-domingo.md)
  · [Quinta-feira](ano-a/advento/semana-1-quinta.md)
  · [Sexta-feira](ano-a/advento/semana-1-sexta.md)
  · [Sábado](ano-a/advento/semana-1-sabado.md)
  ◉ [Segundo Domingo do Advento](ano-a/advento/02-domingo.md)
  · [Segunda-feira](ano-a/advento/semana-1-segunda.md)
  · [Terça-feira](ano-a/advento/semana-1-terca.md)
  · [Quarta-feira](ano-a/advento/semana-1-quarta.md)
  ◉ [Terceiro Domingo do Advento](ano-a/advento/03-domingo.md)
  ...
```

A ordenação calendárica (Qui/Sex/Sáb → Dom → Seg/Ter/Qua) reflete o ritmo real da semana litúrgica.

---

## Uso pelo `navegar.astro`

O `navegar.astro` lê o `sumario.md` diretamente via `fetch('/Lecionario/sumario.md')` em runtime e o parseia linha a linha para montar os grupos de estação. Isso significa que **a ordem do `sumario.md` é a ordem de exibição no site** — nenhum algoritmo de ordenação adicional é aplicado no frontend.

---

## Comandos de Referência

```bash
# A partir de scripts/
npm run generate        # Etapa 1: 222 arquivos + sumario.md (só domingos)
npm run generate-daily  # Etapa 2: 875 arquivos + intercala feriais no sumario.md
```

Sempre executar nessa ordem. `generate-daily` pressupõe que o `sumario.md` já existe com as linhas dos domingos para poder fazer a intercalação.
