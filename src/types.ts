export type TipoEntidade = 'CLIENTE' | 'FORNECEDOR';
export type TipoTitulo = 'PAGAR' | 'RECEBER';
export type StatusTitulo = 'EM_ABERTO' | 'PAGO' | 'VENCIDO' | 'RENEGOCIADO';
export type TipoMovimentacao = 'BAIXA_TOTAL' | 'BAIXA_PARCIAL' | 'ESTORNO';

export interface Entidade {
  id: string;
  nome: string;
  documento: string;
  tipo_entidade: TipoEntidade;
  email: string;
  telefone: string;
}

export interface Titulo {
  id: string;
  id_entidade: string;
  tipo_titulo: TipoTitulo;
  numero_documento: string;
  valor_original: number;
  valor_pago: number;
  saldo_devedor: number;
  data_vencimento: string;
  data_liquidacao?: string;
  status: StatusTitulo;
  centro_custo?: string;
}

export interface MovimentacaoTitulo {
  id: string;
  id_titulo: string;
  tipo_movimentacao: TipoMovimentacao;
  valor_movimentado: number;
  data_movimentacao: string;
}
