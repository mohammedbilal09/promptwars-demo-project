import React from 'react';
import { playSound } from '../utils/audio';

export type NavTab = 'dashboard' | 'capture' | 'ledger' | 'analytics';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const handleTabClick = (tab: NavTab) => {
    playSound('tick');
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe bg-[#120d0a] shadow-2xl border-t border-[#524439]/50 max-w-md mx-auto backdrop-blur-md">
      {/* Tab 1: Dashboard */}
      <button
        onClick={() => handleTabClick('dashboard')}
        className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-150 active:scale-95 ${
          activeTab === 'dashboard'
            ? 'bg-[#2f2925] text-[#ffb77b] rounded-xl shadow-inner border border-[#c8803f]/30'
            : 'text-[#d8c3b4] hover:text-[#ffdcc2]'
        }`}
        aria-label="Dashboard"
      >
        <span
          className="material-symbols-outlined text-xl"
          style={activeTab === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          speed
        </span>
        <span className={`text-[10px] font-medium tracking-wide mt-0.5 ${activeTab === 'dashboard' ? 'font-bold' : ''}`}>
          Dashboard
        </span>
      </button>

      {/* Tab 2: Capture (Camera Actuator) */}
      <button
        onClick={() => handleTabClick('capture')}
        className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-150 active:scale-95 ${
          activeTab === 'capture'
            ? 'bg-[#2f2925] text-[#ffb77b] rounded-xl shadow-inner border border-[#c8803f]/30'
            : 'text-[#d8c3b4] hover:text-[#ffdcc2]'
        }`}
        aria-label="Capture"
      >
        <div className="relative">
          <span
            className="material-symbols-outlined text-xl"
            style={activeTab === 'capture' ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            photo_camera
          </span>
        </div>
        <span className={`text-[10px] font-medium tracking-wide mt-0.5 ${activeTab === 'capture' ? 'font-bold' : ''}`}>
          Capture
        </span>
      </button>

      {/* Tab 3: Ledger */}
      <button
        onClick={() => handleTabClick('ledger')}
        className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-150 active:scale-95 ${
          activeTab === 'ledger'
            ? 'bg-[#2f2925] text-[#ffb77b] rounded-xl shadow-inner border border-[#c8803f]/30'
            : 'text-[#d8c3b4] hover:text-[#ffdcc2]'
        }`}
        aria-label="Ledger"
      >
        <span
          className="material-symbols-outlined text-xl"
          style={activeTab === 'ledger' ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          auto_stories
        </span>
        <span className={`text-[10px] font-medium tracking-wide mt-0.5 ${activeTab === 'ledger' ? 'font-bold' : ''}`}>
          Ledger
        </span>
      </button>

      {/* Tab 4: Analytics */}
      <button
        onClick={() => handleTabClick('analytics')}
        className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-150 active:scale-95 ${
          activeTab === 'analytics'
            ? 'bg-[#2f2925] text-[#ffb77b] rounded-xl shadow-inner border border-[#c8803f]/30'
            : 'text-[#d8c3b4] hover:text-[#ffdcc2]'
        }`}
        aria-label="Analytics"
      >
        <span
          className="material-symbols-outlined text-xl"
          style={activeTab === 'analytics' ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          monitoring
        </span>
        <span className={`text-[10px] font-medium tracking-wide mt-0.5 ${activeTab === 'analytics' ? 'font-bold' : ''}`}>
          Analytics
        </span>
      </button>
    </nav>
  );
};
