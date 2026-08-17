import { useState } from 'react';
import { 
  ArchiveRestore, RotateCcw, Search, FileText, Printer, 
  Trash2, DollarSign, CheckCircle2, ShieldCheck, X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../lib/utils';
import { Titulo, Entidade } from '../../types';

export function ArquivoMortoView() {
  const { titulos, entidades, empresaConfig, restaurarTitulo, limparBaseCincoAnos, showToast } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'TODOS' | 'RECEBER' | 'PAGAR'>('TODOS');
  
  // Modal de Recibo de Quitação
  const [reciboTitulo, setReciboTitulo] = useState<{ titulo: Titulo; entidade: Entidade | undefined } | null>(null);

  // Títulos liquidados/pagos (Arquivo Morto)
  const titulosEncerrados = titulos.filter(t => t.status === 'PAGO');

  const filtered = titulosEncerrados.filter(t => {
    const ent = entidades.find(e => e.id === t.id_entidade);
    const matchSearch = 
      t.numero_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ent && ent.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (tipoFilter === 'RECEBER') return t.tipo_titulo === 'RECEBER';
    if (tipoFilter === 'PAGAR') return t.tipo_titulo === 'PAGAR';

    return true;
  });

  // Métricas do Arquivo Morto
  const totalHistorico = titulosEncerrados.reduce((sum, t) => sum + t.valor_original, 0);
  const totalRecebimentos = titulosEncerrados
    .filter(t => t.tipo_titulo === 'RECEBER')
    .reduce((sum, t) => sum + t.valor_original, 0);
  const totalPagamentos = titulosEncerrados
    .filter(t => t.tipo_titulo === 'PAGAR')
    .reduce((sum, t) => sum + t.valor_original, 0);

  const handleOpenRecibo = (t: Titulo) => {
    const entidade = entidades.find(e => e.id === t.id_entidade);
    setReciboTitulo({ titulo: t, entidade });
  };

  const handlePrintRecibo = () => {
    window.print();
  };

  const dataHojeExtenso = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const dataHojeBR = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 select-none text-slate-200 overflow-hidden">
      
      {/* 4 Cards Gerenciais do Arquivo Morto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total em Arquivo Morto</p>
            <p className="text-xl font-black text-slate-100 font-mono mt-0.5">{titulosEncerrados.length} Registros</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ArchiveRestore size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Histórico Total Liquidado</p>
            <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">R$ {formatCurrency(totalHistorico)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recebimentos Liquidados</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-slate-100 font-mono">R$ {formatCurrency(totalRecebimentos)}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pagamentos Liquidados</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-slate-300 font-mono">R$ {formatCurrency(totalPagamentos)}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* Top Filter & Action Bar */}
      <div className="flex items-center justify-between bg-[#161922] border border-[#2b3242] rounded-xl px-3 py-2 shadow-md">
        
        {/* Tabs de Filtro por Tipo */}
        <div className="flex items-center bg-[#11131a] p-1 rounded-lg border border-[#2b3242]">
          <button
            onClick={() => setTipoFilter('TODOS')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              tipoFilter === 'TODOS' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({titulosEncerrados.length})
          </button>
          <button
            onClick={() => setTipoFilter('RECEBER')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              tipoFilter === 'RECEBER' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recebimentos ({titulosEncerrados.filter(t => t.tipo_titulo === 'RECEBER').length})
          </button>
          <button
            onClick={() => setTipoFilter('PAGAR')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              tipoFilter === 'PAGAR' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pagamentos ({titulosEncerrados.filter(t => t.tipo_titulo === 'PAGAR').length})
          </button>
        </div>

        {/* Busca e Botão de Purga / Limpeza de Base */}
        <div className="flex items-center gap-3">
          <div className="relative w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar documento ou cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            onClick={() => {
              if (window.confirm('Deseja realmente aplicar a rotina de retenção legal (remover títulos com mais de 5 anos)?')) {
                limparBaseCincoAnos();
                showToast('Rotina de retenção executada: títulos antigos purgados com sucesso!');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 rounded-lg text-xs font-bold transition-all shadow-sm"
            title="Purga automática de títulos encerrados há mais de 5 anos (Lei Fiscal)"
          >
            <Trash2 size={13} />
            <span>Purga (5 Anos)</span>
          </button>
        </div>

      </div>

      {/* Tabela do Arquivo Morto */}
      <div className="bg-[#161922] border border-[#2b3242] rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 z-10 font-mono tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Status / ID</th>
                <th className="px-5 py-3.5 font-semibold">Cliente / Fornecedor</th>
                <th className="px-5 py-3.5 font-semibold">Nº Documento</th>
                <th className="px-5 py-3.5 font-semibold text-right">Valor Quitado</th>
                <th className="px-5 py-3.5 font-semibold text-center">Data Liquidação</th>
                <th className="px-5 py-3.5 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232836]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Nenhum título quitado localizado no histórico do arquivo morto.
                  </td>
                </tr>
              )}

              {filtered.map((t) => {
                const ent = entidades.find(e => e.id === t.id_entidade);
                
                return (
                  <tr key={t.id} className="hover:bg-[#1f2432]/70 transition-colors group">
                    
                    {/* STATUS & ID */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          QUITADO
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">#{t.id}</span>
                      </div>
                    </td>

                    {/* CLIENTE */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-100 text-sm">
                        {ent?.nome || 'Entidade Padrão'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {ent?.documento || 'Sem Documento'}
                      </div>
                    </td>

                    {/* Nº DOCUMENTO */}
                    <td className="px-5 py-3.5 font-mono text-slate-200 font-bold">
                      <span className="bg-[#1e2330] border border-[#2e3748] px-2.5 py-1 rounded text-xs">
                        {t.numero_documento}
                      </span>
                    </td>

                    {/* VALOR QUITADO */}
                    <td className="px-5 py-3.5 font-mono text-right font-bold text-emerald-400">
                      R$ {formatCurrency(t.valor_original)}
                    </td>

                    {/* DATA LIQUIDAÇÃO */}
                    <td className="px-5 py-3.5 font-mono text-center text-slate-300">
                      {t.data_liquidacao ? formatDateBR(t.data_liquidacao) : 'Liquidado'}
                    </td>

                    {/* AÇÕES CONECTADAS (VISÍVEIS) */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Restaurar Título para Carteira Ativa */}
                        <button 
                          onClick={() => {
                            restaurarTitulo(t.id);
                            showToast(`Título ${t.numero_documento} restaurado para a carteira ativa!`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2838] text-slate-200 hover:bg-red-600 hover:text-white border border-[#2e3748] rounded-lg text-xs font-bold transition-all shadow-sm"
                          title="Restaurar este título para a carteira ativa"
                        >
                          <RotateCcw size={13} />
                          <span>Restaurar</span>
                        </button>

                        {/* Emitir Recibo de Quitação */}
                        <button 
                          onClick={() => handleOpenRecibo(t)}
                          className="p-1.5 bg-[#1f2838] text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 rounded-lg transition-all"
                          title="Emitir Recibo de Quitação Integral"
                        >
                          <Printer size={14} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé Informativo */}
        <div className="px-5 py-2.5 bg-[#111319] border-t border-[#2b3242] text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>{filtered.length} de {titulosEncerrados.length} títulos encerrados no histórico</span>
          <span className="text-emerald-400 font-bold">Total quitado acumulado: R$ {formatCurrency(totalHistorico)}</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL: RECIBO DE QUITAÇÃO INTEGRAL (FORMATAÇÃO OFICIAL A4)           */}
      {/* =================================================================== */}
      {reciboTitulo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Escuro (Ocultado na impressão via CSS) */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md no-print" onClick={() => setReciboTitulo(null)}></div>
          
          {/* Modal Recibo Element */}
          <div className="modal-recibo relative w-full max-w-2xl bg-[#181c26] border border-[#2e374a] rounded-2xl shadow-2xl p-8 text-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Close Button (no-print) */}
            <div className="absolute top-4 right-4 no-print">
              <button 
                onClick={() => setReciboTitulo(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#252c3c] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* HEADER DO RECIBO */}
            <div className="text-center pb-5 mb-5 border-b border-[#2e374a]">
              <h1 className="text-2xl font-black uppercase text-slate-100 tracking-wider">
                {empresaConfig.razaoSocial || empresaConfig.nomeFantasia || 'MEZZOLD STUDIO'}
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                CNPJ: {empresaConfig.cnpj || '00.000.000/0001-00'} | {empresaConfig.email || 'financeiro@mezzold.com.br'}
              </p>
            </div>

            {/* TÍTULO DO DOCUMENTO */}
            <div className="text-center my-6">
              <h2 className="text-lg font-black uppercase text-slate-200 tracking-widest">
                RECIBO DE QUITAÇÃO INTEGRAL
              </h2>
            </div>

            {/* DESTAQUE DO VALOR RECEBIDO */}
            <div className="print-green-box my-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="print-green-text text-xl font-black text-emerald-400 font-mono tracking-wide">
                VALOR RECEBIDO: R$ {formatCurrency(reciboTitulo.titulo.valor_original)}
              </span>
            </div>

            {/* DECLARAÇÃO OFICIAL */}
            <div className="my-6 text-sm text-slate-300 leading-relaxed font-sans text-justify space-y-4">
              <p>
                Declaramos para os devidos fins de quitação que recebemos da empresa{' '}
                <strong className="text-slate-100 font-bold">{reciboTitulo.entidade?.nome || 'Empresa Cliente'}</strong>,
                inscrita no CNPJ/CPF sob o nº{' '}
                <strong className="text-slate-100 font-mono">{reciboTitulo.entidade?.documento || '00.000.000/0000-00'}</strong>,
                a importância supramencionada, referente à liquidação integral e sem ressalvas do título nº{' '}
                <strong className="text-slate-100 font-mono">{reciboTitulo.titulo.numero_documento}</strong>.
              </p>
            </div>

            {/* GRID DE DATAS E STATUS */}
            <div className="my-8 py-4 border-y border-[#2e374a] space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#232938]">
                <span className="text-slate-400">Data da Quitação:</span>
                <strong className="text-slate-100 font-mono font-bold">
                  {reciboTitulo.titulo.data_liquidacao 
                    ? formatDateBR(reciboTitulo.titulo.data_liquidacao) 
                    : formatDateBR(reciboTitulo.titulo.data_vencimento)}
                </strong>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#232938]">
                <span className="text-slate-400">Situação do Título:</span>
                <span className="print-green-text text-emerald-400 font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  QUITADO / ARQUIVADO
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Data de Emissão do Recibo:</span>
                <strong className="text-slate-100 font-mono font-bold">{dataHojeBR}</strong>
              </div>
            </div>

            {/* FRASE DE ENCERRAMENTO E ASSINATURA */}
            <div className="mt-12 text-center space-y-12">
              <p className="text-xs text-slate-400 italic">
                Por ser expressão da verdade, firmamos o presente recibo.
              </p>

              <div className="pt-6 inline-block w-72 border-t border-slate-500 text-center">
                <p className="text-xs font-bold text-slate-200">Departamento Financeiro</p>
                <p className="text-[11px] font-mono text-slate-400">
                  {empresaConfig.razaoSocial || 'Mezzold Studio LTDA'}
                </p>
              </div>
            </div>

            {/* RODAPÉ DO DOCUMENTO */}
            <div className="mt-12 pt-4 border-t border-[#2e374a] text-center text-[10px] text-slate-500 space-y-0.5 font-mono">
              <p>Este documento é um comprovante oficial de pagamento.</p>
              <p>Documento gerado eletronicamente pelo Sistema de Gestão Financeira.</p>
            </div>

            {/* CONTROLES DO MODAL (no-print: invisíveis na impressora) */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#2e374a] no-print">
              <button
                onClick={() => setReciboTitulo(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-[#252c3c] border border-[#2e374a] rounded-xl transition-colors"
              >
                Fechar
              </button>

              <button
                onClick={handlePrintRecibo}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Printer size={15} /> Imprimir Recibo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
