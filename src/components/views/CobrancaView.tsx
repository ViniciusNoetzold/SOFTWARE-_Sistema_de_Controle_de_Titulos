import { useState } from 'react';
import { Send, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { mockTitulos, mockEntidades } from '../../lib/mockData';
import { formatCurrency, calcularSaldoDevedor } from '../../lib/utils';

export function CobrancaView() {
  // Filtra títulos VENCIDOS da carteira de recebíveis
  const titulosAtrasados = mockTitulos.filter(
    t => t.tipo_titulo === 'RECEBER' && t.status === 'VENCIDO'
  );

  const [notificados, setNotificados] = useState<string[]>([]);

  const handleNotificar = (id: string) => {
    if (!notificados.includes(id)) {
      setNotificados(prev => [...prev, id]);
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <AlertOctagon size={24} className="text-amber-500" />
            Régua de Cobrança
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Gestão de inadimplência, juros e emissão de notificações.</p>
        </div>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-[11px] uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800/80 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Cliente / Contato</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Nº Documento</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Valor Original</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Saldo Atualizado</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Ações de Cobrança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {titulosAtrasados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum título em atraso encontrado.
                  </td>
                </tr>
              )}
              {titulosAtrasados.map((t) => {
                const cliente = mockEntidades.find(e => e.id === t.id_entidade);
                const isNotificado = notificados.includes(t.id);
                
                return (
                  <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200">{cliente?.nome}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">{cliente?.telefone}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-300">{t.numero_documento}</td>
                    <td className="px-6 py-4 font-mono text-right text-zinc-500">{formatCurrency(t.valor_original)}</td>
                    <td className="px-6 py-4 font-mono text-right font-medium text-red-400">{formatCurrency(calcularSaldoDevedor(t))}</td>
                    <td className="px-6 py-4 text-center">
                      {!isNotificado ? (
                        <button 
                          onClick={() => handleNotificar(t.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-semibold tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                        >
                          <Send size={12} />
                          Notificar
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-zinc-500">
                          <CheckCircle2 size={14} />
                          Notificado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
