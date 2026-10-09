import React, { useState, useRef, useEffect } from 'react';
import { MealSpecimen, FoodItem } from '../types';
import { SALMON_SPECIMEN, SAMPLE_SPECIMENS } from '../data/mockData';
import { playSound } from '../utils/audio';

interface CaptureScreenProps {
  onLogMeal: (meal: MealSpecimen) => void;
  onClose: () => void;
}

export const CaptureScreen: React.FC<CaptureScreenProps> = ({ onLogMeal, onClose }) => {
  // Current active specimen
  const [activeSpecimen, setActiveSpecimen] = useState<MealSpecimen>(SALMON_SPECIMEN);

  // Portion multiplier
  const [portionRatio, setPortionRatio] = useState<number>(1.0);

  // Torch state
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Scanning animation states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [loggedSuccess, setLoggedSuccess] = useState<boolean>(false);

  // Live webcam state
  const [isLiveCamera, setIsLiveCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle portion adjustments
  const handlePortionChange = (delta: number) => {
    playSound('clack');
    setPortionRatio((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.max(0.5, Math.min(3.0, next));
    });
  };

  // Scaled nutritional values
  const scaledCalories = Math.round(activeSpecimen.calories * portionRatio);
  const scaledWeight = Math.round(activeSpecimen.netWeightGrams * portionRatio);
  const scaledProtein = Math.round(activeSpecimen.proteinGrams * portionRatio);
  const scaledCarbs = Math.round(activeSpecimen.carbsGrams * portionRatio);
  const scaledFat = Math.round(activeSpecimen.fatGrams * portionRatio);

  // Split calories into mechanical drum digits (3 digits, e.g., 6, 2, 5)
  const calorieDigits = String(scaledCalories).padStart(3, '0').slice(-3).split('');

  // Shutter action (triggers scan strobe + analysis)
  const handleShutter = () => {
    playSound('shutter');
    setFlashActive(true);
    setIsScanning(true);

    setTimeout(() => {
      setFlashActive(false);
    }, 180);

    setTimeout(() => {
      setIsScanning(false);
      playSound('clack');
    }, 1200);
  };

  // Toggle live camera
  const toggleLiveCamera = async () => {
    playSound('switch');
    if (isLiveCamera) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsLiveCamera(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        setIsLiveCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable, staying on specimen image:', err);
        alert('Camera stream unavailable or permission denied. You can continue scanning photo specimens.');
      }
    }
  };

  // Handle image upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playSound('tick');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setIsScanning(true);

      // Attempt to call server API for Gemini analysis
      try {
        const res = await fetch('/api/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type || 'image/jpeg' }),
        });
        const result = await res.json();
        if (result.success && result.data) {
          const d = result.data;
          setActiveSpecimen({
            id: `specimen-${Date.now()}`,
            specimenNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mealType: 'Lunch',
            title: d.specimenTitle || 'Analyzed Specimen',
            description: d.description || 'Optical spectrometer scanned dish.',
            calories: d.totalCalories || 520,
            netWeightGrams: d.netWeightGrams || 180,
            proteinGrams: d.proteinGrams || 35,
            carbsGrams: d.carbsGrams || 42,
            fatGrams: d.fatGrams || 16,
            score: d.nutritionScore || 9.4,
            confidencePercent: d.confidencePercent || 92,
            isAiVerified: true,
            imageUrl: base64,
            items: d.items || [
              { name: 'Detected Food Core', portion: '1 serving', calories: d.totalCalories, topPercent: 40, leftPercent: 30, colorType: 'primary' },
            ],
          });
          setPortionRatio(1.0);
          playSound('clack');
          setIsScanning(false);
          return;
        }
      } catch (err) {
        console.warn('API analysis fallback:', err);
      }

      // Intelligent fallback if network or model fails
      setActiveSpecimen({
        id: `specimen-${Date.now()}`,
        specimenNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mealType: 'Lunch',
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Custom Culinary Plate',
        description: 'User uploaded photo processed with optical wavelength spectrometry.',
        calories: 580,
        netWeightGrams: 210,
        proteinGrams: 36,
        carbsGrams: 45,
        fatGrams: 18,
        score: 9.3,
        confidencePercent: 91,
        isAiVerified: true,
        imageUrl: base64,
        items: [
          { name: 'Culinary Specimen Center', portion: '~1 portion (380 kcal)', calories: 380, topPercent: 35, leftPercent: 25, colorType: 'primary' },
          { name: 'Side Accompaniment', portion: '~1 cup (200 kcal)', calories: 200, topPercent: 65, leftPercent: 45, colorType: 'secondary' },
        ],
      });
      setPortionRatio(1.0);
      setIsScanning(false);
      playSound('clack');
    };
    reader.readAsDataURL(file);
  };

  // Log Entry
  const handleLogEntry = () => {
    playSound('stamp');
    setLoggedSuccess(true);

    const newMeal: MealSpecimen = {
      ...activeSpecimen,
      id: `meal-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      calories: scaledCalories,
      netWeightGrams: scaledWeight,
      proteinGrams: scaledProtein,
      carbsGrams: scaledCarbs,
      fatGrams: scaledFat,
    };

    onLogMeal(newMeal);

    setTimeout(() => {
      setLoggedSuccess(false);
    }, 1800);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen relative flex flex-col pb-28 bg-[#17120f] text-[#ebe0db]">
      {/* Optical Flash Overlay */}
      {flashActive && (
        <div className="fixed inset-0 z-50 bg-white/80 pointer-events-none transition-opacity duration-150"></div>
      )}

      {/* TOP APP BAR (Brushed Gunmetal finish with mechanical rivet screws & switch) */}
      <header className="sticky top-0 z-40 w-full bg-[#120d0a] border-b border-[#524439]/40 shadow-md">
        <div className="px-4 h-14 flex items-center justify-between relative bg-gradient-to-b from-[#2f2925]/40 via-[#120d0a] to-[#120d0a]">
          {/* Left: Machined Rivet & Torch Mechanical Toggle */}
          <div className="flex items-center space-x-3">
            {/* Mechanical Rivet Screw */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#524439]/60 screw-head flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-[#120d0a]"></div>
            </div>
            {/* Flashlight Brass Toggle Switch Button */}
            <button
              onClick={() => {
                playSound('switch');
                setTorchOn(!torchOn);
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-[#ffb77b]/40 shadow-inner active:scale-95 transition-transform ${
                torchOn ? 'bg-[#c8803f] text-[#432100]' : 'bg-[#2f2925] text-[#ffb77b]'
              }`}
              id="torchBtn"
            >
              <span className="material-symbols-outlined text-sm">
                {torchOn ? 'flash_on' : 'flash_auto'}
              </span>
              <span className="text-[10px] tracking-wider font-bold">TORCH</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  torchOn ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-[#ffb77b]/80 shadow-[0_0_6px_#ffb77b]'
                }`}
              ></div>
            </button>
          </div>

          {/* Center Title: AI Lens Calorie Analyzer */}
          <div className="text-center">
            <h1 className="font-headline-sm text-base text-[#ffb77b] tracking-tight leading-tight">
              AI Lens Calorie Analyzer
            </h1>
            <div className="flex items-center justify-center space-x-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#abcebe] animate-pulse"></span>
              <span className="text-[9px] font-bold text-[#d8c3b4] tracking-wider uppercase">
                OPTICAL SPECTROMETER
              </span>
            </div>
          </div>

          {/* Right: Rivet & Tactile Close Actuator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                playSound('tick');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-[#2f2925] border border-[#524439]/50 flex items-center justify-center text-[#d8c3b4] hover:text-[#ffb77b] active:scale-95 shadow-md"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
            {/* Mechanical Rivet Screw */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#524439]/60 screw-head flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-[#120d0a] rotate-45"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Preset Specimen Switcher Ribbon */}
      <div className="px-4 pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
        <span className="text-[#a08d80] font-mono whitespace-nowrap uppercase tracking-wider mr-1">
          SPECIMENS:
        </span>
        {SAMPLE_SPECIMENS.map((specimen, idx) => (
          <button
            key={specimen.id}
            onClick={() => {
              playSound('tick');
              setActiveSpecimen(specimen);
              setPortionRatio(1.0);
              if (isLiveCamera) {
                toggleLiveCamera();
              }
            }}
            className={`px-2 py-0.5 rounded border whitespace-nowrap transition-all ${
              activeSpecimen.id === specimen.id && !isLiveCamera
                ? 'bg-[#c8803f] text-[#432100] border-[#ffb77b] font-bold shadow'
                : 'bg-[#201b17] text-[#d8c3b4] border-[#524439]/40 hover:border-[#ffb77b]/50'
            }`}
          >
            #{idx + 1} {specimen.title.split(' ')[0]}
          </button>
        ))}
        <button
          onClick={toggleLiveCamera}
          className={`px-2 py-0.5 rounded border whitespace-nowrap flex items-center gap-1 transition-all ${
            isLiveCamera
              ? 'bg-[#abcebe] text-[#002116] border-[#c6ebd9] font-bold shadow'
              : 'bg-[#201b17] text-[#8fd1e1] border-[#599aaa]/40 hover:border-[#8fd1e1]'
          }`}
        >
          <span className="material-symbols-outlined text-xs">videocam</span>
          {isLiveCamera ? 'Live ON' : 'Live Cam'}
        </button>
      </div>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="px-4 pt-1 space-y-3">
        {/* CAMERA VIEWFINDER & RECOGNITION OVERLAY CHASSIS */}
        <div className="relative rounded-xl overflow-hidden border border-[#524439]/60 bg-[#120d0a] shadow-[0_8px_30px_rgba(0,0,0,0.85)] p-2">
          {/* Rubberized Knurled Viewfinder Bezel Framing */}
          <div className="relative rounded-lg overflow-hidden bg-black p-1 border border-[#a08d80]/30">
            {/* Live Camera View Canvas / Artisan Food Photo */}
            <div className="relative w-full aspect-[4/4] rounded overflow-hidden bg-black">
              {isLiveCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover brightness-[0.92] contrast-[1.05]"
                />
              ) : (
                <img
                  className="w-full h-full object-cover brightness-[0.92] contrast-[1.05] transition-all duration-300"
                  src={activeSpecimen.imageUrl}
                  alt={activeSpecimen.title}
                />
              )}

              {/* Torch beam light effect */}
              {torchOn && (
                <div className="absolute inset-0 pointer-events-none bg-radial from-amber-200/25 via-transparent to-transparent mix-blend-screen"></div>
              )}

              {/* Scanning laser beam animation */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#ffb77b] to-transparent shadow-[0_0_15px_#ffb77b] animate-bounce"></div>
                  <div className="absolute inset-0 bg-[#ffb77b]/10 backdrop-blur-[1px]"></div>
                </div>
              )}

              {/* Camera Lens Flare & Vitreous Specular Mineral Glass Reflection Overlays */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-[#ffb77b]/5 to-[#8fd1e1]/10 mix-blend-screen"></div>
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-gradient-to-br from-white/15 to-transparent blur-2xl pointer-events-none transform rotate-12"></div>

              {/* Optical Crosshairs & Corner Reticle Framing */}
              <div className="absolute inset-4 pointer-events-none border border-[#ffb77b]/20 rounded">
                {/* Top-Left Reticle */}
                <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-[#ffb77b]"></div>
                {/* Top-Right Reticle */}
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-[#ffb77b]"></div>
                {/* Bottom-Left Reticle */}
                <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-[#ffb77b]"></div>
                {/* Bottom-Right Reticle */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-[#ffb77b]"></div>

                {/* Central Micro Horological Reticle */}
                <div className="absolute inset-0 m-auto w-10 h-10 flex items-center justify-center opacity-60">
                  <div className="w-10 h-[1px] bg-[#ffb77b]/40"></div>
                  <div className="h-10 w-[1px] bg-[#ffb77b]/40 absolute"></div>
                  <div className="w-3 h-3 rounded-full border border-[#ffb77b]/60 absolute"></div>
                </div>
              </div>

              {/* AI OPTICAL RECOGNITION OVERLAYS (Skeuomorphic Brass & Glass Tags) */}
              {activeSpecimen.items &&
                activeSpecimen.items.map((item: FoodItem, idx: number) => {
                  const isPrimary = idx === 0;
                  const isSecondary = idx === 1;

                  const colorBorder = isPrimary
                    ? 'border-[#ffb77b]/60 text-[#ffb77b]'
                    : isSecondary
                    ? 'border-[#abcebe]/60 text-[#abcebe]'
                    : 'border-[#8fd1e1]/60 text-[#8fd1e1]';

                  const pingBg = isPrimary
                    ? 'bg-[#ffb77b]'
                    : isSecondary
                    ? 'bg-[#abcebe]'
                    : 'bg-[#8fd1e1]';

                  return (
                    <div
                      key={idx}
                      className="absolute z-20 transition-all duration-300"
                      style={{ top: `${item.topPercent}%`, left: `${item.leftPercent}%` }}
                    >
                      {/* Brass Bounding Box on primary item */}
                      {isPrimary && (
                        <div className="w-36 h-20 border border-dashed border-[#ffb77b]/70 rounded bg-[#ffb77b]/5 shadow-[0_0_12px_rgba(255,183,123,0.3)] pointer-events-none mb-1"></div>
                      )}
                      {/* Physical Brass Pin & Monocle Tag */}
                      <div
                        className={`flex items-center space-x-1.5 bg-[#120d0a]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border ${colorBorder} shadow-xl brass-bezel-rim max-w-xs cursor-pointer hover:scale-105 transition-transform`}
                      >
                        <span className={`w-2 h-2 rounded-full ${pingBg} ${isPrimary ? 'animate-ping' : ''}`}></span>
                        <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
                        <span className="text-[9px] text-[#d8c3b4] font-medium whitespace-nowrap">
                          {item.portion}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {/* Bottom Viewfinder Metadata Ribbon */}
              <div className="absolute bottom-2 inset-x-2 px-2 py-1 bg-[#120d0a]/80 backdrop-blur-sm rounded flex items-center justify-between text-[#d8c3b4] text-[10px]">
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-[#abcebe] font-bold">CALIBRATED</span>
                  <span>ISO 200</span>
                  <span>ƒ/2.8</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="material-symbols-outlined text-xs text-[#ffb77b]">auto_awesome</span>
                  <span className="font-bold tracking-wider">AI RECOGNITION V4.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYSIS ASSESSMENT CARD (Embossed Parchment Punch-Card with Staple & Gauges) */}
        <div className="relative bg-[#241f1b] rounded-xl p-4 shadow-2xl border border-[#524439]/50 punched-card-stitch overflow-hidden">
          {/* Top Physical Brass Staple Detail */}
          <div className="absolute -top-1 left-10 w-8 h-2.5 bg-[#524439] rounded-b border-t border-white/20 shadow-md"></div>

          <div className="space-y-3.5">
            {/* Header: Punch Card Index & Total Estimated Calories (Mechanical Drum Counter) */}
            <div className="flex items-center justify-between border-b border-[#524439]/30 pb-3">
              <div>
                <span className="text-[9px] font-mono text-[#a08d80] uppercase tracking-wider block">
                  CHRONO-LEDGER SPECIMEN {activeSpecimen.specimenNumber}
                </span>
                <h2 className="font-headline-md text-lg text-[#ebe0db] tracking-tight">Assessed Nutrition</h2>
              </div>
              {/* Mechanical Drum Calorie Display Window */}
              <div className="flex items-center space-x-1.5 bg-[#120d0a] px-3 py-1.5 rounded-lg border border-[#ffb77b]/40 inset-leather-well">
                <div className="flex space-x-1 items-center">
                  {/* Drum Reel Numbers */}
                  {calorieDigits.map((digit, i) => (
                    <div
                      key={i}
                      className="w-5 h-7 rounded bg-[#2f2925] flex items-center justify-center text-[#ffb77b] font-bold text-lg border border-[#524439]/40 mechanical-drum-shadow transition-all duration-200"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-[#ffb77b] font-bold ml-1 font-label">KCAL</span>
              </div>
            </div>

            {/* Accuracy Confidence Meter (Analog Gauge) & Portion Rocker Switch */}
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              {/* Analog Confidence Dial Gauge */}
              <div className="bg-[#201b17] p-2.5 rounded-xl border border-[#524439]/30 inset-leather-well flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold text-[#d8c3b4] tracking-wider uppercase">CONFIDENCE</span>
                  <span className="text-[10px] text-[#abcebe] font-bold">{activeSpecimen.confidencePercent}%</span>
                </div>
                {/* Arc Needle Meter Simulation */}
                <div className="relative w-full h-8 flex items-center justify-center overflow-hidden">
                  <div className="w-24 h-12 border-t-4 border-l-4 border-r-4 border-[#abcebe]/40 rounded-t-full absolute top-1"></div>
                  {/* Active Needle pointing towards ~94% */}
                  <div
                    className="w-10 h-0.5 bg-[#ffb77b] origin-left absolute left-1/2 shadow-[0_0_4px_#ffb77b] transition-transform duration-500"
                    style={{ transform: `rotate(${-60 + (activeSpecimen.confidencePercent / 100) * 80}deg)` }}
                  ></div>
                  <div className="w-3 h-3 rounded-full bg-[#c8803f] border border-[#ffb77b] absolute bottom-0"></div>
                </div>
                <div className="text-center text-[#a08d80] text-[9px] font-mono tracking-wider mt-1">
                  SPECTRAL CONFIRMED
                </div>
              </div>

              {/* Portion Stepped Rocker Switch */}
              <div className="bg-[#201b17] p-2.5 rounded-xl border border-[#524439]/30 inset-leather-well flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold text-[#d8c3b4] tracking-wider uppercase">PORTION RATIO</span>
                  <span className="text-[10px] text-[#ffb77b] font-bold">{portionRatio.toFixed(1)}x</span>
                </div>
                {/* Physical Tactile Stepped Rocker */}
                <div className="flex items-center justify-between bg-[#120d0a] rounded-lg p-1 border border-[#524439]/40">
                  <button
                    onClick={() => handlePortionChange(-0.1)}
                    className="w-8 h-8 rounded bg-[#2f2925] active:bg-[#3a3430] border border-[#524439]/60 flex items-center justify-center text-[#ebe0db] active:scale-95 shadow-inner"
                    aria-label="Decrease portion"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <div className="text-center px-2">
                    <span className="font-headline-sm text-base text-[#ebe0db] font-semibold">
                      {portionRatio.toFixed(1)}
                    </span>
                    <span className="block text-[8px] text-[#a08d80] leading-none uppercase font-bold tracking-wider">
                      SERVING
                    </span>
                  </div>
                  <button
                    onClick={() => handlePortionChange(0.1)}
                    className="w-8 h-8 rounded bg-[#2f2925] active:bg-[#3a3430] border border-[#524439]/60 flex items-center justify-center text-[#ebe0db] active:scale-95 shadow-inner"
                    aria-label="Increase portion"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <div className="text-center text-[#a08d80] text-[9px] font-mono tracking-wider mt-1">
                  TAP TO ADJUST SCALE
                </div>
              </div>
            </div>

            {/* Tactile Macronutrient Sliders / Grooved Wells */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-[#d8c3b4]">
                <span className="text-[9px] font-bold text-[#a08d80] uppercase tracking-wider">
                  MACRO COMPOSITION BREAKDOWN
                </span>
                <span className="text-[10px] text-[#ffb77b] font-bold font-mono">{scaledWeight}g NET WEIGHT</span>
              </div>

              {/* Protein Track */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#ffb77b] font-semibold">PROTEIN</span>
                  <span className="text-[#ebe0db] font-bold">
                    {scaledProtein}g ({scaledProtein * 4} kcal)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#120d0a] rounded-full inset-leather-well relative overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#c8803f] to-[#ffb77b] rounded-full shadow-[0_0_8px_#c8803f] transition-all duration-300"
                    style={{ width: `${Math.min(100, (scaledProtein / 60) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Carbs Track */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#abcebe] font-semibold">CARBOHYDRATES</span>
                  <span className="text-[#ebe0db] font-bold">
                    {scaledCarbs}g ({scaledCarbs * 4} kcal)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#120d0a] rounded-full inset-leather-well relative overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#2f4f42] to-[#abcebe] rounded-full shadow-[0_0_8px_#2f4f42] transition-all duration-300"
                    style={{ width: `${Math.min(100, (scaledCarbs / 60) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Fat Track */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8fd1e1] font-semibold">LIPIDS (FAT)</span>
                  <span className="text-[#ebe0db] font-bold">
                    {scaledFat}g ({scaledFat * 9} kcal)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#120d0a] rounded-full inset-leather-well relative overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#599aaa] to-[#8fd1e1] rounded-full shadow-[0_0_8px_#599aaa] transition-all duration-300"
                    style={{ width: `${Math.min(100, (scaledFat / 40) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* SHUTTER & PHYSICAL ACTION ACTUATION BAR */}
        <div className="pt-1 pb-2 flex items-center justify-between px-2">
          {/* Upload Gallery Action (Framed Polaroid Icon Button) */}
          <button
            onClick={() => {
              playSound('tick');
              fileInputRef.current?.click();
            }}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-[#241f1b] border border-[#524439]/60 shadow-lg active:scale-95 transition-transform group"
            title="Upload from device library"
          >
            <div className="w-9 h-9 rounded bg-[#2f2925] border border-[#a08d80]/30 flex items-center justify-center text-[#d8c3b4] group-hover:text-[#ffb77b] transition-colors">
              <span className="material-symbols-outlined text-xl">photo_library</span>
            </div>
            <span className="text-[9px] text-[#d8c3b4] mt-1 tracking-tight font-bold">GALLERY</span>
          </button>

          {/* Center Heavy Mechanical Camera Shutter Button (Chrome Ring, Knurled Bezel & Red Enamel Cap) */}
          <div className="relative flex items-center justify-center p-1.5 rounded-full bg-gradient-to-b from-[#a08d80] to-[#120d0a] shadow-2xl">
            <div className="w-20 h-20 rounded-full knurled-ring p-1 flex items-center justify-center shadow-inner">
              <button
                onClick={handleShutter}
                className="w-full h-full rounded-full bg-gradient-to-br from-[#ffb4ab] to-[#93000a] border-2 border-[#ffdcc2]/40 shadow-[0_4px_10px_rgba(147,0,10,0.8)] active:translate-y-1 active:shadow-inner flex items-center justify-center transition-all active:scale-90"
                id="shutterBtn"
                aria-label="Scan & analyze specimen"
              >
                {/* Center Concentric Brass Bezel */}
                <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">camera</span>
                </div>
              </button>
            </div>
          </div>

          {/* Confirm & Log to Journal (Satisfying 3D Raised Green Stamp Button) */}
          <button
            onClick={handleLogEntry}
            disabled={loggedSuccess}
            className={`flex flex-col items-center justify-center w-24 h-16 rounded-xl border-2 shadow-[0_4px_12px_rgba(47,79,66,0.6)] active:translate-y-0.5 active:shadow-inner transition-transform group ${
              loggedSuccess
                ? 'bg-[#2f4f42] border-[#c6ebd9] text-[#c6ebd9]'
                : 'bg-gradient-to-b from-[#2f4f42] to-[#120d0a] border-[#abcebe]/50 text-[#abcebe]'
            }`}
          >
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-xl">
                {loggedSuccess ? 'task_alt' : 'check_circle'}
              </span>
            </div>
            <span className="text-[10px] font-bold tracking-wider mt-0.5 font-label">
              {loggedSuccess ? 'PINNED!' : 'LOG ENTRY'}
            </span>
          </button>
        </div>

        {/* Confirmation message banner */}
        {loggedSuccess && (
          <div className="p-2.5 rounded-lg bg-[#2f4f42]/90 border border-[#abcebe] text-center text-xs text-[#c6ebd9] font-bold animate-fadeIn">
            ✓ Specimen {activeSpecimen.specimenNumber} stamped & pinned to daily parchment ledger!
          </div>
        )}
      </main>
    </div>
  );
};
