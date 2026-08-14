import { 
  LogOut, FileSpreadsheet, FileText, FileBadge, 
  Calculator, Percent, BadgePercent, Wallet, OctagonAlert 
} from 'lucide-react';

interface ToolbarProps {
  onNavigate: (view: string) => void;
  onOpenBordero: () => void;
  onOpenSimples: () => void;
  onOpenDesconto: () => void;
  onOpenDescCedente: () => void;
  onStopProcess: () => void;
}

export function Toolbar({
  onNavigate,
  onOpenBordero,
  onOpenSimples,
  onOpenDesconto,
  onOpenDescCedente,
  onStopProcess
}: ToolbarProps) {
  
  const handleSair = () => {
    alert('Saindo do sistema...');
    // Para uso futuro no Tauri:
    // import { appWindow } from '@tauri-apps/api/window';
    // appWindow.close();
    window.close();
  };

  const handleAnfac = () => {
    alert('Gerando arquivo remessa padrão ANFAC...');
    // Simulação de download de arquivo txt
    const element = document.createElement("a");
    const file = new Blob(["REMESSA ANFAC SIMULADA"], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "remessa_anfac.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  const tools = [
    { icon: LogOut, label: 'Sair', action: handleSair },
    { icon: FileSpreadsheet, label: 'Borderô', action: onOpenBordero },
    { icon: FileText, label: 'B. Simples', action: onOpenSimples },
    { icon: FileBadge, label: 'B. Anfac', action: handleAnfac },
    { icon: Calculator, label: 'Calculadora', action: () => onNavigate('utilitarios') },
    { icon: Percent, label: 'Desconto', action: onOpenDesconto },
    { icon: BadgePercent, label: 'Desc. Ced.', action: onOpenDescCedente },
    { icon: Wallet, label: 'Cheques', action: () => onNavigate('cheques') },
    { icon: OctagonAlert, label: 'STOP', color: 'text-red-500/80 hover:text-red-400', action: onStopProcess },
  ];

  return (
    <div className="flex items-center justify-between bg-zinc-950 border-b border-zinc-900/80 px-3 py-2 select-none relative z-10 shadow-sm">
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <button 
            key={tool.label}
            onClick={tool.action}
            className="flex flex-col items-center justify-center min-w-[72px] h-[64px] rounded-lg hover:bg-zinc-900/80 transition-all group focus:outline-none"
          >
            <tool.icon 
              size={22} 
              className={`mb-2 text-zinc-400 group-hover:text-zinc-200 transition-colors ${tool.color || ''}`} 
              strokeWidth={1.25}
            />
            <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors tracking-wide font-medium">
              {tool.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* Mezzold Studio Logo Placeholder */}
      <div className="pr-4 flex items-center gap-3 cursor-pointer group">
        <div className="flex flex-col items-end leading-none">
          <span className="font-bold text-zinc-200 tracking-wider uppercase text-sm group-hover:text-white transition-colors">MEZZOLD</span>
          <span className="text-[9px] text-zinc-500 tracking-widest uppercase mt-1 group-hover:text-red-500 transition-colors">STUDIO</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.05)] group-hover:border-red-500/50 transition-all">
          <span className="font-black text-red-600 text-lg leading-none">M</span>
        </div>
      </div>
    </div>
  );
}
