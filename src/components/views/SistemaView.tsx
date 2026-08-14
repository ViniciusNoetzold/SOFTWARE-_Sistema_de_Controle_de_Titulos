import { Settings, Save, Shield, History, Building2 } from 'lucide-react';

export function SistemaView() {
  const usuarios = [
    { id: 1, usuario: 'admin', email: 'admin@mezzold.com', permissao: 'Administrador' },
    { id: 2, usuario: 'operacao', email: 'operacao@mezzold.com', permissao: 'Operador Financeiro' },
  ];

  const logs = [
    { id: 1, dataHora: '14/08/2026 10:30', usuario: 'admin', acao: 'Login no sistema', detalhes: 'IP 192.168.1.100' },
    { id: 2, dataHora: '14/08/2026 10:45', usuario: 'operacao', acao: 'Baixa de Título', detalhes: 'Título NF-1026 liquidado totalmente' },
    { id: 3, dataHora: '14/08/2026 11:12', usuario: 'admin', acao: 'Alteração Cadastral', detalhes: 'Atualizou telefone Cliente C1' },
  ];

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300 max-w-7xl mx-auto overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
          <Settings size={24} className="text-zinc-400" />
          Configurações do Sistema
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Gerencie os parâmetros globais, acessos e auditoria.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Geral */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex flex-col h-fit">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Building2 size={16} /> Dados da Empresa
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Razão Social</label>
                <input type="text" defaultValue="Mezzold Studios Finance S/A" className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">CNPJ</label>
                <input type="text" defaultValue="00.000.000/0001-00" className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Endereço Principal</label>
                <textarea defaultValue="Av. Paulista, 1000 - Bela Vista, São Paulo - SP" className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 min-h-[80px] resize-none" />
              </div>
              <button className="w-full mt-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
          </div>
          
          {/* Informações da Marca */}
          <a 
            href="https://www.mezzoldstudio.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex items-center justify-between hover:bg-zinc-900 transition-colors group cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-sm text-zinc-400 font-medium leading-none mb-1">produzido por</span>
              <span className="text-3xl font-bold text-white tracking-tight leading-none">
                mezzold<span className="text-red-600">.</span>
              </span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <span className="text-black font-black tracking-tight text-xl leading-none">MEZZOLD</span>
            </div>
          </a>
        </div>

        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Usuários */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Shield size={16} /> Controle de Acesso (Usuários)
              </h3>
            </div>
            <div className="overflow-hidden border border-zinc-800/50 rounded-lg">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950/80 text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Usuário</th>
                    <th className="px-4 py-2.5 font-medium">Email</th>
                    <th className="px-4 py-2.5 font-medium">Permissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 font-medium text-zinc-200">{u.usuario}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${u.permissao === 'Administrador' ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-400'}`}>
                          {u.permissao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Log de Auditoria */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex-1">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-6">
              <History size={16} /> Log de Auditoria
            </h3>
            <div className="overflow-hidden border border-zinc-800/50 rounded-lg">
              <table className="w-full text-left text-xs text-zinc-400">
                <thead className="bg-zinc-950/80 text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Data / Hora</th>
                    <th className="px-4 py-2.5 font-medium">Usuário</th>
                    <th className="px-4 py-2.5 font-medium">Ação</th>
                    <th className="px-4 py-2.5 font-medium">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {logs.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 font-mono">{l.dataHora}</td>
                      <td className="px-4 py-2.5 font-medium text-zinc-300">{l.usuario}</td>
                      <td className="px-4 py-2.5 text-zinc-200">{l.acao}</td>
                      <td className="px-4 py-2.5 text-zinc-500">{l.detalhes}</td>
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
