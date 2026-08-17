import React, { createContext, useContext, useState, useEffect } from 'react';
import { Entidade, Titulo, MovimentacaoTitulo, EmpresaConfig } from '../types';
import { mockEntidades, mockTitulos, mockMovimentacoes } from '../lib/mockData';
import { calcularSaldoDevedor } from '../lib/utils';

export interface ChequeItem {
  id: string;
  titular: string;
  banco: string;
  agencia: string;
  conta: string;
  numeroCheque: string;
  valor: number;
  vencimento: string;
  tipo: 'EMITIDO' | 'RECEBIDO';
  status: 'EM ABERTO' | 'COMPENSADO' | 'DEVOLVIDO';
}

export interface AuditLog {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  detalhes: string;
}

export const defaultEmpresaConfig: EmpresaConfig = {
  razaoSocial: 'Mezzold Studios Finance S/A',
  nomeFantasia: 'Mezzold Financial',
  cnpj: '00.000.000/0001-00',
  ie: '123.456.789.110',
  email: 'financeiro@mezzold.com.br',
  telefone: '(11) 99999-8888',
  endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP'
};

interface AppContextType {
  entidades: Entidade[];
  titulos: Titulo[];
  cheques: ChequeItem[];
  movimentacoes: MovimentacaoTitulo[];
  logs: AuditLog[];
  auditLogs: AuditLog[];
  empresaConfig: EmpresaConfig;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  updateEmpresaConfig: (data: Partial<EmpresaConfig>) => void;
  
  // Actions
  addEntidade: (entidade: Omit<Entidade, 'id'>) => void;
  updateEntidade: (id: string, data: Partial<Entidade>) => void;
  removeEntidade: (id: string) => void;
  
  addTitulo: (titulo: Omit<Titulo, 'id' | 'valor_pago' | 'saldo_devedor' | 'status'>) => void;
  liquidarTitulo: (id: string, tipo: 'TOTAL' | 'PARCIAL', valorParcial?: number) => void;
  restaurarTitulo: (id: string) => void;
  
  addCheque: (cheque: Omit<ChequeItem, 'id' | 'status'>) => void;
  updateChequeStatus: (id: string, status: 'EM ABERTO' | 'COMPENSADO' | 'DEVOLVIDO') => void;
  removeCheque: (id: string) => void;

  limparBaseCincoAnos: () => void;
  addLog: (acao: string, detalhes: string) => void;
}

const initialCheques: ChequeItem[] = [
  { id: 'ch1', titular: 'TechCorp Solutions', banco: 'Itaú (341)', agencia: '0001', conta: '12345-6', numeroCheque: '000123', valor: 5500.00, vencimento: '2026-09-10', tipo: 'RECEBIDO', status: 'EM ABERTO' },
  { id: 'ch2', titular: 'Global Imports', banco: 'Bradesco (237)', agencia: '0987', conta: '98765-4', numeroCheque: '000987', valor: 12000.00, vencimento: '2026-08-12', tipo: 'RECEBIDO', status: 'COMPENSADO' },
  { id: 'ch3', titular: 'Mezzold Studios', banco: 'Banco do Brasil (001)', agencia: '1111', conta: '22222-2', numeroCheque: '000001', valor: 3200.00, vencimento: '2026-08-25', tipo: 'EMITIDO', status: 'EM ABERTO' },
];

