import { ReactNode } from 'react';
import { X } from 'lucide-react';

const RadioOption = ({ label, name, defaultChecked }: { label: string, name: string, defaultChecked?: boolean }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <div className="relative flex items-center justify-center w-4 h-4">
      <input type="radio" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <div className="w-4 h-4 rounded-full border border-zinc-700 bg-zinc-950 peer-checked:border-red-500 peer-checked:bg-red-500 transition-all"></div>
      <div className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
    </div>
    <span className="text-sm text-zinc-400 peer-checked:text-zinc-100 group-hover:text-zinc-200 transition-colors select-none">{label}</span>
  </label>
);

const Label = ({ children }: { children: ReactNode }) => (
  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">{children}</h3>
);

const Input = ({ defaultValue, className = '' }: { defaultValue?: string, className?: string }) => (
  <input 
    type="text" 
    defaultValue={defaultValue}
    className={`bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-zinc-700 ${className}`} 
  />
);

export function ReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-900/90 backdrop-blur-xl rounded-xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] border border-zinc-800/80 flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-medium text-zinc-100 tracking-wide">
            Relatório de títulos acumulativo
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
                <RadioOption name="vencimento" label="Vencimento" />
                <RadioOption name="vencimento" label="Vcto. Projetado" defaultChecked />
              </div>
            </div>
            <div className="col-span-4">
              <Label>Taxa Deságio</Label>
              <div className="relative">
                <Input defaultValue="0" className="w-full text-right pr-8 font-mono h-[42px]" />
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
                  <select className="w-full h-[42px] appearance-none bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all cursor-pointer">
                    <option>Igual a</option>
                    <option>Entre</option>
                    <option>Maior que</option>
                    <option>Menor que</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="col-span-4">
                <Input defaultValue="01/01/2026" className="w-full font-mono text-center tracking-wider h-[42px]" />
              </div>
              <div className="col-span-4">
                <Input defaultValue="14/08/2026" className="w-full font-mono text-center tracking-wider h-[42px]" />
              </div>
            </div>
          </div>

          {/* Row 3: Tipo e Destino */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label>Tipo</Label>
              <div className="flex flex-col gap-4 bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/50">
                <RadioOption name="tipo" label="Dinheiro" />
                <RadioOption name="tipo" label="Cheque" />
                <RadioOption name="tipo" label="Ambos" defaultChecked />
              </div>
            </div>
            <div>
              <Label>Destino</Label>
              <div className="flex flex-col gap-4 bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/50 h-[116px]">
                <RadioOption name="destino" label="Vídeo" />
                <RadioOption name="destino" label="Impressora" defaultChecked />
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
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] focus:outline-none focus:ring-2 focus:ring-red-500/50">
              OK
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
