import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, Database, AlertCircle, CheckCircle2, Key, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';

export function AdminPanel({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAssessments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    stripe: '',
    sendgrid: '',
    custom: ''
  });

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const saveApiKeys = () => {
    // In a real app, save to Firestore or backend securely
    alert("Chaves de API salvas com sucesso!");
  };

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, you'd check if the user has an 'admin' role claim or document.
        // For this demo, we'll try to fetch total counts across the platform.
        // Note: This requires Firestore rules to allow read access to all documents for admins.
        
        const studentsSnapshot = await getCountFromServer(collection(db, 'students'));
        const assessmentsSnapshot = await getCountFromServer(collection(db, 'assessments'));
        
        setStats({
          totalStudents: studentsSnapshot.data().count,
          totalAssessments: assessmentsSnapshot.data().count,
        });
      } catch (err: any) {
        console.error("Error fetching admin stats:", err);
        // If permission denied, it means the user is not an admin according to Firestore rules
        if (err.code === 'permission-denied') {
          setError("Acesso negado. Você não tem permissão de administrador para visualizar todos os dados da plataforma.");
        } else {
          setError("Erro ao carregar estatísticas do sistema.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, [user]);

  return (
    <div className="flex-1 pb-24 md:pb-8 overflow-y-auto bg-[#0b1117]">
      <header className="flex items-center bg-[#101922] p-4 md:px-8 sticky top-0 z-10 border-b border-slate-800">
        <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
          <Shield className="w-6 h-6 text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <h2 className="text-slate-100 text-xl font-bold leading-tight tracking-tight">Painel Administrativo</h2>
          <p className="text-xs text-slate-400">Gerenciamento da Plataforma</p>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col items-center text-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Acesso Restrito</h3>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="mt-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors font-medium text-sm"
            >
              Voltar ao Início
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <Users className="w-5 h-5 text-amber-500 bg-amber-500/10 p-1 rounded-lg box-content" />
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Global</span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-slate-100">{stats.totalStudents}</p>
                  <p className="text-slate-400 text-sm font-medium mt-1">Total de Alunos</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <Activity className="w-5 h-5 text-amber-500 bg-amber-500/10 p-1 rounded-lg box-content" />
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Global</span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-slate-100">{stats.totalAssessments}</p>
                  <p className="text-slate-400 text-sm font-medium mt-1">Avaliações Realizadas</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <Database className="w-5 h-5 text-amber-500 bg-amber-500/10 p-1 rounded-lg box-content" />
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Status</span>
                </div>
                <div className="mt-2">
                  <p className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" /> Operacional
                  </p>
                  <p className="text-slate-400 text-sm font-medium mt-1">Banco de Dados</p>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Configurações do Sistema</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div>
                    <h4 className="font-medium text-slate-200">Modo de Manutenção</h4>
                    <p className="text-sm text-slate-400">Bloqueia o acesso de usuários não-administradores.</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div>
                    <h4 className="font-medium text-slate-200">Novos Cadastros</h4>
                    <p className="text-sm text-slate-400">Permitir que novos treinadores se cadastrem.</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Chaves de API (Integrações)</h3>
                  <p className="text-sm text-slate-400">Gerencie as chaves de API de fornecedores externos.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">OpenAI API Key</label>
                  <input 
                    type="password" 
                    value={apiKeys.openai}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    placeholder="sk-..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">Stripe Secret Key</label>
                  <input 
                    type="password" 
                    value={apiKeys.stripe}
                    onChange={(e) => handleApiKeyChange('stripe', e.target.value)}
                    placeholder="sk_test_..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">SendGrid API Key</label>
                  <input 
                    type="password" 
                    value={apiKeys.sendgrid}
                    onChange={(e) => handleApiKeyChange('sendgrid', e.target.value)}
                    placeholder="SG...." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">Outro Fornecedor (Custom)</label>
                  <input 
                    type="password" 
                    value={apiKeys.custom}
                    onChange={(e) => handleApiKeyChange('custom', e.target.value)}
                    placeholder="Chave de API..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={saveApiKeys}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 px-6 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" /> Salvar Chaves
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
