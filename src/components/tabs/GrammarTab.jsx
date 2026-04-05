import React from 'react';
import { Volume2 } from 'lucide-react';
import { speakText } from '../../utils';
import QuizEngine from '../quiz/QuizEngine';

export default function GrammarTab({ unitData, session }) {
  const grammarRules = unitData?.grammarRules;
  const questions = unitData?.quizzes?.grammar || [];

  if (!grammarRules) return <div>沒有文法資料</div>;

  return (
    <div className="animate-fade-in">
      <div className="bg-purple-100 p-8 rounded-[3rem] border-4 border-purple-300 mb-8 shadow-sm">
        <h2 className="text-4xl font-extrabold text-purple-800 mb-4">{grammarRules.title}</h2>
        <p className="text-2xl text-purple-900 mb-6 leading-relaxed font-bold">{grammarRules.desc}</p>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-inner mb-6 border-2 border-purple-50">
          <p className="text-2xl font-bold text-gray-700 mb-2">✅ 肯定句公式：</p>
          <p className="text-3xl font-extrabold text-blue-600 bg-blue-50 inline-block px-6 py-3 rounded-2xl shadow-sm">{grammarRules.formulaPositive}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-inner border-2 border-purple-50">
          <p className="text-2xl font-bold text-gray-700 mb-2">❌ 否定句公式：</p>
          <p className="text-3xl font-extrabold text-red-500 bg-red-50 inline-block px-6 py-3 rounded-2xl shadow-sm">{grammarRules.formulaNegative}</p>
        </div>
      </div>

      <h3 className="text-3xl font-extrabold text-gray-800 mb-6 pl-4 border-l-8 border-purple-500 rounded-sm">魔法例句</h3>
      <div className="space-y-6">
        {grammarRules.examples && grammarRules.examples.map((ex, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border-4 border-purple-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-shadow">
            <button 
              onClick={() => speakText(ex.eng)}
              className="p-5 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 active:scale-90 transition-transform shrink-0 border-4 border-purple-200"
            >
              <Volume2 size={48} />
            </button>
            <div className="flex-1 w-full text-center md:text-left">
              <p className="text-3xl font-extrabold text-gray-800 mb-2">{ex.eng}</p>
              <p className="text-2xl font-bold text-gray-500 mb-4">{ex.chi}</p>
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xl px-4 py-2 rounded-xl font-bold shadow-sm">
                👀 觀察重點：{ex.note}
              </span>
            </div>
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <QuizEngine 
          questions={questions} 
          title="文法大師" 
          quizType="grammar" 
          session={session} 
        />
      )}
    </div>
  );
}
