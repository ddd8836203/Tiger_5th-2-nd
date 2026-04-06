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
      <div className="space-y-12 mb-8">
        {Array.isArray(grammarRules) ? grammarRules.map((rule, index) => (
          <div key={index} className="bg-purple-100 p-8 rounded-[3rem] border-4 border-purple-300 shadow-sm">
            <h2 className="text-4xl font-extrabold text-purple-800 mb-4">{rule.title}</h2>
            <p className="text-2xl text-purple-900 mb-2 leading-relaxed font-bold">{rule.chi}</p>
            <p className="text-xl text-purple-700 mb-6 leading-relaxed italic">{rule.eng}</p>

            <h3 className="text-3xl font-extrabold text-gray-800 mb-6 pl-4 border-l-8 border-purple-500 rounded-sm mt-8">魔法例句</h3>
            <div className="space-y-6">
              {rule.examples && rule.examples.map((ex, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border-4 border-purple-100 flex flex-col items-center gap-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-row items-center gap-4 w-full">
                    <button 
                      onClick={() => speakText(typeof ex === 'string' ? ex : ex.eng)}
                      className="p-5 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 active:scale-90 transition-transform shrink-0 border-4 border-purple-200"
                    >
                      <Volume2 size={48} />
                    </button>
                    <div className="flex-1 w-full text-left">
                      <p className="text-3xl font-extrabold text-gray-800">{typeof ex === 'string' ? ex : ex.eng}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="bg-purple-100 p-8 rounded-[3rem] border-4 border-purple-300 shadow-sm">
            <h2 className="text-4xl font-extrabold text-purple-800 mb-4">{grammarRules.title}</h2>
            <p className="text-2xl text-purple-900 mb-6 leading-relaxed font-bold">{grammarRules.desc}</p>
          </div>
        )}
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
