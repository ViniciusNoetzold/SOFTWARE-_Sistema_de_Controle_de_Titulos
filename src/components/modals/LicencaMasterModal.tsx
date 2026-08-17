import { useState, FormEvent } from 'react';
import { 
  Shield, KeyRound, Calendar, DollarSign, MessageSquare, AlertTriangle, 
  CheckCircle2, Lock, Unlock, Clock, Sparkles, RefreshCw, Smartphone, ChevronRight, Crown
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../lib/utils';

export function LicencaMasterModal({ isOpen, onClose }: { isOpen: boolean; onClose: boolean | (() => void) }) {
  const { 
    currentUser, 
    assinaturaLicenca, 
    licencaStatus, 
    updateAssinaturaLicenca, 
    renovarLicenca, 
    bloquearSistemaManual,
    showToast 
  } = useAppContext();

  // Estados locais de edição
  const [diaVencimento, setDiaVencimento] = useState<number>(assinaturaLicenca.diaVencimento || 15);
  const [valorMensalidade, setValorMensalidade] = useState<string>(assinaturaLicenca.valorMensalidade ? String(assinaturaLicenca.valorMensalidade) : '180.00');
  const [whatsappSuporte, setWhatsappSuporte] = useState<string>(assinaturaLicenca.whatsappSuporte || '5511999999999');
  const [dataValidadeManual, setDataValidadeManual] = useState<string>(
    assinaturaLicenca.dataValidadeISO ? assinaturaLicenca.dataValidadeISO.split('T')[0] : ''
  );

  const isMaster = currentUser?.username === '000';

  if (!isOpen) return null;

  const handleClose = () => {
    if (typeof onClose === 'function') onClose();
  };

  const handleSalvarConfiguracoes = (e: FormEvent) => {
    e.preventDefault();
    const parsedVal = parseFloat(valorMensalidade.replace(',', '.')) || 0;
    
    // Constrói a data com hora final 23:59:59
    let finalISO = assinaturaLicenca.dataValidadeISO;
    if (dataValidadeManual) {
      const d = new Date(`${dataValidadeManual}T23:59:59.999Z`);
      if (!isNaN(d.getTime())) {
        finalISO = d.toISOString();
      }
    }

    updateAssinaturaLicenca({
      diaVencimento: Number(diaVencimento),
      valorMensalidade: parsedVal,
      whatsappSuporte: whatsappSuporte.replace(/\D/g, ''),
      dataValidadeISO: finalISO
    });
  };

  // Se não for o Mestre 000, nega o acesso
  if (!isMaster) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#141722] border border-red-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-base font-black text-slate-100 uppercase tracking-wider">Acesso Exclusivo ao Usuário Mestre</h2>
          <p className="text-xs text-slate-400 font-mono mt-2">
            O painel de controle financeiro da licença e bloqueio do software é restrito exclusivamente ao usuário mestre <b>000</b>.
          </p>
          <button
            onClick={handleClose}
            className="mt-6 bg-[#1f2536] hover:bg-[#28324a] text-slate-200 font-bold px-6 py-2.5 rounded-xl text-xs"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans text-slate-200">
      
      <div className="bg-[#141722] border border-[#2b3242] rounded-3xl w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Header Master */}
        <div className="px-6 py-4 bg-[#10131c] border-b border-[#252b3b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Crown size={20} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Painel de Licença & Cobrança de Mensalidade</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-bold">MESTRE 000</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">Controle as regras de vencimento, bloqueio automático e liberação de acesso</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Card de Status da Licença Atual */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 font-mono ${
            licencaStatus.expirada 
              ? 'bg-red-950/40 border-red-500/50 text-red-200' 
              : licencaStatus.alertaAtivo 
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' 
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                licencaStatus.expirada ? 'bg-red-600 text-white' : licencaStatus.alertaAtivo ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
              }`}>
                {licencaStatus.expirada ? <Lock size={22} /> : licencaStatus.alertaAtivo ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Situação da Assinatura:</span>
                <h3 className="text-sm font-black uppercase">
                  {licencaStatus.expirada ? 'BLOQUEADO / EXPIRADO' : licencaStatus.alertaAtivo ? 'ALERTA DE VENCIMENTO (3 DIAS)' : 'ATIVO & REGULARIZADO'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">{licencaStatus.mensagem}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase opacity-75 block">Válido até:</span>
              <span className="text-sm font-black">{licencaStatus.dataVencimentoFormatada}</span>
              <span className="block text-[10px] opacity-80 mt-0.5">{licencaStatus.diasRestantes} dias restantes</span>
            </div>
          </div>

          {/* Ações Rápidas de Liberação & Renovação */}
          <div className="p-4 bg-[#161a25] border border-[#262f42] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Ações Rápidas de Liberação do Mestre:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Botão Renovar +30 Dias (Com regra de bônus) */}
              <button
                type="button"
                onClick={() => renovarLicenca()}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex flex-col items-center gap-1 text-center"
              >
                <div className="flex items-center gap-1.5">
                  <RefreshCw size={14} />
                  <span>Liberar +1 Mês (30 Dias)</span>
                </div>
                <span className="text-[9px] font-mono opacity-85">Soma dias bônus se adiantado</span>
              </button>

              {/* Botão Renovar +60 Dias */}
              <button
                type="button"
                onClick={() => renovarLicenca(60)}
                className="p-3 bg-[#1e2535] hover:bg-[#273248] text-slate-200 border border-[#2d374d] hover:border-emerald-500 font-bold rounded-xl text-xs transition-all flex flex-col items-center gap-1 text-center"
              >
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-400" />
                  <span>Liberar +2 Meses (60 Dias)</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">Plano Bimestral</span>
              </button>

              {/* Botão Trava Manual / Desbloqueio */}
              <button
                type="button"
                onClick={() => bloquearSistemaManual(!assinaturaLicenca.bloqueioManual)}
                className={`p-3 font-bold rounded-xl text-xs transition-all border flex flex-col items-center gap-1 text-center ${
                  assinaturaLicenca.bloqueioManual
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                    : 'bg-red-950/60 border-red-500 text-red-300 hover:bg-red-600 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {assinaturaLicenca.bloqueioManual ? <Unlock size={14} /> : <Lock size={14} />}
                  <span>{assinaturaLicenca.bloqueioManual ? 'Desbloquear Manualmente' : 'Forçar Bloqueio Imediato'}</span>
                </div>
                <span className="text-[9px] font-mono opacity-80">Trava administrativa mestre</span>
              </button>

            </div>
          </div>

          {/* Formulário de Parâmetros da Assinatura */}
          <form onSubmit={handleSalvarConfiguracoes} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-[#252b3b] pb-2">
              <KeyRound size={14} className="text-red-500" />
              <span>Configuração dos Dados da Assinatura:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              
              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                  Dia do Vencimento no Mês (1 a 31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diaVencimento}
                  onChange={e => setDiaVencimento(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#10131c] border border-[#2b3242] rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                  Valor da Mensalidade (R$)
                </label>
                <input
                  type="text"
                  value={valorMensalidade}
                  onChange={e => setValorMensalidade(e.target.value)}
                  placeholder="180.00"
                  className="w-full bg-[#10131c] border border-[#2b3242] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                  Data Limite Manual de Validade
                </label>
                <input
                  type="date"
                  value={dataValidadeManual}
                  onChange={e => setDataValidadeManual(e.target.value)}
                  className="w-full bg-[#10131c] border border-[#2b3242] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                  WhatsApp de Suporte / Liberação (Com DDI/DDD)
                </label>
                <input
                  type="text"
                  value={whatsappSuporte}
                  onChange={e => setWhatsappSuporte(e.target.value)}
                  placeholder="5511999999999"
                  className="w-full bg-[#10131c] border border-[#2b3242] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.35)]"
              >
                Salvar Parâmetros da Assinatura
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}
