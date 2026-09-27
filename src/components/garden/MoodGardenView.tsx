/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Flower2,
  Sparkles,
  Heart,
  Calendar,
  Search,
  Trash2,
  Edit3,
  X,
  Plus,
  Check,
  Info,
  ChevronRight,
  Filter,
  Smile,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GardenEntry, GardenMoodType } from '../../types';

interface MoodConfig {
  id: GardenMoodType;
  label: string;
  emoji: string;
  flowerName: string;
  flowerIcon: string;
  color: string;
  glowClass: string;
  bgClass: string;
  description: string;
}

const MOOD_CONFIGS: Record<GardenMoodType, MoodConfig> = {
  happy: {
    id: 'happy',
    label: 'Happy',
    emoji: '🌸',
    flowerName: 'Lavender Blossom',
    flowerIcon: '🌸',
    color: '#E8A2D2',
    glowClass: 'shadow-[0_0_20px_rgba(232,162,210,0.3)] border-[#E8A2D2]/50',
    bgClass: 'bg-[#E8A2D2]/10',
    description: 'Radiating warmth, gentle joy, and soft sunlight.',
  },
  calm: {
    id: 'calm',
    label: 'Calm',
    emoji: '🌿',
    flowerName: 'Peaceful Lotus',
    flowerIcon: '🪷',
    color: '#98D8AA',
    glowClass: 'shadow-[0_0_20px_rgba(152,216,170,0.3)] border-[#98D8AA]/50',
    bgClass: 'bg-[#98D8AA]/10',
    description: 'Breathes softly in stillness, quietly centered.',
  },
  sad: {
    id: 'sad',
    label: 'Sad',
    emoji: '🌷',
    flowerName: 'Dewy Violet',
    flowerIcon: '🌷',
    color: '#89CFF0',
    glowClass: 'shadow-[0_0_20px_rgba(137,207,240,0.3)] border-[#89CFF0]/50',
    bgClass: 'bg-[#89CFF0]/10',
    description: 'Holds soft raindrops with gentle, quiet strength.',
  },
  anxious: {
    id: 'anxious',
    label: 'Anxious',
    emoji: '🌱',
    flowerName: 'Gentle Sprout',
    flowerIcon: '🌱',
    color: '#B4E4FF',
    glowClass: 'shadow-[0_0_20px_rgba(180,228,255,0.3)] border-[#B4E4FF]/50',
    bgClass: 'bg-[#B4E4FF]/10',
    description: 'Growing steadily with comforting resilience.',
  },
  tired: {
    id: 'tired',
    label: 'Tired',
    emoji: '🌙',
    flowerName: 'Night Orchid',
    flowerIcon: '🌺',
    color: '#B8A4D8',
    glowClass: 'shadow-[0_0_20px_rgba(184,164,216,0.3)] border-[#B8A4D8]/50',
    bgClass: 'bg-[#B8A4D8]/10',
    description: 'Resting softly under a blanket of starlight.',
  },
  excited: {
    id: 'excited',
    label: 'Excited',
    emoji: '✨',
    flowerName: 'Sparkle Sunflower',
    flowerIcon: '🌻',
    color: '#FDF7C3',
    glowClass: 'shadow-[0_0_20px_rgba(253,247,195,0.3)] border-[#FDF7C3]/50',
    bgClass: 'bg-[#FDF7C3]/10',
    description: 'Overflowing with bright wonder and playful energy.',
  },
};

