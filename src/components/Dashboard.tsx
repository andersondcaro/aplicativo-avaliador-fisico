import React, { useEffect, useState } from 'react';
import { Activity, Users, ClipboardList, AlertCircle, PlusCircle, UserPlus, FileText, Calendar, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function Dashboard({ onNavigate }: { onNavigate: (screen: string, studentId?: string) => void }) {
  const { user, logout } = useAuth();
  const [studentsCount, setStudentsCount] = useState(0);
  const [assessmentsCount, setAssessmentsCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const studentsQuery = query(collection(db, 'students'), where('coachId', '==', user.uid));
    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      setStudentsCount(snapshot.size);
    });

    const assessmentsQuery = query(collection(db, 'assessments'), where('coachId', '==', user.uid));
    const unsubscribeAssessments = onSnapshot(assessmentsQuery, (snapshot) => {
      setAssessmentsCount(snapshot.size);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeAssessments();
    };
  }, [user]);

  return (
    <div className="flex-1 pb-24 md:pb-8 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center bg-[#101922] p-4 md:px-8 sticky top-0 z-10 border-b border-slate-800">
        <div className="md:hidden flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-[#137fec]/10">
          <Activity className="w-6 h-6 text-[#137fec]" />
        </div>
        <div className="ml-3 md:ml-0 flex-1">
          <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight md:hidden">PhysiqDash</h2>
          <h2 className="text-slate-100 text-xl font-bold leading-tight tracking-tight hidden md:block">Dashboard</h2>
          <p className="text-xs text-slate-400 md:hidden">Physical Evaluation SaaS</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="p-2 text-slate-400 hover:text-slate-100 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#137fec]/20 border border-[#137fec]/30 overflow-hidden">
            <img src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuAdkN2igBMA4Cw7rgebwyEM0Gq1-EWREdM8pg7eiFjc9IJlDY3UaYu661DnFfgg9mDFUN0AVkuJBgsMYIM1RlAFCKJsPDqBU-z5Zi3ToDfHqwpEgIjm85N-SqFBBhqlCQrKb5DGHKVAzJejsIOkT7JtkfgX-cewLeJbQN27t5AVjQmAViEgB169Dw01x2i0oEyjIk12RVCbP3noA6ZCZnkVVUYrp_78eClqq7_x9oTK6HFOGPpy7vo1cCVpAIo-QxIMW75KqOyVuQA"} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <section className="p-4 md:p-8 pt-6 md:pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Bem-vindo de volta, {user?.displayName?.split(' ')[0] || 'Coach'}</h1>
        <p className="text-slate-400 text-sm md:text-base mt-1">Aqui está o que está acontecendo com seus atletas hoje.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:px-8">
        <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <Users className="w-5 h-5 text-[#137fec] bg-[#137fec]/10 p-1 rounded-lg box-content" />
          </div>
          <p className="text-slate-400 text-sm font-medium mt-2">Total de Alunos</p>
          <p className="text-slate-100 text-3xl font-extrabold tracking-tight">{studentsCount}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <ClipboardList className="w-5 h-5 text-[#137fec] bg-[#137fec]/10 p-1 rounded-lg box-content" />
          </div>
          <p className="text-slate-400 text-sm font-medium mt-2">Total de Avaliações</p>
          <p className="text-slate-100 text-3xl font-extrabold tracking-tight">{assessmentsCount}</p>
        </div>
      </section>

      <section className="p-4 md:px-8">
        <h3 className="text-slate-100 text-lg font-bold mb-3 px-1">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button onClick={() => onNavigate('anamnesis')} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#137fec]/20 bg-[#137fec]/10 p-4 text-[#137fec] hover:bg-[#137fec] hover:text-white transition-colors">
            <PlusCircle className="w-6 h-6" />
            <span className="text-sm font-bold">Nova Avaliação</span>
          </button>
          <button onClick={() => onNavigate('students')} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300 hover:border-[#137fec]/50 transition-colors">
            <UserPlus className="w-6 h-6" />
            <span className="text-sm font-bold">Alunos</span>
          </button>
          <button onClick={() => onNavigate('report')} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300 hover:border-[#137fec]/50 transition-colors">
            <FileText className="w-6 h-6" />
            <span className="text-sm font-bold">Gerar Relatório</span>
          </button>
          <button onClick={() => onNavigate('evolution')} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300 hover:border-[#137fec]/50 transition-colors">
            <Calendar className="w-6 h-6" />
            <span className="text-sm font-bold">Evolução</span>
          </button>
        </div>
      </section>
    </div>
  );
}
