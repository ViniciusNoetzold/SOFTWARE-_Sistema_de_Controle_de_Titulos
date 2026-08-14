import { Trash2, AlertOctagon } from 'lucide-react';

export function LimpezaBaseView() {
  return (
    <div className="w-full h-full p-6 flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
      <div className="max-w-md w-full bg-zinc-900/90 border border-red-900/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.05)] text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertOctagon size={32} />
        </div>
        
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Limpeza de Base de Dados</h2>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          Esta rotina move todos os títulos liquidados há mais de 5 anos para o arquivo morto estrutural, liberando espaço e otimizando consultas. <strong className="text-zinc-200">Esta ação é irreversível e pode demorar alguns minutos.</strong>
        </p>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-4 mb-8 text-left">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-red-500 focus:ring-red-500/50 focus:ring-offset-zinc-950" />
            <span className="text-sm text-zinc-300">Estou ciente e fiz backup completo da base de dados antes de prosseguir.</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors">
            Cancelar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <Trash2 size={16} />
            Limpar Base
          </button>
        </div>
      </div>
    </div>
  );
}
