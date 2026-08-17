import { X, Printer, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatDateBR, calcularSaldoDevedor } from '../lib/utils';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions?: {
    dadosTitulos: string;
    desagio: number;
    condicaoData: string;
    dataInicio: string;
    dataFim: string;
    tipo: string;
    destino: string;
  };
}

export function ReportViewerModal({ isOpen, onClose, filterOptions }: ReportViewerModalProps) {
  const { titulos, entidades, empresaConfig, currentUser } = useAppContext();

  if (!isOpen) return null;

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  // Exemplo de títulos filtrados
  const titulosFiltrados = titulos.filter(t => {
    if (filterOptions?.tipo === 'Dinheiro') return t.tipo_titulo === 'RECEBER';
    if (filterOptions?.tipo === 'Cheque') return t.tipo_titulo === 'PAGAR';
    return true;
  });

  const totalOriginal = titulosFiltrados.reduce((sum, t) => sum + t.valor_original, 0);
  const totalSaldo = titulosFiltrados.reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md no-print" onClick={onClose}></div>

      {/* MODAL DE TELA */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100 no-print">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">Relatório de Títulos Acumulativo</h2>
              <p className="text-[11px] text-zinc-400 font-mono">Gerado em: {dataAtual} - {empresaConfig.razaoSocial || 'Mezzold Financial'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.35)]"
            >
              <Printer size={15} /> Imprimir / Salvar PDF
            </button>
            <button 
              onClick={onClose} 
              className="text-zinc-400 hover:text-zinc-100 p-2 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-zinc-950/40 font-mono text-xs">
          
          {/* Metadata Box */}
          <div className="grid grid-cols-4 gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-[9px]">Filtro de Datas</span>
              <span className="text-zinc-200 font-bold">{filterOptions?.dataInicio || '01/01/2026'} até {filterOptions?.dataFim || '14/08/2026'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-[9px]">Tipo de Título</span>
              <span className="text-zinc-200 font-bold">{filterOptions?.tipo || 'Ambos (Receber/Pagar)'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-[9px]">Taxa de Deságio</span>
              <span className="text-zinc-200 font-bold">{filterOptions?.desagio || 0}%</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-[9px]">Total Registros</span>
              <span className="text-zinc-200 font-bold">{titulosFiltrados.length} títulos</span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/80 shadow-md">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Documento</th>
                  <th className="px-4 py-3 font-semibold">Entidade / Cliente</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold text-center">Vencimento</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Valor Original</th>
                  <th className="px-4 py-3 font-semibold text-right">Saldo Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {titulosFiltrados.map((t) => {
                  const ent = entidades.find(e => e.id === t.id_entidade);
                  const saldo = calcularSaldoDevedor(t);
                  return (
                    <tr key={t.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-100 font-bold">{t.numero_documento}</td>
                      <td className="px-4 py-2.5 text-zinc-300 font-sans font-medium">{ent?.nome || 'Entidade Padrão'}</td>
                      <td className="px-4 py-2.5 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.tipo_titulo === 'RECEBER' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-blue-950 text-blue-400 border border-blue-800'}`}>
                          {t.tipo_titulo}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 text-center">{formatDateBR(t.data_vencimento)}</td>
                      <td className="px-4 py-2.5 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'PAGO' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-200">R$ {formatCurrency(t.valor_original)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-red-400">R$ {formatCurrency(saldo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end gap-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Total Original Acumulado</span>
              <span className="text-base font-bold text-zinc-100 font-mono">R$ {formatCurrency(totalOriginal)}</span>
            </div>
            <div className="text-right border-l border-zinc-800 pl-6">
              <span className="text-[10px] text-red-400 block uppercase font-bold">Total Saldo Devedor Atual</span>
              <span className="text-base font-bold text-red-500 font-mono">R$ {formatCurrency(totalSaldo)}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-md"
          >
            Fechar Relatório
          </button>
        </div>

      </div>

      {/* DOCUMENTO EXCLUSIVO DE IMPRESSÃO A4 */}
      <div className="printable-report-a4 hidden print:block text-black bg-white">
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                {empresaConfig.razaoSocial || 'MEZZOLD FINANCIAL STUDIO'}
              </h1>
              <p className="text-[10pt] text-slate-600 font-medium">
                {empresaConfig.nomeFantasia || 'Relatório de Títulos e Carteira de Cobrança'}
              </p>
              <div className="text-[8pt] text-slate-500 font-mono mt-1 space-x-3">
                <span><b>CNPJ:</b> {empresaConfig.cnpj || '00.000.000/0001-00'}</span>
                <span><b>Tel:</b> {empresaConfig.telefone || '(11) 99999-9999'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white text-[9pt] font-black px-2.5 py-1 rounded tracking-wider uppercase mb-1">
                RELATÓRIO DE GESTÃO
              </span>
              <p className="text-[8pt] text-slate-600 font-mono"><b>Emissão:</b> {new Date().toLocaleString('pt-BR')}</p>
              <p className="text-[8pt] text-slate-600 font-mono"><b>Operador:</b> {currentUser?.nome || 'Administrador'}</p>
            </div>
          </div>
        </div>

        <table className="w-full text-[8.5pt] text-left border-collapse border border-slate-300 mb-4">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Documento</th>
              <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Cliente / Entidade</th>
              <th className="border border-slate-300 px-2.5 py-1.5 font-bold text-center">Tipo</th>
              <th className="border border-slate-300 px-2.5 py-1.5 font-bold text-center">Vencimento</th>
              <th className="border border-slate-300 px-2.5 py-1.5 font-bold text-center">Status</th>
              <th className="border border-slate-300 px-2.5 py-1.5 font-bold text-right">Valor Original</th>
              <th className="border border-slate-300 px-2.5 py-1.5 font-bold text-right">Saldo Atual</th>
            </tr>
          </thead>
          <tbody>
            {titulosFiltrados.map((t, idx) => {
              const ent = entidades.find(e => e.id === t.id_entidade);
              const saldo = calcularSaldoDevedor(t);
              return (
                <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 px-2.5 py-1 font-mono font-bold">{t.numero_documento}</td>
                  <td className="border border-slate-300 px-2.5 py-1 font-medium">{ent?.nome || 'Entidade Padrão'}</td>
                  <td className="border border-slate-300 px-2.5 py-1 text-center font-mono">{t.tipo_titulo}</td>
                  <td className="border border-slate-300 px-2.5 py-1 text-center font-mono">{formatDateBR(t.data_vencimento)}</td>
                  <td className="border border-slate-300 px-2.5 py-1 text-center font-bold">{t.status}</td>
                  <td className="border border-slate-300 px-2.5 py-1 text-right font-mono">R$ {formatCurrency(t.valor_original)}</td>
                  <td className="border border-slate-300 px-2.5 py-1 text-right font-mono font-bold">R$ {formatCurrency(saldo)}</td>
                </tr>
              );
            })}
            <tr className="bg-slate-200 font-bold">
              <td colSpan={5} className="border border-slate-300 px-2.5 py-1.5 text-right uppercase">Totais:</td>
              <td className="border border-slate-300 px-2.5 py-1.5 text-right font-mono">R$ {formatCurrency(totalOriginal)}</td>
              <td className="border border-slate-300 px-2.5 py-1.5 text-right font-mono font-black">R$ {formatCurrency(totalSaldo)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end">
          <div className="text-[8pt] text-slate-500 font-mono">
            <p>Documento oficial emitido pelo software Mezzold Financial.</p>
          </div>
          <div className="text-center w-64 border-t border-slate-900 pt-1">
            <p className="text-[8.5pt] font-bold text-slate-900">Responsável Financeiro</p>
          </div>
        </div>
      </div>

    </div>
  );
}
