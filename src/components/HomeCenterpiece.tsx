import { FilePlus, Activity, DollarSign, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface HomeCenterpieceProps {
  onNavigate: (view: string) => void;
}

export function HomeCenterpiece({ onNavigate }: HomeCenterpieceProps) {
  const { titulos } = useAppContext();
  const titulosAtivos = titulos.filter(t => t.status !== 'PAGO').length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 select-none animate-in fade-in zoom-in-95 duration-500 z-10 px-4">
      
      {/* Central Glassmorphic Card Container */}
      <div className="relative flex flex-col items-center p-8 rounded-3xl bg-[#161a23]/70 backdrop-blur-2xl border border-[#2a3142]/80 shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-lg w-full text-center group hover:border-red-500/40 transition-all duration-500">
        
        {/* Glowing Red Neon Backdrop Effect */}
        <div className="absolute -top-12 w-32 h-32 bg-red-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/35 transition-all duration-500"></div>

        {/* Logo 3D Box */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#222836] to-[#141822] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-6 border border-[#2d364a] group-hover:border-red-500/60 group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="font-black text-red-500 text-5xl leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            M
          </span>
        </div>

        {/* Brand Name & Version Badge */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-black text-slate-100 tracking-wider uppercase font-sans">
            MEZZOLD<span className="text-red-500 font-extrabold">.</span>
          </h2>
          <span className="text-xs bg-[#202634] border border-red-500/30 text-red-400 px-2.5 py-0.5 rounded-full font-mono font-semibold shadow-sm">
            v1.0.2
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-xs font-mono text-slate-400 tracking-[0.25em] uppercase mb-6">
          [ CONTROLE DE TÍTULOS ]
        </p>

        {/* Status Indicators Badges */}
        <div className="flex items-center gap-2 mb-6 flex-wrap justify-center text-[11px]">
          <span className="inline-flex items-center gap-1.5 bg-[#1a1f2c] border border-[#2d3548] text-slate-300 px-3 py-1 rounded-lg font-medium">
            <ShieldCheck size={13} className="text-emerald-400" />
            Sistema Operacional
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[#1a1f2c] border border-[#2d3548] text-slate-300 px-3 py-1 rounded-lg font-medium font-mono">
            <DollarSign size={13} className="text-red-400" />
            {titulosAtivos} Títulos Ativos
          </span>
        </div>

        {/* Quick Action Pills */}
        <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-[#252c3d]">
          <button
            onClick={() => onNavigate('lancamento_titulos')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#1c2230] hover:bg-red-600 hover:text-white text-slate-300 transition-all border border-[#2a3348] group/btn shadow-md"
          >
            <FilePlus size={16} className="mb-1 text-red-400 group-hover/btn:text-white transition-colors" />
            <span className="text-[10px] font-semibold tracking-wide">Novo Título</span>
          </button>

          <button
            onClick={() => onNavigate('contas_receber')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#1c2230] hover:bg-red-600 hover:text-white text-slate-300 transition-all border border-[#2a3348] group/btn shadow-md"
          >
            <DollarSign size={16} className="mb-1 text-emerald-400 group-hover/btn:text-white transition-colors" />
            <span className="text-[10px] font-semibold tracking-wide">Recebíveis</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#1c2230] hover:bg-red-600 hover:text-white text-slate-300 transition-all border border-[#2a3348] group/btn shadow-md"
          >
            <Activity size={16} className="mb-1 text-sky-400 group-hover/btn:text-white transition-colors" />
            <span className="text-[10px] font-semibold tracking-wide">Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
}
