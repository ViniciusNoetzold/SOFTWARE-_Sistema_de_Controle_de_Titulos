import { useState, FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TipoTitulo } from '../../types';

export function LancamentoTitulosView() {
  const { entidades, addTitulo } = useAppContext();

  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [valorOriginal, setValorOriginal] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [idEntidade, setIdEntidade] = useState('');
  const [tipoTitulo, setTipoTitulo] = useState<TipoTitulo>('RECEBER');
  const [centroCusto, setCentroCusto] = useState('Geral');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!numeroDocumento || !valorOriginal || !dataVencimento || !idEntidade) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const val = parseFloat(valorOriginal.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Por favor, informe um valor válido.');
      return;
    }

    addTitulo({
      id_entidade: idEntidade,
      tipo_titulo: tipoTitulo,
      numero_documento: numeroDocumento,
      valor_original: val,
      data_vencimento: dataVencimento,
      centro_custo: centroCusto,
    });

    // Reset Form
    setNumeroDocumento('');
    setValorOriginal('');
    setDataVencimento('');
    setIdEntidade('');
  };

  const handleClear = () => {
    setNumeroDocumento('');
    setValorOriginal('');
    setDataVencimento('');
    setIdEntidade('');
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Tipo de Título */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Tipo do Título</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-200 cursor-pointer bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700">
                <input 
                  type="radio" 
                  name="tipo_titulo" 
                  checked={tipoTitulo === 'RECEBER'} 
                  onChange={() => setTipoTitulo('RECEBER')}
                  className="text-red-600 bg-zinc-900 border-zinc-700 focus:ring-red-500/50"
                /> 
                <span className="font-medium text-red-400">Contas a Receber (Cliente)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-200 cursor-pointer bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700">
                <input 
                  type="radio" 
                  name="tipo_titulo" 
                  checked={tipoTitulo === 'PAGAR'} 
                  onChange={() => setTipoTitulo('PAGAR')}
                  className="text-red-600 bg-zinc-900 border-zinc-700 focus:ring-red-500/50"
                /> 
                <span className="font-medium text-rose-400">Contas a Pagar (Fornecedor)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nº Documento *</label>
              <input 
                type="text" 
                value={numeroDocumento}
                onChange={e => setNumeroDocumento(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
                placeholder="Ex: NF-2048" 
                required
              />
            </div>
            <div className="col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Valor Nominal (R$) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                <input 
                  type="text" 
                  value={valorOriginal}
                  onChange={e => setValorOriginal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono text-right" 
                  placeholder="0,00" 
                  required
                />
              </div>
            </div>
            <div className="col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Vencimento *</label>
              <input 
                type="date" 
                value={dataVencimento}
                onChange={e => setDataVencimento(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                {tipoTitulo === 'RECEBER' ? 'Cliente / Cedente *' : 'Fornecedor *'}
              </label>
              <select 
                value={idEntidade}
                onChange={e => setIdEntidade(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 cursor-pointer"
                required
              >
                <option value="">Selecione...</option>
                {entidades.map(ent => (
                  <option key={ent.id} value={ent.id}>
                    {ent.nome} ({ent.documento})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Centro de Custo</label>
              <select 
                value={centroCusto}
                onChange={e => setCentroCusto(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 cursor-pointer"
              >
                <option value="Geral">Geral</option>
                <option value="TI e Infraestrutura">TI e Infraestrutura</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClear}
              className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Limpar
            </button>
            <button 
              type="submit" 
              className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
            >
              Gravar Título
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
