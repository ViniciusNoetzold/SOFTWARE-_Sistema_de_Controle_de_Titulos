import { useState } from 'react';
import { 
  FileText, Calendar, Users, AlertTriangle, Wallet, 
  Printer, Download, Filter, Search, Building2, CheckCircle2
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDateBR, isTituloVencido, calcularSaldoDevedor } from '../../lib/utils';

export function RelatoriosView() {
  const { titulos, entidades, cheques, empresaConfig, currentUser } = useAppContext();

  // Tipo de Relatório Ativo
  const [activeReport, setActiveReport] = useState<'GERAL' | 'MES' | 'CLIENTE' | 'INADIMPLENCIA' | 'CHEQUES'>('GERAL');

  // Filtros
  const [selectedEntidade, setSelectedEntidade] = useState<string>('TODOS');
  const [selectedTipo, setSelectedTipo] = useState<'TODOS' | 'RECEBER' | 'PAGAR'>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<'TODOS' | 'EM_ABERTO' | 'PAGO' | 'VENCIDO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Relatório Geral Filtrado
  const filteredTitulos = titulos.filter(t => {
    if (selectedEntidade !== 'TODOS' && t.id_entidade !== selectedEntidade) return false;
    if (selectedTipo !== 'TODOS' && t.tipo_titulo !== selectedTipo) return false;

    const vencido = isTituloVencido(t);

    if (selectedStatus === 'EM_ABERTO' && (t.status !== 'EM_ABERTO' || vencido)) return false;
    if (selectedStatus === 'PAGO' && t.status !== 'PAGO') return false;
    if (selectedStatus === 'VENCIDO' && !vencido) return false;

    if (searchTerm) {
      const ent = entidades.find(e => e.id === t.id_entidade);
      const matchDoc = t.numero_documento.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEnt = ent?.nome.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchDoc && !matchEnt) return false;
    }

    return true;
  });

  // Totais do Relatório Geral
  const totalOriginal = filteredTitulos.reduce((acc, t) => acc + t.valor_original, 0);
  const totalPago = filteredTitulos.reduce((acc, t) => acc + t.valor_pago, 0);
  const totalSaldo = filteredTitulos.reduce((acc, t) => acc + t.saldo_devedor, 0);

  // 2. Agrupamento por Mês
  interface DREItem {
    mes: string;
    receber: number;
    pagar: number;
    pago: number;
    pendente: number;
    count: number;
  }

  const relatorioPorMes: Record<string, DREItem> = titulos.reduce((acc: Record<string, DREItem>, t) => {
    const mesAno = t.data_vencimento ? t.data_vencimento.substring(0, 7) : 'Sem Data';
    if (!acc[mesAno]) {
      acc[mesAno] = { mes: mesAno, receber: 0, pagar: 0, pago: 0, pendente: 0, count: 0 };
    }
    acc[mesAno].count += 1;
    if (t.tipo_titulo === 'RECEBER') acc[mesAno].receber += t.valor_original;
    if (t.tipo_titulo === 'PAGAR') acc[mesAno].pagar += t.valor_original;
    acc[mesAno].pago += t.valor_pago;
    acc[mesAno].pendente += t.saldo_devedor;
    return acc;
  }, {});

  const mesesList: DREItem[] = (Object.values(relatorioPorMes) as DREItem[]).sort((a, b) => a.mes.localeCompare(b.mes));
  const totalMesReceber: number = mesesList.reduce((sum, m) => sum + m.receber, 0);
  const totalMesPagar: number = mesesList.reduce((sum, m) => sum + m.pagar, 0);
  const totalMesPago: number = mesesList.reduce((sum, m) => sum + m.pago, 0);
  const totalMesPendente: number = mesesList.reduce((sum, m) => sum + m.pendente, 0);

  // 3. Agrupamento por Cliente
  const relatorioPorCliente = entidades.map(ent => {
    const titulosCliente = titulos.filter(t => t.id_entidade === ent.id);
    const original = titulosCliente.reduce((sum, t) => sum + t.valor_original, 0);
    const pago = titulosCliente.reduce((sum, t) => sum + t.valor_pago, 0);
    const saldo = titulosCliente.reduce((sum, t) => sum + t.saldo_devedor, 0);
    const vencidosCount = titulosCliente.filter(t => isTituloVencido(t)).length;

    return {
      entidade: ent,
      count: titulosCliente.length,
      totalOriginal: original,
      totalPago: pago,
      totalSaldo: saldo,
      vencidosCount
    };
  }).filter(c => c.count > 0);

  const totalClienteOriginal = relatorioPorCliente.reduce((s, c) => s + c.totalOriginal, 0);
  const totalClientePago = relatorioPorCliente.reduce((s, c) => s + c.totalPago, 0);
  const totalClienteSaldo = relatorioPorCliente.reduce((s, c) => s + c.totalSaldo, 0);

  // 4. Inadimplência Aging List
  const titulosInadimplentes = titulos.filter(t => isTituloVencido(t));
  const totalInadimplente = titulosInadimplentes.reduce((s, t) => s + t.saldo_devedor, 0);

  // 5. Cheques
  const totalChequesRecebidos = cheques.filter(c => c.tipo === 'RECEBIDO').reduce((s, c) => s + c.valor, 0);
  const totalChequesEmitidos = cheques.filter(c => c.tipo === 'EMITIDO').reduce((s, c) => s + c.valor, 0);
  const totalChequesCompensados = cheques.filter(c => c.status === 'COMPENSADO').reduce((s, c) => s + c.valor, 0);
  const totalChequesAberto = cheques.filter(c => c.status === 'EM ABERTO').reduce((s, c) => s + c.valor, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Documento;Cliente;Tipo;Valor Original;Valor Pago;Saldo Devedor;Vencimento;Status\n";
    filteredTitulos.forEach(t => {
      const ent = entidades.find(e => e.id === t.id_entidade);
      csvContent += `${t.numero_documento};"${ent?.nome || ''}";${t.tipo_titulo};${t.valor_original};${t.valor_pago};${t.saldo_devedor};${t.data_vencimento};${t.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${activeReport.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Título Dinâmico do Relatório
  const getReportTitle = () => {
    switch (activeReport) {
      case 'GERAL': return 'RELATÓRIO GERAL DE TÍTULOS E CARTEIRA FINANCEIRA';
      case 'MES': return 'DEMONSTRATIVO MENSAL DE FLUXO DE CAIXA (DRE SINTÉTICO)';
      case 'CLIENTE': return 'POSIÇÃO FINANCEIRA CONSOLIDADA POR CLIENTE';
      case 'INADIMPLENCIA': return 'RELATÓRIO EXECUTIVO DE INADIMPLÊNCIA & AGING DE ATRASOS';
      case 'CHEQUES': return 'EXTRATO E RELATÓRIO DE CUSTÓDIA DE CHEQUES';
    }
  };

  const dataHoraEmissao = new Date().toLocaleString('pt-BR');

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 select-none text-slate-200 overflow-hidden">
      
      {/* =========================================================================
          1. INTERFACE DE TELA (OCULTADA AUTOMATICAMENTE NA IMPRESSÃO)
          ========================================================================= */}
      <div className="no-print flex flex-col gap-3 flex-1 overflow-hidden">
        
        {/* Top Selector das 5 Abas de Relatórios */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 shrink-0">
          
          <button
            onClick={() => setActiveReport('GERAL')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              activeReport === 'GERAL'
                ? 'bg-red-600 border-red-500 text-white shadow-lg'
                : 'bg-[#161922] border-[#2b3242] text-slate-300 hover:border-slate-500'
            }`}
          >
            <FileText size={18} className={activeReport === 'GERAL' ? 'text-white' : 'text-red-500'} />
            <div className="text-left">
              <h4 className="text-xs font-bold leading-none">Relatório Geral</h4>
              <span className="text-[9px] opacity-80">Listagem de Títulos</span>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('MES')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              activeReport === 'MES'
                ? 'bg-red-600 border-red-500 text-white shadow-lg'
                : 'bg-[#161922] border-[#2b3242] text-slate-300 hover:border-slate-500'
            }`}
          >
            <Calendar size={18} className={activeReport === 'MES' ? 'text-white' : 'text-emerald-400'} />
            <div className="text-left">
              <h4 className="text-xs font-bold leading-none">Visão por Mês</h4>
              <span className="text-[9px] opacity-80">DRE de Caixa Mensal</span>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('CLIENTE')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              activeReport === 'CLIENTE'
                ? 'bg-red-600 border-red-500 text-white shadow-lg'
                : 'bg-[#161922] border-[#2b3242] text-slate-300 hover:border-slate-500'
            }`}
          >
            <Users size={18} className={activeReport === 'CLIENTE' ? 'text-white' : 'text-blue-400'} />
            <div className="text-left">
              <h4 className="text-xs font-bold leading-none">Por Cliente</h4>
              <span className="text-[9px] opacity-80">Ranking e Posição</span>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('INADIMPLENCIA')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              activeReport === 'INADIMPLENCIA'
                ? 'bg-red-600 border-red-500 text-white shadow-lg'
                : 'bg-[#161922] border-[#2b3242] text-slate-300 hover:border-slate-500'
            }`}
          >
            <AlertTriangle size={18} className={activeReport === 'INADIMPLENCIA' ? 'text-white' : 'text-amber-400'} />
            <div className="text-left">
              <h4 className="text-xs font-bold leading-none">Inadimplência</h4>
              <span className="text-[9px] opacity-80">Aging de Atrasos</span>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('CHEQUES')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              activeReport === 'CHEQUES'
                ? 'bg-red-600 border-red-500 text-white shadow-lg'
                : 'bg-[#161922] border-[#2b3242] text-slate-300 hover:border-slate-500'
            }`}
          >
            <Wallet size={18} className={activeReport === 'CHEQUES' ? 'text-white' : 'text-purple-400'} />
            <div className="text-left">
              <h4 className="text-xs font-bold leading-none">Custódia Cheques</h4>
              <span className="text-[9px] opacity-80">Cheques e Carteira</span>
            </div>
          </button>

        </div>

        {/* Barra de Filtros & Ações de Exportação */}
        <div className="flex items-center justify-between bg-[#161922] border border-[#2b3242] rounded-xl px-3 py-2 shrink-0">
          
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#11131a] px-2.5 py-1 rounded-lg border border-[#2b3242]">
              <Filter size={13} className="text-slate-400" />
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Filtros:</span>

              {/* Select Cliente */}
              <select
                value={selectedEntidade}
                onChange={e => setSelectedEntidade(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer max-w-[150px]"
              >
                <option value="TODOS" className="bg-[#11131a]">Todos Clientes</option>
                {entidades.map(e => (
                  <option key={e.id} value={e.id} className="bg-[#11131a]">{e.nome}</option>
                ))}
              </select>

              {/* Select Tipo */}
              <select
                value={selectedTipo}
                onChange={e => setSelectedTipo(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer border-l border-[#2b3242] pl-2"
              >
                <option value="TODOS" className="bg-[#11131a]">Todos Tipos</option>
                <option value="RECEBER" className="bg-[#11131a]">Recebimentos</option>
                <option value="PAGAR" className="bg-[#11131a]">Pagamentos</option>
              </select>

              {/* Select Status */}
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer border-l border-[#2b3242] pl-2"
              >
                <option value="TODOS" className="bg-[#11131a]">Todos Status</option>
                <option value="EM_ABERTO" className="bg-[#11131a]">Em Aberto</option>
                <option value="VENCIDO" className="bg-[#11131a]">Vencidos</option>
                <option value="PAGO" className="bg-[#11131a]">Quitados</option>
              </select>
            </div>

            {/* Busca */}
            <div className="relative w-48">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar documento..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-[#222836] hover:bg-[#2e374a] text-slate-200 border border-[#2e3748] px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Exportar Planilha Excel/CSV"
            >
              <Download size={13} className="text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.35)]"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer size={14} />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>

        </div>

        {/* Visualização da Tabela na Tela Escura */}
        <div className="bg-[#161922] border border-[#2b3242] rounded-2xl overflow-hidden flex-1 flex flex-col shadow-xl">
          
          {/* ABA 1: GERAL */}
          {activeReport === 'GERAL' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Documento</th>
                      <th className="px-4 py-3 font-semibold">Cliente / Entidade</th>
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold text-right">Valor Original</th>
                      <th className="px-4 py-3 font-semibold text-right">Valor Pago</th>
                      <th className="px-4 py-3 font-semibold text-right">Saldo Devedor</th>
                      <th className="px-4 py-3 font-semibold text-center">Vencimento</th>
                      <th className="px-4 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232836]">
                    {filteredTitulos.map(t => {
                      const ent = entidades.find(e => e.id === t.id_entidade);
                      const vencido = isTituloVencido(t);

                      return (
                        <tr key={t.id} className="hover:bg-[#1f2432]/70 transition-colors">
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-100">{t.numero_documento}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-100">{ent?.nome || 'Cliente Padrão'}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              t.tipo_titulo === 'RECEBER' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'
                            }`}>
                              {t.tipo_titulo}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-right font-bold text-slate-100">R$ {formatCurrency(t.valor_original)}</td>
                          <td className="px-4 py-2.5 font-mono text-right text-emerald-400 font-bold">R$ {formatCurrency(t.valor_pago)}</td>
                          <td className="px-4 py-2.5 font-mono text-right text-red-400 font-bold">R$ {formatCurrency(t.saldo_devedor)}</td>
                          <td className="px-4 py-2.5 font-mono text-center">{formatDateBR(t.data_vencimento)}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              t.status === 'PAGO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              vencido ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {t.status === 'PAGO' ? 'PAGO' : vencido ? 'VENCIDO' : 'EM ABERTO'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTitulos.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500">Nenhum título localizado com os filtros selecionados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totalizadores de Rodapé */}
              <div className="px-5 py-2.5 bg-[#111319] border-t border-[#2b3242] flex items-center justify-between font-mono text-xs text-slate-300 shrink-0">
                <span><b>{filteredTitulos.length}</b> Títulos Processados</span>
                <div className="flex items-center gap-6">
                  <span>Original: <b className="text-slate-100">R$ {formatCurrency(totalOriginal)}</b></span>
                  <span>Recebido: <b className="text-emerald-400">R$ {formatCurrency(totalPago)}</b></span>
                  <span>Saldo Devedor: <b className="text-red-400">R$ {formatCurrency(totalSaldo)}</b></span>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: DRE MENSAL */}
          {activeReport === 'MES' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Mês / Ano Competência</th>
                      <th className="px-5 py-3 font-semibold text-center">Títulos</th>
                      <th className="px-5 py-3 font-semibold text-right">Faturamento (Receber)</th>
                      <th className="px-5 py-3 font-semibold text-right">Despesas (Pagar)</th>
                      <th className="px-5 py-3 font-semibold text-right">Total Quitado</th>
                      <th className="px-5 py-3 font-semibold text-right">Saldo Pendente Mês</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232836]">
                    {mesesList.map((m: any) => (
                      <tr key={m.mes} className="hover:bg-[#1f2432]/70 transition-colors font-mono">
                        <td className="px-5 py-3 font-bold text-slate-100 text-xs">📅 {m.mes}</td>
                        <td className="px-5 py-3 text-center text-slate-300">{m.count}</td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-400">R$ {formatCurrency(m.receber)}</td>
                        <td className="px-5 py-3 text-right font-bold text-blue-400">R$ {formatCurrency(m.pagar)}</td>
                        <td className="px-5 py-3 text-right font-bold text-slate-100">R$ {formatCurrency(m.pago)}</td>
                        <td className="px-5 py-3 text-right font-bold text-red-400">R$ {formatCurrency(m.pendente)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 3: POR CLIENTE */}
          {activeReport === 'CLIENTE' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Cliente / Razão Social</th>
                      <th className="px-5 py-3 font-semibold text-center">N° Títulos</th>
                      <th className="px-5 py-3 font-semibold text-right">Volume Total</th>
                      <th className="px-5 py-3 font-semibold text-right">Total Liquidado</th>
                      <th className="px-5 py-3 font-semibold text-right">Saldo Devedor Ativo</th>
                      <th className="px-5 py-3 font-semibold text-center">Atrasos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232836]">
                    {relatorioPorCliente.map((c) => (
                      <tr key={c.entidade.id} className="hover:bg-[#1f2432]/70 transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-100">
                          {c.entidade.nome}
                          <span className="block text-[10px] font-mono text-slate-500">{c.entidade.documento}</span>
                        </td>
                        <td className="px-5 py-3 text-center font-mono font-bold text-slate-300">{c.count} títulos</td>
                        <td className="px-5 py-3 font-mono text-right font-bold text-slate-100">R$ {formatCurrency(c.totalOriginal)}</td>
                        <td className="px-5 py-3 font-mono text-right font-bold text-emerald-400">R$ {formatCurrency(c.totalPago)}</td>
                        <td className="px-5 py-3 font-mono text-right font-bold text-red-400">R$ {formatCurrency(c.totalSaldo)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            c.vencidosCount > 0 ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {c.vencidosCount > 0 ? `⚠️ ${c.vencidosCount} Vencidos` : '✅ Em Dia'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 4: INADIMPLÊNCIA */}
          {activeReport === 'INADIMPLENCIA' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 bg-red-950/40 border-b border-red-900/50 flex items-center justify-between text-xs text-red-200">
                <span className="font-bold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  Relatório de Títulos Vencidos e Cobrança Prioritária
                </span>
                <span className="font-mono font-bold">Total Vencido: R$ {formatCurrency(totalInadimplente)}</span>
              </div>

              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Documento</th>
                      <th className="px-4 py-3 font-semibold">Devedor</th>
                      <th className="px-4 py-3 font-semibold text-right">Saldo em Atraso</th>
                      <th className="px-4 py-3 font-semibold text-center">Vencimento Original</th>
                      <th className="px-4 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232836]">
                    {titulosInadimplentes.map(t => {
                      const ent = entidades.find(e => e.id === t.id_entidade);
                      return (
                        <tr key={t.id} className="hover:bg-[#1f2432]/70 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-100">{t.numero_documento}</td>
                          <td className="px-4 py-3 font-semibold text-slate-100">{ent?.nome || 'Cliente Padrão'}</td>
                          <td className="px-4 py-3 font-mono text-right font-black text-red-400">R$ {formatCurrency(t.saldo_devedor)}</td>
                          <td className="px-4 py-3 font-mono text-center text-slate-300">{formatDateBR(t.data_vencimento)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-red-600 text-white">
                              ⚠️ VENCIDO
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 5: CHEQUES */}
          {activeReport === 'CHEQUES' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Titular / Cheque N°</th>
                      <th className="px-4 py-3 font-semibold">Banco / Ag. / CC</th>
                      <th className="px-4 py-3 font-semibold text-right">Valor Nominal</th>
                      <th className="px-4 py-3 font-semibold text-center">Vencimento Bom Para</th>
                      <th className="px-4 py-3 font-semibold text-center">Status Custódia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232836]">
                    {cheques.map(c => (
                      <tr key={c.id} className="hover:bg-[#1f2432]/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${c.tipo === 'RECEBIDO' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                            {c.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-100">
                          {c.titular}
                          <span className="block text-[10px] font-mono text-slate-400">CH: {c.numeroCheque}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {c.banco} (Ag: {c.agencia} | CC: {c.conta})
                        </td>
                        <td className="px-4 py-3 font-mono text-right font-bold text-slate-100">R$ {formatCurrency(c.valor)}</td>
                        <td className="px-4 py-3 font-mono text-center">{formatDateBR(c.vencimento)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            c.status === 'EM ABERTO' ? 'bg-amber-500/20 text-amber-300' :
                            c.status === 'COMPENSADO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =========================================================================
          2. DOCUMENTO OFICIAL DE IMPRESSÃO A4 (EXCLUSIVO PARA @media print / PDF)
          ========================================================================= */}
      <div className="printable-report-a4 hidden print:block text-black bg-white">
        
        {/* CABEÇALHO CORPORATIVO EXECUTIVO */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                {empresaConfig.razaoSocial || 'MEZZOLD FINANCIAL STUDIO'}
              </h1>
              <p className="text-[10pt] text-slate-600 font-medium">
                {empresaConfig.nomeFantasia || 'Sistema Integrado de Controle de Títulos & Cobrança'}
              </p>
              <div className="text-[8pt] text-slate-500 font-mono mt-1 space-x-3">
                <span><b>CNPJ:</b> {empresaConfig.cnpj || '00.000.000/0001-00'}</span>
                <span><b>IE:</b> {empresaConfig.ie || 'ISENTO'}</span>
                <span><b>Tel:</b> {empresaConfig.telefone || '(11) 99999-9999'}</span>
              </div>
              <p className="text-[8pt] text-slate-500">{empresaConfig.endereco || 'Avenida Central de Negócios, 1000 - Centro'}</p>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white text-[9pt] font-black px-2.5 py-1 rounded tracking-wider uppercase mb-1">
                DOCUMENTO OFICIAL
              </span>
              <p className="text-[8pt] text-slate-600 font-mono"><b>Emissão:</b> {dataHoraEmissao}</p>
              <p className="text-[8pt] text-slate-600 font-mono"><b>Operador:</b> {currentUser?.nome || 'Administrador'}</p>
            </div>
          </div>

          {/* TÍTULO DO RELATÓRIO ATIVO */}
          <div className="mt-3 pt-2 border-t border-slate-300 flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 tracking-wide uppercase">
              {getReportTitle()}
            </h2>
            <span className="text-[8pt] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              Filtro: {selectedTipo !== 'TODOS' ? `Tipo [${selectedTipo}]` : 'Todos os Tipos'} | Status [{selectedStatus}]
            </span>
          </div>
        </div>

        {/* CARDS DE RESUMO FINANCEIRO (KPIs NO TOPO DO PDF) */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2.5 rounded border border-slate-300 bg-slate-50">
            <span className="block text-[7.5pt] uppercase font-bold text-slate-500">Volume Total Original</span>
            <span className="text-xs font-black font-mono text-slate-900">
              R$ {formatCurrency(
                activeReport === 'GERAL' ? totalOriginal :
                activeReport === 'MES' ? (totalMesReceber + totalMesPagar) :
                activeReport === 'CLIENTE' ? totalClienteOriginal :
                activeReport === 'INADIMPLENCIA' ? totalInadimplente :
                (totalChequesRecebidos + totalChequesEmitidos)
              )}
            </span>
          </div>

          <div className="p-2.5 rounded border border-slate-300 bg-slate-50">
            <span className="block text-[7.5pt] uppercase font-bold text-slate-500">Total Liquidado / Pago</span>
            <span className="text-xs font-black font-mono text-slate-900">
              R$ {formatCurrency(
                activeReport === 'GERAL' ? totalPago :
                activeReport === 'MES' ? totalMesPago :
                activeReport === 'CLIENTE' ? totalClientePago :
                activeReport === 'INADIMPLENCIA' ? 0 :
                totalChequesCompensados
              )}
            </span>
          </div>

          <div className="p-2.5 rounded border border-slate-300 bg-slate-50">
            <span className="block text-[7.5pt] uppercase font-bold text-slate-500">Saldo Devedor / A Receber</span>
            <span className="text-xs font-black font-mono text-slate-900">
              R$ {formatCurrency(
                activeReport === 'GERAL' ? totalSaldo :
                activeReport === 'MES' ? totalMesPendente :
                activeReport === 'CLIENTE' ? totalClienteSaldo :
                activeReport === 'INADIMPLENCIA' ? totalInadimplente :
                totalChequesAberto
              )}
            </span>
          </div>

          <div className="p-2.5 rounded border border-slate-300 bg-slate-50">
            <span className="block text-[7.5pt] uppercase font-bold text-slate-500">Total de Registros</span>
            <span className="text-xs font-black font-mono text-slate-900">
              {
                activeReport === 'GERAL' ? filteredTitulos.length :
                activeReport === 'MES' ? mesesList.length :
                activeReport === 'CLIENTE' ? relatorioPorCliente.length :
                activeReport === 'INADIMPLENCIA' ? titulosInadimplentes.length :
                cheques.length
              } itens
            </span>
          </div>
        </div>

        {/* TABELA 1 IMPRESSÃO: RELATÓRIO GERAL */}
        {activeReport === 'GERAL' && (
          <table className="w-full text-[8pt] text-left border-collapse border border-slate-300 mb-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-2 py-1.5 font-bold">Doc / N°</th>
                <th className="border border-slate-300 px-2 py-1.5 font-bold">Cliente / Entidade</th>
                <th className="border border-slate-300 px-2 py-1.5 font-bold text-center">Tipo</th>
                <th className="border border-slate-300 px-2 py-1.5 font-bold text-center">Vencimento</th>
                <th className="border border-slate-300 px-2 py-1.5 font-bold text-center">Status</th>
                <th className="border border-slate-300 px-2 py-1.5 font-bold text-right">Valor Original</th>
                <th className="border border-slate-300 px-2 py-1.5 font-bold text-right">Valor Pago</th>
                <th className="border border-slate-300 px-2 py-1.5 font-bold text-right">Saldo Devedor</th>
              </tr>
            </thead>
            <tbody>
              {filteredTitulos.map((t, idx) => {
                const ent = entidades.find(e => e.id === t.id_entidade);
                const vencido = isTituloVencido(t);
                return (
                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 px-2 py-1 font-mono font-bold">{t.numero_documento}</td>
                    <td className="border border-slate-300 px-2 py-1">{ent?.nome || 'Entidade Padrão'}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center font-mono font-semibold">{t.tipo_titulo}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center font-mono">{formatDateBR(t.data_vencimento)}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                      {t.status === 'PAGO' ? 'QUITADO' : vencido ? 'VENCIDO' : 'EM ABERTO'}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-mono">R$ {formatCurrency(t.valor_original)}</td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-mono">R$ {formatCurrency(t.valor_pago)}</td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-mono font-bold">R$ {formatCurrency(t.saldo_devedor)}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-200 font-bold">
                <td colSpan={5} className="border border-slate-300 px-2 py-1.5 text-right uppercase">Totais Consolidados:</td>
                <td className="border border-slate-300 px-2 py-1.5 text-right font-mono">R$ {formatCurrency(totalOriginal)}</td>
                <td className="border border-slate-300 px-2 py-1.5 text-right font-mono">R$ {formatCurrency(totalPago)}</td>
                <td className="border border-slate-300 px-2 py-1.5 text-right font-mono font-black">R$ {formatCurrency(totalSaldo)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* TABELA 2 IMPRESSÃO: DRE MENSAL */}
        {activeReport === 'MES' && (
          <table className="w-full text-[8.5pt] text-left border-collapse border border-slate-300 mb-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2 font-bold">Competência (Mês/Ano)</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-center">Qtd Títulos</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Recebimentos Previstos</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Pagamentos / Despesas</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Total Liquidado</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Saldo Pendente Mês</th>
              </tr>
            </thead>
            <tbody>
              {mesesList.map((m: any, idx) => (
                <tr key={m.mes} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 px-3 py-1.5 font-bold font-mono">{m.mes}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{m.count}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">R$ {formatCurrency(m.receber)}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">R$ {formatCurrency(m.pagar)}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">R$ {formatCurrency(m.pago)}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-right font-mono font-bold">R$ {formatCurrency(m.pendente)}</td>
                </tr>
              ))}
              <tr className="bg-slate-200 font-bold">
                <td className="border border-slate-300 px-3 py-2 text-right uppercase">Totais:</td>
                <td className="border border-slate-300 px-3 py-2 text-center font-mono">{titulos.length}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono">R$ {formatCurrency(totalMesReceber)}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono">R$ {formatCurrency(totalMesPagar)}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono">R$ {formatCurrency(totalMesPago)}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono font-black">R$ {formatCurrency(totalMesPendente)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* TABELA 3 IMPRESSÃO: POR CLIENTE */}
        {activeReport === 'CLIENTE' && (
          <table className="w-full text-[8.5pt] text-left border-collapse border border-slate-300 mb-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2 font-bold">Cliente / Razão Social</th>
                <th className="border border-slate-300 px-3 py-2 font-bold">CNPJ / CPF</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-center">N° Títulos</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Volume Total</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Total Liquidado</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Saldo Devedor Ativo</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-center">Situação</th>
              </tr>
            </thead>
            <tbody>
              {relatorioPorCliente.map((c, idx) => (
                <tr key={c.entidade.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 px-3 py-1.5 font-bold">{c.entidade.nome}</td>
                  <td className="border border-slate-300 px-3 py-1.5 font-mono">{c.entidade.documento}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{c.count}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">R$ {formatCurrency(c.totalOriginal)}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">R$ {formatCurrency(c.totalPago)}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-right font-mono font-bold">R$ {formatCurrency(c.totalSaldo)}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-bold">
                    {c.vencidosCount > 0 ? `${c.vencidosCount} VENCIDO(S)` : 'EM DIA'}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-200 font-bold">
                <td colSpan={3} className="border border-slate-300 px-3 py-2 text-right uppercase">Totais Consolidados:</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono">R$ {formatCurrency(totalClienteOriginal)}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono">R$ {formatCurrency(totalClientePago)}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono font-black">R$ {formatCurrency(totalClienteSaldo)}</td>
                <td className="border border-slate-300 px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        )}

        {/* TABELA 4 IMPRESSÃO: INADIMPLÊNCIA */}
        {activeReport === 'INADIMPLENCIA' && (
          <table className="w-full text-[8.5pt] text-left border-collapse border border-slate-300 mb-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2 font-bold">Documento / N°</th>
                <th className="border border-slate-300 px-3 py-2 font-bold">Devedor / Razão Social</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-center">Vencimento Original</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Valor Original</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Saldo Devedor em Atraso</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {titulosInadimplentes.map((t, idx) => {
                const ent = entidades.find(e => e.id === t.id_entidade);
                return (
                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold">{t.numero_documento}</td>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">{ent?.nome || 'Cliente Padrão'}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{formatDateBR(t.data_vencimento)}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">R$ {formatCurrency(t.valor_original)}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-mono font-black">R$ {formatCurrency(t.saldo_devedor)}</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-black">VENCIDO</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-200 font-bold">
                <td colSpan={4} className="border border-slate-300 px-3 py-2 text-right uppercase">Total em Atraso a Recuperar:</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono font-black">R$ {formatCurrency(totalInadimplente)}</td>
                <td className="border border-slate-300 px-3 py-2 text-center">{titulosInadimplentes.length} títulos</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* TABELA 5 IMPRESSÃO: CHEQUES */}
        {activeReport === 'CHEQUES' && (
          <table className="w-full text-[8.5pt] text-left border-collapse border border-slate-300 mb-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2 font-bold text-center">Tipo</th>
                <th className="border border-slate-300 px-3 py-2 font-bold">N° Cheque</th>
                <th className="border border-slate-300 px-3 py-2 font-bold">Titular / Emitente</th>
                <th className="border border-slate-300 px-3 py-2 font-bold">Banco / Ag / Conta</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-center">Bom Para (Venc.)</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-center">Status</th>
                <th className="border border-slate-300 px-3 py-2 font-bold text-right">Valor Nominal</th>
              </tr>
            </thead>
            <tbody>
              {cheques.map((c, idx) => (
                <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-bold font-mono">{c.tipo}</td>
                  <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold">{c.numeroCheque}</td>
                  <td className="border border-slate-300 px-3 py-1.5 font-bold">{c.titular}</td>
                  <td className="border border-slate-300 px-3 py-1.5 font-mono text-[8pt]">{c.banco} ({c.agencia} / {c.conta})</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{formatDateBR(c.vencimento)}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-bold">{c.status}</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-right font-mono font-bold">R$ {formatCurrency(c.valor)}</td>
                </tr>
              ))}
              <tr className="bg-slate-200 font-bold">
                <td colSpan={6} className="border border-slate-300 px-3 py-2 text-right uppercase">Valor Total em Carteira:</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono font-black">
                  R$ {formatCurrency(cheques.reduce((s, c) => s + c.valor, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* RODAPÉ DO DOCUMENTO IMPRESSO & ASSINATURA */}
        <div className="mt-8 pt-4 border-t border-slate-300 page-break-inside-avoid">
          <div className="flex justify-between items-end">
            <div className="text-[8pt] text-slate-500 font-mono space-y-1">
              <p>Documento gerado eletronicamente pelo software Mezzold Financial.</p>
              <p>Chave de Validação: {Math.random().toString(36).substring(2, 10).toUpperCase()}-{Date.now()}</p>
            </div>

            <div className="text-center w-64 border-t border-slate-900 pt-1">
              <p className="text-[8.5pt] font-bold text-slate-900">Responsável Financeiro</p>
              <p className="text-[7.5pt] text-slate-600">{empresaConfig.razaoSocial || 'Mezzold Financial'}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
