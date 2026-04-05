import React, { useState, useEffect } from 'react';
import { Volume2, Eye, CheckCircle, XCircle, RefreshCcw, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { postScore } from '../../api';
import { speakText } from '../../utils';

export default function SpellingQuizEngine({ words = [], title, quizType, session }) {
  const [started, setStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [wrongQuestions, setWrongQuestions] = useState([]);

  // Environment variables
  const passThreshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '80', 10);
  
  // 只選有單字屬性的
  useEffect(() => {
    if (!words) return;
    setStarted(false);
    setCurrentQIndex(0);
    setScore(0);
    setFinished(false);
    setShowAnswer(false);
    setActiveQuestions(words.filter(w => w.word));
    setWrongQuestions([]);
  }, [words]);

  if (!words || words.length === 0) return null;

  const startQuiz = (mode = 'all') => {
    setStarted(true);
    setFinished(false);
    setCurrentQIndex(0);
    setScore(0);
    setShowAnswer(false);
    
    if (mode === 'retry' && wrongQuestions.length > 0) {
      setActiveQuestions(wrongQuestions);
      setWrongQuestions([]);
    } else {
      setActiveQuestions(words.filter(w => w.word));
      setWrongQuestions([]);
    }
  };

  const submitResults = async (finalScore, isPassed) => {
    setIsSubmitting(true);
    try {
      await postScore({
        studentName: session.studentName,
        bookId: session.bookId,
        unitId: session.unitId,
        quizType: quizType,
        score: finalScore,
        totalQuestions: activeQuestions.length,
        passed: isPassed
      });
      setIsSubmitting(false);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleNext = async (isCorrect) => {
    const finalScore = isCorrect ? score + 1 : score;
    setScore(finalScore);

    if (!isCorrect) {
      setWrongQuestions(prev => [...prev, activeQuestions[currentQIndex]]);
    }

    setShowAnswer(false);
    if (currentQIndex + 1 < activeQuestions.length) {
      setCurrentQIndex(c => c + 1);
    } else {
      const scorePercentage = (finalScore / activeQuestions.length) * 100;
      const passed = scorePercentage >= passThreshold;
      
      if (passed) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
      }
      
      setFinished(true);
      await submitResults(finalScore, passed);
    }
  };

  if (!started) {
    return (
      <div className="bg-teal-100 p-8 rounded-[2rem] text-center border-4 border-teal-400 mt-8 hover:shadow-xl transition-shadow">
        <h3 className="text-3xl font-bold text-teal-800 mb-4">🎧 {title} 挑戰時間！</h3>
        <p className="text-xl text-teal-900 mb-6">
          總共有 {activeQuestions.length} 題。請準備好紙筆，點擊播放發音後將單字拼寫下來，再點擊看答案核對喔！
        </p>
        <button 
          onClick={() => startQuiz('all')}
          className="bg-teal-500 hover:bg-teal-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg transform transition active:scale-95"
        >
          開始聽音拼字！
        </button>
      </div>
    );
  }

  if (finished) {
    const scorePercentage = (score / activeQuestions.length) * 100;
    const passed = scorePercentage >= passThreshold;

    return (
      <div className={`p-8 rounded-[3rem] text-center border-4 mt-8 animate-fade-in-up ${passed ? 'bg-green-100 border-green-400' : 'bg-rose-100 border-rose-400'}`}>
        <h3 className={`text-4xl font-bold mb-4 ${passed ? 'text-green-700' : 'text-rose-700'}`}>
          {passed ? '🎉 測驗完成！太棒了！' : '💪 測驗完成！再接再厲！'}
        </h3>
        
        <div className="bg-white/60 p-6 rounded-2xl mb-6 inline-block shadow-inner">
          <p className="text-3xl font-bold text-gray-800">
            你的得分： <span className={`text-5xl ${passed ? 'text-green-600' : 'text-rose-600'}`}>{Math.round(scorePercentage)}</span> 分
          </p>
          <p className="text-xl mt-2 font-bold text-gray-600">({score} / {activeQuestions.length} 題)</p>
        </div>
        
        {isSubmitting && <p className="text-blue-500 font-bold mb-4 animate-pulse">📡 正在傳送成績給老師...</p>}
        
        {!passed && wrongQuestions.length > 0 && <p className="text-2xl text-rose-600 font-bold mb-6">有 {wrongQuestions.length} 個單字拼錯囉，趕緊再練習一次吧！</p>}
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => startQuiz('all')}
            disabled={isSubmitting}
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white text-2xl font-bold py-4 px-8 rounded-full shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={28} /> 重新測試 (全部)
          </button>
          
          {wrongQuestions.length > 0 && (
            <button 
              onClick={() => startQuiz('retry')}
              disabled={isSubmitting}
              className="bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 text-white text-2xl font-bold py-4 px-8 rounded-full shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw size={28} /> 錯題重測
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentWordObj = activeQuestions[currentQIndex];

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl mt-8 border-4 border-teal-200">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-xl">第 {currentQIndex + 1} 題 / 共 {activeQuestions.length} 題</h3>
        <span className="text-2xl font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-xl">得分: {score}</span>
      </div>

      {!showAnswer ? (
        <div className="flex flex-col items-center animate-fade-in">
          <p className="text-3xl font-bold text-gray-700 mb-8">請點擊播放發音並在紙上寫下單字：</p>
          
          <button 
            onClick={() => speakText(currentWordObj.word)}
            className="w-48 h-48 bg-teal-100 hover:bg-teal-200 text-teal-600 rounded-full flex flex-col items-center justify-center gap-4 transition-transform active:scale-90 shadow-[0_0_15px_rgba(20,184,166,0.3)] mb-8 border-4 border-teal-300"
          >
            <Volume2 size={80} />
            <span className="text-xl font-extrabold">聽發音</span>
          </button>

          <button 
            onClick={() => setShowAnswer(true)}
            className="w-full max-w-md bg-slate-200 hover:bg-slate-300 text-slate-700 text-2xl font-bold py-5 rounded-2xl shadow transition-transform active:scale-95 flex justify-center items-center gap-2"
          >
            <Eye size={28} /> 看答案
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-fade-in-up">
          <div className="bg-teal-50 w-full p-8 rounded-3xl text-center border-4 border-teal-200 mb-8 shadow-inner">
            <h2 className="text-7xl font-extrabold text-teal-700 mb-4">{currentWordObj.word}</h2>
            <p className="text-3xl font-bold text-gray-600">{currentWordObj.chi}</p>
          </div>
          
          <p className="text-3xl font-extrabold text-gray-800 mb-6 bg-yellow-100 px-6 py-2 rounded-xl">你剛剛寫對了嗎？誠實評分喔！🌟</p>
          
          <div className="flex flex-col md:flex-row w-full gap-6">
            <button 
              onClick={() => handleNext(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-3xl font-extrabold py-5 rounded-3xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-3 border-b-8 border-green-700 hover:border-b-0 hover:translate-y-2"
            >
              <CheckCircle size={36} /> 我全對！
            </button>
            <button 
              onClick={() => handleNext(false)}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-3xl font-extrabold py-5 rounded-3xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-3 border-b-8 border-rose-700 hover:border-b-0 hover:translate-y-2"
            >
              <XCircle size={36} /> 寫錯了...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
