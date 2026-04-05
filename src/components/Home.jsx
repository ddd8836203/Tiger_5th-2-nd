import React, { useState } from 'react';
import { BookOpen, User, Play, Layers } from 'lucide-react';

export default function Home({ baseData, initialName = '', onStart }) {
  const [name, setName] = useState(initialName);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const books = baseData ? Object.values(baseData.books) : [];
  
  // 取得目前被選中的書本，以便列出其單元
  const currentBookObj = baseData && selectedBook ? baseData.books[selectedBook] : null;
  const units = currentBookObj ? currentBookObj.units : [];

  const handleStart = () => {
    if (!name.trim()) {
      alert("請先輸入你的名字喔！");
      return;
    }
    if (!selectedBook || !selectedUnit) {
      alert("請選擇你想學習的書本跟單元！");
      return;
    }
    onStart({ studentName: name.trim(), bookId: selectedBook, unitId: selectedUnit });
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-2xl w-full border-8 border-white animate-fade-in-up">
        <h1 className="text-5xl font-extrabold text-blue-600 text-center mb-8 flex items-center justify-center gap-4">
          <BookOpen size={56} /> 英語魔法學院
        </h1>

        <div className="space-y-8">
          {/* 輸入姓名 */}
          <div className="bg-orange-50 p-6 rounded-3xl border-4 border-orange-200">
            <label className="text-2xl font-bold text-orange-800 flex items-center gap-2 mb-4">
              <User size={32} /> 第一步：請問你的名字是？
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="請輸入名字 (例: 小兔)"
              className="w-full text-3xl font-bold p-4 outline-none rounded-2xl border-4 border-orange-300 focus:border-orange-500 transition-colors"
              autoFocus
            />
          </div>

          {/* 選擇書本 */}
          <div className="bg-blue-50 p-6 rounded-3xl border-4 border-blue-200">
            <label className="text-2xl font-bold text-blue-800 flex items-center gap-2 mb-4">
              <Layers size={32} /> 第二步：打開哪一本魔法書？
            </label>
            <div className="flex flex-wrap gap-4">
              {books.map(b => (
                <button 
                  key={b.id}
                  onClick={() => { setSelectedBook(b.id); setSelectedUnit(''); }}
                  className={`text-2xl font-bold py-3 px-6 rounded-2xl border-4 transition-transform active:scale-95 ${selectedBook === b.id ? 'bg-blue-500 text-white border-blue-600 shadow-xl' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'}`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* 選擇單元 */}
          {selectedBook && (
            <div className="bg-green-50 p-6 rounded-3xl border-4 border-green-200 animate-fade-in">
              <label className="text-2xl font-bold text-green-800 flex items-center gap-2 mb-4">
                <BookOpen size={32} /> 第三步：請問你想去哪個單元探險？
              </label>
              <div className="flex flex-wrap gap-4">
                {units.map(u => {
                  const unitKey = `${selectedBook}_${u}`;
                  const unitTitle = baseData.units[unitKey]?.title || `Unit ${u}`;
                  return (
                    <button 
                      key={u}
                      onClick={() => setSelectedUnit(u)}
                      className={`text-2xl font-bold py-3 px-6 rounded-2xl border-4 transition-transform active:scale-95 ${selectedUnit === u ? 'bg-green-500 text-white border-green-600 shadow-xl' : 'bg-white text-green-800 border-green-300 hover:bg-green-100'}`}
                    >
                      {unitTitle.split('-')[0].trim()} {/* 短圖標的話可以只顯示 Unit 數字 */}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 開始按鈕 */}
          <button 
            onClick={handleStart}
            disabled={!name.trim() || !selectedBook || !selectedUnit}
            className={`w-full text-4xl font-extrabold py-6 rounded-3xl flex items-center justify-center gap-4 transition-all shadow-xl
              ${(!name.trim() || !selectedBook || !selectedUnit) 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-400 text-yellow-900 border-b-8 border-yellow-600 hover:bg-yellow-300 active:translate-y-2 active:border-b-0'
              }`}
          >
            <Play size={48} /> 出發探險！
          </button>
        </div>
      </div>
    </div>
  );
}
