
import React, { useState, useEffect } from 'react';
import { Simulation, StudentResponse, Question, Source } from '../types';
import { generatePerformanceFeedback } from '../geminiService';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface Props {
  simulation: Simulation;
  studentId: string;
  studentName: string;
  onFinish: (res: StudentResponse) => void;
}

const Logo: React.FC<{ theme?: 'light' | 'dark', size?: string }> = ({ theme = 'light', size = 'text-5xl' }) => (
  <div className={`font-rubik ${size} select-none tracking-tight`}>
    <span className={theme === 'light' ? 'logo-gabarita-black' : 'logo-gabarita-white'}>Gabarita</span>
    <span className="logo-if">IF</span>
  </div>
);

export const QuizRunner: React.FC<Props> = ({ simulation, studentId, studentName, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const currentQuestion = simulation.questions[currentIdx];

  const handleSelect = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = idx;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentIdx < simulation.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let correct = 0;
    simulation.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    const finalScore = correct;
    setScore(finalScore);
    setIsFinished(true);
    setIsLoadingFeedback(true);

    try {
      const fb = await generatePerformanceFeedback(studentName, simulation, {
        id: '', studentId, studentName, simulationId: simulation.id, answers, score: finalScore, feedback: '', timestamp: Date.now()
      });
      setFeedback(fb);
    } catch (e) {
      setFeedback("Você está no caminho certo para o Instituto Federal. Continue revisando!");
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  if (isFinished) {
    return (
      <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn">
        <div className="bg-white rounded-[4rem] shadow-2xl p-16 border-8 border-slate-50 text-center space-y-12">
          <div className="flex justify-center mb-4">
             <Logo theme="light" size="text-4xl" />
          </div>
          <div className="inline-flex p-10 bg-emerald-100 text-emerald-600 rounded-[3rem] animate-bounce shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 size={80} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-5xl font-black text-slate-800 tracking-tighter">Atividade Concluída</h2>
          </div>

          <div className="flex justify-center gap-16 py-12 bg-slate-50 rounded-[3.5rem] shadow-inner border-2 border-slate-100">
             <div className="text-center">
                <p className="text-7xl font-black text-[#00A859] tracking-tighter">{score}</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Acertos</p>
             </div>
             <div className="w-px bg-slate-200 h-24 my-auto" />
             <div className="text-center">
                <p className="text-7xl font-black text-slate-300 tracking-tighter">{simulation.questions.length}</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Total</p>
             </div>
          </div>

          <div className="p-12 bg-emerald-50/50 rounded-[3.5rem] text-left border-l-[12px] border-[#00A859] relative shadow-lg">
            <div className="absolute -top-4 left-10 flex items-center gap-2 bg-[#00A859] text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">
              <Sparkles size={14} /> Análise GabaritaIF
            </div>
            {isLoadingFeedback ? (
              <div className="flex flex-col items-center gap-6 py-10">
                <Loader2 className="animate-spin text-[#00A859]" size={50} strokeWidth={1} />
                <p className="text-[#00A859] font-black animate-pulse text-xs uppercase tracking-[0.3em]">IA Processando...</p>
              </div>
            ) : (
              <p className="text-emerald-900 leading-relaxed font-bold italic text-2xl">
                "{feedback}"
              </p>
            )}
          </div>

          <button 
            onClick={() => onFinish({ 
              id: Math.random().toString(36).substr(2, 9), studentId, studentName, simulationId: simulation.id, answers, score, feedback, timestamp: Date.now() 
            })}
            className="w-full py-10 bg-slate-900 text-white rounded-[3rem] font-black text-2xl hover:bg-black transition-all shadow-2xl active:scale-95 group"
          >
            CONFIRMAR E RETORNAR AO MURAL
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIdx + 1) / simulation.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center gap-8 px-8">
         <div className="flex-grow h-6 bg-slate-200 rounded-full overflow-hidden shadow-inner p-1.5">
            <div className="h-full bg-[#00A859] rounded-full transition-all duration-700 shadow-xl" style={{ width: `${progress}%` }} />
         </div>
         <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap bg-white px-5 py-2 rounded-2xl shadow-sm border border-slate-100">
           {currentIdx + 1} / {simulation.questions.length}
         </span>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border-4 border-slate-50 p-16 space-y-12 min-h-[550px] flex flex-col justify-between">
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <span className="text-[11px] uppercase font-black bg-[#00A859]/10 text-[#00A859] px-6 py-3 rounded-2xl border-2 border-[#00A859]/20 shadow-sm">
              {currentQuestion.topic}
            </span>
          </div>

          <h3 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight tracking-tight">
            {currentQuestion.statement}
          </h3>

          <div className="grid grid-cols-1 gap-6">
            {currentQuestion.options.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(i)}
                className={`w-full p-8 rounded-[2.5rem] border-4 text-left transition-all flex items-center gap-8 group relative overflow-hidden ${
                  answers[currentIdx] === i 
                  ? 'border-[#00A859] bg-[#00A859]/5 shadow-2xl shadow-[#00A859]/10' 
                  : 'border-slate-50 hover:border-emerald-200 bg-white hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className={`w-16 h-16 rounded-[1.8rem] shrink-0 flex items-center justify-center font-black text-2xl transition-all shadow-lg ${
                  answers[currentIdx] === i ? 'bg-[#00A859] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[#00A859]/20 group-hover:text-[#00A859]'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={`flex-grow font-black text-xl transition-colors ${answers[currentIdx] === i ? 'text-emerald-950' : 'text-slate-600'}`}>
                  {opt}
                </span>
                {answers[currentIdx] === i && <div className="absolute right-8 w-4 h-4 rounded-full bg-[#00A859] shadow-lg animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-12 border-t-4 border-slate-50 flex justify-between items-center">
          <div className="text-slate-300 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em]">
            <AlertCircle size={20} /> Preparação IF
          </div>
          <button onClick={nextQuestion} disabled={answers[currentIdx] === undefined}
            className={`px-16 py-8 rounded-[2.5rem] font-black text-2xl flex items-center gap-4 transition-all ${
              answers[currentIdx] !== undefined 
              ? 'bg-[#00A859] text-white hover:bg-[#008c4a] shadow-2xl scale-105 active:scale-95' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-slate-50'
            }`}
          >
            {currentIdx === simulation.questions.length - 1 ? 'FINALIZAR' : 'PRÓXIMO'}
            <ArrowRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};
