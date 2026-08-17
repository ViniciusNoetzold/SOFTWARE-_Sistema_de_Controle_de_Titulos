import { useState } from 'react';
import { UnifiedNavbar } from './components/UnifiedNavbar';
import { ReportModal } from './components/ReportModal';
import { ReportViewerModal } from './components/ReportViewerModal';
import { StatusBar } from './components/StatusBar';
import { WindowFrame } from './components/WindowFrame';
import { 
  Users, DollarSign, CreditCard, AlertOctagon, ArchiveRestore, 
  WalletCards, Settings, Wrench, Activity, Trash2, FilePlus, OctagonAlert, FileText 
} from 'lucide-react';

import { AppProvider, useAppContext } from './context/AppContext';

// Modals
import { BorderoModal } from './components/modals/BorderoModal';
import { SimplesModal } from './components/modals/SimplesModal';
import { DescontoModal } from './components/modals/DescontoModal';
import { DescCedenteModal } from './components/modals/DescCedenteModal';

// Views
import { LoginView } from './components/views/LoginView';
import { UsuariosView } from './components/views/UsuariosView';
import { CadastrosView } from './components/views/CadastrosView';
import { ArquivoMortoView } from './components/views/ArquivoMortoView';
import { ChequesView } from './components/views/ChequesView';
import { SistemaView } from './components/views/SistemaView';
import { UtilitariosView } from './components/views/UtilitariosView';
import { ContasReceberView } from './components/views/ContasReceberView';
import { ContasPagarView } from './components/views/ContasPagarView';
import { CobrancaView } from './components/views/CobrancaView';
import { DashboardView } from './components/views/DashboardView';
import { LimpezaBaseView } from './components/views/LimpezaBaseView';
import { LancamentoTitulosView } from './components/views/LancamentoTitulosView';
import { RelatoriosView } from './components/views/RelatoriosView';

// Licença & Bloqueio
import { LicencaMasterModal } from './components/modals/LicencaMasterModal';
import { SistemaBloqueadoOverlay } from './components/SistemaBloqueadoOverlay';
import { AlertaVencimentoModal } from './components/modals/AlertaVencimentoModal';

