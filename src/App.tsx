import React, { useState } from 'react';
import { Home, Users, Settings, Activity, FileText, Shield } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { StudentsList } from './components/StudentsList';
import { EvaluationReport } from './components/EvaluationReport';
import { AthleteEvolution } from './components/AthleteEvolution';
import { PosturalAssessment } from './components/PosturalAssessment';
import { AnamnesisForm } from './components/AnamnesisForm';
import { AdminPanel } from './components/AdminPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

function AppContent() {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  if (!user) {
    return <Login />;
  }

  const handleNavigate = (screen: string, studentId?: string) => {
    if (studentId) setSelectedStudentId(studentId);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'students':
        return <StudentsList onNavigate={handleNavigate} />;
      case 'report':
        return <EvaluationReport onNavigate={handleNavigate} studentId={selectedStudentId} />;
      case 'evolution':
        return <AthleteEvolution onNavigate={handleNavigate} studentId={selectedStudentId} />;
      case 'postural':
        return <PosturalAssessment onNavigate={handleNavigate} studentId={selectedStudentId} />;
      case 'anamnesis':
        return <AnamnesisForm onNavigate={handleNavigate} studentId={selectedStudentId} />;
      case 'admin':
        return <AdminPanel onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1117] text-slate-100 font-sans flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#101922] border-r border-slate-800 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="flex w-10 h-10 items-center justify-center rounded-full bg-[#137fec]/10">
            <Activity className="w-6 h-6 text-[#137fec]" />
          </div>
          <span className="text-xl font-bold text-slate-100">PhysiqDash</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => handleNavigate('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentScreen === 'dashboard' ? 'bg-[#137fec]/10 text-[#137fec]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
            <Home className="w-5 h-5" /> <span className="font-medium">Início</span>
          </button>
          <button onClick={() => handleNavigate('students')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentScreen === 'students' ? 'bg-[#137fec]/10 text-[#137fec]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
            <Users className="w-5 h-5" /> <span className="font-medium">Alunos</span>
          </button>
          <button onClick={() => handleNavigate('postural')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentScreen === 'postural' ? 'bg-[#137fec]/10 text-[#137fec]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
            <Activity className="w-5 h-5" /> <span className="font-medium">Avaliação Postural</span>
          </button>
          <button onClick={() => handleNavigate('report')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentScreen === 'report' ? 'bg-[#137fec]/10 text-[#137fec]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
            <FileText className="w-5 h-5" /> <span className="font-medium">Relatórios</span>
          </button>
          <button onClick={() => handleNavigate('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentScreen === 'settings' ? 'bg-[#137fec]/10 text-[#137fec]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
            <Settings className="w-5 h-5" /> <span className="font-medium">Ajustes</span>
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button onClick={() => handleNavigate('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentScreen === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
              <Shield className="w-5 h-5" /> <span className="font-medium">Admin</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-screen relative bg-[#0b1117] overflow-x-hidden">
        
        {/* Main Content Area */}
        {renderScreen()}

        {/* Bottom Navigation Bar (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#101922] border-t border-slate-800 px-6 py-3 flex justify-between items-center z-50">
          <button 
            onClick={() => handleNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'dashboard' ? 'text-[#137fec]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button 
            onClick={() => handleNavigate('students')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'students' ? 'text-[#137fec]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">Alunos</span>
          </button>
          
          {/* Floating Action Button */}
          <div className="relative -top-6">
            <button 
              onClick={() => handleNavigate('postural')}
              className="bg-[#137fec] text-white p-4 rounded-full shadow-lg shadow-[#137fec]/30 hover:bg-[#137fec]/90 transition-transform active:scale-95"
            >
              <Activity className="w-6 h-6" />
            </button>
          </div>
          
          <button 
            onClick={() => handleNavigate('report')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'report' ? 'text-[#137fec]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-[10px] font-medium">Relatórios</span>
          </button>
          <button 
            onClick={() => handleNavigate('settings')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'settings' ? 'text-[#137fec]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>
        </nav>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

