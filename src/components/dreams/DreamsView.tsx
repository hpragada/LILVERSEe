/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Calendar,
  X,
  Edit3,
  Trash2,
  Filter,
  Check,
  Compass,
  MapPin,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  Award,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Dream } from '../../types';

export type WishlistCategory =
  | 'Places to Visit'
  | 'Things to Buy'
  | 'Skills to Learn'
  | 'Experiences'
  | 'Personal Goals'
  | 'Other';

export type WishlistPriority = 'High' | 'Medium' | 'Low';
export type WishlistStatus = 'Want to Do' | 'In Progress' | 'Completed';

const WISHLIST_CATEGORIES: {
  id: WishlistCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'Places to Visit', label: 'Places to Visit', icon: MapPin },
  { id: 'Things to Buy', label: 'Things to Buy', icon: ShoppingBag },
  { id: 'Skills to Learn', label: 'Skills to Learn', icon: GraduationCap },
  { id: 'Experiences', label: 'Experiences', icon: Compass },
  { id: 'Personal Goals', label: 'Personal Goals', icon: Award },
  { id: 'Other', label: 'Other', icon: Sparkles },
];

/**
 * Safely maps existing legacy Dream items into normalized Wishlist items.
 */
function normalizeWishlistItem(dream: Dream): {
  id: string;
  title: string;
  description: string;
  category: WishlistCategory;
  priority: WishlistPriority;
  status: WishlistStatus;
  progressPercent: number;
  targetDate?: string;
  imageUrl?: string;
  rawDream: Dream;
} {
  // Category mapping
  let category: WishlistCategory = 'Other';
  const c = String(dream.category || '').toLowerCase();
  if (c.includes('travel') || c.includes('place')) category = 'Places to Visit';
  else if (c.includes('buy') || c.includes('shopping')) category = 'Things to Buy';
  else if (c.includes('learn') || c.includes('skill')) category = 'Skills to Learn';
  else if (c.includes('experience')) category = 'Experiences';
  else if (c.includes('personal') || c.includes('goal')) category = 'Personal Goals';
  else if (c.includes('career')) category = 'Skills to Learn';

  // Status mapping
  let status: WishlistStatus = 'Want to Do';
  const s = String(dream.status || '').toLowerCase();
  if (s === 'completed') status = 'Completed';
  else if (s === 'in progress') status = 'In Progress';
  else if (dream.progressPercent && dream.progressPercent > 0) status = 'In Progress';

  // Priority mapping
  let priority: WishlistPriority = 'Medium';
  if ((dream as any).priority) {
    priority = (dream as any).priority;
  } else if (dream.pinnedToHome) {
    priority = 'High';
  }

  return {
    id: dream.id,
    title: dream.title || 'Untitled Wishlist Item',
    description: dream.description || '',
    category,
    priority,
    status,
    progressPercent: typeof dream.progressPercent === 'number' ? dream.progressPercent : 0,
    targetDate: dream.targetDate || dream.timeframe,
    imageUrl: dream.coverImage || (dream as any).imageUrl,
    rawDream: dream,
  };
}

