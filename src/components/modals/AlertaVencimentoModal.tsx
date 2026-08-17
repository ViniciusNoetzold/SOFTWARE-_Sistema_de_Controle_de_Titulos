import { useState } from 'react';
import { 
  AlertCircle, Send, QrCode, Copy, Check, Clock, ShieldAlert, X, DollarSign 
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../lib/utils';

export function AlertaVencimentoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { assinaturaLicenca, licencaStatus, empresaConfig, showToast } = useAppContext();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const chavePix = assinaturaLicenca.chavePixLicenca || '5554997030349';
  const telefone = assinaturaLicenca.whatsappSuporte || '555497131399';
  const valorMensalidade = assinaturaLicenca.valorMensalidade || 180;
  const nomeEmpresa = empresaConfig.nomeFantasia || empresaConfig.razaoSocial || 'Nossa Empresa';
  const cnpj = empresaConfig.cnpj || '';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(chavePix);
    setCopied(true);
    showToast('Chave PIX copiada com sucesso!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleEnviarWhatsapp = () => {
    const valor = formatCurrency(valorMensalidade);
    const dataVenc = licencaStatus.dataVencimentoFormatada;

    const texto = encodeURIComponent(
      `Olá, Suporte Técnico Mezzold!\n\n` +
      `Realizamos o pagamento da assinatura do *Sistema de Controle de Títulos*.\n\n` +
      `🏢 *Empresa:* ${nomeEmpresa}\n` +
      `📄 *CNPJ:* ${cnpj}\n` +
      `💰 *Valor da Mensalidade:* ${valor}\n` +
      `📅 *Vencimento:* ${dataVenc}\n\n` +
      `Segue em anexo o comprovante para a renovação do acesso.`
    );

    const url = `https://api.whatsapp.com/send?phone=${telefone}&text=${texto}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans text-slate-100 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#141722] border border-rose-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252b3b] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Aviso de Renovação da Assinatura
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Vence em {licencaStatus.diasRestantes} dia(s) ({licencaStatus.dataVencimentoFormatada})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Card de Informação do Valor */}
        <div className="bg-[#0e1017] border border-[#242b3b] p-4 rounded-2xl space-y-3 font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Valor da Mensalidade:</span>
            <span className="text-base font-black text-emerald-400">
              R$ {formatCurrency(valorMensalidade)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Data Limite:</span>
            <span className="text-rose-400 font-bold">
              {licencaStatus.dataVencimentoFormatada} (23:59)
            </span>
          </div>

          {/* Dados PIX */}
          <div className="pt-3 border-t border-[#1e2536] space-y-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">
              Chave PIX Oficial para Pagamento:
            </span>
            <div className="flex items-center justify-between bg-[#141824] border border-[#2b354a] px-3 py-2 rounded-xl text-xs">
              <span className="text-amber-400 font-bold tracking-wider">{chavePix}</span>
              <button
                type="button"
                onClick={handleCopyPix}
                className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-0.5 bg-blue-950/60 border border-blue-800 rounded-md transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Botão de WhatsApp */}
        <button
          type="button"
          onClick={handleEnviarWhatsapp}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
        >
          <Send size={16} />
          <span>Enviar Comprovante via WhatsApp</span>
        </button>

        <p className="text-[10px] text-slate-500 font-mono text-center">
          Suporte Mezzold: +55 54 9713-1399
        </p>

      </div>
    </div>
  );
}
