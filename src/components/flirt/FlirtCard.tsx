import React, { useState } from 'react';
import {
  Heart,
  Copy,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Share2,
  BookmarkCheck,
} from 'lucide-react';
import { FlirtLine } from '../../types';
import { FLIRT_CATEGORIES } from '../../data/flirtLines';
import { useApp } from '../../context/AppContext';

interface FlirtCardProps {
  currentLine: FlirtLine;
  onNext: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  historyCount: number;
  historyIndex: number;
  onTriggerBurst: () => void;
  onShowToast: (message: string) => void;
}

const CARD_THEMES = [
  {
    id: 'lavender',
    name: 'Lavender Dream',
    border: 'border-[#B8A4D8]/35 hover:border-[#B8A4D8]/60',
    glow: 'from-[#7863A8]/20 via-[#9680C8]/15 to-[#B8A4D8]/20',
    accentText: 'text-[#B8A4D8]',
    btnGradient: 'from-[#9680C8] via-[#856EB8] to-[#6E54A3]',
  },
  {
    id: 'violet',
    name: 'Soft Violet',
    border: 'border-[#9680C8]/35 hover:border-[#9680C8]/60',
    glow: 'from-[#6E54A3]/20 via-[#7863A8]/15 to-[#9680C8]/20',
    accentText: 'text-[#B8A4D8]',
    btnGradient: 'from-[#856EB8] via-[#7863A8] to-[#5E4493]',
  },
  {
    id: 'deep',
    name: 'Midnight Bloom',
    border: 'border-[#262438] hover:border-[#B8A4D8]/50',
    glow: 'from-[#7863A8]/15 via-[#1B1A28]/20 to-[#9680C8]/15',
    accentText: 'text-[#B8A4D8]',
    btnGradient: 'from-[#7863A8] via-[#9680C8] to-[#B8A4D8]',
  },
];

