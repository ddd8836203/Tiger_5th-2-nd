import React from 'react';
import { XCircle } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <XCircle size={32} className="text-gray-600" />
        </button>
        <h2 className="text-3xl font-bold mb-4 text-blue-600 flex items-center gap-2 pr-8">
          {title}
        </h2>
        <div className="text-xl leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
