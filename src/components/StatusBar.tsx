import { useState, useEffect } from 'react';
import { AlertCircle, Lock, Crown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function StatusBar({ onOpenMasterLicenca }: { onOpenMasterLicenca?: () => void }) {
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
    <div className="status-bar no-print flex items-center justify-between bg-[#14171d] border-t border-[#252a36] px-5 py-2 text-[11px] text-slate-400 select-none z-10 relative">
      
      {/* Canto Inferior Esquerdo com Versão & Atalho Master */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-slate-400 font-medium">Pronto</span>
        <span className="text-[10px] bg-[#1e232e] border border-[#2d3445] text-slate-300 px-2 py-0.5 rounded-md font-mono tracking-wider">
          v1.0.3
        </span>

        {/* Atalho Especial do Mestre 000 para o Painel de Licença */}
        {isMaster && onOpenMasterLicenca && (
          <button
            type="button"
            onClick={onOpenMasterLicenca}
            className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 px-2 py-0.5 rounded-md transition-all font-bold shadow-sm"
            title="Abrir Painel Mestre de Licença e Mensalidade"
          >
            <Crown size={12} />
            <span>Licença Mestre</span>
          </button>
        )}
      </div>

      {/* Alerta de Vencimento da Assinatura (3 dias antes - vermelho pequeno piscando) */}
      {licencaStatus.alertaAtivo && !licencaStatus.expirada && (
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 font-mono text-[10px] font-bold shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <AlertCircle size={12} className="text-red-400 shrink-0" />
          <span>ASSINATURA: Vence em {licencaStatus.diasRestantes} dia(s) ({licencaStatus.dataVencimentoFormatada})</span>
        </div>
      )}

      {/* Canto Inferior Direito: Servidor & Relógio */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
          <span className="text-slate-300 font-medium">Conectado ao Servidor Mezzold</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-mono tracking-wide">
          <span>{dateStr}</span>
          <span className="text-red-500 font-bold">{timeStr}</span>
        </div>
      </div>
    </div>
  );
}
