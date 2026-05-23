import type { DadosAno, DiaFesto, Domingo } from '../types.js';

// Dias festos que se repetem em todos os anos (mesmas leituras)
export const diasFestosFixos = {
  natalProprio1: {
    tipo: 'dia-festo' as const,
    nome: 'Natividade do Senhor — Próprio I (Véspera/Manhã)',
    leituras: { at: 'Isaías 9:2-7', salmo: 'Salmo 96', nt: 'Tito 2:11-14', evangelho: 'Lucas 2:1-14,(15-20)' },
  },
  natalProprio2: {
    tipo: 'dia-festo' as const,
    nome: 'Natividade do Senhor — Próprio II',
    leituras: { at: 'Isaías 62:6-12', salmo: 'Salmo 97', nt: 'Tito 3:4-7', evangelho: 'Lucas 2:(1-7),8-20' },
  },
  natalProprio3: {
    tipo: 'dia-festo' as const,
    nome: 'Natividade do Senhor — Próprio III',
    leituras: { at: 'Isaías 52:7-10', salmo: 'Salmo 98', nt: 'Hebreus 1:1-4,(5-12)', evangelho: 'João 1:1-14' },
  },
  nomeDeJesus: {
    tipo: 'dia-festo' as const,
    nome: 'Nome de Jesus / Maria, Mãe de Deus (1 jan)',
    leituras: { at: 'Números 6:22-27', salmo: 'Salmo 8', nt: 'Gálatas 4:4-7', evangelho: 'Lucas 2:15-21' },
  },
  anoNovo: {
    tipo: 'dia-festo' as const,
    nome: 'Ano Novo (1 jan)',
    leituras: { at: 'Eclesiastes 3:1-13', salmo: 'Salmo 8', nt: 'Apocalipse 21:1-6a', evangelho: 'Mateus 25:31-46' },
  },
  epifania: {
    tipo: 'dia-festo' as const,
    nome: 'Epifania do Senhor (6 jan)',
    leituras: { at: 'Isaías 60:1-6', salmo: 'Salmo 72:1-7,10-14', nt: 'Efésios 3:1-12', evangelho: 'Mateus 2:1-12' },
  },
  apresentacaoSenhor: {
    tipo: 'dia-festo' as const,
    nome: 'Apresentação do Senhor (2 fev)',
    leituras: { at: 'Malaquias 3:1-4', salmo: 'Salmo 84', nt: 'Hebreus 2:14-18', evangelho: 'Lucas 2:22-40' },
  },
  anunciacao: {
    tipo: 'dia-festo' as const,
    nome: 'Anunciação do Senhor (25 mar)',
    leituras: { at: 'Isaías 7:10-14', salmo: 'Salmo 45', nt: 'Hebreus 10:4-10', evangelho: 'Lucas 1:26-38' },
  },
  santaCruz: {
    tipo: 'dia-festo' as const,
    nome: 'Exaltação da Santa Cruz (14 set)',
    leituras: { at: 'Números 21:4b-9', salmo: 'Salmo 98:1-5', nt: '1 Coríntios 1:18-24', evangelho: 'João 3:13-17' },
  },
  todosSantos: {
    tipo: 'dia-festo' as const,
    nome: 'Todos os Santos (1 nov)',
    leituras: { at: 'Apocalipse 7:9-17', salmo: 'Salmo 34:1-10,22', nt: '1 João 3:1-3', evangelho: 'Mateus 5:1-12' },
  },
};

// Semana Santa — leituras iguais todos os anos
export const semanaSantaDias = [
  {
    tipo: 'ferial' as const,
    nome: 'Segunda-feira Santa',
    arquivo: 'semana-santa/02-segunda.md',
    leituras: { salmo: 'Salmo 36:5-11', primeiraLeitura: 'Isaías 42:1-9', segundaLeitura: 'Hebreus 9:11-15', evangelho: 'João 12:1-11' },
  },
  {
    tipo: 'ferial' as const,
    nome: 'Terça-feira Santa',
    arquivo: 'semana-santa/03-terca.md',
    leituras: { salmo: 'Salmo 71:1-14', primeiraLeitura: 'Isaías 49:1-7', segundaLeitura: '1 Coríntios 1:18-31', evangelho: 'João 12:20-36' },
  },
  {
    tipo: 'ferial' as const,
    nome: 'Quarta-feira Santa',
    arquivo: 'semana-santa/04-quarta.md',
    leituras: { salmo: 'Salmo 70', primeiraLeitura: 'Isaías 50:4-9a', segundaLeitura: 'Hebreus 12:1-3', evangelho: 'João 13:21-32' },
  },
  {
    tipo: 'dia-festo' as const,
    nome: 'Quinta-feira Santa',
    arquivo: 'semana-santa/05-quinta.md',
    leituras: { at: 'Êxodo 12:1-4,(5-10),11-14', salmo: 'Salmo 116:1-2,12-19', nt: '1 Coríntios 11:23-26', evangelho: 'João 13:1-17,31b-35' },
  },
  {
    tipo: 'dia-festo' as const,
    nome: 'Sexta-feira Santa',
    arquivo: 'semana-santa/06-sexta.md',
    leituras: { at: 'Isaías 52:13-53:12', salmo: 'Salmo 22', nt: 'Hebreus 10:16-25', evangelho: 'João 18:1-19:42' },
  },
  {
    tipo: 'dia-festo' as const,
    nome: 'Sábado Santo',
    arquivo: 'semana-santa/07-sabado.md',
    leituras: { at: 'Jó 14:1-14', salmo: 'Salmo 31:1-4,15-16', nt: '1 Pedro 4:1-8', evangelho: 'Mateus 27:57-66' },
  },
] as const;

// Vigília Pascal — leituras iguais todos os anos
export const vigiliaLeituras = {
  at: 'Gênesis 1:1-2:4a; 7:1-5,11-18;8:6-18;9:8-13; 22:1-18; Êxodo 14:10-31;15:20-21; Isaías 55:1-11; Baruch 3:9-15,32-4:4; Ezequiel 36:24-28; 37:1-14; Sofonias 3:14-20',
  salmo: 'Salmo 114 (após leitura do NT)',
  nt: 'Romanos 6:3-11',
  evangelho: '(ver ano específico)',
};

// Ascensão — leituras iguais todos os anos
export const ascensaoLeituras = {
  at: 'Atos 1:1-11',
  salmo: 'Salmo 47',
  nt: 'Efésios 1:15-23',
  evangelho: 'Lucas 24:44-53',
};
