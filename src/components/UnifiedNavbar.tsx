import { useState, useRef, useEffect } from 'react';
import { 
  Users, DollarSign, CreditCard, AlertOctagon, ArchiveRestore, 
  WalletCards, Settings, Wrench, Activity, FileText, FileSpreadsheet, 
  FileBadge, Calculator, Percent, BadgePercent, LogOut, FilePlus, ChevronDown, Check, QrCode
} from 'lucide-react';

interface UnifiedNavbarProps {
  currentView?: string;
  onNavigate: (view: string) => void;
  onOpenReport: () => void;
  onOpenBordero: () => void;
  onOpenSimples: () => void;
  onOpenDesconto: () => void;
  onOpenDescCedente: () => void;
  onStopProcess: () => void;
}

export function UnifiedNavbar({
  currentView = 'home',
  onNavigate,
  onOpenReport,
  onOpenBordero,
  onOpenSimples,
  onOpenDesconto,
  onOpenDescCedente,
  onStopProcess,
}: UnifiedNavbarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const navItems = [
    {
      id: 'cadastros',
      label: 'Cadastros',
      icon: Users,
      action: () => onNavigate('cadastros'),
      activeViews: ['cadastros'],
      items: [
        { label: 'Central de Cadastros', view: 'cadastros', icon: Users, action: () => onNavigate('cadastros') },
      ]
    },
    {
      id: 'titulos',
      label: 'Títulos',
      icon: FileSpreadsheet,
      action: () => onNavigate('contas_receber'),
      activeViews: ['contas_receber', 'contas_pagar', 'lancamento_titulos'],
      items: [
        { label: 'Novo Título (Lançamento)', view: 'lancamento_titulos', icon: FilePlus, action: () => onNavigate('lancamento_titulos') },
        { label: 'Contas a Receber', view: 'contas_receber', icon: DollarSign, action: () => onNavigate('contas_receber') },
        { label: 'Contas a Pagar', view: 'contas_pagar', icon: CreditCard, action: () => onNavigate('contas_pagar') },
      ]
    },
    {
      id: 'cobranca',
      label: 'Cobrança',
      icon: AlertOctagon,
      action: () => onNavigate('cobranca'),
      activeViews: ['cobranca'],
      items: [
        { label: 'Régua de Cobrança', view: 'cobranca', icon: AlertOctagon, action: () => onNavigate('cobranca') },
        { label: 'Gerador PIX (BR Code)', view: 'cobranca', icon: QrCode, action: () => onNavigate('cobranca') },
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: FileText,
      action: () => onNavigate('relatorios'),
      activeViews: ['relatorios'],
      items: [
        { label: 'Central de Relatórios Gerenciais', view: 'relatorios', icon: FileText, action: () => onNavigate('relatorios') },
      ]
    },
    {
      id: 'graficos',
      label: 'Gráficos',
      icon: Activity,
      action: () => onNavigate('home'), // Retorna para o Dashboard base
      activeViews: ['dashboard', 'home'],
      items: [
        { label: 'Dashboard Gerencial', view: 'home', icon: Activity, action: () => onNavigate('home') },
      ]
    },
    {
      id: 'cheques',
      label: 'Cheques',
      icon: WalletCards,
      action: () => onNavigate('cheques'),
      activeViews: ['cheques'],
      items: [
        { label: 'Gestão de Cheques', view: 'cheques', icon: WalletCards, action: () => onNavigate('cheques') },
      ]
    },
    {
      id: 'arquivo_morto',
      label: 'Arquivo Morto',
      icon: ArchiveRestore,
      action: () => onNavigate('arquivo_morto'),
      activeViews: ['arquivo_morto', 'limpeza_base'],
      items: [
        { label: 'Consultar Arquivo Morto', view: 'arquivo_morto', icon: ArchiveRestore, action: () => onNavigate('arquivo_morto') },
        { label: 'Limpeza de Base', view: 'limpeza_base', icon: Settings, action: () => onNavigate('limpeza_base') },
      ]
    },
    {
      id: 'utilitarios',
      label: 'Utilitários',
      icon: Wrench,
      action: () => onNavigate('utilitarios'),
      activeViews: ['utilitarios'],
      items: [
        { label: 'Borderô', view: '', icon: FileSpreadsheet, action: onOpenBordero },
        { label: 'B. Simples', view: '', icon: FileText, action: onOpenSimples },
        { label: 'B. Anfac', view: '', icon: FileBadge, action: handleAnfac },
        { label: 'Calculadora Financeira', view: 'utilitarios', icon: Calculator, action: () => onNavigate('utilitarios') },
        { label: 'Desconto', view: '', icon: Percent, action: onOpenDesconto },
        { label: 'Desc. Cedente', view: '', icon: BadgePercent, action: onOpenDescCedente },
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: Settings,
      action: () => onNavigate('sistema'),
      activeViews: ['sistema'],
      items: [
        { label: 'Configurações Globais', view: 'sistema', icon: Settings, action: () => onNavigate('sistema') },
        { label: 'Parar Processos (STOP)', view: '', icon: LogOut, action: onStopProcess },
      ]
    },
  ];

  const handleItemClick = (item: typeof navItems[0]) => {
    item.action();
    if (item.items.length > 1) {
      setActiveMenu(activeMenu === item.id ? null : item.id);
    } else {
      setActiveMenu(null);
    }
  };

  const handleSubAction = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <div 
      ref={menuRef} 
      data-tauri-drag-region
      className="flex items-center justify-between bg-[#14171d] border-b border-[#252a36] px-4 py-2 select-none z-30 relative shadow-md overflow-hidden max-w-full"
    >
      {/* Primary Modules with Active Indicators */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap max-w-[calc(100%-140px)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isOpen = activeMenu === item.id;
          const isActive = item.activeViews.includes(currentView);

          return (
            <div key={item.id} className="relative shrink-0">
              <button 
                onClick={() => handleItemClick(item)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold focus:outline-none ${
                  isActive
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.45)] border border-red-500 scale-[1.02]' 
                    : isOpen
                    ? 'bg-[#222733] text-white border border-[#2d3445]'
                    : 'text-slate-300 hover:text-white hover:bg-[#1c202b]'
                }`}
              >
                {/* Glowing Indicator Dot for Active Module */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse shrink-0" />
                )}

                <Icon 
                  size={15} 
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-white' : isOpen ? 'text-red-500' : 'text-slate-400'
                  }`} 
                  strokeWidth={isActive ? 2.5 : 1.5} 
                />
                
                <span className={isActive ? 'font-black tracking-wide' : 'font-semibold'}>
                  {item.label}
                </span>

                {item.items.length > 1 && (
                  <ChevronDown 
                    size={12} 
                    className={`transition-transform ${
                      isActive ? 'text-white/80' : isOpen ? 'rotate-180 text-red-500' : 'text-slate-500'
                    }`} 
                  />
                )}

                {/* Subtitle Indicator Bar under active button */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-white/90 rounded-full shadow-[0_0_10px_#ffffff]" />
                )}
              </button>

              {/* Submenu Dropdown */}
              {isOpen && item.items.length > 1 && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#1c202b] border border-[#2d3445] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {item.items.map((subItem, idx) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = subItem.view && subItem.view === currentView;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSubAction(subItem.action)}
                        className={`w-full flex items-center justify-between text-left px-4 py-2.5 transition-colors text-xs font-medium focus:outline-none group ${
                          isSubActive 
                            ? 'bg-red-600 text-white font-bold' 
                            : 'text-slate-300 hover:bg-[#282f3f] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <SubIcon size={14} className={`${isSubActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} shrink-0`} />
                          <span>{subItem.label}</span>
                        </div>

                        {isSubActive && <Check size={14} className="text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mezzold Studio Logo Badge on Right */}
      <div 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 rounded-xl hover:bg-[#1c202b] transition-all shrink-0 ml-2"
        title="Voltar ao Dashboard Base"
      >
        <div className="flex flex-col items-end leading-none">
          <span className="font-bold text-slate-200 tracking-wider uppercase text-xs group-hover:text-white transition-colors">MEZZOLD</span>
          <span className="text-[9px] text-slate-500 tracking-widest uppercase mt-0.5 group-hover:text-red-400 transition-colors font-mono">STUDIO</span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#222733] border border-[#2e3545] flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.1)] group-hover:border-red-500/50 transition-all shrink-0">
          <span className="font-black text-red-500 text-base leading-none">M</span>
        </div>
      </div>
    </div>
  );
}
