import { useState } from 'react';
import { 
  Users, Building2, Plus, X, Trash2, Search, Pencil, 
  FileText, MessageSquare, DollarSign, AlertOctagon, FilePlus, 
  CheckCircle2, Copy, MapPin, UserCheck
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Entidade, TipoEntidade, TipoPessoa } from '../../types';
import { formatCurrency, calcularSaldoDevedor, isTituloVencido } from '../../lib/utils';

export function CadastrosView() {
  const { entidades, titulos, empresaConfig, addEntidade, updateEntidade, removeEntidade, addTitulo, showToast } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'TODOS' | 'CLIENTE' | 'FORNECEDOR'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'EM_ABERTO' | 'VENCIDO'>('TODOS');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEntidade, setEditingEntidade] = useState<Entidade | null>(null);
  
  const [dossierEntidade, setDossierEntidade] = useState<Entidade | null>(null);
  
  const [quickTitleEntidade, setQuickTitleEntidade] = useState<Entidade | null>(null);
  const [quickTitleData, setQuickTitleData] = useState({
    numero_documento: '',
    valor_original: '',
    data_vencimento: new Date().toISOString().split('T')[0],
    descricao: ''
  });

  // State Completo de Cadastro
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    tipo_pessoa: 'PF' as TipoPessoa,
    tipo_entidade: 'CLIENTE' as TipoEntidade,
    email: '',
    telefone: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    ie_rg: '',
    observacoes: ''
  });

  // Helper para formatar CPF / CNPJ automaticamente com máscara
  const applyDocumentMask = (val: string, tipo: TipoPessoa) => {
    const nums = val.replace(/\D/g, '');
    if (tipo === 'PF') {
      const clean = nums.slice(0, 11);
      return clean
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      const clean = nums.slice(0, 14);
      return clean
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
  };

  // Validador de Documento
  const isDocumentValid = (doc: string, tipo: TipoPessoa) => {
    const clean = doc.replace(/\D/g, '');
    if (tipo === 'PF') return clean.length === 11;
    if (tipo === 'PJ') return clean.length === 14;
    return false;
  };

  // Metrics por entidade
  const getEntidadeMetrics = (entidadeId: string) => {
    const entTitulos = titulos.filter(t => t.id_entidade === entidadeId);
    const emAberto = entTitulos.filter(t => t.status === 'EM_ABERTO' || t.status === 'VENCIDO');
    const vencidos = entTitulos.filter(t => isTituloVencido(t));
    const pagos = entTitulos.filter(t => t.status === 'PAGO');

    const totalEmAberto = emAberto.reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);
    const totalVencido = vencidos.reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);
    const totalPago = pagos.reduce((sum, t) => sum + t.valor_original, 0);

    return {
      titulos: entTitulos,
      countTitulos: entTitulos.length,
      countEmAberto: emAberto.length,
      countVencidos: vencidos.length,
      totalEmAberto,
      totalVencido,
      totalPago
    };
  };

  // Filtragem
  const filteredEntidades = entidades
    .filter(e => activeTab === 'TODOS' || e.tipo_entidade === activeTab || e.tipo_entidade === 'AMBOS')
    .filter(e => {
      const matchSearch = 
        e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.documento.includes(searchTerm) ||
        (e.email && e.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.telefone && e.telefone.includes(searchTerm)) ||
        e.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      const metrics = getEntidadeMetrics(e.id);
      if (statusFilter === 'EM_ABERTO') return metrics.countEmAberto > 0;
      if (statusFilter === 'VENCIDO') return metrics.countVencidos > 0;

      return true;
    });

  // KPIs
  const totalClientesCount = entidades.filter(e => e.tipo_entidade === 'CLIENTE').length;
  const totalFornecedoresCount = entidades.filter(e => e.tipo_entidade === 'FORNECEDOR').length;
  const clientesComDebitoCount = entidades.filter(e => getEntidadeMetrics(e.id).totalEmAberto > 0).length;
  const clientesInadimplentesCount = entidades.filter(e => getEntidadeMetrics(e.id).totalVencido > 0).length;
  const totalSaldoGeralEmAberto = titulos
    .filter(t => t.tipo_titulo === 'RECEBER' && (t.status === 'EM_ABERTO' || t.status === 'VENCIDO'))
    .reduce((acc, t) => acc + calcularSaldoDevedor(t), 0);

  // Abrir Modal de Cadastro
  const handleOpenForm = (entidade?: Entidade) => {
    if (entidade) {
      setEditingEntidade(entidade);
      const isPJ = entidade.documento.replace(/\D/g, '').length > 11;
      setFormData({
        nome: entidade.nome,
        documento: entidade.documento,
        tipo_pessoa: entidade.tipo_pessoa || (isPJ ? 'PJ' : 'PF'),
        tipo_entidade: entidade.tipo_entidade,
        email: entidade.email || '',
        telefone: entidade.telefone || '',
        cep: entidade.cep || '',
        rua: entidade.rua || '',
        numero: entidade.numero || '',
        bairro: entidade.bairro || '',
        cidade: entidade.cidade || '',
        uf: entidade.uf || 'SP',
        ie_rg: entidade.ie_rg || '',
        observacoes: entidade.observacoes || ''
      });
    } else {
      setEditingEntidade(null);
      setFormData({
        nome: '',
        documento: '',
        tipo_pessoa: 'PF',
        tipo_entidade: activeTab === 'FORNECEDOR' ? 'FORNECEDOR' : 'CLIENTE',
        email: '',
        telefone: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: 'SP',
        ie_rg: '',
        observacoes: ''
      });
    }
    setIsFormModalOpen(true);
  };

  // Salvar Cadastro com Validações Rigorosas
  const handleSaveForm = () => {
    if (!formData.nome.trim()) {
      showToast(formData.tipo_pessoa === 'PF' ? '⚠️ Por favor, informe o Nome Completo.' : '⚠️ Por favor, informe a Razão Social.');
      return;
    }

    if (!formData.documento.trim() || !isDocumentValid(formData.documento, formData.tipo_pessoa)) {
      showToast(formData.tipo_pessoa === 'PF' ? '⚠️ Informe um CPF válido com 11 dígitos.' : '⚠️ Informe um CNPJ válido com 14 dígitos.');
      return;
    }

    if (!formData.telefone.trim()) {
      showToast('⚠️ Por favor, informe um Telefone/WhatsApp de contato.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      showToast('⚠️ Por favor, informe um E-mail de contato válido.');
      return;
    }

    if (editingEntidade) {
      updateEntidade(editingEntidade.id, formData);
    } else {
      addEntidade(formData);
    }

    setIsFormModalOpen(false);
  };

  // Lançamento Rápido de Título
  const handleOpenQuickTitle = (entidade: Entidade) => {
    setQuickTitleEntidade(entidade);
    setQuickTitleData({
      numero_documento: `NF-${Math.floor(1000 + Math.random() * 9000)}`,
      valor_original: '1500.00',
      data_vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      descricao: `Título lançado via Central de Cadastros para ${entidade.nome}`
    });
  };

  const handleSaveQuickTitle = () => {
    if (!quickTitleEntidade) return;
    const valor = parseFloat(quickTitleData.valor_original.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      showToast('Informe um valor válido para o título.');
      return;
    }
    if (!quickTitleData.numero_documento.trim()) {
      showToast('Informe o número do documento.');
      return;
    }

    addTitulo({
      id_entidade: quickTitleEntidade.id,
      tipo_titulo: quickTitleEntidade.tipo_entidade === 'FORNECEDOR' ? 'PAGAR' : 'RECEBER',
      numero_documento: quickTitleData.numero_documento,
      valor_original: valor,
      data_vencimento: quickTitleData.data_vencimento,
    });

    setQuickTitleEntidade(null);
  };

  // WhatsApp Billing Link
  const handleSendWhatsapp = (entidade: Entidade) => {
    const metrics = getEntidadeMetrics(entidade.id);
    const cleanPhone = (entidade.telefone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      showToast(`O cadastro de ${entidade.nome} não possui telefone cadastrado.`);
      return;
    }

    let message = `Olá *${entidade.nome}*, aqui é do departamento financeiro de ${empresaConfig.nomeFantasia}.`;
    if (metrics.totalVencido > 0) {
      message += ` Identificamos *R$ ${formatCurrency(metrics.totalVencido)}* em títulos vencidos sob a sua titularidade. Podemos enviar a 2ª via do boleto para quitação?`;
    } else if (metrics.totalEmAberto > 0) {
      message += ` Lembrando sobre o seu débito de *R$ ${formatCurrency(metrics.totalEmAberto)}* a vencer no nosso sistema. Qual a melhor data de confirmação do pagamento?`;
    } else {
      message += ` Obrigado por manter suas obrigações financeiras em dia com a nossa empresa!`;
    }

    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyDocument = (doc: string) => {
    navigator.clipboard.writeText(doc);
    showToast(`Documento ${doc} copiado para a área de transferência!`);
  };

  // Obter domínio dinâmico do e-mail da empresa configurada
  const empresaDomain = empresaConfig.email ? empresaConfig.email.split('@')[1] : 'suaempresa.com.br';

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 select-none text-slate-200">
      
      {/* KPI Cards Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total de Cadastros</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-slate-100">{entidades.length}</span>
              <span className="text-[11px] text-slate-400 font-mono">({totalClientesCount} C | {totalFornecedoresCount} F)</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clientes com Débitos</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-amber-400">{clientesComDebitoCount}</span>
              <span className="text-[11px] text-slate-400">clientes ativos</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inadimplentes (Vencidos)</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-red-500">{clientesInadimplentesCount}</span>
              <span className="text-[11px] text-red-400 font-medium">Requer Cobrança</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertOctagon size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Carteira em Aberto</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-emerald-400 font-mono">R$ {formatCurrency(totalSaldoGeralEmAberto)}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Building2 size={18} />
          </div>
        </div>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between bg-[#161922] border border-[#2b3242] rounded-xl p-2.5 gap-3 shadow-md">
        
        {/* Tabs: TODOS | CLIENTES | FORNECEDORES */}
        <div className="flex items-center bg-[#1c202c] p-1 rounded-lg border border-[#2e3648]">
          <button
            onClick={() => setActiveTab('TODOS')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'TODOS' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({entidades.length})
          </button>
          <button
            onClick={() => setActiveTab('CLIENTE')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'CLIENTE' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={13} /> Clientes ({totalClientesCount})
          </button>
          <button
            onClick={() => setActiveTab('FORNECEDOR')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'FORNECEDOR' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 size={13} /> Fornecedores ({totalFornecedoresCount})
          </button>
        </div>

        {/* Quick Financial Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('TODOS')}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              statusFilter === 'TODOS' ? 'bg-[#222836] border-slate-500 text-white' : 'border-[#2d3548] text-slate-400 hover:text-slate-200'
            }`}
          >
            Filtrar: Todos
          </button>
          <button
            onClick={() => setStatusFilter('EM_ABERTO')}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              statusFilter === 'EM_ABERTO' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-[#2d3548] text-slate-400 hover:text-slate-200'
            }`}
          >
            Com Débitos ({clientesComDebitoCount})
          </button>
          <button
            onClick={() => setStatusFilter('VENCIDO')}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              statusFilter === 'VENCIDO' ? 'bg-red-500/20 border-red-500 text-red-300' : 'border-[#2d3548] text-slate-400 hover:text-slate-200'
            }`}
          >
            Inadimplentes ({clientesInadimplentesCount})
          </button>
        </div>

        {/* Search Input & Add Button */}
        <div className="flex items-center gap-2 flex-1 md:flex-none">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF/CNPJ, e-mail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#111319] border border-[#2b3242] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500/60 placeholder:text-slate-600 font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] shrink-0"
          >
            <Plus size={15} />
            Novo Cadastro
          </button>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-[#161922] border border-[#2b3242] rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 z-10 font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Nome / Razão Social</th>
                <th className="px-4 py-3 font-semibold">Documento (CPF/CNPJ)</th>
                <th className="px-4 py-3 font-semibold">Telefone / Contato</th>
                <th className="px-4 py-3 font-semibold">Resumo Financeiro</th>
                <th className="px-4 py-3 font-semibold text-center">Ações Conectadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232836]">
              {filteredEntidades.map((entidade) => {
                const metrics = getEntidadeMetrics(entidade.id);
                const isCliente = entidade.tipo_entidade === 'CLIENTE';

                return (
                  <tr key={entidade.id} className="hover:bg-[#1f2432]/70 transition-colors group">
                    
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-slate-400 font-medium">
                      <span className="bg-[#1e2330] border border-[#2e3748] px-2 py-0.5 rounded text-[10px]">
                        {entidade.id}
                      </span>
                    </td>

                    {/* Nome & Tipo Badge */}
                    <td className="px-4 py-3 font-medium text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCliente ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}>
                          {entidade.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-100 text-sm group-hover:text-red-400 transition-colors">
                              {entidade.nome}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold tracking-wider uppercase border ${
                              isCliente ? 'bg-red-950/60 border-red-800 text-red-400' : 'bg-blue-950/60 border-blue-800 text-blue-400'
                            }`}>
                              {entidade.tipo_entidade}
                            </span>
                          </div>
                          {entidade.email && (
                            <span className="text-[11px] text-slate-400 block font-sans">{entidade.email}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CPF / CNPJ */}
                    <td className="px-4 py-3 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>{entidade.documento}</span>
                        <button
                          onClick={() => handleCopyDocument(entidade.documento)}
                          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                          title="Copiar documento"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>

                    {/* Telefone & WhatsApp Action */}
                    <td className="px-4 py-3">
                      {entidade.telefone ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300">{entidade.telefone}</span>
                          <button
                            onClick={() => handleSendWhatsapp(entidade)}
                            className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                            title="Cobrar / Falar no WhatsApp"
                          >
                            <MessageSquare size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Não informado</span>
                      )}
                    </td>

                    {/* Resumo Financeiro Interligado */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDossierEntidade(entidade)}
                        className="text-left w-full hover:opacity-80 transition-opacity"
                        title="Clique para ver o Dossiê Financeiro Completo"
                      >
                        {metrics.totalVencido > 0 ? (
                          <div className="inline-flex flex-col">
                            <span className="inline-flex items-center gap-1 text-red-400 font-extrabold text-xs font-mono">
                              <AlertOctagon size={12} className="text-red-500 animate-pulse" />
                              R$ {formatCurrency(metrics.totalVencido)} VENCIDO
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {metrics.countVencidos} título(s) em atraso
                            </span>
                          </div>
                        ) : metrics.totalEmAberto > 0 ? (
                          <div className="inline-flex flex-col">
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs font-mono">
                              <DollarSign size={12} className="text-amber-400" />
                              R$ {formatCurrency(metrics.totalEmAberto)} em aberto
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {metrics.countEmAberto} título(s) a vencer
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} /> Sem débitos
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Ações Conectadas (Visíveis e Interativas) */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Ver Dossiê Financeiro */}
                        <button
                          onClick={() => setDossierEntidade(entidade)}
                          className="p-1.5 bg-[#222836] text-sky-400 hover:bg-sky-600 hover:text-white border border-sky-500/30 rounded-lg transition-all"
                          title="Abrir Dossiê Financeiro Completo"
                        >
                          <FileText size={14} />
                        </button>

                        {/* Novo Título Direto */}
                        <button
                          onClick={() => handleOpenQuickTitle(entidade)}
                          className="p-1.5 bg-[#222836] text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 rounded-lg transition-all"
                          title="Lançar Novo Título para este Cadastro"
                        >
                          <FilePlus size={14} />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleOpenForm(entidade)}
                          className="p-1.5 bg-[#222836] text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/40 rounded-lg transition-all"
                          title="Editar Cadastro"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja excluir o cadastro de "${entidade.nome}"?`)) {
                              removeEntidade(entidade.id);
                            }
                          }}
                          className="p-1.5 bg-[#222836] text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg transition-all"
                          title="Excluir Cadastro"
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredEntidades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum cadastro encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[#111319] border-t border-[#2b3242] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Exibindo <b>{filteredEntidades.length}</b> de <b>{entidades.length}</b> cadastros</span>
          <span className="font-mono text-slate-400">Total em carteira ativa: R$ {formatCurrency(totalSaldoGeralEmAberto)}</span>
        </div>
      </div>

      {/* MODAL 1: FORM CADASTRO COMPLETO (CPF / CNPJ + ENDEREÇO + VALIDAÇÕES + PLACEHOLDERS DINÂMICOS) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsFormModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#181c26] border border-[#2e374a] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 text-slate-200 max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b border-[#2e374a] flex items-center justify-between bg-[#13161f]">
              <div className="flex items-center gap-2">
                <Users className="text-red-500" size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  {editingEntidade ? `Editar Cadastro: ${editingEntidade.nome}` : 'Novo Cadastro no Sistema'}
                </h2>
              </div>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* SELETOR 1: TIPO DE PESSOA (CPF vs CNPJ) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Tipo de Pessoa & Documento *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newDoc = applyDocumentMask(formData.documento, 'PF');
                      setFormData({...formData, tipo_pessoa: 'PF', documento: newDoc});
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formData.tipo_pessoa === 'PF'
                        ? 'bg-red-600 border-red-500 text-white shadow-md'
                        : 'bg-[#11131a] border-[#2d364a] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span>Pessoa Física (CPF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newDoc = applyDocumentMask(formData.documento, 'PJ');
                      setFormData({...formData, tipo_pessoa: 'PJ', documento: newDoc});
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formData.tipo_pessoa === 'PJ'
                        ? 'bg-red-600 border-red-500 text-white shadow-md'
                        : 'bg-[#11131a] border-[#2d364a] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 size={16} />
                    <span>Pessoa Jurídica (CNPJ)</span>
                  </button>
                </div>
              </div>

              {/* SEÇÃO DADOS PRINCIPAIS (Placeholders limpos e dinâmicos) */}
              <div className="bg-[#11131a] p-4 rounded-xl border border-[#283144] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Nome Completo (PF) ou Razão Social (PJ) */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {formData.tipo_pessoa === 'PF' ? 'Nome Completo' : 'Razão Social / Nome Fantasia'} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500 font-medium placeholder:text-slate-600" 
                      placeholder={formData.tipo_pessoa === 'PF' ? "Nome completo do titular" : `Razão social ou nome da empresa`}
                      required
                    />
                  </div>

                  {/* CPF ou CNPJ com validação e máscara automática */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {formData.tipo_pessoa === 'PF' ? 'CPF' : 'CNPJ'} <span className="text-red-500">*</span>
                      </label>
                      {formData.documento && (
                        <span className={`text-[10px] font-mono font-bold ${
                          isDocumentValid(formData.documento, formData.tipo_pessoa) ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isDocumentValid(formData.documento, formData.tipo_pessoa) ? '✓ Válido' : '⚠️ Inválido'}
                        </span>
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={formData.documento}
                      onChange={e => {
                        const masked = applyDocumentMask(e.target.value, formData.tipo_pessoa);
                        setFormData({...formData, documento: masked});
                      }}
                      className={`w-full bg-[#181c26] border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none font-mono placeholder:text-slate-600 ${
                        formData.documento && !isDocumentValid(formData.documento, formData.tipo_pessoa)
                          ? 'border-red-500'
                          : 'border-[#2d364a] focus:border-red-500'
                      }`} 
                      placeholder={formData.tipo_pessoa === 'PF' ? "000.000.000-00" : "00.000.000/0001-00"}
                      required
                    />
                  </div>

                  {/* RG ou IE (Opcional) */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {formData.tipo_pessoa === 'PF' ? 'RG / Órgão Emissor' : 'Inscrição Estadual (I.E.)'} <span className="text-slate-500">(Opcional)</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.ie_rg}
                      onChange={e => setFormData({...formData, ie_rg: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500 font-mono placeholder:text-slate-600" 
                      placeholder={formData.tipo_pessoa === 'PF' ? "Número do RG" : "Inscrição estadual ou Isento"}
                    />
                  </div>

                  {/* Telefone / WhatsApp */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Telefone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.telefone}
                      onChange={e => setFormData({...formData, telefone: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500 font-mono placeholder:text-slate-600" 
                      placeholder={empresaConfig.telefone ? `Ex: ${empresaConfig.telefone}` : "(00) 00000-0000"}
                      required
                    />
                  </div>

                  {/* E-mail de Contato (Dinamico da Empresa) */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      E-mail de Contato <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500 placeholder:text-slate-600" 
                      placeholder={`contato@${empresaDomain}`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO ENDEREÇO ESTRUTURADO COMPLETO */}
              <div className="bg-[#11131a] p-4 rounded-xl border border-[#283144] space-y-3">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#283144] pb-2">
                  <MapPin size={13} className="text-red-500" /> Endereço Completo
                </h4>

                <div className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-4">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">CEP</label>
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={formData.cep}
                      onChange={e => setFormData({...formData, cep: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="col-span-8">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      placeholder="Nome da rua, avenida ou alameda"
                      value={formData.rua}
                      onChange={e => setFormData({...formData, rua: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Número</label>
                    <input
                      type="text"
                      placeholder="S/N ou N°"
                      value={formData.numero}
                      onChange={e => setFormData({...formData, numero: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Bairro</label>
                    <input
                      type="text"
                      placeholder="Nome do bairro"
                      value={formData.bairro}
                      onChange={e => setFormData({...formData, bairro: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Cidade</label>
                    <input
                      type="text"
                      placeholder="Nome da cidade"
                      value={formData.cidade}
                      onChange={e => setFormData({...formData, cidade: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">UF</label>
                    <select
                      value={formData.uf}
                      onChange={e => setFormData({...formData, uf: e.target.value})}
                      className="w-full bg-[#181c26] border border-[#2d364a] rounded-lg px-2 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="SP">SP</option>
                      <option value="RS">RS</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                      <option value="PR">PR</option>
                      <option value="SC">SC</option>
                      <option value="BA">BA</option>
                      <option value="GO">GO</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO TIPO DE CADASTRO */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Classificação da Entidade
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.tipo_entidade === 'CLIENTE' ? 'bg-red-500/15 border-red-500 text-white' : 'bg-[#11131a] border-[#2d364a] text-slate-400'
                  }`}>
                    <input 
                      type="radio" 
                      name="tipo_entidade" 
                      checked={formData.tipo_entidade === 'CLIENTE'}
                      onChange={() => setFormData({...formData, tipo_entidade: 'CLIENTE'})}
                      className="text-red-500" 
                    /> 
                    <Users size={16} />
                    <span className="text-xs font-semibold">Cliente (Contas a Receber)</span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.tipo_entidade === 'FORNECEDOR' ? 'bg-blue-500/15 border-blue-500 text-white' : 'bg-[#11131a] border-[#2d364a] text-slate-400'
                  }`}>
                    <input 
                      type="radio" 
                      name="tipo_entidade" 
                      checked={formData.tipo_entidade === 'FORNECEDOR'}
                      onChange={() => setFormData({...formData, tipo_entidade: 'FORNECEDOR'})}
                      className="text-blue-500" 
                    /> 
                    <Building2 size={16} />
                    <span className="text-xs font-semibold">Fornecedor (Contas a Pagar)</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#2e374a] bg-[#13161f] flex items-center justify-between rounded-b-2xl">
              <span className="text-[10px] font-mono text-slate-400">* Campos obrigatórios</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsFormModalOpen(false)} 
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#252c3c] border border-[#2e374a] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveForm} 
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  {editingEntidade ? 'Atualizar Cadastro' : 'Salvar Novo Cadastro'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Dossiê Financeiro do Cliente */}
      {dossierEntidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setDossierEntidade(null)}></div>
          <div className="relative w-full max-w-3xl bg-[#181c26] border border-[#2e374a] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#2e374a] bg-[#13161f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold text-lg">
                  {dossierEntidade.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                    {dossierEntidade.nome}
                    <span className="text-xs bg-red-950 border border-red-700 text-red-300 px-2 py-0.5 rounded-full font-mono">
                      {dossierEntidade.tipo_entidade}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Doc: {dossierEntidade.documento} | Tel: {dossierEntidade.telefone || 'N/A'} | Email: {dossierEntidade.email || 'N/A'}
                  </p>
                </div>
              </div>

              <button onClick={() => setDossierEntidade(null)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Financial Stat Cards */}
              {(() => {
                const metrics = getEntidadeMetrics(dossierEntidade.id);
                return (
                  <>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-[#11141c] border border-[#293144] p-3 rounded-xl">
                        <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Total de Títulos</p>
                        <p className="text-lg font-black text-slate-100 mt-0.5">{metrics.countTitulos}</p>
                      </div>

                      <div className="bg-[#11141c] border border-[#293144] p-3 rounded-xl">
                        <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Total Pago</p>
                        <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">R$ {formatCurrency(metrics.totalPago)}</p>
                      </div>

                      <div className="bg-[#11141c] border border-[#293144] p-3 rounded-xl">
                        <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Saldo em Aberto</p>
                        <p className="text-lg font-black text-amber-400 font-mono mt-0.5">R$ {formatCurrency(metrics.totalEmAberto)}</p>
                      </div>

                      <div className="bg-[#11141c] border border-[#293144] p-3 rounded-xl">
                        <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Saldo Vencido</p>
                        <p className="text-lg font-black text-red-500 font-mono mt-0.5">R$ {formatCurrency(metrics.totalVencido)}</p>
                      </div>
                    </div>

                    {/* Endereço Cadastrado */}
                    {dossierEntidade.rua && (
                      <div className="bg-[#11141c] border border-[#293144] p-3 rounded-xl font-mono text-xs">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Endereço de Entrega / Cobrança:</span>
                        <p className="text-slate-200">
                          {dossierEntidade.rua}, N° {dossierEntidade.numero || 'S/N'} - {dossierEntidade.bairro} - {dossierEntidade.cidade}/{dossierEntidade.uf} (CEP: {dossierEntidade.cep})
                        </p>
                      </div>
                    )}

                    {/* Action buttons inside Dossier */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          const currentEnt = dossierEntidade;
                          setDossierEntidade(null);
                          handleOpenQuickTitle(currentEnt);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        <FilePlus size={15} /> Lançar Novo Título para {dossierEntidade.nome}
                      </button>

                      <button
                        onClick={() => handleSendWhatsapp(dossierEntidade)}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-700/30 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600 hover:text-white py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        <MessageSquare size={15} /> Notificar via WhatsApp
                      </button>
                    </div>

                    {/* Titles Table for this Client */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                        <Building2 size={14} className="text-red-500" />
                        Histórico de Títulos e Movimentações
                      </h3>

                      <div className="border border-[#293144] rounded-xl overflow-hidden bg-[#11141c]">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-[#181d28] text-slate-400 border-b border-[#293144] font-mono text-[10px]">
                            <tr>
                              <th className="p-2.5">Documento</th>
                              <th className="p-2.5">Tipo</th>
                              <th className="p-2.5">Vencimento</th>
                              <th className="p-2.5">Valor Original</th>
                              <th className="p-2.5">Saldo Devedor</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#232938]">
                            {metrics.titulos.map(t => (
                              <tr key={t.id} className="hover:bg-[#1a1f2c]">
                                <td className="p-2.5 font-mono text-slate-200 font-bold">{t.numero_documento}</td>
                                <td className="p-2.5">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                    t.tipo_titulo === 'RECEBER' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'
                                  }`}>
                                    {t.tipo_titulo}
                                  </span>
                                </td>
                                <td className="p-2.5 font-mono text-slate-300">{t.data_vencimento}</td>
                                <td className="p-2.5 font-mono">R$ {formatCurrency(t.valor_original)}</td>
                                <td className="p-2.5 font-mono text-slate-200 font-bold">R$ {formatCurrency(calcularSaldoDevedor(t))}</td>
                                <td className="p-2.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                                    t.status === 'PAGO' ? 'bg-emerald-500/20 text-emerald-400' :
                                    isTituloVencido(t) ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                                  }`}>
                                    {t.status === 'PAGO' ? 'PAGO' : isTituloVencido(t) ? 'VENCIDO' : 'EM ABERTO'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {metrics.titulos.length === 0 && (
                              <tr>
                                <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                                  Nenhum título vinculado a este cadastro ainda.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>

            <div className="px-6 py-3 border-t border-[#2e374a] bg-[#13161f] flex justify-end">
              <button
                onClick={() => setDossierEntidade(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#222836] text-slate-300 hover:bg-[#2d3548] rounded-lg transition-all"
              >
                Fechar Dossiê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Lançamento Rápido de Título vinculado ao Cadastro */}
      {quickTitleEntidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setQuickTitleEntidade(null)}></div>
          <div className="relative w-full max-w-md bg-[#181c26] border border-[#2e374a] rounded-2xl shadow-2xl flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-5 py-4 border-b border-[#2e374a] bg-[#13161f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilePlus className="text-emerald-400" size={18} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  Lançar Título para {quickTitleEntidade.nome}
                </h2>
              </div>
              <button onClick={() => setQuickTitleEntidade(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Número do Documento / Nota Fiscal
                </label>
                <input
                  type="text"
                  value={quickTitleData.numero_documento}
                  onChange={e => setQuickTitleData({...quickTitleData, numero_documento: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2d364a] rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: NF-1099"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Valor Original (R$)
                  </label>
                  <input
                    type="text"
                    value={quickTitleData.valor_original}
                    onChange={e => setQuickTitleData({...quickTitleData, valor_original: e.target.value})}
                    className="w-full bg-[#11131a] border border-[#2d364a] rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="1500,00"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={quickTitleData.data_vencimento}
                    onChange={e => setQuickTitleData({...quickTitleData, data_vencimento: e.target.value})}
                    className="w-full bg-[#11131a] border border-[#2d364a] rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Descrição / Observações
                </label>
                <textarea
                  rows={2}
                  value={quickTitleData.descricao}
                  onChange={e => setQuickTitleData({...quickTitleData, descricao: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2d364a] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Detalhes adicionais do título..."
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-[#2e374a] bg-[#13161f] flex justify-end gap-3">
              <button
                onClick={() => setQuickTitleEntidade(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#252c3c] border border-[#2e374a] rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuickTitle}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Confirmar Lançamento
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
