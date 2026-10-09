import React, { useState } from 'react';
import { MealSpecimen } from '../types';
import { playSound } from '../utils/audio';

interface LedgerScreenProps {
  receipts: MealSpecimen[];
  onSelectReceipt: (meal: MealSpecimen) => void;
  onDeleteReceipt: (id: string) => void;
  onNavigateToCapture: () => void;
  onOpenManualEntry: () => void;
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  receipts,
  onSelectReceipt,
  onDeleteReceipt,
  onNavigateToCapture,
  onOpenManualEntry,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Refreshment'];

  const filteredReceipts = receipts.filter((r) => {
    const matchesType = filterType === 'All' || r.mealType === filterType;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCalories = filteredReceipts.reduce((sum, r) => sum + r.calories, 0);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen relative flex flex-col pb-28 text-[#ebe0db] bg-[#17120f]">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#120d0a]/95 backdrop-blur-md shadow-md flex justify-between items-center px-4 h-14 border-b border-[#524439]/40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-[#ffb77b]">auto_stories</span>
          <div>
            <h1 className="font-headline-md text-lg tracking-tight text-[#ffb77b] leading-tight">
              Chrono-Ledger
            </h1>
            <span className="text-[9px] font-mono text-[#a08d80] uppercase tracking-wider block">
              HISTORICAL PARCHMENT LOG
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            playSound('switch');
            onOpenManualEntry();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2f2925] border border-[#ffb77b]/40 text-[#ffb77b] text-xs font-bold active:scale-95 transition-all shadow-inner"
        >
          <span className="material-symbols-outlined text-sm">edit_note</span>
          Journal
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full px-4 pt-3 space-y-3.5">
        {/* Ledger Summary Complication */}
        <section className="bg-[#201b17] rounded-xl p-3.5 border border-[#524439]/40 raised-bezel flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#120d0a] inset-well border border-[#524439]/60 flex items-center justify-center text-[#ffb77b]">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#a08d80] uppercase tracking-wider block">
                PINNED SPECIMENS
              </span>
              <span className="font-headline-sm text-base text-[#ebe0db]">
                {filteredReceipts.length} Recorded Entries
              </span>
            </div>
          </div>
          <div className="text-right bg-[#120d0a] px-3 py-1 rounded inset-well border border-[#524439]/30">
            <span className="font-headline-md text-lg text-[#ffb77b] font-bold block leading-none">
              {totalCalories}
            </span>
            <span className="text-[9px] font-mono text-[#a08d80]">TOTAL KCAL</span>
          </div>
        </section>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#a08d80] text-lg">search</span>
          <input
            type="text"
            placeholder="Search nourishment receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#120d0a] border border-[#524439]/50 rounded-xl text-xs text-[#ebe0db] placeholder-[#a08d80]/60 focus:outline-none focus:border-[#ffb77b] inset-well"
          />
        </div>

        {/* Filter Segmented Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                playSound('tick');
                setFilterType(tab);
              }}
              className={`px-3 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                filterType === tab
                  ? 'bg-[#c8803f] text-[#432100] font-bold shadow'
                  : 'bg-[#241f1b] text-[#d8c3b4] border border-[#524439]/30 hover:border-[#ffb77b]/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List of Parchment Receipts */}
        <div className="space-y-3">
          {filteredReceipts.length === 0 ? (
            <div className="p-8 text-center bg-[#201b17] rounded-xl border border-[#524439]/40 text-[#a08d80]">
              <span className="material-symbols-outlined text-3xl mb-2 text-[#c8803f]">search_off</span>
              <p className="text-sm font-headline-sm italic text-[#d8c3b4]">No entries match your search criteria.</p>
              <button
                onClick={() => {
                  setFilterType('All');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs text-[#ffb77b] underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredReceipts.map((receipt) => (
              <article
                key={receipt.id}
                className="relative bg-[#241f1b] hover:bg-[#2a2420] transition-colors rounded-lg p-3.5 border border-[#524439]/60 shadow-md group"
              >
                {/* Metallic Brass Binder Clip Accent */}
                <div className="absolute -top-2.5 left-6 w-8 h-3 bg-gradient-to-r from-[#c8803f] via-[#ffdcc2] to-[#432100] rounded-sm shadow-sm flex items-center justify-center border border-white/20">
                  <div className="w-4 h-0.5 bg-[#120d0a]"></div>
                </div>

                <div className="flex justify-between items-start mt-1">
                  <div
                    onClick={() => {
                      playSound('tick');
                      onSelectReceipt(receipt);
                    }}
                    className="space-y-1 pr-2 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase bg-[#3a3430] px-2 py-0.5 rounded text-[#a08d80]">
                        {receipt.time} • {receipt.mealType}
                      </span>
                      {receipt.isAiVerified ? (
                        <span className="inline-flex items-center text-[9px] uppercase px-1.5 py-0.5 rounded border border-[#abcebe]/40 text-[#abcebe] bg-[#abcebe]/10">
                          <span className="material-symbols-outlined text-[10px] mr-0.5">photo_camera</span> AI
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] uppercase px-1.5 py-0.5 rounded border border-[#524439] text-[#a08d80] bg-[#2f2925]">
                          Journaled
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-sm text-base text-[#ffdcc2] group-hover:text-[#ffb77b] transition-colors">
                      {receipt.title}
                    </h3>
                    <p className="text-xs text-[#d8c3b4] line-clamp-1">{receipt.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="bg-[#120d0a] px-2.5 py-1 rounded inset-well text-right border border-[#524439]/30">
                      <div className="font-headline-md text-xl text-[#ffb77b] font-bold leading-none">
                        {receipt.calories}
                      </div>
                      <div className="text-[9px] text-[#a08d80] font-bold tracking-wider">KCAL</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSound('clack');
                        if (confirm(`Remove receipt "${receipt.title}"?`)) {
                          onDeleteReceipt(receipt.id);
                        }
                      }}
                      className="text-[#a08d80] hover:text-[#ffb4ab] text-xs p-1"
                      title="Delete receipt"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
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
        </div>
      </main>
    </div>
  );
};
