
import React, { useState } from 'react';
import { Search, Package, AlertTriangle, Plus, Edit2, Zap } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, onUpdateInventory }) => {
  const [filterCat, setFilterCat] = useState<InventoryCategory | 'All' | 'Envases'>('All');
  const [search, setSearch] = useState('');
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<InventoryItem>>({});

  const categories: string[] = ['Insumo', 'Bebida', 'Salsa', 'Desechable', 'Envases', 'Otro'];

  const filteredItems = inventory.filter(item => {
    let matchesCat = true;
    
    if (filterCat === 'All') {
      matchesCat = true;
    } else if (filterCat === 'Envases') {
      matchesCat = item.name.toLowerCase().includes('envase') || item.name.toLowerCase().includes('caja');
    } else {
      // Safe comparison ensuring we don't compare 'Envases' string to category enum directly if logic leaks
      matchesCat = item.category === filterCat;
      
      // Optional: Explicitly exclude envases from 'Otro' if you want strict separation
      if (filterCat === 'Otro' && (item.name.toLowerCase().includes('envase'))) {
         matchesCat = false; 
      }
    }

    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSave = () => {
    if (!editItem.name) return;
    
    const newItem: InventoryItem = {
      id: editItem.id || Date.now().toString(),
      name: editItem.name,
      category: editItem.category || 'Insumo',
      quantity: Number(editItem.quantity) || 0,
      unit: editItem.unit || 'unid',
      minThreshold: Number(editItem.minThreshold) || 0
    };

    if (editItem.id) {
        onUpdateInventory(inventory.map(i => i.id === editItem.id ? newItem : i));
    } else {
        onUpdateInventory([...inventory, newItem]);
    }
    setIsEditing(false);
    setEditItem({});
  };

  const openEdit = (item?: InventoryItem) => {
      if (item) {
          setEditItem({...item});
      } else {
          setEditItem({ category: 'Insumo', unit: 'unid', quantity: 0, minThreshold: 5 });
      }
      setIsEditing(true);
  };

  // Creative Detail: Inventory Health Bar
  const getInventoryHealth = () => {
      const totalItems = inventory.length;
      if (totalItems === 0) return 100;
      const lowStockItems = inventory.filter(i => i.quantity <= i.minThreshold).length;
      return Math.max(0, 100 - ((lowStockItems / totalItems) * 100));
  };
  const health = getInventoryHealth();

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
       
       {/* Health Status Bar */}
       <div className="bg-gray-900 rounded-2xl p-4 shadow-lg text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${health > 80 ? 'bg-green-500' : health > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Salud del Inventario</h3>
                    <div className="w-32 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${health > 80 ? 'bg-green-500' : health > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{width: `${health}%`}}
                        ></div>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <span className="text-xs text-gray-400 block">Items Críticos</span>
                <span className="font-bold text-xl">{inventory.filter(i => i.quantity <= i.minThreshold).length}</span>
            </div>
       </div>

       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-3">
               <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                   <Package className="w-6 h-6" />
               </div>
               <div>
                   <h2 className="text-xl font-bold text-gray-800">Inventario General</h2>
                   <p className="text-sm text-gray-500">Gestión de stock y envases</p>
               </div>
           </div>
           
           <div className="flex gap-2 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                      type="text" 
                      placeholder="Buscar item..." 
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                   />
               </div>
               <button onClick={() => openEdit()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 flex items-center gap-2">
                   <Plus className="w-4 h-4" /> Nuevo
               </button>
           </div>
       </div>

       {/* Categories */}
       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <button 
             onClick={() => setFilterCat('All')}
             className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterCat === 'All' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
           >
               Todos
           </button>
           {categories.map(cat => (
               <button 
                key={cat}
                onClick={() => setFilterCat(cat as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterCat === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
               >
                   {cat}
               </button>
           ))}
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredItems.map(item => (
               <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
                   <div className="flex justify-between items-start mb-2">
                       <span className={`text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase`}>{item.category}</span>
                       <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-indigo-600 p-1"><Edit2 className="w-4 h-4" /></button>
                   </div>
                   <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
                   
                   <div className="flex items-end justify-between mt-4">
                       <div>
                           <span className={`block text-2xl font-black ${item.quantity <= item.minThreshold ? 'text-red-500' : 'text-gray-800'}`}>
                               {item.quantity} <span className="text-sm font-medium text-gray-400">{item.unit}</span>
                           </span>
                           <span className="text-xs text-gray-400">Stock actual</span>
                       </div>
                       {item.quantity <= item.minThreshold && (
                           <div className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                               <AlertTriangle className="w-3 h-3" /> Bajo Stock
                           </div>
                       )}
                   </div>
                   {/* Mini Progress bar per item */}
                   <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${item.quantity <= item.minThreshold ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{width: `${Math.min(100, (item.quantity / (item.minThreshold * 4)) * 100)}%`}}
                        ></div>
                   </div>
               </div>
           ))}
       </div>

       {/* Edit Modal */}
       {isEditing && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
                   <h3 className="text-xl font-bold mb-4">{editItem.id ? 'Editar Item' : 'Nuevo Item'}</h3>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                           <input 
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={editItem.name || ''} 
                            onChange={e => setEditItem({...editItem, name: e.target.value})}
                           />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                               <select 
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none bg-white"
                                value={editItem.category}
                                onChange={e => setEditItem({...editItem, category: e.target.value as any})}
                               >
                                   <option value="Insumo">Insumo</option>
                                   <option value="Bebida">Bebida</option>
                                   <option value="Salsa">Salsa</option>
                                   <option value="Desechable">Desechable</option>
                                   <option value="Otro">Otro/Envase</option>
                               </select>
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidad</label>
                               <select 
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none bg-white"
                                value={editItem.unit}
                                onChange={e => setEditItem({...editItem, unit: e.target.value as any})}
                               >
                                   <option value="unid">Unidad</option>
                                   <option value="kg">Kilo (kg)</option>
                                   <option value="lt">Litro (lt)</option>
                                   <option value="paq">Paquete</option>
                               </select>
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cantidad Actual</label>
                               <input 
                                type="number" 
                                className="w-full p-3 border border-gray-200 rounded-lg font-bold outline-none"
                                value={editItem.quantity}
                                onChange={e => setEditItem({...editItem, quantity: parseFloat(e.target.value)})}
                               />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alerta Mínima</label>
                               <input 
                                type="number" 
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                                value={editItem.minThreshold}
                                onChange={e => setEditItem({...editItem, minThreshold: parseFloat(e.target.value)})}
                               />
                           </div>
                       </div>
                   </div>
                   <div className="flex gap-3 mt-6">
                       <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 font-bold text-gray-600 rounded-xl hover:bg-gray-200">Cancelar</button>
                       <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 font-bold text-white rounded-xl shadow-lg hover:bg-indigo-700">Guardar</button>
                   </div>
               </div>
           </div>
       )}

    </div>
  );
};

export default InventoryView;
