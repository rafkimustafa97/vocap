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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 py-2 px-2 flex justify-around items-center md:hidden shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all ${
              isActive
                ? 'text-blue-600 font-bold scale-105'
                : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-100 text-blue-600' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[9px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
