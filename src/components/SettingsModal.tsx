import React, { useState } from 'react';
import { UserGoals } from '../types';
import { playSound } from '../utils/audio';

interface SettingsModalProps {
  goals: UserGoals;
  onSave: (goals: UserGoals) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ goals, onSave, onClose }) => {
  const [calorieTarget, setCalorieTarget] = useState(goals.dailyCalorieTarget);
  const [waterTarget, setWaterTarget] = useState(goals.dailyWaterTargetMl);
  const [proteinTarget, setProteinTarget] = useState(goals.proteinTargetGrams);
  const [carbsTarget, setCarbsTarget] = useState(goals.carbsTargetGrams);
  const [fatTarget, setFatTarget] = useState(goals.fatTargetGrams);

  const handleSave = () => {
    playSound('stamp');
    onSave({
      ...goals,
      dailyCalorieTarget: Number(calorieTarget) || 2100,
      dailyWaterTargetMl: Number(waterTarget) || 2500,
      proteinTargetGrams: Number(proteinTarget) || 140,
      carbsTargetGrams: Number(carbsTarget) || 220,
      fatTargetGrams: Number(fatTarget) || 65,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#241f1b] border-2 border-[#524439] rounded-2xl p-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#524439]/40 pb-3 mb-4">
          <div>
            <span className="text-[9px] font-mono text-[#a08d80] uppercase tracking-wider block">
              CHRONO-CALIBRATION
            </span>
            <h2 className="font-headline-md text-lg text-[#ffb77b]">Dial Goals Calibration</h2>
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

        {/* Inputs */}
        <div className="space-y-3.5 text-xs text-[#ebe0db]">
          <div>
            <label className="block text-[#ffb77b] font-bold mb-1">Daily Calorie Target (Kcal)</label>
            <input
              type="number"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono focus:outline-none focus:border-[#ffb77b]"
            />
          </div>

          <div>
            <label className="block text-[#8fd1e1] font-bold mb-1">Hydration Reservoir Goal (ml)</label>
            <input
              type="number"
              step="100"
              value={waterTarget}
              onChange={(e) => setWaterTarget(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono focus:outline-none focus:border-[#8fd1e1]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[#abcebe] text-[10px] font-bold mb-1">Protein (g)</label>
              <input
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono text-center focus:outline-none focus:border-[#abcebe]"
              />
            </div>
            <div>
              <label className="block text-[#ffb77b] text-[10px] font-bold mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbsTarget}
                onChange={(e) => setCarbsTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono text-center focus:outline-none focus:border-[#ffb77b]"
              />
            </div>
            <div>
              <label className="block text-[#8fd1e1] text-[10px] font-bold mb-1">Fat (g)</label>
              <input
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-[#120d0a] border border-[#524439] rounded-lg inset-well font-mono text-center focus:outline-none focus:border-[#8fd1e1]"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => {
              playSound('tick');
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-[#201b17] border border-[#524439] text-[#d8c3b4] text-xs font-bold active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl bg-[#c8803f] hover:bg-[#ffb77b] text-[#432100] text-xs font-bold active:scale-95 shadow font-label"
          >
            Save Calibration
          </button>
        </div>
      </div>
    </div>
  );
};
