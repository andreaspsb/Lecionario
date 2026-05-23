export type Ano = 'A' | 'B' | 'C';

export type Estacao =
  | 'advento'
  | 'natal'
  | 'epifania'
  | 'quaresma'
  | 'semana-santa'
  | 'pascoa'
  | 'tempo-comum';

export interface LeiturasDomingo {
  at: string;
  salmo: string;
  nt: string;
  evangelho: string;
}

export interface LeiturasFerial {
  salmo: string;
  primeiraLeitura: string;
  segundaLeitura: string;
}

export interface Domingo {
  tipo: 'domingo' | 'festa';
  semana: number;
  nome: string;
  arquivo: string; // caminho relativo a partir da raiz
  leituras: LeiturasDomingo;
}

export interface DiaFesto {
  tipo: 'dia-festo';
  nome: string;
  arquivo: string;
  leituras: LeiturasDomingo;
}

export interface DiaFerial {
  tipo: 'ferial';
  nome: string;
  arquivo: string;
  leituras: LeiturasFerial;
}

export type Dia = Domingo | DiaFesto | DiaFerial;

export interface Estacao_Data {
  id: Estacao;
  nome: string;
  dias: Dia[];
}

export interface DadosAno {
  ano: Ano;
  estacoes: Estacao_Data[];
}
