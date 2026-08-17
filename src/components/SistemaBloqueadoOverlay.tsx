import { useState, FormEvent } from 'react';
import { 
  Lock, MessageSquare, KeyRound, Building2, AlertTriangle, 
  RefreshCw, CheckCircle2, PhoneCall, Send, ShieldAlert
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';

export function SistemaBloqueadoOverlay() {
  const { 
    currentUser, 
    empresaConfig, 
    assinaturaLicenca, 
    licencaStatus, 
    renovarLicenca, 
    login,
    logout,
    showToast 
  } = useAppContext();

  const [masterPassword, setMasterPassword] = useState('');
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Se o usuário logado for o Mestre 000, NÃO bloqueia (ele tem acesso mestre para gerenciar)
  if (currentUser?.username === '000') {
    return null;
  }

  // Se o sistema NÃO estiver bloqueado nem expirado, não renderiza o overlay
  if (!licencaStatus.expirada) {
    return null;
  }

  // Ação de Enviar Comprovante por WhatsApp
  const handleEnviarWhatsapp = () => {
    const telefone = assinaturaLicenca.whatsappSuporte || '5511999999999';
    const nomeEmpresa = empresaConfig.nomeFantasia || empresaConfig.razaoSocial || 'Nossa Empresa';
    const cnpj = empresaConfig.cnpj || '';
    const valor = formatCurrency(assinaturaLicenca.valorMensalidade || 180);
    const dataVenc = licencaStatus.dataVencimentoFormatada;

    const texto = encodeURIComponent(
      `Olá, Suporte Técnico Mezzold!\n\n` +
      `Realizamos o pagamento da assinatura do *Sistema de Controle de Títulos*.\n\n` +
      `🏢 *Empresa:* ${nomeEmpresa}\n` +
      `📄 *CNPJ:* ${cnpj}\n` +
      `💰 *Valor da Mensalidade:* ${valor}\n` +
      `📅 *Vencimento:* ${dataVenc}\n\n` +
      `Segue em anexo o comprovante para a liberação do acesso.`
    );

    const url = `https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`;
    window.open(url, '_blank');
  };

  // Liberação Rápida de Emergência com Senha Mestre
  const handleDesbloqueioMestre = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (masterPassword === 'M3zz0ld') {
      renovarLicenca(30);
      showToast('Acesso desbloqueado com sucesso pelo Administrador Mestre!');
      setShowAdminUnlock(false);
      setMasterPassword('');
    } else {
      setErrorMessage('Senha mestre incorreta. Digite a senha administrativa.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#090b10]/98 backdrop-blur-xl flex items-center justify-center p-4 select-none font-sans text-slate-100">
      
      {/* Luzes de Fundo Alerta */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#141722] border border-red-500/50 rounded-3xl p-8 shadow-[0_0_80px_rgba(220,38,38,0.35)] relative z-10 text-center animate-in zoom-in-95 duration-300">
        
        {/* Ícone de Bloqueio com Pulso */}
        <div className="w-20 h-20 bg-red-600/20 border-2 border-red-500/50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-5 shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse">
          <Lock size={40} />
        </div>

        {/* Título & Motivo */}
        <h1 className="text-xl font-black uppercase tracking-wider text-slate-100 mb-2">
          Acesso ao Sistema Suspenso
        </h1>
        <p className="text-xs text-red-300/90 font-mono mb-6 leading-relaxed bg-red-950/40 p-3 rounded-2xl border border-red-500/30">
          {licencaStatus.mensagem}
        </p>

        {/* Dados da Empresa & Vencimento */}
        <div className="bg-[#10121a] border border-[#262c3d] p-4 rounded-2xl mb-6 text-left font-mono text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Licenciado para:</span>
            <span className="text-slate-100 font-bold">{empresaConfig.nomeFantasia || empresaConfig.razaoSocial}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Data de Vencimento:</span>
            <span className="text-red-400 font-bold">{licencaStatus.dataVencimentoFormatada} (23:59)</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Valor da Mensalidade:</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(assinaturaLicenca.valorMensalidade || 180)}</span>
          </div>
          
          {/* Chave PIX Oficial de Pagamento */}
          <div className="pt-2 border-t border-[#23293a] flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Chave PIX Oficial:</span>
              <span className="text-amber-400 font-mono font-bold">{assinaturaLicenca.chavePixLicenca || '5554997030349'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(assinaturaLicenca.chavePixLicenca || '5554997030349');
                showToast('Chave PIX copiada para a área de transferência!');
              }}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-mono text-right underline py-0.5"
            >
              📋 Copiar Chave PIX
            </button>
          </div>
        </div>

        {/* Botão de Notificação WhatsApp */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleEnviarWhatsapp}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 active:scale-[0.99]"
          >
            <Send size={18} />
            <span>Já paguei! Enviar Comprovante no WhatsApp (+55 54 9713-1399)</span>
          </button>

          <p className="text-[11px] text-slate-400 font-mono">
            Após o envio do comprovante, o suporte mestre ativará a licença imediatamente.
          </p>
        </div>

        {/* Seção de Desbloqueio Administrativo Mestre */}
        <div className="mt-6 pt-5 border-t border-[#23293a]">
          {!showAdminUnlock ? (
            <button
              type="button"
              onClick={() => setShowAdminUnlock(true)}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto"
            >
              <KeyRound size={13} className="text-amber-400" />
              <span>Desbloqueio com Senha de Administrador / Mestre</span>
            </button>
          ) : (
            <form onSubmit={handleDesbloqueioMestre} className="space-y-3 animate-in fade-in duration-200">
              <div className="text-[11px] font-mono text-amber-300 font-bold flex items-center justify-center gap-1.5">
                <ShieldAlert size={14} />
                <span>Digite a Senha Mestre de Liberação:</span>
              </div>

              {errorMessage && (
                <div className="text-[11px] font-mono text-red-400 bg-red-950/60 p-2 rounded-xl border border-red-500/40">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="password"
                  value={masterPassword}
                  onChange={e => setMasterPassword(e.target.value)}
                  placeholder="Senha Mestre..."
                  className="flex-1 bg-[#10121a] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500 text-center font-bold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  Liberar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAdminUnlock(false)}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-mono block mx-auto"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>

        {/* Botão de Trocar Usuário / Sair */}
        <div className="mt-4">
          <button
            type="button"
            onClick={logout}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-400 underline"
          >
            Trocar Usuário ou Fazer Logout
          </button>
        </div>

      </div>

    </div>
  );
}
