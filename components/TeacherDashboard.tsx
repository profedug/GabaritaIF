
import React, { useState, useRef } from 'react';
import { Question, Simulation, Source, Difficulty, StudentResponse, Student, Class, Professor, QuestionSource, SimulationType } from '../types';
import { generateQuestions } from '../geminiService';
import { Brain, List, Users, BarChart3, Loader2, UserPlus, Trash2, Search, Plus, Edit3, ShieldCheck, Clock, Target, Camera, UserCircle, Check, X, Sparkles, Key, FileText, ChevronRight, Eye, Layers } from 'lucide-react';

interface Props {
  questions: Question[];
  simulations: Simulation[];
  students: Student[];
  classes: Class[];
  results: StudentResponse[];
  professors: Professor[];
  userRole: 'super_admin' | 'admin_professor' | 'professor';
  currentUser: Professor;
  onUpdateProfile: (data: Partial<Professor>) => void;
  onAddQuestion: (qs: Question[]) => void;
  onCreateSimulation: (s: Simulation) => void;
  onAddStudent: (s: Student) => void;
  onUpdateStudent: (s: Student) => void;
  onRemoveStudent: (id: string) => void;
  onAddClass: (c: Class) => void;
  onDeleteClass: (id: string) => void;
  onAddProfessor: (p: Professor) => void;
  onUpdateProfessor: (p: Professor) => void;
  onRemoveProfessor: (id: string) => void;
}

const Logo: React.FC<{ theme?: 'light' | 'dark', size?: string }> = ({ theme = 'light', size = 'text-5xl' }) => (
  <div className={`font-rubik ${size} select-none tracking-tight`}>
    <span className={theme === 'light' ? 'logo-gabarita-black' : 'logo-gabarita-white'}>Gabarita</span>
    <span className="logo-if">IF</span>
  </div>
);

