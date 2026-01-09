
import React, { useState, useEffect } from 'react';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentPortal } from './components/StudentPortal';
import { Question, Simulation, StudentResponse, Student, Class, Professor } from './types';
import { LogIn, GraduationCap, UserCog, LogOut, KeyRound, AlertTriangle, Mail } from 'lucide-react';

const SUPER_ADMIN_PIN = "22081994eduardog";

type UserRole = 'super_admin' | 'admin_professor' | 'professor' | 'student' | null;

const Logo: React.FC<{ theme?: 'light' | 'dark', size?: string }> = ({ theme = 'light', size = 'text-5xl' }) => (
  <div className={`font-rubik ${size} select-none tracking-tight`}>
    <span className={theme === 'light' ? 'logo-gabarita-black' : 'logo-gabarita-white'}>Gabarita</span>
    <span className="logo-if">IF</span>
  </div>
);

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<Student | Professor | null>(null);
  const [viewMode, setViewMode] = useState<'selection' | 'professor_login' | 'student_email' | 'student_pin'>('selection');
  const [inputPin, setInputPin] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados carregados do LocalStorage
  const [professors, setProfessors] = useState<Professor[]>(() => {
    const saved = localStorage.getItem('gabarita_professors');
    return saved ? JSON.parse(saved) : [];
  });
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('gabarita_students');
    return saved ? JSON.parse(saved) : [];
  });
  const [classes, setClasses] = useState<Class[]>(() => {
    const saved = localStorage.getItem('gabarita_classes');
    return saved ? JSON.parse(saved) : [{ id: '1', name: '7º Ano A', year: '2025' }];
  });
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('gabarita_questions');
    return saved ? JSON.parse(saved) : [];
  });
  const [simulations, setSimulations] = useState<Simulation[]>(() => {
    const saved = localStorage.getItem('gabarita_simulations');
    return saved ? JSON.parse(saved) : [];
  });
  const [results, setResults] = useState<StudentResponse[]>(() => {
    const saved = localStorage.getItem('gabarita_results');
    return saved ? JSON.parse(saved) : [];
  });
  const [adminData, setAdminData] = useState(() => {
    const saved = localStorage.getItem('gabarita_admin');
    return saved ? JSON.parse(saved) : { name: "Eduardo G.", nickname: "Diretor Eduardo", photoUrl: "" };
  });

  // Efeito para salvar no LocalStorage sempre que um estado mudar
  useEffect(() => {
    localStorage.setItem('gabarita_professors', JSON.stringify(professors));
    localStorage.setItem('gabarita_students', JSON.stringify(students));
    localStorage.setItem('gabarita_classes', JSON.stringify(classes));
    localStorage.setItem('gabarita_questions', JSON.stringify(questions));
    localStorage.setItem('gabarita_simulations', JSON.stringify(simulations));
    localStorage.setItem('gabarita_results', JSON.stringify(results));
    localStorage.setItem('gabarita_admin', JSON.stringify(adminData));
  }, [professors, students, classes, questions, simulations, results, adminData]);

  const handleProfessorLogin = () => {
    if (inputPin === SUPER_ADMIN_PIN) {
      setRole('super_admin');
      const mockAdmin: Professor = {
        id: 'super-admin',
        name: adminData.name,
        nickname: adminData.nickname,
        email: 'admin@gabaritaif.com.br',
        phone: '',
        pin: SUPER_ADMIN_PIN,
        isAdmin: true,
        hasAccess: true,
        photoUrl: adminData.photoUrl
      };
      setCurrentUser(mockAdmin);
      setInputPin('');
      setLoginError('');
      return;
    }

    const prof = professors.find(p => p.pin === inputPin);
    if (prof) {
      if (!prof.hasAccess) {
        setLoginError("Acesso revogado.");
        return;
      }
      setRole(prof.isAdmin ? 'admin_professor' : 'professor');
      setCurrentUser(prof);
      setInputPin('');
      setLoginError('');
    } else {
      setLoginError("PIN incorreto.");
    }
  };

  const handleUpdateProfile = (updatedData: Partial<Professor | Student>) => {
    if (role === 'super_admin') {
      setAdminData(prev => ({ ...prev, ...updatedData }));
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    } else if (role === 'student') {
      setStudents(prev => prev.map(s => s.id === currentUser?.id ? { ...s, ...updatedData } as Student : s));
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    } else {
      setProfessors(prev => prev.map(p => p.id === currentUser?.id ? { ...p, ...updatedData } as Professor : p));
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };

  const handleCheckStudentEmail = () => {
    const student = students.find(s => s.email.toLowerCase() === inputEmail.toLowerCase());
    if (student) {
      setLoginError('');
      setViewMode('student_pin');
    } else {
      setLoginError("E-mail não encontrado.");
    }
  };

  const handleStudentLogin = () => {
    const student = students.find(s => s.email.toLowerCase() === inputEmail.toLowerCase() && s.pin === inputPin);
    if (student) {
      setCurrentUser(student);
      setRole('student');
      setLoginError('');
    } else {
      setLoginError("PIN incorreto.");
    }
  };

  const logout = () => {
    setRole(null);
    setCurrentUser(null);
    setViewMode('selection');
    setInputEmail('');
    setInputPin('');
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-md w-full text-center space-y-10 animate-fadeIn border border-slate-100">
          <div className="space-y-4">
            <div className="flex justify-center py-2">
               <Logo theme="light" size="text-5xl" />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Preparação para o Futuro</p>
          </div>

          {viewMode === 'selection' && (
            <div className="grid grid-cols-1 gap-6">
              <button 
                onClick={() => setViewMode('professor_login')}
                className="group flex items-center gap-5 p-8 rounded-[2.5rem] border-4 border-slate-50 hover:border-[#00A859] hover:bg-[#00A859]/5 transition-all text-left bg-slate-50/50 shadow-sm"
              >
                <div className="bg-[#00A859]/10 text-[#00A859] p-5 rounded-3xl group-hover:bg-[#00A859] group-hover:text-white transition-all shadow-md">
                  <UserCog size={32} />
                </div>
                <div>
                  <p className="font-black text-xl text-slate-800">Docente</p>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Painel Administrativo</p>
                </div>
              </button>

              <button 
                onClick={() => setViewMode('student_email')}
                className="group flex items-center gap-5 p-8 rounded-[2.5rem] border-4 border-slate-50 hover:border-[#00A859] hover:bg-[#00A859]/5 transition-all text-left bg-slate-50/50 shadow-sm"
              >
                <div className="bg-[#00A859]/10 text-[#00A859] p-5 rounded-3xl group-hover:bg-[#00A859] group-hover:text-white transition-all shadow-md">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <p className="font-black text-xl text-slate-800">Estudante</p>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Plataforma de Alunos</p>
                </div>
              </button>
            </div>
          )}

          {viewMode === 'professor_login' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-left space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">PIN Docente</p>
                <div className="relative">
                  <input type="password" placeholder="••••" value={inputPin} onChange={(e) => setInputPin(e.target.value)}
                    className="w-full p-6 pl-16 rounded-[2rem] border-4 border-slate-50 focus:border-[#00A859] outline-none font-black text-3xl tracking-[0.6em] text-center shadow-inner"
                    onKeyDown={(e) => e.key === 'Enter' && handleProfessorLogin()} autoFocus />
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={28} />
                </div>
                {loginError && <p className="text-red-500 text-[10px] font-black mt-2 flex items-center gap-2 bg-red-50 p-3 rounded-2xl"><AlertTriangle size={14}/> {loginError}</p>}
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleProfessorLogin} className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl active:scale-95">ACESSAR PAINEL</button>
                <button onClick={() => {setViewMode('selection'); setLoginError('')}} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Voltar</button>
              </div>
            </div>
          )}

          {(viewMode === 'student_email' || viewMode === 'student_pin') && (
             <div className="space-y-6 animate-fadeIn">
                <div className="text-left space-y-2">
                  <p className="text-[10px] font-black text-[#00A859] uppercase tracking-widest px-2">
                    {viewMode === 'student_email' ? 'IDENTIFICAÇÃO ALUNO' : 'PIN DE ACESSO'}
                  </p>
                  <div className="relative">
                    {viewMode === 'student_email' ? (
                      <input type="email" placeholder="email@exemplo.com" value={inputEmail} onChange={(e) => setInputEmail(e.target.value)}
                        className="w-full p-6 pl-16 rounded-[2rem] border-4 border-slate-50 focus:border-[#00A859] outline-none font-bold text-lg shadow-inner"
                        onKeyDown={(e) => e.key === 'Enter' && handleCheckStudentEmail()} autoFocus />
                    ) : (
                      <input type="password" placeholder="••••" value={inputPin} onChange={(e) => setInputPin(e.target.value)}
                        className="w-full p-6 pl-16 rounded-[2rem] border-4 border-slate-50 focus:border-[#00A859] outline-none font-black text-3xl tracking-[0.6em] text-center shadow-inner"
                        onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()} autoFocus />
                    )}
                    {viewMode === 'student_email' ? <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={28}/> : <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={28}/>}
                  </div>
                  {loginError && <p className="text-red-500 text-[10px] font-black mt-2 flex items-center gap-2 bg-red-50 p-3 rounded-2xl"><AlertTriangle size={14}/> {loginError}</p>}
                </div>
                <div className="flex flex-col gap-3">
                   <button onClick={viewMode === 'student_email' ? handleCheckStudentEmail : handleStudentLogin} 
                     className="w-full bg-[#00A859] hover:bg-[#008c4a] text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl active:scale-95">
                     {viewMode === 'student_email' ? 'PRÓXIMO' : 'ENTRAR'}
                   </button>
                   <button onClick={() => {setViewMode(viewMode === 'student_pin' ? 'student_email' : 'selection'); setLoginError('')}} 
                     className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">
                     {viewMode === 'student_pin' ? 'TROCAR CONTA' : 'VOLTAR'}
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Logo theme="light" size="text-2xl" />
            <div className="w-px h-6 bg-slate-100 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              {currentUser?.photoUrl ? (
                <img src={currentUser.photoUrl} alt="Perfil" className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100" />
              ) : (
                <div className="bg-[#00A859]/10 text-[#00A859] w-10 h-10 rounded-xl flex items-center justify-center font-black">
                  {currentUser?.name[0]}
                </div>
              )}
              <div className="hidden sm:block">
                <h1 className="text-sm font-black text-slate-800 leading-none">
                  {(currentUser as Professor)?.nickname || currentUser?.name}
                </h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {role === 'super_admin' ? 'Gestor' : role === 'student' ? 'Estudante' : 'Docente'}
                </p>
              </div>
            </div>
          </div>
          
          <button onClick={logout} className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        {role !== 'student' ? (
          <TeacherDashboard 
            questions={questions} simulations={simulations} students={students} classes={classes} results={results} professors={professors}
            userRole={role} currentUser={currentUser as Professor}
            onUpdateProfile={handleUpdateProfile}
            onAddQuestion={(qs) => setQuestions(prev => [...prev, ...qs])} 
            onCreateSimulation={s => setSimulations(prev => [...prev, s])} 
            onAddStudent={s => setStudents(prev => [...prev, s])} 
            onUpdateStudent={updated => setStudents(prev => prev.map(s => s.id === updated.id ? updated : s))}
            onRemoveStudent={id => setStudents(prev => prev.filter(s => s.id !== id))} 
            onAddClass={c => setClasses(prev => [...prev, c])} 
            onDeleteClass={id => setClasses(prev => prev.filter(c => c.id !== id))}
            onAddProfessor={p => setProfessors(prev => [...prev, p])} 
            onUpdateProfessor={updated => setProfessors(prev => prev.map(p => p.id === updated.id ? updated : p))}
            onRemoveProfessor={id => setProfessors(prev => prev.filter(p => p.id !== id))}
          />
        ) : (
          <StudentPortal simulations={simulations} student={currentUser as Student} onFinish={res => setResults(prev => [...prev, res])} results={results} onUpdateProfile={handleUpdateProfile} />
        )}
      </main>
    </div>
  );
};

export default App;
