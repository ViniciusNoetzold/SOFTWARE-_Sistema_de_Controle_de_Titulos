import { Activity, AlertTriangle, DollarSign, Wallet } from 'lucide-react';

export function DashboardView() {
  const kpis = [
    { title: 'Total de Títulos', value: '1.248', label: 'Em carteira ativa', icon: Activity, color: 'text-red-500' },
    { title: 'Saldo em Aberto', value: 'R$ 2.4M', label: 'A receber', icon: Wallet, color: 'text-amber-500' },
    { title: 'Inadimplência', value: '4,2%', label: '+0.5% este mês', icon: AlertTriangle, color: 'text-red-500' },
    { title: 'Receita Mês', value: 'R$ 185.4K', label: 'Acumulado no mês', icon: DollarSign, color: 'text-zinc-500' },
  ];

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Dashboard Gerencial</h1>
        <p className="text-sm text-zinc-400 mt-1">Visão geral do desempenho e saúde da carteira.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{kpi.title}</span>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <div className="text-3xl font-semibold text-zinc-100 tracking-tight mb-1">{kpi.value}</div>
            <div className="text-xs text-zinc-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Gráfico Simulado 1 */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex flex-col">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Volume de Operações (Últimos 6 meses)</h3>
          <div className="flex-1 flex items-end justify-between gap-4 pt-4">
            {[40, 60, 45, 80, 65, 90].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-3 group">
                <div className="w-full bg-zinc-800 rounded-t-sm relative overflow-hidden transition-all group-hover:brightness-125" style={{ height: `${h}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-red-500/80"></div>
                </div>
                <span className="text-xs text-zinc-600 font-medium">{['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico Simulado 2 */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex flex-col">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Inadimplência vs Recuperação</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-300">Em Atraso (&gt; 30 dias)</span>
                <span className="font-mono text-zinc-400">R$ 145.000</span>
              </div>
              <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-red-500/80 w-[35%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-300">Recuperado</span>
                <span className="font-mono text-zinc-400">R$ 380.000</span>
              </div>
              <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-500/80 w-[65%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-300">Em Acordo</span>
                <span className="font-mono text-zinc-400">R$ 85.000</span>
              </div>
              <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500/80 w-[20%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
