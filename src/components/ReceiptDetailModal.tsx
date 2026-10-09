import React from 'react';
import { MealSpecimen } from '../types';
import { playSound } from '../utils/audio';

interface ReceiptDetailModalProps {
  receipt: MealSpecimen | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receipt,
  onClose,
  onDelete,
}) => {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#241f1b] border-2 border-[#524439] rounded-2xl p-5 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Brass corner accent screws */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-[#524439] screw-head"></div>
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#524439] screw-head"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#524439]/40 pb-3 mb-3">
          <div>
            <span className="text-[9px] font-mono text-[#a08d80] uppercase tracking-wider block">
              CHRONO-SPECIMEN {receipt.specimenNumber || '#RECEIPT'}
            </span>
            <h2 className="font-headline-md text-lg text-[#ffb77b] leading-tight">{receipt.title}</h2>
          </div>
          <button
            onClick={() => {
              playSound('tick');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#2f2925] border border-[#524439] flex items-center justify-center text-[#d8c3b4] hover:text-[#ffb77b]"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Photo if present */}
        {receipt.imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#524439]/50 mb-3.5 bg-black">
            <img src={receipt.imageUrl} alt={receipt.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-[#120d0a]/80 px-2 py-0.5 rounded text-[#ffb77b] font-mono">
              {receipt.time} • {receipt.mealType}
            </div>
          </div>
        )}

        {/* Nutritional Scoreboard */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#120d0a] p-2.5 rounded-xl inset-well border border-[#524439]/30 text-center">
            <span className="text-[9px] font-mono text-[#a08d80] uppercase block">TOTAL ENERGY</span>
            <span className="font-headline-md text-2xl text-[#ffb77b] font-bold">{receipt.calories}</span>
            <span className="text-[9px] text-[#ffb77b] font-bold block">KCAL</span>
          </div>
          <div className="bg-[#120d0a] p-2.5 rounded-xl inset-well border border-[#524439]/30 text-center">
            <span className="text-[9px] font-mono text-[#a08d80] uppercase block">DIET QUALITY</span>
            <span className="font-headline-md text-2xl text-[#abcebe] font-bold">{receipt.score}</span>
            <span className="text-[9px] text-[#abcebe] font-bold block">OUT OF 10</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#d8c3b4] italic mb-3 bg-[#201b17] p-2.5 rounded-lg border border-[#524439]/30">
          "{receipt.description}"
        </p>

        {/* Itemized food breakdown if available */}
        {receipt.items && receipt.items.length > 0 && (
          <div className="space-y-1.5 mb-3.5">
            <span className="text-[9px] font-mono text-[#a08d80] uppercase tracking-wider block">
              OPTICALLY IDENTIFIED INGREDIENTS
            </span>
            <div className="space-y-1 bg-[#120d0a] p-2.5 rounded-xl inset-well border border-[#524439]/30">
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs text-[#ebe0db] border-b border-[#524439]/20 pb-1 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffb77b]"></span>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[#a08d80] font-mono text-[10px]">{item.portion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Macronutrients */}
        <div className="space-y-2 mb-4 bg-[#201b17] p-3 rounded-xl border border-[#524439]/40">
          <span className="text-[9px] font-mono text-[#a08d80] uppercase tracking-wider block">
            MACRONUTRIENT BALANCE
          </span>
          <div className="flex justify-between text-xs">
            <span className="text-[#ffb77b]">Protein</span>
            <span className="font-bold">{receipt.proteinGrams}g ({receipt.proteinGrams * 4} kcal)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#abcebe]">Carbs</span>
            <span className="font-bold">{receipt.carbsGrams}g ({receipt.carbsGrams * 4} kcal)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8fd1e1]">Fat</span>
            <span className="font-bold">{receipt.fatGrams}g ({receipt.fatGrams * 9} kcal)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => {
              playSound('clack');
              if (confirm('Delete this nourishment receipt from the journal?')) {
                onDelete(receipt.id);
                onClose();
              }
            }}
            className="flex-1 py-2 rounded-xl bg-[#201b17] hover:bg-[#2f2925] border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs font-bold transition-all active:scale-95"
          >
            Remove Receipt
          </button>
          <button
            onClick={() => {
              playSound('tick');
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-[#c8803f] hover:bg-[#ffb77b] text-[#432100] text-xs font-bold transition-all active:scale-95 shadow"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
