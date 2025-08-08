'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface WeekDaySelectorProps {
  value: string[];
  onChange: (days: string[]) => void;
  className?: string;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lunes', short: 'Lun' },
  { value: 'tuesday', label: 'Martes', short: 'Mar' },
  { value: 'wednesday', label: 'Miércoles', short: 'Mié' },
  { value: 'thursday', label: 'Jueves', short: 'Jue' },
  { value: 'friday', label: 'Viernes', short: 'Vie' },
  { value: 'saturday', label: 'Sábado', short: 'Sáb' },
  { value: 'sunday', label: 'Domingo', short: 'Dom' },
];

export default function WeekDaySelector({ value, onChange, className = '' }: WeekDaySelectorProps) {
  const toggleDay = (day: string) => {
    console.log('DEBUG: WeekDaySelector - Toggling day:', day, 'Current value:', value);
    const newValue = value.includes(day)
      ? value.filter(d => d !== day)
      : [...value, day];
    console.log('DEBUG: WeekDaySelector - New value:', newValue);
    onChange(newValue);
  };

  const selectAll = () => {
    onChange(DAYS_OF_WEEK.map(day => day.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectWeekdays = () => {
    onChange(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  };

  const getSelectedDaysText = () => {
    if (value.length === 0) return 'Seleccionar días';
    if (value.length === 7) return 'Todos los días';
    if (value.length === 5 && value.every(day => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day))) {
      return 'Lunes a Viernes';
    }
    return value.map(day => DAYS_OF_WEEK.find(d => d.value === day)?.short).join(', ');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Calendar className="inline h-4 w-4 mr-1" />
        Días de entrega
      </label>
      
      <div className="space-y-3">
        {/* Quick Selection Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectWeekdays}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Lunes a Viernes
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            Todos los días
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Limpiar
          </button>
        </div>

        {/* Day Selection Grid */}
        <div className="grid grid-cols-1 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`p-3 rounded-lg text-left transition-colors min-h-[50px] flex items-center ${
                value.includes(day.value)
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={day.label}
            >
              <div className="flex-1">
                <div className="text-sm font-bold">{day.short}</div>
                <div className="text-xs opacity-75">{day.label}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                value.includes(day.value)
                  ? 'bg-white border-white'
                  : 'border-gray-400'
              }`}>
                {value.includes(day.value) && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full m-0.5"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Days Summary */}
        <div className="text-sm text-gray-600">
          <strong>Días seleccionados:</strong> {getSelectedDaysText()}
        </div>
      </div>
    </div>
  );
} 