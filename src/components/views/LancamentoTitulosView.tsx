import { FilePlus } from 'lucide-react';

export function LancamentoTitulosView() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
          <FilePlus size={24} className="text-red-500" />
          Lançamento de Títulos
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Registre novos títulos de crédito, duplicatas e cheques no sistema.</p>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl">
        <form className="space-y-8">
          
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nº Documento</label>
              <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono" placeholder="000000" />
            </div>
            <div className="col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Valor Nominal</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-9 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-right" placeholder="0,00" />
              </div>
            </div>
            <div className="col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Vencimento</label>
              <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono" placeholder="DD/MM/AAAA" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-6">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Cedente (Cliente)</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all appearance-none cursor-pointer">
                <option value="">Selecione o cedente...</option>
                <option value="1">TechCorp Solutions</option>
                <option value="2">Global Imports Ltda</option>
              </select>
            </div>
            <div className="col-span-6">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Sacado (Devedor)</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all appearance-none cursor-pointer">
                <option value="">Selecione o sacado...</option>
                <option value="1">Lojas Varejo Sul</option>
                <option value="2">Distribuidora Central</option>
              </select>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-6 flex justify-end gap-4">
            <button type="button" className="px-6 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors">
              Limpar
            </button>
            <button type="button" className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              Gravar Título
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
