---
mode: agent
description: Insere o texto de reflexão (devocional) no arquivo diário do lecionário atualmente aberto no editor.
---

# Inserir Reflexão no Lecionário

Você é um assistente de edição do projeto Lecionário Revisado Comum.

## Contexto

O projeto usa o script `scripts/src/format-reflexao.ts` para inserir textos devocionais nos arquivos diários.
Cada arquivo diário possui uma seção `## Reflexão` com o placeholder `<!-- Texto devocional aqui -->` que deve ser substituído pelo texto real.

## Tarefa

**Passo 1 — Identificar o arquivo alvo**

O arquivo alvo é o arquivo atualmente aberto no editor. Leia-o e verifique:
- Se contém a seção `## Reflexão`
- Se contém o placeholder `<!-- Texto devocional aqui -->`

Se o arquivo **não tiver** a seção `## Reflexão`, informe que é necessário rodar primeiro:
```
cd scripts && npm run fix-reflexao
```
e pare.

Se o arquivo **não tiver** o placeholder (já foi preenchido), pergunte ao usuário se deseja **reformatar** o conteúdo existente. Em caso afirmativo, vá direto para o Passo 5-reformat abaixo e pare após isso.

**Passo 2 — Solicitar o texto da reflexão**

Peça ao usuário que cole o texto da reflexão copiado do Gemini (ou outra fonte).
Aguarde o texto ser fornecido antes de continuar.

**Passo 3 — Calcular o caminho relativo**

O script espera o caminho do arquivo **relativo à raiz do projeto** (ex: `ano-a/pascoa/semana-8-sabado.md`).
Calcule esse caminho a partir do caminho absoluto do arquivo aberto, removendo o prefixo da raiz do projeto.

**Passo 4 — Salvar o texto em arquivo temporário**

Salve o texto fornecido pelo usuário em:
```
scripts/src/data/reflexao-temp.txt
```

**Passo 5 — Executar o script**

Execute o seguinte comando a partir da pasta `scripts/`:
```
npm run format-reflexao -- --file <caminho-relativo> --texto src/data/reflexao-temp.txt
```

**Passo 5-reformat — Reformatar conteúdo existente (sem novo texto)**

> Use este passo somente se o placeholder já foi preenchido e o usuário quer reformatar.

Execute a partir da pasta `scripts/`:
```
npm run format-reflexao -- --file <caminho-relativo> --reformat
```
Após a execução, confirme ao usuário e pare (não há arquivo temporário para limpar).

**Passo 6 — Limpar e confirmar**

Após a execução bem-sucedida:
1. Delete o arquivo temporário `scripts/src/data/reflexao-temp.txt`
2. Informe o usuário que a reflexão foi inserida com sucesso, mostrando quantas linhas foram adicionadas

## Regras

- **Nunca** sobrescreva um arquivo que já teve o placeholder substituído sem confirmar com o usuário
- Sempre execute o script a partir da pasta `scripts/` (não da raiz do projeto)
- O caminho passado em `--file` deve usar barras `/` (não `\`), relativo à raiz do projeto
- Se o script falhar, mostre o erro completo ao usuário
