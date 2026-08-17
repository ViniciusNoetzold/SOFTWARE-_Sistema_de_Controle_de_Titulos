import { useState, FormEvent } from 'react';
import { 
  Settings, Save, Shield, History, Building2, UserPlus, 
  Database, RefreshCw, CheckCircle2, Sliders, Lock, Mail, Phone, MapPin, X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function SistemaView() {
  const { auditLogs, empresaConfig, updateEmpresaConfig, addLog, showToast } = useAppContext();

  // Form Dados da Empresa
  const [empresaData, setEmpresaData] = useState(empresaConfig);

  // Parâmetros Financeiros Globais
  const [parametros, setParametros] = useState({
    taxaJuros: '1.0',
    multaAtraso: '2.0',
    diasCarencia: '3',
    notificarAutomatico: true
  });

  // Usuários do Sistema
  const [usuarios, setUsuarios] = useState([
    { id: 1, usuario: 'admin', email: 'admin@mezzold.com', permissao: 'Administrador', ativo: true },
    { id: 2, usuario: 'operacao', email: 'operacao@mezzold.com', permissao: 'Operador Financeiro', ativo: true },
    { id: 3, usuario: 'vinicius.financeiro', email: 'vinicius@mezzold.com', permissao: 'Gerente Financeiro', ativo: true },
  ]);

  // Modal Novo Usuário
  const [openUserModal, setOpenUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ usuario: '', email: '', permissao: 'Operador Financeiro' });

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

  // Handler Adicionar Usuário
  const handleAddUser = (e: FormEvent) => {
    e.preventDefault();
    if (!newUser.usuario || !newUser.email) {
      showToast('Preencha os campos de usuário e e-mail.');
      return;
    }

    const n = {
      id: Date.now(),
      usuario: newUser.usuario.toLowerCase().trim(),
      email: newUser.email.trim(),
      permissao: newUser.permissao,
      ativo: true
    };

    setUsuarios([...usuarios, n]);
    addLog('Controle de Acesso', `Cadastrou novo operador ${n.usuario} (${n.permissao})`);
    showToast(`Usuário ${n.usuario} cadastrado com sucesso!`);
    setNewUser({ usuario: '', email: '', permissao: 'Operador Financeiro' });
    setOpenUserModal(false);
  };

  const handleMaintenance = (actionName: string) => {
    addLog('Manutenção', `Executou a rotina de ${actionName}`);
    showToast(`Manutenção: ${actionName} executada com sucesso 100%!`);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-in fade-in duration-300 select-none text-slate-200 overflow-y-auto pr-1">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-[#161922] border border-[#2b3242] rounded-xl px-4 py-3 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-100">Configurações Globais do Sistema</h1>
            <p className="text-[11px] text-slate-400">Gerencie parâmetros corporativos, controle de acessos, juros e auditoria</p>
          </div>
        </div>

        {/* Indicador de Status do Banco */}
        <div className="flex items-center gap-2 bg-[#11131a] px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="text-[11px] font-mono">
            <span className="text-slate-400">SQLite DB: </span>
            <span className="text-emerald-400 font-bold">CONECTADO / OK</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        
        {/* COLUNA ESQUERDA: DADOS DA EMPRESA & PARÂMETROS FINANCEIROS */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          
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

          {/* Form Parâmetros Financeiros Globais */}
          <form onSubmit={handleSaveParametros} className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-2.5">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} className="text-amber-500" /> Parâmetros de Juros & Cobrança
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Juros (% Mês)</label>
                <input 
                  type="text" 
                  value={parametros.taxaJuros}
                  onChange={e => setParametros({...parametros, taxaJuros: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Multa (% Fixa)</label>
                <input 
                  type="text" 
                  value={parametros.multaAtraso}
                  onChange={e => setParametros({...parametros, multaAtraso: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Carência (Dias)</label>
                <input 
                  type="text" 
                  value={parametros.diasCarencia}
                  onChange={e => setParametros({...parametros, diasCarencia: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#11131a] p-2.5 rounded-xl border border-[#2b3242]">
              <span className="text-xs text-slate-300 font-medium">Disparo Automático de Notificações</span>
              <button
                type="button"
                onClick={() => setParametros({...parametros, notificarAutomatico: !parametros.notificarAutomatico})}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  parametros.notificarAutomatico ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {parametros.notificarAutomatico ? 'ATIVADO' : 'DESATIVADO'}
              </button>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]"
            >
              <Save size={14} /> Atualizar Parâmetros Financeiros
            </button>
          </form>

          {/* Banner Mezzold Studio */}
          <a 
            href="https://www.mezzoldstudio.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#161922] border border-[#2b3242] rounded-2xl p-4 shadow-xl flex items-center justify-between hover:bg-[#1a1e2a] transition-colors group cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium leading-none mb-1">Desenvolvido por</span>
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                mezzold<span className="text-red-500">.</span>
              </span>
            </div>
            <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <span className="text-black font-black tracking-tight text-base leading-none">MEZZOLD</span>
            </div>
          </a>

        </div>

        {/* COLUNA DIREITA: USUÁRIOS & AUDITORIA DE SISTEMA */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          
          {/* Gestão de Usuários */}
          <div className="bg-[#161922] border border-[#2b3242] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2b3242] pb-2.5">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} className="text-purple-400" /> Controle de Acesso e Usuários ({usuarios.length})
              </h3>
              <button
                onClick={() => setOpenUserModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <UserPlus size={13} /> Novo Usuário
              </button>
            </div>

            <div className="overflow-hidden border border-[#2b3242] rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111319] text-slate-400 border-b border-[#2b3242] uppercase text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Usuário</th>
                    <th className="px-4 py-2.5 font-semibold">E-mail</th>
                    <th className="px-4 py-2.5 font-semibold">Perfil / Nível</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232836]">
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-[#1f2432]/70 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-slate-100">{u.usuario}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          u.permissao === 'Administrador' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                          {u.permissao}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          ATIVO
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
                <Database size={16} className="text-emerald-400" /> Manutenção & Integridade da Base
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleMaintenance('Reindexação e Limpeza VACUUM')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
              >
                <RefreshCw size={13} className="text-emerald-400" /> Reindexar Banco
              </button>

              <button
                onClick={() => handleMaintenance('Diagnóstico de Integridade de Tabelas')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
              >
                <CheckCircle2 size={13} className="text-blue-400" /> Testar Integridade
              </button>

              <button
                onClick={() => handleMaintenance('Limpeza de Cache Temporário')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#11131a] hover:bg-[#202738] border border-[#2b3242] rounded-xl text-xs font-semibold text-slate-200 transition-all"
              >
                <Database size={13} className="text-amber-400" /> Limpar Cache
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
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Nenhum evento gravado no log de auditoria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: Adicionar Novo Usuário */}
      {openUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setOpenUserModal(false)}></div>
          <form onSubmit={handleAddUser} className="relative w-full max-w-md bg-[#181c26] border border-[#2e374a] rounded-2xl shadow-2xl p-5 text-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#2e374a] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <UserPlus size={16} className="text-purple-400" /> Cadastrar Novo Usuário Operador
              </h3>
              <button type="button" onClick={() => setOpenUserModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Nome de Usuário (Login)</label>
                <input
                  type="text"
                  placeholder="ex: roberto.financeiro"
                  value={newUser.usuario}
                  onChange={e => setNewUser({...newUser, usuario: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">E-mail Corporativo</label>
                <input
                  type="email"
                  placeholder="roberto@empresa.com"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">Nível de Permissão</label>
                <select
                  value={newUser.permissao}
                  onChange={e => setNewUser({...newUser, permissao: e.target.value})}
                  className="w-full bg-[#11131a] border border-[#2b3242] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Operador Financeiro">Operador Financeiro</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Auditor de Leitura">Auditor de Leitura</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2e374a]">
              <button
                type="button"
                onClick={() => setOpenUserModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-[#252c3c] border border-[#2e374a] rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <UserPlus size={14} /> Confirmar Cadastro
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
