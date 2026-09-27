import React, { useState, useMemo } from 'react';
import {
  Heart,
  Copy,
  Check,
  Trash2,
  Search,
  Plus,
  X,
  ExternalLink,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { FlirtFavorite, FlirtCategory, FlirtLine } from '../../types';
import { FLIRT_CATEGORIES } from '../../data/flirtLines';
import { useApp } from '../../context/AppContext';

interface FlirtFavoritesListProps {
  onSelectFavorite: (favorite: FlirtFavorite) => void;
  onShowToast: (message: string) => void;
  onTriggerBurst: () => void;
}

export const FlirtFavoritesList: React.FC<FlirtFavoritesListProps> = ({
  onSelectFavorite,
  onShowToast,
  onTriggerBurst,
}) => {
  const { flirtFavorites, removeFlirtFavorite, addFlirtFavorite } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FlirtCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Custom Line Form state
  const [customText, setCustomText] = useState('');
  const [customCategory, setCustomCategory] = useState<Exclude<FlirtCategory, 'all'>>('romantic');
  const [customEmoji, setCustomEmoji] = useState('💕');
  const [customNote, setCustomNote] = useState('');

  // Filter and search favorites
  const filteredFavorites = useMemo(() => {
    return flirtFavorites.filter((fav) => {
      const matchesCategory =
        selectedCategory === 'all' || fav.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        fav.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fav.customNote && fav.customNote.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [flirtFavorites, selectedCategory, searchQuery]);

  const handleCopy = async (fav: FlirtFavorite, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(fav.text);
      setCopiedId(fav.id);
      onShowToast('Copied to clipboard 💕');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Could not access clipboard');
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFlirtFavorite(id);
    onShowToast('Removed from favorites');
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customText.trim();
    if (!trimmed) return;

    const customLine: FlirtLine = {
      id: `custom-${Date.now()}`,
      text: trimmed,
      category: customCategory,
      emoji: customEmoji,
      tag: 'My Custom Note',
    };

    addFlirtFavorite(customLine, customNote.trim() || undefined);
    onTriggerBurst();
    onShowToast('Saved your custom flirty line 💕');

    // Reset form
    setCustomText('');
    setCustomNote('');
    setIsAddingCustom(false);
  };

  const EMOJI_OPTIONS = ['💕', '🌹', '😉', '🔥', '🧸', '✨', '💋', '🍯', '🌙', '🧀'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Bar: Search, Category Filter, and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AAA4B8]" />
          <input
            type="text"
            placeholder="Search saved favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-sm text-[#EAE6F2] placeholder-[#AAA4B8]/60 focus:outline-none focus:border-[#B8A4D8]/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Add Custom Line Button */}
        <button
          onClick={() => setIsAddingCustom(true)}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#B8A4D8]/15 hover:bg-[#B8A4D8]/25 border border-[#B8A4D8]/30 text-[#B8A4D8] text-xs font-light flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Line</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {FLIRT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? flirtFavorites.length
              : flirtFavorites.filter((f) => f.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[34px] px-3 py-1 rounded-full text-xs font-light whitespace-nowrap flex items-center gap-1.5 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#B8A4D8]/20 border-[#B8A4D8]/50 text-[#EAE6F2] shadow-sm'
                  : 'bg-[#151520] border-[#262438] text-[#AAA4B8] hover:text-[#EAE6F2]'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-70 px-1 py-0.2 rounded-full bg-black/30 text-[#AAA4B8]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Custom Line Modal / Sheet */}
      {isAddingCustom && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#151520] border border-[#B8A4D8]/30 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-[#262438] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8A4D8]" />
              <h3 className="text-sm font-normal text-[#EAE6F2]">
                Create Your Own Flirty Line 💕
              </h3>
            </div>
            <button
              onClick={() => setIsAddingCustom(false)}
              className="text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveCustom} className="space-y-4">
            <div>
              <label className="text-xs text-[#AAA4B8] font-light block mb-1">
                Your Line or Message
              </label>
              <textarea
                required
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Write something sweet, funny, or cheeky..."
                className="w-full p-3 rounded-xl bg-[#101018] border border-[#262438] text-sm text-[#EAE6F2] placeholder-[#AAA4B8]/60 focus:outline-none focus:border-[#B8A4D8]/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#AAA4B8] font-light block mb-1">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) =>
                    setCustomCategory(e.target.value as Exclude<FlirtCategory, 'all'>)
                  }
                  className="w-full p-2.5 rounded-xl bg-[#101018] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]/50 cursor-pointer"
                >
                  <option value="romantic">Romantic 🌹</option>
                  <option value="teasing">Teasing 😉</option>
                  <option value="funny">Funny 😂</option>
                  <option value="caring">Caring 🧸</option>
                  <option value="cheesy">Cheesy 🧀</option>
                  <option value="spicy">Spicy 🔥</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#AAA4B8] font-light block mb-1">
                  Select Icon Emoji
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setCustomEmoji(emo)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all cursor-pointer ${
                        customEmoji === emo
                          ? 'border-[#B8A4D8]/60 bg-[#B8A4D8]/20 scale-110'
                          : 'border-[#262438] bg-[#101018] hover:bg-[#1B1A28]'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#AAA4B8] font-light block mb-1">
                Personal Note / Context (Optional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Sent on our anniversary date"
                className="w-full p-2.5 rounded-xl bg-[#101018] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8]/60 focus:outline-none focus:border-[#B8A4D8]/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="min-h-[38px] px-4 rounded-xl border border-[#262438] text-xs font-light text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#9680C8] to-[#7863A8] text-white text-xs font-medium shadow-md shadow-[#7863A8]/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Save Line 💕
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Favorites Grid / List */}
      {filteredFavorites.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#151520] border border-[#262438] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#B8A4D8]/10 border border-[#B8A4D8]/20 flex items-center justify-center text-[#B8A4D8] mx-auto">
            <Heart className="w-6 h-6 fill-[#B8A4D8]/20" />
          </div>
          <h3 className="text-sm font-normal text-[#EAE6F2]">
            {searchQuery
              ? 'No matching lines found'
              : flirtFavorites.length === 0
              ? 'No saved favorites yet'
              : 'No lines in this category'}
          </h3>
          <p className="text-xs text-[#AAA4B8] font-light max-w-sm mx-auto">
            {flirtFavorites.length === 0
              ? 'Click the heart 💕 icon on any card in the deck to save your favorite flirty lines here forever.'
              : 'Try clearing your search or picking another category filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFavorites.map((fav) => {
            const catMeta =
              FLIRT_CATEGORIES.find((c) => c.id === fav.category) || FLIRT_CATEGORIES[0];
            const isCopied = copiedId === fav.id;

            return (
              <div
                key={fav.id}
                onClick={() => onSelectFavorite(fav)}
                className="p-5 rounded-2xl bg-[#151520] border border-[#262438] hover:border-[#B8A4D8]/40 transition-all flex flex-col justify-between space-y-4 group cursor-pointer hover:shadow-lg hover:shadow-[#7863A8]/5 relative overflow-hidden"
              >
                {/* Category & Date Header */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-light border ${catMeta.badgeColor}`}
                  >
                    <span>{fav.emoji}</span>
                    <span>{catMeta.label}</span>
                  </span>

                  <span className="text-[10px] text-[#AAA4B8] font-light">
                    {new Date(fav.savedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Line Text */}
                <p className="text-sm font-light text-[#EAE6F2] leading-relaxed group-hover:text-white transition-colors">
                  “{fav.text}”
                </p>

                {/* Optional Note */}
                {fav.customNote && (
                  <p className="text-[11px] text-[#B8A4D8] font-light italic bg-[#1B1A28] px-2.5 py-1 rounded-lg border border-[#262438]">
                    Note: {fav.customNote}
                  </p>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between pt-2 border-t border-[#262438]">
                  <button
                    onClick={(e) => handleCopy(fav, e)}
                    className="min-h-[34px] px-3 py-1 rounded-lg bg-[#1B1A28] hover:bg-[#201F32] border border-[#262438] text-xs font-light text-[#EAE6F2] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isCopied ? (
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectFavorite(fav)}
                      title="View in main card"
                      className="min-h-[34px] px-2.5 rounded-lg text-xs font-light text-[#B8A4D8] hover:bg-[#B8A4D8]/10 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Open in Deck</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleRemove(fav.id, e)}
                      title="Remove from favorites"
                      className="min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center text-[#AAA4B8] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
