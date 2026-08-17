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
    window.close();
  };

  const handleAnfac = () => {
    alert('Gerando arquivo remessa padrão ANFAC...');
    const element = document.createElement("a");
    const file = new Blob(["REMESSA ANFAC SIMULADA"], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "remessa_anfac.txt";
    document.body.appendChild(element);
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
    { icon: OctagonAlert, label: 'STOP', color: 'text-red-500/90 hover:text-red-400', action: onStopProcess },
  ];

  return (
    <div className="flex items-center justify-between bg-[#14171d] border-b border-[#252a36] px-4 py-1.5 select-none relative z-20 shadow-sm">
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <button 
            key={tool.label}
            onClick={tool.action}
            className="flex flex-col items-center justify-center min-w-[68px] h-[58px] rounded-lg hover:bg-[#1e222e] transition-all group focus:outline-none"
          >
            <tool.icon 
              size={20} 
              className={`mb-1.5 text-slate-400 group-hover:text-slate-100 transition-colors ${tool.color || ''}`} 
              strokeWidth={1.25}
            />
            <span className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors tracking-wide font-medium">
              {tool.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
