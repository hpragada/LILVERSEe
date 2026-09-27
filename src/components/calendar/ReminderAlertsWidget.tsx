import React, { useState } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Repeat,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';
import {
  isEventDueToday,
  getCuteReminderMessage,
} from '../../services/notificationService';
import { EditReminderModal } from './EditReminderModal';

interface ReminderAlertsWidgetProps {
  filterDate?: string; // Optional: specific date
  title?: string;
  subtitle?: string;
  showAddButton?: boolean;
}

export const ReminderAlertsWidget: React.FC<ReminderAlertsWidgetProps> = ({
  filterDate,
  title = 'Sanctuary Reminders & Rituals',
  subtitle = 'Birthdays, appointments, gentle tasks & important dates',
  showAddButton = true,
}) => {
  const { events, deleteEvent, snoozeEvent, toggleEventCompleted } = useApp();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const targetDateStr = filterDate || todayStr;
  const targetDateObj = new Date(`${targetDateStr}T00:00:00`);

  // Filter events
  const relevantEvents = events.filter((ev) => {
    if (!ev || !ev.title) return false;

    if (ev.snoozedUntil && !ev.isCompleted) {
      return true;
    }

    if (filterDate) {
      return isEventDueToday(ev, targetDateObj) || ev.date === filterDate;
    }

    return isEventDueToday(ev, new Date());
  });

  // Sort: pending first, then completed
  const sortedEvents = [...relevantEvents].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return (a.time || '').localeCompare(b.time || '');
  });

  const pendingCount = sortedEvents.filter((e) => !e.isCompleted).length;

  const handleOpenCreate = () => {
    setIsCreating(true);
  };

  const handleSnooze = (id: string, mins: number) => {
    snoozeEvent(id, mins);
    setSnoozeOpenId(null);
  };

  return (
    <section className="space-y-2.5">
      {/* Sleek Compact Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#C084FC]/15 flex items-center justify-center text-[#C084FC]">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-medium text-[#F3EEFB] uppercase tracking-wider">
              {title}
            </h3>
            {pendingCount > 0 ? (
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#C084FC]/15 text-[#C084FC] border border-[#C084FC]/30 font-medium">
                {pendingCount} Active
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 font-light">
                All Quiet ✨
              </span>
            )}
          </div>
        </div>

        {showAddButton && (
          <button
            onClick={handleOpenCreate}
            className="text-xs text-[#B8A4D8] hover:text-[#C084FC] flex items-center gap-1 font-light cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reminder</span>
          </button>
        )}
      </div>

      {/* Reminders List (Small, Elegantly Proportioned Cards) */}
      <div className="space-y-2">
        {sortedEvents.map((item) => {
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
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                item.isCompleted
                  ? 'bg-[#090810]/60 border-[#262438]/50 opacity-65'
                  : 'bg-[#0E0C18]/90 border-[#2E2942]/60 hover:border-[#C084FC]/40 shadow-sm backdrop-blur-md'
              }`}
            >
              <div className="flex flex-col gap-2 w-full">
                {/* Top Row: Complete toggle, Badges on left, Actions on right */}
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <button
                      onClick={() => toggleEventCompleted(item.id)}
                      className="text-[#81789A] hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                      title={item.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 hover:stroke-emerald-400" />
                      )}
                    </button>

                    {/* Badges Row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1A162B] border border-[#C084FC]/30 text-[#C084FC]">
                        <span>{cuteMsg.emoji}</span>
                        <span>{cuteMsg.badge}</span>
                      </span>

                      <span className="text-[10px] font-light text-[#81789A] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#B8A4D8]" />
                        <span>{item.time}</span>
                      </span>

                      {item.repeat && item.repeat !== 'none' && (
                        <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-[#1A162B] border border-[#2E2942] text-[#B8A4D8] font-light capitalize">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>{item.repeat}</span>
                        </span>
                      )}

                      {isSnoozed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-950/40 text-zinc-300 border border-zinc-900/50 font-light flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 animate-spin" />
                          <span>Snoozed until {snoozeTimeFormatted}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-auto">
                    {/* Snooze Dropdown */}
                    {!item.isCompleted && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setSnoozeOpenId(
                              snoozeOpenId === item.id ? null : item.id
                            )
                          }
                          className="min-h-[28px] px-2 py-0.5 rounded-lg bg-[#141220] hover:bg-[#1E1A2E] border border-[#2E2942] text-[10px] font-light text-[#B8A4D8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                          title="Snooze reminder"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Snooze</span>
                          <ChevronDown className="w-2.5 h-2.5" />
                        </button>

                        {snoozeOpenId === item.id && (
                          <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-xl bg-[#141220] border border-[#2E2942] shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
                            {[5, 10, 30].map((m) => (
                              <button
                                key={m}
                                onClick={() => handleSnooze(item.id, m)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-light text-[#F3EEFB] hover:bg-[#1E1A2E] transition-colors"
                              >
                                Snooze {m}m
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => setEditingEvent(item)}
                      className="w-7 h-7 rounded-lg bg-[#141220] hover:bg-[#1E1A2E] text-[#81789A] hover:text-[#F3EEFB] flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit reminder"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteEvent(item.id)}
                      className="w-7 h-7 rounded-lg bg-[#141220] hover:bg-rose-950/40 text-[#81789A] hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Text Content: Full available inner width with zero dead space */}
                <div className="space-y-0.5 w-full min-w-0">
                  <h4
                    className={`text-xs sm:text-sm font-normal text-[#F3EEFB] leading-snug w-full break-words ${
                      item.isCompleted ? 'line-through text-[#81789A]' : ''
                    }`}
                  >
                    {item.title}
                  </h4>

                  {!item.isCompleted && (
                    <p className="text-[11px] text-[#B8A4D8]/90 font-light italic leading-relaxed pt-0.5 w-full break-words">
                      “{cuteMsg.body}”
                    </p>
                  )}

                  {(item.notes || item.description) && (
                    <p className="text-[11px] text-[#81789A] font-light leading-relaxed w-full break-words">
                      {item.notes || item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="py-4 text-center text-xs font-light text-[#81789A] space-y-1">
            <p>No reminders scheduled for this rhythm.</p>
            <p className="text-[10px] opacity-70">
              Add birthdays, gentle intentions, or appointments anytime ✨
            </p>
          </div>
        )}
      </div>

      {/* Edit / Create Modals */}
      {editingEvent && (
        <EditReminderModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {isCreating && (
        <EditReminderModal
          initialDate={targetDateStr}
          onClose={() => setIsCreating(false)}
        />
      )}
    </section>
  );
};
