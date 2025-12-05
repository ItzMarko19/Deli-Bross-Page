
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Settings, ChevronRight, Link, List, Utensils } from 'lucide-react';
import { Product, ProductVariant, InventoryItem, RecipeItem, SideOption } from '../types';

interface MenuSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  inventory?: InventoryItem[]; 
}

const MenuSettingsModal: React.FC<MenuSettingsModalProps> = ({ isOpen, onClose, products, onUpdateProducts, inventory = [] }) => {
  const [draftProducts, setDraftProducts] = useState<Product[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);
  const [formRecipe, setFormRecipe] = useState<RecipeItem[]>([]);
  const [formSides, setFormSides] = useState<SideOption[]>([]);
  
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'RECIPE' | 'SIDES'>('DETAILS');

  // Init
  useEffect(() => {
    if (isOpen) {
      if (!hasChanges) {
        setDraftProducts(products);
      }
      setEditingId(null);
      resetForm();
    }
  }, [isOpen, products]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      category: 'Comida',
      subcategory: '',
      stockCost: 0,
      plateSize: 'none'
    });
    setFormVariants([]);
    setFormRecipe([]);
    setFormSides([]);
    setActiveTab('DETAILS');
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setFormVariants(product.variants || []);
    setFormRecipe(product.recipe || []);
    setFormSides(product.sideOptions || []);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Borrar este producto de la lista?')) {
      const updated = draftProducts.filter(p => p.id !== id);
      setDraftProducts(updated);
      setHasChanges(true);
      if (editingId === id) {
        setEditingId(null);
        resetForm();
      }
    }
  };

  const handleUpdateDraft = () => {
    if (!formData.name) return;

    const newProduct: Product = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      price: Number(formData.price) || 0,
      category: formData.category as any || 'Comida',
      subcategory: formData.subcategory,
      stockCost: Number(formData.stockCost) || 0,
      variants: formVariants.length > 0 ? formVariants : undefined,
      recipe: formRecipe.length > 0 ? formRecipe : undefined,
      sideOptions: formSides.length > 0 ? formSides : undefined,
      plateSize: formData.plateSize as any || 'none'
    };

    let updatedList;
    if (editingId) {
      updatedList = draftProducts.map(p => p.id === editingId ? newProduct : p);
    } else {
      updatedList = [...draftProducts, newProduct];
    }

    setDraftProducts(updatedList);
    setHasChanges(true);
    setEditingId(null);
    resetForm();
  };

  const handleSaveChanges = () => {
    onUpdateProducts(draftProducts);
    setHasChanges(false);
    onClose();
  };

  // Recipe Helpers
  const addRecipeItem = (targetList: RecipeItem[], setTargetList: (l: RecipeItem[]) => void) => {
      setTargetList([...targetList, { inventoryId: '', quantity: 1 }]);
  };

  const updateRecipeItem = (targetList: RecipeItem[], setTargetList: (l: RecipeItem[]) => void, index: number, field: keyof RecipeItem, value: any) => {
      const newRecipe = [...targetList];
      newRecipe[index] = { ...newRecipe[index], [field]: value };
      setTargetList(newRecipe);
  };

  const removeRecipeItem = (targetList: RecipeItem[], setTargetList: (l: RecipeItem[]) => void, index: number) => {
      const newRecipe = [...targetList];
      newRecipe.splice(index, 1);
      setTargetList(newRecipe);
  };

  // Variant Helpers
  const addVariant = () => {
    setFormVariants([...formVariants, { id: Date.now().toString(), name: '', price: 0, stockCost: 0 }]);
  };
  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setFormVariants(formVariants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  const removeVariant = (id: string) => {
    setFormVariants(formVariants.filter(v => v.id !== id));
  };

  // Side Helpers
  const addSide = () => {
      setFormSides([...formSides, { id: Date.now().toString() + Math.random(), name: 'Nueva Guarnición', recipe: [] }]);
  };
  const updateSideName = (id: string, name: string) => {
      setFormSides(formSides.map(s => s.id === id ? {...s, name} : s));
  };
  const removeSide = (id: string) => {
      setFormSides(formSides.filter(s => s.id !== id));
  };
  // Manage Recipe INSIDE a side
  const addSideRecipeItem = (sideId: string) => {
      setFormSides(formSides.map(s => s.id === sideId ? {...s, recipe: [...(s.recipe || []), {inventoryId: '', quantity: 1}]} : s));
  };
  const updateSideRecipeItem = (sideId: string, idx: number, field: keyof RecipeItem, value: any) => {
      setFormSides(formSides.map(s => {
          if (s.id !== sideId) return s;
          const newRec = [...(s.recipe || [])];
          newRec[idx] = {...newRec[idx], [field]: value};
          return {...s, recipe: newRec};
      }));
  };
  const removeSideRecipeItem = (sideId: string, idx: number) => {
      setFormSides(formSides.map(s => {
          if (s.id !== sideId) return s;
          const newRec = [...(s.recipe || [])];
          newRec.splice(idx, 1);
          return {...s, recipe: newRec};
      }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Settings className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Administrar Menú</h2>
              <p className="text-xs text-gray-400">Edita productos, recetas y guarniciones</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 bg-gray-700 text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Left: Product List (Draft) */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
               <button 
                type="button"
                onClick={() => { setEditingId(null); resetForm(); }}
                className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" /> Agregar Producto
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {draftProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => handleEdit(product)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    editingId === product.id 
                      ? 'bg-white border-orange-500 shadow-lg ring-2 ring-orange-100' 
                      : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{product.name}</h4>
                      <div className="flex gap-2 text-xs mt-1">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{product.category}</span>
                      </div>
                    </div>
                    {editingId === product.id && <ChevronRight className="w-4 h-4 text-orange-500" />}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white">
                <button 
                  type="button"
                  onClick={handleSaveChanges}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-5 h-5" /> Guardar Todo
                </button>
            </div>
          </div>

          {/* Right: Edit Form */}
          <div className="w-2/3 p-0 bg-white flex flex-col">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-8 pt-4 gap-4">
                <button 
                    onClick={() => setActiveTab('DETAILS')}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'DETAILS' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Detalles y Precio
                </button>
                <button 
                    onClick={() => setActiveTab('RECIPE')}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'RECIPE' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Link className="w-4 h-4" /> Receta Base
                </button>
                <button 
                    onClick={() => setActiveTab('SIDES')}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'SIDES' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Utensils className="w-4 h-4" /> Guarniciones
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'DETAILS' ? (
                   <div className="space-y-6 max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            {editingId && (
                                <button type="button" onClick={() => handleDelete(editingId)} className="text-red-600 bg-red-50 px-3 py-2 rounded-lg font-bold text-xs hover:bg-red-100 border border-red-100">Eliminar</button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900"
                                >
                                    <option value="Comida">Comida</option>
                                    <option value="Bebida">Bebida</option>
                                    <option value="Extra">Extra</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subcategoría (Opcional)</label>
                                <select
                                    value={formData.subcategory || ''}
                                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    <option value="Pollo">Pollo</option>
                                    <option value="Alitas de pollo">Alitas de pollo</option>
                                    <option value="Fingers">Fingers</option>
                                    <option value="Nuggets">Nuggets</option>
                                    <option value="Salchipapa">Salchipapa</option>
                                </select>
                            </div>
                        </div>

                        {/* Inventory & Plate Settings */}
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 grid grid-cols-2 gap-4 mt-2">
                             <div>
                                 <label className="block text-xs font-bold text-yellow-800 uppercase mb-2">Plato Desechable (Si lleva)</label>
                                 <select 
                                    className="w-full p-2 text-sm border border-yellow-300 rounded-lg bg-white text-gray-900"
                                    value={formData.plateSize || 'none'}
                                    onChange={e => setFormData({...formData, plateSize: e.target.value as any})}
                                 >
                                     <option value="none">Ninguno / No usa</option>
                                     <option value="small">Plato Chico</option>
                                     <option value="large">Plato Grande</option>
                                 </select>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-200 mt-2">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Precio Base (Bs)</label>
                                <input
                                    type="number"
                                    min="0"
                                    disabled={formVariants.length > 0}
                                    value={formData.price || 0}
                                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                                    className={`w-full p-3 border border-gray-300 rounded-xl font-bold text-gray-900 ${formVariants.length > 0 ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Consumo Stock Pollo (Presas)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stockCost || 0}
                                    onChange={(e) => setFormData({...formData, stockCost: parseFloat(e.target.value)})}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900"
                                />
                             </div>
                        </div>

                        {/* Variants UI */}
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-800">Variantes de Precio</h4>
                                <button type="button" onClick={addVariant} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">Agregar Variante</button>
                             </div>
                             <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                {formVariants.length === 0 && <p className="text-gray-400 text-sm text-center">No hay variantes configuradas (Usa precio base).</p>}
                                {formVariants.map(v => (
                                    <div key={v.id} className="flex gap-2 items-center">
                                        <input className="flex-1 border border-gray-300 rounded p-2 text-sm bg-white text-gray-900" placeholder="Nombre (Ej. 6 Unidades)" value={v.name} onChange={e => updateVariant(v.id, 'name', e.target.value)} />
                                        <input className="w-24 border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 font-bold" placeholder="Precio" type="number" value={v.price} onChange={e => updateVariant(v.id, 'price', parseFloat(e.target.value))} />
                                        <button onClick={() => removeVariant(v.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                             </div>
                        </div>
                   </div>
                ) : activeTab === 'RECIPE' ? (
                   <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                            <p className="text-indigo-800 text-sm">
                                <strong>Receta Base del Producto:</strong> Insumos que SIEMPRE se descuentan al vender este producto. 
                                (Ej: Pollo crudo, bolsa).
                                <br/><span className="text-xs text-indigo-600 mt-1 block">* Para ingredientes que varían según el cliente elija (papas vs arroz), usa la pestaña "Guarniciones".</span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            {formRecipe.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 font-bold block mb-1">Item de Inventario</label>
                                        <select 
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={item.inventoryId}
                                            onChange={e => updateRecipeItem(formRecipe, setFormRecipe, idx, 'inventoryId', e.target.value)}
                                        >
                                            <option value="">-- Seleccionar Item --</option>
                                            {inventory.map(inv => (
                                                <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <label className="text-xs text-gray-500 font-bold block mb-1">Cant. a Descontar</label>
                                        <input 
                                            type="number" 
                                            step="0.001"
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold text-center bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={item.quantity}
                                            onChange={e => updateRecipeItem(formRecipe, setFormRecipe, idx, 'quantity', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="pt-5">
                                        <button onClick={() => removeRecipeItem(formRecipe, setFormRecipe, idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => addRecipeItem(formRecipe, setFormRecipe)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors flex justify-center items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Agregar Ingrediente Base
                            </button>
                        </div>
                   </div> 
                ) : (
                    // SIDE OPTIONS TAB
                    <div className="space-y-6">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                            <p className="text-green-800 text-sm">
                                <strong>Configuración de Guarniciones:</strong> Define las opciones que el cliente puede elegir (Completo, Canasta, etc.) y su costo específico de inventario.
                                <br/><span className="text-xs text-green-600 mt-1 block">Ej: "Canasta" descuenta más papa que "Completo".</span>
                            </p>
                        </div>

                        {formSides.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold">Este producto no tiene guarniciones configuradas.</p>
                                <button onClick={addSide} className="mt-2 text-green-600 font-bold hover:underline">Agregar Primera Opción</button>
                            </div>
                        )}

                        <div className="space-y-6">
                            {formSides.map((side, sIdx) => (
                                <div key={side.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <input 
                                            className="bg-white border border-gray-300 rounded px-2 py-1 font-bold text-gray-800 w-2/3"
                                            value={side.name}
                                            onChange={e => updateSideName(side.id, e.target.value)}
                                            placeholder="Nombre Opción (Ej: Canasta)"
                                        />
                                        <button onClick={() => removeSide(side.id)} className="text-red-500 text-xs font-bold hover:underline">Eliminar Opción</button>
                                    </div>
                                    
                                    {/* Mini Recipe Editor for this Side */}
                                    <div className="space-y-2 pl-4 border-l-2 border-gray-300">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Receta de esta opción:</p>
                                        {(side.recipe || []).map((item, rIdx) => (
                                            <div key={rIdx} className="flex gap-2 items-center">
                                                 <select 
                                                    className="flex-1 p-1 text-sm border border-gray-300 rounded bg-white text-gray-900"
                                                    value={item.inventoryId}
                                                    onChange={e => updateSideRecipeItem(side.id, rIdx, 'inventoryId', e.target.value)}
                                                >
                                                    <option value="">- Item -</option>
                                                    {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                                                </select>
                                                <input 
                                                    type="number" className="w-20 p-1 text-sm border border-gray-300 rounded text-center bg-white text-gray-900"
                                                    value={item.quantity} onChange={e => updateSideRecipeItem(side.id, rIdx, 'quantity', parseFloat(e.target.value))}
                                                />
                                                <button onClick={() => removeSideRecipeItem(side.id, rIdx)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addSideRecipeItem(side.id)} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">+ Agregar Insumo</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                         <button 
                            onClick={addSide}
                            className="w-full py-3 border-2 border-dashed border-green-300 text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors flex justify-center items-center gap-2 mt-4"
                        >
                            <Plus className="w-5 h-5" /> Nueva Opción de Guarnición
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-4">
                 <button onClick={() => { setEditingId(null); resetForm(); }} className="flex-1 py-3 bg-white border border-gray-300 font-bold text-gray-600 rounded-xl hover:bg-gray-100">Cancelar</button>
                 <button onClick={handleUpdateDraft} className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg">
                     {editingId ? 'Actualizar Producto' : 'Agregar a Lista'}
                 </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuSettingsModal;
