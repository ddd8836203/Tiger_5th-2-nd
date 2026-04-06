import React, { useState } from 'react';
import { Volume2, Play } from 'lucide-react';
import { speakText } from '../../utils';
import QuizEngine from '../quiz/QuizEngine';
import SpellingQuizEngine from '../quiz/SpellingQuizEngine';

export default function VocabTab({ unitData, session }) {
  const [quizMode, setQuizMode] = useState('choice'); // 預設顯示選擇題
  const vocabData = unitData?.vocabData || [];
  const vocabQuestions = unitData?.quizzes?.vocab || [];

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {vocabData.map((v, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[3rem] shadow-lg border-t-8 border-green-500 relative overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
            {/* 背景浮水印圖示 */}
            <div className="absolute -right-4 -top-6 text-9xl opacity-5 pointer-events-none select-none">{v.img}</div>
            
            {/* 單字大標題 */}
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center flex-wrap gap-3">
                <h3 className="text-5xl font-extrabold text-green-700 tracking-tight">{v.word}</h3>
                <span className="text-2xl text-gray-500 italic font-bold">{v.pos}</span>
                <button 
                  onClick={() => speakText(v.word)}
                  className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-transform active:scale-90 shadow-sm"
                  title="聽單字發音"
                >
                  <Volume2 size={28} />
                </button>
              </div>
            </div>
            
            {/* 中文意思 */}
            <p className="text-4xl font-extrabold text-gray-800 mb-6 relative z-10">{v.chi}</p>
            
            {/* 詳細解說區塊 */}
            <div className="space-y-4 flex-grow relative z-10">
              {v.break && (
                <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
                  <p className="text-xl font-extrabold text-blue-800">🧩 結構拆解： <span className="text-gray-700 font-bold">{v.break}</span></p>
                </div>
              )}
              {v.trick && (
                <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100">
                  <p className="text-xl font-extrabold text-orange-800">💡 諧音聯想： <span className="text-gray-700 font-bold">{v.trick}</span></p>
                </div>
              )}
              {v.scene && (
                <div className="bg-teal-50 p-4 rounded-2xl border-2 border-teal-100">
                  <p className="text-xl font-extrabold text-teal-800">🎬 情境聯想： <span className="text-gray-700 font-bold">{v.scene}</span></p>
                </div>
              )}
              {v.collocation && (
                <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100">
                  <p className="text-xl font-extrabold text-indigo-800">🔗 邏輯綁定： <span className="text-gray-700 font-bold">{v.collocation}</span></p>
                </div>
              )}
              {v.compare && (
                <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-100">
                  <p className="text-xl font-extrabold text-rose-800">⚠️ 易混淆詞： <span className="text-gray-700 font-bold">{v.compare}</span></p>
                </div>
              )}
              {v.contextEng && (
                <div className="bg-purple-50 p-5 rounded-2xl mt-2 border-l-8 border-purple-400">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xl font-extrabold text-purple-800">🗣️ 簡單例句：</p>
                    <button 
                      onClick={() => speakText(v.contextEng)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-transform active:scale-90 shadow-sm"
                      title="聽例句發音"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-800 mb-1">{v.contextEng}</p>
                  <p className="text-xl text-gray-600 font-bold">{v.contextChi}</p>
                </div>
              )}
            </div>
            
            {/* 記憶口訣 */}
            {v.chant && (
              <div className="bg-yellow-50 p-5 rounded-2xl flex items-center gap-4 mt-6 shrink-0 border-4 border-yellow-200 shadow-inner relative z-10">
                <button 
                  onClick={() => speakText(v.chant)}
                  className="p-3 bg-yellow-400 text-yellow-900 rounded-full hover:bg-yellow-500 transition-transform active:scale-90 shadow-md"
                  title="聽口訣"
                >
                  <Play size={28} className="fill-current" />
                </button>
                <p className="text-2xl font-extrabold text-yellow-900 italic">"{v.chant}"</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border-4 border-yellow-300 p-8 rounded-[3rem] mt-12 mb-6">
        <h3 className="text-4xl font-extrabold text-center text-yellow-800 mb-8">🎯 選擇測驗模式</h3>
        <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
          <button 
            onClick={() => setQuizMode('choice')} 
            className={`text-2xl font-bold px-8 py-4 rounded-full transition-all border-4 flex items-center justify-center gap-3 ${quizMode === 'choice' ? 'bg-orange-500 text-white border-orange-600 shadow-lg scale-105' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'}`}
          >
            📝 單字選擇題
          </button>
          <button 
            onClick={() => setQuizMode('spelling')} 
            className={`text-2xl font-bold px-8 py-4 rounded-full transition-all border-4 flex items-center justify-center gap-3 ${quizMode === 'spelling' ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
          >
            🎧 聽音拼字挑戰
          </button>
        </div>

        {quizMode === 'spelling' && (
          <div className="animate-fade-in-up">
            <SpellingQuizEngine 
              words={vocabData} 
              title="聽音拼字" 
              quizType="spelling" 
              session={session} 
            />
          </div>
        )}

        {quizMode === 'choice' && vocabQuestions.length > 0 && (
          <div className="animate-fade-in-up">
            <QuizEngine 
              questions={vocabQuestions} 
              title="單字選擇題" 
              quizType="vocab" 
              session={session} 
            />
          </div>
        )}

        {quizMode === 'choice' && vocabQuestions.length === 0 && (
          <p className="text-center text-2xl text-gray-500 font-bold mb-8">此單元尚無選擇題庫喔！</p>
        )}
      </div>
    </div>
  );
}
