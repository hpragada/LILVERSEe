import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Repeat,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';
import {
  isEventOnDate,
  getCuteReminderMessage,
} from '../../services/notificationService';
import { EditReminderModal } from './EditReminderModal';
import { ReminderAlertsWidget } from './ReminderAlertsWidget';

export const CalendarView: React.FC = () => {
  const { events, deleteEvent, snoozeEvent, toggleEventCompleted } = useApp();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  // Dynamic calendar calculations
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    calendarDays.push(`${currentYear}-${monthStr}-${dayStr}`);
  }

  // Filter events for selected date
  const selectedDateEvents = events.filter((e) => isEventOnDate(e, selectedDate));

  const handleOpenAddReminder = (defaultDate?: string) => {
    setEditingEvent({
      id: '',
      title: '',
      time: '09:00 AM',
      date: defaultDate || selectedDate,
      type: 'ritual',
      category: 'ritual',
      repeat: 'none',
      notes: '',
    });
  };

  const handleSnooze = (id: string, mins: number) => {
    snoozeEvent(id, mins);
    setSnoozeOpenId(null);
  };

  // Category badge color helper for dots
  const getCategoryDotColor = (category?: string) => {
    switch (category) {
      case 'birthday':
        return 'bg-pink-400';
      case 'anniversary':
        return 'bg-rose-400';
      case 'appointment':
        return 'bg-zinc-400';
      case 'task':
        return 'bg-emerald-400';
      case 'important':
        return 'bg-[#C0C0C0]';
      default:
        return 'bg-[#C0C0C0]';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-light text-[#AAA4B8] tracking-wider uppercase">
            <span>Rhythms</span>
            <span>·</span>
            <span className="text-[#C0C0C0]">Smart Calendar & Notifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#EAE6F2] tracking-wide mt-1">
            Calendar & Reminders
          </h1>
          <p className="text-sm font-light text-[#AAA4B8] mt-1 max-w-xl">
            Gentle reminders for birthdays, anniversaries, appointments, tasks, and sacred rituals.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddReminder(selectedDate)}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1C1C1C] hover:from-[#c7b6e4] hover:to-[#a791d6] text-[#08080C] transition-all text-xs font-medium flex items-center justify-center gap-2 shadow-sm shadow-[#7863A8]/20 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#08080C]" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Main Calendar Grid and Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Calendar Card */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-[#292929] space-y-4 shadow-sm">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm sm:text-base font-normal text-[#EAE6F2]">
              {monthName}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className="w-8 h-8 rounded-xl bg-[#080808] hover:bg-[#111111] border border-[#292929] text-[#AAA4B8] hover:text-[#EAE6F2] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleJumpToToday}
                className="px-2.5 py-1 rounded-xl bg-[#080808] hover:bg-[#111111] border border-[#292929] text-xs font-light text-[#C0C0C0] hover:text-white transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next Month"
                className="w-8 h-8 rounded-xl bg-[#080808] hover:bg-[#111111] border border-[#292929] text-[#AAA4B8] hover:text-[#EAE6F2] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-light text-[#AAA4B8] pb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-10 sm:h-11" />;
              }

              const dayNumber = parseInt(dateStr.split('-')[2], 10);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;
              const dayEvents = events.filter((e) => isEventOnDate(e, dateStr));
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-11 sm:h-12 rounded-xl text-xs font-light flex flex-col items-center justify-center relative transition-all min-h-[44px] cursor-pointer ${
                    isSelected
                      ? 'bg-[#C0C0C0] text-[#08080C] font-medium shadow-md'
                      : isToday
                      ? 'bg-[#080808] text-[#EAE6F2] border border-[#292929]/70'
                      : 'hover:bg-[#080808] text-[#EAE6F2]'
                  }`}
                >
                  <span className="leading-none">{dayNumber}</span>

                  {/* Multi-dot category indicators */}
                  {hasEvents && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((ev, dotIdx) => (
                        <span
                          key={dotIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? 'bg-[#08080C]'
                              : getCategoryDotColor(ev.category || ev.type)
                          }`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span
                          className={`text-[8px] font-bold ${
                            isSelected ? 'text-[#08080C]' : 'text-[#C0C0C0]'
                          }`}
                        >
                          +
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Legend & Jump Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-[#AAA4B8] font-light border-t border-[#292929] gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                <span>Birthday / Anniversary</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span>Appointment</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Task</span>
              </span>
            </div>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-[#C0C0C0] hover:underline cursor-pointer"
            >
              Selected: {selectedDate}
            </button>
          </div>
        </div>

        {/* Selected Date Agenda Card */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-[#292929] space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#AAA4B8] font-light block">
                  Agenda for
                </span>
                <span className="text-sm font-normal text-[#EAE6F2]">
                  {selectedDate === todayStr ? 'Today' : selectedDate}
                </span>
              </div>
              <span className="text-xs text-[#C0C0C0] font-light">
                {selectedDateEvents.length} scheduled
              </span>
            </div>

            {/* Event List */}
            <div className="space-y-3 pt-3 max-h-[460px] overflow-y-auto pr-1">
              {selectedDateEvents.map((item) => {
                const cuteMsg = getCuteReminderMessage(item);
                const isSnoozed =
                  Boolean(item.snoozedUntil) &&
                  new Date(item.snoozedUntil!).getTime() > Date.now();
                const snoozeTimeFormatted = isSnoozed
                  ? new Date(item.snoozedUntil!).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : null;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                      item.isCompleted
                        ? 'bg-[#080808]/60 border-[#292929] opacity-65'
                        : 'bg-[#080808] border-[#292929] hover:border-[#292929]'
                    }`}
                  >
                    <div className="flex flex-col gap-2.5 w-full">
                      {/* Top Row: Complete toggle, Badges on left, Actions on right */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <button
                            onClick={() => toggleEventCompleted(item.id)}
                            className="text-[#AAA4B8] hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                            title={item.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            {item.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 hover:stroke-emerald-400" />
                            )}
                          </button>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#C0C0C0]/10 border border-[#292929]/25 text-[#C0C0C0]">
                              <span>{cuteMsg.emoji}</span>
                              <span>{cuteMsg.badge}</span>
                            </span>

                            <span className="text-[11px] font-light text-[#AAA4B8] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#C0C0C0]" />
                              <span>{item.time}</span>
                            </span>

                            {item.repeat && item.repeat !== 'none' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-[#111111] border border-[#292929] text-[#C0C0C0] font-light capitalize">
                                <Repeat className="w-2.5 h-2.5" />
                                <span>{item.repeat}</span>
                              </span>
                            )}

                            {isSnoozed && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-300 border border-zinc-500/30 font-light flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 animate-spin" />
                                <span>Snoozed until {snoozeTimeFormatted}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions (Snooze, Edit, Delete) */}
                        <div className="flex items-center gap-1 shrink-0 ml-auto">
                          {!item.isCompleted && (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setSnoozeOpenId(snoozeOpenId === item.id ? null : item.id)
                                }
                                className="px-2 py-1 rounded-lg bg-[#111111] hover:bg-[#242236] border border-[#292929] text-[11px] font-light text-[#C0C0C0] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                                title="Snooze reminder"
                              >
                                <Clock className="w-3 h-3" />
                                <span>Snooze</span>
                                <ChevronDown className="w-2.5 h-2.5" />
                              </button>

                              {snoozeOpenId === item.id && (
                                <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-xl bg-[#111111] border border-[#292929] shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
                                  {[5, 10, 30].map((m) => (
                                    <button
                                      key={m}
                                      onClick={() => handleSnooze(item.id, m)}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-light text-[#EAE6F2] hover:bg-[#C0C0C0]/20 transition-colors cursor-pointer"
                                    >
                                      Snooze {m}m
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => setEditingEvent(item)}
                            className="w-7 h-7 rounded-lg bg-[#111111] hover:bg-[#242236] text-[#AAA4B8] hover:text-[#EAE6F2] flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit reminder"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => deleteEvent(item.id)}
                            className="w-7 h-7 rounded-lg bg-[#111111] hover:bg-rose-500/20 text-[#AAA4B8] hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete reminder"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Text Content: FULL AVAILABLE INNER WIDTH */}
                      <div className="space-y-1 w-full min-w-0">
                        <h4
                          className={`text-xs font-normal text-[#EAE6F2] leading-snug w-full break-words ${
                            item.isCompleted ? 'line-through text-[#AAA4B8]' : ''
                          }`}
                        >
                          {item.title}
                        </h4>

                        {/* Cute snippet */}
                        {!item.isCompleted && (
                          <p className="text-[11px] text-[#C0C0C0]/90 font-light italic leading-relaxed pt-0.5 w-full break-words">
                            “{cuteMsg.body}”
                          </p>
                        )}

                        {/* Notes */}
                        {(item.notes || item.description) && (
                          <p className="text-[11px] text-[#AAA4B8] font-light leading-relaxed pt-0.5 w-full break-words">
                            {item.notes || item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {selectedDateEvents.length === 0 && (
                <div className="py-12 text-center text-xs font-light text-[#AAA4B8] space-y-2">
                  <p>No scheduled reminders on this day.</p>
                  <p className="text-[11px] opacity-70">
                    A blank day is an invitation for quiet and rest.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleOpenAddReminder(selectedDate)}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-[#292929] hover:border-[#292929]/50 text-xs text-[#AAA4B8] hover:text-[#EAE6F2] transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Add reminder for {selectedDate}</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Reminder Alerts Section */}
      <ReminderAlertsWidget
        title="Sanctuary Reminder Alerts"
        subtitle="Today's active celebrations, tasks, and appointments with instant snooze & complete"
      />

      {/* Add / Edit Reminder Modal */}
      {editingEvent && (
        <EditReminderModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
};
