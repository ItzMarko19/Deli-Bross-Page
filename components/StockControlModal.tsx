
import React, { useState } from 'react';
import { X, Clock, ChefHat, PlayCircle, Scissors, AlertTriangle, CalendarClock } from 'lucide-react';
import { StockLog, KitchenProductionRule, InventoryItem } from '../types';
import { KITCHEN_RULES } from '../constants';

interface StockControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockLogs: StockLog[];
  inventory: InventoryItem[];
  onKitchenProduction: (rule: KitchenProductionRule, multiplier: number, customTime?: string) => void;
  onConvertCut: (quantity: number) => void;
}

const StockControlModal: React.FC<StockControlModalProps> = ({ 
  isOpen, 
  onClose, 
  stockLogs,
  inventory,
  onKitchenProduction,
  onConvertCut
}) => {
  const [selectedRuleIdx, setSelectedRuleIdx] = useState(0);
  const [amount, setAmount] = useState<number>(1);
  const [cutsToConvert, setCutsToConvert] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>(''); // If empty, use NOW
  
  if (!isOpen) return null;

  const currentRule = KITCHEN_RULES[selectedRuleIdx];

  const handleExecute = () => {
      if (amount <= 0) return;
      onKitchenProduction(currentRule, amount, startTime || undefined);
      setAmount(1);
      setStartTime('');
      onClose();
  };

  const handleConvert = () => {
    if (cutsToConvert <= 0) return;
    onConvertCut(cutsToConvert);
    setCutsToConvert(1);
  };

  // Helper to find name
  const getItemName = (id: string) => {
      const item = inventory.find(i => i.id === id);
      return item ? item.name : id;
  };
  
  // Helper to find unit
  const getItemUnit = (id: string) => {
      const item = inventory.find(i => i.id === id);
      return item ? item.unit : '';
  };

  // Filter logs for "today"
  const today = new Date().toDateString();
  const todaysLogs = stockLogs
    .filter(log => new Date(log.timestamp).toDateString() === today)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Format nice unit display (e.g. 0.5 kg -> 500 gr)
  const formatQuantity = (qty: number, unit: string) => {
      if (unit === 'kg' && qty < 1) return `${(qty * 1000).toFixed(0)} gr`;
      if (unit === 'lt' && qty < 1) return `${(qty * 1000).toFixed(0)} ml`;
      if (unit === 'unid') return qty.toFixed(1); // Keep decimal for partial units if needed
      return `${qty.toFixed(2)} ${unit}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-orange-600 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-200" />
            Producción de Cocina
          </h2>
          <button onClick={onClose} className="p-2 bg-orange-700 hover:bg-orange-800 rounded-full transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Production Batch */}
          <div className="mb-8 border-b border-gray-100 pb-6">
            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Registrar Actividad</label>
            
            <div className="flex flex-col gap-4">
                <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
                    value={selectedRuleIdx}
                    onChange={(e) => setSelectedRuleIdx(parseInt(e.target.value))}
                >
                    {KITCHEN_RULES.map((rule, idx) => (
                        <option key={idx} value={idx}>{rule.name}</option>
                    ))}
                </select>

                <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block font-bold uppercase">Cantidad a Producir</label>
                        <input 
                            type="number" 
                            min="0.1"
                            step="0.5"
                            className="w-full p-3 border border-gray-300 rounded-xl font-bold text-center text-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex-1">
                         <label className="text-xs text-gray-400 mb-1 block font-bold uppercase flex items-center gap-1">
                             <Clock className="w-3 h-3"/> Hora Inicio
                         </label>
                         <input 
                             type="time" 
                             className="w-full p-3 border border-gray-300 rounded-xl font-bold text-center text-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                             value={startTime}
                             onChange={(e) => setStartTime(e.target.value)}
                         />
                         <div className="text-[10px] text-center text-gray-400 mt-1">Dejar vacío para "Ahora"</div>
                    </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm shadow-sm">
                    <p className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4"/>
                        Se descontará del Inventario:
                    </p>
                    <ul className="space-y-2">
                        {currentRule.inputs.map((input, idx) => (
                            <li key={idx} className="flex justify-between items-center text-gray-700 bg-white/50 p-1.5 rounded-lg">
                                <span className="font-medium text-xs">{getItemName(input.inventoryId)}</span>
                                <span className="font-mono font-bold text-orange-700">
                                    {formatQuantity(input.quantity * amount, getItemUnit(input.inventoryId))}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-orange-200 flex justify-between items-center text-orange-800 text-xs font-bold">
                        <span>Tiempo Estimado:</span>
                        <span>{currentRule.cookingTimeMinutes} Minutos</span>
                    </div>
                </div>

                <button 
                    onClick={handleExecute}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-transform active:scale-95"
                >
                    <PlayCircle className="w-5 h-5 text-green-400" /> Iniciar Producción
                </button>
            </div>
          </div>

          {/* Cuts Convert */}
          <div className="mb-8 border-b border-gray-100 pb-6 bg-purple-50 p-4 rounded-xl border border-purple-100">
             <div className="flex items-center gap-2 mb-3 text-purple-700 font-bold">
                <Scissors className="w-5 h-5" />
                <span>Reciclar Presas / Yapas</span>
             </div>
             <div className="flex gap-3 items-end">
               <div className="flex-1">
                  <label className="text-xs text-purple-400 mb-1 block font-bold">Presas Enteras a Cortar</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border border-purple-200 rounded-lg font-bold text-lg text-center focus:ring-2 focus:ring-purple-500 outline-none text-purple-800 bg-white"
                    value={cutsToConvert}
                    onChange={(e) => setCutsToConvert(parseInt(e.target.value) || 0)}
                  />
               </div>
               <button
                  onClick={handleConvert}
                  className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 active:scale-95 transition-all"
               >
                  Convertir
               </button>
             </div>
          </div>

          {/* History Section */}
          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-4 border-b pb-2">
              <Clock className="w-4 h-4" /> Historial de Cocina (Hoy)
            </h3>
            <div className="space-y-3">
              {todaysLogs.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4 italic">No se ha cocinado pollo hoy.</p>
              )}
              {todaysLogs.map(log => (
                <div key={log.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="block font-bold text-gray-800 flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-orange-500"/> {log.ruleName || 'Cocina'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                       <Clock className="w-3 h-3"/> {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       {log.targetCompletionTime && new Date() < new Date(log.targetCompletionTime) && (
                           <span className="text-green-600 font-bold ml-2">• Cocinando</span>
                       )}
                       {log.targetCompletionTime && new Date() >= new Date(log.targetCompletionTime) && (
                           <span className="text-gray-400 ml-2">• Finalizado</span>
                       )}
                    </span>
                  </div>
                  <div className="font-bold text-gray-700">+{log.quantityChickens}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockControlModal;
