import React, { createContext, useContext, useState, useEffect } from 'react';
import { Entidade, Titulo, MovimentacaoTitulo, EmpresaConfig, Usuario, PerfilUsuario } from '../types';
import { mockEntidades, mockTitulos, mockMovimentacoes } from '../lib/mockData';

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
  
  // Rastreamento por Usuário (Auditoria)
  criado_por?: string;
  criado_por_nome?: string;
  atualizado_por?: string;
  atualizado_por_nome?: string;
  criado_em?: string;
  atualizado_em?: string;
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

export const initialUsuarios: Usuario[] = [
  {
    id: 'u1',
    nome: 'Vinícius Noetzold (Admin)',
    username: 'admin',
    email: 'admin@mezzold.com',
    senhaHash: 'admin123',
    perfil: 'ADMIN',
    ativo: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    criado_em: '2026-08-01T10:00:00.000Z',
    ultimoAcesso: '2026-08-17T12:00:00.000Z'
  },
  {
    id: 'u2',
    nome: 'Ana Paula (Operadora)',
    username: 'operador',
    email: 'operador@mezzold.com',
    senhaHash: 'operador123',
    perfil: 'OPERADOR',
    ativo: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    criado_em: '2026-08-05T14:30:00.000Z',
    ultimoAcesso: '2026-08-16T16:20:00.000Z'
  },
  {
    id: 'u3',
    nome: 'Carlos Eduardo (Financeiro)',
    username: 'carlos',
    email: 'carlos@mezzold.com',
    senhaHash: 'carlos123',
    perfil: 'FINANCEIRO',
    ativo: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    criado_em: '2026-08-10T09:15:00.000Z',
    ultimoAcesso: '2026-08-15T11:00:00.000Z'
  }
];

export interface LastLoggedUser {
  nome: string;
  email: string;
  username: string;
  avatarUrl?: string;
  perfil: PerfilUsuario;
}

interface AppContextType {
  // Autenticação & Usuários
  currentUser: Usuario | null;
  lastLoggedUser: LastLoggedUser | null;
  usuarios: Usuario[];
  login: (usernameOrEmail: string, senha: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: () => void;
  addUsuario: (data: Omit<Usuario, 'id' | 'criado_em'>) => { success: boolean; message: string };
  updateUsuario: (id: string, data: Partial<Usuario>) => void;
  toggleUsuarioAtivo: (id: string) => void;

  // Dados
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
  
  addCheque: (cheque: Omit<ChequeItem, 'id' | 'status' | 'criado_por' | 'criado_por_nome' | 'criado_em'>) => void;
  updateChequeStatus: (id: string, status: 'EM ABERTO' | 'COMPENSADO' | 'DEVOLVIDO') => void;
  removeCheque: (id: string) => void;

  limparBaseCincoAnos: () => void;
  addLog: (acao: string, detalhes: string) => void;
}

const initialCheques: ChequeItem[] = [
  { 
    id: 'ch1', 
    titular: 'TechCorp Solutions', 
    banco: 'Itaú (341)', 
    agencia: '0001', 
    conta: '12345-6', 
    numeroCheque: '000123', 
    valor: 5500.00, 
    vencimento: '2026-09-10', 
    tipo: 'RECEBIDO', 
    status: 'EM ABERTO',
    criado_por: 'u1',
    criado_por_nome: 'Vinícius Noetzold (Admin)',
    criado_em: '2026-08-10T14:30:00.000Z'
  },
  { 
    id: 'ch2', 
    titular: 'Global Imports', 
    banco: 'Bradesco (237)', 
    agencia: '0987', 
    conta: '98765-4', 
    numeroCheque: '000987', 
    valor: 12000.00, 
    vencimento: '2026-08-12', 
    tipo: 'RECEBIDO', 
    status: 'COMPENSADO',
    criado_por: 'u2',
    criado_por_nome: 'Ana Paula (Operadora)',
    criado_em: '2026-08-12T09:15:00.000Z',
    atualizado_por: 'u1',
    atualizado_por_nome: 'Vinícius Noetzold (Admin)',
    atualizado_em: '2026-08-14T11:20:00.000Z'
  },
  { 
    id: 'ch3', 
    titular: 'Mezzold Studios', 
    banco: 'Banco do Brasil (001)', 
    agencia: '1111', 
    conta: '22222-2', 
    numeroCheque: '000001', 
    valor: 3200.00, 
    vencimento: '2026-08-25', 
    tipo: 'EMITIDO', 
    status: 'EM ABERTO',
    criado_por: 'u3',
    criado_por_nome: 'Carlos Eduardo (Financeiro)',
    criado_em: '2026-08-15T16:00:00.000Z'
  },
];

const initialLogs: AuditLog[] = [
  { id: '1', dataHora: '17/08/2026 10:30', usuario: 'Vinícius Noetzold', acao: 'Login no sistema', detalhes: 'Sessão iniciada com sucesso' },
  { id: '2', dataHora: '17/08/2026 10:45', usuario: 'Ana Paula', acao: 'Baixa de Título', detalhes: 'Título NF-1026 liquidado totalmente' },
  { id: '3', dataHora: '17/08/2026 11:12', usuario: 'Vinícius Noetzold', acao: 'Alteração Cadastral', detalhes: 'Atualizou dados do cliente TechCorp' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado dos Usuários do Sistema
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem('mezzold_usuarios');
    return saved ? JSON.parse(saved) : initialUsuarios;
  });

