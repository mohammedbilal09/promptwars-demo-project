import React, { useState } from 'react';
import { MealSpecimen, DayRecord, UserGoals } from './types';
import { INITIAL_USER_GOALS, INITIAL_RECEIPTS, INITIAL_WEEK_DAYS } from './data/mockData';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardScreen } from './components/DashboardScreen';
import { CaptureScreen } from './components/CaptureScreen';
import { LedgerScreen } from './components/LedgerScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { ManualEntryModal } from './components/ManualEntryModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [receipts, setReceipts] = useState<MealSpecimen[]>(INITIAL_RECEIPTS);
  const [hydrationMl, setHydrationMl] = useState<number>(1750);
  const [userGoals, setUserGoals] = useState<UserGoals>(INITIAL_USER_GOALS);
  const [weekDays, setWeekDays] = useState<DayRecord[]>(INITIAL_WEEK_DAYS);

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<MealSpecimen | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showManualEntry, setShowManualEntry] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Add water handler
  const handleAddWater = (amount: number) => {
    setHydrationMl((prev) => {
      const next = prev + amount;
      // Sync to today's record (Thursday) in weekly view
      setWeekDays((prevDays) =>
        prevDays.map((d) => (d.isToday ? { ...d, waterMl: next } : d))
      );
      return next;
    });
  };

  // Reset water handler
  const handleResetWater = () => {
    setHydrationMl(0);
    setWeekDays((prevDays) =>
      prevDays.map((d) => (d.isToday ? { ...d, waterMl: 0 } : d))
    );
  };

  // Add meal from scanner or manual entry
  const handleLogMeal = (newMeal: MealSpecimen) => {
    setReceipts((prev) => {
      const updated = [newMeal, ...prev];
      // Sync today's total calories to week record
      const todayTotalCalories = updated.reduce((sum, r) => sum + r.calories, 0);
      const todayProtein = updated.reduce((sum, r) => sum + r.proteinGrams, 0);
      const todayCarbs = updated.reduce((sum, r) => sum + r.carbsGrams, 0);
      const todayFat = updated.reduce((sum, r) => sum + r.fatGrams, 0);

      setWeekDays((prevDays) =>
        prevDays.map((d) =>
          d.isToday
            ? {
                ...d,
                calories: todayTotalCalories,
                proteinGrams: todayProtein,
                carbsGrams: todayCarbs,
                fatGrams: todayFat,
              }
            : d
        )
      );
      return updated;
    });
  };

  // Delete meal
  const handleDeleteReceipt = (id: string) => {
    setReceipts((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      const todayTotalCalories = updated.reduce((sum, r) => sum + r.calories, 0);
      setWeekDays((prevDays) =>
        prevDays.map((d) =>
          d.isToday ? { ...d, calories: todayTotalCalories } : d
        )
      );
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#17120f] text-[#ebe0db] flex justify-center selection:bg-[#c8803f] selection:text-[#432100]">
      {/* Active Screen View */}
      {activeTab === 'dashboard' && (
        <DashboardScreen
          receipts={receipts}
          hydrationMl={hydrationMl}
          onAddWater={handleAddWater}
          onResetWater={handleResetWater}
          userGoals={userGoals}
          onOpenSettings={() => setShowSettings(true)}
          onSelectReceipt={(meal) => setSelectedReceipt(meal)}
          onNavigateToCapture={() => setActiveTab('capture')}
          onNavigateToLedger={() => setActiveTab('ledger')}
        />
      )}

      {activeTab === 'capture' && (
        <CaptureScreen
          onLogMeal={handleLogMeal}
          onClose={() => setActiveTab('dashboard')}
        />
      )}

      {activeTab === 'ledger' && (
        <LedgerScreen
          receipts={receipts}
          onSelectReceipt={(meal) => setSelectedReceipt(meal)}
          onDeleteReceipt={handleDeleteReceipt}
          onNavigateToCapture={() => setActiveTab('capture')}
          onOpenManualEntry={() => setShowManualEntry(true)}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsScreen
          weekDays={weekDays}
          userGoals={userGoals}
          onExportSlip={() => setShowExportModal(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Shared Bottom Navigation Bar */}
      <Navigation activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Modals */}
      <ReceiptDetailModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        onDelete={handleDeleteReceipt}
      />

      {showSettings && (
        <SettingsModal
          goals={userGoals}
          onSave={(newGoals) => setUserGoals(newGoals)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showManualEntry && (
        <ManualEntryModal
          onAddMeal={handleLogMeal}
          onClose={() => setShowManualEntry(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          weekDays={weekDays}
          userGoals={userGoals}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