export const FlirtCard: React.FC<FlirtCardProps> = ({
  currentLine,
  onNext,
  onPrevious,
  canGoPrevious,
  canGoNext,
  historyCount,
  historyIndex,
  onTriggerBurst,
  onShowToast,
}) => {
  const { addFlirtFavorite, removeFlirtFavorite, isFlirtFavorite } = useApp();
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);

  const theme = CARD_THEMES[themeIndex];
  const isFav = isFlirtFavorite(currentLine.id);

  const categoryMeta =
    FLIRT_CATEGORIES.find((c) => c.id === currentLine.category) || FLIRT_CATEGORIES[0];

  const handleCopyStandard = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(currentLine.text);
      setCopied(true);
      onShowToast('Copied to clipboard! Ready to send 💕');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Could not access clipboard');
    }
  };

  const handleCopyWithEmojis = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const formatted = `"${currentLine.text}" ${currentLine.emoji}💕`;
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      onShowToast('Copied with cute emojis! 💕✨');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Could not access clipboard');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      removeFlirtFavorite(currentLine.id);
      onShowToast('Removed from favorites');
    } else {
      addFlirtFavorite(currentLine);
      onTriggerBurst();
      onShowToast('Saved to your Favorites 💕');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A sweet line for you 💕',
          text: `"${currentLine.text}" ${currentLine.emoji}`,
        });
      } catch {
        // User cancelled or ignored
      }
    } else {
      handleCopyStandard();
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      onShowToast('Speech synthesis not supported in this browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentLine.text);
    utterance.rate = 0.9; // gentle, slower pace
    utterance.pitch = 1.05;

    // Pick a gentle English voice if available
    const voices = window.speechSynthesis.getVoices();
    const sweetVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Google') ||
          v.name.includes('Natural'))
    );
    if (sweetVoice) {
      utterance.voice = sweetVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const cycleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setThemeIndex((prev) => (prev + 1) % CARD_THEMES.length);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Ambient background glow */}
      <div
        className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-r ${theme.glow} blur-xl opacity-80 pointer-events-none transition-all duration-700`}
      />

      {/* Main Glass Card */}
      <div
        className={`relative z-10 rounded-3xl bg-[#151520]/90 backdrop-blur-xl border ${theme.border} p-6 sm:p-10 shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[380px] sm:min-h-[420px]`}
      >
        {/* Top Header inside Card */}
        <div className="flex items-center justify-between gap-3 pb-6 border-b border-[#262438]">
          {/* Category Pill with Emoji */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${categoryMeta.badgeColor} shadow-sm`}
            >
              <span>{currentLine.emoji}</span>
              <span>{categoryMeta.label}</span>
            </span>

            {currentLine.tag && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-light bg-[#1B1A28] text-[#AAA4B8] border border-[#262438]">
                {currentLine.tag}
              </span>
            )}
          </div>

          {/* Action Icons right side */}
          <div className="flex items-center gap-1.5">
            {/* Cycle Theme Glow */}
            <button
              onClick={cycleTheme}
              title={`Switch card mood (${theme.name})`}
              className="min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#1B1A28] transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#B8A4D8]" />
            </button>

            {/* Read Aloud Whisper */}
            <button
              onClick={handleSpeak}
              title={isSpeaking ? 'Stop voice' : 'Whisper this line'}
              className={`min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                isSpeaking
                  ? 'text-[#B8A4D8] bg-[#B8A4D8]/15'
                  : 'text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#1B1A28]'
              }`}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4 animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              title="Share line"
              className="min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#1B1A28] transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Favorite / Heart toggle button */}
            <button
              onClick={handleToggleFavorite}
              title={isFav ? 'Remove from favorites' : 'Save to favorites 💕'}
              className={`min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isFav
                  ? 'bg-[#B8A4D8]/20 text-[#B8A4D8] border border-[#B8A4D8]/40 shadow-sm shadow-[#7863A8]/20 scale-105'
                  : 'text-[#AAA4B8] hover:text-[#B8A4D8] hover:bg-[#1B1A28]'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${
                  isFav ? 'fill-[#B8A4D8] text-[#B8A4D8] scale-110' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Center Quotation & Flirty Line */}
        <div className="py-8 sm:py-12 my-auto text-center px-2 sm:px-6 relative">
          <p className="text-xl sm:text-2xl md:text-[26px] font-light text-[#EAE6F2] leading-relaxed tracking-wide transition-opacity duration-200">
            “{currentLine.text}”
          </p>
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-6 border-t border-[#262438] space-y-4">
          {/* Quick Copy Buttons Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyStandard}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#1B1A28] hover:bg-[#201F32] border border-[#262438] text-xs font-light text-[#EAE6F2] flex items-center gap-2 transition-all hover:border-[#3A3756] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#AAA4B8]" />
                    <span>Copy line</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyWithEmojis}
                title="Copy line with cute emojis attached"
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#1B1A28] hover:bg-[#201F32] border border-[#262438] text-xs font-light text-[#B8A4D8] flex items-center gap-1.5 transition-all hover:border-[#3A3756] cursor-pointer"
              >
                <span>Copy + 💕</span>
              </button>
            </div>

            {/* History Counter & Arrow navigation */}
            <div className="flex items-center gap-1.5 text-xs text-[#AAA4B8]">
              <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                title="Previous line"
                className="min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center border border-[#262438] bg-[#151520] text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#1B1A28] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono text-[11px] text-[#AAA4B8]">
                {historyIndex + 1} / {Math.max(historyCount, 1)}
              </span>

              <button
                onClick={onNext}
                disabled={!canGoNext}
                title="Next line in history"
                className="min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center border border-[#262438] bg-[#151520] text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#1B1A28] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Action Button: "Another One 💕" */}
          <div className="pt-2">
            <button
              onClick={() => {
                onTriggerBurst();
                onNext();
              }}
              className={`w-full min-h-[52px] sm:min-h-[56px] rounded-2xl bg-gradient-to-r ${theme.btnGradient} text-white font-medium text-base shadow-lg shadow-[#7863A8]/25 hover:shadow-[#7863A8]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group`}
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              <Heart className="w-5 h-5 fill-white/80 group-hover:scale-125 transition-transform duration-300" />
              <span className="tracking-wide">Another One 💕</span>
              <Sparkles className="w-4 h-4 opacity-75 group-hover:rotate-45 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
