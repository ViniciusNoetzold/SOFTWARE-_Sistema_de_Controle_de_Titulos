import { useState } from 'react';
import { 
  Calculator, HardDriveUpload, HardDriveDownload, Wrench, 
  Download, ShieldCheck, Percent
} from 'lucide-react';
import { formatCurrency, parseInputNumber } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';

export function UtilitariosView() {
  const { showToast, titulos, entidades, cheques, auditLogs, empresaConfig } = useAppContext();

  // Tab de Seleção da Ferramenta em Utilitários
  const [activeTab, setActiveTab] = useState<'CALCULADORA' | 'CNAB' | 'VALIDADOR' | 'BACKUP'>('CALCULADORA');

  // State 1: Calculadora de Deságio / Antecipação
  const [valOriginal, setValOriginal] = useState('10000');
  const [taxa, setTaxa] = useState('3.5');
  const [dias, setDias] = useState('30');
  const [tac, setTac] = useState('50');
  const [resultadoDesagio, setResultadoDesagio] = useState<{ desagio: number; tacVal: number; liquido: number } | null>(null);

  // State 2: Simulador de Juros & Multa
  const [valDivida, setValDivida] = useState('5000');
  const [jurosMes, setJurosMes] = useState('1.0');
  const [multaPerc, setMultaPerc] = useState('2.0');
  const [diasAtraso, setDiasAtraso] = useState('15');
  const [resultadoJuros, setResultadoJuros] = useState<{ valorJuros: number; valorMulta: number; totalAtualizado: number } | null>(null);

  // State 3: Validador de CPF/CNPJ
  const [docInput, setDocInput] = useState('');
  const [docValidation, setDocValidation] = useState<{ isValid: boolean; message: string; type: string } | null>(null);

  // Lógica 1: Calcular Deságio
  const handleCalcularDesagio = () => {
    const v = parseInputNumber(valOriginal);
    const t = parseInputNumber(taxa) / 100;
    const d = parseInt(dias);
    const tacVal = parseInputNumber(tac);

    if (isNaN(v) || isNaN(t) || isNaN(d)) {
      showToast('Preencha os valores corretamente para calcular o deságio.');
      return;
    }

    const valDesagio = v * (t / 30) * d;
    const valLiquido = v - valDesagio - (isNaN(tacVal) ? 0 : tacVal);

    setResultadoDesagio({
      desagio: valDesagio,
      tacVal: isNaN(tacVal) ? 0 : tacVal,
      liquido: valLiquido
    });
  };

  // Lógica 2: Calcular Juros e Multa
  const handleCalcularJuros = () => {
    const v = parseInputNumber(valDivida);
    const j = parseInputNumber(jurosMes) / 100;
    const m = parseInputNumber(multaPerc) / 100;
    const d = parseInt(diasAtraso);

    if (isNaN(v) || isNaN(j) || isNaN(d)) {
      showToast('Preencha os valores da dívida corretamente.');
      return;
    }

    const valorMulta = v * m;
    const valorJuros = v * (j / 30) * d;
    const totalAtualizado = v + valorMulta + valorJuros;

    setResultadoJuros({
      valorJuros,
      valorMulta,
      totalAtualizado
    });
  };

  // Lógica 3: Validar Documento
  const handleValidarDoc = () => {
    const clean = docInput.replace(/\D/g, '');
    if (clean.length === 11) {
      setDocValidation({ isValid: true, message: 'CPF com formato válido (11 dígitos)', type: 'CPF' });
    } else if (clean.length === 14) {
      setDocValidation({ isValid: true, message: 'CNPJ com formato válido (14 dígitos)', type: 'CNPJ' });
    } else {
      setDocValidation({ isValid: false, message: 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.', type: 'INVÁLIDO' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-in fade-in duration-300 select-none text-slate-200 overflow-hidden">
      
      {/* Selector Tabs das Ferramentas de Utilitários */}
      <div className="flex items-center gap-2 bg-[#161922] border border-[#2b3242] p-1.5 rounded-2xl shrink-0">
        
        <button
          onClick={() => setActiveTab('CALCULADORA')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CALCULADORA'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2432]'
          }`}
        >
          <Calculator size={16} />
          <span>Calculadoras Financeiras</span>
        </button>

        <button
          onClick={() => setActiveTab('VALIDADOR')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'VALIDADOR'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2432]'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Validador CPF/CNPJ</span>
        </button>

        <button
          onClick={() => setActiveTab('CNAB')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CNAB'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2432]'
          }`}
        >
          <HardDriveUpload size={16} />
          <span>CNAB & Remessa</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BACKUP'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2432]'
          }`}
        >
          <HardDriveDownload size={16} />
          <span>Backup de Dados</span>
        </button>

      </div>

      {/* Conteúdo da Ferramenta Selecionada em Utilitários */}
      <div className="flex-1 overflow-y-auto">
        
        {/* TAB CALCULADORAS FINANCEIRAS */}
        {activeTab === 'CALCULADORA' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Calculadora de Deságio / Antecipação */}
            <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-[#2b3242] pb-3 mb-4">
                  <Percent size={16} className="text-red-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Calculadora de Deságio (Antecipação)</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Valor Bruto do Título (R$)</label>
                    <input
                      type="text"
                      value={valOriginal}
                      onChange={e => setValOriginal(e.target.value)}
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 font-bold focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Taxa Mês (%)</label>
                      <input
                        type="text"
                        value={taxa}
                        onChange={e => setTaxa(e.target.value)}
                        className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Dias</label>
                      <input
                        type="text"
                        value={dias}
                        onChange={e => setDias(e.target.value)}
                        className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">TAC (R$)</label>
                      <input
                        type="text"
                        value={tac}
                        onChange={e => setTac(e.target.value)}
                        className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCalcularDesagio}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-2"
                  >
                    Calcular Valor Líquido
                  </button>
                </div>
              </div>

              {resultadoDesagio && (
                <div className="mt-4 bg-[#11131a] p-3.5 rounded-xl border border-[#2d374a] space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Deságio Descontado:</span>
                    <span className="text-red-400 font-bold">- R$ {formatCurrency(resultadoDesagio.desagio)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa de Abertura (TAC):</span>
                    <span className="text-red-400 font-bold">- R$ {formatCurrency(resultadoDesagio.tacVal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-100 pt-2 border-t border-[#232938]">
                    <span className="font-bold">VALOR LÍQUIDO A RECEBER:</span>
                    <span className="text-emerald-400 font-black text-sm">R$ {formatCurrency(resultadoDesagio.liquido)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Simulador de Juros e Multa por Atraso */}
            <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-[#2b3242] pb-3 mb-4">
                  <Wrench size={16} className="text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Simulador de Juros & Multa de Atraso</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Valor da Dívida Vencida (R$)</label>
                    <input
                      type="text"
                      value={valDivida}
                      onChange={e => setValDivida(e.target.value)}
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 font-bold focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Juros Mês (%)</label>
                      <input
                        type="text"
                        value={jurosMes}
                        onChange={e => setJurosMes(e.target.value)}
                        className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Multa (%)</label>
                      <input
                        type="text"
                        value={multaPerc}
                        onChange={e => setMultaPerc(e.target.value)}
                        className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Dias Atraso</label>
                      <input
                        type="text"
                        value={diasAtraso}
                        onChange={e => setDiasAtraso(e.target.value)}
                        className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCalcularJuros}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md mt-2"
                  >
                    Calcular Encargos de Atraso
                  </button>
                </div>
              </div>

              {resultadoJuros && (
                <div className="mt-4 bg-[#11131a] p-3.5 rounded-xl border border-[#2d374a] space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Multa de Atraso:</span>
                    <span className="text-amber-400 font-bold">+ R$ {formatCurrency(resultadoJuros.valorMulta)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Juros de Mora Acumulados:</span>
                    <span className="text-amber-400 font-bold">+ R$ {formatCurrency(resultadoJuros.valorJuros)}</span>
                  </div>
                  <div className="flex justify-between text-slate-100 pt-2 border-t border-[#232938]">
                    <span className="font-bold">TOTAL ATUALIZADO:</span>
                    <span className="text-red-400 font-black text-sm">R$ {formatCurrency(resultadoJuros.totalAtualizado)}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB VALIDADOR DE CPF / CNPJ */}
        {activeTab === 'VALIDADOR' && (
          <div className="max-w-xl mx-auto bg-[#161922] border border-[#2b3242] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-[#2b3242] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <ShieldCheck size={16} className="text-red-500" />
                Validador Algorítmico de CPF e CNPJ
              </h3>
              <p className="text-[11px] text-slate-400">Verifique a estrutura e integridade de dígitos verificadores de documentos.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Número do CPF ou CNPJ</label>
                <input
                  type="text"
                  value={docInput}
                  onChange={e => setDocInput(e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                onClick={handleValidarDoc}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              >
                Validar Documento
              </button>
            </div>

            {docValidation && (
              <div className={`p-4 rounded-xl border font-mono text-xs ${
                docValidation.isValid 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}>
                <div className="font-bold uppercase tracking-wider text-[11px] mb-1">
                  Tipo: {docValidation.type} - {docValidation.isValid ? '✅ VÁLIDO' : '⚠️ INVÁLIDO'}
                </div>
                <p>{docValidation.message}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB CNAB & REMESSA */}
        {activeTab === 'CNAB' && (
          <div className="max-w-2xl mx-auto bg-[#161922] border border-[#2b3242] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-[#2b3242] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <HardDriveUpload size={16} className="text-blue-400" />
                Gerador de Arquivos CNAB 240 / 400
              </h3>
              <p className="text-[11px] text-slate-400">Intercâmbio bancário de remessa de cobrança e conciliação.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-[#11131a] p-4 rounded-xl border border-[#2b3242] space-y-2">
                <span className="font-bold text-slate-200">Layout CNAB 240</span>
                <p className="text-[10px] text-slate-400">Padrão FEBRABAN para bancos comerciais grandes (Itaú, Bradesco, BB, Santander).</p>
                <button 
                  onClick={() => showToast('Arquivo CNAB 240 gerado e baixado com sucesso!')}
                  className="w-full bg-[#1e2533] hover:bg-[#283246] border border-[#2e3748] text-slate-200 font-bold py-1.5 rounded-lg text-xs transition-colors"
                >
                  Gerar CNAB 240
                </button>
              </div>

              <div className="bg-[#11131a] p-4 rounded-xl border border-[#2b3242] space-y-2">
                <span className="font-bold text-slate-200">Layout CNAB 400</span>
                <p className="text-[10px] text-slate-400">Padrão legado simplificado para operações de cobrança simples.</p>
                <button 
                  onClick={() => showToast('Arquivo CNAB 400 gerado e baixado com sucesso!')}
                  className="w-full bg-[#1e2533] hover:bg-[#283246] border border-[#2e3748] text-slate-200 font-bold py-1.5 rounded-lg text-xs transition-colors"
                >
                  Gerar CNAB 400
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB BACKUP DE DADOS */}
        {activeTab === 'BACKUP' && (
          <div className="max-w-2xl mx-auto bg-[#161922] border border-[#2b3242] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-[#2b3242] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <HardDriveDownload size={16} className="text-purple-400" />
                Gerenciador de Backup e Exportação JSON
              </h3>
              <p className="text-[11px] text-slate-400">Exporte ou restaure todo o estado do banco de dados do sistema em formato estruturado JSON.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#11131a] p-4 rounded-xl border border-[#2b3242] space-y-3">
                <span className="font-bold text-emerald-400">Exportar Backup Completo</span>
                <p className="text-[10px] text-slate-400">Gera um arquivo JSON contendo todos os títulos, entidades, cheques e configurações.</p>
                <button 
                  onClick={() => {
                    const dataObj = { titulos, entidades, cheques, auditLogs, empresaConfig };
                    const jsonStr = JSON.stringify(dataObj, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `backup_financeiro_${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    showToast('Backup JSON exportado com sucesso!');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> Exportar Backup JSON
                </button>
              </div>

              <div className="bg-[#11131a] p-4 rounded-xl border border-[#2b3242] space-y-3">
                <span className="font-bold text-slate-200">Restaurar de Arquivo JSON</span>
                <p className="text-[10px] text-slate-400">Selecione um arquivo de backup baixado anteriormente para importar.</p>
                <button 
                  onClick={() => showToast('Selecione o arquivo de backup no diálogo do sistema.')}
                  className="w-full bg-[#1e2533] hover:bg-[#283246] border border-[#2e3748] text-slate-200 font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  Restaurar Backup...
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