function MainAppContent() {
  const { currentUser, toastMessage, showToast } = useAppContext();

  const [currentView, setCurrentView] = useState<string>('home');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [reportFilterData, setReportFilterData] = useState<any>(null);
  const [isMasterLicencaOpen, setIsMasterLicencaOpen] = useState(false);
  const [isAlertaVencimentoOpen, setIsAlertaVencimentoOpen] = useState(false);
  
  // Toolbar Modals State
  const [openBorderoModal, setOpenBorderoModal] = useState(false);
  const [openSimplesModal, setOpenSimplesModal] = useState(false);
  const [openDescontoModal, setOpenDescontoModal] = useState(false);
  const [openDescCedenteModal, setOpenDescCedenteModal] = useState(false);

  // Se não estiver autenticado, exibe a Tela de Login Obrigatória
  if (!currentUser) {
    return <LoginView />;
  }

  // Fecha todas as janelas modais de relatórios/ferramentas sobrepostas
  const closeAllModals = () => {
    setIsReportModalOpen(false);
    setIsReportViewerOpen(false);
    setOpenBorderoModal(false);
    setOpenSimplesModal(false);
    setOpenDescontoModal(false);
    setOpenDescCedenteModal(false);
  };

  // Navegação principal que fecha automaticamente qualquer modal que esteja aberto por cima
  const handleNavigate = (view: string) => {
    closeAllModals();
    setCurrentView(view);
  };

  const handleCloseWindow = () => {
    setCurrentView('home');
  };

  const handleOpenReportViewer = (filterOptions: any) => {
    setReportFilterData(filterOptions);
    setIsReportModalOpen(false);
    setIsReportViewerOpen(true);
  };

  const renderActiveWindow = () => {
    switch (currentView) {
      case 'cadastros':
        return (
          <WindowFrame title="Central de Cadastros" subtitle="Gerencie clientes e fornecedores do sistema" icon={<Users size={18} />} onClose={handleCloseWindow}>
            <CadastrosView />
          </WindowFrame>
        );
      case 'contas_receber':
        return (
          <WindowFrame title="Contas a Receber" subtitle="Gestão de carteira de recebíveis, baixas e emissões" icon={<DollarSign size={18} />} onClose={handleCloseWindow}>
            <ContasReceberView />
          </WindowFrame>
        );
      case 'contas_pagar':
        return (
          <WindowFrame title="Contas a Pagar" subtitle="Gestão de obrigações, pagamentos e fornecedores" icon={<CreditCard size={18} />} onClose={handleCloseWindow}>
            <ContasPagarView />
          </WindowFrame>
        );
      case 'cobranca':
        return (
          <WindowFrame title="Régua de Cobrança" subtitle="Gestão de inadimplência, juros e notificações" icon={<AlertOctagon size={18} />} onClose={handleCloseWindow}>
            <CobrancaView />
          </WindowFrame>
        );
      case 'relatorios':
        return (
          <WindowFrame title="Central de Relatórios Gerenciais" subtitle="Emissão, análises sintéticas por mês, cliente e exportação CSV/PDF" icon={<FileText size={18} />} onClose={handleCloseWindow}>
            <RelatoriosView />
          </WindowFrame>
        );
      case 'arquivo_morto':
        return (
          <WindowFrame title="Arquivo Morto" subtitle="Consulta de títulos liquidados, encerrados e histórico" icon={<ArchiveRestore size={18} />} onClose={handleCloseWindow}>
            <ArquivoMortoView />
          </WindowFrame>
        );
      case 'cheques':
        return (
          <WindowFrame title="Gestão de Cheques" subtitle="Controle de cheques emitidos e recebidos, custódia e auditoria por usuário" icon={<WalletCards size={18} />} onClose={handleCloseWindow}>
            <ChequesView />
          </WindowFrame>
        );
      case 'sistema':
        return (
          <WindowFrame title="Configurações do Sistema" subtitle="Gerencie os parâmetros globais, acessos e auditoria" icon={<Settings size={18} />} onClose={handleCloseWindow}>
            <SistemaView />
          </WindowFrame>
        );
      case 'usuarios':
        return (
          <WindowFrame title="Gestão de Usuários e Permissões" subtitle="Controle de contas, perfis e permissões de acesso (Admin)" icon={<Users size={18} />} onClose={handleCloseWindow}>
            <UsuariosView />
          </WindowFrame>
        );
      case 'utilitarios':
        return (
          <WindowFrame title="Utilitários e Ferramentas" subtitle="Calculadora financeira e rotinas de intercâmbio CNAB" icon={<Wrench size={18} />} onClose={handleCloseWindow}>
            <UtilitariosView />
          </WindowFrame>
        );
      case 'dashboard':
        return (
          <WindowFrame title="Dashboard Gerencial" subtitle="Visão geral do desempenho financeiro" icon={<Activity size={18} />} onClose={handleCloseWindow}>
            <DashboardView 
              onNavigate={handleNavigate}
              onOpenBordero={() => { closeAllModals(); setOpenBorderoModal(true); }}
              onOpenReport={() => { closeAllModals(); handleNavigate('relatorios'); }}
            />
          </WindowFrame>
        );
      case 'limpeza_base':
        return (
          <WindowFrame title="Limpeza de Base de Dados" subtitle="Rotina de purga e arquivamento estrutural" icon={<Trash2 size={18} />} onClose={handleCloseWindow}>
            <LimpezaBaseView />
          </WindowFrame>
        );
      case 'lancamento_titulos':
        return (
          <WindowFrame title="Lançamento de Títulos" subtitle="Registre novos títulos de crédito, duplicatas e promissórias" icon={<FilePlus size={18} />} onClose={handleCloseWindow}>
            <LancamentoTitulosView />
          </WindowFrame>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans antialiased bg-[#0e1014] text-slate-200 selection:bg-red-500/30">
      <UnifiedNavbar 
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenReport={() => { closeAllModals(); handleNavigate('relatorios'); }}
        onOpenBordero={() => { closeAllModals(); setOpenBorderoModal(true); }}
        onOpenSimples={() => { closeAllModals(); setOpenSimplesModal(true); }}
        onOpenDesconto={() => { closeAllModals(); setOpenDescontoModal(true); }}
        onOpenDescCedente={() => { closeAllModals(); setOpenDescCedenteModal(true); }}
        onStopProcess={() => { closeAllModals(); showToast('Processos interrompidos pelo usuário com STOP'); }}
        onOpenMasterLicenca={() => { closeAllModals(); setIsMasterLicencaOpen(true); }}
      />

      <main className="flex-1 relative bg-[#0e1014] overflow-hidden flex flex-col z-0">
        {/* Premium Slate Dark Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1c212b] via-[#0e1014] to-[#0e1014] pointer-events-none"></div>
        
        {/* Subtle Grid Noise */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} 
        />
        
        {/* Workspace Base: Dashboard / Gráficos Direto no Centro */}
        <div className={`flex-1 p-3 md:p-4 overflow-hidden relative z-0 ${currentView !== 'home' ? 'no-print' : ''}`}>
          <DashboardView 
            onNavigate={handleNavigate}
            onOpenBordero={() => { closeAllModals(); setOpenBorderoModal(true); }}
            onOpenReport={() => { closeAllModals(); handleNavigate('relatorios'); }}
          />
        </div>

        {/* Active Floating Internal Window (Abre por cima do Dashboard) */}
        {renderActiveWindow()}

        {/* Overlays de Ferramentas & Relatórios */}
        <ReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)}
          onGenerateReport={handleOpenReportViewer}
        />
        <ReportViewerModal
          isOpen={isReportViewerOpen}
          onClose={() => setIsReportViewerOpen(false)}
          filterOptions={reportFilterData}
        />
        <BorderoModal isOpen={openBorderoModal} onClose={() => setOpenBorderoModal(false)} />
        <SimplesModal isOpen={openSimplesModal} onClose={() => setOpenSimplesModal(false)} />
        <DescontoModal isOpen={openDescontoModal} onClose={() => setOpenDescontoModal(false)} />
        <DescCedenteModal isOpen={openDescCedenteModal} onClose={() => setOpenDescCedenteModal(false)} />

        {/* Modal Informativo de Vencimento e Chave PIX (Acionado ao clicar no alerta piscando) */}
        <AlertaVencimentoModal 
          isOpen={isAlertaVencimentoOpen} 
          onClose={() => setIsAlertaVencimentoOpen(false)} 
        />

        {/* Modal de Gestão da Licença (Mestre 000) */}
        <LicencaMasterModal 
          isOpen={isMasterLicencaOpen} 
          onClose={() => setIsMasterLicencaOpen(false)} 
        />

        {/* Bloqueio do Sistema Caso Expirado ou Bloqueado Manualmente */}
        <SistemaBloqueadoOverlay />

        {/* Toast Component */}
        {toastMessage && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
            <div className="bg-red-600/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-[0_0_25px_rgba(220,38,38,0.4)] text-sm font-medium border border-red-500/50 flex items-center gap-2">
              <OctagonAlert size={16} />
              {toastMessage}
            </div>
          </div>
        )}
      </main>

      <StatusBar 
        onOpenMasterLicenca={() => setIsMasterLicencaOpen(true)}
        onOpenAlertaVencimento={() => setIsAlertaVencimentoOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
