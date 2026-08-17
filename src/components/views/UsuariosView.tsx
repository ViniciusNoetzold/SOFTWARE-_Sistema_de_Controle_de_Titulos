import { useState, FormEvent } from 'react';
import { 
  Users, UserPlus, Shield, CheckCircle2, XCircle, Search, 
  Key, Mail, UserCheck, ShieldAlert, Edit2, Lock, Eye, EyeOff, KeyRound, Sparkles, Crown, Ban,
  Layers, ShieldCheck
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Usuario, PerfilUsuario } from '../../types';
import { formatDateBR } from '../../lib/utils';

const PRESET_AVATARS = [
  { name: 'Vinícius (Executivo)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Ana (Operadora)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'Carlos (Financeiro)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Juliana (Auditoria)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Lucas (Operações)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
];

// Componente Logo Estilizada Mezzold Studios (Letra M em gradiente neon)
function MezzoldMasterAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-12 h-12 text-base';
  
  return (
    <div className={`relative ${sizeClasses} rounded-xl bg-gradient-to-br from-red-600 via-rose-700 to-black border-2 border-red-500/80 flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] shrink-0 select-none`}>
      <span className="font-mono tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">M</span>
      <div className="absolute -bottom-1 -right-1 bg-black/90 border border-amber-500/60 text-amber-400 p-0.5 rounded-full shadow">
        <Crown size={size === 'sm' ? 8 : 10} strokeWidth={3} />
      </div>
    </div>
  );
}

