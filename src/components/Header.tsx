export function Header() {
  return (
    <div 
      data-tauri-drag-region
      className="flex items-center justify-between bg-zinc-950 border-b border-zinc-900 px-6 py-2.5 text-zinc-400 text-xs select-none z-40"
    >
      <div className="font-medium tracking-wide flex items-center gap-2 text-zinc-300">
        <span className="font-black text-xl tracking-tighter text-zinc-100 uppercase font-sans">
          MEZZOLD<span className="text-red-600">.</span>
        </span>
        <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono ml-2">
          v1.0.2
        </span>
      </div>
    </div>
  );
}
