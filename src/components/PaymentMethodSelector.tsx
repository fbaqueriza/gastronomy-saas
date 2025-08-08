'use client';

import { CreditCard, DollarSign, Building2, Receipt } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  onChange: (method: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque') => void;
  className?: string;
}

const PAYMENT_METHODS = [
  { 
    value: 'efectivo' as const, 
    label: 'Efectivo', 
    icon: DollarSign,
    description: 'Pago en efectivo'
  },
  { 
    value: 'transferencia' as const, 
    label: 'Transferencia', 
    icon: Building2,
    description: 'Transferencia bancaria'
  },
  { 
    value: 'tarjeta' as const, 
    label: 'Tarjeta', 
    icon: CreditCard,
    description: 'Tarjeta de crédito/débito'
  },
  { 
    value: 'cheque' as const, 
    label: 'Cheque', 
    icon: Receipt,
    description: 'Cheque bancario'
  },
];

export default function PaymentMethodSelector({ value, onChange, className = '' }: PaymentMethodSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <CreditCard className="inline h-4 w-4 mr-1" />
        Método de pago
      </label>
             <div className="grid grid-cols-2 gap-2">
         {PAYMENT_METHODS.map((method) => {
           const Icon = method.icon;
           return (
             <button
               key={method.value}
               type="button"
               onClick={() => onChange(method.value)}
                               className={`p-2 border rounded-lg text-center transition-colors min-h-[70px] flex flex-col justify-center ${
                  value === method.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs font-medium mb-1">{method.label}</div>
                <div className="text-[9px] text-gray-500 leading-tight">{method.description}</div>
             </button>
           );
         })}
       </div>
    </div>
  );
} 