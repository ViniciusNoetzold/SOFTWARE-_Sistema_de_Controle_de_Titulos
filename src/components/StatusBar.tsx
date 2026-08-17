import { useState, useEffect } from 'react';

export function StatusBar() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

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
    <div className="flex items-center justify-between bg-[#14171d] border-t border-[#252a36] px-5 py-2 text-[11px] text-slate-400 select-none z-10 relative">
      {/* Canto Inferior Esquerdo com Versão */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-slate-400 font-medium">Pronto</span>
        <span className="text-[10px] bg-[#1e232e] border border-[#2d3445] text-slate-300 px-2 py-0.5 rounded-md font-mono tracking-wider">
          v1.0.2
        </span>
      </div>

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