export function UsuariosView() {
  const { usuarios, addUsuario, updateUsuario, toggleUsuarioAtivo, currentUser, showToast } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerfil, setFilterPerfil] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const isCurrentLoggedMaster = currentUser?.username === '000';

  // Form local
  const [formData, setFormData] = useState({
    nome: '',
    username: '',
    email: '',
    senha: '',
    perfil: 'OPERADOR' as PerfilUsuario,
    avatarUrl: '',
    ativo: true
  });

  const toggleCardPasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleOpenNewModal = () => {
    setEditingUserId(null);
    setShowModalPassword(false);
    setFormData({
      nome: '',
      username: '',
      email: '',
      senha: '',
      perfil: 'OPERADOR',
      avatarUrl: PRESET_AVATARS[0].url,
      ativo: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: Usuario) => {
    // PROTEÇÃO DE SENHA & DADOS: Se for o usuário Master 000 e quem estiver editando NÃO for o próprio 000, bloqueia
    if (user.username === '000' && !isCurrentLoggedMaster) {
      showToast('Acesso negado: Apenas o titular Mezzold Studios Master pode gerenciar esta credencial.');
      return;
    }

    setEditingUserId(user.id);
    setShowModalPassword(false);
    setFormData({
      nome: user.nome,
      username: user.username,
      email: user.email,
      senha: user.senhaHash,
      perfil: user.perfil,
      avatarUrl: user.avatarUrl || PRESET_AVATARS[0].url,
      ativo: user.ativo
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
      // Bloqueio especial: Usuário Mestre 000 nunca pode ser inativado nem modificado por terceiros
      const targetUser = usuarios.find(u => u.id === editingUserId);
      if (targetUser?.username === '000' && !isCurrentLoggedMaster) {
        showToast('Apenas o Mestre 000 pode alterar sua própria conta.');
        return;
      }

      const finalAtivo = targetUser?.username === '000' ? true : formData.ativo;

      updateUsuario(editingUserId, {
        nome: formData.nome,
        username: formData.username,
        email: formData.email,
        senhaHash: formData.senha,
        perfil: formData.perfil,
        avatarUrl: formData.avatarUrl,
        ativo: finalAtivo
      });
      setIsModalOpen(false);
    } else {
      const res = addUsuario({
        nome: formData.nome,
        username: formData.username,
        email: formData.email,
        senhaHash: formData.senha,
        perfil: formData.perfil,
        ativo: formData.ativo,
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
    const displayName = u.username === '000' && !isCurrentLoggedMaster ? 'Mezzold Studios Master' : u.nome;
    const matchSearch = 
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPerfil = filterPerfil === 'TODOS' || u.perfil === filterPerfil;
    const matchStatus = filterStatus === 'TODOS' || 
      (filterStatus === 'ATIVO' && u.ativo) || 
      (filterStatus === 'INATIVO' && !u.ativo);

    return matchSearch && matchPerfil && matchStatus;
  });

  // Se o usuário logado não for ADMIN
  const isAdmin = currentUser?.perfil === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#141722] rounded-3xl border border-[#2b3242]">
        <ShieldAlert size={56} className="text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wider">Acesso Restrito a Administradores</h2>
        <p className="text-xs text-slate-400 font-mono mt-2 max-w-md">
          Apenas usuários com perfil de Administrador possuem permissão para acessar o cadastro, controle de permissões e inativação de contas.
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
            <p className="text-[11px] text-slate-400 font-mono">Cadastre, edite credenciais e inative acessos com sigilo mestre protegido.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          
          {/* Busca */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou login..."
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

          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#11131a] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ATIVO">Apenas Ativos</option>
            <option value="INATIVO">Apenas Inativos</option>
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
        {filteredUsers.map(u => {
          const isPasswordShown = !!visiblePasswords[u.id];
          const isMaster = u.username === '000';
          
          // Quando um admin comum visualiza o master:
          const displayName = isMaster && !isCurrentLoggedMaster ? 'Mezzold Studios Master' : u.nome;
          const displayUsername = isMaster && !isCurrentLoggedMaster ? 'mezzold' : u.username;
          const displayEmail = isMaster && !isCurrentLoggedMaster ? 'master@mezzold.com' : u.email;

          return (
            <div 
              key={u.id}
              className={`border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all ${
                isMaster
                  ? 'bg-gradient-to-b from-[#191522] to-[#12141c] border-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.15)]'
                  : u.ativo 
                  ? 'bg-[#161922] border-[#2b3242] hover:border-[#3b4458]' 
                  : 'bg-[#12141c] border-red-900/40 opacity-75'
              }`}
            >
              <div>
                {/* Top Bar do Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {isMaster ? (
                      <MezzoldMasterAvatar size="md" />
                    ) : (
                      <img
                        src={u.avatarUrl || PRESET_AVATARS[0].url}
                        alt={u.nome}
                        className={`w-12 h-12 rounded-xl object-cover border shrink-0 shadow-md ${
                          u.ativo ? 'border-[#2b3242]' : 'border-red-800 grayscale'
                        }`}
                      />
                    )}

                    <div>
                      <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{displayName}</span>
                        {currentUser?.id === u.id && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">Você</span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <span>@{displayUsername}</span>
                        {isMaster && <span className="text-[9px] text-amber-400 font-bold bg-amber-950/60 px-1 rounded border border-amber-500/30">MESTRE</span>}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isMaster
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : u.perfil === 'ADMIN' 
                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                        : u.perfil === 'FINANCEIRO'
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {isMaster ? 'SUPER ADMIN' : u.perfil}
                    </span>

                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      u.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/30 text-red-300 border border-red-500/50'
                    }`}>
                      {u.ativo ? '● ATIVO' : '✕ INATIVO'}
                    </span>
                  </div>
                </div>

                {/* Informações detalhadas */}
                <div className="space-y-2 font-mono text-xs text-slate-300 bg-[#11131a] p-3 rounded-xl border border-[#232938]">
                  <div className="flex items-center gap-2 text-slate-400 truncate">
                    <Mail size={14} className="text-slate-500 shrink-0" />
                    <span className="truncate">{displayEmail}</span>
                  </div>

                  {/* Exibição da Senha Cadastrada com Toggle e Proteção Mestre */}
                  <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-[#1e2433]">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <KeyRound size={13} className="text-amber-400" />
                      <span>Senha de Acesso:</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {isMaster && !isCurrentLoggedMaster ? (
                        // Bloqueio absoluto para admin comum visualizando a senha do master
                        <span className="text-slate-400 font-mono text-[10px] bg-[#1a1f2c] px-2 py-0.5 rounded border border-[#2c3548] flex items-center gap-1" title="Protegida por Criptografia Mestre">
                          <Lock size={11} className="text-red-400" />
                          <span>••••••••••••</span>
                        </span>
                      ) : (
                        <>
                          <span className="text-amber-300 font-mono font-bold text-xs bg-[#1a1f2c] px-2 py-0.5 rounded border border-[#2c3548]">
                            {isPasswordShown ? u.senhaHash : '••••••••'}
                          </span>
                          <button
                            onClick={() => toggleCardPasswordVisibility(u.id)}
                            className="text-slate-400 hover:text-slate-200 p-1"
                            title={isPasswordShown ? 'Ocultar senha' : 'Ver senha'}
                          >
                            {isPasswordShown ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1e2433]">
                    <span>Cadastrado em:</span>
                    <span className="text-slate-300 font-bold">{formatDateBR(u.criado_em.split('T')[0])}</span>
                  </div>
                </div>
              </div>

              {/* Ações de Gerenciamento */}
              <div className="mt-4 pt-3 border-t border-[#232938] flex items-center justify-between gap-2">
                
                {/* Botão Inativar / Reativar Acesso */}
                {isMaster ? (
                  <span className="text-[10px] font-mono text-amber-400/90 bg-amber-950/30 px-2.5 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck size={13} className="text-amber-400" />
                    <span>Conta Master Protegida</span>
                  </span>
                ) : (
                  <button
                    onClick={() => toggleUsuarioAtivo(u.id)}
                    disabled={currentUser?.id === u.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      u.ativo 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                    }`}
                    title={
                      currentUser?.id === u.id 
                        ? 'Você não pode inativar a própria conta logada' 
                        : u.ativo ? 'Inativar acesso deste usuário' : 'Reativar acesso deste usuário'
                    }
                  >
                    {u.ativo ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                    <span>{u.ativo ? 'Inativar Usuário' : 'Reativar Usuário'}</span>
                  </button>
                )}

                {/* Botão Editar: Desabilitado/Oculto para Master se quem vê não for o próprio Master */}
                {isMaster && !isCurrentLoggedMaster ? (
                  <span className="text-[10px] text-slate-500 font-mono italic px-2 py-1">
                    Edição restrita
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenEditModal(u)}
                    className="bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm ml-auto"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação / Edição de Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-[#2b3242] rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-[#2b3242] pb-4 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <UserPlus size={18} className="text-red-500" />
                <span>{editingUserId ? 'Editar Dados do Usuário' : 'Novo Usuário do Sistema'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              
              {/* Seleção Rápida de Avatar Galeria */}
              {formData.username === '000' ? (
                <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-2xl flex items-center gap-3">
                  <MezzoldMasterAvatar size="md" />
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Avatar Oficial Mezzold Studios Master</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ícone estilizado permanente para a conta mestre</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Escolher Foto de Perfil (Avatar):</span>
                  </label>

                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {PRESET_AVATARS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: avatar.url })}
                        className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          formData.avatarUrl === avatar.url ? 'border-red-500 scale-105 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'border-[#2b3242] opacity-60 hover:opacity-100'
                        }`}
                        title={avatar.name}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Username / Login *</label>
                  <input
                    type="text"
                    disabled={formData.username === '000'}
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ex: carlos.eduardo"
                    className={`w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 ${
                      formData.username === '000' ? 'opacity-60 cursor-not-allowed font-bold text-amber-400' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Perfil de Acesso *</label>
                  <select
                    disabled={formData.username === '000'}
                    value={formData.perfil}
                    onChange={e => setFormData({ ...formData, perfil: e.target.value as PerfilUsuario })}
                    className={`w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 font-bold ${
                      formData.username === '000' ? 'opacity-60 cursor-not-allowed text-amber-400' : ''
                    }`}
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

              {/* Campo de Senha com Visualizador Toggle */}
              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                  Senha de Acesso do Usuário *
                </label>
                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={e => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl pl-3.5 pr-10 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 p-1"
                    title={showModalPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Status da Conta (Ativo / Inativo) */}
              <div className="pt-2">
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">
                  Situação de Acesso da Conta:
                </label>
                
                {formData.username === '000' ? (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[11px] text-amber-300 font-bold flex items-center gap-2">
                    <Shield size={14} />
                    <span>Conta Mestre Permanente (Sempre Ativa)</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ativo: true })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        formData.ativo 
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                          : 'bg-[#11131a] border-[#2b3242] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      <span>Ativo (Permite Login)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ativo: false })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        !formData.ativo 
                          ? 'bg-red-950/60 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                          : 'bg-[#11131a] border-[#2b3242] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Ban size={15} />
                      <span>Inativo (Bloqueado)</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#2b3242] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#1e2433] hover:bg-[#283146] text-slate-300 rounded-xl transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  {editingUserId ? 'Salvar Alterações do Usuário' : 'Cadastrar Usuário'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
