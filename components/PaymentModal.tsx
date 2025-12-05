
import React, { useState, useEffect } from 'react';
import { X, QrCode, Banknote, CheckCircle, Calculator, CreditCard } from 'lucide-react';
import { Sale, PaymentMethod } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (saleId: string, method: PaymentMethod, discount: number) => void;
  sale: Sale | null;
}

type DiscountMode = 'amount' | 'final_price';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, sale }) => {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [mode, setMode] = useState<DiscountMode>('amount');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setMethod(null);
      setInputValue('');
      setMode('amount');
    }
  }, [isOpen]);

  if (!isOpen || !sale) return null;

  const numValue = parseFloat(inputValue) || 0;
  
  // Calculate logic based on mode
  let discountAmount = 0;
  let finalTotal = sale.subtotal;

  if (mode === 'amount') {
    // Mode: Subtract amount directly
    discountAmount = numValue;
    finalTotal = Math.max(0, sale.subtotal - discountAmount);
  } else {
    // Mode: Set Final Price (Calculate discount needed)
    if (inputValue !== '') {
        finalTotal = Math.max(0, numValue);
        discountAmount = Math.max(0, sale.subtotal - finalTotal);
    } else {
        discountAmount = 0;
        finalTotal = sale.subtotal;
    }
  }

  const handleConfirm = () => {
    if (!method) return;
    onConfirm(sale.id, method, discountAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Banknote className="w-6 h-6 text-green-400" />
            Finalizar Cobro
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Total Original</p>
            <p className="text-3xl font-bold text-gray-800">{sale.subtotal} BOB</p>
          </div>

          {/* Payment Method Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMethod(PaymentMethod.EFECTIVO)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  method === PaymentMethod.EFECTIVO
                    ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Banknote className="w-6 h-6 mb-1" />
                <span className="font-semibold text-xs">Efectivo</span>
              </button>
              
              <button
                onClick={() => setMethod(PaymentMethod.QR)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  method === PaymentMethod.QR
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <QrCode className="w-6 h-6 mb-1" />
                <span className="font-semibold text-xs">QR</span>
              </button>

              <button
                onClick={() => setMethod(PaymentMethod.TARJETA)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  method === PaymentMethod.TARJETA
                    ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <CreditCard className="w-6 h-6 mb-1" />
                <span className="font-semibold text-xs">Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Discount Section */}
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-500" />
              Ajuste de Precio / Descuento
            </label>
            
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 mb-3">
              <button
                onClick={() => { setMode('amount'); setInputValue(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  mode === 'amount' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Descontar (-)
              </button>
              <button
                onClick={() => { setMode('final_price'); setInputValue(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  mode === 'final_price' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Precio Final (=)
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Bs</span>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder={mode === 'amount' ? "0.00" : `${sale.subtotal}`}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-lg font-mono text-gray-900 bg-white"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            
            <div className="mt-2 text-right text-xs">
                {mode === 'amount' ? (
                   discountAmount > 0 ? <span className="text-red-500 font-medium">Descuento: -{discountAmount} Bs</span> : <span className="text-gray-400">Ingrese monto a restar</span>
                ) : (
                   discountAmount > 0 ? <span className="text-red-500 font-medium">Se descontarán: -{discountAmount.toFixed(2)} Bs</span> : <span className="text-gray-400">Ingrese el total deseado</span>
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white shrink-0 z-10">
            <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">Total a Cobrar:</span>
                <span className="text-4xl font-extrabold text-green-600">{finalTotal.toFixed(2)} <span className="text-lg text-gray-400">Bs</span></span>
            </div>

            <button
                onClick={handleConfirm}
                disabled={!method}
                className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                !method
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-black hover:shadow-xl active:scale-[0.98]'
                }`}
            >
                <CheckCircle className="w-5 h-5" />
                Confirmar Pago
            </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
