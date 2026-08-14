import { ArchiveRestore, RefreshCcw } from 'lucide-react';

interface TituloArquivado {
  id: string;
  entidade: string;
  documento: string;
  valorOriginal: number;
  dataLiquidacao: string;
  tipo: 'RECEBER' | 'PAGAR';
}

const mockTitulosEncerrados: TituloArquivado[] = [
  { id: 'TR-1026', entidade: 'TechCorp Solutions', documento: 'NF-1026', valorOriginal: 8500.00, dataLiquidacao: '01/08/2026', tipo: 'RECEBER' },
  { id: 'TP-0899', entidade: 'Limpeza e CIA', documento: 'NF-899', valorOriginal: 1500.00, dataLiquidacao: '05/08/2026', tipo: 'PAGAR' },
  { id: 'TR-0942', entidade: 'Global Imports Ltda', documento: 'FAT-942', valorOriginal: 12400.00, dataLiquidacao: '10/07/2026', tipo: 'RECEBER' },
  { id: 'TP-1102', entidade: 'AWS Cloud Services', documento: 'INV-3301', valorOriginal: 3200.50, dataLiquidacao: '15/07/2026', tipo: 'PAGAR' },
  { id: 'TR-0888', entidade: 'Construtora Nova', documento: 'NF-888', valorOriginal: 45000.00, dataLiquidacao: '20/06/2026', tipo: 'RECEBER' },
];

export function ArquivoMortoView() {
  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const handleRestaurar = (id: string) => {
    alert(`O título ${id} foi restaurado com sucesso! (Ação simulada)`);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <ArchiveRestore size={24} className="text-zinc-500" />
            Arquivo Morto
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Consulta de títulos liquidados e histórico inativo.</p>
        </div>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-[11px] uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800/80 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Cliente / Fornecedor</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Origem</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Valor Original</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Data Liquidação</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {mockTitulosEncerrados.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-zinc-500">{t.id}</td>
                  <td className="px-6 py-4 font-medium text-zinc-200">{t.entidade}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${t.tipo === 'RECEBER' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {t.tipo}
                      </span>
                      <span className="font-mono text-zinc-400 text-xs">{t.documento}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-right">{formatCurrency(t.valorOriginal)}</td>
                  <td className="px-6 py-4 font-mono text-center">{t.dataLiquidacao}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleRestaurar(t.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 text-zinc-300 rounded text-[10px] font-semibold tracking-wide uppercase transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <RefreshCcw size={12} />
                      Restaurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
