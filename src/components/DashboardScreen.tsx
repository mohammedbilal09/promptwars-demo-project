import React, { useState, useEffect } from 'react';
import { MealSpecimen, UserGoals } from '../types';
import { playSound } from '../utils/audio';

interface DashboardScreenProps {
  receipts: MealSpecimen[];
  hydrationMl: number;
  onAddWater: (amount: number) => void;
  onResetWater: () => void;
  userGoals: UserGoals;
  onOpenSettings: () => void;
  onSelectReceipt: (meal: MealSpecimen) => void;
  onNavigateToCapture: () => void;
  onNavigateToLedger: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  receipts,
  hydrationMl,
  onAddWater,
  onResetWater,
  userGoals,
  onOpenSettings,
  onSelectReceipt,
  onNavigateToCapture,
  onNavigateToLedger,
}) => {
  // Live GMT time display for the chrono-calculator
  const [currentTimeGmt, setCurrentTimeGmt] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      setCurrentTimeGmt(`${hours}:${minutes} GMT`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute live sums from today's receipts
  const totalCalories = receipts.reduce((sum, r) => sum + r.calories, 0);
  const totalProtein = receipts.reduce((sum, r) => sum + r.proteinGrams, 0);
  const totalCarbs = receipts.reduce((sum, r) => sum + r.carbsGrams, 0);
  const totalFat = receipts.reduce((sum, r) => sum + r.fatGrams, 0);

  const calorieRemaining = Math.max(0, userGoals.dailyCalorieTarget - totalCalories);
  const caloriePercent = Math.min(100, Math.round((totalCalories / userGoals.dailyCalorieTarget) * 100));

  // Hydration calculation
  const waterPercent = Math.min(100, Math.round((hydrationMl / userGoals.dailyWaterTargetMl) * 100));

  // Master dial SVG arc values (circumference ~264)
  const masterArcLength = Math.min(264, Math.round((caloriePercent / 100) * 264));

  // Sub-dial percentages
  const proteinPercent = Math.min(100, Math.round((totalProtein / userGoals.proteinTargetGrams) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / userGoals.carbsTargetGrams) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / userGoals.fatTargetGrams) * 100));

  return (
    <div className="w-full max-w-md mx-auto min-h-screen relative flex flex-col pb-28">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#120d0a]/95 backdrop-blur-md shadow-md flex justify-between items-center px-4 h-14 border-b border-[#524439]/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSound('tick');
              onNavigateToLedger();
            }}
            aria-label="Menu Journal"
            className="text-[#ffb77b] hover:text-[#ffdcc2] transition-colors active:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </button>
          <span className="font-headline-md text-xl tracking-tight text-[#ffb77b]">Horologe Journal</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mechanical Date Flip Counter & Calendar */}
          <div className="flex items-center bg-[#201b17] px-2 py-1 rounded-lg inset-well border border-[#524439]/30">
            <span className="text-[10px] font-bold text-[#ffb77b] uppercase tracking-wider mr-1.5 font-label">
              Thu, Oct 24
            </span>
            <button
              onClick={() => {
                playSound('tick');
                onNavigateToLedger();
              }}
              aria-label="Calendar"
              className="text-[#d8c3b4] hover:text-[#ffb77b] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">calendar_today</span>
            </button>
          </div>
          {/* Settings Screw Dial */}
          <button
            onClick={() => {
              playSound('clack');
              onOpenSettings();
            }}
            aria-label="Settings"
            className="w-7 h-7 rounded-full bg-[#2f2925] border border-[#a08d80] flex items-center justify-center raised-bezel active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-xs text-[#ffb77b]">settings</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 pt-3 space-y-4">
        {/* Status Header Tag & Chrono Sub-Bar */}
        <section className="flex items-center justify-between border-b border-[#524439]/30 pb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ffb77b] animate-pulse"></span>
            <h1 className="font-headline-sm text-lg text-[#ebe0db] font-semibold">Daily Balance</h1>
          </div>
          <div className="flex items-center bg-[#120d0a] px-2.5 py-1 rounded inset-well border border-[#524439]/40">
            <span className="text-[9px] font-mono text-[#a08d80] uppercase">CHRONO-CALC:</span>
            <span className="text-[10px] font-mono text-[#ffb77b] ml-1 font-bold">{currentTimeGmt || '18:42 GMT'}</span>
          </div>
        </section>

        {/* Calorie Gauge Section (Skeuomorphic Master Watch Complication) */}
        <section className="relative bg-[#201b17] rounded-xl p-4 border border-[#524439]/40 raised-bezel overflow-hidden">
          {/* Stitched decorative rim */}
          <div className="absolute inset-1.5 stitched-border pointer-events-none rounded-lg"></div>

          <div className="flex flex-col items-center justify-center pt-1">
            {/* Master Chronometer Bezel */}
            <div className="relative w-56 h-56 rounded-full p-2.5 brass-knurl shadow-2xl flex items-center justify-center">
              {/* Recessed Inner Dial */}
              <div className="relative w-full h-full rounded-full bg-[#120d0a] inset-well flex flex-col items-center justify-center p-4 overflow-hidden border border-[#524439]/50">
                {/* Segmented Radial Scale Track */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  {/* Base Track */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="42"
                    stroke="#241f1b"
                    strokeDasharray="3, 1.5"
                    strokeWidth="7"
                  />
                  {/* Consumed Calorie Arc */}
                  <circle
                    className="filter drop-shadow-[0_0_4px_rgba(255,183,123,0.6)] transition-all duration-700 ease-out"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="42"
                    stroke="#c8803f"
                    strokeDasharray={`${masterArcLength} 264`}
                    strokeLinecap="round"
                    strokeWidth="7"
                  />
                </svg>

                {/* Central Physical Tally & Needle Hub */}
                <div className="z-10 flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#a08d80] font-label font-bold">
                    Energy Intake
                  </span>
                  {/* Mechanical Drum Roll Style Value */}
                  <div className="my-1 bg-[#120d0a] px-3 py-0.5 rounded inset-well border border-[#524439]/60">
                    <span className="text-3xl font-normal text-[#ffb77b] tracking-tight font-headline-md leading-none">
                      {totalCalories.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#d8c3b4] font-bold">
                      / {userGoals.dailyCalorieTarget.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#a08d80] font-bold">KCAL</span>
                  </div>
                  {/* Remaining Marker Pill */}
                  <div className="mt-2 bg-[#ffb77b]/10 border border-[#ffb77b]/30 px-2.5 py-0.5 rounded-full">
                    <span className="text-[10px] text-[#ffdcc2] font-semibold">
                      {calorieRemaining.toLocaleString()} kcal remaining
                    </span>
                  </div>
                </div>

                {/* Watchmaker Jewel Pivot screw */}
                <div className="absolute w-3 h-3 rounded-full bg-[#2f2925] border border-[#ffb77b]/50 shadow-inner flex items-center justify-center pointer-events-none bottom-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8803f]"></div>
                </div>
              </div>
            </div>

            {/* Sub-Dials: Protein, Carbs, Fat (Three Mini Mechanical Complications) */}
            <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#524439]/30">
              {/* Sub-Dial 1: Protein */}
              <div className="flex flex-col items-center bg-[#241f1b] rounded-lg p-2 inset-well border border-[#524439]/30">
                <span className="text-[10px] text-[#abcebe] uppercase font-bold tracking-wider">Protein</span>
                <div className="relative w-14 h-14 my-1 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#3a3430]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#abcebe] transition-all duration-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${proteinPercent}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-[#ebe0db] font-bold">{totalProtein}g</span>
                  </div>
                </div>
                <span className="text-[9px] text-[#a08d80]">Target {userGoals.proteinTargetGrams}g</span>
              </div>

              {/* Sub-Dial 2: Carbs */}
              <div className="flex flex-col items-center bg-[#241f1b] rounded-lg p-2 inset-well border border-[#524439]/30">
                <span className="text-[10px] text-[#ffb77b] uppercase font-bold tracking-wider">Carbs</span>
                <div className="relative w-14 h-14 my-1 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#3a3430]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#c8803f] transition-all duration-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${carbsPercent}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-[#ebe0db] font-bold">{totalCarbs}g</span>
                  </div>
                </div>
                <span className="text-[9px] text-[#a08d80]">Target {userGoals.carbsTargetGrams}g</span>
              </div>

              {/* Sub-Dial 3: Fat */}
              <div className="flex flex-col items-center bg-[#241f1b] rounded-lg p-2 inset-well border border-[#524439]/30">
                <span className="text-[10px] text-[#8fd1e1] uppercase font-bold tracking-wider">Fat</span>
                <div className="relative w-14 h-14 my-1 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#3a3430]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#599aaa] transition-all duration-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${fatPercent}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-[#ebe0db] font-bold">{totalFat}g</span>
                  </div>
                </div>
                <span className="text-[9px] text-[#a08d80]">Target {userGoals.fatTargetGrams}g</span>
              </div>
            </div>
          </div>
        </section>

        {/* Water Intake Hydration Station (Vitreous Glass Flask & Actuators) */}
        <section className="bg-[#201b17] rounded-xl p-4 border border-[#524439]/40 raised-bezel relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[#8fd1e1]">opacity</span>
              <h2 className="font-headline-sm text-base text-[#ebe0db] font-semibold">Hydration Reservoir</h2>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-[#8fd1e1]">{hydrationMl.toLocaleString()} ml</span>
              <span className="text-[10px] text-[#a08d80]">/ {userGoals.dailyWaterTargetMl.toLocaleString()} ml</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Apothecary Fluid Column Flask */}
            <div className="col-span-5 flex flex-col items-center">
              <div className="w-full h-44 rounded-full bg-[#120d0a] border-2 border-[#524439]/60 relative vial-glass overflow-hidden flex flex-col justify-end p-1">
                {/* Etched Glass Graduations (Ticks) */}
                <div className="absolute inset-y-2 left-2 flex flex-col justify-between text-[#a08d80] z-20 pointer-events-none font-mono text-[8px] opacity-70">
                  <span className="border-b border-[#a08d80]/50 pr-1">2500</span>
                  <span className="border-b border-[#a08d80]/50 pr-1">2000</span>
                  <span className="border-b border-[#a08d80]/50 pr-1">1500</span>
                  <span className="border-b border-[#a08d80]/50 pr-1">1000</span>
                  <span className="border-b border-[#a08d80]/50 pr-1">500</span>
                </div>
                {/* Specular Glass Highlight Glint */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-30"></div>
                {/* Fluid Column with dynamic height */}
                <div
                  className="w-full rounded-b-full bg-gradient-to-t from-[#00363f] via-[#599aaa] to-[#8fd1e1] relative z-10 shadow-[inset_0_2px_4px_rgba(180,240,255,0.7)] transition-all duration-500"
                  style={{ height: `${Math.min(100, Math.max(8, waterPercent))}%` }}
                >
                  {/* Liquid Meniscus Oscillating Ring */}
                  <div className="absolute -top-1 left-0 right-0 h-2 bg-[#8fd1e1]/80 rounded-full border-t border-white/50"></div>
                  {/* Micro Bubbles */}
                  <div className="absolute bottom-4 left-3 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"></div>
                  <div className="absolute bottom-10 right-4 w-1 h-1 rounded-full bg-white/50 animate-ping"></div>
                </div>
              </div>
              <span className="mt-1.5 text-[10px] font-bold text-[#8fd1e1] uppercase tracking-wider">
                {waterPercent}% Quota
              </span>
            </div>

            {/* Tactile Mechanical Push Actuators */}
            <div className="col-span-7 flex flex-col justify-between h-44 space-y-2">
              {/* +250ml Glass Tumbler */}
              <button
                onClick={() => {
                  playSound('water');
                  onAddWater(250);
                }}
                className="flex-1 w-full brass-btn rounded-lg border border-[#524439]/60 flex items-center justify-between px-3 text-left transition-all group"
                aria-label="Add 250ml"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#241f1b] flex items-center justify-center inset-well text-[#8fd1e1]">
                    <span className="material-symbols-outlined text-sm">local_bar</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#ebe0db] group-hover:text-[#ffb77b] transition-colors">
                      +250 ml
                    </div>
                    <div className="text-[10px] text-[#a08d80]">Tumbler Dose</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-base text-[#a08d80] group-hover:text-[#8fd1e1] transition-colors">
                  add_circle
                </span>
              </button>

              {/* +500ml Canteen Flask */}
              <button
                onClick={() => {
                  playSound('water');
                  onAddWater(500);
                }}
                className="flex-1 w-full brass-btn rounded-lg border border-[#524439]/60 flex items-center justify-between px-3 text-left transition-all group"
                aria-label="Add 500ml"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#241f1b] flex items-center justify-center inset-well text-[#8fd1e1]">
                    <span className="material-symbols-outlined text-sm">water_bottle</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#ebe0db] group-hover:text-[#ffb77b] transition-colors">
                      +500 ml
                    </div>
                    <div className="text-[10px] text-[#a08d80]">Canteen Flask</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-base text-[#a08d80] group-hover:text-[#8fd1e1] transition-colors">
                  add_circle
                </span>
              </button>

              {/* Reset / Goal Calibration Stud */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    playSound('clack');
                    onResetWater();
                  }}
                  className="flex items-center space-x-1 text-[#a08d80] hover:text-[#ebe0db] text-[10px] font-bold uppercase transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">restart_alt</span>
                  <span>Reset Gauge</span>
                </button>
                <button
                  onClick={() => {
                    playSound('clack');
                    onOpenSettings();
                  }}
                  className="flex items-center space-x-1 text-[#ffb77b] hover:text-[#ffdcc2] text-[10px] font-bold uppercase transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">tune</span>
                  <span>Goal: {(userGoals.dailyWaterTargetMl / 1000).toFixed(1)}L</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Meals Timeline (Parchment Receipts) */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[#ffb77b]">receipt_long</span>
              <h2 className="font-headline-sm text-base text-[#ebe0db] font-semibold">Parchment Receipts</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-[#a08d80]">{receipts.length} Entries Pinned</span>
              <button
                onClick={() => {
                  playSound('switch');
                  onNavigateToCapture();
                }}
                className="px-2 py-0.5 rounded bg-[#2f2925] hover:bg-[#3a3430] border border-[#c8803f]/50 text-[#ffb77b] text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xs">add_a_photo</span>
                Scan
              </button>
            </div>
          </div>

          {receipts.length === 0 ? (
            <div className="p-6 text-center bg-[#201b17] rounded-xl border border-[#524439]/40 text-[#a08d80]">
              <span className="material-symbols-outlined text-3xl mb-1 text-[#c8803f]">hourglass_empty</span>
              <p className="text-sm font-headline-sm italic text-[#d8c3b4]">No nourishment receipts pinned today.</p>
              <button
                onClick={onNavigateToCapture}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#c8803f] text-[#432100] font-bold text-xs shadow hover:bg-[#ffb77b] transition-colors"
              >
                Capture First Meal with Optical Lens
              </button>
            </div>
          ) : (
            receipts.map((receipt) => (
              <article
                key={receipt.id}
                onClick={() => {
                  playSound('tick');
                  onSelectReceipt(receipt);
                }}
                className="relative bg-[#241f1b] hover:bg-[#2a2420] transition-colors rounded-lg p-3.5 border border-[#524439]/60 shadow-md cursor-pointer group"
              >
                {/* Metallic Brass Binder Clip Accent */}
                <div className="absolute -top-2.5 left-6 w-8 h-3 bg-gradient-to-r from-[#c8803f] via-[#ffdcc2] to-[#432100] rounded-sm shadow-sm flex items-center justify-center border border-white/20">
                  <div className="w-4 h-0.5 bg-[#120d0a]"></div>
                </div>

                <div className="flex justify-between items-start mt-1">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase bg-[#3a3430] px-2 py-0.5 rounded text-[#a08d80]">
                        {receipt.time} • {receipt.mealType}
                      </span>
                      {receipt.isAiVerified ? (
                        <span className="inline-flex items-center text-[9px] uppercase px-1.5 py-0.5 rounded border border-[#abcebe]/40 text-[#abcebe] bg-[#abcebe]/10">
                          <span className="material-symbols-outlined text-[10px] mr-0.5">photo_camera</span> AI Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] uppercase px-1.5 py-0.5 rounded border border-[#524439] text-[#a08d80] bg-[#2f2925]">
                          Journaled
                        </span>
                      )}
                      {receipt.waterAddedMl && receipt.waterAddedMl > 0 && (
                        <span className="inline-flex items-center text-[9px] uppercase px-1.5 py-0.5 rounded border border-[#8fd1e1]/40 text-[#8fd1e1] bg-[#8fd1e1]/10">
                          +{receipt.waterAddedMl}ml H2O
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-sm text-base text-[#ffdcc2] group-hover:text-[#ffb77b] transition-colors">
                      {receipt.title}
                    </h3>
                    <p className="text-xs text-[#d8c3b4] line-clamp-1">{receipt.description}</p>
                  </div>

                  <div className="bg-[#120d0a] px-2.5 py-1 rounded inset-well text-right border border-[#524439]/30 shrink-0">
                    <div className="font-headline-md text-xl text-[#ffb77b] font-bold leading-none">
                      {receipt.calories}
                    </div>
                    <div className="text-[9px] text-[#a08d80] font-bold tracking-wider">KCAL</div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#524439]/30 flex items-center justify-between text-[#a08d80] text-[11px]">
                  <span>
                    P: {receipt.proteinGrams}g • C: {receipt.carbsGrams}g • F: {receipt.fatGrams}g
                  </span>
                  <span className="text-[#ffb77b] font-semibold">Score: {receipt.score}</span>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};
