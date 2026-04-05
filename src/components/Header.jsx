import React from 'react';
import { LogOut, BookOpen } from 'lucide-react';

export default function Header({ studentName, unitTitle, onReturnHome }) {
  return (
    <header className="bg-blue-600 text-white p-6 shadow-md rounded-b-[2rem]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* 左側：單元標題 */}
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-center md:text-left">
          <BookOpen size={40} className="shrink-0 text-yellow-300" /> {unitTitle}
        </h1>

        {/* 右側：玩家狀態與返回 */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-800 px-6 py-2 rounded-full font-bold text-xl border-2 border-blue-400">
            🧙‍♂️ 小魔法師：{studentName}
          </div>
          <button 
            onClick={onReturnHome}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transform transition active:scale-95 shadow-md"
          >
            <LogOut size={24} /> 換課程
          </button>
        </div>

      </div>
    </header>
  );
}
