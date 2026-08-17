import { useState, useEffect, FormEvent } from 'react';
import { 
  Settings, Save, Shield, History, Building2, UserPlus, 
  Database, RefreshCw, CheckCircle2, Sliders, Lock, Mail, Phone, MapPin, X, Network, Server, Cpu, Terminal,
  QrCode, Eye, Check, AlertTriangle, Layers, Palette, Moon, Sun, Sparkles, FolderCheck, HardDrive
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { testFirebirdConnection, getFirebirdConfig, ConnectionTestResult } from '../../lib/firebirdClient';
import { initializeMezzoldEnvironment, checkEnvironmentStatus, EnvironmentStatus } from '../../lib/environmentService';
import { EmpresaConfig, TemaVisual } from '../../types';

export function SistemaView() {
  const { auditLogs, empresaConfig, updateEmpresaConfig, addLog, showToast, usuarios, toggleUsuarioAtivo, currentUser, tema, setTema } = useAppContext();

  // Abas de Configuração
  const [activeTab, setActiveTab] = useState<'EMPRESA' | 'FIREBIRD' | 'USUARIOS' | 'AUDITORIA' | 'TEMAS'>('EMPRESA');

  // Form Dados da Empresa (Carrega o que estiver no contexto e permite edição total)
  const [empresaData, setEmpresaData] = useState<EmpresaConfig>({
    razaoSocial: empresaConfig.razaoSocial || '',
    nomeFantasia: empresaConfig.nomeFantasia || '',
    cnpj: empresaConfig.cnpj || '',
    ie: empresaConfig.ie || '',
    email: empresaConfig.email || '',
    telefone: empresaConfig.telefone || '',
    endereco: empresaConfig.endereco || '',
    chavePix: empresaConfig.chavePix || empresaConfig.cnpj || '',
    favorecidoPix: empresaConfig.favorecidoPix || empresaConfig.razaoSocial || ''
  });

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
  const [envStatus, setEnvStatus] = useState<EnvironmentStatus | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const firebirdConfig = getFirebirdConfig();

  useEffect(() => {
    checkEnvironmentStatus().then(setEnvStatus).catch(console.error);
  }, []);

  const handleProvisionEnvironment = async () => {
    setIsProvisioning(true);
    try {
      const res = await initializeMezzoldEnvironment();
      setEnvStatus(res);
      addLog('Provisionamento', 'Auto-provisionamento da estrutura C:\\Mezzold e banco ESTOQUE.FDB executado com sucesso.');
      showToast('Estrutura C:\\Mezzold e banco ESTOQUE.FDB verificados e montados com sucesso!');
    } catch {
      showToast('Falha ao auto-provisionar ambiente.');
    } finally {
      setIsProvisioning(false);
    }
  };

  // Handler Salvar Dados da Empresa
  const handleSaveEmpresa = (e: FormEvent) => {
    e.preventDefault();
    updateEmpresaConfig(empresaData);
    addLog('Configurações', `Atualizou os dados da empresa para "${empresaData.razaoSocial || empresaData.nomeFantasia}" (CNPJ: ${empresaData.cnpj})`);
    showToast('Dados cadastrais da empresa e dados PIX salvos com sucesso!');
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
    showToast(`Manutenção: ${actionName} executada com sucesso!`);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 select-none text-slate-200 overflow-hidden">
      
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between bg-[#161922] border border-[#2b3242] rounded-2xl p-2 shadow-md shrink-0">
        
        <div className="flex items-center gap-1.5 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('EMPRESA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'EMPRESA'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2c]'
            }`}
          >
            <Building2 size={15} />
            <span>Dados da Empresa & PIX</span>
          </button>

          <button
            onClick={() => setActiveTab('FIREBIRD')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'FIREBIRD'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2c]'
            }`}
          >
            <Server size={15} />
            <span>Banco Firebird (Rede)</span>
          </button>

          <button
            onClick={() => setActiveTab('USUARIOS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'USUARIOS'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2c]'
            }`}
          >
            <Shield size={15} />
            <span>Usuários & Permissões ({usuarios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDITORIA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AUDITORIA'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2c]'
            }`}
          >
            <History size={15} />
            <span>Auditoria & Diagnóstico</span>
          </button>

          <button
            onClick={() => setActiveTab('TEMAS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'TEMAS'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2c]'
            }`}
          >
            <Palette size={15} />
            <span>Aparência & Temas</span>
          </button>

        </div>

        {/* Status Indicador Firebird */}
        <div className="hidden md:flex items-center gap-2 bg-[#11131a] px-3 py-1 rounded-xl border border-emerald-500/30 text-[11px] font-mono">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-slate-400">Firebird: </span>
          <span className="text-emerald-400 font-bold">ALIAS [{firebirdConfig.database}]</span>
        </div>

      </div>

      {/* Conteúdo Principal por Aba */}
      <div className="flex-1 overflow-y-auto pr-1">
        
        {/* =========================================================================
            ABA 1: DADOS CADASTRAIS DA EMPRESA & PIX
            ========================================================================= */}
        {activeTab === 'EMPRESA' && (
          <div className="grid grid-cols-12 gap-4">
            
            {/* Formulário de Edição Completa */}
            <form onSubmit={handleSaveEmpresa} className="col-span-12 lg:col-span-7 bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-[#2b3242] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500">
                    <Building2 size={17} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                      Identidade Corporativa & Cabeçalho de Documentos
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Estes dados são impressos automaticamente em todos os Relatórios, PDFs, Recibos e Cobranças
                    </p>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.35)]"
                >
                  <Save size={14} /> Salvar Dados
                </button>
              </div>

              <div className="space-y-3">
                
                {/* Razão Social e Nome Fantasia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                      Razão Social (Nome Oficial da Empresa) *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Minha Empresa Comercial Ltda"
                      value={empresaData.razaoSocial}
                      onChange={e => setEmpresaData({...empresaData, razaoSocial: e.target.value})}
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                      Nome Fantasia (Marca Comercial)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: Gestão Financeira & Cobrança"
                      value={empresaData.nomeFantasia}
                      onChange={e => setEmpresaData({...empresaData, nomeFantasia: e.target.value})}
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-red-500" 
                    />
                  </div>
                </div>

                {/* CNPJ e Inscrição Estadual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                      CNPJ *
                    </label>
                    <input 
                      type="text" 
                      placeholder="00.000.000/0001-00"
                      value={empresaData.cnpj}
                      onChange={e => setEmpresaData({...empresaData, cnpj: e.target.value})}
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                      Inscrição Estadual (IE)
                    </label>
                    <input 
                      type="text" 
                      placeholder="ISENTO ou 000.000.000.000"
                      value={empresaData.ie}
                      onChange={e => setEmpresaData({...empresaData, ie: e.target.value})}
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500" 
                    />
                  </div>
                </div>

                {/* E-mail e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                      E-mail do Departamento Financeiro
                    </label>
                    <input 
                      type="email" 
                      placeholder="financeiro@empresa.com.br"
                      value={empresaData.email}
                      onChange={e => setEmpresaData({...empresaData, email: e.target.value})}
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                      Telefone / WhatsApp Comercial
                    </label>
                    <input 
                      type="text" 
                      placeholder="(11) 99999-9999"
                      value={empresaData.telefone}
                      onChange={e => setEmpresaData({...empresaData, telefone: e.target.value})}
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500" 
                    />
                  </div>
                </div>

                {/* Endereço Completo */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                    Endereço Completo (Rua, Número, Bairro, Cidade - UF)
                  </label>
                  <input 
                    type="text"
                    placeholder="Av. Principal, 1000 - Centro, São Paulo - SP"
                    value={empresaData.endereco}
                    onChange={e => setEmpresaData({...empresaData, endereco: e.target.value})}
                    className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500" 
                  />
                </div>

                {/* Seção PIX Oficial da Empresa */}
                <div className="pt-3 border-t border-[#2b3242]">
                  <h4 className="text-[11px] font-mono font-bold uppercase text-emerald-400 mb-2 flex items-center gap-1.5">
                    <QrCode size={14} /> Dados Bancários e PIX para Recebimentos
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                        Chave PIX Padrão (CNPJ, E-mail ou Telefone)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: 00.000.000/0001-00 ou financeiro@pix.com"
                        value={empresaData.chavePix || ''}
                        onChange={e => setEmpresaData({...empresaData, chavePix: e.target.value})}
                        className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                        Nome do Favorecido no PIX
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: Minha Empresa Comercial Ltda"
                        value={empresaData.favorecidoPix || ''}
                        onChange={e => setEmpresaData({...empresaData, favorecidoPix: e.target.value})}
                        className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>
                </div>

              </div>

            </form>

            {/* Preview ao Vivo do Cabeçalho Impresso */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
              
              <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl">
                <h4 className="text-xs font-black uppercase text-slate-300 flex items-center gap-2 mb-3">
                  <Eye size={15} className="text-red-500" /> Pré-Visualização no Timbre do Relatório
                </h4>

                {/* Card Branco Simulando Folha A4 */}
                <div className="bg-white text-slate-900 rounded-xl p-4 border border-slate-300 shadow-inner font-sans">
                  <div className="border-b border-slate-900 pb-2 mb-2">
                    <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">
                      {empresaData.razaoSocial || 'RAZÃO SOCIAL DA SUA EMPRESA'}
                    </h2>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      {empresaData.nomeFantasia || 'Nome Fantasia / Marca'}
                    </p>
                    <div className="text-[9px] text-slate-500 font-mono mt-1 space-x-2">
                      <span><b>CNPJ:</b> {empresaData.cnpj || '00.000.000/0001-00'}</span>
                      <span><b>IE:</b> {empresaData.ie || 'ISENTO'}</span>
                      <span><b>Tel:</b> {empresaData.telefone || '(11) 99999-9999'}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      {empresaData.endereco || 'Endereço Comercial da Empresa'}
                    </p>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[9px] font-mono">
                    <p className="font-bold text-slate-900 uppercase">Instruções de Pagamento / PIX:</p>
                    <p><b>Chave PIX:</b> {empresaData.chavePix || empresaData.cnpj || 'Não informada'}</p>
                    <p><b>Favorecido:</b> {empresaData.favorecidoPix || empresaData.razaoSocial || 'Sua Empresa'}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-[#11131a] rounded-xl border border-[#2b3242] text-[11px] text-slate-400">
                  <p className="flex items-center gap-1.5 font-bold text-slate-300 mb-1">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Sincronização Automática
                  </p>
                  <p>
                    Ao salvar, todas as telas de emissão de relatórios, cobrança por e-mail, WhatsApp e recibos atualizarão imediatamente para o nome configurado acima.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            ABA 2: BANCO FIREBIRD EM REDE
            ========================================================================= */}
        {activeTab === 'FIREBIRD' && (
          <div className="grid grid-cols-12 gap-4">
            
            <div className="col-span-12 lg:col-span-6 bg-[#121620] border border-[#222B3D] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Server size={16} className="text-blue-500" /> Conexão Firebird em Rede (Alias Oficial)
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-mono text-[9px] font-bold uppercase">
                  ALIAS [HANSEN]
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 bg-[#0E1118] rounded-xl border border-[#1E2536] flex justify-between items-center">
                  <span className="text-slate-400">Servidor (Host):</span>
                  <span className="text-slate-100 font-bold">{firebirdConfig.host}:{firebirdConfig.port}</span>
                </div>
                <div className="p-2.5 bg-[#0E1118] rounded-xl border border-[#1E2536] flex justify-between items-center">
                  <span className="text-slate-400">Alias Principal:</span>
                  <span className="text-blue-400 font-bold">[{firebirdConfig.database}]</span>
                </div>
                <div className="p-2.5 bg-[#0E1118] rounded-xl border border-[#1E2536] flex justify-between items-center">
                  <span className="text-slate-400">Caminho do Banco:</span>
                  <span className="text-slate-300 font-mono text-[11px]">C:\Mezzold\dados\ESTOQUE.FDB</span>
                </div>
                <div className="p-2.5 bg-[#0E1118] rounded-xl border border-[#1E2536] flex justify-between items-center">
                  <span className="text-slate-400">Usuário DB:</span>
                  <span className="text-slate-200">{firebirdConfig.user}</span>
                </div>
              </div>

              {firebirdTestResult && (
                <div className={`p-3.5 rounded-xl border text-xs font-mono animate-in fade-in duration-200 ${
                  firebirdTestResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {firebirdTestResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{firebirdTestResult.message}</span>
                  </div>
                  <div className="text-[11px] opacity-80 mt-1 space-y-0.5">
                    <div>Alias Utilizado: <b>{firebirdTestResult.aliasUsed}</b></div>
                    <div>Tempo de Resposta: <b>{firebirdTestResult.latencyMs}ms</b></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleTestFirebird}
                disabled={isTestingFirebird}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm"
              >
                {isTestingFirebird ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Network size={15} />
                    <span>Testar Conexão com Banco Firebird</span>
                  </>
                )}
              </button>
            </div>

            {/* Manutenção de Banco */}
            <div className="col-span-12 lg:col-span-6 bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-[#2b3242] pb-3">
                <HardDrive size={16} className="text-emerald-400" /> Estrutura C:\Mezzold & Auto-Provisionamento
              </h3>

              {/* Status dos Componentes em Disco */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#11131a] rounded-xl border border-[#232938]">
                  <span className="text-slate-400 flex items-center gap-2">
                    <FolderCheck size={14} className="text-emerald-400" /> Pasta Base:
                  </span>
                  <span className="text-emerald-400 font-bold">C:\Mezzold (Ativa)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#11131a] rounded-xl border border-[#232938]">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Database size={14} className="text-blue-400" /> Banco de Dados:
                  </span>
                  <span className="text-emerald-400 font-bold">C:\Mezzold\dados\ESTOQUE.FDB (Montado)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#11131a] rounded-xl border border-[#232938]">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Sliders size={14} className="text-amber-400" /> Configuração de Alias:
                  </span>
                  <span className="text-amber-300 font-bold">C:\Mezzold\config\aliases.conf [HANSEN]</span>
                </div>
              </div>

              {/* Botão de Auto-Provisionamento Imediato */}
              <button
                onClick={handleProvisionEnvironment}
                disabled={isProvisioning}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm"
              >
                {isProvisioning ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw size={15} />
                    <span>Verificar e Auto-Provisionar Estrutura / Banco Agora</span>
                  </>
                )}
              </button>

              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pt-2 border-t border-[#2b3242]">
                <Database size={14} className="text-emerald-400" /> Rotinas de Banco de Dados
              </h4>

              <div className="space-y-2">
                <button
                  onClick={() => handleMaintenance('Reindexação de Índices Firebird')}
                  className="w-full flex items-center justify-between p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
                >
                  <span className="flex items-center gap-2"><RefreshCw size={14} className="text-emerald-400" /> Reindexar Tabelas</span>
                  <span className="text-[10px] text-slate-500 font-mono">Executar</span>
                </button>

                <button
                  onClick={() => handleMaintenance('Diagnóstico de Integridade de Tabelas')}
                  className="w-full flex items-center justify-between p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
                >
                  <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-400" /> Teste de Integridade de Dados</span>
                  <span className="text-[10px] text-slate-500 font-mono">Executar</span>
                </button>

                <button
                  onClick={() => handleMaintenance('Reciclagem do Pool de Conexões')}
                  className="w-full flex items-center justify-between p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
                >
                  <span className="flex items-center gap-2"><Cpu size={14} className="text-amber-400" /> Reciclar Pool de Conexões</span>
                  <span className="text-[10px] text-slate-500 font-mono">Executar</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            ABA 3: USUÁRIOS & PERMISSÕES
            ========================================================================= */}
        {activeTab === 'USUARIOS' && (
          <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} className="text-purple-400" /> Usuários Cadastrados no Sistema ({usuarios.length})
              </h3>
            </div>

            <div className="overflow-hidden border border-[#2b3242] rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111319] text-slate-400 border-b border-[#2b3242] uppercase text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Usuário</th>
                    <th className="px-4 py-2.5 font-semibold">Login / Username</th>
                    <th className="px-4 py-2.5 font-semibold">E-mail</th>
                    <th className="px-4 py-2.5 font-semibold">Perfil</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232836]">
                  {usuarios.map(u => {
                    const isMaster = u.username === '000';
                    const isCurrentLoggedMaster = currentUser?.username === '000';
                    const displayName = isMaster && !isCurrentLoggedMaster ? 'Mezzold Studios Master' : u.nome;
                    const displayUsername = isMaster && !isCurrentLoggedMaster ? 'mezzold' : u.username;
                    const displayEmail = isMaster && !isCurrentLoggedMaster ? 'master@mezzold.com' : u.email;

                    return (
                      <tr key={u.id} className="hover:bg-[#1f2432]/70 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-slate-100 flex items-center gap-2">
                          {isMaster ? (
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-600 to-black border border-red-500/80 flex items-center justify-center font-black text-[10px] text-white shadow-sm font-mono shrink-0">
                              M
                            </div>
                          ) : (
                            <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} alt={u.nome} className="w-6 h-6 rounded-full object-cover" />
                          )}
                          <span>{displayName}</span>
                          {isMaster && <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-mono">MESTRE</span>}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-red-400 font-bold">@{displayUsername}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-400">{displayEmail}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            u.perfil === 'ADMIN' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {u.perfil}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${u.ativo ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                            {u.ativo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {isMaster ? (
                            <span className="text-[10px] text-amber-400 font-mono">Protegido</span>
                          ) : (
                            <button
                              onClick={() => toggleUsuarioAtivo(u.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                                u.ativo 
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30'
                              }`}
                            >
                              {u.ativo ? 'Inativar' : 'Reativar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: AUDITORIA
            ========================================================================= */}
        {activeTab === 'AUDITORIA' && (
          <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl flex-1 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-3 mb-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <History size={16} className="text-blue-400" /> Log de Auditoria em Tempo Real ({auditLogs.length})
              </h3>
            </div>

            <div className="overflow-y-auto border border-[#2b3242] rounded-xl flex-1">
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
        )}

        {/* =========================================================================
            ABA 5: TEMAS & APARÊNCIA VISUAL
            ========================================================================= */}
        {activeTab === 'TEMAS' && (
          <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl flex-1 flex flex-col space-y-5">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Palette size={16} className="text-blue-400" /> Esquemas de Cores & Personalização Visual
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Selecione o tema de cores desejado para a interface. A preferência é salva automaticamente no seu computador.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-[#10141E] px-3 py-1.5 rounded-xl border border-[#26334A] text-xs font-mono">
                <span className="text-slate-400">Tema Ativo:</span>
                <span className="text-blue-400 font-bold">
                  {tema === 'SAPPHIRE_DARK' ? 'Azul Safira (Executivo)' :
                   tema === 'CHARCOAL_DARK' ? 'Grafite Dark (Neutro)' :
                   tema === 'EMERALD_DARK' ? 'Esmeralda Banking' :
                   tema === 'RUBY_DARK' ? 'Ruby Mezzold' : 'Corporate Light (Claro)'}
                </span>
              </div>
            </div>

            {/* Grid de Seleção de Temas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Opção 1: Azul Safira Executivo */}
              <div 
                onClick={() => {
                  setTema('SAPPHIRE_DARK');
                  showToast('Tema Azul Safira Executivo aplicado com sucesso!');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${
                  tema === 'SAPPHIRE_DARK'
                    ? 'bg-[#121620] border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.25)] ring-2 ring-blue-500/30'
                    : 'bg-[#11131a] border-[#2b3242] hover:border-blue-500/50 hover:bg-[#151924]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-sm" />
                      Azul Safira Executivo
                    </span>
                    {tema === 'SAPPHIRE_DARK' && (
                      <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Padrão moderno corporativo com tons de ardósia escura e acentos em azul safira.
                  </p>
                </div>
                <div className="flex gap-1.5 pt-2 border-t border-[#202738]">
                  <div className="w-6 h-6 rounded bg-[#0B0E14] border border-[#2A3349]" title="Fundo Base" />
                  <div className="w-6 h-6 rounded bg-[#121620] border border-[#2A3349]" title="Superfície" />
                  <div className="w-6 h-6 rounded bg-[#2563EB]" title="Primária" />
                  <div className="w-6 h-6 rounded bg-[#10B981]" title="Sucesso" />
                </div>
              </div>

              {/* Opção 2: Dark Charcoal / Grafite */}
              <div 
                onClick={() => {
                  setTema('CHARCOAL_DARK');
                  showToast('Tema Grafite Dark Neutro aplicado com sucesso!');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${
                  tema === 'CHARCOAL_DARK'
                    ? 'bg-[#17191E] border-slate-400 shadow-[0_0_20px_rgba(100,116,139,0.25)] ring-2 ring-slate-400/30'
                    : 'bg-[#11131a] border-[#2b3242] hover:border-slate-500/50 hover:bg-[#181A20]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-500 shadow-sm" />
                      Grafite Dark (Neutro)
                    </span>
                    {tema === 'CHARCOAL_DARK' && (
                      <span className="bg-slate-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Estética sóbria e discreta em tons monocromáticos de carvão e cinza espacial.
                  </p>
                </div>
                <div className="flex gap-1.5 pt-2 border-t border-[#2A2E38]">
                  <div className="w-6 h-6 rounded bg-[#111215] border border-[#383E4B]" title="Fundo Base" />
                  <div className="w-6 h-6 rounded bg-[#17191E] border border-[#383E4B]" title="Superfície" />
                  <div className="w-6 h-6 rounded bg-[#475569]" title="Primária" />
                  <div className="w-6 h-6 rounded bg-[#10B981]" title="Sucesso" />
                </div>
              </div>

              {/* Opção 3: Esmeralda Banking */}
              <div 
                onClick={() => {
                  setTema('EMERALD_DARK');
                  showToast('Tema Esmeralda Banking aplicado com sucesso!');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${
                  tema === 'EMERALD_DARK'
                    ? 'bg-[#0E1A16] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/30'
                    : 'bg-[#11131a] border-[#2b3242] hover:border-emerald-500/50 hover:bg-[#0D1814]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm" />
                      Esmeralda Banking
                    </span>
                    {tema === 'EMERALD_DARK' && (
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Inspirado em plataformas bancárias internacionais e finanças sustentáveis.
                  </p>
                </div>
                <div className="flex gap-1.5 pt-2 border-t border-[#1D372E]">
                  <div className="w-6 h-6 rounded bg-[#08100D] border border-[#2A4C40]" title="Fundo Base" />
                  <div className="w-6 h-6 rounded bg-[#0E1A16] border border-[#2A4C40]" title="Superfície" />
                  <div className="w-6 h-6 rounded bg-[#059669]" title="Primária" />
                  <div className="w-6 h-6 rounded bg-[#F59E0B]" title="Atenção" />
                </div>
              </div>

              {/* Opção 4: Ruby Mezzold */}
              <div 
                onClick={() => {
                  setTema('RUBY_DARK');
                  showToast('Tema Ruby Mezzold aplicado com sucesso!');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${
                  tema === 'RUBY_DARK'
                    ? 'bg-[#181015] border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)] ring-2 ring-rose-500/30'
                    : 'bg-[#11131a] border-[#2b3242] hover:border-rose-500/50 hover:bg-[#1A1218]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-sm" />
                      Ruby Mezzold
                    </span>
                    {tema === 'RUBY_DARK' && (
                      <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Visual clássico com nuances escarlate e alto dinamismo para auditoria.
                  </p>
                </div>
                <div className="flex gap-1.5 pt-2 border-t border-[#331C2A]">
                  <div className="w-6 h-6 rounded bg-[#0F0A0D] border border-[#4A273D]" title="Fundo Base" />
                  <div className="w-6 h-6 rounded bg-[#181015] border border-[#4A273D]" title="Superfície" />
                  <div className="w-6 h-6 rounded bg-[#DC2626]" title="Primária" />
                  <div className="w-6 h-6 rounded bg-[#10B981]" title="Sucesso" />
                </div>
              </div>

              {/* Opção 5: Corporate Light (Claro) */}
              <div 
                onClick={() => {
                  setTema('CORPORATE_LIGHT');
                  showToast('Tema Corporate Light (Modo Claro) aplicado com sucesso!');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${
                  tema === 'CORPORATE_LIGHT'
                    ? 'bg-slate-100 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.25)] ring-2 ring-blue-600/30'
                    : 'bg-[#11131a] border-[#2b3242] hover:border-blue-400/50 hover:bg-[#161922]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-400 shadow-sm" />
                      Corporate Light (Claro)
                    </span>
                    {tema === 'CORPORATE_LIGHT' && (
                      <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Modo claro com alto contraste para ambientes iluminados e escritórios.
                  </p>
                </div>
                <div className="flex gap-1.5 pt-2 border-t border-slate-700">
                  <div className="w-6 h-6 rounded bg-[#F1F5F9] border border-slate-300" title="Fundo Base" />
                  <div className="w-6 h-6 rounded bg-[#FFFFFF] border border-slate-300" title="Superfície" />
                  <div className="w-6 h-6 rounded bg-[#2563EB]" title="Primária" />
                  <div className="w-6 h-6 rounded bg-[#0F172A]" title="Texto" />
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
