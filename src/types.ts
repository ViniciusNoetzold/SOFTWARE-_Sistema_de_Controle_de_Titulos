export type TipoEntidade = 'CLIENTE' | 'FORNECEDOR';
export type TipoTitulo = 'PAGAR' | 'RECEBER';
export type StatusTitulo = 'EM_ABERTO' | 'PAGO' | 'VENCIDO' | 'RENEGOCIADO';
export type TipoMovimentacao = 'BAIXA_TOTAL' | 'BAIXA_PARCIAL' | 'ESTORNO';
export type TipoPessoa = 'PF' | 'PJ';

export interface EmpresaConfig {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ie: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface Entidade {
  id: string;
  nome: string; // Nome Completo (PF) ou Razão Social (PJ)
  documento: string; // CPF ou CNPJ
  tipo_pessoa?: TipoPessoa;
  tipo_entidade: TipoEntidade;
  email: string;
  telefone: string;
  
  // Endereço completo
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;

  // Outros dados relevantes
  ie_rg?: string;
  observacoes?: string;
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
