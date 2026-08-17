import { useState, FormEvent } from 'react';
import { 
  Lock, User, LogIn, ArrowRight, AlertCircle, ShieldCheck, 
  UserCheck, UserPlus, Sparkles, Building2, Eye, EyeOff, KeyRound
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function LoginView() {
  const { login, lastLoggedUser, switchUser, empresaConfig, usuarios } = useAppContext();

  // Estados de entrada
  const [usernameInput, setUsernameInput] = useState(lastLoggedUser ? lastLoggedUser.username : '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Se existe último usuário lembrado no dispositivo
  const isRememberedMode = !!lastLoggedUser;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const targetUser = isRememberedMode ? lastLoggedUser.username : usernameInput;

    if (!targetUser.trim()) {
      setErrorMessage('Informe o nome de usuário ou e-mail.');
      return;
    }

    if (!passwordInput) {
      setErrorMessage('Digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(targetUser, passwordInput);
      setIsLoading(false);

      if (!res.success) {
        setErrorMessage(res.message);
      }
    }, 300);
  };

  // Preenche usuário e senha no formulário sem logar direto automaticamente
  const handleQuickSelectUser = (username: string, pass: string, nome: string) => {
    // Se estava no modo usuário lembrado, limpa a memória para permitir visualizar os campos
    if (isRememberedMode) {
      switchUser();
    }
    setUsernameInput(username);
    setPasswordInput(pass);
    setErrorMessage(null);
    setInfoMessage(`Credenciais de ${nome} preenchidas no formulário. Clique em "Acessar o Sistema".`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0e14] flex items-center justify-center p-4 select-none overflow-hidden font-sans">
      
      {/* Luzes de Fundo Estilizadas em Neon Red/Slate */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#141722]/95 border border-[#2b3242] rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative z-10 animate-in zoom-in-95 duration-300">
        
        {/* Cabeçalho da Empresa / Sistema */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600/15 border border-red-500/30 rounded-2xl mb-3 shadow-[0_0_20px_rgba(220,38,38,0.25)]">
            <Building2 className="text-red-500" size={28} />
          </div>
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-wide">
            {empresaConfig.nomeFantasia || 'Mezzold Financial'}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sistema Integrado de Gestão Financeira & Cheques
          </p>
        </div>

        {/* Alerta de Erro Visual */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-950/50 border border-red-500/40 rounded-2xl flex items-center gap-3 text-red-300 text-xs font-mono animate-in fade-in duration-200">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mensagem Informativa do Acesso Rápido */}
        {infoMessage && (
          <div className="mb-5 p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs font-mono animate-in fade-in duration-200">
            <KeyRound size={16} className="text-emerald-400 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* MODO 1: Cartão do Último Usuário Lembrado */}
          {isRememberedMode ? (
            <div className="bg-[#1a1e2c] border border-[#2d364a] rounded-2xl p-4 flex items-center gap-4 relative group">
              <img
                src={lastLoggedUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={lastLoggedUser.nome}
                className="w-14 h-14 rounded-xl object-cover border-2 border-red-500/50 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100 truncate">{lastLoggedUser.nome}</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 text-[9px] font-mono font-bold uppercase">
                    {lastLoggedUser.perfil}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate font-mono">{lastLoggedUser.email}</p>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5 font-semibold">
                  <UserCheck size={12} /> Último usuário cadastrado neste dispositivo
                </span>
              </div>
            </div>
          ) : (
            /* MODO 2: Campo Aberto de Usuário / E-mail */
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5 font-bold">
                Usuário ou E-mail
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="Ex: admin@mezzold.com ou admin"
                  autoFocus={!isRememberedMode}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Campo de Senha */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-mono text-slate-400 uppercase font-bold">
                Senha de Acesso
              </label>
              {isRememberedMode && (
                <button
                  type="button"
                  onClick={switchUser}
                  className="text-[11px] text-red-400 hover:text-red-300 font-mono font-bold hover:underline"
                >
                  Entrar com outro usuário
                </button>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                autoFocus={isRememberedMode}
                className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl pl-10 pr-10 py-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors p-1"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.35)] flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Acessar o Sistema</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Atalhos Rápidos Dinâmicos com Preenchimento de Senha */}
        <div className="mt-8 pt-6 border-t border-[#23293a]">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold mb-3">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              <span>Acesso Rápido a Usuários Cadastrados:</span>
            </span>
            <span className="text-[9px] text-slate-500">Clique para preencher</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {usuarios.filter(u => u.ativo).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickSelectUser(u.username, u.senhaHash, u.nome)}
                className="bg-[#1a1e2c] hover:bg-[#252c40] border border-[#2e374d] hover:border-red-500/50 text-slate-200 p-2 rounded-xl text-[10px] font-mono text-center transition-all flex flex-col items-center gap-1 group"
                title={`Preencher credenciais de ${u.nome}`}
              >
                <span className={`font-bold uppercase tracking-wider ${
                  u.perfil === 'ADMIN' ? 'text-red-400' : u.perfil === 'FINANCEIRO' ? 'text-emerald-400' : 'text-blue-400'
                }`}>
                  {u.username}
                </span>
                <span className="text-slate-400 text-[9px] truncate max-w-full font-sans font-semibold">
                  {u.nome.split(' ')[0]}
                </span>
                <span className="text-slate-500 text-[9px] font-mono bg-[#11131a] px-1.5 py-0.5 rounded border border-[#2b3242] group-hover:text-amber-300">
                  🔑 {u.senhaHash}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Rodapé de Segurança */}
        <div className="mt-6 text-center text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Sessão Protegida por Token JWT & Auditoria</span>
        </div>

      </div>
    </div>
  );
}
