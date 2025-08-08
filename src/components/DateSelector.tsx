'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateSelectorProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  providerDeliveryDays?: string[];
  providerDeliveryTime?: string[];
}

export default function DateSelector({ 
  value, 
  onChange, 
  className = '',
  providerDeliveryDays,
  providerDeliveryTime 
}: DateSelectorProps) {
  const [showQuickOptions, setShowQuickOptions] = useState(false);

  const getQuickDates = () => {
    const today = new Date();
    const dates = [];
    
    // Próximos 7 días
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-ES', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 1
      });
    }

    // Si hay días de entrega del proveedor, agregar opciones específicas
    if (providerDeliveryDays && providerDeliveryTime && providerDeliveryTime.length > 0) {
      const deliveryDates = [];
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
        
        if (providerDeliveryDays.includes(dayName)) {
          // Usar el primer horario disponible
          const firstTime = providerDeliveryTime[0];
          deliveryDates.push({
            value: date.toISOString().split('T')[0],
            label: `${date.toLocaleDateString('es-ES', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })} (${firstTime})`,
            isDeliveryDay: true
          });
        }
      }
      return [...dates, ...deliveryDates];
    }

    return dates;
  };

  const quickDates = getQuickDates();

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Calendar className="inline h-4 w-4 mr-1" />
        Fecha de entrega deseada
      </label>
      
      <div className="flex gap-2">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowQuickOptions(!showQuickOptions)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Clock className="h-4 w-4" />
        </button>
      </div>

      {showQuickOptions && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Fechas sugeridas</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {quickDates.map((date) => (
                <button
                  key={date.value}
                  type="button"
                  onClick={() => {
                    onChange(date.value);
                    setShowQuickOptions(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    value === date.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  } ${date.isDeliveryDay ? 'border-l-4 border-green-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{date.label}</span>
                    {date.isDeliveryDay && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Entrega
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {providerDeliveryDays && providerDeliveryTime && (
        <p className="mt-1 text-xs text-gray-500">
          Días de entrega del proveedor: {providerDeliveryDays.join(', ')} a las {providerDeliveryTime}
        </p>
      )}
    </div>
  );
} 