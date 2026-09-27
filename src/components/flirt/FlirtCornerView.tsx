import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Bookmark,
  Shuffle,
  Calendar,
  Flame,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { FlirtLine, FlirtCategory, FlirtFavorite } from '../../types';
import {
  FLIRT_CATEGORIES,
  PREDEFINED_FLIRT_LINES,
  getLinesByCategory,
  getRandomFlirtLine,
  getDailyFlirtLine,
} from '../../data/flirtLines';
import { FloatingHearts } from './FloatingHearts';
import { FlirtCard } from './FlirtCard';
import { FlirtFavoritesList } from './FlirtFavoritesList';
import { useApp } from '../../context/AppContext';

export const FlirtCornerView: React.FC = () => {
  const { flirtFavorites, isFlirtFavorite, addFlirtFavorite } = useApp();

  // Active view tab: 'deck' or 'favorites'
  const [activeSubTab, setActiveSubTab] = useState<'deck' | 'favorites'>('deck');

  // Selected Category filter for the deck
  const [selectedCategory, setSelectedCategory] = useState<FlirtCategory>('all');

  // History stack for the deck to allow previous/next navigation
  const [history, setHistory] = useState<FlirtLine[]>(() => [
    getRandomFlirtLine('all'),
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Particle burst trigger counter
  const [burstCount, setBurstCount] = useState<number>(0);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Daily line of the day
  const dailyLine = useMemo(() => getDailyFlirtLine(), []);
  const [copiedDaily, setCopiedDaily] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Clear toast after timeout
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const currentLine = history[historyIndex] || PREDEFINED_FLIRT_LINES[0];

  // Roll "Another One 💕"
  const handleNext = useCallback(() => {
    // If currently viewing older history, simply move forward
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      return;
    }

    // Otherwise pick a brand new random line from selected category
    const newLine = getRandomFlirtLine(selectedCategory, currentLine.id);
    setHistory((prev) => [...prev, newLine]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex, history.length, selectedCategory, currentLine.id]);

  // Go to Previous line in history
  const handlePrevious = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [historyIndex]);

  // When category changes, pick a new line for that category immediately
  const handleSelectCategory = (cat: FlirtCategory) => {
    setSelectedCategory(cat);
    const newLine = getRandomFlirtLine(cat);
    setHistory((prev) => [...prev, newLine]);
    setHistoryIndex((prev) => prev + 1);
    setBurstCount((b) => b + 1);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        setBurstCount((b) => b + 1);
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  // When a favorite item is selected from the favorites list, load it into the deck
  const handleSelectFavorite = (fav: FlirtFavorite) => {
    const matchingLine: FlirtLine = {
      id: fav.lineId || fav.id,
      text: fav.text,
      category: fav.category,
      emoji: fav.emoji || '💕',
      tag: 'Saved Favorite',
    };
    setHistory((prev) => [...prev, matchingLine]);
    setHistoryIndex((prev) => prev + 1);
    setActiveSubTab('deck');
    setBurstCount((b) => b + 1);
    showToast('Loaded into Flirt Deck 💕');
  };

  const handleCopyDaily = async () => {
    try {
      await navigator.clipboard.writeText(`"${dailyLine.text}" ${dailyLine.emoji}💕`);
      setCopiedDaily(true);
      showToast("Copied Today's Sweet Note! 💕");
      setTimeout(() => setCopiedDaily(false), 2000);
    } catch {
      showToast('Could not access clipboard');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* Floating Animated Hearts Canvas */}
      <FloatingHearts burstTrigger={burstCount} ambient={true} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#1B1A28]/95 border border-[#B8A4D8]/40 text-[#EAE6F2] text-xs font-light shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Heart className="w-3.5 h-3.5 fill-[#B8A4D8] text-[#B8A4D8] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <header className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light bg-gradient-to-r from-[#B8A4D8]/20 via-[#9680C8]/20 to-[#7863A8]/20 border border-[#B8A4D8]/30 text-[#B8A4D8] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#B8A4D8] animate-spin" style={{ animationDuration: '6s' }} />
              <span>Sweet & Playful Sanctuary</span>
            </span>
            <span className="text-xs text-[#AAA4B8] font-light">·</span>
            <span className="text-xs text-[#AAA4B8] font-light">
              {PREDEFINED_FLIRT_LINES.length}+ Predefined Lines
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-light text-[#EAE6F2] tracking-wide flex items-center gap-2.5">
            <span>Flirt Corner</span>
            <span className="inline-block hover:scale-125 transition-transform duration-300 cursor-pointer" onClick={() => setBurstCount((b) => b + 1)}>
              💕
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-light text-[#AAA4B8] max-w-xl leading-relaxed">
            Random flirty, teasing, funny, romantic, and caring lines to warm your heart or send to someone special.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-[#151520] border border-[#262438] self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('deck')}
            className={`min-h-[38px] px-4 rounded-xl text-xs font-light flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'deck'
                ? 'bg-gradient-to-r from-[#B8A4D8]/25 to-[#9680C8]/25 text-[#EAE6F2] border border-[#B8A4D8]/40 shadow-sm'
                : 'text-[#AAA4B8] hover:text-[#EAE6F2]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <span>Flirt Deck</span>
          </button>

          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`min-h-[38px] px-4 rounded-xl text-xs font-light flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'favorites'
                ? 'bg-gradient-to-r from-[#B8A4D8]/25 to-[#9680C8]/25 text-[#EAE6F2] border border-[#B8A4D8]/40 shadow-sm'
                : 'text-[#AAA4B8] hover:text-[#EAE6F2]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${flirtFavorites.length > 0 ? 'fill-[#B8A4D8] text-[#B8A4D8]' : ''}`} />
            <span>Favorites</span>
            {flirtFavorites.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#B8A4D8]/20 text-[#B8A4D8] font-mono">
                {flirtFavorites.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Active View: Deck vs Favorites */}
      {activeSubTab === 'deck' ? (
        <div className="space-y-7 relative z-10">
          {/* Category Filter Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#AAA4B8] px-1 font-light">
              <span>Category Filter</span>
              <span className="hidden sm:inline">Tip: Press Spacebar or Arrow Right for another one 💕</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {FLIRT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const poolCount = getLinesByCategory(cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-2xl text-xs font-light whitespace-nowrap flex items-center gap-2 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#B8A4D8]/20 via-[#9680C8]/20 to-[#7863A8]/20 border-[#B8A4D8]/50 text-[#EAE6F2] shadow-md shadow-[#7863A8]/20 scale-[1.02]'
                        : 'bg-[#151520] border-[#262438] text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#1B1A28]'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-70 px-1.5 py-0.5 rounded-full bg-black/30 font-mono text-[#AAA4B8]">
                      {poolCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Flirt Card */}
          <FlirtCard
            currentLine={currentLine}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoPrevious={historyIndex > 0}
            canGoNext={true}
            historyCount={history.length}
            historyIndex={historyIndex}
            onTriggerBurst={() => setBurstCount((b) => b + 1)}
            onShowToast={showToast}
          />

          {/* Daily Sweet Note Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1B1A28] via-[#151520] to-[#101018] border border-[#262438] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B8A4D8]/15 border border-[#B8A4D8]/30 flex items-center justify-center text-[#B8A4D8] shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#B8A4D8]">Today's Sweet Note</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#B8A4D8]/15 text-[#B8A4D8] border border-[#B8A4D8]/30">
                    Daily Spark
                  </span>
                </div>
                <p className="text-xs text-[#EAE6F2] font-light italic leading-relaxed">
                  “{dailyLine.text}”
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleCopyDaily}
                className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#151520] hover:bg-[#1B1A28] border border-[#262438] text-xs font-light text-[#EAE6F2] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedDaily ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#AAA4B8]" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (!isFlirtFavorite(dailyLine.id)) {
                    addFlirtFavorite(dailyLine, "Saved from Today's Sweet Note");
                    setBurstCount((b) => b + 1);
                    showToast('Saved daily spark to favorites 💕');
                  } else {
                    showToast('Already in your favorites 💕');
                  }
                }}
                title="Save daily spark to favorites"
                className="min-h-[36px] min-w-[36px] rounded-xl border border-[#262438] bg-[#151520] hover:bg-[#1B1A28] flex items-center justify-center text-[#B8A4D8] transition-colors cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${isFlirtFavorite(dailyLine.id) ? 'fill-[#B8A4D8]' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <FlirtFavoritesList
            onSelectFavorite={handleSelectFavorite}
            onShowToast={showToast}
            onTriggerBurst={() => setBurstCount((b) => b + 1)}
          />
        </div>
      )}
    </div>
  );
};
