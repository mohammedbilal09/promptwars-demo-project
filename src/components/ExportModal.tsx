import React, { useState } from 'react';
import { DayRecord, UserGoals } from '../types';
import { playSound } from '../utils/audio';

interface ExportModalProps {
  weekDays: DayRecord[];
  userGoals: UserGoals;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ weekDays, userGoals, onClose }) => {
  const [copied, setCopied] = useState(false);

  const totalCalories = weekDays.reduce((sum, d) => sum + d.calories, 0);
  const avgCalories = Math.round(totalCalories / weekDays.length);
  const weeklyTarget = userGoals.dailyCalorieTarget * 7;
  const weeklyDeficit = totalCalories - weeklyTarget;
  const totalWaterL = (weekDays.reduce((sum, d) => sum + d.waterMl, 0) / 1000).toFixed(1);

  const slipText = `================================================
HOROLOGE JOURNAL - CHRONO-NUTRITION
OBSERVATIONAL AUDIT SLIP #094-WK42
================================================
Period: Oct 18 — Oct 24
Target Daily Energy: ${userGoals.dailyCalorieTarget} kcal
Actual Daily Average: ${avgCalories} kcal
Weekly Deficit/Surplus: ${weeklyDeficit} kcal
Total Hydration: ${totalWaterL} Liters (Avg: ${(Number(totalWaterL) / 7).toFixed(1)}L/day)

DIETITIAN OBSERVATION:
“Calorie adherence is steady. Hydration peaked on Tuesday. Optimal protein intake reached on 5 of 7 days.”

AUDIT SUMMARY:
- Mon: ${weekDays[0]?.calories} kcal | ${weekDays[0]?.waterMl / 1000}L
- Tue: ${weekDays[1]?.calories} kcal | ${weekDays[1]?.waterMl / 1000}L
- Wed: ${weekDays[2]?.calories} kcal | ${weekDays[2]?.waterMl / 1000}L
- Thu: ${weekDays[3]?.calories} kcal | ${weekDays[3]?.waterMl / 1000}L (Logged)
- Fri: ${weekDays[4]?.calories} kcal | ${weekDays[4]?.waterMl / 1000}L
- Sat: ${weekDays[5]?.calories} kcal | ${weekDays[5]?.waterMl / 1000}L
- Sun: ${weekDays[6]?.calories} kcal | ${weekDays[6]?.waterMl / 1000}L

Algorithmic Horologe Stamp: [VERIFIED 96% QUOTA]
================================================`;

  const handleCopy = () => {
    playSound('clack');
    navigator.clipboard.writeText(slipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    playSound('stamp');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#201b17] border-2 border-[#524439] rounded-2xl p-5 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#524439]/40 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffb77b] text-base">receipt_long</span>
            <span className="text-xs text-[#ffb77b] uppercase font-bold tracking-wider">
              Dietitian Audit Slip
            </span>
          </div>
          <button
            onClick={() => {
              playSound('tick');
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-[#2f2925] border border-[#524439] flex items-center justify-center text-[#d8c3b4] hover:text-[#ffb77b]"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Vintage Parchment Slip Body */}
        <div className="p-3.5 bg-[#120d0a] border border-[#524439]/60 rounded-xl font-mono text-[11px] text-[#ebe0db] space-y-2 select-text shadow-inner">
          <div className="text-center border-b border-dashed border-[#524439] pb-2">
            <div className="font-bold text-[#ffb77b] text-xs">HOROLOGE JOURNAL</div>
            <div className="text-[9px] text-[#a08d80]">PHYSICAL METRICS AUDIT RECORD</div>
            <div className="text-[9px] text-[#abcebe] mt-0.5">SLIP #094-WK42 • OCT 18-24</div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#a08d80]">Weekly Average:</span>
              <span className="text-[#ffb77b] font-bold">{avgCalories} kcal / day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08d80]">Target Ceiling:</span>
              <span>{userGoals.dailyCalorieTarget} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08d80]">Weekly Total Deficit:</span>
              <span className="text-[#abcebe] font-bold">{weeklyDeficit} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08d80]">Hydration Volume:</span>
              <span className="text-[#8fd1e1] font-bold">{totalWaterL} Liters</span>
            </div>
          </div>

          <div className="p-2 bg-[#201b17] rounded border border-[#524439]/40 italic text-[11px] text-[#ffdcc2]">
            “Calorie adherence is steady. Hydration peaked on Tuesday. Optimal protein intake reached on 5 of 7 days.”
          </div>

          <div className="pt-1 border-t border-dashed border-[#524439] flex items-center justify-between text-[9px] text-[#a08d80]">
            <span>STAMP: ALGORITHMIC AUDIT</span>
            <span className="text-[#abcebe]">CONFIRMED ✓</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 rounded-xl bg-[#2f2925] border border-[#524439] text-[#ffdcc2] hover:text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 rounded-xl bg-[#c8803f] hover:bg-[#ffb77b] text-[#432100] text-xs font-bold active:scale-95 shadow flex items-center justify-center gap-1 font-label"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print Slip
          </button>
        </div>
      </div>
    </div>
  );
};
