import React, { useState } from 'react';
import { DayRecord, UserGoals } from '../types';
import { playSound } from '../utils/audio';

interface AnalyticsScreenProps {
  weekDays: DayRecord[];
  userGoals: UserGoals;
  onExportSlip: () => void;
  onOpenSettings: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  weekDays,
  userGoals,
  onExportSlip,
  onOpenSettings,
}) => {
  const [activeCycle, setActiveCycle] = useState<number>(42);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(3); // Default Thu

  // Cycle range label
  const cycleLabels = [
    'Oct 04 — Oct 10',
    'Oct 11 — Oct 17',
    'Oct 18 — Oct 24',
    'Oct 25 — Oct 31',
  ];
  const currentLabelIndex = Math.min(cycleLabels.length - 1, Math.max(0, activeCycle - 40));

  // Calculate weekly metrics
  const totalCalories = weekDays.reduce((sum, d) => sum + d.calories, 0);
  const avgCalories = Math.round(totalCalories / weekDays.length);
  const weeklyTarget = userGoals.dailyCalorieTarget * 7;
  const weeklyDeficit = totalCalories - weeklyTarget; // e.g. -420 kcal

  const totalWaterMl = weekDays.reduce((sum, d) => sum + d.waterMl, 0);
  const avgWaterL = (totalWaterMl / weekDays.length / 1000).toFixed(1);
  const totalWaterL = (totalWaterMl / 1000).toFixed(1);
  const waterTargetL = ((userGoals.dailyWaterTargetMl * 7) / 1000).toFixed(1);
  const waterQuotaPercent = Math.min(100, Math.round((totalWaterMl / (userGoals.dailyWaterTargetMl * 7)) * 100));

  // Speedometer needle angles
  // 0 kcal = -90 deg, 2000 kcal = 66 deg, 2500 kcal = 90 deg
  const needleAngle = Math.min(85, Math.max(-85, -85 + (avgCalories / 2500) * 170));
  const targetNeedleAngle = Math.min(85, Math.max(-85, -85 + (userGoals.dailyCalorieTarget / 2500) * 170));

  return (
    <div className="w-full max-w-md mx-auto min-h-screen relative flex flex-col pb-28 text-[#ebe0db] bg-[#17120f]">
      {/* TOP APP BAR */}
      <header className="sticky top-0 z-40 bg-[#120d0a]/95 backdrop-blur-md shadow-md flex justify-between items-center px-4 h-14 border-b border-[#524439]/40">
        <button
          onClick={() => playSound('tick')}
          className="text-[#ffb77b] hover:text-[#ffdcc2] transition-colors p-1"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined text-xl">menu_book</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="font-headline-md text-lg tracking-tight text-[#ffb77b] leading-none">
            Horologe Journal
          </span>
          <span className="text-[9px] font-mono text-[#a08d80] tracking-widest mt-0.5 uppercase">
            CHRONO-NUTRITION
          </span>
        </div>
        <button
          onClick={() => {
            playSound('clack');
            onOpenSettings();
          }}
          className="text-[#ffb77b] hover:text-[#ffdcc2] transition-colors p-1"
          aria-label="Settings & Calibration"
        >
          <span className="material-symbols-outlined text-xl">calendar_today</span>
        </button>
      </header>

      {/* MAIN CANVAS */}
      <main className="w-full px-4 pt-3 flex flex-col gap-4">
        {/* SUB-HEADER: TITLE & VINTAGE BRASS WEEK SELECTOR LEVER */}
        <section className="flex flex-col gap-2">
          <div>
            <h1 className="font-headline-lg text-2xl text-[#ffb77b] tracking-tight leading-tight">
              Weekly Ledger &amp; Analytics
            </h1>
            <p className="text-xs text-[#a08d80] mt-0.5">
              Observational cycle No. {activeCycle} • Physical metrics record
            </p>
          </div>

          {/* Tactile Week Stepped Slider Assembly */}
          <div className="bg-[#120d0a] p-2 rounded-xl border border-[#524439]/40 shadow-inner debossed-well flex items-center justify-between">
            {/* Decrement Lever Knob */}
            <button
              onClick={() => {
                playSound('switch');
                setActiveCycle((prev) => Math.max(40, prev - 1));
              }}
              disabled={activeCycle <= 40}
              aria-label="Previous Week"
              className="w-8 h-8 rounded-full brass-bezel bg-gradient-to-b from-[#c8803f] to-[#4d2700] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[#ffb77b] text-sm font-bold">arrow_back_ios_new</span>
            </button>

            {/* Center Chamber Dial */}
            <div className="flex flex-col items-center px-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ffb77b] text-xs">tune</span>
                <span className="text-xs text-[#ffb77b] tracking-wider font-semibold font-label">
                  {cycleLabels[currentLabelIndex]}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#abcebe]"></span>
              </div>
              {/* Stepped Notch Bar */}
              <div className="flex items-center gap-1 mt-1">
                {[40, 41, 42, 43].map((cycleNum) => (
                  <div
                    key={cycleNum}
                    className={`h-1 rounded-full transition-all ${
                      cycleNum === activeCycle ? 'w-6 bg-[#ffb77b] shadow-sm' : 'w-4 bg-[#524439]/40'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Increment Lever Knob */}
            <button
              onClick={() => {
                playSound('switch');
                setActiveCycle((prev) => Math.min(43, prev + 1));
              }}
              disabled={activeCycle >= 43}
              aria-label="Next Week"
              className="w-8 h-8 rounded-full brass-bezel bg-gradient-to-b from-[#c8803f] to-[#4d2700] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[#ffb77b] text-sm font-bold">arrow_forward_ios</span>
            </button>
          </div>
        </section>

        {/* SECTION 1: CALORIE DEFICIT / SPEEDOMETER DIAL */}
        <section className="bg-[#241f1b] rounded-2xl p-4 brass-bezel relative overflow-hidden">
          {/* Decorative Brass Corner Rivets */}
          <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full knurled-rim border border-[#ffb77b]/40 shadow"></div>
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full knurled-rim border border-[#ffb77b]/40 shadow"></div>
          <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full knurled-rim border border-[#ffb77b]/40 shadow"></div>
          <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full knurled-rim border border-[#ffb77b]/40 shadow"></div>

          <div className="text-center mb-1">
            <span className="text-[9px] font-mono text-[#a08d80] tracking-widest uppercase">
              Chronometer Gauge
            </span>
            <h2 className="font-headline-sm text-base text-[#ebe0db]">Weekly Calorie Deficit &amp; Target</h2>
          </div>

          {/* Analog Gauge Instrument Face */}
          <div className="relative w-64 h-36 mx-auto mt-2 flex items-center justify-center">
            {/* SVG Arc Dial */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 115">
              {/* Outer knurled track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#2f2925"
                strokeLinecap="round"
                strokeWidth="14"
              />
              {/* Inset Deficit Range */}
              <path
                d="M 20 100 A 80 80 0 0 1 148 38"
                fill="none"
                stroke="#524439"
                strokeLinecap="round"
                strokeWidth="8"
              />
              {/* Active Calorie Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 142 42"
                fill="none"
                stroke="#c8803f"
                strokeLinecap="round"
                strokeWidth="6"
              />
              {/* Engraved Major Tick Marks */}
              <line stroke="#ffb77b" strokeWidth="2" x1="20" x2="30" y1="100" y2="100" />
              <line stroke="#a08d80" strokeWidth="1.5" x1="42" x2="50" y1="52" y2="58" />
              <line stroke="#abcebe" strokeWidth="2.5" x1="150" x2="142" y1="42" y2="48" />
              <line stroke="#ffb4ab" strokeWidth="2" x1="180" x2="170" y1="100" y2="100" />
              {/* Target Calibration Flag at 2000 kcal */}
              <circle cx="147" cy="45" fill="#abcebe" r="3" stroke="#15362a" strokeWidth="1" />

              {/* Speedometer Needle (Active Calorie Avg) */}
              <g
                style={{
                  transformOrigin: '100px 100px',
                  transform: `rotate(${needleAngle}deg)`,
                  transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <polygon
                  fill="#ffb77b"
                  points="98.5,100 100,28 101.5,100"
                  className="filter drop-shadow-[2px_3px_3px_rgba(0,0,0,0.7)]"
                />
                <polygon fill="#ffdcc2" points="99,35 100,24 101,35" />
              </g>

              {/* Twin Target Needle Ghost */}
              <g
                style={{
                  transformOrigin: '100px 100px',
                  transform: `rotate(${targetNeedleAngle}deg)`,
                }}
              >
                <line
                  stroke="#abcebe"
                  strokeDasharray="2,2"
                  strokeWidth="1.5"
                  x1="100"
                  x2="100"
                  y1="100"
                  y2="28"
                />
              </g>

              {/* Center Machined Brass Hub / Bezel Cap */}
              <circle cx="100" cy="100" fill="#3a3430" r="14" stroke="#c8803f" strokeWidth="2" />
              <circle cx="100" cy="100" fill="#201b17" r="9" stroke="#ffdcc2" strokeWidth="0.5" />
              <circle cx="100" cy="100" fill="#c8803f" r="4" />
            </svg>

            {/* Speedometer Numerical Readout Inset Glass Box */}
            <div className="absolute -bottom-2 bg-[#120d0a]/90 px-4 py-1 rounded border border-[#524439]/60 debossed-well text-center">
              <div className="font-headline-md text-2xl font-normal text-[#ffb77b] tracking-tight leading-none">
                {avgCalories.toLocaleString()}
              </div>
              <span className="text-[9px] font-mono text-[#a08d80] tracking-wider">KCAL / DAY AVG</span>
            </div>
          </div>

          {/* Meter Sub-indicators & Target Summary */}
          <div className="grid grid-cols-2 gap-2 mt-6 pt-3 border-t border-[#524439]/30">
            <div className="flex items-center gap-2 p-1.5 rounded bg-[#201b17]/70 border border-[#524439]/20">
              <div className="w-3 h-3 rounded-full bg-[#abcebe] border border-[#15362a]"></div>
              <div>
                <span className="text-[9px] font-mono text-[#a08d80] block">TARGET CEILING</span>
                <span className="text-xs text-[#ebe0db] font-semibold">
                  {userGoals.dailyCalorieTarget.toLocaleString()} kcal
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-[#201b17]/70 border border-[#524439]/20">
              <div className="w-3 h-3 rounded-full bg-[#ffb77b] border border-[#4d2700]"></div>
              <div>
                <span className="text-[9px] font-mono text-[#a08d80] block">WEEKLY TOTAL</span>
                <span className="text-xs text-[#ffb77b] font-semibold">
                  {weeklyDeficit <= 0 ? `${weeklyDeficit} kcal Deficit` : `+${weeklyDeficit} kcal Surplus`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: MILLIMETER GRAPH PAPER BAR CHART */}
        <section className="relative bg-[#201b17] rounded-2xl p-4 border border-[#524439]/50 shadow-2xl">
          {/* Vintage Brass Clipboard Clip at Top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 rounded-t-md brass-bezel bg-gradient-to-b from-[#c8803f] to-[#3a3430] flex items-center justify-center z-20 shadow-md">
            <div className="w-16 h-1 rounded-full bg-[#120d0a] debossed-well"></div>
          </div>

          {/* Graph Sheet Header */}
          <div className="flex items-center justify-between mb-3 pt-2">
            <div>
              <span className="text-[9px] font-mono text-[#a08d80] tracking-widest uppercase">
                Ledger Complication
              </span>
              <h3 className="font-headline-sm text-base text-[#ffb77b]">Daily Volumetric Energy</h3>
            </div>
            <div className="flex items-center gap-1 bg-[#120d0a] px-2 py-0.5 rounded border border-[#524439]/30">
              <span className="material-symbols-outlined text-[#abcebe] text-xs">straighten</span>
              <span className="text-[9px] font-mono text-[#abcebe]">Grid: 1mm = 20 kcal</span>
            </div>
          </div>

          {/* Graph Paper Inner Board with Engraved 2,000 kcal Brass Goal Wire */}
          <div className="graph-paper rounded-xl p-3 border border-[#524439]/30 relative debossed-well overflow-hidden">
            {/* Engraved Horizontal Brass Ruler Line for 2,000 kcal Goal */}
            <div className="absolute left-0 right-0 top-[35%] z-10 flex items-center pointer-events-none">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#ffdcc2] to-transparent opacity-80"></div>
              <span className="absolute right-2 -top-2.5 text-[8px] font-mono text-[#ffdcc2] bg-[#120d0a]/90 px-1 rounded border border-[#c8803f]/40">
                2,000 kcal Goal
              </span>
            </div>

            {/* Y-Axis Secondary Guidance Ticks */}
            <div className="absolute left-1 top-2 bottom-12 flex flex-col justify-between text-[8px] font-mono text-[#a08d80]/50 pointer-events-none">
              <span>2400</span>
              <span>2000</span>
              <span>1600</span>
              <span>1200</span>
            </div>

            {/* 7 Vitreous Liquid Column Tubes */}
            <div className="grid grid-cols-7 gap-1.5 h-48 items-end pt-4 pb-2 px-3">
              {weekDays.map((day, idx) => {
                const heightPercent = Math.min(100, Math.round((day.calories / 2500) * 100));
                const isSelected = selectedDayIndex === idx;

                return (
                  <div
                    key={day.dayOfWeek}
                    onClick={() => {
                      playSound('tick');
                      setSelectedDayIndex(idx);
                    }}
                    className={`flex flex-col items-center h-full justify-end group cursor-pointer ${
                      isSelected ? 'scale-105' : ''
                    } transition-transform`}
                  >
                    <span
                      className={`text-[8px] font-mono mb-1 ${
                        day.isToday ? 'text-[#ffb77b] font-bold animate-pulse' : 'text-[#d8c3b4] group-hover:text-[#ffb77b]'
                      }`}
                    >
                      {day.calories.toLocaleString()}
                      {day.isToday ? '*' : ''}
                    </span>

                    <div
                      className={`w-full h-32 bg-[#3a3430]/60 rounded-full vitreous-tube p-0.5 relative flex flex-col justify-end ${
                        day.isToday ? 'ring-1 ring-[#ffb77b]/50' : ''
                      }`}
                    >
                      {/* Glass Refraction Streak Overlay */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>

                      {/* Amber Liquid Column */}
                      <div
                        className="w-full rounded-full amber-liquid relative overflow-hidden transition-all duration-500"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-full ${
                            day.isToday ? 'bg-[#ffdcc2] animate-pulse' : ''
                          }`}
                        ></div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] mt-1.5 font-bold ${
                        day.isToday ? 'text-[#ffb77b]' : 'text-[#d8c3b4]'
                      }`}
                    >
                      {day.dayOfWeek}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend Notes */}
          <div className="flex items-center justify-between text-[#a08d80] mt-2 px-1">
            <span className="text-[10px] italic">*Thursday entry recording active</span>
            <span className="text-[10px] text-[#ffdcc2] font-mono">Engineered Glass Column Array</span>
          </div>
        </section>

        {/* SECTION 3: AQUAMARINE APOTHECARY - HYDRATION CONSISTENCY STAMPS */}
        <section className="bg-[#241f1b] rounded-2xl p-4 brass-bezel">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[9px] font-mono text-[#a08d80] tracking-widest uppercase">
                Aquamarine Apothecary
              </span>
              <h3 className="font-headline-sm text-base text-[#8fd1e1]">Hydration Consistency Stamps</h3>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#599aaa]/30 border border-[#8fd1e1]/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#8fd1e1] text-base">water_drop</span>
            </div>
          </div>

          {/* 7 Circular Wax Seal / Stamped Medals */}
          <div className="grid grid-cols-7 gap-1.5 py-1">
            {weekDays.map((day) => {
              const liters = (day.waterMl / 1000).toFixed(1);
              const metGoal = day.waterMl >= day.targetWaterMl;

              return (
                <div key={day.dayOfWeek} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex flex-col items-center justify-center border transition-all ${
                      day.isToday
                        ? 'debossed-well bg-[#120d0a] border-dashed border-[#8fd1e1]/70'
                        : metGoal
                        ? 'wax-seal bg-gradient-to-br from-[#599aaa] to-[#00363f] border-[#8fd1e1]/60'
                        : 'wax-seal bg-gradient-to-br from-[#3a3430] to-[#120d0a] border-[#a08d80]/40'
                    }`}
                  >
                    {day.isToday ? (
                      <span className="material-symbols-outlined text-[#8fd1e1] text-xs leading-none animate-spin">
                        hourglass_top
                      </span>
                    ) : metGoal ? (
                      <span className="material-symbols-outlined text-[#abedfe] text-xs font-bold leading-none">
                        check
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[#a08d80] text-xs leading-none">remove</span>
                    )}
                    <span
                      className={`text-[8px] font-mono leading-none mt-0.5 ${
                        day.isToday ? 'text-[#8fd1e1] font-bold' : metGoal ? 'text-[#abedfe]' : 'text-[#a08d80]'
                      }`}
                    >
                      {liters}L
                    </span>
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      day.isToday ? 'text-[#8fd1e1] font-bold' : 'text-[#d8c3b4]'
                    }`}
                  >
                    {day.dayOfWeek}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stat Card */}
          <div className="mt-3 p-3 rounded-xl bg-[#120d0a] border border-[#524439]/40 flex items-center justify-between debossed-well">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#2f2925] border border-[#8fd1e1]/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8fd1e1] text-xl">fluid_med</span>
              </div>
              <div>
                <span className="text-[10px] text-[#a08d80] block">Weekly Water Intake</span>
                <span className="font-headline-sm text-base text-[#8fd1e1] font-semibold">{totalWaterL} Liters</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#abcebe]">{waterQuotaPercent}% of target</span>
              <span className="text-[10px] text-[#a08d80] block">Avg {avgWaterL}L / day</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: TRI-PARTITE BALANCE - WEEKLY MACRO COMPOSITION */}
        <section className="bg-[#201b17] rounded-2xl p-4 border border-[#524439]/40 shadow-xl relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[9px] font-mono text-[#a08d80] tracking-widest uppercase">
                Tri-Partite Balance
              </span>
              <h3 className="font-headline-sm text-base text-[#ebe0db]">Weekly Macro Composition</h3>
            </div>
            <span className="material-symbols-outlined text-[#ffb77b] text-lg">pie_chart</span>
          </div>

          <div className="flex items-center justify-around gap-4 py-1">
            {/* 3D Segmented Dial Instrument */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Outer Pewter Beveled Ring */}
                <circle cx="50" cy="50" fill="none" r="44" stroke="#241f1b" strokeWidth="12" />
                {/* Segment 1: Carbs 45% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="#c8803f"
                  strokeDasharray="113 138"
                  strokeDashoffset="0"
                  strokeWidth="9"
                />
                {/* Segment 2: Protein 30% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="#abcebe"
                  strokeDasharray="75.3 175.9"
                  strokeDashoffset="-113"
                  strokeWidth="9"
                />
                {/* Segment 3: Fat 25% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="#8fd1e1"
                  strokeDasharray="62.8 188.4"
                  strokeDashoffset="-188.3"
                  strokeWidth="9"
                />
                {/* Ceramic Inset Center Hub */}
                <circle cx="50" cy="50" fill="#17120f" r="28" stroke="#524439" strokeWidth="1" />
              </svg>

              {/* Center Machined Medallion */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[#ffb77b] text-base">balance</span>
                <span className="text-[9px] font-mono text-[#a08d80] mt-0.5">RATIO</span>
              </div>
            </div>

            {/* Granular Legend Slates */}
            <div className="flex flex-col gap-2 flex-1">
              {/* Carbs */}
              <div className="p-2 rounded bg-[#241f1b] border border-[#524439]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c8803f] border border-[#ffb77b]"></span>
                  <span className="text-xs text-[#ebe0db]">Carbohydrates</span>
                </div>
                <span className="text-xs text-[#ffb77b] font-bold">45%</span>
              </div>
              {/* Protein */}
              <div className="p-2 rounded bg-[#241f1b] border border-[#524439]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#abcebe] border border-[#15362a]"></span>
                  <span className="text-xs text-[#ebe0db]">Proteins</span>
                </div>
                <span className="text-xs text-[#abcebe] font-bold">30%</span>
              </div>
              {/* Fat */}
              <div className="p-2 rounded bg-[#241f1b] border border-[#524439]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8fd1e1] border border-[#00363f]"></span>
                  <span className="text-xs text-[#ebe0db]">Lipids &amp; Fats</span>
                </div>
                <span className="text-xs text-[#8fd1e1] font-bold">25%</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: EXPORT & INSIGHT CARD (TEAR-OFF PERFORATION RECEIPT SLIP) */}
        <section className="relative bg-[#201b17] rounded-t-xl pb-4 border-t border-l border-r border-[#524439]/50 shadow-2xl">
          <div className="stitched-border m-2.5 p-3.5 rounded-lg bg-[#120d0a] debossed-well">
            <div className="flex items-center justify-between border-b border-[#524439]/30 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ffb77b] text-base">receipt_long</span>
                <span className="text-xs text-[#ffb77b] tracking-widest uppercase font-bold font-label">
                  Dietitian Insight Leaf
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#a08d80]">SLIP #094-WK{activeCycle}</span>
            </div>
            <p className="font-headline-sm text-sm text-[#ebe0db] italic leading-snug">
              “Calorie adherence is steady. Hydration peaked on Tuesday. Optimal protein intake reached on 5 of 7
              days.”
            </p>
            {/* Signature stamp line */}
            <div className="mt-3 pt-2 border-t border-dashed border-[#524439]/40 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#a08d80]">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span className="text-[10px]">Algorithmic Horologe Audit</span>
              </div>
              {/* Action Actuator: Export Ledger Leaf */}
              <button
                onClick={() => {
                  playSound('stamp');
                  onExportSlip();
                }}
                className="brass-bezel bg-gradient-to-r from-[#c8803f] to-[#3a3430] text-[#ffdcc2] hover:text-white px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 active:translate-y-0.5 transition-transform"
              >
                <span className="material-symbols-outlined text-xs">file_download</span>
                Export Slip
              </button>
            </div>
          </div>

          {/* Tear-off perforation tooth effect at bottom edge */}
          <div className="w-full flex justify-between px-2 overflow-hidden -mb-2">
            {[...Array(9)].map((_, i) => (
              <span
                key={i}
                className="inline-block w-2.5 h-2.5 rounded-full bg-[#17120f] border border-[#524439]/40 -mt-1.5"
              ></span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
