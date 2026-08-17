import { useState } from 'react';
import { 
  Send, CheckCircle2, Mail, MessageSquare, 
  AlertOctagon, ShieldAlert, X, Loader2, Sparkles, Building2,
  QrCode, Copy, Lock, Unlock, AlertTriangle, Check
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, calcularSaldoDevedor, formatDateBR, isTituloVencido } from '../../lib/utils';
import { Titulo, Entidade } from '../../types';

// Helper: Cálculo de CRC16-CCITT (Polinômio 0x1021, Inicial 0xFFFF) conforme EMV Co / Banco Central do Brasil
function calcCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Helper: Normalização de Texto EMV (Remoção de Acentos e Caracteres Especiais)
function normalizeEMV(str: string, maxLen: number): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLen);
}

// Helper: Limpeza e Formatação de Chave PIX (E-mail, CPF/CNPJ, Telefone, Aleatória)
function cleanChavePix(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return '';
  
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 11 || digits.length === 14) {
    return digits;
  }
  
  if ((digits.length === 10 || digits.length === 11) && !trimmed.startsWith('+')) {
    return `+55${digits}`;
  }

  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }

  return trimmed;
}

interface NotificacaoRecord {
  tituloId: string;
  canal: 'EMAIL' | 'WHATSAPP' | 'GERAL';
  dataHora: string;
}

