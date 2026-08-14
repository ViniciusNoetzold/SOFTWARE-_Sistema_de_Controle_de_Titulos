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
    <div ref={menuRef} className="flex items-center bg-zinc-950 border-y border-zinc-900/80 px-2 py-0.5 text-[13px] select-none z-30 relative">
      {menus.map((menu) => (
        <div key={menu.id} className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
            className={`px-3 py-1.5 rounded-md transition-all font-medium focus:outline-none ${activeMenu === menu.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'}`}
          >
            {menu.label}
          </button>
          
          {/* Dropdown */}
          {activeMenu === menu.id && menu.items.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              {menu.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(item.action)}
                  className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-red-600 hover:text-white transition-colors focus:outline-none"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
