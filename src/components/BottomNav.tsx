import React from 'react';
import { Home, BookOpen, Sparkles, RotateCcw, Library, History } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'learn', label: 'Flashcard', icon: BookOpen },
    { id: 'quiz', label: 'Quiz', icon: Sparkles },
    { id: 'saturday_review', label: 'Review', icon: RotateCcw },
    { id: 'library', label: 'Kamus', icon: Library },
    { id: 'history', label: 'Riwayat', icon: History }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 py-1.5 px-1 flex justify-between items-center lg:hidden shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
              isActive
                ? 'text-blue-600 font-extrabold scale-105'
                : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-100 text-blue-600' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] leading-none mt-0.5 font-bold truncate max-w-[54px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
