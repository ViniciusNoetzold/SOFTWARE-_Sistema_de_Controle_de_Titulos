import { useState, FormEvent } from 'react';
import { 
  Users, UserPlus, Shield, CheckCircle2, XCircle, Search, 
  Key, Mail, UserCheck, ShieldAlert, Edit2, Lock, UserX
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Usuario, PerfilUsuario } from '../../types';
import { formatDateBR } from '../../lib/utils';

export function UsuariosView() {
  const { usuarios, addUsuario, updateUsuario, toggleUsuarioAtivo, currentUser, showToast } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerfil, setFilterPerfil] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form local
  const [formData, setFormData] = useState({
    nome: '',
    username: '',
    email: '',
    senha: '',
    perfil: 'OPERADOR' as PerfilUsuario,
    avatarUrl: ''
  });

  const handleOpenNewModal = () => {
    setEditingUserId(null);
    setFormData({
      nome: '',
      username: '',
      email: '',
      senha: '',
      perfil: 'OPERADOR',
      avatarUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: Usuario) => {
    setEditingUserId(user.id);
    setFormData({
      nome: user.nome,
      username: user.username,
      email: user.email,
      senha: user.senhaHash,
      perfil: user.perfil,
      avatarUrl: user.avatarUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.username.trim() || !formData.email.trim() || !formData.senha) {
      showToast('Preencha todos os campos obrigatórios.');
      return;
    }

    if (editingUserId) {
      // Edição
      updateUsuario(editingUserId, {
        nome: formData.nome,
        username: formData.username,
        email: formData.email,
        senhaHash: formData.senha,
        perfil: formData.perfil,
        avatarUrl: formData.avatarUrl
      });
      setIsModalOpen(false);
    } else {
      // Criação
      const res = addUsuario({
        nome: formData.nome,
        username: formData.username,
        email: formData.email,
        senhaHash: formData.senha,
        perfil: formData.perfil,
        ativo: true,
        avatarUrl: formData.avatarUrl
      });

      if (res.success) {
        setIsModalOpen(false);
      } else {
        showToast(res.message);
      }
    }
  };

  // Filtros
  const filteredUsers = usuarios.filter(u => {
    const matchSearch = 
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPerfil = filterPerfil === 'TODOS' || u.perfil === filterPerfil;

    return matchSearch && matchPerfil;
  });

  // Se o usuário logado não for ADMIN
  const isAdmin = currentUser?.perfil === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#141722] rounded-3xl border border-[#2b3242]">
        <ShieldAlert size={56} className="text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wider">Acesso Restrito a Administradores</h2>
        <p className="text-xs text-slate-400 font-mono mt-2 max-w-md">
          Apenas usuários com perfil de Administrador possuem permissão para acessar o cadastro e controle de permissões de usuários.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-in fade-in duration-300 select-none text-slate-200 overflow-hidden">
      
      {/* Cabeçalho de Ações e Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-[#161922] border border-[#2b3242] p-4 rounded-2xl shrink-0">
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 bg-red-600/15 border border-red-500/30 rounded-xl text-red-500">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Gestão de Usuários & Permissões</h2>
            <p className="text-[11px] text-slate-400 font-mono">Controle de acessos, perfis e autenticação segura do sistema.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          
          {/* Busca */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Filtro Perfil */}
          <select
            value={filterPerfil}
            onChange={e => setFilterPerfil(e.target.value)}
            className="bg-[#11131a] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="TODOS">Todos os Perfis</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OPERADOR">OPERADOR</option>
            <option value="FINANCEIRO">FINANCEIRO</option>
          </select>

          {/* Botão Novo Usuário */}
          <button
            onClick={handleOpenNewModal}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center gap-2 shrink-0"
          >
            <UserPlus size={16} />
            <span>Novo Usuário</span>
          </button>
        </div>

      </div>

      {/* Grid de Cards de Usuários */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
        {filteredUsers.map(u => (
          <div 
            key={u.id}
            className={`bg-[#161922] border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all ${
              u.ativo ? 'border-[#2b3242] hover:border-[#3b4458]' : 'border-red-950/60 bg-[#12141c] opacity-75'
            }`}
          >
            <div>
              {/* Top Bar do Card */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={u.nome}
                    className="w-12 h-12 rounded-xl object-cover border border-[#2b3242] shrink-0"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{u.nome}</span>
                      {currentUser?.id === u.id && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">Você</span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                  </div>
                </div>

                {/* Badge Perfil */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  u.perfil === 'ADMIN' 
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : u.perfil === 'FINANCEIRO'
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {u.perfil}
                </span>
              </div>

              {/* Informações detalhadas */}
              <div className="space-y-2 font-mono text-xs text-slate-300 bg-[#11131a] p-3 rounded-xl border border-[#232938]">
                <div className="flex items-center gap-2 text-slate-400 truncate">
                  <Mail size={14} className="text-slate-500 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1e2433]">
                  <span>Cadastrado em:</span>
                  <span className="text-slate-300 font-bold">{formatDateBR(u.criado_em.split('T')[0])}</span>
                </div>
              </div>
            </div>

            {/* Ações de Gerenciamento */}
            <div className="mt-4 pt-3 border-t border-[#232938] flex items-center justify-between">
              
              {/* Botão de Status Ativo / Inativo */}
              <button
                onClick={() => toggleUsuarioAtivo(u.id)}
                disabled={currentUser?.id === u.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  u.ativo 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                }`}
              >
                {u.ativo ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                <span>{u.ativo ? 'Conta Ativa' : 'Conta Inativa'}</span>
              </button>

              {/* Botão Editar */}
              <button
                onClick={() => handleOpenEditModal(u)}
                className="bg-[#1e2433] hover:bg-[#283146] border border-[#2b3346] text-slate-200 text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Edit2 size={13} />
                <span>Editar</span>
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação / Edição de Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-[#2b3242] rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100">
            
            <div className="flex justify-between items-center border-b border-[#2b3242] pb-4 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <UserPlus size={18} className="text-red-500" />
                <span>{editingUserId ? 'Editar Usuário' : 'Novo Usuário do Sistema'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              
              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Username / Login *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ex: carlos.eduardo"
                    className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Perfil de Acesso *</label>
                  <select
                    value={formData.perfil}
                    onChange={e => setFormData({ ...formData, perfil: e.target.value as PerfilUsuario })}
                    className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="FINANCEIRO">FINANCEIRO</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="carlos@mezzold.com"
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Senha de Acesso *</label>
                <input
                  type="text"
                  value={formData.senha}
                  onChange={e => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">URL da Foto de Perfil (Opcional)</label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-[#2b3242] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#1e2433] hover:bg-[#283146] text-slate-300 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  {editingUserId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
