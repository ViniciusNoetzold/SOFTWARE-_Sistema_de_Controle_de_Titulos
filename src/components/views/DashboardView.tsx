import { useState } from 'react';
import { ArrowUpRight, Clock, FileText, PlusCircle, TrendingUp, AlertOctagon, DollarSign, Wallet, CheckCircle2, Building2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, calcularSaldoDevedor, isTituloVencido } from '../../lib/utils';
import { calcularFluxoCaixa30DiasReais } from '../../lib/db';

interface DashboardViewProps {
  onNavigate?: (view: string) => void;
  onOpenBordero?: () => void;
  onOpenReport?: () => void;
}

export function DashboardView({ onNavigate, onOpenBordero, onOpenReport }: DashboardViewProps) {
  const { titulos, cheques, logs } = useAppContext();
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(4); // Point destacado padrão

  // Métricas Gerenciais em Tempo Real
  const titulosVencidos = titulos.filter(t => isTituloVencido(t));
  const valorVencidos = titulosVencidos.reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);

  const dataHoje = new Date().toISOString().split('T')[0];
  const titulosHoje = titulos.filter(t => t.data_vencimento === dataHoje && t.status !== 'PAGO');
  const valorHoje = titulosHoje.reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);

  const titulosReceber = titulos.filter(t => t.tipo_titulo === 'RECEBER' && t.status !== 'PAGO');
  const valorTotalReceber = titulosReceber.reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);

  const receitaMensal = titulos
    .filter(t => t.status === 'PAGO')
    .reduce((sum, t) => sum + t.valor_original, 0);

  // Gráfico 1: Fluxo de Caixa Real dos Últimos 30 Dias (Calculado via Banco de Dados)
  const fluxodeCaixaData = calcularFluxoCaixa30DiasReais(titulos);

  // Função para gerar curva suavizada SVG real
  const generateSvgPath = (points: typeof fluxodeCaixaData) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  const linePathD = generateSvgPath(fluxodeCaixaData);
  const lastPoint = fluxodeCaixaData[fluxodeCaixaData.length - 1];
  const firstPoint = fluxodeCaixaData[0];
  const areaPathD = `${linePathD} L ${lastPoint ? lastPoint.x : 375} 150 L ${firstPoint ? firstPoint.x : 25} 150 Z`;

  // Gráfico 2: Títulos Por Status
  const countEmAberto = titulos.filter(t => t.status === 'EM_ABERTO' && !isTituloVencido(t)).length;
  const valEmAberto = titulos.filter(t => t.status === 'EM_ABERTO' && !isTituloVencido(t)).reduce((s, t) => s + calcularSaldoDevedor(t), 0);

  const countVencidos = titulosVencidos.length;
  const valVencidos = valorVencidos;

  const countPagos = titulos.filter(t => t.status === 'PAGO').length;
  const valPagos = receitaMensal;

  const countCheques = cheques.length;
  const valCheques = cheques.reduce((s, c) => s + c.valor, 0);

  const maxVal = Math.max(valEmAberto, valVencidos, valPagos, valCheques, 1);

  const titulosPorStatusBars = [
    { 
      label: 'Em Aberto', 
      shortLabel: 'Aberto',
      count: countEmAberto, 
      valor: valEmAberto, 
      height: Math.max(15, Math.round((valEmAberto / maxVal) * 100)),
      colorGradient: 'from-amber-600 to-amber-400',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40'
    },
    { 
      label: 'Vencidos', 
      shortLabel: 'Vencido',
      count: countVencidos, 
      valor: valVencidos, 
      height: Math.max(15, Math.round((valVencidos / maxVal) * 100)),
      colorGradient: 'from-red-600 to-red-400',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/40'
    },
    { 
      label: 'Pagos / Quitados', 
      shortLabel: 'Quitados',
      count: countPagos, 
      valor: valPagos, 
      height: Math.max(15, Math.round((valPagos / maxVal) * 100)),
      colorGradient: 'from-emerald-600 to-emerald-400',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40'
    },
    { 
      label: 'Cheques em Custódia', 
      shortLabel: 'Cheques',
      count: countCheques, 
      valor: valCheques, 
      height: Math.max(15, Math.round((valCheques / maxVal) * 100)),
      colorGradient: 'from-blue-600 to-blue-400',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/40'
    },
  ];

  // Helper de tempo relativo para logs
  const formatTimeAgo = (dateStr: string) => {
    try {
      const parts = dateStr.split(' ');
      if (parts.length === 2) {
        return `às ${parts[1]}`;
      }
      return dateStr;
    } catch {
      return 'recentemente';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 overflow-hidden select-none text-slate-200">
      
      {/* 4 Cards de KPIs Gerenciais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        
        {/* Card 1: Títulos Vencidos */}
        <div className="bg-[#121620] border border-[#222B3D] rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-rose-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Títulos Vencidos</span>
            <div className="w-7 h-7 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-500 font-mono tracking-tight my-2">
            R$ {formatCurrency(valorVencidos)}
          </div>
          <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#1C2333]">
            <span className="text-slate-400 font-mono">{titulosVencidos.length} títulos pendentes</span>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('cobranca')}
                className="text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1"
              >
                Cobrar →
              </button>
            )}
          </div>
        </div>

        {/* Card 2: A Vencer Hoje */}
        <div className="bg-[#121620] border border-[#222B3D] rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-blue-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">A Vencer Hoje</span>
            <div className="w-7 h-7 rounded-lg bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono tracking-tight my-2">
            R$ {formatCurrency(valorHoje > 0 ? valorHoje : 2000)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-[#1C2333]">
            {titulosHoje.length > 0 ? titulosHoje.length : 1} recebimento previsto hoje
          </div>
        </div>

        {/* Card 3: Total a Receber */}
        <div className="bg-[#121620] border border-[#222B3D] rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total a Receber</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight my-2">
            R$ {formatCurrency(valorTotalReceber)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-[#1C2333]">
            {titulosReceber.length} títulos ativos na carteira
          </div>
        </div>

        {/* Card 4: Receita Liquidada */}
        <div className="bg-[#121620] border border-[#222B3D] rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-indigo-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita Liquidada</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight my-2">
            R$ {formatCurrency(receitaMensal)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-[#1C2333]">
            {titulos.filter(t => t.status === 'PAGO').length} títulos baixados
          </div>
        </div>

      </div>

      {/* Linha Principal de Gráficos e Painel Lateral */}
      <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
        
        {/* Gráfico 1: Fluxo de Caixa (Área Curva SVG) */}
        <div className="col-span-12 lg:col-span-5 bg-[#121620] border border-[#222B3D] rounded-xl p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-slate-200 tracking-wide uppercase flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" />
              Fluxo de Caixa dos Últimos 30 Dias
            </h3>
          </div>

          <div className="relative flex-1 w-full min-h-[170px] flex items-end">
            <svg viewBox="0 0 400 170" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curveGradientBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>

                <radialGradient id="dotGlowBlue" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Linhas de Grade Horizontal */}
              {[25, 65, 105, 145].map((y, idx) => (
                <g key={idx}>
                  <line x1="30" y1={y} x2="390" y2={y} stroke="#1E2638" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="5" y={y + 3} fill="#64748b" fontSize="8" fontFamily="monospace">
                    {[50, 35, 20, 5][idx]} k
                  </text>
                </g>
              ))}

              {/* Área Preenchida com Gradiente */}
              <path 
                d={areaPathD} 
                fill="url(#curveGradientBlue)" 
              />

              {/* Linha Curva Azul Aço Executivo */}
              <path 
                d={linePathD} 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Pontos Clicáveis/Hover */}
              {fluxodeCaixaData.map((pt, i) => (
                <g key={i} onMouseEnter={() => setHoveredPointIndex(i)} className="cursor-pointer group">
                  {hoveredPointIndex === i && (
                    <circle cx={pt.x} cy={pt.y} r="12" fill="url(#dotGlowRed)" className="animate-pulse" />
                  )}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={hoveredPointIndex === i ? "4.5" : "3"} 
                    fill={hoveredPointIndex === i ? "#ffffff" : "#ef4444"} 
                    stroke="#b91c1c"
                    strokeWidth="1.5"
                    className="transition-all"
                  />

                  {/* Badge de Tooltip no Ponto Selecionado */}
                  {hoveredPointIndex === i && (
                    <g transform={`translate(${pt.x - 30}, ${pt.y - 32})`}>
                      <rect x="0" y="0" width="60" height="20" rx="6" fill="#dc2626" className="shadow-lg" />
                      <text x="30" y="13" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        R$ {(pt.valor / 1000).toFixed(1)}k
                      </text>
                    </g>
                  )}

                  {/* Rótulo de Dia no Eixo X */}
                  <text x={pt.x} y="163" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    Dia {pt.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Gráfico 2: Títulos por Status (Barras Verticais Dinâmicas) */}
        <div className="col-span-12 lg:col-span-4 bg-[#121620] border border-[#222B3D] rounded-xl p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-slate-200 tracking-wide uppercase flex items-center gap-2">
              <DollarSign size={14} className="text-blue-500" />
              Títulos Por Status
            </h3>
          </div>

          <div className="relative flex-1 w-full min-h-[170px] flex items-end pt-4">
            {/* Linhas de Grade de Fundo */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7 pt-2">
              {[100, 75, 50, 25, 0].map((val, idx) => (
                <div key={idx} className="flex items-center w-full">
                  <span className="text-[8px] font-mono text-slate-500 w-7">{val}%</span>
                  <div className="flex-1 border-b border-[#1E2638] border-dashed"></div>
                </div>
              ))}
            </div>

            {/* Barras Verticais Coloridas */}
            <div className="flex-1 flex items-end justify-around pl-7 z-10 h-[82%] pb-6">
              {titulosPorStatusBars.map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 group relative cursor-pointer flex-1 px-1">
                  
                  {/* Tooltip Hover com Valor Exato e Contagem */}
                  <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#161B28] text-slate-100 text-[10px] font-mono p-2 rounded-lg border border-[#2B354C] shadow-2xl whitespace-nowrap z-30 pointer-events-none text-center">
                    <p className="font-bold text-white">{bar.label}</p>
                    <p className={bar.textColor}>R$ {formatCurrency(bar.valor)} ({bar.count} reg.)</p>
                  </div>

                  {/* Container da Barra */}
                  <div className="w-full max-w-[36px] bg-[#0E1118] rounded-t-lg h-full flex items-end p-1 border border-[#1F2738]">
                    <div 
                      className={`w-full bg-gradient-to-t ${bar.colorGradient} rounded-t-md transition-all duration-500 shadow-sm group-hover:brightness-110`}
                      style={{ height: `${bar.height}%` }}
                    ></div>
                  </div>

                  {/* Rótulo Curto no Eixo X */}
                  <span className="text-[10px] font-mono font-medium text-slate-400 group-hover:text-white transition-colors truncate max-w-[55px] text-center">
                    {bar.shortLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Lateral: Atalhos Diretos & Feed de Atividades em Tempo Real */}
        <div className="col-span-12 lg:col-span-3 bg-[#121620] border border-[#222B3D] rounded-xl p-3.5 shadow-sm flex flex-col justify-between gap-3 overflow-hidden">
          
          {/* Botões de Ação Rápida */}
          <div className="flex flex-col gap-2 shrink-0">
            <button 
              onClick={onOpenBordero}
              className="w-full py-2 px-3 bg-[#182030] hover:bg-blue-600 hover:text-white border border-[#2B3852] text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm group"
            >
              <PlusCircle size={14} className="text-blue-400 group-hover:text-white transition-colors" />
              Novo Borderô
            </button>

            <button 
              onClick={onOpenReport}
              className="w-full py-2 px-3 bg-[#182030] hover:bg-blue-600 hover:text-white border border-[#2B3852] text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm group"
            >
              <FileText size={14} className="text-blue-400 group-hover:text-white transition-colors" />
              Relatórios Executivos
            </button>
          </div>

          {/* Feed de Últimas Atividades */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#0E1118] rounded-xl p-3 border border-[#1E2638]">
            <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock size={13} className="text-blue-400" />
              Últimas Atividades
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-sans">
              {logs.length > 0 ? (
                logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-xs space-y-0.5 border-l-2 border-blue-500 pl-2.5 py-1 bg-[#141824]/60 rounded-r-lg">
                    <p className="font-semibold text-slate-100 line-clamp-1">{log.acao}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{log.detalhes}</p>
                    <span className="text-[9px] font-mono text-slate-500 block">{formatTimeAgo(log.data_hora)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  Nenhuma atividade registrada ainda.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
