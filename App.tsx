
import React, { useState, useEffect } from 'react';
import { AppTab, FarmData } from './types';
import Dashboard from './components/Dashboard';
import BrainChat from './components/BrainChat';
import VisionModule from './components/VisionModule';
import FinanceModule from './components/FinanceModule';
import MapsModule from './components/MapsModule';
import Maps3DModule from './components/Maps3DModule';
import SimulationModule from './components/SimulationModule';
import NLPModule from './components/NLPModule';
import SoilAnalysisModule from './components/SoilAnalysisModule';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import { MOCK_FARM } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [farm, setFarm] = useState<FarmData>(MOCK_FARM);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Simulação de verificação de sessão Firebase
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (userData: any, isNew: boolean = false) => {
    setUser(userData);
    setIsNewUser(isNew);
  };

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 800);
  };

  const handleOnboardingComplete = (data: Partial<FarmData>) => {
    setFarm(prev => ({ ...prev, ...data }));
    setIsNewUser(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-950 text-white p-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-brain text-2xl text-emerald-400 animate-pulse"></i>
          </div>
        </div>
        <h1 className="text-2xl font-black mt-8 mb-2 tracking-tighter">Cérebro Digital</h1>
        <p className="text-emerald-300 text-center text-xs font-bold uppercase tracking-widest opacity-60">Sincronizando Telemetria Neural...</p>
      </div>
    );
  }

  // Se não houver usuário, exibe a tela de login
  if (!user) {
    return <Login onLogin={(u) => handleLogin(u)} onRegister={(u) => handleLogin(u, true)} />;
  }

  // Se for usuário novo, força o Onboarding
  if (isNewUser) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return <Dashboard farmData={farm} />;
      case AppTab.BRAIN: return <BrainChat />;
      case AppTab.VISION: return <VisionModule />;
      case AppTab.FINANCE: return <FinanceModule />;
      case AppTab.MAPS: return <MapsModule />;
      case AppTab.MAPS_3D: return <Maps3DModule />;
      case AppTab.SIMULATION: return <SimulationModule />;
      case AppTab.ANALYST: return <NLPModule />;
      case AppTab.SOIL: return <SoilAnalysisModule />;
      default: return <Dashboard farmData={farm} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="agro-gradient text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <i className="fas fa-brain text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg font-black leading-none tracking-tight">Cérebro Digital</h1>
            <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">{farm.name} • {farm.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-white/80 hover:text-white transition-colors">
            <i className="fas fa-bell"></i>
            <span className="absolute top-1 right-1 bg-red-500 text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-emerald-900 font-black">2</span>
          </button>
          
          <div className="group relative">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 p-1.5 rounded-full pr-3 transition-all">
              <img src={user.photoURL} className="w-7 h-7 rounded-full border border-white/30" alt="Avatar" />
              <div className="text-left hidden xs:block">
                <p className="text-[9px] font-black uppercase leading-none">{user.displayName}</p>
                <p className="text-[7px] text-emerald-300 font-bold uppercase tracking-tighter">ONLINE</p>
              </div>
            </button>
            {/* Tooltip Logout */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform origin-top-right scale-95 group-hover:scale-100 z-[100]">
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-black uppercase tracking-widest"
               >
                 <i className="fas fa-power-off"></i> Sair do Sistema
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20">
        {renderContent()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="flex justify-around items-center p-2 max-w-lg mx-auto">
          <NavButton 
            active={activeTab === AppTab.DASHBOARD} 
            onClick={() => setActiveTab(AppTab.DASHBOARD)} 
            icon="fas fa-th-large" 
            label="Início" 
          />
          <NavButton 
            active={activeTab === AppTab.MAPS} 
            onClick={() => setActiveTab(AppTab.MAPS)} 
            icon="fas fa-map-marked-alt" 
            label="Mapa" 
          />
          <NavButton 
            active={activeTab === AppTab.BRAIN} 
            onClick={() => setActiveTab(AppTab.BRAIN)} 
            icon="fas fa-comment-dots" 
            label="Cérebro" 
            featured
          />
          <NavButton 
            active={activeTab === AppTab.MAPS_3D} 
            onClick={() => setActiveTab(AppTab.MAPS_3D)} 
            icon="fas fa-cube" 
            label="Visão 3D" 
          />
          <NavButton 
            active={activeTab === AppTab.FINANCE} 
            onClick={() => setActiveTab(AppTab.FINANCE)} 
            icon="fas fa-chart-line" 
            label="Finanças" 
          />
        </div>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  featured?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, featured }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${featured ? 'relative -top-4' : ''}`}
  >
    <div className={`
      ${featured ? 'w-14 h-14 rounded-full agro-gradient text-white flex items-center justify-center shadow-lg border-4 border-white' : 'p-2'}
      ${active && !featured ? 'text-emerald-700' : featured ? '' : 'text-gray-400'}
    `}>
      <i className={`${icon} ${featured ? 'text-xl' : 'text-lg'}`}></i>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'text-emerald-700' : 'text-gray-500'} ${featured ? 'mt-1' : ''}`}>
      {label}
    </span>
  </button>
);

export default App;