// Added TabButton component to fix the "Cannot find name 'TabButton'" error.
const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
      active 
      ? 'bg-[#00A859] text-white shadow-lg shadow-[#00A859]/20 translate-y-[-1px]' 
      : 'bg-white text-slate-400 border-2 border-slate-50 hover:border-[#00A859] hover:text-[#00A859]'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const TeacherDashboard: React.FC<Props> = ({ 
  questions, simulations, students, classes, results, professors, userRole, currentUser,
  onUpdateProfile, onAddQuestion, onCreateSimulation, onAddStudent, onUpdateStudent, onRemoveStudent, onAddClass, onDeleteClass,
  onAddProfessor, onUpdateProfessor, onRemoveProfessor
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'bank' | 'management' | 'results' | 'professors' | 'profile'>('create');
  const [mgmtTab, setMgmtTab] = useState<'students' | 'classes'>('students');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[] | null>(null);
  const [viewingSimQuestions, setViewingSimQuestions] = useState<Simulation | null>(null);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewingSpecificResult, setViewingSpecificResult] = useState<StudentResponse | null>(null);

  const [simForm, setSimForm] = useState({
    theme: '', 
    year: 'Ingresso IF', 
    difficulty: Difficulty.MEDIUM, 
    totalQuestions: 5, 
    optionsCount: 4, 
    type: SimulationType.TREINO, 
    classId: '', 
    source: QuestionSource.MIXED
  });

  const [studentForm, setStudentForm] = useState({ name: '', email: '', whatsapp: '', pin: '', parentName: '', parentPhone: '', classId: '' });
  const [classForm, setClassForm] = useState({ name: '', year: '2025' });
  const [profForm, setProfForm] = useState({ name: '', email: '', pin: '', isAdmin: false });
  const [editingProfId, setEditingProfId] = useState<string | null>(null);

  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = userRole === 'super_admin';

  const handleGenerateSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simForm.theme.trim() || !simForm.classId) return alert("Preencha o tema e a turma.");
    
    setIsGenerating(true);
    try {
      const generated = await generateQuestions(
        simForm.theme, simForm.year, simForm.difficulty, simForm.totalQuestions, simForm.optionsCount, simForm.source
      );
      setPreviewQuestions(generated);
    } catch (error) {
      alert("Erro ao gerar questões.");
    } finally { 
      setIsGenerating(false); 
    }
  };

  const publishSimulation = () => {
    if (!previewQuestions) return;
    
    const newSim: Simulation = {
      id: Math.random().toString(36).substr(2, 9),
      title: `${simForm.type}: ${simForm.theme}`,
      type: simForm.type,
      teacherId: currentUser.id,
      teacherName: currentUser.nickname || currentUser.name,
      year: simForm.year,
      classId: simForm.classId,
      targetStudentIds: [],
      questions: previewQuestions,
      createdAt: Date.now()
    };
    
    onCreateSimulation(newSim);
    onAddQuestion(previewQuestions);
    setPreviewQuestions(null);
    setActiveTab('bank');
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClass({ ...classForm, id: Math.random().toString(36).substr(2, 9) });
    setClassForm({ name: '', year: '2025' });
  };

  const handleProfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfId) {
      onUpdateProfessor({ ...profForm, id: editingProfId, hasAccess: true } as Professor);
      setEditingProfId(null);
    } else {
      onAddProfessor({ ...profForm, id: Math.random().toString(36).substr(2, 9), hasAccess: true } as Professor);
    }
    setProfForm({ name: '', email: '', pin: '', isAdmin: false });
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) return setPinMessage('Mínimo 4 caracteres.');
    onUpdateProfile({ pin: newPin });
    setNewPin('');
    setPinMessage('PIN atualizado!');
    setTimeout(() => setPinMessage(''), 2000);
  };

  // Visualização de Desempenho Detalhado por Aluno
  const StudentDetailsModal = ({ student }: { student: Student }) => {
    const studentResults = results.filter(r => r.studentId === student.id);
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[4rem] shadow-2xl flex flex-col border-8 border-slate-50">
          <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-[#00A859] flex items-center justify-center text-white text-2xl font-black">
                {student.name[0]}
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800">{student.name}</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Desempenho Individual • {classes.find(c => c.id === student.classId)?.name}</p>
              </div>
            </div>
            <button onClick={() => setSelectedStudent(null)} className="p-4 bg-white border-2 border-slate-100 rounded-3xl hover:text-red-500 transition-all shadow-sm">
              <X size={28}/>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-12 space-y-8 custom-scrollbar">
            {studentResults.length === 0 ? (
              <div className="text-center py-20 text-slate-300 italic font-bold">Este aluno ainda não realizou simulados.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {studentResults.map(res => {
                  const sim = simulations.find(s => s.id === res.simulationId);
                  return (
                    <div key={res.id} className="p-8 border-2 border-slate-50 rounded-[3rem] hover:border-[#00A859] transition-all bg-white shadow-sm flex items-center justify-between group">
                      <div>
                        <p className="font-black text-slate-800 text-xl">{sim?.title.split(': ')[1] || 'Simulado'}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Realizado em {new Date(res.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-3xl font-black text-[#00A859]">{res.score}/{sim?.questions.length}</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Acertos</p>
                        </div>
                        <button onClick={() => setViewingSpecificResult(res)} className="p-5 bg-slate-50 rounded-2xl group-hover:bg-[#00A859] group-hover:text-white transition-all shadow-sm">
                          <Eye size={24}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {viewingSpecificResult && (
          <ResultBreakdownModal result={viewingSpecificResult} onClose={() => setViewingSpecificResult(null)} />
        )}
      </div>
    );
  };

  const ResultBreakdownModal = ({ result, onClose }: { result: StudentResponse, onClose: () => void }) => {
    const sim = simulations.find(s => s.id === result.simulationId);
    if (!sim) return null;

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[130] flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[4rem] shadow-2xl flex flex-col">
          <div className="p-10 border-b flex justify-between items-center">
            <h3 className="text-2xl font-black">Detalhamento por Questão</h3>
            <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-3xl transition-all"><X size={28}/></button>
          </div>
          <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
            {sim.questions.map((q, i) => {
              const isCorrect = result.answers[i] === q.correctAnswer;
              return (
                <div key={q.id} className={`p-10 rounded-[3rem] border-4 ${isCorrect ? 'border-emerald-50 bg-emerald-50/20' : 'border-red-50 bg-red-50/20'} space-y-6`}>
                   <div className="flex justify-between items-start gap-4">
                      <p className="font-black text-slate-800 text-xl leading-tight">Questão {i+1}: {q.statement}</p>
                      {isCorrect ? <Check className="text-emerald-500 shrink-0" size={32}/> : <X className="text-red-500 shrink-0" size={32}/>}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, idx) => {
                        const isSelected = result.answers[i] === idx;
                        const isCorrectOption = q.correctAnswer === idx;
                        return (
                          <div key={idx} className={`p-5 rounded-2xl text-sm font-bold border-2 ${
                            isCorrectOption ? 'bg-emerald-500 text-white border-emerald-500' :
                            isSelected ? 'bg-red-500 text-white border-red-500' :
                            'bg-white text-slate-500 border-slate-100'
                          }`}>
                            <span className="opacity-50 mr-2">{String.fromCharCode(65 + idx)})</span> {opt}
                          </div>
                        );
                      })}
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {selectedStudent && <StudentDetailsModal student={selectedStudent} />}
      
      {/* Navegação Superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex flex-wrap gap-2">
           <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} icon={<Brain size={18}/>} label="Gerador IA" />
           <TabButton active={activeTab === 'bank'} onClick={() => setActiveTab('bank')} icon={<List size={18}/>} label="Histórico" />
           <TabButton active={activeTab === 'management'} onClick={() => setActiveTab('management')} icon={<Users size={18}/>} label="Escola" />
           <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} icon={<BarChart3 size={18}/>} label="Relatórios" />
           {isSuperAdmin && <TabButton active={activeTab === 'professors'} onClick={() => setActiveTab('professors')} icon={<ShieldCheck size={18}/>} label="Equipe" />}
        </div>
        <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 p-3 bg-white border-2 rounded-2xl transition-all shadow-sm ${activeTab === 'profile' ? 'border-[#00A859]' : 'border-slate-50 hover:border-[#00A859]'}`}>
           <UserCircle size={20} className="text-[#00A859]"/>
           <span className="text-xs font-black text-slate-700 uppercase">Perfil</span>
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="max-w-4xl mx-auto space-y-10">
          {!previewQuestions ? (
            <div className="bg-white rounded-[3.5rem] shadow-2xl p-12 border border-slate-50 animate-fadeIn space-y-10">
              <div className="text-center space-y-2">
                 <Logo theme="light" size="text-4xl" />
                 <p className="text-slate-400 font-medium italic">Simulados focados em IFs e Vestibulares.</p>
              </div>

              <form onSubmit={handleGenerateSimulation} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-4">
                      <label className="text-xs font-black text-[#00A859] uppercase tracking-widest px-4">Conteúdo Programático</label>
                      <input required type="text" value={simForm.theme} onChange={e => setSimForm({...simForm, theme: e.target.value})} 
                        placeholder="Ex: Razão e Proporção, Gramática, Era Vargas..." 
                        className="w-full p-8 border-4 border-slate-50 rounded-[2.5rem] focus:border-[#00A859] outline-none font-bold text-xl shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Turma Destinatária</label>
                    <select required className="w-full p-6 bg-slate-50 rounded-3xl font-bold" value={simForm.classId} onChange={e => setSimForm({...simForm, classId: e.target.value})}>
                       <option value="">Selecione...</option>
                       {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Nível de Dificuldade</label>
                    <select className="w-full p-6 bg-slate-50 rounded-3xl font-bold" value={simForm.difficulty} onChange={e => setSimForm({...simForm, difficulty: e.target.value as Difficulty})}>
                      {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Qtd. Questões</label>
                    <input type="number" min="1" max="20" value={simForm.totalQuestions} onChange={e => setSimForm({...simForm, totalQuestions: parseInt(e.target.value)})} className="w-full p-6 bg-slate-50 rounded-3xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Qtd. Alternativas</label>
                    <select className="w-full p-6 bg-slate-50 rounded-3xl font-bold" value={simForm.optionsCount} onChange={e => setSimForm({...simForm, optionsCount: parseInt(e.target.value)})}>
                      <option value={3}>3 Alternativas</option>
                      <option value={4}>4 Alternativas</option>
                      <option value={5}>5 Alternativas</option>
                    </select>
                  </div>
                </div>
                <button disabled={isGenerating} type="submit" className="w-full bg-[#00A859] hover:bg-[#008c4a] text-white font-black py-8 rounded-[3rem] flex items-center justify-center gap-4 transition-all shadow-2xl disabled:opacity-50 text-2xl">
                  {isGenerating ? <Loader2 className="animate-spin" size={32} /> : <Target size={32} />}
                  {isGenerating ? 'ANALISANDO CONTEÚDO...' : 'GERAR SIMULADO'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-[3.5rem] shadow-2xl p-12 border-4 border-[#00A859]/20 animate-fadeIn space-y-10">
               <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Prévia do Simulado</h3>
                    <p className="text-sm text-slate-400 font-bold">{previewQuestions.length} questões geradas para {simForm.theme}</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setPreviewQuestions(null)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                    <button onClick={publishSimulation} className="px-8 py-4 bg-[#00A859] text-white rounded-2xl font-black text-xs uppercase hover:bg-[#008c4a] shadow-lg transition-all">Publicar Simulado</button>
                  </div>
               </div>

               <div className="space-y-8">
                 {previewQuestions.map((q, idx) => (
                   <div key={idx} className="p-8 border-2 border-slate-50 rounded-[2.5rem] space-y-4">
                     <p className="font-black text-slate-800 text-lg"><span className="text-[#00A859]">Q{idx+1}.</span> {q.statement}</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {q.options.map((opt, oIdx) => (
                         <div key={oIdx} className={`p-4 rounded-xl text-sm font-bold border-2 ${q.correctAnswer === oIdx ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-50 text-slate-500'}`}>
                           {String.fromCharCode(65 + oIdx)}) {opt}
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bank' && (
        <div className="space-y-6">
           <h2 className="text-3xl font-black text-slate-800">Histórico de Simulados</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations.map(sim => (
                <div key={sim.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:border-[#00A859] transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-slate-50 text-[#00A859] rounded-2xl group-hover:bg-[#00A859] group-hover:text-white transition-all">
                        <FileText size={24}/>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(sim.createdAt).toLocaleDateString()}</span>
                   </div>
                   <h3 className="text-xl font-black text-slate-800 mb-2">{sim.title.split(': ')[1]}</h3>
                   <p className="text-xs text-slate-400 font-bold mb-6 flex items-center gap-2">
                     <Users size={14}/> {classes.find(c => c.id === sim.classId)?.name || 'Sem turma'}
                   </p>
                   <button onClick={() => setViewingSimQuestions(sim)} className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-900 hover:text-white transition-all">Ver Questões</button>
                </div>
              ))}
           </div>
        </div>
      )}

      {viewingSimQuestions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-fadeIn">
           <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[4rem] shadow-2xl flex flex-col">
              <div className="p-10 border-b flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800">{viewingSimQuestions.title}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Total de {viewingSimQuestions.questions.length} questões</p>
                 </div>
                 <button onClick={() => setViewingSimQuestions(null)} className="p-4 hover:bg-slate-100 rounded-3xl transition-all"><X size={28}/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
                 {viewingSimQuestions.questions.map((q, i) => (
                   <div key={q.id} className="p-10 rounded-[3rem] border-4 border-slate-50 space-y-6">
                      <p className="font-black text-slate-800 text-xl leading-tight">Questão {i+1}: {q.statement}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {q.options.map((opt, idx) => (
                           <div key={idx} className={`p-5 rounded-2xl text-sm font-bold border-2 ${q.correctAnswer === idx ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-500 border-slate-100'}`}>
                              <span className="opacity-50 mr-2">{String.fromCharCode(65 + idx)})</span> {opt}
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="space-y-10">
           <div className="flex gap-4 border-b border-slate-100 pb-4">
              <button onClick={() => setMgmtTab('students')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${mgmtTab === 'students' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Alunos</button>
              <button onClick={() => setMgmtTab('classes')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${mgmtTab === 'classes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Turmas</button>
           </div>

           {mgmtTab === 'students' ? (
             <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nome Completo</label>
                      <input type="text" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">E-mail</label>
                      <input type="email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Turma</label>
                      <select value={studentForm.classId} onChange={e => setStudentForm({...studentForm, classId: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold">
                         <option value="">Selecione...</option>
                         {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">PIN Inicial</label>
                      <input type="text" value={studentForm.pin} onChange={e => setStudentForm({...studentForm, pin: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                   </div>
                   <button onClick={() => {
                      if(!studentForm.name || !studentForm.email || !studentForm.classId) return alert("Preencha os campos obrigatórios.");
                      onAddStudent({...studentForm, id: Math.random().toString(36).substr(2, 9), parentName: '', parentPhone: '', whatsapp: ''} as Student);
                      setStudentForm({ name: '', email: '', whatsapp: '', pin: '', parentName: '', parentPhone: '', classId: '' });
                   }} className="bg-[#00A859] text-white p-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-[#008c4a] transition-all flex items-center justify-center gap-2">
                      <UserPlus size={18}/> Adicionar Aluno
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {students.map(s => (
                     <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">{s.name[0]}</div>
                           <div>
                              <p className="font-black text-slate-800 text-sm">{s.name}</p>
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{classes.find(c => c.id === s.classId)?.name}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setSelectedStudent(s)} className="p-2 text-[#00A859] hover:bg-[#00A859]/10 rounded-lg transition-all"><BarChart3 size={18}/></button>
                           <button onClick={() => onRemoveStudent(s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="space-y-8">
                <form onSubmit={handleClassSubmit} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nome da Turma</label>
                      <input required type="text" value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ano Letivo</label>
                      <input required type="text" value={classForm.year} onChange={e => setClassForm({...classForm, year: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                   </div>
                   <button type="submit" className="bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-black transition-all">Criar Turma</button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {classes.map(c => (
                     <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex items-center justify-between">
                        <div>
                           <p className="font-black text-slate-800">{c.name}</p>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{c.year}</p>
                        </div>
                        <button onClick={() => onDeleteClass(c.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-50 text-center space-y-4">
           <BarChart3 size={64} className="mx-auto text-slate-200" />
           <h3 className="text-2xl font-black text-slate-800">Relatórios Gerais em Breve</h3>
           <p className="text-slate-400 font-bold max-w-md mx-auto">Esta funcionalidade está sendo preparada para fornecer insights avançados sobre o progresso das turmas.</p>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm flex items-center gap-8">
              <div className="relative">
                 <div className="w-24 h-24 rounded-3xl bg-[#00A859] flex items-center justify-center text-white text-3xl font-black">
                    {currentUser.name[0]}
                 </div>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-800">{currentUser.name}</h3>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{currentUser.email}</p>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
              <h3 className="font-black text-lg">Alterar PIN de Acesso</h3>
              <form onSubmit={handleUpdatePin} className="space-y-4">
                 <div className="relative">
                    <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="Novo PIN" className="w-full p-5 pl-14 bg-slate-50 rounded-2xl font-black text-2xl tracking-[0.4em] outline-none" />
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-lg">Atualizar PIN</button>
                 {pinMessage && <p className="text-center text-[10px] font-black text-[#00A859] uppercase tracking-widest">{pinMessage}</p>}
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
