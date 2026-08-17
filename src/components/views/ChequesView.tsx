import { useState, FormEvent } from 'react';
import { 
  Plus, Trash2, CheckCircle2, XCircle, Search, 
  CreditCard, LayoutGrid, Table, Building2, Calendar, DollarSign, Wallet, RotateCcw
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../lib/utils';
import { ChequeItem } from '../../context/AppContext';

export function ChequesView() {
  const { cheques, addCheque, updateChequeStatus, removeCheque, showToast } = useAppContext();

  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS'); // Default to ultra-visual Cards!
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'RECEBIDO' | 'EMITIDO' | 'EM_ABERTO' | 'COMPENSADO' | 'DEVOLVIDO'>('TODOS');

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

  // Filtragem
  const filteredCheques = cheques.filter(c => {
    const matchSearch = 
      c.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numeroCheque.includes(searchTerm) ||
      c.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recebidos em Custódia</p>
            <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">R$ {formatCurrency(totalRecebidosCustodia)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cheques Emitidos</p>
            <p className="text-xl font-black text-red-500 font-mono mt-0.5">R$ {formatCurrency(totalEmitidos)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <CreditCard size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cheques Compensados</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-slate-100">{countCompensados}</span>
              <span className="text-[11px] text-slate-400 font-mono">liquidados</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cheques Devolvidos</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-amber-400">{countDevolvidos}</span>
              <span className="text-[11px] text-slate-400">alertas</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <XCircle size={18} />
          </div>
        </div>
      </div>

      {/* Formulário Rápido de Cheque */}
      <form onSubmit={handleSave} className="bg-[#161922] border border-[#2b3242] rounded-xl p-3 shadow-md shrink-0">
        <div className="flex items-center justify-between border-b border-[#2b3242] pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <CreditCard size={15} className="text-red-500" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Novo Cadastro de Folha de Cheque</h3>
          </div>

          {/* Toggle de Modo de Visualização: CARTÕES VIRTUAIS vs TABELA */}
          <div className="flex items-center bg-[#11131a] p-1 rounded-lg border border-[#2b3242]">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'CARDS' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Cartões Visuais de Cheque"
            >
              <LayoutGrid size={13} />
              <span>Visão Cartões 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'TABLE' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Tabela Estruturada"
            >
              <Table size={13} />
              <span>Modo Tabela</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2.5 items-end">
          <div className="col-span-3">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Titular no Cheque *</label>
            <input 
              type="text" 
              value={formData.titular}
              onChange={e => setFormData({...formData, titular: e.target.value})}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500" 
              placeholder="Nome impresso no cheque" 
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Banco</label>
            <select
              value={formData.banco}
              onChange={e => setFormData({...formData, banco: e.target.value})}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-medium cursor-pointer"
            >
              <option value="Itaú (341)">Itaú (341)</option>
              <option value="Bradesco (237)">Bradesco (237)</option>
              <option value="Banco do Brasil (001)">Banco do Brasil (001)</option>
              <option value="Caixa Econômica (104)">Caixa (104)</option>
              <option value="Santander (033)">Santander (033)</option>
              <option value="Banrisul (041)">Banrisul (041)</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Agência</label>
            <input 
              type="text" 
              value={formData.agencia}
              onChange={e => setFormData({...formData, agencia: e.target.value})}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500" 
              placeholder="0001" 
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">N° Conta / Cheque</label>
            <div className="grid grid-cols-2 gap-1">
              <input 
                type="text" 
                value={formData.conta}
                onChange={e => setFormData({...formData, conta: e.target.value})}
                className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500" 
                placeholder="CC: 12345-6" 
              />
              <input 
                type="text" 
                value={formData.numeroCheque}
                onChange={e => setFormData({...formData, numeroCheque: e.target.value})}
                className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500" 
                placeholder="N°: 000123" 
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Valor (R$) *</label>
            <input 
              type="text" 
              value={formData.valor}
              onChange={e => setFormData({...formData, valor: e.target.value})}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-red-500 text-right" 
              placeholder="0,00" 
              required
            />
          </div>

          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Vencimento *</label>
                <input 
                  type="date" 
                  value={formData.vencimento}
                  onChange={e => setFormData({...formData, vencimento: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500" 
                  required
                />
              </div>

              <button 
                type="submit"
                className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] h-[32px] mt-4 shrink-0"
              >
                <Plus size={15} /> Cadastrar
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Barra de Filtros e Busca */}
      <div className="flex items-center justify-between bg-[#161922] border border-[#2b3242] rounded-xl px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'TODOS' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
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
            Recebidos Custódia ({cheques.filter(c => c.tipo === 'RECEBIDO').length})
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
        <div className="relative w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por titular, banco..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* ÁREA PRINCIPAL: MODO CARDS 3D DE CHEQUE vs MODO TABELA */}
      <div className="flex-1 overflow-y-auto">
        
        {viewMode === 'CARDS' ? (
          /* MODO CARTÕES VISUAIS DE CHEQUE 3D (Extremamente fácil de visualizar!) */
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
          /* MODO TABELA ESTRUTURADA */
          <div className="bg-[#161922] border border-[#2b3242] rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] font-mono">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Titular / Cheque N°</th>
                  <th className="px-4 py-3 font-semibold">Banco / Ag. / CC</th>
                  <th className="px-4 py-3 font-semibold text-right">Valor Nominal</th>
                  <th className="px-4 py-3 font-semibold text-center">Vencimento</th>
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
                      <div>{c.titular}</div>
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
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        c.status === 'EM ABERTO' ? 'bg-amber-500/20 text-amber-300' :
                        c.status === 'COMPENSADO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
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

    </div>
  );
}
