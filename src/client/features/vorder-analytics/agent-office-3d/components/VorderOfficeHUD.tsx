import React from 'react';
import { Sun, Moon, Zap, Users, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface VorderOfficeHUDProps {
  timeMinutes: number;
  timeFormatted: string;
  status: string;
  cyberpunk: boolean;
  inMeeting: boolean;
  isFullscreen: boolean;
  onTimeChange: (minutes: number) => void;
  onCyberpunkToggle: () => void;
  onResetCamera: () => void;
  onToggleFullscreen: () => void;
}

export const VorderOfficeHUD: React.FC<VorderOfficeHUDProps> = ({
  timeMinutes,
  timeFormatted,
  status,
  cyberpunk,
  inMeeting,
  isFullscreen,
  onTimeChange,
  onCyberpunkToggle,
  onResetCamera,
  onToggleFullscreen,
}) => {
  const isNight = timeMinutes < 360 || timeMinutes > 1140;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-2xl sm:rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl text-white font-sans">
      {/* 1. Time & Status */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          {isNight ? (
            <Moon className="size-4 text-cyan-400 animate-pulse" />
          ) : (
            <Sun className="size-4 text-amber-400 animate-spin-slow" />
          )}
          <span className="font-mono font-bold text-sm text-cyan-300 min-w-[50px] tracking-wider">
            {timeFormatted}
          </span>
        </div>

        <div className="hidden sm:block w-px h-4 bg-white/15" />

        <div className="flex items-center gap-2">
          {inMeeting && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold animate-pulse">
              <Users className="size-3" />
              <span>اجتماع قيادة</span>
            </span>
          )}
          <span className="text-[11px] font-medium text-slate-300 truncate max-w-[200px] sm:max-w-xs">
            {status}
          </span>
        </div>
      </div>

      {/* 2. Interactive Time Slider (24-Hour Day/Night) */}
      <div className="w-full sm:w-48 flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1440"
          step="5"
          value={timeMinutes}
          onChange={(e) => onTimeChange(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          title="سلايدر توقيت اليوم (24 ساعة)"
        />
      </div>

      {/* 3. Action Toggles (Cyberpunk, Reset, Fullscreen) */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={onCyberpunkToggle}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
            cyberpunk
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(13,238,243,0.3)]'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="تبديل وضع السايبربانك وتوهج النيون"
        >
          <Zap className="size-3 text-cyan-400" />
          <span>{cyberpunk ? 'إنارة السايبربانك: نشط' : 'وضع السايبربانك'}</span>
        </button>

        <button
          type="button"
          onClick={onResetCamera}
          className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="إعادة ضبط الكاميرا"
        >
          <RotateCcw className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="ملء الشاشة"
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </button>
      </div>
    </div>
  );
};
