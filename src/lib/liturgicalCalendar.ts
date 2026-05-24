export type AnoLiturgico = 'A' | 'B' | 'C';

export interface DiaLiturgico {
  ano: AnoLiturgico;
  estacao: string;
  /** caminho relativo ao arquivo .md a partir da raiz (ex: ano-a/advento/01-domingo.md) */
  arquivo: string;
  nome: string;
}

/**
 * Algoritmo de Meeus/Jones/Butcher para calcular a Páscoa.
 * Retorna a data da Páscoa (domingo) para o ano gregoriano.
 */
export function calcularPascoa(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=Mar, 4=Apr
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Retorna a data do início do Advento (4º domingo antes de 25/dez).
 * O Advento começa no domingo mais próximo de 30 de novembro.
 */
export function calcularInicioAdvento(year: number): Date {
  const natal = new Date(year, 11, 25); // 25/dez
  const diaSemana = natal.getDay(); // 0=Dom ... 6=Sab
  // Recua até o domingo anterior (ou hoje se já for domingo)
  const diff = diaSemana === 0 ? -21 : -(diaSemana + 21);
  const advento = new Date(natal);
  advento.setDate(natal.getDate() + diff);
  return advento;
}

/**
 * Determina o ano litúrgico (A, B ou C) para um ano civil.
 * O ano litúrgico começa no primeiro domingo do Advento.
 * Regra RCL: Ano A é divisível por 3 (ex: 2022, 2025), B por resto 1, C por resto 2.
 * Porém contamos pelo ANO LITÚRGICO: se a data já está no Advento, usa o ano seguinte.
 */
export function getAnoLiturgico(date: Date): AnoLiturgico {
  const year = date.getFullYear();
  const inicioAdvento = calcularInicioAdvento(year);

  // Se a data já está no advento deste ano civil, o ano litúrgico é year+1
  const anoBase = date >= inicioAdvento ? year + 1 : year;

  const resto = anoBase % 3;
  if (resto === 0) return 'B';
  if (resto === 1) return 'C';
  return 'A';
}

/** Retorna true se duas datas são o mesmo dia (ignora horário) */
function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Retorna true se a data está dentro do intervalo [inicio, fim) */
function entreInclusive(data: Date, inicio: Date, fim: Date): boolean {
  return data >= inicio && data < fim;
}

/**
 * Dado uma data, retorna o arquivo .md correspondente ao dia litúrgico.
 * Foca em domingos e datas-chave; dias feriais retornam o domingo mais próximo.
 */
export function getDiaLiturgico(date: Date): DiaLiturgico | null {
  const year = date.getFullYear();
  const ano = getAnoLiturgico(date);
  const anoDir = `ano-${ano.toLowerCase()}`;

  const pascoa = calcularPascoa(year);
  const pascoa_prev = calcularPascoa(year - 1);

  // Datas-chave calculadas
  const inicioAdvento = calcularInicioAdvento(
    date >= calcularInicioAdvento(year) ? year : year - 1
  );
  const inicioAdventoAno = date >= calcularInicioAdvento(year) ? year : year - 1;
  const inicioAdventoEfetivo = calcularInicioAdvento(inicioAdventoAno);

  // Natal e período natalino
  const natal = new Date(year, 11, 25);
  const fimNatal = new Date(year, 0, 13); // 13 de janeiro aprox

  // --- Páscoa e entorno ---
  const sextaSanta = new Date(pascoa);
  sextaSanta.setDate(pascoa.getDate() - 2);
  const quintaSanta = new Date(pascoa);
  quintaSanta.setDate(pascoa.getDate() - 3);
  const quartaCinzas = new Date(pascoa);
  quartaCinzas.setDate(pascoa.getDate() - 46);
  const domingoPalmas = new Date(pascoa);
  domingoPalmas.setDate(pascoa.getDate() - 7);
  const ascensao = new Date(pascoa);
  ascensao.setDate(pascoa.getDate() + 39);
  const pentecostes = new Date(pascoa);
  pentecostes.setDate(pascoa.getDate() + 49);
  const trindade = new Date(pascoa);
  trindade.setDate(pascoa.getDate() + 56);

  // Domingos do Advento
  for (let i = 0; i < 4; i++) {
    const domingo = new Date(inicioAdventoEfetivo);
    domingo.setDate(inicioAdventoEfetivo.getDate() + i * 7);
    const numStr = String(i + 1).padStart(2, '0');
    if (mesmoDia(date, domingo)) {
      return {
        ano,
        estacao: 'advento',
        arquivo: `${anoDir}/advento/${numStr}-domingo.md`,
        nome: `${['Primeiro', 'Segundo', 'Terceiro', 'Quarto'][i]} Domingo do Advento`,
      };
    }
  }

  // Natal
  if (mesmoDia(date, new Date(year, 11, 25))) {
    return { ano, estacao: 'natal', arquivo: `${anoDir}/natal/00c-natividade-proprio3.md`, nome: 'Natividade do Senhor' };
  }

  // Domingos depois do Natal (1º e 2º)
  for (let i = 0; i < 2; i++) {
    const dom = nextSunday(new Date(year, 11, 25 + i * 7));
    if (dom && dom.getMonth() === 11 && mesmoDia(date, dom)) {
      return {
        ano,
        estacao: 'natal',
        arquivo: `${anoDir}/natal/0${i + 1}-domingo.md`,
        nome: `${i === 0 ? 'Primeiro' : 'Segundo'} Domingo após o Natal`,
      };
    }
  }

  // Quarta de Cinzas
  if (mesmoDia(date, quartaCinzas)) {
    return { ano, estacao: 'quaresma', arquivo: `${anoDir}/quaresma/00-quarta-cinzas.md`, nome: 'Quarta-feira de Cinzas' };
  }

  // Domingos da Quaresma (1-5)
  for (let i = 0; i < 5; i++) {
    const dom = new Date(pascoa);
    dom.setDate(pascoa.getDate() - 42 + i * 7);
    if (mesmoDia(date, dom)) {
      const num = String(i + 1).padStart(2, '0');
      const nomes = ['Primeiro', 'Segundo', 'Terceiro', 'Quarto', 'Quinto'];
      return { ano, estacao: 'quaresma', arquivo: `${anoDir}/quaresma/${num}-domingo.md`, nome: `${nomes[i]} Domingo da Quaresma` };
    }
  }

  // Domingo de Ramos
  if (mesmoDia(date, domingoPalmas)) {
    return { ano, estacao: 'quaresma', arquivo: `${anoDir}/quaresma/06b-domingo-paixao.md`, nome: 'Domingo de Ramos — Liturgia da Paixão' };
  }

  // Quinta e Sexta Santas
  if (mesmoDia(date, quintaSanta)) {
    return { ano, estacao: 'semana-santa', arquivo: `${anoDir}/semana-santa/quinta-santa.md`, nome: 'Quinta-feira Santa' };
  }
  if (mesmoDia(date, sextaSanta)) {
    return { ano, estacao: 'semana-santa', arquivo: `${anoDir}/semana-santa/sexta-santa.md`, nome: 'Sexta-feira Santa' };
  }

  // Páscoa e domingos da Páscoa (1-7)
  for (let i = 0; i < 7; i++) {
    const dom = new Date(pascoa);
    dom.setDate(pascoa.getDate() + i * 7);
    if (mesmoDia(date, dom)) {
      if (i === 0) return { ano, estacao: 'pascoa', arquivo: `${anoDir}/pascoa/01-domingo.md`, nome: 'Domingo da Ressurreição' };
      const num = String(i + 1).padStart(2, '0');
      const nomes = ['', 'Segundo', 'Terceiro', 'Quarto', 'Quinto', 'Sexto', 'Sétimo'];
      return { ano, estacao: 'pascoa', arquivo: `${anoDir}/pascoa/${num}-domingo.md`, nome: `${nomes[i]} Domingo da Páscoa` };
    }
  }

  // Ascensão
  if (mesmoDia(date, ascensao)) {
    return { ano, estacao: 'pascoa', arquivo: `${anoDir}/pascoa/ascensao.md`, nome: 'Ascensão do Senhor' };
  }

  // Pentecostes
  if (mesmoDia(date, pentecostes)) {
    return { ano, estacao: 'pascoa', arquivo: `${anoDir}/pascoa/08-pentecostes.md`, nome: 'Pentecostes' };
  }

  // Trindade
  if (mesmoDia(date, trindade)) {
    return { ano, estacao: 'tempo-comum', arquivo: `${anoDir}/tempo-comum/00-trindade.md`, nome: 'Domingo da Santíssima Trindade' };
  }

  // Domingos do Tempo Comum (Epifania e após Pentecostes)
  // Encontrar domingos da Epifania (após Batismo do Senhor até Quarta de Cinzas)
  const batismoSenhor = nextSunday(new Date(year, 0, 6)); // primeiro domingo após 6/jan
  if (batismoSenhor && date >= batismoSenhor && date < quartaCinzas) {
    if (mesmoDia(date, batismoSenhor)) {
      return { ano, estacao: 'epifania', arquivo: `${anoDir}/epifania/01-domingo.md`, nome: 'Batismo do Senhor' };
    }
    let semana = 2;
    let dom = new Date(batismoSenhor);
    dom.setDate(dom.getDate() + 7);
    while (dom < quartaCinzas) {
      if (mesmoDia(date, dom)) {
        const num = String(semana).padStart(2, '0');
        return { ano, estacao: 'epifania', arquivo: `${anoDir}/epifania/${num}-domingo.md`, nome: `${semana}º Domingo da Epifania` };
      }
      semana++;
      dom.setDate(dom.getDate() + 7);
    }
  }

  // Domingos do Tempo Comum (após Trindade)
  if (date > trindade) {
    let semana = 1;
    let dom = new Date(pentecostes);
    dom.setDate(dom.getDate() + 7); // começa na semana após pentecostes
    const fimAno = calcularInicioAdvento(year);
    while (dom < fimAno) {
      if (mesmoDia(date, dom)) {
        const num = String(semana + 8).padStart(2, '0'); // tempo comum conta a partir de ~9
        return { ano, estacao: 'tempo-comum', arquivo: `${anoDir}/tempo-comum/${num}-domingo.md`, nome: `${semana + 8}º Domingo do Tempo Comum` };
      }
      semana++;
      dom.setDate(dom.getDate() + 7);
    }
  }

  return null;
}

/** Retorna o próximo domingo a partir de uma data (inclusive se já for domingo) */
function nextSunday(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  if (dayOfWeek !== 0) {
    d.setDate(d.getDate() + (7 - dayOfWeek));
  }
  return d;
}

/** Retorna o domingo mais próximo (anterior ou igual) */
export function previousOrSameSunday(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/** Formata uma data para pt-BR */
export function formatarData(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Nome legível da estação litúrgica */
export function nomeEstacao(estacao: string): string {
  const nomes: Record<string, string> = {
    advento: 'Advento',
    natal: 'Natal',
    epifania: 'Epifania',
    quaresma: 'Quaresma',
    'semana-santa': 'Semana Santa',
    pascoa: 'Páscoa',
    'tempo-comum': 'Tempo Comum',
  };
  return nomes[estacao] ?? estacao;
}

/** Cor litúrgica por estação */
export function corLiturgica(estacao: string): string {
  const cores: Record<string, string> = {
    advento: 'purple',
    natal: 'white',
    epifania: 'white',
    quaresma: 'purple',
    'semana-santa': 'red',
    pascoa: 'white',
    'tempo-comum': 'green',
  };
  return cores[estacao] ?? 'gray';
}

/**
 * Chave de ordenação para dias litúrgicos dentro de uma estação.
 *
 * Convenções de filename (o `id` do entry sem estação):
 *  - `0N-domingo`        → domingos (N=1..9)
 *  - `00a-*`, `00b-*`   → festas antes do 1º domingo (natividade, quarta-cinzas, vigília)
 *  - `semana-N-dia`      → feriais (N=semana, dia=segunda..sábado)
 *  - Nomes festos        → mapa explícito
 *
 * Unidade base: cada "semana" ocupa 10 pontos (0..9 dentro da semana).
 * Domingos ficam no ponto 0 de cada bloco de 10.
 * Feriais ficam em 1..6 (seg=1 … sáb=6).
 */
export function sortKeyDia(id: string): number {
  // Extrai apenas o último segmento (filename) do id — ex: "ano-a/advento/01-domingo" → "01-domingo"
  const filename = id.split('/').pop() ?? id;

  // Mapa explícito para dias festos nomeados
  const festosMap: Record<string, number> = {
    // Natal
    'nome-de-jesus': 15,
    'ano-novo': 16,
    // Epifania
    'apresentacao': 45,
    'transfiguracao': 80,
    // Quaresma
    'anunciacao': 55,
    // Páscoa
    'ascensao': 65,
    'pentecostes': 79,
    // Tempo Comum
    'trindade': 4,
  };
  if (filename in festosMap) return festosMap[filename];

  // Ordem dos dias da semana (segunda=1 … sábado=6)
  const ordemDia: Record<string, number> = {
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sabado: 6,
  };

  // Padrão: semana-N-dia (ex: semana-2-quarta)
  const mSemana = filename.match(/^semana-(\d+)-(\w+)$/);
  if (mSemana) {
    const semana = parseInt(mSemana[1], 10);
    const dia = ordemDia[mSemana[2]] ?? 0;
    return semana * 10 + dia;
  }

  // Padrão: 0N-domingo (ex: 01-domingo, 07-domingo)
  const mDomingo = filename.match(/^0(\d)-domingo$/);
  if (mDomingo) {
    return parseInt(mDomingo[1], 10) * 10;
  }

  // Padrão: 00a-*, 00b-*, 00c-* (festas/próprios antes do domingo 1)
  // Ex: 00a-natividade-proprio1, 00-quarta-cinzas, 00-vigilia
  const mZero = filename.match(/^00([a-z]?)-/);
  if (mZero) {
    const letra = mZero[1]; // '', 'a', 'b', 'c'
    const offset = letra ? letra.charCodeAt(0) - 'a'.charCodeAt(0) : 0;
    return -30 + offset; // -30, -29, -28, -27
  }

  // Padrão: NNx-sufixo (ex: 06a-palmas, 06b-paixao, 01b-tarde)
  const mNum = filename.match(/^(\d+)([a-z]?)-/);
  if (mNum) {
    const n = parseInt(mNum[1], 10);
    const letra = mNum[2] || '';
    const offset = letra ? letra.charCodeAt(0) - 'a'.charCodeAt(0) : 0;
    return n * 10 + offset;
  }

  // Fallback: ordenação lexicográfica via charCode médio (não deve ocorrer)
  return filename.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}
