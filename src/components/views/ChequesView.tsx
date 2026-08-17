import { useState, FormEvent } from 'react';
import { 
  Plus, Trash2, CheckCircle2, XCircle, Search, 
  CreditCard, LayoutGrid, Table, Building2, Calendar, DollarSign, Wallet, RotateCcw,
  UserCheck, ShieldCheck, Info, Clock, User
} from 'lucide-react';
import { useAppContext, ChequeItem } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../lib/utils';

export function ChequesView() {
  const { cheques, addCheque, updateChequeStatus, removeCheque, showToast, currentUser } = useAppContext();

  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS'); // Default Cards
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'RECEBIDO' | 'EMITIDO' | 'EM_ABERTO' | 'COMPENSADO' | 'DEVOLVIDO'>('TODOS');
  const [selectedChequeForAudit, setSelectedChequeForAudit] = useState<ChequeItem | null>(null);

  // Form local
  const [formData, setFormData] = useState({
    titular: '',
    banco: 'Itaú (341)',
    agencia: '',
    conta: '',
    numeroCheque: '',
    valor: '',
    vencimento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tipo: 'RECEBIDO' as 'EMITIDO' | 'RECEBIDO'
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.titular.trim() || !formData.valor || !formData.vencimento) {
      showToast('Preencha os campos obrigatórios: Titular, Valor e Vencimento.');
      return;
    }
    
    const valNum = parseFloat(formData.valor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valNum) || valNum <= 0) {
      showToast('Informe um valor de cheque válido.');
      return;
    }

    addCheque({
      titular: formData.titular,
      banco: formData.banco || 'Itaú (341)',
      agencia: formData.agencia || '0001',
      conta: formData.conta || '00000-0',
      numeroCheque: formData.numeroCheque || `CH-${Math.floor(100000 + Math.random() * 900000)}`,
      valor: valNum,
      vencimento: formData.vencimento,
      tipo: formData.tipo,
    });

    setFormData({
      titular: '',
      banco: 'Itaú (341)',
      agencia: '',
      conta: '',
      numeroCheque: '',
      valor: '',
      vencimento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tipo: 'RECEBIDO'
    });
  };

  // Formatador de data e hora para auditoria
  const formatDateTimeBR = (isoString?: string) => {
    if (!isoString) return '---';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoString;
    }
  };

  // Filtragem
  const filteredCheques = cheques.filter(c => {
    const matchSearch = 
      c.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numeroCheque.includes(searchTerm) ||
      c.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.criado_por_nome && c.criado_por_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.agencia.includes(searchTerm) ||
      c.conta.includes(searchTerm);

    if (!matchSearch) return false;

    if (statusFilter === 'RECEBIDO') return c.tipo === 'RECEBIDO';
    if (statusFilter === 'EMITIDO') return c.tipo === 'EMITIDO';
    if (statusFilter === 'EM_ABERTO') return c.status === 'EM ABERTO';
    if (statusFilter === 'COMPENSADO') return c.status === 'COMPENSADO';
    if (statusFilter === 'DEVOLVIDO') return c.status === 'DEVOLVIDO';

    return true;
  });

  // Métricas
  const totalRecebidosCustodia = cheques
    .filter(c => c.tipo === 'RECEBIDO' && c.status === 'EM ABERTO')
    .reduce((acc, c) => acc + c.valor, 0);

  const totalEmitidos = cheques
    .filter(c => c.tipo === 'EMITIDO' && c.status === 'EM ABERTO')
    .reduce((acc, c) => acc + c.valor, 0);

  const countCompensados = cheques.filter(c => c.status === 'COMPENSADO').length;
  const countDevolvidos = cheques.filter(c => c.status === 'DEVOLVIDO').length;

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 select-none text-slate-200 overflow-hidden">
      
      {/* 4 Cards Gerenciais de Cheques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        
        <div className="bg-[#161922] border border-[#2b3242] p-3.5 rounded-2xl flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Wallet size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Recebidos em Custódia</span>
            <span className="text-base font-black text-slate-100 font-mono">
              R$ {formatCurrency(totalRecebidosCustodia)}
            </span>
          </div>
        </div>

        <div className="bg-[#161922] border border-[#2b3242] p-3.5 rounded-2xl flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Cheques Emitidos</span>
            <span className="text-base font-black text-slate-100 font-mono">
              R$ {formatCurrency(totalEmitidos)}
            </span>
          </div>
        </div>

        <div className="bg-[#161922] border border-[#2b3242] p-3.5 rounded-2xl flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Compensados</span>
            <span className="text-base font-black text-slate-100 font-mono">
              {countCompensados} cheques
            </span>
          </div>
        </div>

        <div className="bg-[#161922] border border-[#2b3242] p-3.5 rounded-2xl flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400">
            <RotateCcw size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Devolvidos</span>
            <span className="text-base font-black text-slate-100 font-mono">
              {countDevolvidos} cheques
            </span>
          </div>
        </div>

      </div>

      {/* Formulário de Novo Cheque (Compacto & Elegante) */}
      <div className="bg-[#161922] border border-[#2b3242] p-4 rounded-2xl shadow-xl shrink-0">
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          <div className="md:col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Tipo de Operação</label>
            <select
              value={formData.tipo}
              onChange={e => setFormData({ ...formData, tipo: e.target.value as 'EMITIDO' | 'RECEBIDO' })}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500 font-bold"
            >
              <option value="RECEBIDO">📥 RECEBIDO (De Cliente)</option>
              <option value="EMITIDO">📤 EMITIDO (Pela Empresa)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Titular da Folha *</label>
            <input
              type="text"
              placeholder="Razão Social ou Nome do Titular"
              value={formData.titular}
              onChange={e => setFormData({ ...formData, titular: e.target.value })}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 font-semibold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Banco & Cheque N°</label>
            <input
              type="text"
              placeholder="N° Cheque (Ex: 000123)"
              value={formData.numeroCheque}
              onChange={e => setFormData({ ...formData, numeroCheque: e.target.value })}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Valor (R$) *</label>
            <input
              type="text"
              placeholder="0,00"
              value={formData.valor}
              onChange={e => setFormData({ ...formData, valor: e.target.value })}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Bom Para *</label>
            <input
              type="date"
              value={formData.vencimento}
              onChange={e => setFormData({ ...formData, vencimento: e.target.value })}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center justify-center gap-1"
            >
              <Plus size={16} /> Salvar
            </button>
          </div>

        </form>
      </div>

      {/* Barra de Seleção de Visualização e Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-[#161922] border border-[#2b3242] p-2.5 rounded-2xl shrink-0">
        
        {/* Modos de Exibição */}
        <div className="flex items-center gap-1 bg-[#11131a] p-1 rounded-xl border border-[#232838]">
          <button
            onClick={() => setViewMode('CARDS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'CARDS' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid size={14} /> Cards 3D
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'TABLE' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table size={14} /> Tabela com Auditoria
          </button>
        </div>

        {/* Filtros por Status */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'TODOS' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({cheques.length})
          </button>
          <button
            onClick={() => setStatusFilter('RECEBIDO')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'RECEBIDO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recebidos ({cheques.filter(c => c.tipo === 'RECEBIDO').length})
          </button>
          <button
            onClick={() => setStatusFilter('EMITIDO')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'EMITIDO' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Emitidos ({cheques.filter(c => c.tipo === 'EMITIDO').length})
          </button>
          <button
            onClick={() => setStatusFilter('EM_ABERTO')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'EM_ABERTO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Em Aberto ({cheques.filter(c => c.status === 'EM ABERTO').length})
          </button>
        </div>

        {/* Busca por titular/banco */}
        <div className="relative w-full md:w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por titular, banco, usuário..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
          />
        </div>
      </div>

      {/* ÁREA PRINCIPAL: MODO CARDS 3D DE CHEQUE vs MODO TABELA */}
      <div className="flex-1 overflow-y-auto">
        
        {viewMode === 'CARDS' ? (
          /* MODO CARTÕES VISUAIS DE CHEQUE 3D */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-2">
            {filteredCheques.map((c) => (
              <div 
                key={c.id} 
                className="relative bg-gradient-to-br from-[#1c2230] via-[#161922] to-[#12141c] border border-[#2d374a] hover:border-red-500/50 rounded-2xl p-4 shadow-xl flex flex-col justify-between group transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Marca d'água de Cheque Bancário */}
                <div className="absolute top-2 right-4 text-slate-700/20 font-black text-4xl select-none pointer-events-none font-mono">
                  CHEQUE
                </div>

                {/* Top Cheque Card Header */}
                <div className="flex items-center justify-between mb-3 border-b border-[#283144] pb-2.5 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#222838] border border-[#323d54] flex items-center justify-center font-bold text-xs text-slate-200">
                      <Building2 size={16} className="text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-xs tracking-wide">{c.banco}</h4>
                      <p className="text-[10px] font-mono text-slate-400">Ag: {c.agencia} | CC: {c.conta}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                    c.tipo === 'RECEBIDO' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' : 'bg-red-950/80 border-red-700 text-red-300'
                  }`}>
                    {c.tipo}
                  </span>
                </div>

                {/* Body Cheque Info */}
                <div className="space-y-2 mb-3 z-10">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Titular da Folha:</span>
                    <span className="text-[10px] font-mono bg-[#202738] text-slate-300 px-2 py-0.5 rounded border border-[#2d374a]">
                      N° {c.numeroCheque}
                    </span>
                  </div>
                  
                  <p className="text-sm font-black text-slate-100 uppercase tracking-wide truncate">
                    {c.titular}
                  </p>

                  <div className="bg-[#11131a] p-2.5 rounded-xl border border-[#283144] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Valor Nominal:</span>
                      <span className="text-base font-black text-slate-100 font-mono">
                        R$ {formatCurrency(c.valor)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase text-right">Bom Para:</span>
                      <span className="text-xs font-mono font-bold text-red-400 block text-right">
                        {formatDateBR(c.vencimento)}
                      </span>
                    </div>
                  </div>

                  {/* Selo de Auditoria / Rastreamento do Usuário */}
                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-[#232a3c]">
                    <span className="flex items-center gap-1 text-slate-300 truncate" title={`Registrado por ${c.criado_por_nome || 'Sistema'}`}>
                      <User size={12} className="text-red-400 shrink-0" />
                      <span className="truncate">{c.criado_por_nome || 'Sistema'}</span>
                    </span>
                    <button
                      onClick={() => setSelectedChequeForAudit(c)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold hover:underline shrink-0"
                    >
                      <Info size={12} /> Rastreio
                    </button>
                  </div>
                </div>

                {/* Footer Cheque Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#283144] z-10">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    c.status === 'EM ABERTO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    c.status === 'COMPENSADO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    ● {c.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {c.status === 'EM ABERTO' ? (
                      <>
                        <button
                          onClick={() => updateChequeStatus(c.id, 'COMPENSADO')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm"
                          title="Compensar Cheque"
                        >
                          <CheckCircle2 size={12} /> Compensar
                        </button>
                        <button
                          onClick={() => updateChequeStatus(c.id, 'DEVOLVIDO')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm"
                          title="Marcar como Devolvido"
                        >
                          <XCircle size={12} /> Devolver
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateChequeStatus(c.id, 'EM ABERTO')}
                        className="px-2 py-1 bg-[#222836] text-slate-300 hover:bg-slate-700 rounded-lg text-[10px] font-medium flex items-center gap-1"
                        title="Reabrir Cheque"
                      >
                        <RotateCcw size={12} /> Reabrir
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Remover cheque N° ${c.numeroCheque}?`)) removeCheque(c.id);
                      }}
                      className="p-1 bg-[#222836] text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Excluir Cheque"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {filteredCheques.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 italic bg-[#161922] border border-[#2b3242] rounded-2xl">
                Nenhum cheque encontrado com o filtro selecionado.
              </div>
            )}
          </div>
        ) : (
          /* MODO TABELA ESTRUTURADA COM AUDITORIA */
          <div className="bg-[#161922] border border-[#2b3242] rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] font-mono">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Titular / Cheque N°</th>
                  <th className="px-4 py-3 font-semibold">Banco / Ag. / CC</th>
                  <th className="px-4 py-3 font-semibold text-right">Valor Nominal</th>
                  <th className="px-4 py-3 font-semibold text-center">Vencimento</th>
                  <th className="px-4 py-3 font-semibold">Registrado Por (Auditoria)</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232836]">
                {filteredCheques.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1f2432]/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${c.tipo === 'RECEBIDO' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-100">
                      <div className="font-bold">{c.titular}</div>
                      <div className="text-[10px] font-mono text-slate-400">CH: {c.numeroCheque}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      <div>{c.banco}</div>
                      <div className="text-[10px] text-slate-500">Ag: {c.agencia} | CC: {c.conta}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-right font-bold text-slate-100">
                      R$ {formatCurrency(c.valor)}
                    </td>
                    <td className="px-4 py-3 font-mono text-center text-slate-300">
                      {formatDateBR(c.vencimento)}
                    </td>

                    {/* Coluna de Auditoria do Usuário Criador */}
                    <td className="px-4 py-3 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                        <User size={13} className="text-red-400 shrink-0" />
                        <span>{c.criado_por_nome || 'Sistema'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {formatDateTimeBR(c.criado_em)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        c.status === 'EM ABERTO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        c.status === 'COMPENSADO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        <button
                          onClick={() => setSelectedChequeForAudit(c)}
                          className="p-1.5 bg-[#232b3c] text-slate-300 hover:text-white rounded-lg transition-all"
                          title="Detalhes de Auditoria"
                        >
                          <Info size={14} />
                        </button>

                        {c.status === 'EM ABERTO' ? (
                          <>
                            <button
                              onClick={() => updateChequeStatus(c.id, 'COMPENSADO')}
                              className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                              title="Compensar Cheque"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button
                              onClick={() => updateChequeStatus(c.id, 'DEVOLVIDO')}
                              className="p-1.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white rounded-lg transition-all"
                              title="Devolver Cheque"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => updateChequeStatus(c.id, 'EM ABERTO')}
                            className="p-1.5 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-all"
                            title="Reabrir Cheque"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => removeCheque(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Excluir Cheque"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal de Detalhes & Rastreamento de Auditoria do Cheque */}
      {selectedChequeForAudit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-[#2b3242] rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100">
            
            <div className="flex justify-between items-center border-b border-[#2b3242] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Histórico de Auditoria do Cheque</h3>
              </div>
              <button 
                onClick={() => setSelectedChequeForAudit(null)}
                className="text-slate-400 hover:text-slate-100 p-1 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              
              {/* Resumo do Cheque */}
              <div className="bg-[#11131a] p-4 rounded-2xl border border-[#232938] space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Titular:</span>
                  <span className="text-slate-100 font-bold">{selectedChequeForAudit.titular}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Número do Cheque:</span>
                  <span className="text-slate-100 font-bold">{selectedChequeForAudit.numeroCheque}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Banco / Conta:</span>
                  <span className="text-slate-100">{selectedChequeForAudit.banco} ({selectedChequeForAudit.agencia}/{selectedChequeForAudit.conta})</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-[#1e2434]">
                  <span>Valor Nominal:</span>
                  <span className="text-emerald-400 font-black text-sm">R$ {formatCurrency(selectedChequeForAudit.valor)}</span>
                </div>
              </div>

              {/* Trilhas de Registro */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Trilha de Responsabilidade</span>

                {/* Criador */}
                <div className="bg-[#1a1f2e] p-3.5 rounded-xl border border-emerald-500/30 flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-emerald-400 font-bold block">Registrado Por:</span>
                    <span className="text-xs font-bold text-slate-100">{selectedChequeForAudit.criado_por_nome || 'Sistema / Importado'}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{formatDateTimeBR(selectedChequeForAudit.criado_em)}</span>
                  </div>
                </div>

                {/* Último Atualizador */}
                {selectedChequeForAudit.atualizado_por_nome ? (
                  <div className="bg-[#1a1f2e] p-3.5 rounded-xl border border-blue-500/30 flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-blue-400 font-bold block">Última Alteração de Status Por:</span>
                      <span className="text-xs font-bold text-slate-100">{selectedChequeForAudit.atualizado_por_nome}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{formatDateTimeBR(selectedChequeForAudit.atualizado_em)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#11131a] p-3 rounded-xl border border-[#232938] text-[11px] text-slate-500 italic text-center">
                    Nenhuma alteração de status registrada após o cadastro inicial.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#2b3242] flex justify-end">
                <button
                  onClick={() => setSelectedChequeForAudit(null)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  Fechar Auditoria
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