export const DreamsView: React.FC = () => {
  const { dreams, addDream, updateDream, deleteDream } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<WishlistCategory>('Places to Visit');
  const [formPriority, setFormPriority] = useState<WishlistPriority>('Medium');
  const [formStatus, setFormStatus] = useState<WishlistStatus>('Want to Do');
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Delete Confirm State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Map and filter wishlist items
  const wishlistItems = useMemo(() => {
    return dreams.map(normalizeWishlistItem);
  }, [dreams]);

  const filteredItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [wishlistItems, selectedCategory, selectedStatus, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Places to Visit');
    setFormPriority('Medium');
    setFormStatus('Want to Do');
    setFormProgress(0);
    setFormTargetDate('');
    setFormImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ReturnType<typeof normalizeWishlistItem>) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormCategory(item.category);
    setFormPriority(item.priority);
    setFormStatus(item.status);
    setFormProgress(item.progressPercent);
    setFormTargetDate(item.targetDate || '');
    setFormImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingId) {
      updateDream(editingId, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory as any,
        progressPercent: formProgress,
        status: formStatus as any,
        targetDate: formTargetDate.trim() || undefined,
        timeframe: formTargetDate.trim() || 'Someday',
        coverImage: formImageUrl.trim() || undefined,
        ...( { priority: formPriority } as any ),
      });
    } else {
      addDream({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory as any,
        progressPercent: formProgress,
        status: formStatus as any,
        targetDate: formTargetDate.trim() || undefined,
        timeframe: formTargetDate.trim() || 'Someday',
        coverImage: formImageUrl.trim() || undefined,
        ...( { priority: formPriority } as any ),
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickStatusToggle = (item: ReturnType<typeof normalizeWishlistItem>) => {
    let nextStatus: WishlistStatus = 'In Progress';
    let nextProgress = 50;

    if (item.status === 'Want to Do') {
      nextStatus = 'In Progress';
      nextProgress = 50;
    } else if (item.status === 'In Progress') {
      nextStatus = 'Completed';
      nextProgress = 100;
    } else {
      nextStatus = 'Want to Do';
      nextProgress = 0;
    }

    updateDream(item.id, {
      status: nextStatus as any,
      progressPercent: nextProgress,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5 animate-in fade-in duration-300 select-none">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#0E0C18]/90 border border-[#2E2942]/60 shadow-lg backdrop-blur-md">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#C084FC]/15 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-base sm:text-lg font-normal text-[#F3EEFB] tracking-tight">
              Little Wishlist
            </h1>
            <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />
          </div>
          <p className="text-xs text-[#81789A] font-light">
            Places to visit, things to buy, personal dreams, and gentle life goals.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B8A4D8] to-[#C084FC] text-[#06050B] text-xs font-medium flex items-center gap-1.5 shadow-sm hover:scale-102 active:scale-95 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Wishlist Goal</span>
        </button>
      </div>

      {/* 2. Filters & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0E0C18]/80 border border-[#2E2942]/60 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 sm:w-48">
          <Search className="w-3.5 h-3.5 text-[#81789A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded-xl bg-[#141220] border border-[#2E2942]/60 text-xs text-[#F3EEFB] placeholder-[#81789A] focus:outline-none focus:border-[#C084FC]/50"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#141220] border border-[#2E2942]/60 rounded-xl px-2.5 py-1 text-xs text-[#F3EEFB] focus:outline-none focus:border-[#C084FC]/50 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {WISHLIST_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status Filter buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['All', 'Want to Do', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-gradient-to-r from-[#B8A4D8] to-[#C084FC] text-[#06050B] font-medium shadow-sm'
                    : 'bg-[#141220] text-[#B4ACCA] hover:text-[#F3EEFB] border border-[#2E2942]/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Wishlist Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0E0C18]/60 border border-[#2E2942]/60 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#1A162B] border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC] mx-auto">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-normal text-[#F3EEFB]">No wishlist goals found</h3>
          <p className="text-xs text-[#81789A] font-light max-w-sm mx-auto">
            There are no goals matching your current filter. Tap "Add Wishlist Goal" to save one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const CatIcon =
              WISHLIST_CATEGORIES.find((c) => c.id === item.category)?.icon || Sparkles;

            const isCompleted = item.status === 'Completed';

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#0E0C18]/90 border border-[#2E2942]/60 hover:border-[#C084FC]/40 transition-all duration-300 space-y-3 shadow-sm flex flex-col justify-between group backdrop-blur-md"
              >
                <div className="space-y-2.5">
                  {/* Optional Image */}
                  {item.imageUrl && (
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-[#161324] border border-white/10">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Top Bar: Category & Priority */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-light text-[#C084FC] flex items-center gap-1.5">
                      <CatIcon className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>{item.category}</span>
                    </span>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full border font-light ${
                        item.priority === 'High'
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                          : item.priority === 'Medium'
                          ? 'bg-[#C084FC]/15 border-[#C084FC]/30 text-[#C084FC]'
                          : 'bg-[#141220] border-[#2E2942] text-[#81789A]'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-0.5">
                    <h3
                      className={`text-sm font-normal tracking-tight ${
                        isCompleted
                          ? 'text-[#81789A] line-through'
                          : 'text-[#F3EEFB]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-[#B4ACCA] font-light line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2.5 border-t border-[#2E2942]/40">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#81789A] font-light">
                      <span>Progress</span>
                      <span className="text-[#F3EEFB] font-mono">{item.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#161324] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#B8A4D8] to-[#C084FC]'
                        }`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Date & Actions */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div className="flex items-center gap-1 text-[#81789A] text-[10px] font-light">
                      <Calendar className="w-3 h-3 text-[#B8A4D8]" />
                      <span>{item.targetDate || 'Someday'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Status Toggle Button */}
                      <button
                        onClick={() => handleQuickStatusToggle(item)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-light border cursor-pointer transition-colors ${
                          isCompleted
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                            : item.status === 'In Progress'
                            ? 'bg-[#C084FC]/15 border-[#C084FC]/30 text-[#C084FC]'
                            : 'bg-[#141220] border-[#2E2942] text-[#81789A]'
                        }`}
                      >
                        {item.status}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded-lg text-[#81789A] hover:text-[#F3EEFB] hover:bg-[#161324] transition-colors cursor-pointer"
                        title="Edit goal"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C084FC]" />
                      </button>

                      {/* Delete Button */}
                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              deleteDream(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-200 text-[10px] cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[10px] text-[#81789A] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1 rounded-lg text-[#81789A] hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveForm}
            className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#B8A4D8]" />
                <h3 className="text-sm font-normal text-[#EAE6F2]">
                  {editingId ? 'Edit Wishlist Goal' : 'Add Wishlist Goal'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Travel to Kyoto, Learn Piano..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Why is this meaningful to you?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as WishlistCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  >
                    {WISHLIST_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as WishlistPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as WishlistStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  >
                    <option value="Want to Do">Want to Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formProgress}
                    onChange={(e) => setFormProgress(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Target Date / Season</label>
                <input
                  type="text"
                  placeholder="e.g. Autumn 2026, Dec 2026..."
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Optional Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
