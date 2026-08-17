import { useState, useRef, useEffect } from 'react';
import { 
  Users, DollarSign, CreditCard, AlertOctagon, ArchiveRestore, 
  WalletCards, Settings, Wrench, Activity, FileText, FileSpreadsheet, 
  FileBadge, Calculator, Percent, BadgePercent, LogOut, FilePlus, ChevronDown, Check, QrCode, UserCheck
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface UnifiedNavbarProps {
  currentView?: string;
  onNavigate: (view: string) => void;
  onOpenReport: () => void;
  onOpenBordero: () => void;
  onOpenSimples: () => void;
  onOpenDesconto: () => void;
  onOpenDescCedente: () => void;
  onStopProcess: () => void;
  onOpenMasterLicenca?: () => void;
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
  onOpenMasterLicenca,
}: UnifiedNavbarProps) {
  const { currentUser, logout } = useAppContext();
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

  // Definição Completa dos Menus da Barra Superior
  const menuConfig = [
    {
      id: 'cadastros',
      label: 'Cadastros',
      icon: Users,
      action: () => onNavigate('cadastros'),
      activeViews: ['cadastros'],
      items: [
        { label: 'Gerenciador de Cadastros (Clientes/Fornecedores)', view: 'cadastros', icon: Users, action: () => onNavigate('cadastros') }
      ]
    },
    {
      id: 'contas_receber',
      label: 'Contas a Receber',
      icon: DollarSign,
      action: () => onNavigate('contas_receber'),
      activeViews: ['contas_receber', 'lancamento_titulos'],
      items: [
        { label: 'Listagem de Recebíveis', view: 'contas_receber', icon: DollarSign, action: () => onNavigate('contas_receber') },
        { label: 'Novo Lançamento de Título', view: 'lancamento_titulos', icon: FilePlus, action: () => onNavigate('lancamento_titulos') }
      ]
    },
    {
      id: 'contas_pagar',
      label: 'Contas a Pagar',
      icon: CreditCard,
      action: () => onNavigate('contas_pagar'),
      activeViews: ['contas_pagar'],
      items: [
        { label: 'Listagem de Contas a Pagar', view: 'contas_pagar', icon: CreditCard, action: () => onNavigate('contas_pagar') }
      ]
    },
    {
      id: 'cobranca',
      label: 'Cobrança & PIX',
      icon: AlertOctagon,
      action: () => onNavigate('cobranca'),
      activeViews: ['cobranca'],
      items: [
        { label: 'Régua de Inadimplência & E-mail', view: 'cobranca', icon: AlertOctagon, action: () => onNavigate('cobranca') },
        { label: 'Gerador PIX (BR Code / Copia e Cola)', view: 'cobranca', icon: QrCode, action: () => onNavigate('cobranca') }
      ]
    },
    {
      id: 'cheques',
      label: 'Custódia de Cheques',
      icon: WalletCards,
      action: () => onNavigate('cheques'),
      activeViews: ['cheques'],
      items: [
        { label: 'Gestão de Cheques (Recebidos/Emitidos)', view: 'cheques', icon: WalletCards, action: () => onNavigate('cheques') }
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: FileText,
      action: () => onNavigate('relatorios'),
      activeViews: ['relatorios'],
      items: [
        { label: 'Central de Relatórios Gerenciais', view: 'relatorios', icon: FileText, action: () => onNavigate('relatorios') }
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
        { label: 'Simples', view: '', icon: FileBadge, action: onOpenSimples },
        { label: 'Desconto', view: '', icon: Calculator, action: onOpenDesconto },
        { label: 'Desc. Cedente', view: '', icon: Percent, action: onOpenDescCedente },
        { label: 'Calculadoras & Backup', view: 'utilitarios', icon: Wrench, action: () => onNavigate('utilitarios') },
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: Settings,
      action: () => onNavigate('sistema'),
      activeViews: ['sistema', 'usuarios'],
      items: [
        { label: 'Configurações Globais da Empresa', view: 'sistema', icon: Settings, action: () => onNavigate('sistema') },
        ...(currentUser?.perfil === 'ADMIN' ? [
          { label: 'Usuários & Permissões (CRUD Admin)', view: 'usuarios', icon: Users, action: () => onNavigate('usuarios') }
        ] : []),
        ...(currentUser?.username === '000' && onOpenMasterLicenca ? [
          { label: '👑 Licença & Cobrança (Mestre 000)', view: '', icon: Settings, action: onOpenMasterLicenca }
        ] : []),
        { label: 'Sair da Aplicação', view: '', icon: LogOut, action: logout }
      ]
    }
  ];

  const handleMenuClick = (menu: typeof menuConfig[0]) => {
    if (menu.items.length === 1) {
      menu.action();
      setActiveMenu(null);
    } else {
      setActiveMenu(activeMenu === menu.id ? null : menu.id);
    }
  };

  const handleSubAction = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <div ref={menuRef} className="unified-navbar no-print w-full bg-[#12151e] border-b border-[#252b3b] px-2 sm:px-3 py-1.5 flex items-center justify-between shadow-xl relative z-40 select-none overflow-x-auto no-scrollbar gap-2">
      
      {/* Menu Options Bar */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap md:flex-wrap shrink-0">
        {menuConfig.map((item) => {
          const Icon = item.icon;
          const isOpen = activeMenu === item.id;
          const isActive = item.activeViews.includes(currentView);

          return (
            <div key={item.id} className="relative shrink-0">
              <button
                onClick={() => handleMenuClick(item)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs transition-all duration-200 relative group whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.45)]'
                    : isOpen
                    ? 'bg-[#1e2330] text-slate-100 border border-[#2f374a]'
                    : 'text-slate-300 hover:text-white hover:bg-[#1a1f2b]'
                }`}
              >
                {/* Glowing Dot on Active */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_#ffffff]" />
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

      {/* Perfil do Usuário Logado & Logo */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        
        {/* Chip Visual do Usuário */}
        {currentUser && (
          <div className="flex items-center gap-2 bg-[#1a1e2b] border border-[#2a3246] px-2.5 py-1 rounded-xl">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.nome}
              className="w-6 h-6 rounded-lg object-cover border border-red-500/40 shrink-0"
            />
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-[11px] font-bold text-slate-100 truncate max-w-[110px]">{currentUser.nome}</span>
              <span className="text-[9px] font-mono text-red-400 uppercase font-bold">{currentUser.perfil}</span>
            </div>

            <button
              onClick={logout}
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
              title="Sair do Sistema"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Logo Badge Mezzold Studio */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 rounded-xl hover:bg-[#1c202b] transition-all"
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

    </div>
  );
}
