import { useState, ReactNode } from 'react';
import { X } from 'lucide-react';

const RadioOption = ({ label, name, value, checked, onChange }: { label: string, name: string, value: string, checked: boolean, onChange: (val: string) => void }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <div className="relative flex items-center justify-center w-4 h-4">
      <input 
        type="radio" 
        name={name} 
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only" 
      />
      <div className="w-4 h-4 rounded-full border border-zinc-700 bg-zinc-950 peer-checked:border-red-500 peer-checked:bg-red-500 transition-all"></div>
      <div className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
    </div>
    <span className="text-sm text-zinc-400 peer-checked:text-zinc-100 group-hover:text-zinc-200 transition-colors select-none">{label}</span>
  </label>
);

const Label = ({ children }: { children: ReactNode }) => (
  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">{children}</h3>
);

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport?: (filterOptions: any) => void;
}

export function ReportModal({ isOpen, onClose, onGenerateReport }: ReportModalProps) {
  const [dadosTitulos, setDadosTitulos] = useState('vencimento');
  const [desagio, setDesagio] = useState('0');
  const [condicaoData, setCondicaoData] = useState('Igual a');
  const [dataInicio, setDataInicio] = useState('01/01/2026');
  const [dataFim, setDataFim] = useState('14/08/2026');
  const [tipo, setTipo] = useState('Ambos');
  const [destino, setDestino] = useState('Vídeo');

  if (!isOpen) return null;

  const handleOk = () => {
    if (onGenerateReport) {
      onGenerateReport({
        dadosTitulos,
        desagio: parseFloat(desagio) || 0,
        condicaoData,
        dataInicio,
        dataFim,
        tipo,
        destino,
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-900/90 backdrop-blur-xl rounded-xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] border border-zinc-800/80 flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-medium text-zinc-100 tracking-wide">
            Relatório de Títulos Acumulativo
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none bg-zinc-800/50 hover:bg-zinc-700/50 p-1.5 rounded-md">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 space-y-8 flex-1 overflow-y-auto">
          
          {/* Row 1: Dados dos Títulos & Taxa Deságio */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
              <Label>Dados dos Títulos</Label>
              <div className="flex items-center gap-8 bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-800/50 h-[42px]">
                <RadioOption name="vencimento" value="vencimento" label="Vencimento" checked={dadosTitulos === 'vencimento'} onChange={setDadosTitulos} />
                <RadioOption name="vencimento" value="vcto_projetado" label="Vcto. Projetado" checked={dadosTitulos === 'vcto_projetado'} onChange={setDadosTitulos} />
              </div>
            </div>
            <div className="col-span-4">
              <Label>Taxa Deságio</Label>
              <div className="relative">
                <input 
                  type="text" 
                  value={desagio}
                  onChange={e => setDesagio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono h-[42px] text-right pr-8" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Row 2: Intervalo de Datas */}
          <div>
            <Label>Intervalo de datas</Label>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="relative">
                  <select 
                    value={condicaoData}
                    onChange={e => setCondicaoData(e.target.value)}
                    className="w-full h-[42px] appearance-none bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all cursor-pointer"
                  >
                    <option value="Igual a">Igual a</option>
                    <option value="Entre">Entre</option>
                    <option value="Maior que">Maior que</option>
                    <option value="Menor que">Menor que</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="col-span-4">
                <input 
                  type="text"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-center tracking-wider h-[42px]" 
                />
              </div>
              <div className="col-span-4">
                <input 
                  type="text"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-center tracking-wider h-[42px]" 
                />
              </div>
            </div>
          </div>

          {/* Row 3: Tipo e Destino */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label>Tipo de Título</Label>
              <div className="flex flex-col gap-4 bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/50">
                <RadioOption name="tipo" value="Dinheiro" label="Contas a Receber (Clientes)" checked={tipo === 'Dinheiro'} onChange={setTipo} />
                <RadioOption name="tipo" value="Cheque" label="Contas a Pagar (Fornecedores)" checked={tipo === 'Cheque'} onChange={setTipo} />
                <RadioOption name="tipo" value="Ambos" label="Ambos os Tipos" checked={tipo === 'Ambos'} onChange={setTipo} />
              </div>
            </div>
            <div>
              <Label>Destino de Saída</Label>
              <div className="flex flex-col gap-4 bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/50 h-[132px]">
                <RadioOption name="destino" value="Vídeo" label="Visualizar na Tela (Vídeo)" checked={destino === 'Vídeo'} onChange={setDestino} />
                <RadioOption name="destino" value="Impressora" label="Impressora / PDF" checked={destino === 'Impressora'} onChange={setDestino} />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between flex-shrink-0">
          <button onClick={onClose} className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none">
            Cancela filtro
          </button>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-zinc-600">
              Cancelar
            </button>
            <button onClick={handleOk} className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] focus:outline-none focus:ring-2 focus:ring-red-500/50">
              OK - Gerar Relatório
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
