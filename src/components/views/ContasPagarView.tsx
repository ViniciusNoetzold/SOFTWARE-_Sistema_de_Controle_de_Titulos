import { useState } from 'react';
import { CreditCard, Plus, CheckCircle } from 'lucide-react';
import { mockTitulos, mockEntidades } from '../../lib/mockData';
import { formatCurrency, formatDateBR, calcularSaldoDevedor } from '../../lib/utils';
import { Titulo } from '../../types';

export function ContasPagarView() {
  const [titulos, setTitulos] = useState<Titulo[]>(
    mockTitulos.filter(t => t.tipo_titulo === 'PAGAR')
  );

  const handleBaixa = (id: string) => {
    setTitulos(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'PAGO', valor_pago: t.valor_original, saldo_devedor: 0 };
      }
      return t;
    }));
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <CreditCard size={24} className="text-rose-500" />
            Contas a Pagar
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Gestão de obrigações, pagamentos e fornecedores.</p>
        </div>
      </div>

      {/* Formulário de Cadastro Simulado */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Novo Título a Pagar</h3>
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-3">
            <label className="block text-xs text-zinc-500 mb-1">Fornecedor</label>
            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer">
              {mockEntidades.filter(e => e.tipo_entidade === 'FORNECEDOR').map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-zinc-500 mb-1">Centro de Custo</label>
            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer">
              <option>TI e Infraestrutura</option>
              <option>Administrativo</option>
              <option>Operacional</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-zinc-500 mb-1">Nº Documento</label>
            <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 transition-all font-mono" placeholder="FAT-000" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-zinc-500 mb-1">Valor (R$)</label>
            <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 transition-all font-mono text-right" placeholder="0,00" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-zinc-500 mb-1">Vencimento</label>
            <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 transition-all" />
          </div>
          <div className="col-span-1">
            <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-2 py-2 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] h-[38px]" title="Gravar">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-[11px] uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800/80 sticky top-0">
              <tr>
                <th className="px-5 py-3 font-semibold tracking-wider">Doc</th>
                <th className="px-5 py-3 font-semibold tracking-wider">Fornecedor</th>
                <th className="px-5 py-3 font-semibold tracking-wider">Centro Custo</th>
                <th className="px-5 py-3 font-semibold tracking-wider">Vencimento</th>
                <th className="px-5 py-3 font-semibold tracking-wider text-right">Valor</th>
                <th className="px-5 py-3 font-semibold tracking-wider text-center">Status</th>
                <th className="px-5 py-3 font-semibold tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {titulos.map((t) => {
                const fornecedor = mockEntidades.find(e => e.id === t.id_entidade);
                return (
                  <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-5 py-3 font-mono text-zinc-300">{t.numero_documento}</td>
                    <td className="px-5 py-3 font-medium text-zinc-200">{fornecedor?.nome}</td>
                    <td className="px-5 py-3 text-zinc-400">{t.centro_custo}</td>
                    <td className="px-5 py-3 font-mono">{formatDateBR(t.data_vencimento)}</td>
                    <td className="px-5 py-3 font-mono text-right text-zinc-200">{formatCurrency(calcularSaldoDevedor(t))}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${t.status === 'EM_ABERTO' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : t.status === 'PAGO' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {t.status !== 'PAGO' && (
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleBaixa(t.id)} className="px-3 py-1 bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500 hover:text-white rounded transition-colors text-[11px] font-semibold tracking-wide uppercase" title="Liquidar Título">
                            Liquidar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
