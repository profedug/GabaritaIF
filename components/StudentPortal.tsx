
import React, { useState, useRef } from 'react';
import { Simulation, StudentResponse, Student } from '../types';
import { QuizRunner } from './QuizRunner';
import { BookOpen, CheckCircle, Clock, ChevronRight, GraduationCap, Target, UserCircle, Camera, Edit3, Lock, Key } from 'lucide-react';

interface Props {
  simulations: Simulation[];
  student: Student;
  onFinish: (res: StudentResponse) => void;
  results: StudentResponse[];
  onUpdateProfile: (data: Partial<Student>) => void;
}

const Logo: React.FC<{ theme?: 'light' | 'dark', size?: string }> = ({ theme = 'light', size = 'text-5xl' }) => (
  <div className={`font-rubik ${size} select-none tracking-tight`}>
    <span className={theme === 'light' ? 'logo-gabarita-black' : 'logo-gabarita-white'}>Gabarita</span>
    <span className="logo-if">IF</span>
  </div>
);

export const StudentPortal: React.FC<Props> = ({ simulations, student, onFinish, results, onUpdateProfile }) => {
  const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [view, setView] = useState<'mural' | 'profile'>('mural');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mySimulations = simulations.filter(s => {
    const isClassMatch = !s.classId || s.classId === student.classId;
    const isTargetMatch = s.targetStudentIds.length === 0 || s.targetStudentIds.includes(student.id);
    return isClassMatch && isTargetMatch;
  });

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) return setPinMessage('O PIN deve ter pelo menos 4 caracteres.');
    onUpdateProfile({ pin: newPin });
    setNewPin('');
    setPinMessage('PIN atualizado com sucesso!');
    setTimeout(() => setPinMessage(''), 3000);
  };

  if (isTakingQuiz && selectedSim) {
    return <QuizRunner simulation={selectedSim} studentId={student.id} studentName={student.name} onFinish={(res) => {
      onFinish(res);
      setIsTakingQuiz(false);
      setSelectedSim(null);
    }} />;
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* GabaritaIF Header */}
      <div className="bg-[#00A859] rounded-[3.5rem] p-12 text-white flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6 text-center md:text-left">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                 <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/20 border-4 border-white/30 backdrop-blur-md shadow-2xl flex items-center justify-center">
                    {student.photoUrl ? <img src={student.photoUrl} className="w-full h-full object-cover"/> : <UserCircle size={88} className="text-white/40"/>}
                 </div>
                 <button onClick={() => setView('profile')} className="absolute -bottom-2 -right-2 bg-white text-[#00A859] p-2 rounded-xl shadow-lg border-2 border-[#00A859] hover:scale-110 transition-transform">
                    <Edit3 size={16}/>
                 </button>
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black leading-tight tracking-tight">Foco nos IFs, {student.name.split(' ')[0]}!</h2>
                <p className="text-emerald-50 opacity-90 text-sm font-bold flex items-center justify-center md:justify-start gap-2">
                  <Target size={18}/> {mySimulations.length} atividades disponíveis
                </p>
              </div>
           </div>
        </div>
        
        <div className="z-10 flex gap-4">
           <div className="bg-white/10 backdrop-blur-3xl p-8 rounded-[2.8rem] border border-white/20 text-center shadow-inner min-w-[150px]">
              <div className="bg-white/90 p-3 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                 <Logo theme="light" size="text-xl" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">CONCLUÍDOS</p>
              <p className="text-4xl font-black">{results.filter(r => r.studentId === student.id).length}</p>
           </div>
        </div>
      </div>

      {view === 'profile' ? (
        <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
           <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
              <div className="relative">
                 <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-50 border-4 border-slate-100 shadow-md flex items-center justify-center">
                    {student.photoUrl ? <img src={student.photoUrl} className="w-full h-full object-cover"/> : <UserCircle size={80} className="text-slate-200"/>}
                 </div>
                 <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-[#00A859] text-white p-3 rounded-2xl shadow-xl hover:bg-[#008c4a] transition-all border-4 border-white">
                    <Camera size={20}/>
                 </button>
                 <input type="file" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                       const reader = new FileReader();
                       reader.onloadend = () => onUpdateProfile({ photoUrl: reader.result as string });
                       reader.readAsDataURL(file);
                    }
                 }} className="hidden" accept="image/*" />
              </div>
              
              <div className="flex-grow space-y-2 text-center md:text-left">
                 <h3 className="text-3xl font-black text-slate-800">{student.name}</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.email}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 space-y-6">
                 <h3 className="text-xl font-black flex items-center gap-3"><Lock className="text-[#00A859]"/> Alterar PIN</h3>
                 <form onSubmit={handleUpdatePin} className="space-y-4">
                    <div className="relative">
                       <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="Novo PIN (4-6 dígitos)" maxLength={6}
                         className="w-full p-5 pl-14 bg-slate-50 rounded-2xl font-black text-2xl tracking-[0.3em] outline-none" />
                       <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    </div>
                    <button type="submit" className="w-full bg-[#00A859] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-lg">SALVAR NOVO PIN</button>
                    {pinMessage && <p className="text-center text-[10px] font-black text-[#00A859] uppercase tracking-widest">{pinMessage}</p>}
                 </form>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col justify-center gap-4">
                 <button onClick={() => setView('mural')} className="w-full bg-slate-900 text-white py-6 rounded-[1.8rem] font-black text-xs uppercase shadow-xl hover:bg-black transition-all">VOLTAR AO MURAL</button>
                 <p className="text-[9px] text-slate-300 font-bold text-center uppercase tracking-widest">GabaritaIF © 2025 • Todos os Direitos Reservados</p>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {mySimulations.length === 0 ? (
             <div className="col-span-full py-20 text-center opacity-40">
                <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-300">Sem atividades pendentes</p>
             </div>
          ) : 
            mySimulations.map(s => {
               const hasCompleted = results.some(r => r.simulationId === s.id && r.studentId === student.id);
               return (
                 <div key={s.id} className="bg-white rounded-[3.2rem] border border-slate-100 p-10 hover:border-[#00A859] transition-all flex flex-col justify-between group shadow-sm hover:shadow-2xl">
                   <div className="space-y-6">
                     <div className="p-5 bg-slate-50 text-[#00A859] rounded-3xl w-fit">
                       <BookOpen size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 leading-tight">{s.title.split(': ')[1]}</h3>
                     <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase">
                       <span className="flex items-center gap-1"><GraduationCap size={16}/> {s.questions.length} QUESTÕES</span>
                     </div>
                   </div>
                   <button 
                     disabled={hasCompleted}
                     onClick={() => { setSelectedSim(s); setIsTakingQuiz(true); }}
                     className={`mt-10 w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${hasCompleted ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-[#00A859] text-white hover:bg-[#008c4a] shadow-xl'}`}
                   >
                     {hasCompleted ? 'CONCLUÍDO' : 'RESPONDER'} <ChevronRight size={24} />
                   </button>
                 </div>
               );
            })
          }
        </div>
      )}
    </div>
  );
};
