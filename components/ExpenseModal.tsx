
import React, { useState } from 'react';
import { X, TrendingDown, DollarSign, PackagePlus, Wallet } from 'lucide-react';
import { InventoryItem, TransactionType } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  totalCash: number;
  onSaveExpense: (desc: string, amount: number, type: TransactionType, inventoryDetails?: {id: string, qty: number}) => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, inventory, totalCash, onSaveExpense }) => {
  const [tab, setTab] = useState<'OPERATIONAL' | 'INVENTORY' | 'CAPITAL'>('OPERATIONAL');
  
  // Form States
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  
  // Inventory Specific
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  // Capital Specific
  const [capitalAction, setCapitalAction] = useState<'WITHDRAWAL' | 'DEPOSIT'>('WITHDRAWAL');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(amount);
    if (!description || isNaN(cost)) return;

    if (tab === 'OPERATIONAL') {
        onSaveExpense(description, cost, 'EXPENSE_OPERATIONAL');
    } else if (tab === 'INVENTORY') {
        let qty = parseFloat(itemQuantity);
        if (selectedItemId && !isNaN(qty)) {
            // Special Logic: Napkins bought in Packs (50 units per pack)
            if (selectedItemId === 'inv_servilletas') {
                qty = qty * 50; 
                // We update description to reflect packs bought vs units stored
                onSaveExpense(`${description} (${itemQuantity} Paquetes)`, cost, 'EXPENSE_INVENTORY', { id: selectedItemId, qty });
            } else {
                onSaveExpense(description, cost, 'EXPENSE_INVENTORY', { id: selectedItemId, qty });
            }
        }
    } else if (tab === 'CAPITAL') {
        const type = capitalAction === 'WITHDRAWAL' ? 'WITHDRAWAL' : 'DEPOSIT';
        onSaveExpense(description, cost, type);
    }
    
    // Reset
    setDescription('');
    setAmount('');
    setItemQuantity('');
    setSelectedItemId('');
    onClose();
  };

  const getHeaderColor = () => {
      if (tab === 'INVENTORY') return 'bg-indigo-600';
      if (tab === 'CAPITAL') return 'bg-emerald-600';
      return 'bg-red-600';
  };

  const selectedItemUnit = selectedItemId ? inventory.find(i => i.id === selectedItemId)?.unit : '';
  const selectedItemName = selectedItemId ? inventory.find(i => i.id === selectedItemId)?.name : '';

  // Helper for UI label
  const getItemInputLabel = () => {
      if (selectedItemId === 'inv_servilletas') return 'Cantidad de Paquetes (1 paq = 50 unid)';
      return `Cantidad Comprada en ${getUnitLabel(selectedItemUnit)}`;
  };

  const getUnitLabel = (unit?: string) => {
     switch(unit) {
         case 'kg': return 'Kilos (kg)';
         case 'lt': return 'Litros (Lt)';
         case 'unid': return 'Unidades';
         case 'ml': return 'Mililitros (ml)';
         case 'gr': return 'Gramos (gr)';
         case 'paq': return 'Paquetes';
         default: return 'Cantidad';
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className={`${getHeaderColor()} p-4 text-white transition-colors duration-300 shrink-0`}>
           <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {tab === 'OPERATIONAL' && <TrendingDown className="w-6 h-6" />}
                    {tab === 'INVENTORY' && <PackagePlus className="w-6 h-6" />}
                    {tab === 'CAPITAL' && <Wallet className="w-6 h-6" />}
                    {tab === 'OPERATIONAL' ? 'Gasto Operativo' : tab === 'INVENTORY' ? 'Compra Insumos' : 'Caja y Capital'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/20 bg-black/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
           </div>
           
           <div className="flex bg-black/20 p-1 rounded-xl">
               <button onClick={() => setTab('OPERATIONAL')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'OPERATIONAL' ? 'bg-white text-gray-900 shadow' : 'text-white/70 hover:bg-white/10'}`}>Gasto Común</button>
               <button onClick={() => setTab('INVENTORY')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'INVENTORY' ? 'bg-white text-gray-900 shadow' : 'text-white/70 hover:bg-white/10'}`}>Compra Stock</button>
               <button onClick={() => setTab('CAPITAL')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'CAPITAL' ? 'bg-white text-gray-900 shadow' : 'text-white/70 hover:bg-white/10'}`}>Capital</button>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          <div className="text-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Caja Disponible Total</span>
              <span className="text-2xl font-black text-gray-800">{totalCash.toFixed(2)} Bs</span>
          </div>

          {/* Type Specific Fields */}
          {tab === 'INVENTORY' && (
              <div className="space-y-4 animate-fadeIn">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Seleccionar Insumo</label>
                      <select 
                        required 
                        className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        value={selectedItemId}
                        onChange={(e) => {
                            setSelectedItemId(e.target.value);
                            const item = inventory.find(i => i.id === e.target.value);
                            if (item) setDescription(`Compra de ${item.name}`);
                        }}
                      >
                          <option value="" className="text-gray-400">-- Elegir Item del Inventario --</option>
                          {inventory.map(i => (
                              <option key={i.id} value={i.id} className="text-gray-900">{i.name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                          {getItemInputLabel()}
                      </label>
                      <div className="relative">
                          <input 
                            type="number" 
                            required 
                            min="0.01" 
                            step="0.01"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                            value={itemQuantity}
                            onChange={e => setItemQuantity(e.target.value)}
                            placeholder={selectedItemId === 'inv_servilletas' ? "Ej: 10 (Paquetes)" : "Cantidad"}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                              {selectedItemId === 'inv_servilletas' ? 'Paquetes' : selectedItemUnit || '#'}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {tab === 'CAPITAL' && (
              <div className="flex gap-4 mb-2 animate-fadeIn">
                  <button 
                    type="button"
                    onClick={() => { setCapitalAction('WITHDRAWAL'); setDescription('Retiro de Ganancias'); }}
                    className={`flex-1 p-3 border rounded-xl font-bold text-sm ${capitalAction === 'WITHDRAWAL' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}
                  >
                      Retiro / Sueldo
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setCapitalAction('DEPOSIT'); setDescription('Ingreso de Capital'); }}
                    className={`flex-1 p-3 border rounded-xl font-bold text-sm ${capitalAction === 'DEPOSIT' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-500'}`}
                  >
                      Depositar
                  </button>
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              required
              placeholder={tab === 'CAPITAL' ? "Motivo del movimiento" : "Ej. Pago de Luz, Hielo, etc."}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white text-gray-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto en Dinero (BOB)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                required
                min="0"
                step="0.5"
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:outline-none text-lg font-bold bg-white text-gray-900"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition-colors ${
                  tab === 'OPERATIONAL' ? 'bg-red-600 hover:bg-red-700' : 
                  tab === 'INVENTORY' ? 'bg-indigo-600 hover:bg-indigo-700' : 
                  'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {tab === 'OPERATIONAL' ? 'Registrar Gasto' : tab === 'INVENTORY' ? 'Confirmar Compra' : 'Confirmar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
