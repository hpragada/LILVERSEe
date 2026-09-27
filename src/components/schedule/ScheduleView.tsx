import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Check,
  Bell,
  Sparkles,
  AlertCircle,
  X,
  ChevronRight,
  Coffee,
  BookOpen,
  Briefcase,
  Heart,
  Feather,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DayOfWeek, ScheduleItem } from '../../types';

const DAYS_OF_WEEK: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' },
];

const CATEGORIES: {
  id: NonNullable<ScheduleItem['category']>;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'routine', label: 'Routine', color: 'text-sky-300 border-sky-500/30 bg-sky-500/10', icon: Coffee },
  { id: 'wellness', label: 'Wellness', color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10', icon: Heart },
  { id: 'ritual', label: 'Ritual', color: 'text-pink-300 border-pink-500/30 bg-pink-500/10', icon: Sparkles },
  { id: 'study', label: 'Study', color: 'text-zinc-300 border-zinc-500/30 bg-zinc-500/10', icon: BookOpen },
  { id: 'work', label: 'Work', color: 'text-[#C0C0C0] border-[#292929] bg-[#0D0D0D]', icon: Briefcase },
  { id: 'personal', label: 'Personal', color: 'text-[#B8A4D8] border-[#B8A4D8]/30 bg-[#B8A4D8]/10', icon: Feather },
];

// Determine today's day of week
function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, ...
  const map: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return map[dayIndex] || 'monday';
}