export function CobrancaView() {
  const { titulos, entidades, empresaConfig, addLog, showToast } = useAppContext();

  // Abas Internas da Área de Cobrança (Mais organizado)
  const [activeTab, setActiveTab] = useState<'REGUA' | 'GERADOR_PIX'>('REGUA');

  // Filtra títulos a receber que estão pendentes (em aberto ou vencidos)
  const titulosAtrasados = titulos.filter(
    t => t.tipo_titulo === 'RECEBER' && t.status !== 'PAGO'
  );

  const [notificacoesMap, setNotificacoesMap] = useState<Record<string, NotificacaoRecord>>({});
  
  // Modal de Notificação por E-mail / WhatsApp
  const [modalTitulo, setModalTitulo] = useState<{ titulo: Titulo; cliente: Entidade | undefined } | null>(null);

  // Email form local no modal
  const [emailDestino, setEmailDestino] = useState('');
  const [assuntoEmail, setAssuntoEmail] = useState('');
  const [corpoEmail, setCorpoEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  // =========================================================================
  // STATE DO GERADOR PIX NA ÁREA DE COBRANÇA
  // =========================================================================
  const [pixChave, setPixChave] = useState('');
  const [pixFavorecido, setPixFavorecido] = useState('');
  const [pixValor, setPixValor] = useState('');
  const [pixCidade, setPixCidade] = useState('');
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [pixError, setPixError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dadosTravados, setDadosTravados] = useState(false);

  // Ação do Botão Verde "Usar Dados da Empresa" (Com Trava de Segurança)
  const handleUsarDadosEmpresa = () => {
    const chaveOficial = empresaConfig.email || 'financeiro@mezzold.com.br';
    const favorecidoOficial = empresaConfig.nomeFantasia || empresaConfig.razaoSocial || 'MEZZOLD STUDIOS LTDA';

    setPixChave(chaveOficial);
    setPixFavorecido(favorecidoOficial);
    setPixCidade('SAO PAULO');
    setPixError(null);
    setDadosTravados(true);

    showToast('Dados oficiais da empresa carregados e protegidos para recebimento PIX!');
    addLog('PIX Cobrança', `Carregou chave PIX oficial: ${chaveOficial} - ${favorecidoOficial}`);
  };

  const handleLimparEManual = () => {
    setDadosTravados(false);
    setPixChave('');
    setPixFavorecido('');
    setPixCopiaECola('');
    setPixError(null);
    showToast('Campos desbloqueados para digitação manual.');
  };

  // Gerar PIX especificamente a partir de um Título da Tabela
  const handleGerarPixParaTitulo = (t: Titulo) => {
    const ent = entidades.find(e => e.id === t.id_entidade);
    const saldo = calcularSaldoDevedor(t);

    const chaveOficial = empresaConfig.email || 'financeiro@mezzold.com.br';
    const favorecidoOficial = empresaConfig.nomeFantasia || empresaConfig.razaoSocial || 'MEZZOLD STUDIOS LTDA';

    setPixChave(chaveOficial);
    setPixFavorecido(favorecidoOficial);
    setPixValor(saldo.toString());
    setPixCidade('SAO PAULO');
    setDadosTravados(true);
    setPixError(null);

    setActiveTab('GERADOR_PIX');
    showToast(`Gerador PIX preenchido para o título N° ${t.numero_documento} (${ent?.nome || 'Cliente'})!`);
  };

  // Lógica: Gerar Payload PIX EMV® BR Code Válido
  const handleGerarPix = () => {
    setPixError(null);
    setCopied(false);

    const chaveFormatada = cleanChavePix(pixChave || empresaConfig.email || empresaConfig.cnpj || '');
    if (!chaveFormatada) {
      const err = 'Por favor, informe a Chave PIX do recebedor.';
      setPixError(err);
      showToast(err);
      return;
    }

    const favorecidoNorm = normalizeEMV(pixFavorecido || empresaConfig.nomeFantasia || empresaConfig.razaoSocial || 'FAVORECIDO', 25);
    if (!favorecidoNorm) {
      const err = 'Por favor, informe o Nome do Favorecido.';
      setPixError(err);
      showToast(err);
      return;
    }

    const cidadeNorm = normalizeEMV(pixCidade || 'SAO PAULO', 15) || 'SAO PAULO';

    let valorFormatted = '';
    if (pixValor && pixValor.trim()) {
      const parsedVal = parseFloat(pixValor.replace(',', '.'));
      if (isNaN(parsedVal) || parsedVal <= 0) {
        const err = 'Informe um valor numérico válido (maior que zero) ou deixe em branco.';
        setPixError(err);
        showToast(err);
        return;
      }
      valorFormatted = parsedVal.toFixed(2);
    }

    // Montagem Estrutura TLV (Tag, Length, Value)
    let payload = "000201";
    const gui = "br.gov.bcb.pix";
    const sub00 = `00${gui.length.toString().padStart(2, '0')}${gui}`;
    const sub01 = `01${chaveFormatada.length.toString().padStart(2, '0')}${chaveFormatada}`;
    const merchantAccountVal = sub00 + sub01;
    payload += `26${merchantAccountVal.length.toString().padStart(2, '0')}${merchantAccountVal}`;
    payload += "52040000";
    payload += "5303986";

    if (valorFormatted) {
      payload += `54${valorFormatted.length.toString().padStart(2, '0')}${valorFormatted}`;
    }

    payload += "5802BR";
    payload += `59${favorecidoNorm.length.toString().padStart(2, '0')}${favorecidoNorm}`;
    payload += `60${cidadeNorm.length.toString().padStart(2, '0')}${cidadeNorm}`;

    const sub05 = "0503***";
    payload += `62${sub05.length.toString().padStart(2, '0')}${sub05}`;

    payload += "6304";
    const crc = calcCRC16(payload);
    const payloadFinal = payload + crc;

    setPixCopiaECola(payloadFinal);
    showToast('Payload PIX EMV® de Cobrança gerado com sucesso!');
    addLog('Gerador PIX', `Gerou código PIX EMV® na Cobrança para ${favorecidoNorm} (Chave: ${chaveFormatada})`);
  };

  const handleCopiarPix = () => {
    if (!pixCopiaECola) return;
    navigator.clipboard.writeText(pixCopiaECola);
    setCopied(true);
    showToast('Código PIX Copia e Cola copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenNotificarModal = (t: Titulo) => {
    const cliente = entidades.find(e => e.id === t.id_entidade);
    const saldo = calcularSaldoDevedor(t);
    const empresaNome = empresaConfig.nomeFantasia || empresaConfig.razaoSocial || 'Nossa Empresa';
    const empresaEmail = empresaConfig.email || 'financeiro@empresa.com.br';
    const empresaChavePix = empresaConfig.cnpj || empresaEmail;

    setEmailDestino(cliente?.email || 'financeiro@cliente.com.br');
    setAssuntoEmail(`[AVISO DE COBRANÇA URGENTE] Regularização do Título N° ${t.numero_documento} - ${empresaNome}`);
    setCorpoEmail(
      `Prezado(a) ${cliente?.nome || 'Cliente'},\n\n` +
      `Identificamos em nossos registros financeiros que o título N° ${t.numero_documento} com vencimento original em ${formatDateBR(t.data_vencimento)} encontra-se pendente de quitação.\n\n` +
      `* Saldo Atualizado para Liquidação: R$ ${formatCurrency(saldo)}\n` +
      `* Chave PIX Financeiro: ${empresaChavePix} (${empresaConfig.razaoSocial || empresaNome})\n\n` +
      `Solicitamos a gentileza de nos enviar o comprovante de pagamento respondendo a este e-mail ou entrando em contato com nosso departamento financeiro.\n\n` +
      `Atenciosamente,\n` +
      `Departamento de Cobrança e Gestão de Recebíveis - ${empresaNome}`
    );

    setModalTitulo({ titulo: t, cliente });
  };

  // Disparo via Gmail Web (Abre direto a tela de compor do Gmail com tudo preenchido)
  const handleSendGmail = () => {
    if (!modalTitulo) return;
    const { titulo, cliente } = modalTitulo;

    if (!emailDestino || !emailDestino.includes('@')) {
      showToast('Por favor, insira um e-mail de destino válido.');
      return;
    }

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailDestino)}&su=${encodeURIComponent(assuntoEmail)}&body=${encodeURIComponent(corpoEmail)}`;
    window.open(gmailUrl, '_blank');

    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setNotificacoesMap(prev => ({
      ...prev,
      [titulo.id]: { tituloId: titulo.id, canal: 'EMAIL', dataHora: nowStr }
    }));

    addLog('Notificação via Gmail', `Abriu rascunho no Gmail para ${cliente?.nome || 'Cliente'} (${emailDestino}) referente ao título N° ${titulo.numero_documento}`);
    showToast(`Gmail aberto com a cobrança preenchida para ${cliente?.nome || 'Cliente'}!`);
    setModalTitulo(null);
  };

  // Disparo via Outlook Web
  const handleSendOutlook = () => {
    if (!modalTitulo) return;
    const { titulo, cliente } = modalTitulo;

    if (!emailDestino || !emailDestino.includes('@')) {
      showToast('Por favor, insira um e-mail de destino válido.');
      return;
    }

    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(emailDestino)}&subject=${encodeURIComponent(assuntoEmail)}&body=${encodeURIComponent(corpoEmail)}`;
    window.open(outlookUrl, '_blank');

    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setNotificacoesMap(prev => ({
      ...prev,
      [titulo.id]: { tituloId: titulo.id, canal: 'EMAIL', dataHora: nowStr }
    }));

    addLog('Notificação via Outlook Web', `Abriu rascunho no Outlook Web para ${cliente?.nome || 'Cliente'} (${emailDestino})`);
    showToast(`Outlook aberto com a cobrança preenchida!`);
    setModalTitulo(null);
  };

  // Disparo via Aplicativo Padrão de E-mail (Sem abrir aba em branco)
  const handleSendEmailClient = () => {
    if (!modalTitulo) return;
    const { titulo, cliente } = modalTitulo;

    if (!emailDestino || !emailDestino.includes('@')) {
      showToast('Por favor, insira um e-mail de destino válido.');
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(emailDestino)}?subject=${encodeURIComponent(assuntoEmail)}&body=${encodeURIComponent(corpoEmail)}`;
    
    // Dispara mailto sem abrir aba em branco
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);

    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setNotificacoesMap(prev => ({
      ...prev,
      [titulo.id]: { tituloId: titulo.id, canal: 'EMAIL', dataHora: nowStr }
    }));

    addLog('Notificação via E-mail (App)', `Disparou aplicativo de e-mail para ${cliente?.nome || 'Cliente'} (${emailDestino})`);
    showToast(`Aplicativo de e-mail acionado com sucesso!`);
    setModalTitulo(null);
  };

  // Copiar Texto Completo do E-mail
  const handleCopyEmailText = () => {
    const fullText = `Assunto: ${assuntoEmail}\n\n${corpoEmail}`;
    navigator.clipboard.writeText(fullText);
    showToast('Texto da notificação copiado para a área de transferência!');
  };

  // Disparo via WhatsApp Web
  const handleSendWhatsapp = () => {
    if (!modalTitulo) return;
    const { titulo, cliente } = modalTitulo;
    if (!cliente || !cliente.telefone) {
      showToast('Cliente não possui número de telefone cadastrado.', 'error');
      return;
    }

    const cleanPhone = cliente.telefone.replace(/\D/g, '');
    const saldo = calcularSaldoDevedor(titulo);

    const msg = `Olá *${cliente.nome}*, referente ao aviso formal de cobrança do título *N° ${titulo.numero_documento}* (Saldo Atualizado: R$ ${formatCurrency(saldo)}). Para 2ª via ou chave PIX, favor responder esta mensagem.`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');

    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setNotificacoesMap(prev => ({
      ...prev,
      [titulo.id]: { tituloId: titulo.id, canal: 'WHATSAPP', dataHora: nowStr }
    }));

    addLog('Notificação via WhatsApp', `Enviou alerta via WhatsApp para ${cliente.nome} (${cliente.telefone})`);
    showToast(`WhatsApp aberto para envio de cobrança a ${cliente.nome}!`);
    setModalTitulo(null);
  };

  // Simulação / Disparo Direto (API Email Engine)
  const handleConfirmarEnvioNotificacao = () => {
    if (!modalTitulo) return;
    const { titulo, cliente } = modalTitulo;

    if (!emailDestino || !emailDestino.includes('@')) {
      showToast('Por favor, informe um endereço de e-mail válido.', 'error');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setNotificacoesMap(prev => ({
        ...prev,
        [titulo.id]: { tituloId: titulo.id, canal: 'EMAIL', dataHora: nowStr }
      }));

      addLog('E-mail de Cobrança', `E-mail de cobrança disparado com sucesso para ${emailDestino} (Título N° ${titulo.numero_documento})`);
      showToast(`Notificação de cobrança enviada por e-mail com sucesso para ${cliente?.nome || 'Cliente'}!`);
      setModalTitulo(null);
    }, 600);
  };

  const totalInadimplencia = titulosAtrasados.reduce((sum, t) => sum + calcularSaldoDevedor(t), 0);
  const totalNotificadosCount = Object.keys(notificacoesMap).length;
  const empresaDomain = empresaConfig.email ? empresaConfig.email.split('@')[1] : 'mezzold.com.br';

  return (
    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300 select-none text-slate-200 overflow-hidden">
      
      {/* Selector Tabs Internos da Área de Cobrança */}
      <div className="flex items-center gap-2 bg-[#161922] border border-[#2b3242] p-1.5 rounded-2xl shrink-0">
        
        <button
          onClick={() => setActiveTab('REGUA')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'REGUA'
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2432]'
          }`}
        >
          <AlertOctagon size={16} />
          <span>Régua de Cobrança & Inadimplência</span>
        </button>

        <button
          onClick={() => setActiveTab('GERADOR_PIX')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'GERADOR_PIX'
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2432]'
          }`}
        >
          <QrCode size={16} />
          <span>Gerador PIX (BR Code / Copia e Cola)</span>
        </button>

      </div>

      {/* =================================================================== */}
      {/* TAB 1: RÉGUA DE COBRANÇA E INADIMPLÊNCIA                            */}
      {/* =================================================================== */}
      {activeTab === 'REGUA' && (
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          
          {/* Cards Gerenciais de Régua de Cobrança */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
            <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total em Inadimplência</p>
                <p className="text-xl font-black text-red-500 font-mono mt-0.5">R$ {formatCurrency(totalInadimplencia)}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ShieldAlert size={18} />
              </div>
            </div>

            <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notificações Enviadas</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-black text-emerald-400">{totalNotificadosCount}</span>
                  <span className="text-[11px] text-slate-400 font-mono">/ {titulosAtrasados.length} pendentes</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Mail size={18} />
              </div>
            </div>

            <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Devedores Ativos</p>
                <p className="text-xl font-black text-slate-100 mt-0.5">{titulosAtrasados.length} Títulos</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertOctagon size={18} />
              </div>
            </div>

            <div className="bg-[#191d27] border border-[#2d3445] rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Canais Disponíveis</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] bg-red-950/80 border border-red-800 text-red-300 px-2 py-0.5 rounded font-mono font-bold">
                    E-mail
                  </span>
                  <span className="text-[10px] bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    WhatsApp
                  </span>
                  <span className="text-[10px] bg-purple-950/80 border border-purple-800 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                    PIX QR
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Send size={18} />
              </div>
            </div>
          </div>

          {/* Tabela da Régua de Cobrança */}
          <div className="bg-[#161922] border border-[#2b3242] rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="text-[11px] uppercase bg-[#111319] text-slate-400 border-b border-[#2b3242] sticky top-0 z-10 font-mono tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Cliente / Razão Social</th>
                    <th className="px-5 py-3.5 font-semibold">Nº Documento</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Vencimento</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Valor Original</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Saldo Atualizado</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Ações de Cobrança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232836]">
                  {titulosAtrasados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                        Nenhum título pendente de cobrança encontrado na carteira financeira.
                      </td>
                    </tr>
                  )}

                  {titulosAtrasados.map((t) => {
                    const cliente = entidades.find(e => e.id === t.id_entidade);
                    const notificacao = notificacoesMap[t.id];
                    const saldoCalculado = calcularSaldoDevedor(t);
                    const vencido = isTituloVencido(t);
                    
                    return (
                      <tr key={t.id} className="hover:bg-[#1f2432]/70 transition-colors group">
                        
                        {/* CLIENTE & CONTATO */}
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            {cliente?.nome || 'Cliente Padrão'}
                            {cliente?.documento && (
                              <span className="text-[10px] font-mono text-slate-500 font-normal">({cliente.documento})</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-3">
                            <span>📞 {cliente?.telefone || 'Não informado'}</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-red-400 font-medium">✉️ {cliente?.email || 'Não informado'}</span>
                          </div>
                        </td>

                        {/* Nº DOCUMENTO */}
                        <td className="px-5 py-3.5 font-mono text-slate-200 font-bold">
                          <span className="bg-[#1e2330] border border-[#2e3748] px-2.5 py-1 rounded text-xs">
                            {t.numero_documento}
                          </span>
                        </td>

                        {/* VENCIMENTO */}
                        <td className="px-5 py-3.5 font-mono text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            vencido ? 'bg-red-950/80 text-red-300 border border-red-800' : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          }`}>
                            {formatDateBR(t.data_vencimento)}
                          </span>
                        </td>

                        {/* VALOR ORIGINAL */}
                        <td className="px-5 py-3.5 font-mono text-right text-slate-400">
                          R$ {formatCurrency(t.valor_original)}
                        </td>

                        {/* SALDO ATUALIZADO */}
                        <td className="px-5 py-3.5 font-mono text-right font-black text-red-500 text-sm">
                          R$ {formatCurrency(saldoCalculado)}
                        </td>

                        {/* AÇÕES DE COBRANÇA */}
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            
                            {/* Botão Gerar PIX Direto do Título */}
                            <button
                              onClick={() => handleGerarPixParaTitulo(t)}
                              className="p-1.5 bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-bold transition-all"
                              title="Gerar QR Code PIX para cobrança deste título"
                            >
                              <QrCode size={14} />
                            </button>

                            {!notificacao ? (
                              <button 
                                onClick={() => handleOpenNotificarModal(t)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase transition-all shadow-[0_0_12px_rgba(220,38,38,0.3)]"
                              >
                                <Send size={13} />
                                Notificar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenNotificarModal(t)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold font-mono border transition-all ${
                                  notificacao.canal === 'EMAIL' 
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}
                                title="Clique para notificar novamente"
                              >
                                <CheckCircle2 size={13} className={notificacao.canal === 'EMAIL' ? 'text-blue-400' : 'text-emerald-400'} />
                                <span>Notificado via {notificacao.canal} ({notificacao.dataHora})</span>
                              </button>
                            )}

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapé da Tabela */}
            <div className="px-5 py-2.5 bg-[#111319] border-t border-[#2b3242] text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span><b>{titulosAtrasados.length}</b> títulos requerem acompanhamento na régua de cobrança</span>
              <span className="text-red-400 font-bold">Total inadimplente: R$ {formatCurrency(totalInadimplencia)}</span>
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: GERADOR PIX NA ÁREA DE COBRANÇA                              */}
      {/* =================================================================== */}
      {activeTab === 'GERADOR_PIX' && (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Painel dos Inputs */}
            <div className="md:col-span-7 bg-[#161922] border border-[#2b3242] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#2b3242] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                    <QrCode size={16} className="text-emerald-400" />
                    Gerador de Payload PIX (BR Code / EMV®)
                  </h3>
                  <p className="text-[11px] text-slate-400">Gere cobranças PIX válidas com cálculo automático de checksum CRC16.</p>
                </div>

                <button
                  type="button"
                  onClick={handleUsarDadosEmpresa}
                  className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm ${
                    dadosTravados 
                      ? 'bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30'
                  }`}
                  title="Puxar dados oficiais de cobrança da empresa e travar campos para segurança fiscal"
                >
                  <Sparkles size={13} className={dadosTravados ? 'text-white' : 'text-emerald-400'} />
                  {dadosTravados ? '✓ Dados Protegidos' : 'Usar Dados da Empresa'}
                </button>
              </div>

              {/* Banner de Proteção Corporativa (Quando dados da empresa são usados) */}
              {dadosTravados && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Lock size={15} className="text-emerald-400 shrink-0" />
                    <span className="font-medium">
                      Chave Corporativa Protegida! Os campos foram bloqueados para evitar divergência de recebimentos.
                    </span>
                  </div>

                  <button
                    onClick={handleLimparEManual}
                    className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-300 hover:text-white bg-[#1a2130] hover:bg-[#232c3f] border border-[#2d374d] px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  >
                    <Unlock size={11} /> Limpar / Digitar Manual
                  </button>
                </div>
              )}

              {pixError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-red-300 font-medium">
                  <AlertTriangle size={16} className="text-red-400 shrink-0" />
                  <span>{pixError}</span>
                </div>
              )}

              <div className="space-y-3">
                
                {/* Chave PIX */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">
                      Chave PIX (E-mail, CPF/CNPJ, Telefone ou Aleatória) <span className="text-red-500">*</span>
                    </label>
                    {dadosTravados && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Lock size={10} /> Protegido
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={pixChave}
                    disabled={dadosTravados}
                    onChange={e => {
                      setPixChave(e.target.value);
                      if (pixError) setPixError(null);
                    }}
                    placeholder={`exemplo@${empresaDomain} ou CPF/CNPJ`}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 transition-colors ${
                      dadosTravados ? 'bg-[#0f1118] border-emerald-500/40 text-emerald-300 cursor-not-allowed' : 'bg-[#11131a] border-[#2b3242]'
                    }`}
                  />

                  <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                    Formatos aceitos: chave@dominio.com, 00000000000 (CPF), 00000000000000 (CNPJ) ou +55...
                  </span>
                </div>

                {/* Nome do Favorecido */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">
                      Nome do Favorecido <span className="text-red-500">*</span>
                    </label>
                    {dadosTravados && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Lock size={10} /> Protegido
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={pixFavorecido}
                    disabled={dadosTravados}
                    onChange={e => {
                      setPixFavorecido(e.target.value);
                      if (pixError) setPixError(null);
                    }}
                    placeholder={empresaConfig.nomeFantasia ? `Ex: ${empresaConfig.nomeFantasia}` : "Nome completo ou Razão Social"}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 transition-colors ${
                      dadosTravados ? 'bg-[#0f1118] border-emerald-500/40 text-emerald-300 cursor-not-allowed' : 'bg-[#11131a] border-[#2b3242]'
                    }`}
                  />
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                    Caracteres especiais e acentos serão removidos automaticamente (Máx: 25 letras).
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Valor (R$) */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
                      Valor em R$ <span className="text-slate-500">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={pixValor}
                      onChange={e => {
                        setPixValor(e.target.value);
                        if (pixError) setPixError(null);
                      }}
                      placeholder="0.00 (Valor Livre se vazio)"
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 font-bold focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Cidade do Favorecido */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
                      Cidade <span className="text-slate-500">(Padrão: SAO PAULO)</span>
                    </label>
                    <input
                      type="text"
                      value={pixCidade}
                      onChange={e => setPixCidade(e.target.value)}
                      placeholder="SAO PAULO"
                      className="w-full bg-[#11131a] border border-[#2b3242] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGerarPix}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-2 flex items-center justify-center gap-2"
                >
                  <QrCode size={16} />
                  Gerar PIX Copia e Cola & QR Code
                </button>
              </div>
            </div>

            {/* Painel do Payload Gerado & QR Code */}
            <div className="md:col-span-5 bg-[#161922] border border-[#2b3242] rounded-2xl p-6 shadow-xl flex flex-col justify-between items-center text-center">
              
              <div className="w-full space-y-4">
                <div className="border-b border-[#2b3242] pb-3 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-400" />
                    QR Code & Copia e Cola Válido
                  </h4>
                  <p className="text-[10px] text-slate-400">Escaneie pelo app bancário ou copie a chave EMV abaixo.</p>
                </div>

                {pixCopiaECola ? (
                  <>
                    {/* Renderização do QR Code em tempo real */}
                    <div className="bg-white p-3 rounded-2xl border-4 border-emerald-500/30 inline-block shadow-2xl mx-auto my-2">
                      <img 
                        src={`https://quickchart.io/qr?text=${encodeURIComponent(pixCopiaECola)}&size=200&margin=1`}
                        alt="QR Code PIX Válido"
                        className="w-44 h-44 object-contain"
                      />
                    </div>

                    <div className="bg-[#11131a] p-3 rounded-xl border border-emerald-500/30 text-left space-y-2">
                      <span className="text-[9px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">
                        Payload EMV® BR Code Válido (Com CRC16):
                      </span>
                      <div className="bg-[#0b0c10] p-2.5 rounded-lg text-[10px] font-mono text-slate-300 break-all select-all border border-[#1f2432] max-h-24 overflow-y-auto">
                        {pixCopiaECola}
                      </div>

                      <button
                        onClick={handleCopiarPix}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                          copied 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white'
                        }`}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Código PIX Copiado!' : 'Copiar Código PIX'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 px-4 border-2 border-dashed border-[#283144] rounded-2xl flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <QrCode size={48} className="text-slate-600 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-400">Nenhum PIX Gerado Ainda</span>
                    <p className="text-[10px] text-slate-500 text-center">
                      Preencha a Chave e o Nome do Favorecido ao lado e clique em "Gerar PIX".
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#2b3242] w-full text-[10px] font-mono text-slate-500">
                Padrão oficial BR Code EMVCo / Banco Central do Brasil
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL: Central de Notificação (E-mail e WhatsApp) */}
      {modalTitulo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isSending && setModalTitulo(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#181c26] border border-[#2e374a] rounded-2xl shadow-2xl flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#2e374a] bg-[#13161f] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                    Notificação de Cobrança - Título {modalTitulo.titulo.numero_documento}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Cliente: <b className="text-slate-200">{modalTitulo.cliente?.nome || 'Cliente'}</b> | Saldo: <b className="text-red-400">R$ {formatCurrency(calcularSaldoDevedor(modalTitulo.titulo))}</b>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => !isSending && setModalTitulo(null)} 
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSending}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Opção E-mail */}
              <div className="bg-[#11131a] p-4 rounded-xl border border-[#2d364a] space-y-3">
                <div className="flex items-center justify-between border-b border-[#232938] pb-2">
                  <span className="font-bold text-red-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <Mail size={15} /> Notificação por E-mail Oficial
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    <Sparkles size={11} /> Modelo Inteligente
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    E-mail do Destinatário:
                  </label>
                  <input
                    type="email"
                    value={emailDestino}
                    onChange={e => setEmailDestino(e.target.value)}
                    placeholder="financeiro@cliente.com.br"
                    className="w-full bg-[#171b26] border border-[#2d364a] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Assunto do E-mail:
                  </label>
                  <input
                    type="text"
                    value={assuntoEmail}
                    onChange={e => setAssuntoEmail(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#2d364a] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Conteúdo da Notificação de Cobrança:
                  </label>
                  <textarea
                    rows={6}
                    value={corpoEmail}
                    onChange={e => setCorpoEmail(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#2d364a] rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Informação do Emitente da Cobrança */}
              <div className="flex items-center gap-2 p-3 bg-[#11131a]/60 border border-[#232938] rounded-xl text-[11px] text-slate-400">
                <Building2 size={15} className="text-slate-400 shrink-0" />
                <span>
                  Remetente Configurado: <b className="text-slate-200">{empresaConfig.nomeFantasia || empresaConfig.razaoSocial}</b> ({empresaConfig.email || 'Sem e-mail cadastrado'})
                </span>
              </div>

            </div>

            {/* Modal Footer with Actions */}
            <div className="px-6 py-4 border-t border-[#2e374a] bg-[#13161f] flex items-center justify-between gap-3">
              <button
                onClick={() => setModalTitulo(null)}
                disabled={isSending}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-[#252c3c] border border-[#2e374a] rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                
                {/* Botão Copiar Texto */}
                <button
                  onClick={handleCopyEmailText}
                  disabled={isSending}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#1e2434] hover:bg-[#283248] border border-[#2e374d] rounded-xl transition-all"
                  title="Copiar texto completo para a área de transferência"
                >
                  <Copy size={13} /> Copiar Texto
                </button>

                {/* Botão WhatsApp */}
                <button
                  onClick={handleSendWhatsapp}
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 rounded-xl transition-all shadow-sm disabled:opacity-50"
                  title="Abrir mensagem preenchida no WhatsApp Web"
                >
                  <MessageSquare size={14} /> WhatsApp
                </button>

                {/* Botão Abrir no Gmail Web */}
                <button
                  onClick={handleSendGmail}
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.35)] disabled:opacity-50"
                  title="Abrir diretamente na tela de compor do Gmail"
                >
                  <Mail size={14} /> Abrir no Gmail
                </button>

                {/* Botão Abrir no Outlook Web */}
                <button
                  onClick={handleSendOutlook}
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-200 bg-sky-950/70 hover:bg-sky-600 hover:text-white border border-sky-500/40 rounded-xl transition-all disabled:opacity-50"
                  title="Abrir no Outlook Web"
                >
                  <Mail size={14} /> Outlook Web
                </button>

                {/* Botão Confirmar Envio e Logar no Sistema */}
                <button
                  onClick={handleConfirmarEnvioNotificacao}
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm disabled:opacity-50"
                  title="Registrar envio de notificação no histórico"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Confirmar Notificação
                    </>
                  )}
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
