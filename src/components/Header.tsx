import { Minus, Square, X } from 'lucide-react';

export function Header() {
  return (
    <div className="flex items-center justify-between bg-zinc-950 px-6 py-3 text-zinc-400 text-xs select-none">
      <div className="font-medium tracking-wide flex items-center gap-2 text-zinc-300">
        <span className="font-black text-xl tracking-tighter text-zinc-100 uppercase font-sans">
          MEZZOLD<span className="text-red-600">.</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="hover:text-zinc-100 transition-colors focus:outline-none">
          <Minus size={14} strokeWidth={1.5} />
        </button>
        <button className="hover:text-zinc-100 transition-colors focus:outline-none">
          <Square size={12} strokeWidth={1.5} />
        </button>
        <button className="hover:text-red-400 transition-colors focus:outline-none">
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