export const ScheduleView: React.FC = () => {
  const {
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleScheduleCompletedToday,
    userProfile,
  } = useApp();

  const todayDay = useMemo(() => getTodayDayOfWeek(), []);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDay);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form Fields
  const [formDay, setFormDay] = useState<DayOfWeek>(todayDay);
  const [formTitle, setFormTitle] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00 AM');
  const [formEndTime, setFormEndTime] = useState('10:00 AM');
  const [formCategory, setFormCategory] = useState<ScheduleItem['category']>('routine');
  const [formNotes, setFormNotes] = useState('');
  const [formHasReminder, setFormHasReminder] = useState(true);
  const [formReminderLead, setFormReminderLead] = useState<number>(10);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deletingItem, setDeletingItem] = useState<ScheduleItem | null>(null);

  // Today's date string for completion check
  const todayDateStr = new Date().toISOString().slice(0, 10);

  // Filter items for selected day, sorted chronologically
  const dayItems = useMemo(() => {
    return schedules
      .filter((s) => s.day === selectedDay)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [schedules, selectedDay]);

  // Counts per day
  const countsByDay = useMemo(() => {
    const counts: Record<DayOfWeek, number> = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };
    schedules.forEach((s) => {
      if (counts[s.day] !== undefined) {
        counts[s.day]++;
      }
    });
    return counts;
  }, [schedules]);

  // Open modal for new entry
  const handleOpenAdd = (dayToSet?: DayOfWeek) => {
    setEditingItem(null);
    setFormDay(dayToSet || selectedDay);
    setFormTitle('');
    setFormStartTime('09:00 AM');
    setFormEndTime('10:00 AM');
    setFormCategory('routine');
    setFormNotes('');
    setFormHasReminder(true);
    setFormReminderLead(10);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormDay(item.day);
    setFormTitle(item.title);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime || '');
    setFormCategory(item.category || 'routine');
    setFormNotes(item.notes || '');
    setFormHasReminder(Boolean(item.hasReminder));
    setFormReminderLead(item.reminderMinutesBefore ?? 10);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save entry
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please provide a title for this schedule entry.');
      return;
    }
    if (!formStartTime.trim()) {
      setFormError('Please enter a start time.');
      return;
    }

    if (editingItem) {
      updateSchedule(editingItem.id, {
        day: formDay,
        title: formTitle.trim(),
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim() || undefined,
        category: formCategory,
        notes: formNotes.trim() || undefined,
        hasReminder: formHasReminder,
        reminderMinutesBefore: formHasReminder ? formReminderLead : undefined,
      });
    } else {
      addSchedule({
        day: formDay,
        title: formTitle.trim(),
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim() || undefined,
        category: formCategory,
        notes: formNotes.trim() || undefined,
        hasReminder: formHasReminder,
        reminderMinutesBefore: formHasReminder ? formReminderLead : undefined,
        completedDates: [],
      });
    }

    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deletingItem) {
      deleteSchedule(deletingItem.id);
      setDeletingItem(null);
    }
  };

  const completedTodayCount = dayItems.filter((i) =>
    (i.completedDates || []).includes(todayDateStr)
  ).length;

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#0E0C18]/90 border border-[#2E2942]/60 shadow-lg backdrop-blur-md">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#C084FC]/15 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-base sm:text-lg font-normal text-[#F3EEFB] tracking-tight">
              Weekly Schedule
            </h1>
            <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />
          </div>
          <p className="text-xs text-[#81789A] font-light">
            Plan your daily rhythm anchors from Monday through Sunday.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* View toggle (Day vs Week) */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#141220] border border-[#2E2942]/60">
            <button
              onClick={() => setViewMode('day')}
              title="Daily Focused View"
              className={`px-2.5 py-1 rounded-lg text-xs font-light flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-[#1E1A2E] text-[#F3EEFB] shadow-sm'
                  : 'text-[#81789A] hover:text-[#F3EEFB]'
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#C084FC]" />
              <span className="hidden sm:inline">Day</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              title="Full Week Overview"
              className={`px-2.5 py-1 rounded-lg text-xs font-light flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-[#1E1A2E] text-[#F3EEFB] shadow-sm'
                  : 'text-[#81789A] hover:text-[#F3EEFB]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#C084FC]" />
              <span className="hidden sm:inline">Week</span>
            </button>
          </div>

          {/* Add New Schedule Button */}
          <button
            onClick={() => handleOpenAdd()}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B8A4D8] to-[#C084FC] text-[#06050B] text-xs font-medium flex items-center gap-1.5 shadow-sm hover:scale-102 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Anchor</span>
          </button>
        </div>
      </div>

      {/* Weekday Selector Bar (Monday - Sunday) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 p-1.5 rounded-2xl bg-[#0E0C18]/90 border border-[#2E2942]/60 backdrop-blur-md">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const isToday = todayDay === day.id;
          const count = countsByDay[day.id];

          return (
            <button
              key={day.id}
              onClick={() => {
                setSelectedDay(day.id);
                if (viewMode === 'week') setViewMode('day');
              }}
              className={`p-1.5 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer min-h-[52px] sm:min-h-[60px] ${
                isSelected
                  ? 'bg-[#181427] border-[#C084FC]/50 text-[#F3EEFB] shadow-sm scale-[1.02]'
                  : 'bg-[#12101D]/60 border-transparent text-[#81789A] hover:text-[#F3EEFB] hover:bg-[#181427]/60'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-normal tracking-tight">
                  {day.short}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" title="Today" />
                )}
              </div>

              <div className="mt-0.5 flex items-center gap-1">
                <span
                  className={`text-[9px] px-1.5 rounded-full font-mono ${
                    isSelected
                      ? 'bg-[#C084FC]/20 text-[#C084FC]'
                      : 'bg-[#161324] text-[#81789A]'
                  }`}
                >
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: DAY FOCUSED VIEW */}
      {viewMode === 'day' && (
        <section className="space-y-3">
          {/* Day Status Header */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0E0C18]/80 border border-[#2E2942]/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C084FC]" />
              <h2 className="text-xs font-medium text-[#F3EEFB] uppercase tracking-wider capitalize">
                {selectedDay}’s Flow
              </h2>
              {selectedDay === todayDay && (
                <span className="px-2 py-0.2 rounded-full bg-[#C084FC]/15 border border-[#C084FC]/30 text-[#C084FC] text-[10px] font-medium">
                  Today
                </span>
              )}
            </div>

            {selectedDay === todayDay && dayItems.length > 0 && (
              <span className="text-xs text-[#81789A] font-light">
                {completedTodayCount} of {dayItems.length} completed
              </span>
            )}
          </div>

          {/* List of Schedule Items for Selected Day */}
          <div className="space-y-2">
            {dayItems.map((item) => {
              const isCompletedToday = (item.completedDates || []).includes(todayDateStr);
              const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[0];
              const CategoryIcon = catObj.icon;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCompletedToday
                      ? 'bg-[#090810]/60 border-[#262438]/50 text-[#81789A]'
                      : 'bg-[#0E0C18]/90 border-[#2E2942]/60 text-[#F3EEFB] hover:border-[#C084FC]/30 backdrop-blur-md shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Complete toggle & Content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox button */}
                      <button
                        onClick={() => toggleScheduleCompletedToday(item.id)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isCompletedToday
                            ? 'bg-[#C084FC] border-[#C084FC] text-[#06050B]'
                            : 'border-[#3B3654] bg-[#161324] text-transparent hover:border-[#C084FC]'
                        }`}
                        title={isCompletedToday ? 'Mark incomplete for today' : 'Mark completed today'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <div className="space-y-1 flex-1 min-w-0">
                        {/* Meta tags: Time, Category, Reminder */}
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          {/* Time */}
                          <div className="flex items-center gap-1 font-mono text-[10px] text-[#B8A4D8] bg-[#141220] px-2 py-0.5 rounded-md border border-[#2E2942]/60">
                            <Clock className="w-2.5 h-2.5 text-[#C084FC]" />
                            <span>{item.startTime}</span>
                            {item.endTime && (
                              <>
                                <span className="text-[#81789A]">–</span>
                                <span>{item.endTime}</span>
                              </>
                            )}
                          </div>

                          {/* Category Tag */}
                          <div className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-md border capitalize font-light ${catObj.color}`}>
                            <CategoryIcon className="w-2.5 h-2.5" />
                            <span>{catObj.label}</span>
                          </div>

                          {/* Reminder Indicator */}
                          {item.hasReminder && (
                            <div className="flex items-center gap-1 text-[9px] text-[#C084FC] bg-[#C084FC]/10 border border-[#C084FC]/20 px-1.5 py-0.5 rounded-md">
                              <Bell className="w-2.5 h-2.5" />
                              <span>{item.reminderMinutesBefore ?? 10}m</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3
                          className={`text-xs sm:text-sm font-normal tracking-tight transition-all ${
                            isCompletedToday ? 'line-through text-[#81789A]' : 'text-[#F3EEFB]'
                          }`}
                        >
                          {item.title}
                        </h3>

                        {/* Notes */}
                        {item.notes && (
                          <p className="text-xs font-light text-[#81789A] leading-relaxed pt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded-lg text-[#81789A] hover:text-[#F3EEFB] hover:bg-[#161324] transition-colors cursor-pointer"
                        title="Edit schedule entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1 rounded-lg text-[#81789A] hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                        title="Delete schedule entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state for the day */}
            {dayItems.length === 0 && (
              <div className="py-12 px-4 rounded-2xl bg-[#151520] border border-dashed border-[#262438] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#101018] border border-[#262438] mx-auto flex items-center justify-center text-[#B8A4D8]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-normal text-[#EAE6F2] capitalize">
                    No scheduled items for {selectedDay}
                  </h3>
                  <p className="text-xs font-light text-[#AAA4B8] mt-1 max-w-sm mx-auto">
                    Enjoy quiet relaxation, or add a gentle daily anchor like morning tea, study flow, or peaceful stretching.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdd(selectedDay)}
                  className="px-4 py-2 rounded-xl bg-[#101018] hover:bg-[#1B1A28] border border-[#262438] text-xs font-light text-[#B8A4D8] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="capitalize">Add Routine for {selectedDay}</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* VIEW MODE 2: WEEKLY OVERVIEW (ALL 7 DAYS) */}
      {viewMode === 'week' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const itemsForDay = schedules
                .filter((s) => s.day === day.id)
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
              const isToday = todayDay === day.id;

              return (
                <div
                  key={day.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isToday
                      ? 'bg-[#151520] border-[#3B3654] shadow-sm shadow-[#7863A8]/10'
                      : 'bg-[#151520] border-[#262438]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#262438]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#EAE6F2] capitalize">
                        {day.label}
                      </span>
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#B8A4D8]/20 text-[#B8A4D8] font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleOpenAdd(day.id)}
                      className="p-1 rounded-lg text-[#AAA4B8] hover:text-[#B8A4D8] hover:bg-[#101018] transition-colors"
                      title={`Add entry for ${day.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {itemsForDay.length > 0 ? (
                    <div className="space-y-2">
                      {itemsForDay.map((item) => {
                        const isDone = (item.completedDates || []).includes(todayDateStr);
                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                              isDone
                                ? 'bg-[#101018] border-[#202026] text-[#AAA4B8]'
                                : 'bg-[#101018] border-[#262438] text-[#EAE6F2]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[11px] font-mono text-[#B8A4D8] shrink-0">
                                {item.startTime}
                              </span>
                              <span className={`truncate font-light ${isDone ? 'line-through text-[#AAA4B8]' : ''}`}>
                                {item.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1 text-[#AAA4B8] hover:text-[#EAE6F2]"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeletingItem(item)}
                                className="p-1 text-[#AAA4B8] hover:text-rose-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] font-light text-[#AAA4B8] italic py-2 text-center">
                      No anchors scheduled.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#101018] border border-[#262438] rounded-2xl p-6 space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1B1A28] flex items-center justify-center text-[#B8A4D8]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-medium text-[#EAE6F2]">
                  {editingItem ? 'Edit Schedule Anchor' : 'New Schedule Anchor'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#AAA4B8] hover:text-[#EAE6F2] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-3.5">
              {/* Day of Week */}
              <div>
                <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                  Day of Week
                </label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8] capitalize"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#151520] capitalize">
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                  Title & Anchor
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Focus Flow Block, Morning Tea & Stretching"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8]/50 focus:outline-none focus:border-[#B8A4D8]"
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs font-mono text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                    End Time (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs font-mono text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormCategory(cat.id)}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-light capitalize flex items-center justify-center gap-1.5 transition-colors ${
                        formCategory === cat.id
                          ? `${cat.color} font-medium`
                          : 'bg-[#151520] border-[#262438] text-[#AAA4B8] hover:text-[#EAE6F2]'
                      }`}
                    >
                      <cat.icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                  Gentle Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes, intentions, cozy mindset..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8]/50 focus:outline-none focus:border-[#B8A4D8] resize-none"
                />
              </div>

              {/* Reminders Toggle & Lead Time */}
              <div className="p-3 rounded-xl bg-[#151520] border border-[#262438] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-[#B8A4D8]" />
                    <span className="text-xs font-light text-[#EAE6F2]">
                      In-App & Browser Reminder
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormHasReminder(!formHasReminder)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      formHasReminder ? 'bg-[#B8A4D8]' : 'bg-[#262438]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#08080C] transition-transform ${
                        formHasReminder ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {formHasReminder && (
                  <div className="pt-2 border-t border-[#262438] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#AAA4B8] font-light">
                      Remind before start
                    </span>
                    <select
                      value={formReminderLead}
                      onChange={(e) => setFormReminderLead(parseInt(e.target.value, 10))}
                      className="px-2 py-1 rounded-lg bg-[#1B1A28] border border-[#262438] text-[11px] text-[#EAE6F2] focus:outline-none"
                    >
                      <option value={0}>At start time</option>
                      <option value={5}>5 minutes before</option>
                      <option value={10}>10 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#151520] hover:bg-[#1B1A28] border border-[#262438] text-xs text-[#AAA4B8] hover:text-[#EAE6F2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#B8A4D8] hover:bg-[#a792cb] text-[#08080C] font-medium text-xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Create Anchor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setDeletingItem(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-[#101018] border border-[#262438] rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-medium">Delete Schedule Anchor?</h3>
            </div>
            <p className="text-xs font-light text-[#AAA4B8] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#EAE6F2]">"{deletingItem.title}"</strong> from your {deletingItem.day} schedule? This will sync across your devices.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2 rounded-xl bg-[#151520] hover:bg-[#1B1A28] border border-[#262438] text-xs text-[#AAA4B8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900/80 border border-rose-700/50 text-rose-200 font-medium text-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
