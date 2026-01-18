import React, { useState } from 'react';
import { WeeklyCollectionItem } from '../types';
import { Sticker } from './Sticker';
import { ArrowLeft, Book } from './Icons';

interface CollectionProps {
  items: WeeklyCollectionItem[];
  onBack: () => void;
}

export const Collection: React.FC<CollectionProps> = ({ items, onBack }) => {
  const [selectedItem, setSelectedItem] = useState<WeeklyCollectionItem | null>(null);

  // Detail View
  if (selectedItem) {
      return (
        <div className="h-full flex flex-col animate-fade-in p-6">
            <button onClick={() => setSelectedItem(null)} className="self-start p-2 bg-white/5 rounded-full mb-6">
                <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 flex flex-col items-center text-center">
                 <div className="relative mb-8">
                     <div className="absolute inset-0 blur-[60px] opacity-20" style={{ backgroundColor: selectedItem.sticker.color }} />
                     <Sticker archetype={selectedItem.sticker.archetype} color={selectedItem.sticker.color} className="w-48 h-48 relative z-10" />
                 </div>
                 
                 <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.sticker.name}</h2>
                 <p className="text-xs text-blue-400 mb-8 uppercase tracking-widest">{new Date(selectedItem.weekStartDate).toLocaleDateString()}</p>

                 <div className="bg-white/5 p-6 rounded-2xl border border-white/10 w-full text-left">
                     <h3 className="text-xs text-teal-400 uppercase font-bold mb-2">Why this character?</h3>
                     <p className="text-blue-100 mb-6 text-sm">{selectedItem.sticker.reason}</p>
                     
                     <h3 className="text-xs text-teal-400 uppercase font-bold mb-2">Story of that week</h3>
                     <p className="text-blue-200 text-sm leading-relaxed italic">"{selectedItem.story}"</p>
                 </div>
            </div>
        </div>
      );
  }

  // Grid View
  return (
    <div className="h-full flex flex-col animate-fade-in">
        <div className="flex items-center gap-4 mb-6 p-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-blue-200" />
            </button>
            <h1 className="text-xl font-semibold">My Collection</h1>
        </div>

        {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-50">
                <Book className="w-16 h-16 mb-4 text-blue-300" />
                <p>No characters collected yet.</p>
                <p className="text-sm mt-2">Complete a Weekly Reflection to earn one.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4 p-4 overflow-y-auto pb-20">
                {items.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="glass-panel p-4 rounded-2xl flex flex-col items-center hover:bg-white/10 transition-all aspect-square justify-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: item.sticker.color }} />
                        <Sticker archetype={item.sticker.archetype} color={item.sticker.color} className="w-16 h-16 mb-3" />
                        <span className="text-xs font-medium text-blue-100 truncate w-full text-center">{item.sticker.name}</span>
                        <span className="text-[10px] text-blue-400">{new Date(item.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};