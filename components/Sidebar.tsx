
import React from 'react';
import { X, Utensils, LayoutDashboard, ChefHat, ShoppingBag, TrendingDown, PackageSearch, DollarSign } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'dashboard' | 'economy' | 'inventory';
  onNavigate: (view: 'dashboard' | 'economy' | 'inventory') => void;
  onOpenStock: () => void;
  onOpenMenu: () => void;
  onOpenExpense: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, currentView, onNavigate, 
  onOpenStock, onOpenMenu, onOpenExpense 
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900">
           <div className="flex items-center gap-3">
             <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-900/20">
                <Utensils className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="font-bold text-xl tracking-tight leading-none">Deli Bross</h2>
                <span className="text-xs text-gray-500 font-medium">Manager System</span>
             </div>
           </div>
           <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-gray-800 p-1 rounded-lg"><X className="w-5 h-5"/></button>
        </div>
        
        {/* Navigation Items */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
           <p className="text-xs font-bold text-gray-500 uppercase px-3 mb-2 tracking-wider">Vista Principal</p>
           
           <button 
             onClick={() => { onNavigate('dashboard'); onClose(); }}
             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${currentView === 'dashboard' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
           >
             <LayoutDashboard className="w-5 h-5" /> Tablero de Control
           </button>
           
           <button 
             onClick={() => { onNavigate('economy'); onClose(); }}
             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${currentView === 'economy' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
           >
             <DollarSign className="w-5 h-5" /> Economía & Reportes
           </button>

           <button 
             onClick={() => { onNavigate('inventory'); onClose(); }}
             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${currentView === 'inventory' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
           >
             <PackageSearch className="w-5 h-5" /> Inventario General
           </button>

           <div className="my-6 border-t border-gray-800"></div>

           <p className="text-xs font-bold text-gray-500 uppercase px-3 mb-2 tracking-wider">Herramientas</p>
           
           <button 
             onClick={() => { onOpenStock(); onClose(); }}
             className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
           >
             <div className="bg-gray-800 p-1.5 rounded-lg group-hover:bg-gray-700 transition-colors"><ChefHat className="w-4 h-4 text-purple-400" /></div>
             Producción de Cocina
           </button>
           
           <button 
             onClick={() => { onOpenMenu(); onClose(); }}
             className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
           >
             <div className="bg-gray-800 p-1.5 rounded-lg group-hover:bg-gray-700 transition-colors"><ShoppingBag className="w-4 h-4 text-blue-400" /></div>
             Productos / Menú
           </button>
           
           <button 
             onClick={() => { onOpenExpense(); onClose(); }}
             className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
           >
             <div className="bg-gray-800 p-1.5 rounded-lg group-hover:bg-gray-700 transition-colors"><TrendingDown className="w-4 h-4 text-red-400" /></div>
             Registrar Gasto Rápido
           </button>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-gray-800 text-xs text-gray-600 text-center">
            &copy; 2025 Deli Bross System
        </div>
      </div>
    </>
  );
};

export default Sidebar;
