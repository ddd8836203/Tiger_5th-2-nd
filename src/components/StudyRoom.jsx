import React, { useState } from 'react';
import Header from './Header';
import { BookOpen, Edit3, Type, Gauge } from 'lucide-react';
import ReadingTab from './tabs/ReadingTab';
import GrammarTab from './tabs/GrammarTab';
import VocabTab from './tabs/VocabTab';
import { SPEECH_RATES, getSpeechRate, setSpeechRate } from '../utils';

export default function StudyRoom({ baseData, session, onReturnHome }) {
  const [activeTab, setActiveTab] = useState('reading');
  const [currentRate, setCurrentRate] = useState(getSpeechRate());
  const [showRateMenu, setShowRateMenu] = useState(false);

  const { studentName, bookId, unitId } = session;
  const unitKey = `${bookId}_${unitId}`;
  const currentUnitData = baseData.units[unitKey];

  if (!currentUnitData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-2xl font-bold">
        找不到這個單元的魔法資料喔！ <button onClick={onReturnHome} className="text-blue-500 underline mt-4">回首頁</button>
      </div>
    );
  }

  const handleTabChange = (tabId) => setActiveTab(tabId);

  const handleRateChange = (rate) => {
    setCurrentRate(rate);
    setSpeechRate(rate);
    setShowRateMenu(false);
  };

  const currentRateLabel = SPEECH_RATES.find(r => r.value === currentRate)?.label || '🚶 稍慢';

  return (
    <div className="min-h-screen bg-sky-50 font-sans pb-20">
      <Header 
        studentName={studentName} 
        unitTitle={currentUnitData.title}
        onReturnHome={onReturnHome}
      />

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* 分頁列 + 速度控制 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex bg-white rounded-full p-2 shadow-lg gap-2 overflow-x-auto border-4 border-blue-100">
            <button 
              onClick={() => handleTabChange('reading')}
              className={`flex-1 py-4 px-6 text-2xl font-bold rounded-full whitespace-nowrap transition-colors flex justify-center items-center gap-2 ${activeTab === 'reading' ? 'bg-blue-500 text-white shadow transform scale-105' : 'text-gray-600 hover:bg-blue-50'}`}
            >
              <BookOpen size={28} /> 課文探索
            </button>
            <button 
              onClick={() => handleTabChange('grammar')}
              className={`flex-1 py-4 px-6 text-2xl font-bold rounded-full whitespace-nowrap transition-colors flex justify-center items-center gap-2 ${activeTab === 'grammar' ? 'bg-purple-500 text-white shadow transform scale-105' : 'text-gray-600 hover:bg-purple-50'}`}
            >
              <Edit3 size={28} /> 文法魔法
            </button>
            <button 
              onClick={() => handleTabChange('vocab')}
              className={`flex-1 py-4 px-6 text-2xl font-bold rounded-full whitespace-nowrap transition-colors flex justify-center items-center gap-2 ${activeTab === 'vocab' ? 'bg-green-500 text-white shadow transform scale-105' : 'text-gray-600 hover:bg-green-50'}`}
            >
              <Type size={28} /> 單字力量
            </button>
          </div>

          {/* 語速控制按鈕 */}
          <div className="relative">
            <button
              onClick={() => setShowRateMenu(!showRateMenu)}
              className="bg-white rounded-2xl p-3 shadow-lg border-4 border-amber-200 hover:border-amber-400 transition-colors flex items-center gap-2 whitespace-nowrap"
              title="朗讀速度"
            >
              <Gauge size={24} className="text-amber-600" />
              <span className="text-lg font-bold text-amber-700 hidden sm:inline">{currentRateLabel}</span>
            </button>

            {showRateMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRateMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-4 border-amber-200 p-2 z-50 w-48 animate-fade-in">
                  <div className="text-sm font-bold text-amber-800 px-3 py-2 border-b border-amber-100">🔊 朗讀速度</div>
                  {SPEECH_RATES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => handleRateChange(r.value)}
                      className={`w-full text-left px-3 py-3 rounded-xl text-lg font-bold transition-colors ${currentRate === r.value ? 'bg-amber-100 text-amber-800' : 'text-gray-700 hover:bg-amber-50'}`}
                    >
                      {r.label} <span className="text-sm text-gray-400 ml-1">{Math.round(r.value * 100)}%</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {activeTab === 'reading' && <ReadingTab unitData={currentUnitData} session={session} />}
        {activeTab === 'grammar' && <GrammarTab unitData={currentUnitData} session={session} />}
        {activeTab === 'vocab' && <VocabTab unitData={currentUnitData} session={session} />}
      </main>
    </div>
  );
}
