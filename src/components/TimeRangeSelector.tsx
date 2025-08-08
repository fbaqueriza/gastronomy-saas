'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeRangeSelectorProps {
  value: string[];
  onChange: (times: string[]) => void;
  className?: string;
}

const TIME_RANGES = [
  { value: '08:00-10:00', label: '8:00 - 10:00 AM', description: 'Mañana temprano' },
  { value: '10:00-12:00', label: '10:00 - 12:00 AM', description: 'Mañana' },
  { value: '12:00-14:00', label: '12:00 - 2:00 PM', description: 'Mediodía' },
  { value: '14:00-16:00', label: '2:00 - 4:00 PM', description: 'Tarde' },
  { value: '16:00-18:00', label: '4:00 - 6:00 PM', description: 'Tarde tarde' },
  { value: '18:00-20:00', label: '6:00 - 8:00 PM', description: 'Noche' },
];

export default function TimeRangeSelector({ value, onChange, className = '' }: TimeRangeSelectorProps) {
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');

  const getTimeCategory = (time: string) => {
    const startHour = parseInt(time.split('-')[0].split(':')[0]);
    if (startHour < 12) return 'morning';
    if (startHour < 18) return 'afternoon';
    return 'evening';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'morning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'afternoon': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'evening': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleTimeRange = (timeRange: string) => {
    console.log('DEBUG: TimeRangeSelector - Toggling time:', timeRange, 'Current value:', value);
    const newValue = value.includes(timeRange)
      ? value.filter(t => t !== timeRange)
      : [...value, timeRange];
    console.log('DEBUG: TimeRangeSelector - New value:', newValue);
    onChange(newValue);
  };

  const addCustomTimeRange = () => {
    if (customStartTime && customEndTime) {
      const customRange = `${customStartTime}-${customEndTime}`;
      if (!value.includes(customRange)) {
        onChange([...value, customRange]);
      }
      setCustomStartTime('');
      setCustomEndTime('');
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Clock className="inline h-4 w-4 mr-1" />
        Hora de entrega
      </label>
      
      <div className="space-y-3">
                {/* Quick Time Selection */}
        <div className="grid grid-cols-2 gap-2">
          {TIME_RANGES.map((timeRange) => {
            const category = getTimeCategory(timeRange.value);
            const isSelected = value.includes(timeRange.value);
            
            return (
              <button
                key={timeRange.value}
                type="button"
                onClick={() => toggleTimeRange(timeRange.value)}
                className={`p-2 rounded-lg text-center transition-colors border min-h-[70px] flex flex-col justify-center ${
                  isSelected
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                    : `${getCategoryColor(category)} hover:border-blue-300`
                }`}
              >
                <div className="text-xs font-medium mb-1">{timeRange.label}</div>
                <div className="text-[9px] opacity-75 leading-tight">{timeRange.description}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Time Input */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCustomTime(!showCustomTime)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showCustomTime ? 'Ocultar hora personalizada' : 'Hora personalizada'}
          </button>
        </div>

        {showCustomTime && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Agregar rango personalizado:
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hora inicio"
              />
              <span className="text-sm text-gray-500">a</span>
              <input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hora fin"
              />
              <button
                type="button"
                onClick={addCustomTimeRange}
                disabled={!customStartTime || !customEndTime}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Formato: HH:MM (24 horas)
            </div>
          </div>
        )}

        {/* Selected Times Display */}
        {value.length > 0 && (
          <div className="text-sm text-gray-600">
            <strong>Horarios seleccionados:</strong>
            <div className="mt-1 space-y-1">
              {value.map((time, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <span>{time}</span>
                  <button
                    type="button"
                    onClick={() => toggleTimeRange(time)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 