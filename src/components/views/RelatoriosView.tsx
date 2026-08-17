import { useState } from 'react';
import { 
  FileText, Calendar, Users, AlertTriangle, Wallet, 
  Printer, Download, Filter, Search
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDateBR, isTituloVencido } from '../../lib/utils';

export function RelatoriosView() {
  const { titulos, entidades, cheques } = useAppContext();

  // Tipo de Relatório Ativo
  const [activeReport, setActiveReport] = useState<'GERAL' | 'MES' | 'CLIENTE' | 'INADIMPLENCIA' | 'CHEQUES'>('GERAL');

  // Filtros
  const [selectedEntidade, setSelectedEntidade] = useState<string>('TODOS');
  const [selectedTipo, setSelectedTipo] = useState<'TODOS' | 'RECEBER' | 'PAGAR'>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<'TODOS' | 'EM_ABERTO' | 'PAGO' | 'VENCIDO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica 1: Relatório Geral Filtrado
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

  // Totais do Relatório Atual
  const totalOriginal = filteredTitulos.reduce((acc, t) => acc + t.valor_original, 0);
  const totalPago = filteredTitulos.reduce((acc, t) => acc + t.valor_pago, 0);
  const totalSaldo = filteredTitulos.reduce((acc, t) => acc + t.saldo_devedor, 0);

  // Lógica 2: Agrupamento por Mês
  const relatorioPorMes = titulos.reduce((acc: any, t) => {
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

  const mesesList = Object.values(relatorioPorMes).sort((a: any, b: any) => a.mes.localeCompare(b.mes));

  // Lógica 3: Agrupamento por Cliente
  const relatorioPorCliente = entidades.map(ent => {
    const titulosCliente = titulos.filter(t => t.id_entidade === ent.id);
    const totalOriginal = titulosCliente.reduce((sum, t) => sum + t.valor_original, 0);
    const totalPago = titulosCliente.reduce((sum, t) => sum + t.valor_pago, 0);
    const totalSaldo = titulosCliente.reduce((sum, t) => sum + t.saldo_devedor, 0);
    const vencidosCount = titulosCliente.filter(t => isTituloVencido(t)).length;

    return {
      entidade: ent,
      count: titulosCliente.length,
      totalOriginal,
      totalPago,
      totalSaldo,
      vencidosCount
    };
  }).filter(c => c.count > 0);

  // Lógica 4: Inadimplência Aging List
  const titulosInadimplentes = titulos.filter(t => isTituloVencido(t));

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
    link.setAttribute("download", `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 select-none text-slate-200 overflow-hidden">
      
      {/* Top Selector of Report Models (5 Variações Úteis) */}
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

      {/* Filter Options Bar & Export Actions */}
      <div className="flex items-center justify-between bg-[#161922] border border-[#2b3242] rounded-xl px-3 py-2 shrink-0">
        
        {/* Filters */}
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

          {/* Search Bar */}
          <div className="relative w-48">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar documento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Action Buttons: Imprimir e Exportar CSV */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-[#222836] hover:bg-[#2e374a] text-slate-200 border border-[#2e3748] px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm"
            title="Exportar Planilha Excel/CSV"
          >
            <Download size={13} className="text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3.5 py-1 rounded-lg text-xs font-bold transition-all shadow-md"
            title="Imprimir ou Salvar PDF"
          >
            <Printer size={13} />
            <span>Imprimir / PDF</span>
          </button>
        </div>

      </div>

      {/* ÁREA PRINCIPAL DO RELATÓRIO SELECIONADO */}
      <div className="bg-[#161922] border border-[#2b3242] rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        
        {/* RELATÓRIO 1: GERAL DE TÍTULOS */}
        {activeReport === 'GERAL' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Documento</th>
                    <th className="px-4 py-3 font-semibold">Cliente / Fornecedor</th>
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
                        <td className="px-4 py-3 font-mono font-bold text-slate-100">{t.numero_documento}</td>
                        <td className="px-4 py-3 font-semibold text-slate-100">{ent?.nome || 'Cliente Padrão'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            t.tipo_titulo === 'RECEBER' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'
                          }`}>
                            {t.tipo_titulo}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-right font-bold text-slate-100">R$ {formatCurrency(t.valor_original)}</td>
                        <td className="px-4 py-3 font-mono text-right text-emerald-400 font-bold">R$ {formatCurrency(t.valor_pago)}</td>
                        <td className="px-4 py-3 font-mono text-right text-red-400 font-bold">R$ {formatCurrency(t.saldo_devedor)}</td>
                        <td className="px-4 py-3 font-mono text-center">{formatDateBR(t.data_vencimento)}</td>
                        <td className="px-4 py-3 text-center">
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
                <span>Recebido/Pago: <b className="text-emerald-400">R$ {formatCurrency(totalPago)}</b></span>
                <span>Saldo Pendente: <b className="text-red-400">R$ {formatCurrency(totalSaldo)}</b></span>
              </div>
            </div>
          </div>
        )}

        {/* RELATÓRIO 2: DRE MENSAL / VISÃO POR MÊS */}
        {activeReport === 'MES' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Mês / Ano Competência</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Contador de Títulos</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Faturamento (Receber)</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Despesas (Pagar)</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Total Quitado</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Saldo Pendente Mês</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232836]">
                  {mesesList.map((m: any) => (
                    <tr key={m.mes} className="hover:bg-[#1f2432]/70 transition-colors font-mono">
                      <td className="px-5 py-3.5 font-bold text-slate-100 uppercase text-xs">
                        📆 {m.mes}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-300">{m.count} registros</td>
                      <td className="px-5 py-3.5 text-right font-bold text-emerald-400">R$ {formatCurrency(m.receber)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-blue-400">R$ {formatCurrency(m.pagar)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-100">R$ {formatCurrency(m.pago)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-red-400">R$ {formatCurrency(m.pendente)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RELATÓRIO 3: POSIÇÃO POR CLIENTE */}
        {activeReport === 'CLIENTE' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Razão Social / Cliente</th>
                    <th className="px-5 py-3.5 font-semibold text-center">N° Títulos</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Volume Total</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Total Liquidado</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Saldo Devedor Ativo</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Atrasos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232836]">
                  {relatorioPorCliente.map((c) => (
                    <tr key={c.entidade.id} className="hover:bg-[#1f2432]/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-100">
                        {c.entidade.nome}
                        <span className="block text-[10px] font-mono text-slate-500">{c.entidade.documento}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-300">{c.count} títulos</td>
                      <td className="px-5 py-3.5 font-mono text-right font-bold text-slate-100">R$ {formatCurrency(c.totalOriginal)}</td>
                      <td className="px-5 py-3.5 font-mono text-right font-bold text-emerald-400">R$ {formatCurrency(c.totalPago)}</td>
                      <td className="px-5 py-3.5 font-mono text-right font-bold text-red-400">R$ {formatCurrency(c.totalSaldo)}</td>
                      <td className="px-5 py-3.5 text-center">
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

        {/* RELATÓRIO 4: INADIMPLÊNCIA / AGING LIST */}
        {activeReport === 'INADIMPLENCIA' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 bg-red-950/40 border-b border-red-900/50 flex items-center justify-between text-xs text-red-200">
              <span className="font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                Relatório de Títulos Vencidos e Cobrança Prioritária
              </span>
              <span className="font-mono font-bold">Total Vencido: R$ {formatCurrency(titulosInadimplentes.reduce((a, b) => a + b.saldo_devedor, 0))}</span>
            </div>

            <div className="overflow-auto flex-1">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 font-mono">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Documento</th>
                    <th className="px-4 py-3 font-semibold">Devedor</th>
                    <th className="px-4 py-3 font-semibold text-right">Saldo em Atraso</th>
                    <th className="px-4 py-3 font-semibold text-center">Vencimento Original</th>
                    <th className="px-4 py-3 font-semibold text-center">Severidade Atraso</th>
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
                            ⚠️ ATRASADO
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {titulosInadimplentes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-emerald-400 font-bold">Nenhum título em atraso na carteira! Parabéns! 🎉</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RELATÓRIO 5: CHEQUES E CUSTÓDIA */}
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
  );
}
