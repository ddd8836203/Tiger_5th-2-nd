import React, { useState } from 'react';
import Header from './Header';
import { BookOpen, Edit3, Type } from 'lucide-react';
import ReadingTab from './tabs/ReadingTab';
import GrammarTab from './tabs/GrammarTab';
import VocabTab from './tabs/VocabTab';

export default function StudyRoom({ baseData, session, onReturnHome }) {
  const [activeTab, setActiveTab] = useState('reading');

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

  return (
    <div className="min-h-screen bg-sky-50 font-sans pb-20">
      <Header 
        studentName={studentName} 
        unitTitle={currentUnitData.title}
        onReturnHome={onReturnHome}
      />

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex bg-white rounded-full p-2 shadow-lg gap-2 overflow-x-auto border-4 border-blue-100">
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
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {activeTab === 'reading' && <ReadingTab unitData={currentUnitData} session={session} />}
        {activeTab === 'grammar' && <GrammarTab unitData={currentUnitData} session={session} />}
        {activeTab === 'vocab' && <VocabTab unitData={currentUnitData} session={session} />}
      </main>
    </div>
  );
}
