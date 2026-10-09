import React, { useState } from 'react';
import { MealSpecimen } from '../types';
import { playSound } from '../utils/audio';

interface ManualEntryModalProps {
  onAddMeal: (meal: MealSpecimen) => void;
  onClose: () => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ onAddMeal, onClose }) => {
  const [title, setTitle] = useState('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Refreshment'>('Lunch');
  const [calories, setCalories] = useState<number | ''>(450);
  const [protein, setProtein] = useState<number | ''>(30);
  const [carbs, setCarbs] = useState<number | ''>(40);
  const [fat, setFat] = useState<number | ''>(15);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playSound('stamp');
    const newMeal: MealSpecimen = {
      id: `manual-${Date.now()}`,
      specimenNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      mealType,
      title: title.trim(),
      description: description.trim() || 'Hand-written culinary entry pinned to the journal.',
      calories: Number(calories) || 0,
      netWeightGrams: 200,
      proteinGrams: Number(protein) || 0,
      carbsGrams: Number(carbs) || 0,
      fatGrams: Number(fat) || 0,
      score: 9.0,
      confidencePercent: 99,
      isAiVerified: false,
      items: [
        {
          name: title.trim(),
          portion: '1 serving',
          calories: Number(calories) || 0,
          topPercent: 40,
          leftPercent: 30,
        },
      ],
    };

    onAddMeal(newMeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#241f1b] border-2 border-[#524439] rounded-2xl p-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#524439]/40 pb-3 mb-4">
          <div>
            <span className="text-[9px] font-mono text-[#a08d80] uppercase tracking-wider block">
              CHRONO-JOURNAL ENTRY
            </span>
            <h2 className="font-headline-md text-lg text-[#ffb77b]">Hand-Log Nourishment</h2>
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

        <form onSubmit={handleSubmit} className="space-y-3 text-xs text-[#ebe0db]">
          <div>
            <label className="block text-[#ffb77b] font-bold mb-1">Meal Title</label>
            <input
              type="text"
              placeholder="e.g. Steel-Cut Oats with Blueberries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#120d0a] border border-[#524439] rounded-lg inset-well focus:outline-none focus:border-[#ffb77b]"
            />
          </div>

          <div>
            <label className="block text-[#a08d80] font-bold mb-1">Meal Type</label>
            <div className="grid grid-cols-4 gap-1">
              {(['Breakfast', 'Lunch', 'Dinner', 'Refreshment'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => {
                    playSound('tick');
                    setMealType(type);
                  }}
                  className={`py-1.5 rounded text-[10px] font-bold text-center transition-all ${
                    mealType === type
                      ? 'bg-[#c8803f] text-[#432100]'
                      : 'bg-[#120d0a] text-[#d8c3b4] border border-[#524439]/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#ffb77b] font-bold mb-1">Energy (Kcal)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono focus:outline-none focus:border-[#ffb77b]"
              />
            </div>
            <div>
              <label className="block text-[#abcebe] font-bold mb-1">Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono focus:outline-none focus:border-[#abcebe]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#ffb77b] font-bold mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono focus:outline-none focus:border-[#ffb77b]"
              />
            </div>
            <div>
              <label className="block text-[#8fd1e1] font-bold mb-1">Fat (g)</label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono focus:outline-none focus:border-[#8fd1e1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#a08d80] font-bold mb-1">Sensory Notes / Ingredients</label>
            <input
              type="text"
              placeholder="e.g. Organic rolled oats, maple syrup, toasted pecans"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#120d0a] border border-[#524439] rounded-lg inset-well focus:outline-none focus:border-[#ffb77b]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                playSound('tick');
                onClose();
              }}
              className="flex-1 py-2 rounded-xl bg-[#201b17] border border-[#524439] text-[#d8c3b4] text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#2f4f42] hover:bg-[#3a6353] border border-[#abcebe] text-[#c6ebd9] text-xs font-bold active:scale-95 shadow"
            >
              Pin to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
