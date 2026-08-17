import { useState } from 'react';
import { 
  X, FileSpreadsheet, Printer, Download, CheckCircle2, 
  FileText, Building2, Calendar, DollarSign, Layers, ArrowRight
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../lib/utils';

export function BorderoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { titulos, entidades, empresaConfig, showToast } = useAppContext();

  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [formatoSaida, setFormatoSaida] = useState<'TELA' | 'IMPRESSORA' | 'PDF'>('TELA');
  const [observacoes, setObservacoes] = useState('');
  const [isVisualizandoDoc, setIsVisualizandoDoc] = useState(false);

  if (!isOpen) return null;

  // Filtra apenas os títulos a RECEBER que estão em aberto para cobrança/borderô
  const titulosReceberEmAberto = titulos
    .filter(t => t.tipo_titulo === 'RECEBER' && t.status !== 'PAGO')
    .map(t => {
      const ent = entidades.find(e => e.id === t.id_entidade);
      return {
        id: t.id,
        cliente: ent ? ent.nome : 'Cliente Desconhecido',
        documentoCliente: ent ? ent.documento : '',
        telefoneCliente: ent ? ent.telefone : '',
        numero: t.numero_documento,
        vencimento: t.data_vencimento,
        valor: t.saldo_devedor || t.valor_original
      };
    });

  const handleToggle = (id: string) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleAll = () => {
    if (selecionados.length === titulosReceberEmAberto.length) {
      setSelecionados([]);
    } else {
      setSelecionados(titulosReceberEmAberto.map(t => t.id));
    }
  };

  const titulosMarcados = titulosReceberEmAberto.filter(t => selecionados.includes(t.id));
  const totalBorderô = titulosMarcados.reduce((acc, t) => acc + t.valor, 0);

  const handleGerar = () => {
    if (selecionados.length === 0) {
      showToast('Selecione ao menos um título da lista para gerar o Borderô.');
      return;
    }

    if (formatoSaida === 'IMPRESSORA' || formatoSaida === 'PDF') {
      setIsVisualizandoDoc(true);
      setTimeout(() => {
        window.print();
      }, 400);
    } else {
      setIsVisualizandoDoc(true);
    }
  };

  const handleImprimirDireto = () => {
    window.print();
  };

  const numeroBorderoGerado = `BOR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
  const dataEmissao = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none font-sans text-slate-200">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md no-print" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#141722] border border-[#2b3242] rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-[#252b3b] flex items-center justify-between bg-[#10131c] shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 shadow-md">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>{isVisualizandoDoc ? 'Documento Oficial de Borderô de Cobrança' : 'Gerador de Borderô de Cobrança'}</span>
                <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-mono font-bold">A4 & TELA</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {isVisualizandoDoc ? 'Visualize a relação formal timbrada pronta para impressão ou cobrança' : 'Selecione os títulos que deseja agrupar na mesma remessa de cobrança'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1.5 font-mono text-sm">
            ✕
          </button>
        </div>

        {/* =========================================================================
            TELA 1: SELEÇÃO DE TÍTULOS (SE NÃO ESTIVER VISUALIZANDO O DOCUMENTO)
            ========================================================================= */}
        {!isVisualizandoDoc ? (
          <>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* Barra de resumo da seleção */}
              <div className="flex items-center justify-between p-3.5 bg-[#10131c] rounded-2xl border border-[#232938] font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Selecionados:</span>
                  <span className="text-slate-100 font-bold bg-[#1a1f2d] px-2 py-0.5 rounded border border-[#2b3548]">
                    {selecionados.length} de {titulosReceberEmAberto.length} títulos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Total do Borderô:</span>
                  <span className="text-emerald-400 font-bold text-sm bg-emerald-950/40 px-3 py-0.5 rounded-xl border border-emerald-500/30">
                    {formatCurrency(totalBorderô)}
                  </span>
                </div>
              </div>

              {/* Tabela de Títulos Pendentes */}
              <div className="border border-[#252b3b] rounded-2xl overflow-hidden bg-[#10131c]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0e14] text-slate-400 border-b border-[#252b3b] uppercase text-[10px] font-mono sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">
                        <input 
                          type="checkbox" 
                          checked={selecionados.length === titulosReceberEmAberto.length && titulosReceberEmAberto.length > 0} 
                          onChange={handleToggleAll} 
                          className="w-4 h-4 rounded border-slate-700 bg-[#161922] text-red-600 focus:ring-red-500 cursor-pointer" 
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">Cliente / Devedor</th>
                      <th className="px-4 py-3 font-semibold">Nº Título / NF</th>
                      <th className="px-4 py-3 font-semibold text-center">Vencimento</th>
                      <th className="px-4 py-3 font-semibold text-right">Valor Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2330]">
                    {titulosReceberEmAberto.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-mono">
                          Nenhum título a receber em aberto encontrado no momento.
                        </td>
                      </tr>
                    ) : (
                      titulosReceberEmAberto.map(t => (
                        <tr 
                          key={t.id} 
                          className={`hover:bg-[#181d2a] transition-colors cursor-pointer ${
                            selecionados.includes(t.id) ? 'bg-[#181c28]' : ''
                          }`} 
                          onClick={() => handleToggle(t.id)}
                        >
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={selecionados.includes(t.id)} 
                              onChange={() => handleToggle(t.id)} 
                              className="w-4 h-4 rounded border-slate-700 bg-[#161922] text-red-600 focus:ring-red-500 cursor-pointer" 
                            />
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-100">
                            <div>{t.cliente}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{t.documentoCliente}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-red-400 font-bold">{t.numero}</td>
                          <td className="px-4 py-3 font-mono text-center text-slate-300">{formatDateBR(t.vencimento)}</td>
                          <td className="px-4 py-3 font-mono text-right text-emerald-400 font-bold">{formatCurrency(t.valor)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer com Opções */}
            <div className="px-6 py-4 border-t border-[#252b3b] bg-[#10131c] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-full sm:w-48">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Formato de Saída</label>
                  <select 
                    value={formatoSaida}
                    onChange={e => setFormatoSaida(e.target.value as any)}
                    className="w-full bg-[#161922] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500 cursor-pointer font-bold"
                  >
                    <option value="TELA">Visualizar na Tela (A4)</option>
                    <option value="IMPRESSORA">Enviar para Impressora</option>
                    <option value="PDF">Salvar em PDF / Arquivo</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Observações da Remessa</label>
                  <input 
                    type="text" 
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Instruções de cobrança, banco ou custódia..." 
                    className="w-full bg-[#161922] border border-[#2b3242] rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="px-4 py-2.5 text-xs font-bold text-slate-300 bg-[#1a1f2d] hover:bg-[#252c3f] rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleGerar} 
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.35)] flex items-center gap-2"
                >
                  <FileSpreadsheet size={15} />
                  <span>Gerar Borderô</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* =========================================================================
             TELA 2: VISUALIZAÇÃO A4 OFICIAL DO BORDERÔ (DOCUMENTO GERADO)
             ========================================================================= */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0e14]">
            
            {/* Toolbar Superior da Visualização */}
            <div className="p-3.5 bg-[#161922] border-b border-[#252b3b] flex items-center justify-between no-print shrink-0">
              <button
                type="button"
                onClick={() => setIsVisualizandoDoc(false)}
                className="text-xs font-bold text-slate-300 hover:text-white bg-[#11131a] px-3.5 py-1.5 rounded-xl border border-[#2b3242] transition-colors"
              >
                ← Voltar à Seleção
              </button>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">Borderô: <b className="text-slate-100">{numeroBorderoGerado}</b></span>
                <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
                  Total: {formatCurrency(totalBorderô)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleImprimirDireto}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>

            {/* Documento A4 Timbrado */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-900/40">
              
              <div className="printable-report-a4 bg-white text-slate-900 p-8 rounded-xl shadow-2xl w-full max-w-[800px] font-sans text-xs border border-slate-300 min-h-[900px] flex flex-col justify-between">
                
                <div>
                  {/* Cabeçalho Oficial com Dados da Empresa */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-5 flex justify-between items-start">
                    <div>
                      <h1 className="text-base font-black uppercase text-slate-900 tracking-wide">
                        {empresaConfig.razaoSocial || 'EMPRESA EXECUTIVA DE GESTÃO FINANCEIRA'}
                      </h1>
                      <p className="text-[11px] font-bold text-slate-700">
                        {empresaConfig.nomeFantasia}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono mt-1">
                        CNPJ: {empresaConfig.cnpj || '00.000.000/0001-00'} | IE: {empresaConfig.ie || 'ISENTO'}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {empresaConfig.endereco || 'Endereço Comercial da Empresa'}
                      </p>
                    </div>

                    <div className="text-right font-mono text-[10px] bg-slate-100 p-2.5 rounded border border-slate-300">
                      <p className="font-bold text-red-700 text-xs">{numeroBorderoGerado}</p>
                      <p className="text-slate-600 mt-0.5">Emissão: {dataEmissao}</p>
                      <p className="text-slate-600">Títulos: {titulosMarcados.length}</p>
                    </div>
                  </div>

                  {/* Título do Documento */}
                  <div className="text-center bg-slate-900 text-white py-1.5 px-4 rounded mb-5 font-black uppercase tracking-wider text-xs">
                    BORDERÔ DE REMESSA & COBRANÇA DE TÍTULOS
                  </div>

                  {observacoes && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded mb-4 text-[10px] font-mono">
                      <b className="text-amber-900 uppercase">Instruções / Observações:</b>
                      <p className="text-amber-800 mt-0.5">{observacoes}</p>
                    </div>
                  )}

                  {/* Tabela de Títulos Inclusos */}
                  <table className="w-full text-left text-[11px] border-collapse border border-slate-300 mb-6">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Item</th>
                        <th className="p-2 border-r border-slate-300">Devedor / Sacado</th>
                        <th className="p-2 border-r border-slate-300">Documento / CPF</th>
                        <th className="p-2 border-r border-slate-300">Nº Título</th>
                        <th className="p-2 border-r border-slate-300 text-center">Vencimento</th>
                        <th className="p-2 text-right">Valor Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {titulosMarcados.map((t, index) => (
                        <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2 font-mono text-center border-r border-slate-300">{index + 1}</td>
                          <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{t.cliente}</td>
                          <td className="p-2 font-mono text-slate-600 border-r border-slate-300">{t.documentoCliente || '-'}</td>
                          <td className="p-2 font-mono font-bold text-slate-800 border-r border-slate-300">{t.numero}</td>
                          <td className="p-2 font-mono text-center border-r border-slate-300">{formatDateBR(t.vencimento)}</td>
                          <td className="p-2 font-mono text-right font-bold text-slate-900">{formatCurrency(t.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                      <tr>
                        <td colSpan={5} className="p-2.5 text-right uppercase text-[10px] border-r border-slate-300">
                          Total Geral do Borderô:
                        </td>
                        <td className="p-2.5 text-right font-mono text-xs text-red-700">
                          {formatCurrency(totalBorderô)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Instrução de PIX da Empresa */}
                  {empresaConfig.chavePix && (
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded mb-6 text-[10px] font-mono">
                      <p className="font-bold text-slate-900 uppercase">Conta para Depósito / Liquidação:</p>
                      <p><b>Chave PIX:</b> {empresaConfig.chavePix}</p>
                      <p><b>Favorecido:</b> {empresaConfig.favorecidoPix || empresaConfig.razaoSocial}</p>
                    </div>
                  )}
                </div>

                {/* Termo de Envio e Assinaturas */}
                <div className="pt-6 border-t border-slate-300 mt-auto">
                  <p className="text-[9px] text-slate-500 text-center mb-8 font-mono">
                    Declaramos para os devidos fins a entrega e o encaminhamento da relação de títulos acima descrita para cobrança.
                  </p>

                  <div className="grid grid-cols-2 gap-12 text-center text-[10px]">
                    <div>
                      <div className="border-t border-slate-900 pt-1.5 font-bold uppercase text-slate-900">
                        {empresaConfig.razaoSocial || 'Responsável Financeiro'}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">Emitente / Cedente</div>
                    </div>

                    <div>
                      <div className="border-t border-slate-900 pt-1.5 font-bold uppercase text-slate-900">
                        Agente Cobrador / Instituição
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">Protocolo de Recebimento</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
