import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Dumbbell, MoreVertical, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function StudentsList({ onNavigate }: { onNavigate: (screen: string, studentId?: string) => void }) {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'AVAL. PENDENTE', birthDate: '', gender: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'students'), where('coachId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (student?: any) => {
    if (student) {
      setEditingStudentId(student.id);
      setFormData({ 
        name: student.name, 
        status: student.status || 'AVAL. PENDENTE',
        birthDate: student.birthDate || '',
        gender: student.gender || ''
      });
    } else {
      setEditingStudentId(null);
      setFormData({ name: '', status: 'AVAL. PENDENTE', birthDate: '', gender: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudentId(null);
    setFormData({ name: '', status: 'AVAL. PENDENTE', birthDate: '', gender: '' });
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !user) return;

    try {
      const studentData: any = {
        name: formData.name,
        status: formData.status,
      };
      
      if (formData.birthDate) studentData.birthDate = formData.birthDate;
      if (formData.gender) studentData.gender = formData.gender;

      if (editingStudentId) {
        // Update existing student
        const studentRef = doc(db, 'students', editingStudentId);
        await updateDoc(studentRef, studentData);
      } else {
        // Create new student
        await addDoc(collection(db, 'students'), {
          coachId: user.uid,
          createdAt: serverTimestamp(),
          ...studentData
        });
      }
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving student: ", error);
      alert("Erro ao salvar aluno: " + error.message);
    }
  };

  const handleDeleteStudent = async (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentToDelete(studentId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteDoc(doc(db, 'students', studentToDelete));
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
      } catch (error) {
        console.error("Error deleting student: ", error);
        // Using console.error instead of alert due to iframe restrictions
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 pb-24 md:pb-8 overflow-y-auto relative">
      <header className="sticky top-0 z-10 bg-[#101922]/90 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center p-4 md:px-8 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#137fec]/10 text-[#137fec]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Alunos</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="p-2 bg-[#137fec] hover:bg-[#137fec]/90 rounded-full transition-colors text-white shadow-lg shadow-[#137fec]/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 md:px-8 pb-4">
          <div className="relative group max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome..." 
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-[#137fec] focus:border-[#137fec] transition-all text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p>Nenhum aluno encontrado.</p>
          </div>
        ) : (
          filteredStudents.map(student => (
            <div 
              key={student.id} 
              onClick={() => onNavigate('report', student.id)}
              className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm hover:border-[#137fec]/50 transition-colors cursor-pointer group hover:shadow-md hover:shadow-[#137fec]/5"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-800 text-[#137fec] font-bold">
                  {student.name.substring(0, 2).toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#101922] ${student.status === 'ATIVO' ? 'bg-emerald-500' : student.status === 'INATIVO' ? 'bg-slate-500' : 'bg-amber-500'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-100 truncate">{student.name}</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(student); }}
                      className="p-1.5 text-slate-400 hover:text-[#137fec] hover:bg-[#137fec]/10 rounded-lg transition-colors"
                      title="Editar Aluno"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteStudent(student.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Excluir Aluno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block ${student.status === 'ATIVO' ? 'text-emerald-500 bg-emerald-500/10' : student.status === 'INATIVO' ? 'text-slate-500 bg-slate-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                  {student.status || 'AVAL. PENDENTE'}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#137fec] transition-colors ml-2" />
            </div>
          ))
        )}
      </main>

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100">{editingStudentId ? 'Editar Aluno' : 'Novo Aluno'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Aluno *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none"
                  placeholder="Ex: João Silva"
                  autoFocus
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Data de Nasc.</label>
                  <input 
                    type="date" 
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Gênero</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status *</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:ring-[#137fec] focus:border-[#137fec] h-12 px-4 outline-none appearance-none"
                  required
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="AVAL. PENDENTE">Avaliação Pendente</option>
                </select>
              </div>
              <button 
                type="submit"
                disabled={!formData.name.trim()}
                className="w-full bg-[#137fec] text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#137fec]/90 transition-colors mt-2"
              >
                {editingStudentId ? 'Salvar Alterações' : 'Adicionar Aluno'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Excluir Aluno</h3>
            <p className="text-slate-400 mb-6 text-sm">Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.</p>
            <div className="flex gap-3">
              <button 
                onClick={cancelDelete}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
