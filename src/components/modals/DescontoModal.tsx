import { useState } from 'react';
import { X, Percent } from 'lucide-react';
import { parseInputNumber } from '../../lib/utils';

export function DescontoModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [valorNominal, setValorNominal] = useState('10000');
  const [taxaDesagio, setTaxaDesagio] = useState('3.5');
  const [dias, setDias] = useState('30');
  const [iof, setIof] = useState('0.38');
  const [resultado, setResultado] = useState<{ liquido: number, desagio: number } | null>(null);

  if (!isOpen) return null;

  const handleCalcular = () => {
    const v = parseInputNumber(valorNominal);
    const t = parseInputNumber(taxaDesagio) / 100;
    const d = parseInt(dias);
    const i = parseInputNumber(iof) / 100;

    if (!isNaN(v) && !isNaN(t) && !isNaN(d) && !isNaN(i)) {
      // Cálculo simplificado: Deságio pro-rata dia + IOF
      const valorDesagio = (v * (t / 30) * d) + (v * i);
      const valorLiquido = v - valorDesagio;
      setResultado({ liquido: valorLiquido, desagio: valorDesagio });
    }
  };

  const handleClose = () => {
    setResultado(null);
    onClose();
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative w-full max-w-md max-h-[85vh] bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] border border-zinc-800/80 flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/50 flex-shrink-0">
          <h2 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <Percent size={16} className="text-red-500" />
            Cálculo de Desconto de Títulos
          </h2>
          <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none bg-zinc-800/50 hover:bg-zinc-700/50 p-1.5 rounded-md">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Valor Nominal (R$)</label>
            <input 
              type="text" 
              value={valorNominal} 
              onChange={(e) => setValorNominal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Taxa de Deságio (%)</label>
              <input 
                type="text" 
                value={taxaDesagio} 
                onChange={(e) => setTaxaDesagio(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Dias Antecipados</label>
              <input 
                type="text" 
                value={dias} 
                onChange={(e) => setDias(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">IOF Fixo (%)</label>
            <input 
              type="text" 
              value={iof}
              readOnly
              className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-md px-3 py-2 text-sm text-zinc-500 focus:outline-none cursor-not-allowed font-mono" 
            />
          </div>

          <button 
            onClick={handleCalcular}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          >
            Calcular Desconto
          </button>

          {/* Result Card */}
          {resultado && (
            <div className="mt-6 p-4 rounded-lg bg-zinc-500/10 border border-zinc-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-zinc-500/70 uppercase tracking-widest mb-1">Valor Líquido</div>
                  <div className="text-xl font-bold text-zinc-400 font-mono tracking-tight">
                    {formatCurrency(resultado.liquido)}
                  </div>
                </div>
                <div className="border-l border-zinc-500/20 pl-4">
                  <div className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest mb-1">Deságio Retido</div>
                  <div className="text-xl font-bold text-rose-400 font-mono tracking-tight">
                    {formatCurrency(resultado.desagio)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/80 flex justify-end flex-shrink-0">
          <button 
            onClick={handleClose} 
            className="px-5 py-2 text-sm font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 rounded-md transition-all focus:outline-none"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