export const MoodGardenView: React.FC = () => {
  const { gardenEntries, addGardenEntry, updateGardenEntry, deleteGardenEntry } = useApp();

  const [selectedMood, setSelectedMood] = useState<GardenMoodType>('happy');
  const [dailyNote, setDailyNote] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMood, setFilterMood] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Flower Details Lightbox Modal
  const [activeFlower, setActiveFlower] = useState<GardenEntry | null>(null);

  // Edit Modal State
  const [editingEntry, setEditingEntry] = useState<GardenEntry | null>(null);
  const [editMood, setEditMood] = useState<GardenMoodType>('happy');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');

  // Delete Confirm State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Success Notice
  const [plantSuccessMsg, setPlantSuccessMsg] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = useMemo(() => {
    return gardenEntries.some((e) => e.date === todayStr);
  }, [gardenEntries, todayStr]);

  // Filtered garden entries
  const filteredEntries = useMemo(() => {
    return gardenEntries.filter((e) => {
      if (filterMood !== 'All' && e.mood !== filterMood) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNote = e.note && e.note.toLowerCase().includes(q);
        const matchesFlower = e.flowerName.toLowerCase().includes(q);
        const matchesDate = e.date.toLowerCase().includes(q);
        if (!matchesNote && !matchesFlower && !matchesDate) return false;
      }
      return true;
    });
  }, [gardenEntries, filterMood, searchQuery]);

  const handlePlantFlower = (e: React.FormEvent) => {
    e.preventDefault();
    const config = MOOD_CONFIGS[selectedMood];

    let displayDate = checkInDate;
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(checkInDate)) {
        const [y, m, d] = checkInDate.split('-');
        const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        displayDate = dt.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      displayDate = checkInDate;
    }

    addGardenEntry({
      date: checkInDate,
      mood: selectedMood,
      emoji: config.emoji,
      flowerName: config.flowerName,
      note: dailyNote.trim() || undefined,
    });

    setDailyNote('');
    setPlantSuccessMsg(`Planted a ${config.flowerName} in your garden! 🌸`);
    setTimeout(() => setPlantSuccessMsg(null), 4000);
  };

  const handleOpenEdit = (entry: GardenEntry) => {
    setEditingEntry(entry);
    setEditMood(entry.mood);
    setEditNote(entry.note || '');
    setEditDate(entry.date);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    const config = MOOD_CONFIGS[editMood];
    updateGardenEntry(editingEntry.id, {
      mood: editMood,
      emoji: config.emoji,
      flowerName: config.flowerName,
      note: editNote.trim() || undefined,
      date: editDate,
    });

    setEditingEntry(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300 select-none">
      {/* 1. Header & Garden Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#151520] via-[#12111B] to-[#151520] border border-[#2E2942] p-6 sm:p-8 overflow-hidden shadow-xl shadow-[#7863A8]/10">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B8A4D8]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#7863A8]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-light text-[#B8A4D8] tracking-wider uppercase">
              <Flower2 className="w-4 h-4 text-[#B8A4D8]" />
              <span>Personal Virtual Sanctuary</span>
              <span>·</span>
              <span>GENTLE CHECK-IN</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light text-[#EAE6F2] tracking-wide">
              Mood Garden 🌸🌿
            </h1>
            <p className="text-sm font-light text-[#AAA4B8] leading-relaxed">
              Check in with your heart each day. Every feeling blooms into a unique, glowing flower in your garden — held forever with zero pressure, zero streaks, and gentle love.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1B1A28]/80 border border-[#2E2942] text-center shrink-0 space-y-1">
            <span className="text-3xl">🌸</span>
            <div className="text-lg font-light text-[#EAE6F2]">{gardenEntries.length} Flowers</div>
            <p className="text-[11px] text-[#AAA4B8] font-light">Bloomed in your garden</p>
          </div>
        </div>
      </div>

      {/* 2. Daily Mood Check-In Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#12111B] border border-[#2E2942] shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2E2942]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8A4D8]" />
            <h2 className="text-base font-normal text-[#EAE6F2]">
              How is your heart feeling today?
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#AAA4B8] font-light">
            <Calendar className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="bg-[#151520] border border-[#2E2942] rounded-xl px-2.5 py-1 text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
            />
          </div>
        </div>

        {plantSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-[#B8A4D8]/15 border border-[#B8A4D8]/40 text-[#EAE6F2] text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-[#B8A4D8]" />
            <span>{plantSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlantFlower} className="space-y-6">
          {/* Mood Selection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(Object.keys(MOOD_CONFIGS) as GardenMoodType[]).map((key) => {
              const cfg = MOOD_CONFIGS[key];
              const isSelected = selectedMood === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMood(key)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden ${
                    isSelected
                      ? `${cfg.glowClass} ${cfg.bgClass} scale-[1.02]`
                      : 'bg-[#151520] border-[#262438] hover:border-[#3B3654] hover:bg-[#1B1A28]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{cfg.flowerIcon}</span>
                    <span className="text-xs font-light text-[#AAA4B8]">{cfg.emoji}</span>
                  </div>
                  <div>
                    <div className="text-xs font-normal text-[#EAE6F2]">{cfg.label}</div>
                    <div className="text-[10px] text-[#AAA4B8] font-light truncate mt-0.5">
                      {cfg.flowerName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Mood Preview & Optional Note */}
          <div className="p-4 rounded-2xl bg-[#151520] border border-[#262438] space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#B8A4D8] font-light">
              <span>Planting:</span>
              <span className="font-medium text-[#EAE6F2]">
                {MOOD_CONFIGS[selectedMood].flowerName}
              </span>
              <span>({MOOD_CONFIGS[selectedMood].description})</span>
            </div>

            <textarea
              rows={2}
              placeholder="Write a gentle thought or reflection for today (optional)..."
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101018] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8] focus:outline-none focus:border-[#B8A4D8] resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-[#AAA4B8] font-light">
              <Info className="w-3.5 h-3.5 text-[#B8A4D8]" />
              <span>No streaks or penalties. Plant a flower whenever you wish.</span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#B8A4D8] text-[#08080C] hover:bg-[#c7b6e4] transition-all text-xs font-medium flex items-center gap-2 shadow-lg shadow-[#B8A4D8]/20 cursor-pointer"
            >
              <Flower2 className="w-4 h-4 text-[#08080C]" />
              <span>Plant Flower</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. The Garden Canvas Grid View */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-normal text-[#EAE6F2]">Your Virtual Garden</h2>
            <span className="text-xs text-[#AAA4B8] font-light">
              ({filteredEntries.length} flowers bloomed)
            </span>
          </div>

          {/* Search & Mood Filter Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#AAA4B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reflections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8] focus:outline-none focus:border-[#B8A4D8]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {['All', 'happy', 'calm', 'sad', 'anxious', 'tired', 'excited'].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMood(m)}
                  className={`px-3 py-1 rounded-xl text-xs font-light capitalize cursor-pointer transition-colors ${
                    filterMood === m
                      ? 'bg-[#B8A4D8] text-[#08080C] font-medium'
                      : 'bg-[#151520] text-[#AAA4B8] hover:text-[#EAE6F2] border border-[#262438]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Garden Canvas Field */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#12111B] via-[#0F0E17] to-[#12111B] border border-[#2E2942] p-6 sm:p-8 min-h-[360px] overflow-hidden shadow-2xl">
          {/* Subtle Background Stars & Grass Mounds */}
          <div className="absolute inset-0 bg-[radial-gradient(#B8A4D8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {filteredEntries.length === 0 ? (
            <div className="text-center py-20 space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-2xl mx-auto">
                🌱
              </div>
              <h3 className="text-sm font-normal text-[#EAE6F2]">No flowers in this garden plot yet</h3>
              <p className="text-xs text-[#AAA4B8] font-light max-w-sm mx-auto">
                Check in above to plant your very first flower. Each entry grows into a unique glowing bloom!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 relative z-10">
              {filteredEntries.map((entry) => {
                const cfg = MOOD_CONFIGS[entry.mood] || MOOD_CONFIGS.happy;
                return (
                  <div
                    key={entry.id}
                    onClick={() => setActiveFlower(entry)}
                    className={`p-4 rounded-3xl border ${cfg.glowClass} bg-[#151520]/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center space-y-2 group shadow-md`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-2xl group-hover:animate-bounce shadow-inner">
                      {cfg.flowerIcon}
                    </div>

                    <div className="space-y-0.5 w-full">
                      <div className="text-xs font-normal text-[#EAE6F2] truncate">
                        {entry.flowerName}
                      </div>
                      <div className="text-[10px] text-[#AAA4B8] font-light truncate">
                        {entry.date}
                      </div>
                    </div>

                    {entry.note && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B1A28] border border-[#2E2942] text-[#B8A4D8] font-light truncate max-w-full">
                        "{entry.note}"
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Flower Reflection Modal */}
      {activeFlower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <div className="flex items-center gap-2">
                <Flower2 className="w-4 h-4 text-[#B8A4D8]" />
                <span className="text-xs uppercase tracking-wider text-[#B8A4D8] font-light">
                  Flower Reflection
                </span>
              </div>
              <button
                onClick={() => setActiveFlower(null)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-2">
              <div className="w-16 h-16 rounded-2xl bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-3xl mx-auto shadow-inner">
                {MOOD_CONFIGS[activeFlower.mood]?.flowerIcon || '🌸'}
              </div>

              <div>
                <h3 className="text-base font-normal text-[#EAE6F2]">
                  {activeFlower.flowerName}
                </h3>
                <p className="text-xs text-[#B8A4D8] font-light capitalize mt-0.5">
                  Feeling {activeFlower.mood} {activeFlower.emoji} · {activeFlower.date}
                </p>
              </div>

              {activeFlower.note ? (
                <div className="p-4 rounded-2xl bg-[#151520] border border-[#262438] text-xs font-light text-[#EAE6F2] leading-relaxed text-left whitespace-pre-line">
                  "{activeFlower.note}"
                </div>
              ) : (
                <p className="text-xs text-[#AAA4B8] font-light italic">
                  No note written for this bloom.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  handleOpenEdit(activeFlower);
                  setActiveFlower(null);
                }}
                className="px-3 py-2 rounded-xl bg-[#1B1A28] hover:bg-[#232136] text-[#AAA4B8] hover:text-[#EAE6F2] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#B8A4D8]" />
                <span>Edit Note</span>
              </button>

              {confirmDeleteId === activeFlower.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      deleteGardenEntry(activeFlower.id);
                      setActiveFlower(null);
                      setConfirmDeleteId(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-900/60 border border-rose-500/50 text-rose-200 cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(activeFlower.id)}
                  className="px-3 py-2 rounded-xl text-[#AAA4B8] hover:text-rose-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Mood Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEdit}
            className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <h3 className="text-sm font-normal text-[#EAE6F2]">Edit Garden Entry</h3>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1.5">Mood</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(MOOD_CONFIGS) as GardenMoodType[]).map((key) => {
                    const cfg = MOOD_CONFIGS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditMood(key)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          editMood === key
                            ? 'bg-[#B8A4D8]/20 border-[#B8A4D8] text-[#EAE6F2]'
                            : 'bg-[#151520] border-[#262438] text-[#AAA4B8]'
                        }`}
                      >
                        <span className="mr-1">{cfg.flowerIcon}</span>
                        <span className="capitalize">{key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Reflection Note</label>
                <textarea
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