const initialLogs: AuditLog[] = [
  { id: '1', dataHora: '14/08/2026 10:30', usuario: 'admin', acao: 'Login no sistema', detalhes: 'Sessão iniciada com sucesso' },
  { id: '2', dataHora: '14/08/2026 10:45', usuario: 'operacao', acao: 'Baixa de Título', detalhes: 'Título NF-1026 liquidado totalmente' },
  { id: '3', dataHora: '14/08/2026 11:12', usuario: 'admin', acao: 'Alteração Cadastral', detalhes: 'Atualizou dados do cliente TechCorp' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entidades, setEntidades] = useState<Entidade[]>(() => {
    const saved = localStorage.getItem('mezzold_entidades');
    return saved ? JSON.parse(saved) : mockEntidades;
  });

  const [titulos, setTitulos] = useState<Titulo[]>(() => {
    const saved = localStorage.getItem('mezzold_titulos');
    return saved ? JSON.parse(saved) : mockTitulos;
  });

  const [cheques, setCheques] = useState<ChequeItem[]>(() => {
    const saved = localStorage.getItem('mezzold_cheques');
    return saved ? JSON.parse(saved) : initialCheques;
  });

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoTitulo[]>(() => {
    const saved = localStorage.getItem('mezzold_movimentacoes');
    return saved ? JSON.parse(saved) : mockMovimentacoes;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('mezzold_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  const [empresaConfig, setEmpresaConfig] = useState<EmpresaConfig>(() => {
    const saved = localStorage.getItem('mezzold_empresa_config');
    return saved ? JSON.parse(saved) : defaultEmpresaConfig;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('mezzold_entidades', JSON.stringify(entidades));
  }, [entidades]);

  useEffect(() => {
    localStorage.setItem('mezzold_titulos', JSON.stringify(titulos));
  }, [titulos]);

  useEffect(() => {
    localStorage.setItem('mezzold_cheques', JSON.stringify(cheques));
  }, [cheques]);

  useEffect(() => {
    localStorage.setItem('mezzold_movimentacoes', JSON.stringify(movimentacoes));
  }, [movimentacoes]);

  useEffect(() => {
    localStorage.setItem('mezzold_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('mezzold_empresa_config', JSON.stringify(empresaConfig));
  }, [empresaConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateEmpresaConfig = (data: Partial<EmpresaConfig>) => {
    setEmpresaConfig(prev => ({ ...prev, ...data }));
  };

  const addLog = (acao: string, detalhes: string) => {
    const now = new Date();
    const dataHora = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      dataHora,
      usuario: 'admin',
      acao,
      detalhes,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const addEntidade = (data: Omit<Entidade, 'id'>) => {
    const newId = `${data.tipo_entidade.charAt(0)}${String(entidades.length + 1).padStart(3, '0')}`;
    const newEnt: Entidade = { id: newId, ...data };
    setEntidades(prev => [...prev, newEnt]);
    addLog('Novo Cadastro', `Cadastrou ${data.tipo_entidade.toLowerCase()}: ${data.nome}`);
    showToast(`Cadastro de ${data.nome} realizado com sucesso!`);
  };

  const updateEntidade = (id: string, data: Partial<Entidade>) => {
    setEntidades(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    addLog('Edição de Cadastro', `Atualizou dados do cadastro ${id}`);
    showToast(`Cadastro atualizado com sucesso!`);
  };

  const removeEntidade = (id: string) => {
    setEntidades(prev => prev.filter(e => e.id !== id));
    addLog('Exclusão de Cadastro', `Removeu o cadastro ${id}`);
    showToast(`Cadastro removido com sucesso.`);
  };

  const addTitulo = (data: Omit<Titulo, 'id' | 'valor_pago' | 'saldo_devedor' | 'status'>) => {
    const newId = `T${String(titulos.length + 1).padStart(3, '0')}`;
    const newTit: Titulo = {
      ...data,
      id: newId,
      valor_pago: 0,
      saldo_devedor: data.valor_original,
      status: 'EM_ABERTO',
    };
    setTitulos(prev => [...prev, newTit]);
    addLog('Novo Título', `Lançou título ${data.numero_documento} (R$ ${data.valor_original})`);
    showToast(`Título ${data.numero_documento} lançado com sucesso!`);
  };

  const liquidarTitulo = (id: string, tipo: 'TOTAL' | 'PARCIAL', valorParcial?: number) => {
    setTitulos(prev => prev.map(t => {
      if (t.id === id) {
        const desc = valorParcial || t.saldo_devedor;
        const novoSaldo = Math.max(0, t.saldo_devedor - desc);
        const nowStr = new Date().toISOString().split('T')[0];

        if (tipo === 'TOTAL') {
          const mov: MovimentacaoTitulo = {
            id: `m_${Date.now()}`,
            id_titulo: t.id,
            tipo_movimentacao: 'BAIXA_TOTAL',
            valor_movimentado: t.saldo_devedor,
            data_movimentacao: nowStr,
          };
          setMovimentacoes(m => [mov, ...m]);
          addLog('Baixa Total', `Baixa total de R$ ${t.saldo_devedor} no título ${t.numero_documento}`);
          return {
            ...t,
            valor_pago: t.valor_original,
            saldo_devedor: 0,
            status: 'PAGO',
            data_liquidacao: nowStr,
          };
        } else {
          const mov: MovimentacaoTitulo = {
            id: `m_${Date.now()}`,
            id_titulo: t.id,
            tipo_movimentacao: 'BAIXA_PARCIAL',
            valor_movimentado: desc,
            data_movimentacao: nowStr,
          };
          setMovimentacoes(m => [mov, ...m]);
          addLog('Baixa Parcial', `Baixa parcial de R$ ${desc} no título ${t.numero_documento}`);
          return {
            ...t,
            valor_pago: t.valor_pago + desc,
            saldo_devedor: novoSaldo,
            status: novoSaldo === 0 ? 'PAGO' : t.status,
            data_liquidacao: novoSaldo === 0 ? nowStr : t.data_liquidacao,
          };
        }
      }
      return t;
    }));
    showToast(`Baixa efetuada com sucesso!`);
  };

  const restaurarTitulo = (id: string) => {
    setTitulos(prev => prev.map(t => {
      if (t.id === id) {
        addLog('Restauração de Título', `Restaurou o título ${t.numero_documento} para a carteira ativa`);
        return {
          ...t,
          status: 'EM_ABERTO',
          valor_pago: 0,
          saldo_devedor: t.valor_original,
          data_liquidacao: undefined,
        };
      }
      return t;
    }));
    showToast(`Título restaurado para a carteira ativa!`);
  };

  const addCheque = (data: Omit<ChequeItem, 'id' | 'status'>) => {
    const newCheque: ChequeItem = {
      ...data,
      id: `ch_${Date.now()}`,
      status: 'EM ABERTO',
    };
    setCheques(prev => [newCheque, ...prev]);
    addLog('Cadastro de Cheque', `Cadastrou cheque N° ${data.numeroCheque} de ${data.titular}`);
    showToast(`Cheque N° ${data.numeroCheque} cadastrado com sucesso!`);
  };

  const updateChequeStatus = (id: string, status: 'EM ABERTO' | 'COMPENSADO' | 'DEVOLVIDO') => {
    setCheques(prev => prev.map(c => {
      if (c.id === id) {
        addLog('Status Cheque', `Alterou status do cheque N° ${c.numeroCheque} para ${status}`);
        return { ...c, status };
      }
      return c;
    }));
    showToast(`Status do cheque atualizado para ${status}!`);
  };

  const removeCheque = (id: string) => {
    setCheques(prev => prev.filter(c => c.id !== id));
    showToast(`Cheque removido.`);
  };

  const limparBaseCincoAnos = () => {
    const countAntigos = titulos.filter(t => t.status === 'PAGO').length;
    setTitulos(prev => prev.filter(t => t.status !== 'PAGO'));
    addLog('Limpeza de Base', `Executou purga de ${countAntigos} títulos encerrados para arquivo morto`);
    showToast(`Limpeza efetuada: ${countAntigos} registros arquivados.`);
  };

  return (
    <AppContext.Provider
      value={{
        entidades,
        titulos,
        cheques,
        movimentacoes,
        logs,
        auditLogs: logs,
        empresaConfig,
        toastMessage,
        showToast,
        updateEmpresaConfig,
        addEntidade,
        updateEntidade,
        removeEntidade,
        addTitulo,
        liquidarTitulo,
        restaurarTitulo,
        addCheque,
        updateChequeStatus,
        removeCheque,
        limparBaseCincoAnos,
        addLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
