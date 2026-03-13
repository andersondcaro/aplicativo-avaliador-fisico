import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Save, CheckCircle2, Users, Upload, BrainCircuit, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenAI } from '@google/genai';

export function PosturalAssessment({ onNavigate, studentId }: { onNavigate: (screen: string, studentId?: string) => void, studentId?: string | null }) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditingResult, setIsEditingResult] = useState(false);
  
  const [students, setStudents] = useState<any[]>([]);
  const [localStudentId, setLocalStudentId] = useState(studentId || '');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [images, setImages] = useState({
    front: null as string | null,
    side: null as string | null,
    back: null as string | null
  });
  
  const [aiResult, setAiResult] = useState('');

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    side: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null)
  };

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

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setLocalStudentId(selectedId);
    const student = students.find(s => s.id === selectedId);
    setSelectedStudent(student || null);
    // Reset state when changing student
    setImages({ front: null, side: null, back: null });
    setAiResult('');
  };

  const handleImageUpload = (view: 'front' | 'side' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImages(prev => ({ ...prev, [view]: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (view: 'front' | 'side' | 'back') => {
    fileInputRefs[view].current?.click();
  };

  const analyzeImages = async () => {
    if (!images.front || !images.side || !images.back) {
      alert("Por favor, faça o upload das 3 fotos (Frontal, Lateral e Posterior) para iniciar a análise.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // In a real app, you would use process.env.GEMINI_API_KEY
      // For this demo, we'll simulate the API call if the key is not available
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        // Simulate AI analysis if no key is provided
        setTimeout(() => {
          setAiResult("Análise Postural Simulada:\n\n**Vista Anterior:**\n- Leve elevação do ombro direito.\n- Triângulo de Talles assimétrico (maior à esquerda).\n- Joelhos com leve tendência ao valgo.\n\n**Vista Lateral:**\n- Cabeça projetada para frente.\n- Hipercifose torácica leve.\n- Hiperlordose lombar moderada.\n- Pelve em anteversão.\n\n**Vista Posterior:**\n- Escápula direita levemente alada.\n- Desvio lateral da coluna (possível atitude escoliótica em C para a esquerda).\n\n**Recomendações:**\n- Fortalecimento de romboides e trapézio médio/inferior.\n- Alongamento de peitorais e flexores de quadril.\n- Fortalecimento do core (transverso do abdômen e glúteos).");
          setIsAnalyzing(false);
        }, 3000);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const parts = [];
      
      // Helper to extract base64 data and mime type
      const processImage = (dataUrl: string) => {
        const [header, base64Data] = dataUrl.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        return {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        };
      };

      parts.push(processImage(images.front));
      parts.push(processImage(images.side));
      parts.push(processImage(images.back));
      parts.push({
        text: "Atue como um fisioterapeuta especialista em biomecânica. Analise estas 3 fotos (vista anterior, lateral e posterior) e forneça uma avaliação postural detalhada. Identifique possíveis desvios (como escoliose, cifose, lordose, joelho valgo/varo, assimetrias de ombros e quadril). Forneça o resultado em formato Markdown, dividido por vistas, e inclua recomendações de exercícios no final."
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts }
      });

      setAiResult(response.text || "Não foi possível gerar a análise.");
    } catch (error) {
      console.error("Error analyzing images:", error);
      alert("Erro ao analisar as imagens. Verifique a chave da API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !localStudentId) {
      alert("Selecione um aluno primeiro.");
      return;
    }

    if (!aiResult) {
      alert("Realize a análise biomecânica antes de salvar.");
      return;
    }

    setIsSaving(true);
    
    try {
      await addDoc(collection(db, 'assessments'), {
        coachId: user.uid,
        studentId: localStudentId,
        type: 'postural_ai',
        date: new Date().toISOString(),
        data: {
          result: aiResult,
          imagesProvided: {
            front: !!images.front,
            side: !!images.side,
            back: !!images.back
          }
        }
      });

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onNavigate('dashboard');
      }, 2000);
    } catch (error) {
      console.error("Error saving assessment: ", error);
      alert("Erro ao salvar avaliação.");
    } finally {
      setIsSaving(false);
    }
  };

  const ImageUploadBox = ({ view, label }: { view: 'front' | 'side' | 'back', label: string }) => (
    <div 
      onClick={() => triggerFileInput(view)}
      className={`relative flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${images[view] ? 'border-[#137fec] bg-slate-900' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500'}`}
    >
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRefs[view]} 
        onChange={(e) => handleImageUpload(view, e)} 
      />
      
      {images[view] ? (
        <>
          <img src={images[view]!} alt={label} className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-0 w-full text-center">
            <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">{label}</span>
          </div>
          <div className="absolute top-3 right-3 bg-black/50 p-2 rounded-full backdrop-blur-sm text-white hover:bg-black/80">
            <RefreshCw className="w-4 h-4" />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-slate-400 p-4 text-center">
          <Upload className="w-8 h-8 mb-2 opacity-50" />
          <span className="font-medium text-sm text-slate-300 mb-1">{label}</span>
          <span className="text-xs opacity-70">Clique para enviar foto</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 pb-24 md:pb-8 overflow-y-auto bg-[#0b1117]">
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#101922] border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="text-slate-400 hover:text-slate-100">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-100">Avaliação Postural Biomecânica</h1>
            <p className="text-xs text-slate-400">Paciente: {selectedStudent ? selectedStudent.name : 'Nenhum Aluno'}</p>
          </div>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-800 text-slate-400">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4 md:px-8 max-w-6xl mx-auto">
        {/* Student Selector */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 mb-6">
          <label className="flex flex-col w-full">
            <span className="text-slate-300 text-sm font-medium pb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Selecione o Aluno
            </span>
            <select 
              value={localStudentId}
              onChange={handleStudentChange}
              className="w-full rounded-lg border-slate-700 bg-slate-900 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
            >
              <option value="" disabled>Selecione um aluno para avaliar...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {selectedStudent ? (
        <main className="px-4 md:px-8 pb-8 max-w-6xl mx-auto space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-100">Fotos da Avaliação</h2>
              <span className="text-xs font-semibold text-amber-500 px-2 py-1 bg-amber-500/10 rounded-full">Obrigatório 3 fotos</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <ImageUploadBox view="front" label="Vista Anterior" />
              <ImageUploadBox view="side" label="Vista Lateral" />
              <ImageUploadBox view="back" label="Vista Posterior" />
            </div>

            <div className="mt-6 flex justify-center">
              <button 
                onClick={analyzeImages}
                disabled={isAnalyzing || !images.front || !images.side || !images.back}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analisando Biomecânica...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5" />
                    Gerar Análise Postural
                  </>
                )}
              </button>
            </div>
          </section>

          {aiResult && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Resultado da Análise Biomecânica</h3>
                </div>
                <button 
                  onClick={() => setIsEditingResult(!isEditingResult)}
                  className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {isEditingResult ? 'Concluir Edição' : 'Editar Texto'}
                </button>
              </div>
              
              {isEditingResult ? (
                <textarea
                  value={aiResult}
                  onChange={(e) => setAiResult(e.target.value)}
                  className="w-full h-96 p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y font-mono"
                />
              ) : (
                <div className="prose prose-invert prose-slate max-w-none">
                  {/* Render simple markdown-like text */}
                  {aiResult.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h4 key={i} className="text-lg font-bold text-slate-200 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="text-slate-300 ml-4 mb-1">{line.substring(2)}</li>;
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="text-slate-300 mb-2">{line}</p>;
                  })}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-800">
                {isSaved ? (
                  <div className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                    <CheckCircle2 className="w-5 h-5" />
                    Avaliação Salva!
                  </div>
                ) : (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-4 bg-[#137fec] text-white font-bold rounded-xl shadow-lg shadow-[#137fec]/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSaving ? 'Salvando...' : 'Salvar Avaliação no Prontuário'}
                  </button>
                )}
              </div>
            </section>
          )}

        </main>
      ) : (
        <div className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-900/20 rounded-xl border border-slate-800 border-dashed">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p>Selecione um aluno acima para iniciar a avaliação postural.</p>
          </div>
        </div>
      )}
    </div>
  );
}
