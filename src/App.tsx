import { useState } from 'react';
import { Header } from './components/Header';
import { MenuBar } from './components/MenuBar';
import { Toolbar } from './components/Toolbar';
import { ReportModal } from './components/ReportModal';
import { StatusBar } from './components/StatusBar';
import { OctagonAlert } from 'lucide-react';

// Modals
import { BorderoModal } from './components/modals/BorderoModal';
import { SimplesModal } from './components/modals/SimplesModal';
import { DescontoModal } from './components/modals/DescontoModal';
import { DescCedenteModal } from './components/modals/DescCedenteModal';

// Views
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

const GenericModal = ({ title, isOpen, onClose }: { title: string, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md max-h-[85vh] bg-zinc-900/90 backdrop-blur-xl rounded-xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] border border-zinc-800/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-800/80 flex justify-between items-center flex-shrink-0">
          <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
        </div>
        <div className="p-6 text-sm text-zinc-400 flex-1 overflow-y-auto">
          Esta tela será implementada futuramente.
        </div>
        <div className="px-6 py-4 border-t border-zinc-800/80 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm transition-colors font-medium">Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Toolbar Modals State
  const [openBorderoModal, setOpenBorderoModal] = useState(false);
  const [openSimplesModal, setOpenSimplesModal] = useState(false);
  const [openDescontoModal, setOpenDescontoModal] = useState(false);
  const [openDescCedenteModal, setOpenDescCedenteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerStopToast = () => {
    setToastMessage('Processos interrompidos pelo usuário com STOP');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderView = () => {
    switch (currentView) {
      case 'cadastros': return <CadastrosView />;
      case 'contas_receber': return <ContasReceberView />;
      case 'contas_pagar': return <ContasPagarView />;
      case 'cobranca': return <CobrancaView />;
      case 'arquivo_morto': return <ArquivoMortoView />;
      case 'cheques': return <ChequesView />;
      case 'sistema': return <SistemaView />;
      case 'utilitarios': return <UtilitariosView />;
      case 'dashboard': return <DashboardView />;
      case 'limpeza_base': return <LimpezaBaseView />;
      case 'lancamento_titulos': return <LancamentoTitulosView />;
      case 'home':
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 animate-in fade-in duration-700">
            <div className="w-24 h-24 rounded-2xl bg-zinc-900/50 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.05)] mb-6 border border-zinc-800/50 group hover:border-red-500/50 transition-colors">
               <span className="font-black text-red-600 text-5xl leading-none group-hover:scale-110 transition-transform">M</span>
            </div>
            <h2 className="text-xl font-black text-zinc-300 tracking-widest uppercase">MEZZOLD<span className="text-red-600">.</span></h2>
            <p className="text-xs mt-2 font-mono text-zinc-500 tracking-widest">[ CONTROLE DE TÍTULOS ]</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans antialiased bg-zinc-950 selection:bg-red-500/30">
      <Header />
      <MenuBar 
        onNavigate={setCurrentView} 
        onOpenReport={() => setIsReportModalOpen(true)} 
      />
      <Toolbar 
        onNavigate={setCurrentView}
        onOpenBordero={() => setOpenBorderoModal(true)}
        onOpenSimples={() => setOpenSimplesModal(true)}
        onOpenDesconto={() => setOpenDescontoModal(true)}
        onOpenDescCedente={() => setOpenDescCedenteModal(true)}
        onStopProcess={triggerStopToast}
      />

      <main className="flex-1 relative bg-zinc-950 overflow-hidden flex flex-col z-0">
        {/* Premium Dark Workspace Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-zinc-950 to-zinc-950 pointer-events-none"></div>
        
        {/* Subtle Grid Noise - Mezzold Dark Aesthetic */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} 
        />
        
        {/* Active View Container */}
        <div className="relative z-10 flex-1 overflow-auto">
          {renderView()}
        </div>

        {/* Overlays */}
        <ReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
        />
        <BorderoModal isOpen={openBorderoModal} onClose={() => setOpenBorderoModal(false)} />
        <SimplesModal isOpen={openSimplesModal} onClose={() => setOpenSimplesModal(false)} />
        <DescontoModal isOpen={openDescontoModal} onClose={() => setOpenDescontoModal(false)} />
        <DescCedenteModal isOpen={openDescCedenteModal} onClose={() => setOpenDescCedenteModal(false)} />

        {/* STOP Toast */}
        {toastMessage && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.3)] text-sm font-medium border border-red-400/50 flex items-center gap-2">
              <OctagonAlert size={16} />
              {toastMessage}
            </div>
          </div>
        )}
      </main>

      <StatusBar />
    </div>
  );
}
