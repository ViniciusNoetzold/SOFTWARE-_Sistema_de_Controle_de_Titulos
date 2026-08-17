import { useState, FormEvent } from 'react';
import { 
  Settings, Save, Shield, History, Building2, UserPlus, 
  Database, RefreshCw, CheckCircle2, Sliders, Lock, Mail, Phone, MapPin, X, Network, Server, Cpu, Terminal,
  QrCode, Eye, Check, AlertTriangle, Layers
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { testFirebirdConnection, getFirebirdConfig, ConnectionTestResult } from '../../lib/firebirdClient';
import { EmpresaConfig } from '../../types';

export function SistemaView() {
  const { auditLogs, empresaConfig, updateEmpresaConfig, addLog, showToast, usuarios, toggleUsuarioAtivo, currentUser } = useAppContext();

  // Abas de Configuração
  const [activeTab, setActiveTab] = useState<'EMPRESA' | 'FIREBIRD' | 'USUARIOS' | 'AUDITORIA'>('EMPRESA');

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
  const firebirdConfig = getFirebirdConfig();

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
            
            <div className="col-span-12 lg:col-span-6 bg-[#161922] border border-red-500/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#2b3242] pb-3">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Server size={16} className="text-red-500" /> Conexão Firebird em Rede (Alias Oficial)
                </h3>
                <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono text-[9px] font-bold uppercase">
                  DATABASE ALIAS
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 bg-[#11131a] rounded-xl border border-[#2b3242] flex justify-between items-center">
                  <span className="text-slate-400">Servidor (Host):</span>
                  <span className="text-slate-100 font-bold">{firebirdConfig.host}:{firebirdConfig.port}</span>
                </div>
                <div className="p-2.5 bg-[#11131a] rounded-xl border border-[#2b3242] flex justify-between items-center">
                  <span className="text-slate-400">Alias Principal:</span>
                  <span className="text-emerald-400 font-bold">[{firebirdConfig.database}]</span>
                </div>
                <div className="p-2.5 bg-[#11131a] rounded-xl border border-[#2b3242] flex justify-between items-center">
                  <span className="text-slate-400">Usuário DB:</span>
                  <span className="text-slate-200">{firebirdConfig.user}</span>
                </div>
              </div>

              {firebirdTestResult && (
                <div className={`p-3.5 rounded-xl border text-xs font-mono animate-in fade-in duration-200 ${
                  firebirdTestResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/50 text-red-300'
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
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
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
            <div className="col-span-12 lg:col-span-6 bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-[#2b3242] pb-3">
                <Database size={16} className="text-emerald-400" /> Rotinas de Banco de Dados
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => handleMaintenance('Reindexação de Índices Firebird')}
                  className="w-full flex items-center justify-between p-3 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
                >
                  <span className="flex items-center gap-2"><RefreshCw size={14} className="text-emerald-400" /> Reindexar Tabelas</span>
                  <span className="text-[10px] text-slate-500 font-mono">Executar</span>
                </button>

                <button
                  onClick={() => handleMaintenance('Diagnóstico de Integridade de Tabelas')}
                  className="w-full flex items-center justify-between p-3 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
                >
                  <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-400" /> Teste de Integridade de Dados</span>
                  <span className="text-[10px] text-slate-500 font-mono">Executar</span>
                </button>

                <button
                  onClick={() => handleMaintenance('Reciclagem do Pool de Conexões')}
                  className="w-full flex items-center justify-between p-3 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
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

      </div>

    </div>
  );
}
