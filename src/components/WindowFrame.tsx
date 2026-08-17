import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface WindowFrameProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

export function WindowFrame({ title, subtitle, icon, onClose, children }: WindowFrameProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-1 sm:p-2 md:p-3 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
      
      {/* Window Container */}
      <div className="relative bg-[#1a1d26]/95 backdrop-blur-2xl border border-[#2d3342] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden w-full h-full max-w-[99vw] max-h-[99vh] sm:max-w-[98%] sm:max-h-[98%] pointer-events-auto">
        
        {/* Window Header / Titlebar */}
        <div className="px-5 py-2.5 bg-[#14171d]/90 border-b border-[#2d3342] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-7 h-7 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-xs font-bold text-slate-100 tracking-wide flex items-center gap-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10px] text-slate-400 font-normal">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Window Action Controls */}
          <div className="flex items-center gap-1">
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-600 rounded-lg transition-all"
              title="Fechar Janela (X)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Window Main Content */}
        <div className="flex-1 overflow-auto p-3 md:p-4 bg-[#14171d]/40 flex flex-col">
          {children}
        </div>

      </div>
    </div>
  );
}
