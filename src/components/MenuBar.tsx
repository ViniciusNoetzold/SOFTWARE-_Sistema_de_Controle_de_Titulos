import { useState, useRef, useEffect } from 'react';

type MenuBarProps = {
  onNavigate: (view: string) => void;
  onOpenReport: () => void;
};

export function MenuBar({ onNavigate, onOpenReport }: MenuBarProps) {
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

  const menus = [
    {
      id: 'cadastros',
      label: 'Cadastros',
      items: [
        { label: 'Central de Cadastros', action: () => onNavigate('cadastros') },
      ]
    },
    {
      id: 'titulos',
      label: 'Títulos',
      items: [
        { label: 'Lançamento de Títulos', action: () => onNavigate('lancamento_titulos') },
        { label: 'Contas a Receber', action: () => onNavigate('contas_receber') },
        { label: 'Contas a Pagar', action: () => onNavigate('contas_pagar') },
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      items: [
        { label: 'Relatório de títulos acumulativo', action: onOpenReport },
      ]
    },
    {
      id: 'cobranca',
      label: 'Cobrança',
      items: [
        { label: 'Régua de Cobrança', action: () => onNavigate('cobranca') },
      ]
    },
    {
      id: 'arquivo_morto',
      label: 'Arquivo morto',
      items: [
        { label: 'Consultar Arquivo Morto', action: () => onNavigate('arquivo_morto') },
        { label: 'Limpeza de Base', action: () => onNavigate('limpeza_base') },
      ]
    },
    {
      id: 'graficos',
      label: 'Gráficos',
      items: [
        { label: 'Dashboard Gerencial', action: () => onNavigate('dashboard') },
      ]
    },
    {
      id: 'cheques',
      label: 'Cheques',
      items: [
        { label: 'Gestão de Cheques', action: () => onNavigate('cheques') },
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      items: [
        { label: 'Configurações', action: () => onNavigate('sistema') },
      ]
    },
    {
      id: 'utilitarios',
      label: 'Utilitários',
      items: [
        { label: 'Ferramentas Gerais', action: () => onNavigate('utilitarios') },
      ]
    },
  ];

  const handleAction = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <div 
      ref={menuRef} 
      data-tauri-drag-region
      className="flex items-center justify-between bg-[#14171d] border-b border-[#252a36] px-4 py-2 text-[13px] select-none z-30 relative"
    >
      {/* Navigation Menus */}
      <div className="flex items-center gap-1">
        {menus.map((menu) => (
          <div key={menu.id} className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium focus:outline-none ${
                activeMenu === menu.id 
                  ? 'bg-[#222733] text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-[#1c202b]'
              }`}
            >
              {menu.label}
            </button>
            
            {/* Dropdown */}
            {activeMenu === menu.id && menu.items.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#1c202b] border border-[#2d3445] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {menu.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(item.action)}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-red-600 hover:text-white transition-colors focus:outline-none text-xs font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mezzold Studio Logo Badge on Top Right */}
      <div 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-3 cursor-pointer group px-2 py-1 rounded-lg hover:bg-[#1c202b] transition-all"
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
