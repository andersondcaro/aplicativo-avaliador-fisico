import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity } from 'lucide-react';

export function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#101922] text-slate-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-16 h-16 items-center justify-center rounded-full bg-[#137fec]/10">
            <Activity className="w-8 h-8 text-[#137fec]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-100">PhysiqDash</h1>
            <p className="text-slate-400 mt-2">Plataforma de Avaliação Física</p>
          </div>
        </div>

        <button 
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
