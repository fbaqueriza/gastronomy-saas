'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DeliveryDaysSelectorProps {
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

export default function DeliveryDaysSelector({ value, onChange, className = '' }: DeliveryDaysSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  const toggleDay = (day: string) => {
    const newValue = value.includes(day)
      ? value.filter(d => d !== day)
      : [...value, day];
    onChange(newValue);
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
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setShowSelector(!showSelector)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
      >
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          {getSelectedDaysText()}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {showSelector && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3">
            <div className="grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`p-2 text-xs rounded-md transition-colors ${
                    value.includes(day.value)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={day.label}
                >
                  {day.short}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 