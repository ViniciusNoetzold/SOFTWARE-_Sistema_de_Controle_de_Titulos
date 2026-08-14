import { useState } from 'react';
import { Users, Building2, Plus, X } from 'lucide-react';

type TipoEntidade = 'CLIENTE' | 'FORNECEDOR' | 'AMBOS';

interface Entidade {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  tipo: TipoEntidade;
}

const mockDataInicial: Entidade[] = [
  { id: 'C001', nome: 'TechCorp Solutions', documento: '12.345.678/0001-90', telefone: '(11) 9999-0001', email: 'fin@techcorp.com', tipo: 'CLIENTE' },
  { id: 'C002', nome: 'Global Imports Ltda', documento: '98.765.432/0001-10', telefone: '(21) 8888-0002', email: 'contas@global.com', tipo: 'CLIENTE' },
  { id: 'F001', nome: 'AWS Cloud Services', documento: '00.111.222/0001-33', telefone: '0800-123-456', email: 'billing@aws.com', tipo: 'FORNECEDOR' },
  { id: 'F002', nome: 'Limpeza e CIA', documento: '33.444.555/0001-44', telefone: '(11) 3333-4444', email: 'contato@limpezacia.com', tipo: 'FORNECEDOR' }
];

export function CadastrosView() {
  const [activeTab, setActiveTab] = useState<'CLIENTE' | 'FORNECEDOR'>('CLIENTE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entidades, setEntidades] = useState<Entidade[]>(mockDataInicial);

  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    telefone: '',
    email: '',
    tipo: 'CLIENTE' as TipoEntidade
  });

  const filteredEntidades = entidades.filter(e => e.tipo === activeTab || e.tipo === 'AMBOS');

  const handleSave = () => {
    if (!formData.nome || !formData.documento) return;
    
    const novaEntidade: Entidade = {
      id: `${formData.tipo.charAt(0)}${String(entidades.length + 1).padStart(3, '0')}`,
      ...formData
    };
    
    setEntidades([...entidades, novaEntidade]);
    setIsModalOpen(false);
    setFormData({ nome: '', documento: '', telefone: '', email: '', tipo: 'CLIENTE' });
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <Users size={24} className="text-red-500" />
            Central de Cadastros
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Gerencie clientes e fornecedores do sistema.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
        >
          <Plus size={16} />
          Novo Cadastro
        </button>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        {/* Tabs */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-950">
          <button 
            onClick={() => setActiveTab('CLIENTE')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2 ${activeTab === 'CLIENTE' ? 'border-red-500 text-red-400 bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'}`}
          >
            <Users size={16} /> Clientes
          </button>
          <button 
            onClick={() => setActiveTab('FORNECEDOR')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2 ${activeTab === 'FORNECEDOR' ? 'border-red-500 text-red-400 bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'}`}
          >
            <Building2 size={16} /> Fornecedores
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-[11px] uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800/80 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Nome</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Documento</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Telefone</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredEntidades.map((entidade) => (
                <tr key={entidade.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-zinc-500">{entidade.id}</td>
                  <td className="px-6 py-4 font-medium text-zinc-200">{entidade.nome}</td>
                  <td className="px-6 py-4 font-mono">{entidade.documento}</td>
                  <td className="px-6 py-4">{entidade.telefone}</td>
                  <td className="px-6 py-4">{entidade.email}</td>
                </tr>
              ))}
              {filteredEntidades.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Cadastro */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-100">Novo Cadastro</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Nome</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Documento</label>
                <input 
                  type="text" 
                  value={formData.documento}
                  onChange={e => setFormData({...formData, documento: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Telefone</label>
                  <input 
                    type="text" 
                    value={formData.telefone}
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-2">Tipo</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tipo" 
                      checked={formData.tipo === 'CLIENTE'}
                      onChange={() => setFormData({...formData, tipo: 'CLIENTE'})}
                      className="text-red-500 bg-zinc-950 border-zinc-800 focus:ring-red-500/50" 
                    /> Cliente
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tipo" 
                      checked={formData.tipo === 'FORNECEDOR'}
                      onChange={() => setFormData({...formData, tipo: 'FORNECEDOR'})}
                      className="text-red-500 bg-zinc-950 border-zinc-800 focus:ring-red-500/50" 
                    /> Fornecedor
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tipo" 
                      checked={formData.tipo === 'AMBOS'}
                      onChange={() => setFormData({...formData, tipo: 'AMBOS'})}
                      className="text-red-500 bg-zinc-950 border-zinc-800 focus:ring-red-500/50" 
                    /> Ambos
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50 rounded-md transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]">Salvar Cadastro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
