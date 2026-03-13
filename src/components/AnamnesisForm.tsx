import React, { useState, useEffect } from 'react';
import { ArrowLeft, PersonStanding, Stethoscope, Zap, Dumbbell, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function AnamnesisForm({ onNavigate, studentId }: { onNavigate: (screen: string, studentId?: string) => void, studentId?: string | null }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: '',
    medicalConditions: [] as string[],
    medicalObservations: '',
    alcohol: '',
    smoke: '',
    sleepHours: '',
    nutritionQuality: '',
    activityLevel: '',
    activities: '',
    objective: ''
  });

  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [students, setStudents] = useState<any[]>([]);
  const [localStudentId, setLocalStudentId] = useState(studentId || '');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'students'), where('coachId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
      setStudents(studentsData);
      
      if (studentId && !formData.fullName) {
        const student = studentsData.find(s => s.id === studentId);
        if (student) {
          setFormData(prev => ({ 
            ...prev, 
            fullName: student.name,
            birthDate: student.birthDate || prev.birthDate,
            gender: student.gender || prev.gender
          }));
        }
      }
    });
    return () => unsubscribe();
  }, [user, studentId]);

  useEffect(() => {
    const requiredFields = [
      'fullName', 'birthDate', 'gender', 'alcohol', 'smoke', 
      'sleepHours', 'nutritionQuality', 'activityLevel', 'objective'
    ];
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return typeof value === 'string' && value.trim() !== '';
    });
    setProgress(Math.round((filledFields.length / requiredFields.length) * 100));
  }, [formData]);

  const handleConditionChange = (condition: string) => {
    setFormData(prev => {
      const conditions = prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter(c => c !== condition)
        : [...prev.medicalConditions, condition];
      return { ...prev, medicalConditions: conditions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (progress < 100) {
      alert("Por favor, preencha todos os campos obrigatórios (*) para continuar.");
      return;
    }

    if (!user || !localStudentId) {
      alert("Selecione um aluno primeiro.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'assessments'), {
        coachId: user.uid,
        studentId: localStudentId,
        type: 'anamnesis',
        date: new Date().toISOString(),
        data: formData
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onNavigate('dashboard');
      }, 2000);
    } catch (error) {
      console.error("Error saving assessment: ", error);
      alert("Erro ao salvar avaliação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setLocalStudentId(selectedId);
    
    const student = students.find(s => s.id === selectedId);
    if (student) {
      setFormData(prev => ({ 
        ...prev, 
        fullName: student.name,
        birthDate: student.birthDate || prev.birthDate,
        gender: student.gender || prev.gender
      }));
    } else {
      setFormData(prev => ({ ...prev, fullName: '' }));
    }
  };

  return (
    <div className="flex-1 pb-24 md:pb-8 overflow-y-auto bg-[#0b1117]">
      {/* Header */}
      <div className="flex items-center bg-[#101922] p-4 md:px-8 pb-2 justify-between sticky top-0 z-10 border-b border-slate-800">
        <div 
          className="text-[#137fec] flex w-10 h-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-800 rounded-full transition-colors"
          onClick={() => onNavigate('dashboard')}
        >
          <ArrowLeft className="w-6 h-6" />
        </div>
        <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          Formulário de Anamnese
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-3 p-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="flex gap-6 justify-between items-center">
          <p className="text-slate-100 text-sm font-medium">Progresso do preenchimento</p>
          <p className="text-[#137fec] text-sm font-bold">{progress}%</p>
        </div>
        <div className="rounded-full bg-slate-800 h-2 overflow-hidden">
          <div className="h-full rounded-full bg-[#137fec] transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <form className="flex flex-col pb-24 md:pb-8 max-w-4xl mx-auto w-full" onSubmit={handleSubmit}>
        
        {/* Section: Personal Information */}
        <div className="px-4 py-3">
          <h3 className="text-[#137fec] text-lg font-bold mb-4 flex items-center gap-2">
            <PersonStanding className="w-5 h-5" />
            Informações Pessoais
          </h3>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col w-full">
              <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Aluno *</span>
              <select 
                value={localStudentId}
                onChange={handleStudentChange}
                className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
                required
              >
                <option value="" disabled>Selecione um aluno...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col w-full">
                <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Data de Nascimento *</span>
                <div className="relative">
                  <input 
                    type="date" 
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none [color-scheme:dark]" 
                  />
                </div>
              </label>
              <label className="flex flex-col w-full">
                <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Sexo *</span>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <hr className="mx-4 my-4 border-slate-800" />

        {/* Section: Medical History */}
        <div className="px-4 py-3">
          <h3 className="text-[#137fec] text-lg font-bold mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Histórico Médico
          </h3>
          <p className="text-slate-400 text-sm mb-4">Você possui ou já possuiu algum dos problemas abaixo?</p>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              "Problemas Cardiovasculares",
              "Problemas Respiratórios (Asma, Bronquite)",
              "Problemas Ortopédicos ou Lesões",
              "Diabetes ou Hipertensão"
            ].map((item) => (
              <label key={item} className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.medicalConditions.includes(item)}
                  onChange={() => handleConditionChange(item)}
                  className="rounded border-slate-700 bg-slate-900 text-[#137fec] focus:ring-[#137fec] h-5 w-5" 
                />
                <span className="text-slate-100 text-sm">{item}</span>
              </label>
            ))}
          </div>

          <label className="flex flex-col w-full mt-4">
            <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Outras observações médicas</span>
            <textarea 
              name="medicalObservations"
              value={formData.medicalObservations}
              onChange={handleChange}
              placeholder="Descreva se necessário..." 
              className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] min-h-[80px] px-4 py-3 outline-none resize-none"
            ></textarea>
          </label>
        </div>

        <hr className="mx-4 my-4 border-slate-800" />

        {/* Section: Lifestyle Habits */}
        <div className="px-4 py-3">
          <h3 className="text-[#137fec] text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Hábitos de Vida
          </h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-3">Frequência de consumo de álcool: *</p>
              <div className="flex flex-wrap gap-2">
                {['Nunca', 'Socialmente', 'Frequente'].map((option) => (
                  <label key={option} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="alcohol" 
                      value={option}
                      checked={formData.alcohol === option}
                      onChange={handleChange}
                      className="peer hidden" 
                    />
                    <span className="px-4 py-2 rounded-full border border-slate-700 bg-slate-900 text-slate-300 text-sm peer-checked:bg-[#137fec] peer-checked:text-white peer-checked:border-[#137fec] block transition-all">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-300 text-sm font-medium mb-3">Hábito de fumar: *</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="smoke" 
                    value="Não fumante"
                    checked={formData.smoke === 'Não fumante'}
                    onChange={handleChange}
                    className="text-[#137fec] focus:ring-[#137fec] bg-slate-900 border-slate-700" 
                  />
                  <span className="text-sm text-slate-300">Não fumante</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="smoke" 
                    value="Fumante"
                    checked={formData.smoke === 'Fumante'}
                    onChange={handleChange}
                    className="text-[#137fec] focus:ring-[#137fec] bg-slate-900 border-slate-700" 
                  />
                  <span className="text-sm text-slate-300">Fumante</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col w-full">
                <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Horas de sono/noite *</span>
                <select 
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="Menos de 6h">Menos de 6h</option>
                  <option value="6h a 8h">6h a 8h</option>
                  <option value="Mais de 8h">Mais de 8h</option>
                </select>
              </label>
              <label className="flex flex-col w-full">
                <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Qualidade da Nutrição *</span>
                <select 
                  name="nutritionQuality"
                  value={formData.nutritionQuality}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Boa">Boa</option>
                  <option value="Regular">Regular</option>
                  <option value="Ruim">Ruim</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <hr className="mx-4 my-4 border-slate-800" />

        {/* Section: Physical Activity History */}
        <div className="px-4 py-3">
          <h3 className="text-[#137fec] text-lg font-bold mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Histórico de Atividade Física
          </h3>
          
          <div className="flex flex-col gap-4">
            <label className="flex flex-col w-full">
              <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Nível de Atividade Atual *</span>
              <select 
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
              >
                <option value="" disabled>Selecione...</option>
                <option value="Sedentário">Sedentário</option>
                <option value="Levemente Ativo">Levemente Ativo (1-2x/semana)</option>
                <option value="Moderadamente Ativo">Moderadamente Ativo (3-5x/semana)</option>
                <option value="Muito Ativo">Muito Ativo (6-7x/semana)</option>
              </select>
            </label>
            
            <label className="flex flex-col w-full">
              <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Quais atividades pratica ou já praticou?</span>
              <input 
                type="text" 
                name="activities"
                value={formData.activities}
                onChange={handleChange}
                placeholder="Ex: Musculação, Corrida, Natação" 
                className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none" 
              />
            </label>
            
            <label className="flex flex-col w-full">
              <span className="text-slate-300 text-sm font-medium pb-1.5 ml-1">Objetivo Principal *</span>
              <textarea 
                name="objective"
                value={formData.objective}
                onChange={handleChange}
                placeholder="Ex: Perda de peso, ganho de massa, saúde..." 
                className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] min-h-[80px] px-4 py-3 outline-none resize-none"
              ></textarea>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-4 py-6 mt-4">
          {isSuccess ? (
            <div className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-5 h-5" />
              Avaliação Salva com Sucesso!
            </div>
          ) : (
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                progress === 100 
                  ? 'bg-[#137fec] hover:bg-[#137fec]/90 text-white shadow-[#137fec]/20' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting ? 'Salvando...' : 'Salvar Avaliação'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
