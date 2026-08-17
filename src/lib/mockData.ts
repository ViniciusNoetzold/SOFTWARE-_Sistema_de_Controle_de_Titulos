import { Entidade, Titulo, MovimentacaoTitulo } from '../types';

export const mockEntidades: Entidade[] = [
  { id: 'c1', nome: 'TechCorp Solutions', documento: '12.345.678/0001-90', tipo_entidade: 'CLIENTE', email: 'fin@techcorp.com', telefone: '(11) 9999-0001' },
  { id: 'c2', nome: 'Global Imports Ltda', documento: '98.765.432/0001-10', tipo_entidade: 'CLIENTE', email: 'contas@global.com', telefone: '(21) 8888-0002' },
  { id: 'c3', nome: 'VINICIUS DE ALMEIDA NOETZOLD', documento: '028.858.640-95', tipo_entidade: 'CLIENTE', email: 'viniciusnoetzold0@gmail.com', telefone: '(54) 99703-0349' },
  { id: 'f1', nome: 'AWS Cloud Services', documento: '00.111.222/0001-33', tipo_entidade: 'FORNECEDOR', email: 'billing@aws.com', telefone: '0800-123-456' },
  { id: 'f2', nome: 'Limpeza e CIA', documento: '33.444.555/0001-44', tipo_entidade: 'FORNECEDOR', email: 'contato@limpezacia.com', telefone: '(11) 3333-4444' }
];

export const mockTitulos: Titulo[] = [
  // Contas a Receber (Clientes)
  { id: 'tr1', id_entidade: 'c1', tipo_titulo: 'RECEBER', numero_documento: 'NF-1024', valor_original: 15000, valor_pago: 0, saldo_devedor: 15000, data_vencimento: '2026-08-20', status: 'EM_ABERTO' },
  { id: 'tr2', id_entidade: 'c2', tipo_titulo: 'RECEBER', numero_documento: 'NF-1025', valor_original: 25000, valor_pago: 5000, saldo_devedor: 20000, data_vencimento: '2026-07-10', status: 'VENCIDO' },
  { id: 'tr3', id_entidade: 'c1', tipo_titulo: 'RECEBER', numero_documento: 'NF-1026', valor_original: 8500, valor_pago: 8500, saldo_devedor: 0, data_vencimento: '2026-08-01', data_liquidacao: '2026-08-01', status: 'PAGO' },
  { id: 'tr4', id_entidade: 'c3', tipo_titulo: 'RECEBER', numero_documento: 'DUP-9012', valor_original: 4500, valor_pago: 0, saldo_devedor: 4500, data_vencimento: '2026-08-30', status: 'EM_ABERTO' },
  { id: 'tr5', id_entidade: 'c3', tipo_titulo: 'RECEBER', numero_documento: 'DUP-9013', valor_original: 2800, valor_pago: 2800, saldo_devedor: 0, data_vencimento: '2026-08-05', data_liquidacao: '2026-08-05', status: 'PAGO' },
  
  // Contas a Pagar (Fornecedores)
  { id: 'tp1', id_entidade: 'f1', tipo_titulo: 'PAGAR', numero_documento: 'FAT-2026-08', valor_original: 3200, valor_pago: 0, saldo_devedor: 3200, data_vencimento: '2026-08-15', status: 'EM_ABERTO', centro_custo: 'TI e Infraestrutura' },
  { id: 'tp2', id_entidade: 'f2', tipo_titulo: 'PAGAR', numero_documento: 'NF-899', valor_original: 1500, valor_pago: 1500, saldo_devedor: 0, data_vencimento: '2026-08-05', data_liquidacao: '2026-08-05', status: 'PAGO', centro_custo: 'Administrativo' },
];

export const mockMovimentacoes: MovimentacaoTitulo[] = [
  { id: 'm1', id_titulo: 'tr3', tipo_movimentacao: 'BAIXA_TOTAL', valor_movimentado: 8500, data_movimentacao: '2026-08-01' },
  { id: 'm2', id_titulo: 'tr2', tipo_movimentacao: 'BAIXA_PARCIAL', valor_movimentado: 5000, data_movimentacao: '2026-07-25' },
  { id: 'm3', id_titulo: 'tp2', tipo_movimentacao: 'BAIXA_TOTAL', valor_movimentado: 1500, data_movimentacao: '2026-08-05' },
  { id: 'm4', id_titulo: 'tr5', tipo_movimentacao: 'BAIXA_TOTAL', valor_movimentado: 2800, data_movimentacao: '2026-08-05' },
];
