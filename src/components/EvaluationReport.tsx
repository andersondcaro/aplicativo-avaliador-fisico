import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, MoreVertical, Calendar, Fingerprint, BrainCircuit, CheckCircle2, Info, FileText, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function EvaluationReport({ onNavigate, studentId }: { onNavigate: (screen: string, studentId?: string) => void, studentId?: string | null }) {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [localStudentId, setLocalStudentId] = useState(studentId || '');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'students'), where('coachId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
      setStudents(studentsData);
      
      if (localStudentId) {
        const student = studentsData.find(s => s.id === localStudentId);
        if (student) {
          setSelectedStudent(student);
        }
      }
    });
    return () => unsubscribe();
  }, [user, localStudentId]);

  useEffect(() => {
    if (!user || !localStudentId) {
      setAssessments([]);
      return;
    }
    const q = query(
      collection(db, 'assessments'), 
      where('coachId', '==', user.uid),
      where('studentId', '==', localStudentId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assessmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
      // Sort by date descending
      assessmentsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAssessments(assessmentsData);
    });
    return () => unsubscribe();
  }, [user, localStudentId]);

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setLocalStudentId(selectedId);
    const student = students.find(s => s.id === selectedId);
    setSelectedStudent(student || null);
  };
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 pb-24 md:pb-8 overflow-y-auto bg-[#0b1117] print:bg-white print:text-black">
      <header className="sticky top-0 z-10 flex items-center bg-[#101922]/90 backdrop-blur-md p-4 md:px-8 justify-between border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <div className="text-[#137fec] cursor-pointer" onClick={() => onNavigate('students')}>
            <ArrowLeft className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-100">Relatório de Avaliação</h1>
        </div>
        <div className="flex gap-2 text-slate-400">
          <Share2 className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto print:p-0 print:m-0">
        {/* Student Selector */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 print:hidden">
          <label className="flex flex-col w-full">
            <span className="text-slate-300 text-sm font-medium pb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Selecione o Aluno
            </span>
            <select 
              value={localStudentId}
              onChange={handleStudentChange}
              className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
            >
              <option value="" disabled>Selecione um aluno para ver o relatório...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </label>
        </div>

        {selectedStudent ? (
          <>
            <section className="flex flex-col gap-6 items-center bg-slate-900/40 p-6 rounded-xl border border-slate-800">
              <div className="relative">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 ring-4 ring-[#137fec]/20" style={{backgroundImage: `url(${selectedStudent.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedStudent.name) + '&background=137fec&color=fff'})`}}></div>
                <div className="absolute bottom-0 right-0 bg-emerald-500 h-5 w-5 rounded-full border-4 border-[#101922]"></div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100">{selectedStudent.name}</h2>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-slate-400 text-sm">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedStudent.birthDate ? new Date(selectedStudent.birthDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                  <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> ID: #{selectedStudent.id.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-[#137fec]/10 text-[#137fec] text-xs font-semibold rounded-full border border-[#137fec]/20">
                    Status: {selectedStudent.status || 'Ativo'}
                  </span>
                </div>
              </div>
            </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900/40 border border-slate-800 shadow-sm">
            <p className="text-slate-400 text-sm font-medium">BMI</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-100">22.5</p>
              <span className="text-red-500 text-xs font-bold flex items-center">-0.4%</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900/40 border border-slate-800 shadow-sm">
            <p className="text-slate-400 text-sm font-medium">Gordura Corporal %</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-100">18.2%</p>
              <span className="text-red-500 text-xs font-bold flex items-center">-1.2%</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900/40 border border-slate-800 shadow-sm">
            <p className="text-slate-400 text-sm font-medium">Massa Muscular</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-100">64.2kg</p>
              <span className="text-emerald-500 text-xs font-bold flex items-center">+0.8%</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900/40 border border-slate-800 shadow-sm">
            <p className="text-slate-400 text-sm font-medium">Gordura Visceral</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-100">4.0</p>
              <span className="text-slate-400 text-xs font-bold flex items-center">Estável</span>
            </div>
          </div>
        </section>

        <section className="bg-[#137fec]/10 border border-[#137fec]/20 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#137fec] p-2 rounded-lg text-white">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#137fec]">Recomendações da IA</h3>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#137fec] shrink-0" />
              <p className="text-sm text-slate-300">Sua <span className="font-bold text-slate-100">relação músculo-gordura</span> melhorou 4,2% desde a última avaliação.</p>
            </div>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-[#137fec] shrink-0" />
              <p className="text-sm text-slate-300">Foque na <span className="font-bold text-slate-100">hipertrofia das pernas</span> no próximo mês.</p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="bg-slate-800 p-2 rounded-lg text-slate-300">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Histórico de Avaliações</h3>
          </div>
          
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Nenhuma avaliação encontrada para este aluno.</p>
            ) : (
              assessments.map((assessment) => (
                <div key={assessment.id} className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-100 capitalize">
                      {assessment.type === 'anamnesis' ? 'Avaliação Antropométrica' : 
                       assessment.type === 'postural_ai' ? 'Avaliação Postural Biomecânica' : 
                       assessment.type}
                    </h4>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                      {new Date(assessment.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {assessment.type === 'anamnesis' && assessment.data && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-sm">
                      {assessment.data.weight && (
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-xs">Peso</span>
                          <span className="text-slate-300">{assessment.data.weight} kg</span>
                        </div>
                      )}
                      {assessment.data.height && (
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-xs">Altura</span>
                          <span className="text-slate-300">{assessment.data.height} cm</span>
                        </div>
                      )}
                      {assessment.data.bodyFat && (
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-xs">Gordura Corporal</span>
                          <span className="text-slate-300">{assessment.data.bodyFat}%</span>
                        </div>
                      )}
                      {assessment.data.muscleMass && (
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-xs">Massa Muscular</span>
                          <span className="text-slate-300">{assessment.data.muscleMass} kg</span>
                        </div>
                      )}
                      {assessment.data.visceralFat && (
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-xs">Gordura Visceral</span>
                          <span className="text-slate-300">{assessment.data.visceralFat}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {assessment.type === 'postural_ai' && assessment.data && assessment.data.result && (
                    <div className="mt-3 text-sm text-slate-300 prose prose-invert prose-sm max-w-none">
                      <p className="line-clamp-3">{assessment.data.result.split('\n')[0]}</p>
                      <button className="text-[#137fec] text-xs font-medium mt-1 hover:underline">Ver análise completa</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="bg-slate-800 p-2 rounded-lg text-slate-300">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Interpretação dos Resultados</h3>
          </div>
          
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <div className="space-y-3 mt-4">
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/50">
                <h4 className="font-bold text-slate-100 mb-1">Índice de Massa Corporal (BMI)</h4>
                <p>O valor de 22.5 classifica-se como <strong className="text-emerald-400">Peso Normal</strong> (18.5 - 24.9). Segundo o ACSM, manter o BMI nesta faixa está associado a um menor risco de doenças cardiovasculares e metabólicas.</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/50">
                <h4 className="font-bold text-slate-100 mb-1">Gordura Corporal (18.2%)</h4>
                <p>Para homens, o ACSM estabelece que valores entre 10-22% são considerados saudáveis. Seu percentual indica uma <strong className="text-emerald-400">boa composição corporal</strong>, adequada para objetivos de hipertrofia e condicionamento geral.</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/50">
                <h4 className="font-bold text-slate-100 mb-1">Gordura Visceral (4.0)</h4>
                <p>Níveis abaixo de 10 são considerados <strong className="text-emerald-400">saudáveis</strong>. A gordura visceral baixa indica um risco reduzido de resistência à insulina e inflamação sistêmica, parâmetros cruciais para a saúde metabólica segundo as diretrizes clínicas.</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 italic">
              * Esta interpretação não substitui o diagnóstico médico. Os parâmetros do ACSM são utilizados como referência para prescrição segura e eficaz de exercícios.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4 pt-4 print:hidden">
          <button 
            onClick={handlePrint}
            className="w-full bg-[#137fec] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#137fec]/25 hover:bg-[#137fec]/90 transition-all"
          >
            <FileText className="w-5 h-5" /> Exportar Relatório PDF
          </button>
        </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-900/20 rounded-xl border border-slate-800 border-dashed">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p>Selecione um aluno acima para visualizar o relatório.</p>
          </div>
        )}
      </main>
    </div>
  );
}
