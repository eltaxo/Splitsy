'use client';

import { useState } from 'react';
import { getWeekStart } from '@/lib/firestore';

interface WeekSelectorProps {
  onSelectWeek: (weekStart: Date | null) => void;
}

export default function WeekSelector({ onSelectWeek }: WeekSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('all');

  const currentWeek = getWeekStart();
  const lastWeek = new Date(currentWeek);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const twoWeeksAgo = new Date(currentWeek);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const options = [
    { id: 'all', label: 'Todas las semanas', weekStart: null },
    { id: 'current', label: 'Esta semana', weekStart: currentWeek },
    { id: 'last', label: 'Semana pasada', weekStart: lastWeek },
    { id: 'twoWeeksAgo', label: 'Hace 2 semanas', weekStart: twoWeeksAgo },
  ];

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('es-ES', options);
  };

  const handleSelect = (optionId: string, weekStart: Date | null) => {
    setSelectedOption(optionId);
    onSelectWeek(weekStart);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.id === selectedOption)?.label || 'Seleccionar semana';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#211F18] border border-[#302D24] rounded-xl text-[#F4F1E8] hover:border-[#C8FF4D] transition-colors"
      >
        <span className="text-sm font-semibold">📅</span>
        <span className="text-sm font-semibold">{selectedLabel}</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-56 bg-[#211F18] border border-[#302D24] rounded-xl shadow-xl z-20 overflow-hidden">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id, option.weekStart)}
                className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors ${
                  selectedOption === option.id
                    ? 'bg-[#C8FF4D] text-[#15140F]'
                    : 'text-[#F4F1E8] hover:bg-[#2A2820]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {selectedOption === option.id && <span>✓</span>}
                </div>
                {option.weekStart && (
                  <div className="text-xs opacity-70 mt-1">
                    {formatDate(option.weekStart)} - {formatDate(new Date(option.weekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
