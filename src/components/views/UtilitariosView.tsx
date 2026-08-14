import { useState } from 'react';
import { Calculator, HardDriveUpload, HardDriveDownload, Wrench } from 'lucide-react';
import { formatCurrency, parseInputNumber } from '../../lib/utils';

export function UtilitariosView() {
  const [valOriginal, setValOriginal] = useState('10000');
  const [taxa, setTaxa] = useState('3.5');
  const [dias, setDias] = useState('30');
  const [resultado, setResultado] = useState<number | null>(null);

  const calcular = () => {
    const v = parseInputNumber(valOriginal);
    const t = parseInputNumber(taxa) / 100;
    const d = parseInt(dias);

    if (!isNaN(v) && !isNaN(t) && !isNaN(d)) {
      // Simulação simples de deságio = Valor * (1 - (Taxa/30 * Dias))
      const desc = v * (t / 30) * d;
      setResultado(v - desc);
    }
  };

  const handleCnab = () => {
    alert('Funcionalidade de importação de arquivo CNAB simulada. O parser nativo será implementado no backend.');
  };

  const handleExport = () => {
    alert('Exportação de borderô gerada com sucesso. (Simulação)');
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
          <Wrench size={24} className="text-zinc-400" />
          Utilitários e Ferramentas
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Acesso a calculadoras de balcão e rotinas de intercâmbio de dados.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        
        {/* Calculadora Financeira */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex flex-col">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Calculator size={16} /> Calculadora Financeira
          </h3>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Valor Original (R$)</label>
              <input 
                type="text" 
                value={valOriginal} 
                onChange={e => setValOriginal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500/50 font-mono" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Taxa de Deságio (%)</label>
                <input 
                  type="text" 
                  value={taxa} 
                  onChange={e => setTaxa(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500/50 font-mono" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Dias de Atraso</label>
                <input 
                  type="text" 
                  value={dias} 
                  onChange={e => setDias(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500/50 font-mono" 
                />
              </div>
            </div>
            
            <button 
              onClick={calcular}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              Calcular
            </button>
          </div>

          {resultado !== null && (
            <div className="mt-6 p-4 rounded-lg bg-zinc-500/10 border border-zinc-500/20">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Valor Final</div>
              <div className="text-3xl font-bold text-zinc-400 font-mono tracking-tight">
                {formatCurrency(resultado)}
              </div>
            </div>
          )}
        </div>

        {/* Integrações Bancárias */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex flex-col">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-6">
            <HardDriveUpload size={16} /> Intercâmbio de Dados Bancários
          </h3>
          
          <div className="flex-1 flex flex-col justify-center gap-4">
            <button 
              onClick={handleCnab}
              className="w-full h-24 border-2 border-dashed border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <HardDriveUpload size={24} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
              <div className="text-sm font-medium text-zinc-300 group-hover:text-blue-300">Importar Arquivo Retorno CNAB</div>
              <div className="text-[10px] text-zinc-500">Formatos suportados: .RET, .TXT (Febraban 240/400)</div>
            </button>

            <button 
              onClick={handleExport}
              className="w-full h-24 border-2 border-dashed border-zinc-700 hover:border-zinc-500/50 hover:bg-zinc-500/5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <HardDriveDownload size={24} className="text-zinc-500 group-hover:text-zinc-400 transition-colors" />
              <div className="text-sm font-medium text-zinc-300 group-hover:text-emerald-300">Exportar Borderô para Remessa</div>
              <div className="text-[10px] text-zinc-500">Gera arquivo .REM para registro bancário</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
