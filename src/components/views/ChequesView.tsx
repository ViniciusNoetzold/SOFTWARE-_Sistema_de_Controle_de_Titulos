import { useState } from 'react';
import { WalletCards, Plus } from 'lucide-react';

interface Cheque {
  id: string;
  titular: string;
  banco: string;
  agencia: string;
  conta: string;
  numeroCheque: string;
  valor: number;
  vencimento: string;
  tipo: 'EMITIDO' | 'RECEBIDO';
  status: 'EM ABERTO' | 'COMPENSADO' | 'DEVOLVIDO';
}

const mockChequesIniciais: Cheque[] = [
  { id: '1', titular: 'TechCorp Solutions', banco: 'Itaú (341)', agencia: '0001', conta: '12345-6', numeroCheque: '000123', valor: 5500.00, vencimento: '2026-09-10', tipo: 'RECEBIDO', status: 'EM ABERTO' },
  { id: '2', titular: 'Global Imports', banco: 'Bradesco (237)', agencia: '0987', conta: '98765-4', numeroCheque: '000987', valor: 12000.00, vencimento: '2026-08-12', tipo: 'RECEBIDO', status: 'COMPENSADO' },
  { id: '3', titular: 'Mezzold Studios', banco: 'Banco do Brasil (001)', agencia: '1111', conta: '22222-2', numeroCheque: '000001', valor: 3200.00, vencimento: '2026-08-25', tipo: 'EMITIDO', status: 'EM ABERTO' },
];

export function ChequesView() {
  const [cheques, setCheques] = useState<Cheque[]>(mockChequesIniciais);
  const [formData, setFormData] = useState({
    titular: '',
    banco: '',
    agencia: '',
    conta: '',
    numeroCheque: '',
    valor: '',
    vencimento: '',
    tipo: 'RECEBIDO' as 'EMITIDO' | 'RECEBIDO'
  });

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatDateBR = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    if (!day) return dateString;
    return `${day}/${month}/${year}`;
  };

  const handleSave = () => {
    if (!formData.titular || !formData.valor || !formData.vencimento) return;
    
    const novoCheque: Cheque = {
      id: Math.random().toString(36).substring(2, 9),
      titular: formData.titular,
      banco: formData.banco,
      agencia: formData.agencia,
      conta: formData.conta,
      numeroCheque: formData.numeroCheque,
      valor: parseFloat(formData.valor.replace(',', '.')),
      vencimento: formData.vencimento,
      tipo: formData.tipo,
      status: 'EM ABERTO'
    };

    setCheques([novoCheque, ...cheques]);
    
    // Reset form
    setFormData({
      titular: '', banco: '', agencia: '', conta: '', numeroCheque: '', valor: '', vencimento: '', tipo: 'RECEBIDO'
    });
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300 max-w-7xl mx-auto overflow-y-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <WalletCards size={24} className="text-red-500" />
            Gestão de Cheques
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Controle de cheques emitidos e recebidos, custódia e devoluções.</p>
        </div>
      </div>

      {/* Formulário Superior */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 shadow-xl shrink-0">
        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">
          // Cadastro de Cheque
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Row 1/2 */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Titular</label>
            <input 
              type="text" 
              value={formData.titular}
              onChange={e => setFormData({...formData, titular: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50" 
              placeholder="Nome impresso no cheque" 
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Banco</label>
            <input 
              type="text" 
              value={formData.banco}
              onChange={e => setFormData({...formData, banco: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
              placeholder="Ex: 341" 
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Agência</label>
            <input 
              type="text" 
              value={formData.agencia}
              onChange={e => setFormData({...formData, agencia: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
              placeholder="0000" 
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Conta</label>
            <input 
              type="text" 
              value={formData.conta}
              onChange={e => setFormData({...formData, conta: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
              placeholder="00000-0" 
            />
          </div>

          {/* Row 2/2 */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Nº do Cheque</label>
            <input 
              type="text" 
              value={formData.numeroCheque}
              onChange={e => setFormData({...formData, numeroCheque: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
              placeholder="000000" 
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Valor (R$)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.valor}
              onChange={e => setFormData({...formData, valor: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
              placeholder="0.00" 
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Data de Vencimento</label>
            <input 
              type="date" 
              value={formData.vencimento}
              onChange={e => setFormData({...formData, vencimento: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-red-500/50" 
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Tipo</label>
            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="tipo_cheque" 
                  checked={formData.tipo === 'RECEBIDO'}
                  onChange={() => setFormData({...formData, tipo: 'RECEBIDO'})}
                  className="text-red-500 bg-zinc-950 border-zinc-800 focus:ring-red-500/50" 
                /> Recebido
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="tipo_cheque" 
                  checked={formData.tipo === 'EMITIDO'}
                  onChange={() => setFormData({...formData, tipo: 'EMITIDO'})}
                  className="text-red-500 bg-zinc-950 border-zinc-800 focus:ring-red-500/50" 
                /> Emitido
              </label>
            </div>
          </div>
        </div>
        
        {/* Action Button Row */}
        <div className="flex justify-end mt-4 pt-4 border-t border-zinc-800/50">
          <button 
            onClick={handleSave}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
          >
            <Plus size={16} /> Cadastrar Cheque
          </button>
        </div>
      </div>

      {/* Tabela de Cheques */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl min-h-[300px]">
        <div className="w-full overflow-x-auto flex-1 overflow-y-auto">
          <table className="w-full table-auto text-left text-sm text-zinc-400">
            <thead className="text-[11px] uppercase bg-zinc-950/80 text-zinc-500 border-b border-zinc-800/80 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider min-w-[100px]">Tipo</th>
                <th className="px-6 py-4 font-semibold tracking-wider min-w-[200px]">Titular</th>
                <th className="px-6 py-4 font-semibold tracking-wider min-w-[180px]">Banco</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right min-w-[120px]">Valor</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center min-w-[120px]">Vencimento</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center min-w-[120px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {cheques.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-wider text-white ${c.tipo === 'RECEBIDO' ? 'bg-zinc-800 border-zinc-700' : 'bg-red-600'}`}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-zinc-200">{c.titular}</div>
                    <div className="text-xs font-mono text-zinc-500 mt-0.5">CH: {c.numeroCheque}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-zinc-300">{c.banco}</div>
                    <div className="text-xs font-mono text-zinc-500 mt-0.5">Ag: {c.agencia} | CC: {c.conta}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-right text-zinc-200 whitespace-nowrap">{formatCurrency(c.valor)}</td>
                  <td className="px-6 py-4 font-mono text-center whitespace-nowrap">{formatDateBR(c.vencimento)}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-wider text-white ${
                      c.status === 'EM ABERTO' ? 'bg-red-600' : 
                      c.status === 'COMPENSADO' ? 'bg-zinc-600' : 
                      'bg-red-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {cheques.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">Nenhum cheque cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
