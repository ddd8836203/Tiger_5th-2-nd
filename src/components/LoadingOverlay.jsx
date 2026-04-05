import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ text = "魔法讀取中..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in pointer-events-auto select-none">
      <div className="bg-white/90 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 border-8 border-white">
        <Loader2 size={80} className="text-blue-500 animate-spin" />
        <h2 className="text-4xl font-extrabold text-blue-600 tracking-wider">
          {text} 🌀
        </h2>
        <p className="text-xl font-bold text-gray-500">不要亂點，等等我們馬上就好喔！</p>
      </div>
    </div>
  );
}