  // Usuário Atualmente Logado na Sessão
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('mezzold_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Memória Persistente do Último Usuário que Logou
  const [lastLoggedUser, setLastLoggedUser] = useState<LastLoggedUser | null>(() => {
    const saved = localStorage.getItem('mezzold_last_logged_user');
    return saved ? JSON.parse(saved) : {
      nome: 'Vinícius Noetzold (Admin)',
      email: 'admin@mezzold.com',
      username: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      perfil: 'ADMIN'
    };
  });

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

  // Efeitos de Persistência no LocalStorage
  useEffect(() => {
    localStorage.setItem('mezzold_usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mezzold_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mezzold_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (lastLoggedUser) {
      localStorage.setItem('mezzold_last_logged_user', JSON.stringify(lastLoggedUser));
    } else {
      localStorage.removeItem('mezzold_last_logged_user');
    }
  }, [lastLoggedUser]);

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

  const addLog = (acao: string, detalhes: string) => {
    const now = new Date();
    const dataHora = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      dataHora,
      usuario: currentUser ? currentUser.nome : 'Sistema',
      acao,
      detalhes,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Funções de Autenticação
  const login = (usernameOrEmail: string, senha: string) => {
    const cleanSearch = usernameOrEmail.trim().toLowerCase();
    const foundUser = usuarios.find(u => 
      (u.username.toLowerCase() === cleanSearch || u.email.toLowerCase() === cleanSearch)
    );

    if (!foundUser) {
      return { success: false, message: 'Usuário ou e-mail não encontrado no sistema.' };
    }

    if (!foundUser.ativo) {
      return { success: false, message: 'Esta conta de usuário está inativa. Fale com um Administrador.' };
    }

    if (foundUser.senhaHash !== senha) {
      return { success: false, message: 'Senha incorreta. Tente novamente.' };
    }

    // Sucesso no Login
    const updatedUser = {
      ...foundUser,
      ultimoAcesso: new Date().toISOString()
    };

    setCurrentUser(updatedUser);
    setUsuarios(prev => prev.map(u => u.id === foundUser.id ? updatedUser : u));

    // Salvar memória do último usuário logado no dispositivo
    const lastData: LastLoggedUser = {
      nome: foundUser.nome,
      email: foundUser.email,
      username: foundUser.username,
      avatarUrl: foundUser.avatarUrl,
      perfil: foundUser.perfil
    };
    setLastLoggedUser(lastData);

    addLog('Autenticação', `Usuário ${foundUser.nome} (${foundUser.perfil}) efetuou login.`);
    showToast(`Bem-vindo de volta, ${foundUser.nome}!`);

    return { success: true, message: 'Login realizado com sucesso!' };
  };

  const logout = () => {
    if (currentUser) {
      addLog('Autenticação', `Usuário ${currentUser.nome} encerrou a sessão.`);
    }
    setCurrentUser(null);
    showToast('Sessão encerrada com sucesso.');
  };

  const switchUser = () => {
    setCurrentUser(null);
    setLastLoggedUser(null);
    showToast('Memória limpa. Digite o usuário e senha para entrar.');
  };

  // CRUD de Usuários (Admin)
  const addUsuario = (data: Omit<Usuario, 'id' | 'criado_em'>) => {
    const exists = usuarios.some(u => 
      u.email.toLowerCase() === data.email.toLowerCase() || 
      u.username.toLowerCase() === data.username.toLowerCase()
    );

    if (exists) {
      return { success: false, message: 'Já existe um usuário cadastrado com este e-mail ou nome de usuário.' };
    }

    const newId = `u${usuarios.length + 1}`;
    const newUsuario: Usuario = {
      ...data,
      id: newId,
      criado_em: new Date().toISOString(),
      avatarUrl: data.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
    };

    setUsuarios(prev => [...prev, newUsuario]);
    addLog('Gestão de Usuários', `Cadastrou novo usuário: ${newUsuario.nome} (${newUsuario.perfil})`);
    showToast(`Usuário ${newUsuario.nome} cadastrado com sucesso!`);
    return { success: true, message: 'Usuário criado com sucesso!' };
  };

  const updateUsuario = (id: string, data: Partial<Usuario>) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
    addLog('Gestão de Usuários', `Atualizou dados do usuário ID: ${id}`);
    showToast('Dados do usuário atualizados com sucesso!');
  };

  const toggleUsuarioAtivo = (id: string) => {
    setUsuarios(prev => prev.map(u => {
      if (u.id === id) {
        const novoStatus = !u.ativo;
        addLog('Gestão de Usuários', `${novoStatus ? 'Ativou' : 'Desativou'} a conta do usuário ${u.nome}`);
        showToast(`Conta de ${u.nome} foi ${novoStatus ? 'ativada' : 'desativada'}.`);
        return { ...u, ativo: novoStatus };
      }
      return u;
    }));
  };

  const updateEmpresaConfig = (data: Partial<EmpresaConfig>) => {
    setEmpresaConfig(prev => ({ ...prev, ...data }));
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
    showToast(`Título restaurado com sucesso!`);
  };

  // Cadastro de Cheque com Rastreamento por Usuário
  const addCheque = (data: Omit<ChequeItem, 'id' | 'status' | 'criado_por' | 'criado_por_nome' | 'criado_em'>) => {
    const newId = `ch${cheques.length + 1}`;
    const nowIso = new Date().toISOString();

    const newCheque: ChequeItem = {
      ...data,
      id: newId,
      status: 'EM ABERTO',
      criado_por: currentUser ? currentUser.id : 'sistema',
      criado_por_nome: currentUser ? currentUser.nome : 'Sistema / Automático',
      criado_em: nowIso,
    };

    setCheques(prev => [newCheque, ...prev]);
    addLog('Registro de Cheque', `Cadastrou cheque N° ${data.numeroCheque} no valor de R$ ${data.valor}`);
    showToast(`Cheque N° ${data.numeroCheque} registrado por ${newCheque.criado_por_nome}!`);
  };

  // Atualização de Status do Cheque com Rastreamento do Usuário Atualizador
  const updateChequeStatus = (id: string, status: 'EM ABERTO' | 'COMPENSADO' | 'DEVOLVIDO') => {
    const nowIso = new Date().toISOString();

    setCheques(prev => prev.map(c => {
      if (c.id === id) {
        const updated = {
          ...c,
          status,
          atualizado_por: currentUser ? currentUser.id : 'sistema',
          atualizado_por_nome: currentUser ? currentUser.nome : 'Sistema',
          atualizado_em: nowIso,
        };
        addLog('Status de Cheque', `Alterou status do cheque N° ${c.numeroCheque} para ${status}`);
        return updated;
      }
      return c;
    }));
    showToast(`Status do cheque atualizado para ${status}!`);
  };

  const removeCheque = (id: string) => {
    setCheques(prev => prev.filter(c => c.id !== id));
    addLog('Exclusão de Cheque', `Removeu registro do cheque ID: ${id}`);
    showToast(`Cheque removido com sucesso.`);
  };

  const limparBaseCincoAnos = () => {
    const cincoAnosAtras = new Date();
    cincoAnosAtras.setFullYear(cincoAnosAtras.getFullYear() - 5);
    const limiteStr = cincoAnosAtras.toISOString().split('T')[0];

    const mantidos = titulos.filter(t => {
      if (t.status === 'PAGO' && t.data_liquidacao) {
        return t.data_liquidacao >= limiteStr;
      }
      return true;
    });

    const removidosCount = titulos.length - mantidos.length;
    setTitulos(mantidos);
    addLog('Limpeza de Base', `Purga automática de ${removidosCount} títulos quitados há mais de 5 anos`);
    showToast(`Limpeza concluída: ${removidosCount} registros antigos arquivados.`);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      lastLoggedUser,
      usuarios,
      login,
      logout,
      switchUser,
      addUsuario,
      updateUsuario,
      toggleUsuarioAtivo,
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
    }}>
      {children}

      {/* Toast Notification Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161922] border border-red-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-[0_0_25px_rgba(220,38,38,0.25)] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 font-mono text-xs select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
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
