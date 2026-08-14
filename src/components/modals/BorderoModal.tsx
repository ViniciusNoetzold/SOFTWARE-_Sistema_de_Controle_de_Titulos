import { useState } from 'react';
import { X, FileSpreadsheet } from 'lucide-react';

interface TituloPendente {
  id: string;
  cliente: string;
  numero: string;
  vencimento: string;
  valor: number;
}

const mockTitulos: TituloPendente[] = [
  { id: '1', cliente: 'TechCorp Solutions', numero: 'NF-1027', vencimento: '2026-08-15', valor: 5500.00 },
  { id: '2', cliente: 'Global Imports Ltda', numero: 'NF-1028', vencimento: '2026-08-18', valor: 12000.00 },
  { id: '3', cliente: 'Comercial Silva', numero: 'NF-1029', vencimento: '2026-08-20', valor: 350.50 },
  { id: '4', cliente: 'TechCorp Solutions', numero: 'NF-1030', vencimento: '2026-08-25', valor: 8900.00 },
  { id: '5', cliente: 'Indústria ABC', numero: 'FAT-998', vencimento: '2026-08-28', valor: 45000.00 },
];

export function BorderoModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  
  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleAll = () => {
    if (selecionados.length === mockTitulos.length) {
      setSelecionados([]);
    } else {
      setSelecionados(mockTitulos.map(t => t.id));
    }
  };

  const handleGerar = () => {
    if (selecionados.length === 0) {
      alert('Selecione ao menos um título para gerar o borderô.');
      return;
    }
    alert(`Borderô gerado com sucesso contendo ${selecionados.length} título(s)!`);
    setSelecionados([]);
    onClose();
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] border border-zinc-800/80 flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/50 flex-shrink-0">
          <h2 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-red-500" />
            Gerar Borderô de Cobrança
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none bg-zinc-800/50 hover:bg-zinc-700/50 p-1.5 rounded-md">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body - Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-950/30">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-[11px] uppercase bg-zinc-950 text-zinc-500 border-b border-zinc-800/80 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center w-12">
                    <input 
                      type="checkbox" 
                      checked={selecionados.length === mockTitulos.length && mockTitulos.length > 0} 
                      onChange={handleToggleAll} 
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-red-500 focus:ring-red-500/50 cursor-pointer" 
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Nº Título</th>
                  <th className="px-4 py-3 font-semibold text-center">Vencimento</th>
                  <th className="px-4 py-3 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {mockTitulos.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors cursor-pointer" onClick={() => handleToggle(t.id)}>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                       <input 
                          type="checkbox" 
                          checked={selecionados.includes(t.id)} 
                          onChange={() => handleToggle(t.id)} 
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-red-500 focus:ring-red-500/50 cursor-pointer" 
                        />
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-200">{t.cliente}</td>
                    <td className="px-4 py-3 font-mono text-zinc-500">{t.numero}</td>
                    <td className="px-4 py-3 font-mono text-center">{t.vencimento.split('-').reverse().join('/')}</td>
                    <td className="px-4 py-3 font-mono text-right text-zinc-300">{formatCurrency(t.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/80 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-shrink-0">
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-48">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Formato de Saída</label>
              <div className="relative">
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 cursor-pointer appearance-none">
                  <option>Vídeo (Tela)</option>
                  <option>Impressora</option>
                  <option>PDF (Arquivo)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Observações</label>
              <input 
                type="text" 
                placeholder="Instruções adicionais para o borderô..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 placeholder:text-zinc-600" 
              />
            </div>
          </div>
          <div className="flex items-end gap-3 h-full pb-0.5 mt-4 md:mt-0">
            <button 
              onClick={onClose} 
              className="px-5 py-2 text-sm font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 rounded-md transition-all focus:outline-none"
            >
              Cancelar
            </button>
            <button 
              onClick={handleGerar} 
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] focus:outline-none"
            >
              Gerar Borderô
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
