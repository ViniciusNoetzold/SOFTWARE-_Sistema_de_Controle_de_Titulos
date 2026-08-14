export function StatusBar() {
  return (
    <div className="flex items-center justify-between bg-zinc-950 border-t border-zinc-900/80 px-5 py-2 text-[11px] text-zinc-500 select-none z-10 relative">
      <div className="flex items-center gap-2">
        <span>Pronto</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-zinc-400">Conectado ao Servidor Mezzold</span>
        </div>
        <span className="text-zinc-400 font-medium tracking-wide">Sex, 14/08/2026</span>
      </div>
    </div>
  );
}
