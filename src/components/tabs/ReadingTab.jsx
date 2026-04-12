import React, { useState, useCallback, useRef } from 'react';
import { Volume2, HelpCircle, Star, Languages, StopCircle } from 'lucide-react';
import { speakText, getSpeechRate } from '../../utils';
import Modal from '../Modal';
import QuizEngine from '../quiz/QuizEngine';

// 把段落拆成句子陣列
function splitSentences(text) {
  // 用句號、問號、驚嘆號拆句，保留分隔符
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.filter(s => s.trim().length > 0);
}

export default function ReadingTab({ unitData, session }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentExpl, setCurrentExpl] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  
  // 高亮狀態
  const [speakingChunkId, setSpeakingChunkId] = useState(null);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(-1);
  const stopRef = useRef(false);

  const openExplanation = (chunk) => {
    setCurrentExpl(chunk);
    setShowTranslation(false);
    setModalOpen(true);
  };

  const textData = unitData?.textData || [];
  const questions = unitData?.quizzes?.reading || [];

  // 逐句朗讀
  const handleSpeak = useCallback((chunk) => {
    // 如果正在唸同一段，停止
    if (speakingChunkId === chunk.id) {
      window.speechSynthesis.cancel();
      setSpeakingChunkId(null);
      setCurrentSentenceIdx(-1);
      stopRef.current = true;
      return;
    }

    window.speechSynthesis.cancel();
    stopRef.current = false;

    const sentences = splitSentences(chunk.eng);
    if (sentences.length === 0) return;

    setSpeakingChunkId(chunk.id);
    setCurrentSentenceIdx(0);

    const speakNext = (idx) => {
      if (stopRef.current || idx >= sentences.length) {
        setSpeakingChunkId(null);
        setCurrentSentenceIdx(-1);
        return;
      }

      setCurrentSentenceIdx(idx);

      // 用 speakText 自動挑最佳語音
      speakText(sentences[idx], {
        rate: getSpeechRate(),
        skipCancel: true,
        onEnd: () => {
          if (!stopRef.current) {
            speakNext(idx + 1);
          }
        },
        onError: () => {
          setSpeakingChunkId(null);
          setCurrentSentenceIdx(-1);
        }
      });
    };

    speakNext(0);
  }, [speakingChunkId]);

  // 停止朗讀
  const handleStop = () => {
    window.speechSynthesis.cancel();
    stopRef.current = true;
    setSpeakingChunkId(null);
    setCurrentSentenceIdx(-1);
  };

  // 渲染帶高亮的文字
  const renderText = (text, chunkId) => {
    if (speakingChunkId !== chunkId) return text;
    
    const sentences = splitSentences(text);
    return sentences.map((sentence, idx) => (
      <span
        key={idx}
        className={idx === currentSentenceIdx 
          ? 'bg-yellow-300 rounded-lg px-1 py-0.5 transition-all duration-300' 
          : 'transition-all duration-300'}
      >
        {sentence}{idx < sentences.length - 1 ? ' ' : ''}
      </span>
    ));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-extrabold text-blue-800 mb-6 flex items-center gap-2">
        <Star className="text-yellow-500 shrink-0" size={36} /> {unitData.bigQuestion}
      </h2>
      <div className="space-y-6">
        {textData.map((chunk) => (
          <div key={chunk.id} className={`bg-white p-6 rounded-[2rem] shadow-md border-2 transition-all group ${speakingChunkId === chunk.id ? 'border-yellow-400 shadow-yellow-200' : 'border-transparent hover:border-blue-300'}`}>
            <p className="text-3xl leading-snug text-gray-800 font-bold mb-6">
              {renderText(chunk.eng, chunk.id)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => handleSpeak(chunk)}
                className={`flex-1 py-4 rounded-2xl text-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform ${speakingChunkId === chunk.id ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
              >
                {speakingChunkId === chunk.id ? (
                  <><StopCircle size={32} /> 停止</>
                ) : (
                  <><Volume2 size={32} /> 聽老師唸</>
                )}
              </button>
              <button 
                onClick={() => openExplanation(chunk)}
                className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-4 rounded-2xl text-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <HelpCircle size={32} /> 這是什麼意思？
              </button>
            </div>
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <QuizEngine 
          questions={questions} 
          title="課文理解" 
          quizType="reading" 
          session={session} 
        />
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={<><HelpCircle size={36} className="shrink-0" /> 這是什麼意思？</>}
      >
        {currentExpl && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
              <h4 className="text-2xl font-extrabold text-blue-800 mb-2">🤖 簡單英文解釋 (Simple English):</h4>
              <p className="text-2xl text-gray-800 leading-relaxed font-bold">
                {currentExpl.expEng}
              </p>
              <button 
                onClick={() => speakText(currentExpl.expEng)}
                className="mt-4 bg-blue-200 hover:bg-blue-300 text-blue-800 py-3 px-6 rounded-2xl text-xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-sm"
              >
                <Volume2 size={28} /> 聽解釋
              </button>
            </div>

            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-5 rounded-2xl text-2xl font-extrabold flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-95"
            >
              <Languages size={32} /> {showTranslation ? '隱藏中文翻譯' : '顯示中文翻譯'}
            </button>

            {showTranslation && (
              <div className="bg-indigo-50 p-6 rounded-2xl border-4 border-indigo-200 animate-fade-in-up">
                <div className="mb-4">
                  <h4 className="text-xl font-extrabold text-indigo-800 mb-1">📜 課文中文：</h4>
                  <p className="text-2xl text-gray-800 leading-relaxed font-bold">{currentExpl.chi}</p>
                </div>
                <hr className="border-indigo-200 border-2 my-4" />
                <div>
                  <h4 className="text-xl font-extrabold text-indigo-800 mb-1">💡 解釋的中文：</h4>
                  <p className="text-2xl text-gray-800 leading-relaxed font-bold">{currentExpl.expChi}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
