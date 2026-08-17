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
  const { titulos, entidades, empresaConfig } = useAppContext();

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
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md no-print" onClick={onClose}></div>

      <div className="printable-area relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Relatório de Títulos Acumulativo</h2>
              <p className="text-xs text-zinc-500 font-mono">Gerado em: {dataAtual} - {empresaConfig.razaoSocial || 'Mezzold Studio'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 no-print">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium transition-colors"
            >
              <Printer size={14} /> Imprimir / PDF
            </button>
            <button 
              onClick={onClose} 
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-zinc-950/40">
          
          {/* Metadata Box */}
          <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-[10px]">Filtro de Datas</span>
              <span className="text-zinc-200 font-mono">{filterOptions?.dataInicio || '01/01/2026'} até {filterOptions?.dataFim || '14/08/2026'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-[10px]">Tipo de Título</span>
              <span className="text-zinc-200">{filterOptions?.tipo || 'Ambos (Receber/Pagar)'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-[10px]">Taxa de Deságio</span>
              <span className="text-zinc-200 font-mono">{filterOptions?.desagio || 0}%</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-[10px]">Total Registros</span>
              <span className="text-zinc-200 font-bold">{titulosFiltrados.length} títulos</span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-900/80 shadow-md">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Documento</th>
                  <th className="px-4 py-3 font-semibold">Entidade / Cliente</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Vencimento</th>
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
                      <td className="px-4 py-3 text-zinc-200 font-bold">{t.numero_documento}</td>
                      <td className="px-4 py-3 text-zinc-300 font-sans">{ent?.nome || 'Entidade Padrão'}</td>
                      <td className="px-4 py-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.tipo_titulo === 'RECEBER' ? 'bg-red-500/10 text-red-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {t.tipo_titulo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{formatDateBR(t.data_vencimento)}</td>
                      <td className="px-4 py-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.status === 'PAGO' ? 'bg-zinc-500/10 text-zinc-400' : 'bg-red-500/10 text-red-400'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(t.valor_original)}</td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-100">{formatCurrency(saldo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end gap-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="text-right">
              <span className="text-xs text-zinc-500 block uppercase font-bold">Total Original Acumulado</span>
              <span className="text-lg font-bold text-zinc-300 font-mono">{formatCurrency(totalOriginal)}</span>
            </div>
            <div className="text-right border-l border-zinc-800 pl-6">
              <span className="text-xs text-red-500/90 block uppercase font-bold">Total Saldo Devedor Atual</span>
              <span className="text-xl font-bold text-red-500 font-mono">{formatCurrency(totalSaldo)}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex justify-end no-print">
          <button 
            onClick={onClose} 
            className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors shadow-lg"
          >
            Fechar Relatório
          </button>
        </div>

      </div>
    </div>
  );
}
