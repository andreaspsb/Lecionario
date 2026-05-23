import * as fs from 'fs';
import * as path from 'path';
import { anoA } from './data/year-a.js';
import { anoB } from './data/year-b.js';
import { anoC } from './data/year-c.js';
import type { DadosAno, Dia, Domingo, DiaFesto, DiaFerial } from './types.js';

// ── root directory of the project (one level above /scripts)
const ROOT = path.resolve(__dirname, '..', '..');

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

function templateDomingo(dia: Domingo | DiaFesto, estacaoNome: string, ano: string): string {
  const l = dia.leituras;
  const tipo = 'tipo' in dia && dia.tipo === 'dia-festo' ? 'Dia Festo' : 'Domingo';
  return `---
titulo: "${dia.nome}"
ano: "${ano}"
estacao: "${estacaoNome}"
tipo: "${tipo}"
---

# ${dia.nome}

**Estação Litúrgica:** ${estacaoNome} — Ano ${ano}

## Leituras

| | |
|---|---|
| **Antigo Testamento** | ${l.at} |
| **Salmo** | ${l.salmo} |
| **Novo Testamento** | ${l.nt} |
| **Evangelho** | ${l.evangelho} |

---

## Reflexão

<!-- Texto devocional aqui -->

---

*Lecionário Revisado Comum (RCL) — tradução das referências adaptada para o português*
`;
}

function templateFerial(dia: DiaFerial, estacaoNome: string, ano: string): string {
  const l = dia.leituras;
  return `---
titulo: "${dia.nome}"
ano: "${ano}"
estacao: "${estacaoNome}"
tipo: "Ferial"
---

# ${dia.nome}

**Estação Litúrgica:** ${estacaoNome} — Ano ${ano}

## Leituras

| | |
|---|---|
| **Salmo** | ${l.salmo} |
| **Primeira Leitura** | ${l.primeiraLeitura} |
| **Segunda Leitura** | ${l.segundaLeitura} |

---

## Reflexão

<!-- Texto devocional aqui -->

---

*Lecionário Revisado Comum (RCL) — tradução das referências adaptada para o português*
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

function gerarArquivo(dia: Dia, estacaoNome: string, ano: string): void {
  const destino = path.join(ROOT, dia.arquivo);
  const dir = path.dirname(destino);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let conteudo: string;
  if (dia.tipo === 'ferial') {
    conteudo = templateFerial(dia, estacaoNome, ano);
  } else {
    conteudo = templateDomingo(dia, estacaoNome, ano);
  }

  fs.writeFileSync(destino, conteudo, 'utf-8');
  console.log(`  ✓ ${dia.arquivo}`);
}

function gerarAno(dados: DadosAno): void {
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  ANO ${dados.ano}`);
  console.log(`═══════════════════════════════════════`);

  for (const estacao of dados.estacoes) {
    console.log(`\n  [${estacao.nome}]`);
    for (const dia of estacao.dias) {
      gerarArquivo(dia, estacao.nome, dados.ano);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMÁRIO
// ─────────────────────────────────────────────────────────────────────────────

function gerarLinhaSumario(dia: Dia): string {
  const arquivo = dia.arquivo;
  // Convert arquivo path to relative markdown link from root
  const link = arquivo;
  const nome = dia.nome;
  const icone = dia.tipo === 'dia-festo' ? '✦' : dia.tipo === 'ferial' ? '·' : '◉';
  return `  ${icone} [${nome}](${link})`;
}

function gerarSumario(anos: DadosAno[]): void {
  const linhas: string[] = [
    '# Lecionário Revisado Comum — Sumário',
    '',
    '> Lecionário Revisado Comum (RCL) em português, organizado em três anos litúrgicos (A, B, C).',
    '> As leituras seguem o esquema dominical do *Revised Common Lectionary* publicado pela Consultation on Common Texts.',
    '',
    '---',
    '',
  ];

  for (const dados of anos) {
    linhas.push(`## Ano ${dados.ano}`, '');
    for (const estacao of dados.estacoes) {
      linhas.push(`### ${estacao.nome}`, '');
      for (const dia of estacao.dias) {
        linhas.push(gerarLinhaSumario(dia));
      }
      linhas.push('');
    }
  }

  linhas.push('---');
  linhas.push('');
  linhas.push('## Guia de Símbolos');
  linhas.push('');
  linhas.push('| Símbolo | Significado |');
  linhas.push('|---|---|');
  linhas.push('| ◉ | Domingo |');
  linhas.push('| ✦ | Dia Festo / Celebração Especial |');
  linhas.push('| · | Dia Ferial |');
  linhas.push('');
  linhas.push('---');
  linhas.push('');
  linhas.push('*Gerado automaticamente pelo script `scripts/src/generate.ts`*');

  const destino = path.join(ROOT, 'sumario.md');
  fs.writeFileSync(destino, linhas.join('\n'), 'utf-8');
  console.log(`\n✓ sumario.md gerado`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

function main(): void {
  console.log('Gerando Lecionário...\n');

  const anos: DadosAno[] = [anoA, anoB, anoC];

  for (const ano of anos) {
    gerarAno(ano);
  }

  gerarSumario(anos);

  console.log('\n✅ Lecionário gerado com sucesso!');

  // Summary stats
  const totalDias = anos.reduce(
    (acc, ano) => acc + ano.estacoes.reduce((a, e) => a + e.dias.length, 0),
    0
  );
  console.log(`   Total de arquivos gerados: ${totalDias}`);
}

main();
