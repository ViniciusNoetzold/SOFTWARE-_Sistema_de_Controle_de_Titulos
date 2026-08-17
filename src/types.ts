export type TipoEntidade = 'CLIENTE' | 'FORNECEDOR';
export type TipoTitulo = 'PAGAR' | 'RECEBER';
export type StatusTitulo = 'EM_ABERTO' | 'PAGO' | 'VENCIDO' | 'RENEGOCIADO';
export type TipoMovimentacao = 'BAIXA_TOTAL' | 'BAIXA_PARCIAL' | 'ESTORNO';
export type TipoPessoa = 'PF' | 'PJ';

export type PerfilUsuario = 'ADMIN' | 'OPERADOR' | 'FINANCEIRO';
export type TemaVisual = 'SAPPHIRE_DARK' | 'CHARCOAL_DARK' | 'EMERALD_DARK' | 'RUBY_DARK' | 'CORPORATE_LIGHT';

export interface Usuario {
  id: string;
  nome: string;
  username: string;
  email: string;
  senhaHash: string; // Em ambiente real, hash bcrypt
  perfil: PerfilUsuario;
  ativo: boolean;
  avatarUrl?: string;
  criado_em: string;
  ultimoAcesso?: string;
}

export interface EmpresaConfig {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ie: string;
  email: string;
  telefone: string;
  endereco: string;
  chavePix?: string;
  favorecidoPix?: string;
}

export interface AssinaturaLicenca {
  ativa: boolean;
  diaVencimento: number; // Ex: dia 15
  dataValidadeISO: string; // Ex: 2026-09-15T23:59:59.999Z
  ultimoPagamentoISO?: string;
  valorMensalidade: number; // Ex: 150.00
  whatsappSuporte: string; // Ex: 5511999999999
  bloqueioManual: boolean; // Trava forçada pelo mestre
}

export interface LicencaStatus {
  diasRestantes: number;
  expirada: boolean;
  alertaAtivo: boolean; // 3 dias antes
  dataVencimentoFormatada: string;
  mensagem: string;
}

export interface Entidade {
  id: string;
  nome: string; // Nome Completo (PF) ou Razão Social (PJ)
  documento: string; // CPF ou CNPJ
  tipo_pessoa?: TipoPessoa;
  tipo_entidade: TipoEntidade;
  email: string;
  telefone: string;
  endereco?: string;
  limite_credito?: number;
  
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
