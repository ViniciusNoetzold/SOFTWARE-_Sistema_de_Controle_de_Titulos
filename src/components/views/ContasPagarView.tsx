import { useState, FormEvent } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDateBR, calcularSaldoDevedor } from '../../lib/utils';

export function ContasPagarView() {
  const { titulos, entidades, addTitulo, liquidarTitulo } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Form local
  const [idEntidade, setIdEntidade] = useState('');
  const [centroCusto, setCentroCusto] = useState('TI e Infraestrutura');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');

  const contasPagar = titulos.filter(t => t.tipo_titulo === 'PAGAR');

  const filtered = contasPagar.filter(t => {
    const ent = entidades.find(e => e.id === t.id_entidade);
    return (
      t.numero_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ent && ent.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!idEntidade || !numeroDocumento || !valor || !vencimento) {
      alert('Preencha os campos do formulário para gravar.');
      return;
    }
    const valNum = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valNum) || valNum <= 0) return;

    addTitulo({
      id_entidade: idEntidade,
      tipo_titulo: 'PAGAR',
      numero_documento: numeroDocumento,
      valor_original: valNum,
      data_vencimento: vencimento,
      centro_custo: centroCusto,
    });

    setNumeroDocumento('');
    setValor('');
    setVencimento('');
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Top Search Bar */}
      <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 shadow-md">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Novo Lançamento Rápido</h3>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar doc ou fornecedor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Formulário de Cadastro Rápido */}
      <form onSubmit={handleCreate} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 shadow-xl">
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-3">
            <label className="block text-[11px] text-zinc-500 mb-1 font-medium">Fornecedor *</label>
            <select 
              value={idEntidade}
              onChange={e => setIdEntidade(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
              required
            >
              <option value="">Selecione o fornecedor...</option>
              {entidades.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] text-zinc-500 mb-1 font-medium">Centro de Custo</label>
            <select 
              value={centroCusto}
              onChange={e => setCentroCusto(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
            >
              <option value="TI e Infraestrutura">TI e Infraestrutura</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Operacional">Operacional</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] text-zinc-500 mb-1 font-medium">Nº Documento *</label>
            <input 
              type="text" 
              value={numeroDocumento}
              onChange={e => setNumeroDocumento(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500/50 transition-all font-mono" 
              placeholder="FAT-000" 
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] text-zinc-500 mb-1 font-medium">Valor (R$) *</label>
            <input 
              type="text" 
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500/50 transition-all font-mono text-right" 
              placeholder="0,00" 
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] text-zinc-500 mb-1 font-medium">Vencimento *</label>
            <input 
              type="date" 
              value={vencimento}
              onChange={e => setVencimento(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-400 focus:outline-none focus:border-red-500/50 transition-all" 
              required
            />
          </div>
          <div className="col-span-1">
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-2 py-1.5 rounded-md text-xs font-medium transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] h-[34px]" 
              title="Gravar Título"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      </form>

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
              {filtered.map((t) => {
                const fornecedor = entidades.find(e => e.id === t.id_entidade);
                return (
                  <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-5 py-3 font-mono text-zinc-300">{t.numero_documento}</td>
                    <td className="px-5 py-3 font-medium text-zinc-200">{fornecedor?.nome || 'Fornecedor Padrão'}</td>
                    <td className="px-5 py-3 text-zinc-400">{t.centro_custo || 'Geral'}</td>
                    <td className="px-5 py-3 font-mono">{formatDateBR(t.data_vencimento)}</td>
                    <td className="px-5 py-3 font-mono text-right text-zinc-200">{formatCurrency(calcularSaldoDevedor(t))}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        t.status === 'PAGO' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' : 
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {t.status !== 'PAGO' && (
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => liquidarTitulo(t.id, 'TOTAL')} 
                            className="px-3 py-1 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors text-[11px] font-semibold tracking-wide uppercase" 
                            title="Liquidar Título"
                          >
                            Liquidar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">Nenhum título a pagar encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
