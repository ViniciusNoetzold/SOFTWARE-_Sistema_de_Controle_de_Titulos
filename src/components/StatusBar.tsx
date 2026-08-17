import { useState, useEffect } from 'react';
import { AlertCircle, Lock, Crown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function StatusBar({ 
  onOpenMasterLicenca,
  onOpenAlertaVencimento
}: { 
  onOpenMasterLicenca?: () => void;
  onOpenAlertaVencimento?: () => void;
}) {
  const { licencaStatus, currentUser } = useAppContext();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  const isMaster = currentUser?.username === '000';

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR'));
      
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      };
      const formattedDate = now.toLocaleDateString('pt-BR', options);
      const capitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
      setDateStr(capitalized);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-bar no-print flex items-center justify-between bg-[#0B0E14] border-t border-[#1E2536] px-4 py-1.5 text-[11px] text-slate-400 select-none z-10 relative font-sans">
      
      {/* Canto Inferior Esquerdo com Versão & Atalho Master */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-slate-500 font-medium">Pronto</span>
        <span className="text-[10px] bg-[#141824] border border-[#222B3D] text-slate-300 px-2 py-0.5 rounded font-mono tracking-wide">
          v1.0.4
        </span>

        {/* Atalho Especial do Mestre 000 para o Painel de Licença */}
        {isMaster && onOpenMasterLicenca && (
          <button
            type="button"
            onClick={onOpenMasterLicenca}
            className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 px-2 py-0.5 rounded transition-all font-semibold shadow-sm"
            title="Abrir Painel Mestre de Licença e Mensalidade"
          >
            <Crown size={12} />
            <span>Licença Mestre</span>
          </button>
        )}
      </div>

      {/* Alerta de Vencimento da Assinatura (3 dias antes - vermelho pequeno piscando e clicável) */}
      {licencaStatus.alertaAtivo && !licencaStatus.expirada && (
        <button
          type="button"
          onClick={onOpenAlertaVencimento}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 hover:bg-rose-900/90 border border-rose-500/60 text-rose-300 font-mono text-[10px] font-semibold shadow-md animate-pulse cursor-pointer transition-colors"
          title="Clique para ver a Chave PIX e dados de pagamento"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
          <AlertCircle size={12} className="text-rose-400 shrink-0" />
          <span>Assinatura: Vence em {licencaStatus.diasRestantes} dia(s) ({licencaStatus.dataVencimentoFormatada}) • Pagar PIX</span>
        </button>
      )}

      {/* Canto Inferior Direito: Servidor & Relógio */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></div>
          <span className="text-slate-400 font-normal">Servidor Online</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] tracking-tight">
          <span className="text-slate-400">{dateStr}</span>
          <span className="text-blue-400 font-semibold">{timeStr}</span>
        </div>
      </div>
    </div>
  );
}
