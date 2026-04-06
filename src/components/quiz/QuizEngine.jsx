import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCcw, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { postScore, postQuestionLog, getQuestionStats } from '../../api';

export default function QuizEngine({ questions = [], title, quizType, session }) {
  const [started, setStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  
  // 逐題答題紀錄
  const [questionResults, setQuestionResults] = useState([]);
  // 學生的歷史統計
  const [questionStats, setQuestionStats] = useState({});
  
  const [shake, setShake] = useState(false);

  const passThreshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '80', 10);
  const maxQuestions = parseInt(import.meta.env.VITE_QUESTION_COUNT || '10', 10);
  
  // 載入歷史統計
  useEffect(() => {
    if (session?.studentName) {
      const stats = getQuestionStats(session.studentName);
      setQuestionStats(stats);
    }
  }, [session?.studentName]);

  useEffect(() => {
    if (!questions) return;
    setStarted(false);
    setCurrentQIndex(0);
    setScore(0);
    setFinished(false);
    setShowFeedback(false);
    setActiveQuestions(questions.slice(0, maxQuestions));
    setWrongQuestions([]);
    setQuestionResults([]);
  }, [questions, maxQuestions]);

  if (!questions || questions.length === 0) return null;

  const statKey = `${session?.bookId}_${session?.unitId}_${quizType}`;

  const startQuiz = (mode = 'all') => {
    setStarted(true);
    setFinished(false);
    setCurrentQIndex(0);
    setScore(0);
    setShowFeedback(false);
    setQuestionResults([]);
    
    if (mode === 'retry' && wrongQuestions.length > 0) {
      setActiveQuestions(wrongQuestions);
      setWrongQuestions([]);
    } else {
      setActiveQuestions(questions.slice(0, maxQuestions));
      setWrongQuestions([]);
    }
  };

  const handleAnswer = (index) => {
    if (showFeedback || isSubmitting) return;
    const currentQ = activeQuestions[currentQIndex];
    
    let isAnsCorrect = false;
    if (typeof currentQ.ans === 'number') {
      isAnsCorrect = index === currentQ.ans;
    } else {
      isAnsCorrect = currentQ.options[index] === currentQ.ans || String(index) === String(currentQ.ans);
    }
    
    setIsCorrect(isAnsCorrect);
    setShowFeedback(true);
    
    // 記錄這題的答題結果
    setQuestionResults(prev => [...prev, {
      question: currentQ.q,
      isCorrect: isAnsCorrect
    }]);
    
    if (isAnsCorrect) {
      setScore(s => s + 1);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setWrongQuestions(prev => [...prev, currentQ]);
    }
  };

  const submitResults = async (finalScore, isPassed) => {
    setIsSubmitting(true);
    try {
      // 送出總分
      await postScore({
        studentName: session.studentName,
        bookId: session.bookId,
        unitId: session.unitId,
        quizType: quizType,
        score: finalScore,
        totalQuestions: activeQuestions.length,
        passed: isPassed
      });
      
      // 送出逐題紀錄
      await postQuestionLog({
        studentName: session.studentName,
        bookId: session.bookId,
        unitId: session.unitId,
        quizType: quizType,
        results: questionResults
      });
      
      // 更新本地統計快取
      const updatedStats = getQuestionStats(session.studentName);
      setQuestionStats(updatedStats);
      
      setIsSubmitting(false);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setShowFeedback(false);
    if (currentQIndex + 1 < activeQuestions.length) {
      setCurrentQIndex(c => c + 1);
    } else {
      const realScore = score;
      const scorePercentage = (realScore / activeQuestions.length) * 100;
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
      await submitResults(realScore, passed);
    }
  };

  // 取得某題的歷史統計
  const getQStat = (questionText) => {
    const stats = questionStats[statKey];
    if (!stats || !stats[questionText]) return null;
    return stats[questionText];
  };

  if (!started) {
    // 計算有多少歷史錯題
    const historicalWrong = questions.filter(q => {
      const stat = getQStat(q.q);
      return stat && stat.wrong > stat.correct;
    });

    return (
      <div className="bg-yellow-100 p-8 rounded-[2rem] text-center border-4 border-yellow-400 mt-8 hover:shadow-xl transition-shadow">
        <h3 className="text-3xl font-bold text-yellow-700 mb-4">🏆 {title} 挑戰時間！</h3>
        <p className="text-xl text-yellow-800 mb-6">總共有 {activeQuestions.length} 題，過關門檻是 {passThreshold} 分喔！</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => startQuiz('all')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg transform transition active:scale-95"
          >
            開始挑戰！
          </button>
          
          {historicalWrong.length > 0 && (
            <button 
              onClick={() => {
                setActiveQuestions(historicalWrong);
                setWrongQuestions([]);
                setQuestionResults([]);
                setStarted(true);
                setFinished(false);
                setCurrentQIndex(0);
                setScore(0);
                setShowFeedback(false);
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw size={24} /> 複習錯題 ({historicalWrong.length} 題)
            </button>
          )}
        </div>
      </div>
    );
  }

  if (finished) {
    const scorePercentage = (score / activeQuestions.length) * 100;
    const passed = scorePercentage >= passThreshold;

    return (
      <div className={`p-8 rounded-[3rem] text-center border-4 mt-8 animate-fade-in-up ${passed ? 'bg-green-100 border-green-400' : 'bg-rose-100 border-rose-400'}`}>
        <h3 className={`text-4xl font-extrabold mb-4 ${passed ? 'text-green-700' : 'text-rose-700'}`}>
          {passed ? '🎉 過關啦！太厲害了！' : '💪 不要灰心，下次會更好！'}
        </h3>
        
        <div className="bg-white/60 p-6 rounded-2xl mb-6 inline-block shadow-inner">
          <p className="text-3xl font-bold text-gray-800">
            本次成績： <span className={`text-5xl ${passed ? 'text-green-600' : 'text-rose-600'}`}>{Math.round(scorePercentage)}</span> 分
          </p>
          <p className="text-xl mt-2 font-bold text-gray-600">({score} / {activeQuestions.length} 題)</p>
        </div>

        {/* 逐題結果摘要 */}
        <div className="bg-white/80 p-6 rounded-2xl mb-6 text-left max-h-64 overflow-y-auto">
          <h4 className="text-xl font-extrabold text-gray-700 mb-3">📋 答題紀錄：</h4>
          {questionResults.map((r, i) => {
            const stat = getQStat(r.question);
            return (
              <div key={i} className={`flex items-start gap-2 py-2 border-b border-gray-100 last:border-0 ${r.isCorrect ? '' : 'bg-red-50 -mx-2 px-2 rounded-lg'}`}>
                <span className="text-xl shrink-0">{r.isCorrect ? '✅' : '❌'}</span>
                <span className="text-lg font-bold text-gray-700 flex-1">{r.question}</span>
                {stat && (
                  <span className="text-sm font-bold text-gray-400 shrink-0 bg-gray-100 px-2 py-1 rounded-lg">
                    歷史：✅{stat.correct} ❌{stat.wrong}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        {wrongQuestions.length > 0 && (
           <p className="text-2xl text-rose-600 font-bold mb-6">哎呀！有 {wrongQuestions.length} 題不太熟悉，讓我們再挑戰一次錯題吧！</p>
        )}
        
        {isSubmitting && <p className="text-blue-500 font-bold mb-4 animate-pulse">📡 正在傳送成績給老師...</p>}
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => startQuiz('all')}
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-2xl font-bold py-4 px-8 rounded-full shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={28} /> 再玩一次 (全部)
          </button>
          
          {wrongQuestions.length > 0 && (
            <button 
              onClick={() => startQuiz('retry')}
              disabled={isSubmitting}
              className="bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 text-white text-2xl font-bold py-4 px-8 rounded-full shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw size={28} /> 錯題重答 ({wrongQuestions.length} 題)
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = activeQuestions[currentQIndex];
  const currentQStat = getQStat(q.q);
  
  const isOptionAns = (idx, opt) => {
    if (typeof q.ans === 'number') return idx === q.ans;
    return opt === q.ans || String(idx) === String(q.ans);
  };

  return (
    <div className={`bg-white p-6 md:p-8 rounded-[2rem] shadow-xl mt-8 border-4 transition-colors ${showFeedback ? (isCorrect ? 'border-green-400 shadow-green-200' : 'border-red-400 shadow-red-200') : 'border-blue-200'} ${shake ? 'animate-shake' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">第 {currentQIndex + 1} 題 / 共 {activeQuestions.length} 題</h3>
        <span className="text-2xl font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-xl">得分: {score}</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {q.difficulty && (
          <span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-xl text-lg">難度：{q.difficulty}</span>
        )}
        {currentQStat && (
          <span className="bg-gray-100 text-gray-500 font-bold px-3 py-1 rounded-xl text-sm">
            歷史：✅{currentQStat.correct} ❌{currentQStat.wrong}
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-gray-800 mb-8 leading-snug whitespace-pre-wrap">{q.q}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {q.options.map((opt, idx) => {
          let btnClass = 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800 active:bg-blue-300';
          if (showFeedback) {
            if (isOptionAns(idx, opt)) {
              btnClass = 'bg-green-200 border-green-500 text-green-900 scale-105 shadow-lg shadow-green-200/50 z-10 transition-transform';
            } else {
              btnClass = 'bg-gray-100 border-gray-300 text-gray-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={showFeedback}
              className={`p-6 text-2xl font-bold rounded-2xl border-4 text-left transition-all ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className={`mt-8 p-6 rounded-3xl text-left border-4 shadow-sm animate-fade-in-up ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
          <div className={`text-3xl font-extrabold mb-4 flex items-center gap-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '✅ 答對了！你太厲害了！' : '❌ 哎呀！答錯囉！'}
          </div>
          <p className="text-2xl text-gray-800 leading-relaxed mb-6 bg-white p-5 rounded-2xl shadow-inner border-2 border-gray-100 whitespace-pre-line">
            <span className="font-extrabold text-blue-700 block mb-2">💡 魔法老師解說：</span> 
            {q.exp ? q.exp.replace(/\\n/g, '\n') : `正確答案應該是：「${typeof q.ans === 'number' ? q.options[q.ans] : q.ans}」`}
          </p>
          <button 
            onClick={handleNext}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-3xl font-extrabold py-5 rounded-2xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
          >
            下一題 <ArrowRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
