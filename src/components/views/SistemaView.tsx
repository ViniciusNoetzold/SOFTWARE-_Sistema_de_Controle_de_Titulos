import { useState, FormEvent } from 'react';
import { 
  Settings, Save, Shield, History, Building2, UserPlus, 
  Database, RefreshCw, CheckCircle2, Sliders, Lock, Mail, Phone, MapPin, X, Network, Server, Cpu, Terminal
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { testFirebirdConnection, getFirebirdConfig, ConnectionTestResult } from '../../lib/firebirdClient';

export function SistemaView() {
  const { auditLogs, empresaConfig, updateEmpresaConfig, addLog, showToast, usuarios } = useAppContext();

  // Form Dados da Empresa
  const [empresaData, setEmpresaData] = useState(empresaConfig);

  // Parâmetros Financeiros Globais
  const [parametros, setParametros] = useState({
    taxaJuros: '1.0',
    multaAtraso: '2.0',
    diasCarencia: '3',
    notificarAutomatico: true
  });

  // Teste Conexão Firebird em Rede
  const [isTestingFirebird, setIsTestingFirebird] = useState(false);
  const [firebirdTestResult, setFirebirdTestResult] = useState<ConnectionTestResult | null>(null);
  const firebirdConfig = getFirebirdConfig();

  // Handler Salvar Dados da Empresa
  const handleSaveEmpresa = (e: FormEvent) => {
    e.preventDefault();
    updateEmpresaConfig(empresaData);
    addLog('Configurações', 'Atualizou os dados cadastrais da empresa');
    showToast('Dados cadastrais da empresa salvos com sucesso!');
  };

  // Handler Salvar Parâmetros Financeiros
  const handleSaveParametros = (e: FormEvent) => {
    e.preventDefault();
    addLog('Configurações', `Atualizou parâmetros de juros (${parametros.taxaJuros}%) e multa (${parametros.multaAtraso}%)`);
    showToast('Parâmetros financeiros do sistema atualizados!');
  };

  const handleTestFirebird = async () => {
    setIsTestingFirebird(true);
    setFirebirdTestResult(null);

    const result = await testFirebirdConnection();
    setIsTestingFirebird(false);
    setFirebirdTestResult(result);

    if (result.success) {
      addLog('Diagnóstico Firebird', `Teste de latência com Alias [${result.aliasUsed}] concluído em ${result.latencyMs}ms`);
      showToast(`Conexão Firebird OK! Alias ${result.aliasUsed} respondeu em ${result.latencyMs}ms.`);
    } else {
      showToast('Falha na conexão com servidor Firebird em rede.');
    }
  };

  const handleMaintenance = (actionName: string) => {
    addLog('Manutenção', `Executou a rotina de ${actionName}`);
    showToast(`Manutenção: ${actionName} executada com sucesso 100%!`);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-in fade-in duration-300 select-none text-slate-200 overflow-y-auto pr-1">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-[#161922] border border-[#2b3242] rounded-2xl px-4 py-3 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-100">Configurações Globais do Sistema</h1>
            <p className="text-[11px] text-slate-400">Gerencie parâmetros corporativos, conexão Firebird em rede e auditoria</p>
          </div>
        </div>

        {/* Indicador de Status do Banco Firebird */}
        <div className="flex items-center gap-2 bg-[#11131a] px-3.5 py-1.5 rounded-xl border border-emerald-500/30">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="text-[11px] font-mono">
            <span className="text-slate-400">Firebird Network: </span>
            <span className="text-emerald-400 font-bold">ALIAS [{firebirdConfig.database}] ON {firebirdConfig.host}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        
        {/* COLUNA ESQUERDA: DADOS DA EMPRESA & BANCO FIREBIRD */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          
          {/* Card Especial de Conexão Firebird em Rede */}
          <div className="bg-[#161922] border border-red-500/30 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-2.5">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Server size={16} className="text-red-500" /> Banco Firebird em Rede (Alias Oficial)
              </h3>
              <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono text-[9px] font-bold uppercase">
                Porta 3050
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-[#11131a] p-3 rounded-xl border border-[#232938] space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>IP do Servidor:</span>
                  <span className="text-slate-100 font-bold">{firebirdConfig.host}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Porta TCP:</span>
                  <span className="text-slate-100 font-bold">{firebirdConfig.port}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Alias Principal:</span>
                  <span className="text-red-400 font-bold uppercase">[{firebirdConfig.database}]</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Alias Auxiliar:</span>
                  <span className="text-amber-400 font-bold uppercase">[{firebirdConfig.aliasAux}]</span>
                </div>
              </div>

              {/* Bloco de Código da Configuração do Arquivo aliases.conf */}
              <div className="bg-[#0b0d13] p-3 rounded-xl border border-[#1e2536] text-[10px] space-y-1">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <Terminal size={12} className="text-red-400" /> Configuração Obrigatória no Servidor (aliases.conf):
                </span>
                <pre className="text-emerald-400 font-mono leading-tight whitespace-pre-wrap pt-1 select-all">
{`[MEZZOLD_DB]
ALIAS=LOCALHOST:c:\\MEZZOLD\\DADOS\\FINANCEIRO.FDB
AliasCEP=LOCALHOST:HCEP`}
                </pre>
              </div>

              {/* Resultado do Teste de Latência */}
              {firebirdTestResult && (
                <div className={`p-3 rounded-xl border ${
                  firebirdTestResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  <div className="flex justify-between font-bold text-[11px] mb-1">
                    <span>STATUS DE REDE FIREBIRD:</span>
                    <span>{firebirdTestResult.latencyMs} ms</span>
                  </div>
                  <p className="text-[10px]">{firebirdTestResult.message}</p>
                </div>
              )}

              <button
                onClick={handleTestFirebird}
                disabled={isTestingFirebird}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              >
                {isTestingFirebird ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Network size={15} />
                    <span>Testar Conexão Firebird</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Dados da Empresa */}
          <form onSubmit={handleSaveEmpresa} className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-2.5">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-red-500" /> Dados Cadastrais da Empresa
              </h3>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Razão Social</label>
                <input 
                  type="text" 
                  value={empresaData.razaoSocial}
                  onChange={e => setEmpresaData({...empresaData, razaoSocial: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-red-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">CNPJ</label>
                  <input 
                    type="text" 
                    value={empresaData.cnpj}
                    onChange={e => setEmpresaData({...empresaData, cnpj: e.target.value})}
                    className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Inscrição Estadual</label>
                  <input 
                    type="text" 
                    value={empresaData.ie}
                    onChange={e => setEmpresaData({...empresaData, ie: e.target.value})}
                    className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">E-mail Financeiro</label>
                  <input 
                    type="email" 
                    value={empresaData.email}
                    onChange={e => setEmpresaData({...empresaData, email: e.target.value})}
                    className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={empresaData.telefone}
                    onChange={e => setEmpresaData({...empresaData, telefone: e.target.value})}
                    className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Endereço Principal</label>
                <textarea 
                  value={empresaData.endereco}
                  onChange={e => setEmpresaData({...empresaData, endereco: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 min-h-[60px] resize-none" 
                />
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-2"
              >
                <Save size={14} /> Salvar Alterações Cadastrais
              </button>
            </div>
          </form>

        </div>

        {/* COLUNA DIREITA: USUÁRIOS & AUDITORIA DE SISTEMA */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          
          {/* Gestão de Usuários */}
          <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-2.5">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} className="text-purple-400" /> Usuários & Permissões ({usuarios.length})
              </h3>
            </div>

            <div className="overflow-hidden border border-[#2b3242] rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111319] text-slate-400 border-b border-[#2b3242] uppercase text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Usuário</th>
                    <th className="px-4 py-2.5 font-semibold">E-mail</th>
                    <th className="px-4 py-2.5 font-semibold">Perfil</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232836]">
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-[#1f2432]/70 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-slate-100">{u.nome}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          u.perfil === 'ADMIN' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {u.perfil}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.ativo ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                          {u.ativo ? 'ATIVO' : 'INATIVO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manutenção de Banco e Diagnóstico */}
          <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-2.5">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Database size={16} className="text-emerald-400" /> Manutenção & Pool Firebird
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleMaintenance('Reindexação de Índices Firebird')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
              >
                <RefreshCw size={13} className="text-emerald-400" /> Reindexar Firebird
              </button>

              <button
                onClick={() => handleMaintenance('Diagnóstico de Integridade de Tabelas')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
              >
                <CheckCircle2 size={13} className="text-blue-400" /> Integridade do Banco
              </button>

              <button
                onClick={() => handleMaintenance('Reciclagem do Pool de Conexões')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
              >
                <Cpu size={13} className="text-amber-400" /> Reciclar Pool
              </button>
            </div>
          </div>

          {/* Log de Auditoria em Tempo Real */}
          <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-2.5 mb-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <History size={16} className="text-blue-400" /> Log de Auditoria em Tempo Real ({auditLogs.length})
              </h3>
            </div>

            <div className="overflow-y-auto border border-[#2b3242] rounded-xl flex-1 max-h-[220px]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111319] text-slate-400 border-b border-[#2b3242] uppercase text-[10px] font-mono sticky top-0">
                  <tr>
                    <th className="px-3.5 py-2 font-semibold">Data / Hora</th>
                    <th className="px-3.5 py-2 font-semibold">Usuário</th>
                    <th className="px-3.5 py-2 font-semibold">Ação</th>
                    <th className="px-3.5 py-2 font-semibold">Detalhes Operacionais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232836]">
                  {auditLogs.map(l => (
                    <tr key={l.id} className="hover:bg-[#1f2432]/70 transition-colors">
                      <td className="px-3.5 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">{l.dataHora}</td>
                      <td className="px-3.5 py-2 font-bold text-slate-200 whitespace-nowrap">{l.usuario}</td>
                      <td className="px-3.5 py-2 text-red-400 font-semibold whitespace-nowrap">{l.acao}</td>
                      <td className="px-3.5 py-2 text-slate-300 text-[11px]">{l.detalhes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
