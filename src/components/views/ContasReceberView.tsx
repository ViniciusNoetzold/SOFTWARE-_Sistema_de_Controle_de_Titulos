import { useState, FormEvent } from 'react';
import { 
  Plus, Search, CheckCircle2, DollarSign, MessageSquare, 
  AlertOctagon, RotateCcw, FileText, ArrowDownRight, Wallet, X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDateBR, calcularSaldoDevedor, isTituloVencido, parseInputNumber } from '../../lib/utils';
import { Titulo, Entidade } from '../../types';

export function ContasReceberView() {
  const { titulos, entidades, addTitulo, liquidarTitulo, restaurarTitulo, showToast } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'EM_ABERTO' | 'VENCIDO' | 'PAGO'>('TODOS');

  // Form local para lançamento rápido
  const [idEntidade, setIdEntidade] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [valorInput, setValorInput] = useState('');
  const [vencimento, setVencimento] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Modal de Baixa Parcial
  const [baixaParcialTitulo, setBaixaParcialTitulo] = useState<Titulo | null>(null);
  const [valorBaixaParcial, setValorBaixaParcial] = useState('');

  // Modal Dossiê Cliente
  const [dossierCliente, setDossierCliente] = useState<Entidade | null>(null);

  // Apenas contas a receber (Clientes)
  const contasReceber = titulos.filter(t => t.tipo_titulo === 'RECEBER');
  const clientesDisponiveis = entidades.filter(e => e.tipo_entidade === 'CLIENTE' || e.tipo_entidade === 'AMBOS');

  // Filtragem
  const filteredTitulos = contasReceber.filter(t => {
    const ent = entidades.find(e => e.id === t.id_entidade);
    const matchSearch = 
      t.numero_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ent && ent.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === 'EM_ABERTO') return t.status === 'EM_ABERTO' && !isTituloVencido(t);
    if (statusFilter === 'VENCIDO') return isTituloVencido(t);
    if (statusFilter === 'PAGO') return t.status === 'PAGO';

    return true;
  });

  // Métricas Globais de Contas a Receber
  const totalCarteira = contasReceber
    .filter(t => t.status !== 'PAGO')
    .reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);

  const titulosVencidos = contasReceber.filter(t => isTituloVencido(t));
  const totalVencido = titulosVencidos.reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);

  const totalPagoMes = contasReceber
    .filter(t => t.status === 'PAGO')
    .reduce((sum, t) => sum + t.valor_original, 0);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!idEntidade) {
      showToast('Selecione um cliente para vincular o título.');
      return;
    }
    if (!numeroDocumento.trim()) {
      showToast('Informe o número do documento.');
      return;
    }

    const valNum = parseInputNumber(valorInput);
    if (isNaN(valNum) || valNum <= 0) {
      showToast('Informe um valor válido maior que R$ 0,00.');
      return;
    }

    addTitulo({
      id_entidade: idEntidade,
      tipo_titulo: 'RECEBER',
      numero_documento: numeroDocumento,
      valor_original: valNum,
      data_vencimento: vencimento,
    });

    setNumeroDocumento('');
    setValorInput('');
    showToast(`Título ${numeroDocumento} gravado com sucesso!`);
  };

  const handleBaixaParcialSubmit = () => {
    if (!baixaParcialTitulo) return;
    const valor = parseInputNumber(valorBaixaParcial);
    if (isNaN(valor) || valor <= 0) {
      showToast('Informe um valor de baixa válido.');
      return;
    }

    liquidarTitulo(baixaParcialTitulo.id, 'PARCIAL', valor);
    setBaixaParcialTitulo(null);
    setValorBaixaParcial('');
  };

  const handleSendWhatsapp = (titulo: Titulo) => {
    const cliente = entidades.find(e => e.id === titulo.id_entidade);
    if (!cliente || !cliente.telefone) {
      showToast('Cliente não possui telefone de contato cadastrado.');
      return;
    }

    const cleanPhone = cliente.telefone.replace(/\D/g, '');
    const saldo = calcularSaldoDevedor(titulo);
    const vencido = isTituloVencido(titulo);

    let msg = `Olá *${cliente.nome}*, referente ao título *${titulo.numero_documento}* com vencimento em *${formatDateBR(titulo.data_vencimento)}*.`;
    if (vencido) {
      msg += ` O valor atualizado com juros é de *R$ ${formatCurrency(saldo)}* (vencido). Solicitamos a quitação o quanto antes.`;
    } else {
      msg += ` Lembramos do valor de *R$ ${formatCurrency(saldo)}* a vencer.`;
    }

    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 select-none text-slate-200">
      
      {/* 4 Cards de Métricas Gerenciais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total a Receber</p>
            <p className="text-xl font-black text-slate-100 font-mono mt-0.5">R$ {formatCurrency(totalCarteira)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Wallet size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Títulos Vencidos</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-red-500 font-mono">R$ {formatCurrency(totalVencido)}</span>
              <span className="text-[11px] text-red-400 font-bold">({titulosVencidos.length})</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertOctagon size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Liquidado (Mês)</p>
            <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">R$ {formatCurrency(totalPagoMes)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registros</p>
            <p className="text-xl font-black text-slate-200 mt-0.5">{contasReceber.length} Títulos</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-300">
            <DollarSign size={18} />
          </div>
        </div>
      </div>

      {/* Form de Lançamento Rápido + Barra de Pesquisa */}
      <div className="bg-[#161922] border border-[#2b3242] rounded-xl p-3 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#2b3242] pb-2">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-red-500" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Novo Lançamento Rápido de Título</h3>
          </div>

          {/* Search Box */}
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por doc ou cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500/60 placeholder:text-slate-600 font-medium"
            />
          </div>
        </div>

        {/* Inputs do Formulário */}
        <form onSubmit={handleCreate} className="grid grid-cols-12 gap-2.5 items-end">
          <div className="col-span-4">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Cliente *</label>
            <select 
              value={idEntidade}
              onChange={e => setIdEntidade(e.target.value)}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-all cursor-pointer font-medium"
              required
            >
              <option value="">Selecione o cliente...</option>
              {clientesDisponiveis.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.documento})</option>
              ))}
            </select>
          </div>

          <div className="col-span-3">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Nº Documento / NF *</label>
            <input 
              type="text" 
              value={numeroDocumento}
              onChange={e => setNumeroDocumento(e.target.value)}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono" 
              placeholder="Ex: NF-1030" 
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Valor (R$) *</label>
            <input 
              type="text" 
              value={valorInput}
              onChange={e => setValorInput(e.target.value)}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono text-right" 
              placeholder="0,00" 
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Vencimento *</label>
            <input 
              type="date" 
              value={vencimento}
              onChange={e => setVencimento(e.target.value)}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono" 
              required
            />
          </div>

          <div className="col-span-1">
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-1 bg-red-600 hover:bg-red-500 text-white py-1.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] h-[32px]"
            >
              + Gravar
            </button>
          </div>
        </form>
      </div>

      {/* Tabs de Filtro de Status */}
      <div className="flex items-center justify-between bg-[#161922] border border-[#2b3242] rounded-xl px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'TODOS' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos os Títulos ({contasReceber.length})
          </button>

          <button
            onClick={() => setStatusFilter('EM_ABERTO')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'EM_ABERTO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Em Aberto ({contasReceber.filter(t => t.status === 'EM_ABERTO' && !isTituloVencido(t)).length})
          </button>

          <button
            onClick={() => setStatusFilter('VENCIDO')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'VENCIDO' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vencidos ({titulosVencidos.length})
          </button>

          <button
            onClick={() => setStatusFilter('PAGO')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'PAGO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Liquidados / Pagos ({contasReceber.filter(t => t.status === 'PAGO').length})
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Exibindo {filteredTitulos.length} títulos
        </span>
      </div>

      {/* Tabela Principal de Contas a Receber com Ações Conectadas */}
      <div className="bg-[#161922] border border-[#2b3242] rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 z-10 font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">ID / DOC</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Vencimento</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Valor Original</th>
                <th className="px-4 py-3 font-semibold text-right">Saldo Devedor</th>
                <th className="px-4 py-3 font-semibold text-center">Ações Conectadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232836]">
              {filteredTitulos.map((t) => {
                const cliente = entidades.find(e => e.id === t.id_entidade);
                const saldoAtual = calcularSaldoDevedor(t);
                const vencido = isTituloVencido(t);

                return (
                  <tr key={t.id} className="hover:bg-[#1f2432]/70 transition-colors group">
                    
                    {/* ID / DOC */}
                    <td className="px-4 py-3 font-mono text-slate-200 font-bold">
                      <span className="bg-[#1e2330] border border-[#2e3748] px-2 py-0.5 rounded text-[11px]">
                        {t.numero_documento}
                      </span>
                    </td>

                    {/* CLIENTE */}
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {cliente ? (
                        <button
                          onClick={() => setDossierCliente(cliente)}
                          className="hover:text-red-400 transition-colors text-left flex items-center gap-1.5"
                          title="Ver Dossiê do Cliente"
                        >
                          <span className="font-semibold text-slate-100">{cliente.nome}</span>
                          <FileText size={12} className="text-slate-500 hover:text-sky-400" />
                        </button>
                      ) : (
                        <span className="text-slate-400">Cliente Padrão</span>
                      )}
                    </td>

                    {/* VENCIMENTO */}
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {formatDateBR(t.data_vencimento)}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider border ${
                        t.status === 'PAGO' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' :
                        vencido ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse' :
                        'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      }`}>
                        {t.status === 'PAGO' ? 'PAGO' : vencido ? 'VENCIDO' : 'EM ABERTO'}
                      </span>
                    </td>

                    {/* VALOR ORIGINAL */}
                    <td className="px-4 py-3 font-mono text-right text-slate-300">
                      R$ {formatCurrency(t.valor_original)}
                    </td>

                    {/* SALDO DEVEDOR */}
                    <td className={`px-4 py-3 font-mono text-right font-bold ${
                      t.status === 'PAGO' ? 'text-slate-500' : vencido ? 'text-red-400' : 'text-slate-100'
                    }`}>
                      R$ {formatCurrency(saldoAtual)}
                      {vencido && (
                        <span className="block text-[9px] text-red-500 font-sans tracking-wide">
                          + Juros/Multa
                        </span>
                      )}
                    </td>

                    {/* AÇÕES CONECTADAS (VISÍVEIS E INTERATIVAS) */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {t.status !== 'PAGO' ? (
                          <>
                            {/* Baixa Total */}
                            <button 
                              onClick={() => liquidarTitulo(t.id, 'TOTAL')} 
                              className="p-1.5 bg-[#1f2838] text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 rounded-lg transition-all"
                              title="Liquidar Totalmente (Baixa Total)"
                            >
                              <CheckCircle2 size={14} />
                            </button>

                            {/* Baixa Parcial */}
                            <button 
                              onClick={() => {
                                setBaixaParcialTitulo(t);
                                setValorBaixaParcial((saldoAtual / 2).toFixed(2));
                              }} 
                              className="p-1.5 bg-[#1f2838] text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/30 rounded-lg transition-all"
                              title="Dar Baixa Parcial no Título"
                            >
                              <ArrowDownRight size={14} />
                            </button>

                            {/* Cobrar no WhatsApp */}
                            <button 
                              onClick={() => handleSendWhatsapp(t)} 
                              className="p-1.5 bg-[#1f2838] text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 rounded-lg transition-all"
                              title="Enviar Cobrança via WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </button>
                          </>
                        ) : (
                          /* Restaurar Título Liquidado */
                          <button 
                            onClick={() => restaurarTitulo(t.id)} 
                            className="p-1.5 bg-[#1f2838] text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-600/40 rounded-lg transition-all"
                            title="Restaurar Título para a Carteira Ativa"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}

                        {/* Ver Dossiê Cliente */}
                        {cliente && (
                          <button 
                            onClick={() => setDossierCliente(cliente)} 
                            className="p-1.5 bg-[#1f2838] text-sky-400 hover:bg-sky-600 hover:text-white border border-sky-500/30 rounded-lg transition-all"
                            title="Abrir Cadastro do Cliente"
                          >
                            <FileText size={14} />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredTitulos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Nenhum título a receber encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé Informativo */}
        <div className="px-4 py-2 bg-[#111319] border-t border-[#2b3242] text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Exibindo {filteredTitulos.length} de {contasReceber.length} registros</span>
          <span className="text-slate-300 font-bold">Saldo total a receber: R$ {formatCurrency(totalCarteira)}</span>
        </div>
      </div>

      {/* MODAL: Baixa Parcial Personalizada */}
      {baixaParcialTitulo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setBaixaParcialTitulo(null)}></div>
          <div className="relative w-full max-w-sm bg-[#181c26] border border-[#2e374a] rounded-2xl shadow-2xl flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-[#2e374a] bg-[#13161f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="text-amber-400" size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  Baixa Parcial: {baixaParcialTitulo.numero_documento}
                </h3>
              </div>
              <button onClick={() => setBaixaParcialTitulo(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-[#11131a] p-3 rounded-xl border border-[#2d364a] text-xs font-mono">
                <p className="text-slate-400">Saldo Atual do Título:</p>
                <p className="text-base font-black text-slate-100 mt-0.5">
                  R$ {formatCurrency(calcularSaldoDevedor(baixaParcialTitulo))}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Valor da Baixa (R$)
                </label>
                <input
                  type="text"
                  value={valorBaixaParcial}
                  onChange={e => setValorBaixaParcial(e.target.value)}
                  className="w-full bg-[#11131a] border border-[#2d364a] rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-400 text-right"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-[#2e374a] bg-[#13161f] flex justify-end gap-2">
              <button
                onClick={() => setBaixaParcialTitulo(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#252c3c] border border-[#2e374a] rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleBaixaParcialSubmit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-md"
              >
                Confirmar Baixa Parcial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Dossiê do Cliente (Se aberto a partir da tabela) */}
      {dossierCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setDossierCliente(null)}></div>
          <div className="relative w-full max-w-lg bg-[#181c26] border border-[#2e374a] rounded-2xl shadow-2xl p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#2e374a] pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Cadastro de {dossierCliente.nome}
              </h3>
              <button onClick={() => setDossierCliente(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono bg-[#11131a] p-4 rounded-xl border border-[#2d364a]">
              <p><b>ID:</b> {dossierCliente.id}</p>
              <p><b>CPF/CNPJ:</b> {dossierCliente.documento}</p>
              <p><b>Telefone:</b> {dossierCliente.telefone || 'N/A'}</p>
              <p><b>Email:</b> {dossierCliente.email || 'N/A'}</p>
              <p><b>Tipo:</b> {dossierCliente.tipo_entidade}</p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDossierCliente(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#222836] text-slate-300 hover:bg-[#2d3548] rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
