
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty, Source, StudentResponse, Simulation, QuestionSource } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gera questões focadas em Institutos Federais e Vestibulares.
 * RIGOROSAMENTE SEM BNCC.
 */
export const generateQuestions = async (
  theme: string,
  year: string,
  difficulty: Difficulty,
  count: number,
  optionsCount: number,
  sourceType: QuestionSource
): Promise<Question[]> => {
  
  let sourceRule = "";
  if (sourceType === QuestionSource.IA_ONLY) {
    sourceRule = "Crie questões inéditas de nível técnico/médio.";
  } else if (sourceType === QuestionSource.INTERNET_VESTIBULAR) {
    sourceRule = "Busque padrões de questões reais de Institutos Federais (IFs) e ENEM.";
  } else {
    sourceRule = "Combine questões inéditas com o estilo clássico de vestibulares de IFs.";
  }

  const prompt = `Você é um especialista em avaliações para Institutos Federais (IFs).
  NUNCA mencione ou utilize a BNCC. Foque no conteúdo programático tradicional de ingresso (ex: Álgebra, Geometria, Interpretação, Gramática, História Geral).
  
  Objetivo: Gerar ${count} questões de múltipla escolha.
  Nível sugerido: ${year}.
  Assunto: "${theme}".
  Dificuldade: ${difficulty}.
  Quantidade de alternativas por questão: ${optionsCount}.
  
  DIRETRIZES:
  1. ESTILO: ${sourceRule}
  2. FORMATO: Responda estritamente com um array JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            statement: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            topic: { type: Type.STRING },
            originInfo: { type: Type.STRING }
          },
          required: ["statement", "options", "correctAnswer", "topic"]
        }
      }
    }
  });

  const raw = JSON.parse(response.text || "[]");
  return raw.map((q: any) => ({
    ...q,
    id: Math.random().toString(36).substr(2, 9),
    difficulty,
    source: q.originInfo ? Source.VESTIBULAR : Source.IA
  }));
};

export const generatePerformanceFeedback = async (
  studentName: string,
  simulation: Simulation,
  response: StudentResponse
): Promise<string> => {
  const prompt = `Gere um feedback pedagógico focado em Institutos Federais para o aluno ${studentName}. 
  Ele fez ${response.score} de ${simulation.questions.length} pontos em "${simulation.title}". 
  Seja direto, técnico e motivador. NUNCA mencione BNCC.`;

  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return result.text?.replace(/[*#]/g, '').trim() || "Mantenha o foco nos estudos para o IF!";
};

export const generateTeacherRecommendations = async (
  theme: string,
  averageScore: number,
  totalQuestions: number,
  totalStudents: number,
  isLowPerformance: boolean
): Promise<string> => {
  const prompt = `Como consultor pedagógico para IFs, analise: Tema "${theme}", Média ${averageScore}/${totalQuestions}, ${totalStudents} alunos. 
  Desempenho Geral: ${isLowPerformance ? 'CRÍTICO' : 'SATISFATÓRIO'}. 
  Dê um conselho técnico ao professor. SEM BNCC.`;

  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return result.text?.trim() || "Foque na revisão dos conceitos fundamentais.";
};
