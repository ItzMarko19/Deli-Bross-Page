
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, ShoppingCart, Check, User, Utensils, ShoppingBag, Scissors, Minus } from 'lucide-react';
import { Product, SaleItem, Sale, SaleDraft, OrderType } from '../types';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: SaleItem[], orderType: OrderType, customerName: string, customDate?: string, delivered?: boolean) => void;
  onMinimize: (draft: SaleDraft) => void;
  products: Product[];
  initialSale?: Sale | null;
  initialDraft?: SaleDraft | null;
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({ isOpen, onClose, onSave, onMinimize, products, initialSale, initialDraft }) => {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('Comida');
  
  // States
  const [saleDate, setSaleDate] = useState<string>('');
  const [isDelivered, setIsDelivered] = useState<boolean>(false);
  const [includeYapa, setIncludeYapa] = useState<boolean>(false);
  
  // New Header States
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [customerName, setCustomerName] = useState<string>('');

  // Selection State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  
  // Customizations
  const [selectedSideId, setSelectedSideId] = useState<string>('');
  const [familiarPieces, setFamiliarPieces] = useState<{p1: string, p2: string}>({p1: 'Pierna', p2: 'Entrepierna'});

  // Group products
  const groupedProducts = useMemo(() => {
    const categoryProducts = products.filter(p => p.category === selectedCategory);
    const groups: {[key: string]: Product[]} = {};
    categoryProducts.forEach(p => {
      const sub = p.subcategory || 'Otros';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(p);
    });
    return groups;
  }, [products, selectedCategory]);

  // Init
  useEffect(() => {
    if (isOpen) {
      if (initialSale) {
        setItems(initialSale.items);
        const date = new Date(initialSale.timestamp);
        const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setSaleDate(localIso);
        setIsDelivered(initialSale.delivered);
        setOrderType(initialSale.orderType || OrderType.DINE_IN);
        setCustomerName(initialSale.customerName || '');
      } else if (initialDraft) {
        setItems(initialDraft.items);
        setSaleDate('');
        setIsDelivered(initialDraft.delivered || false);
        setOrderType(initialDraft.orderType || OrderType.DINE_IN);
        setCustomerName(initialDraft.customerName || '');
      } else {
        setItems([]);
        setSaleDate('');
        setIsDelivered(false);
        setOrderType(OrderType.DINE_IN);
        setCustomerName('');
      }
      setQuantity(1);
      setSelectedCategory('Comida');
      setSelectedProductId('');
      setSelectedVariantId('');
      setIncludeYapa(false);
      setFamiliarPieces({p1: 'Pierna', p2: 'Entrepierna'});
      setSelectedSideId('');
    }
  }, [isOpen, initialSale, initialDraft]);

  const handleProductSelect = (product: Product) => {
    setSelectedProductId(product.id);
    if (product.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId('');
    }
    
    // Auto Select first side if available
    if (product.sideOptions && product.sideOptions.length > 0) {
        setSelectedSideId(product.sideOptions[0].id);
    } else {
        setSelectedSideId('');
    }

    setQuantity(1);
    setIncludeYapa(false);
  };

  const currentProduct = products.find(p => p.id === selectedProductId);
  const currentVariant = currentProduct?.variants?.find(v => v.id === selectedVariantId);

  const unitPrice = currentVariant ? currentVariant.price : (currentProduct?.price || 0);
  const stockConsumption = currentVariant?.stockCost ?? currentProduct?.stockCost ?? 0;
  const currentTotal = unitPrice * quantity;
  const grandTotal = items.reduce((acc, item) => acc + item.total, 0);

  const isFamiliarVariant = currentVariant?.id === 'v_pd_familiar';
  const isChickenProduct = currentProduct?.subcategory?.toLowerCase().includes('pollo');

  // Validate Familiar Selection
  const isValidFamiliar = () => {
      if (!isFamiliarVariant) return true;
      const combo = [familiarPieces.p1, familiarPieces.p2].sort().join('+');
      // Classic: Pierna+Entrepierna
      if (combo === 'Entrepierna+Pierna') return false; 
      // Supreme: Ala+Pecho
      if (combo === 'Ala+Pecho') return false;
      return true;
  };

  const handleAddItem = () => {
    if (quantity <= 0 || !currentProduct) return;

    if (isFamiliarVariant && !isValidFamiliar()) {
        alert("Para 'Clásico' (Pierna+Entrepierna) o 'Supremo' (Ala+Pecho), por favor selecciona la variante correspondiente del menú, no uses Familiar.");
        return;
    }

    let targetVariantName = currentVariant ? currentVariant.name : undefined;
    
    // Customize name for Familiar
    if (isFamiliarVariant) {
        targetVariantName = `Familiar (${familiarPieces.p1} + ${familiarPieces.p2})`;
    }

    // Get selected side name
    let selectedSideName = undefined;
    if (currentProduct.sideOptions && currentProduct.sideOptions.length > 0 && selectedSideId) {
        const s = currentProduct.sideOptions.find(opt => opt.id === selectedSideId);
        if (s) selectedSideName = s.name;
    }

    // Add Main Item
    const newItem: SaleItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      productId: currentProduct.id,
      productName: currentProduct.name,
      variantName: targetVariantName,
      quantity: quantity,
      unitPrice: unitPrice,
      total: currentTotal,
      stockCostPerUnit: stockConsumption,
      selectedSides: selectedSideName // Pass name for display
    };
    
    // Add Yapa if selected
    const newItemsList = [...items, newItem];

    if (includeYapa) {
       const yapaProduct = products.find(p => p.id === 'e_corte'); 
       if (yapaProduct) {
           newItemsList.push({
               id: Date.now().toString() + 'yapa',
               productId: yapaProduct.id,
               productName: yapaProduct.name,
               quantity: quantity, 
               unitPrice: 0,
               total: 0,
               stockCostPerUnit: 0 
           });
       }
    }

    setItems(newItemsList);
    setQuantity(1);
    setIncludeYapa(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSaveSale = () => {
    if (items.length === 0) return;
    let finalDate = undefined;
    if ((initialSale || initialDraft) && saleDate) {
      finalDate = new Date(saleDate).toISOString();
    }
    onSave(items, orderType, customerName || 'Cliente Casual', finalDate, isDelivered);
    onClose();
  };
  
  const handleMinimize = () => {
    const draft: SaleDraft = {
        items,
        orderType,
        customerName,
        delivered: isDelivered,
        originalSaleId: initialSale?.id, // Keep tracking if we were editing
        discount: initialSale?.discount || initialDraft?.discount || 0,
        paid: initialSale?.status === 'Pagado' || initialDraft?.paid,
        paymentMethod: initialSale?.paymentMethod || initialDraft?.paymentMethod,
        timestamp: Date.now()
    };
    onMinimize(draft);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex overflow-hidden">
        
        {/* Left: Product Selector */}
        <div className="w-2/3 flex flex-col bg-gray-50 border-r border-gray-200">
          
          {/* Order Header */}
          <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-4 shadow-sm z-10">
              {/* Type Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setOrderType(OrderType.DINE_IN)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${orderType === OrderType.DINE_IN ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      <Utensils className="w-4 h-4" /> Mesa
                  </button>
                  <button 
                    onClick={() => setOrderType(OrderType.TAKEAWAY)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${orderType === OrderType.TAKEAWAY ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      <ShoppingBag className="w-4 h-4" /> Llevar
                  </button>
              </div>

              {/* Customer Input */}
              <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="Nombre del Cliente (Opcional)"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 rounded-xl text-sm font-medium outline-none transition-all text-gray-900"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
              </div>
          </div>

          <div className="flex bg-white border-b border-gray-200 px-4 pt-4 gap-2">
            {['Comida', 'Bebida', 'Extra'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all ${
                  selectedCategory === cat 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {(Object.entries(groupedProducts) as [string, Product[]][]).map(([subcat, prods]) => (
              <div key={subcat} className="mb-6">
                <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-3 px-1">{subcat}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {prods.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden group ${
                        selectedProductId === product.id
                          ? 'bg-white border-orange-500 ring-2 ring-orange-200 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md'
                      }`}
                    >
                      <div className="font-bold text-gray-800 leading-tight mb-1">{product.name}</div>
                      {product.variants ? (
                        <div className="text-xs text-orange-600 font-medium bg-orange-50 inline-block px-1.5 py-0.5 rounded">
                          {product.variants.length} Opciones
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-gray-700">{product.price} Bs</div>
                      )}
                      
                      {selectedProductId === product.id && (
                        <div className="absolute top-2 right-2 text-orange-500">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-1/3 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              {initialSale ? 'Editar Pedido' : 'Carrito'}
            </h2>
            <div className="flex gap-2">
                <button 
                  onClick={handleMinimize} 
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                  title="Minimizar (Guardar Borrador)"
                >
                    <Minus className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
          </div>

          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0 max-h-[50%] overflow-y-auto custom-scrollbar">
            {currentProduct ? (
              <div className="animate-fadeIn">
                <h3 className="font-bold text-lg text-gray-800 mb-4">{currentProduct.name}</h3>
                
                {/* Variant Selector */}
                {currentProduct.variants && currentProduct.variants.length > 0 && (
                  <div className="mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Variante</label>
                    <div className="grid grid-cols-1 gap-2">
                      {currentProduct.variants.map(variant => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`p-2 rounded-lg text-sm border transition-all text-left flex justify-between ${
                            selectedVariantId === variant.id
                              ? 'bg-orange-500 text-white border-orange-500 shadow-md font-bold'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span>{variant.name}</span>
                          <span>{variant.price} Bs</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pollo Familiar Custom Pieces */}
                {isFamiliarVariant && (
                   <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <label className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 block">Elige 2 Presas (Personalizado)</label>
                      <div className="flex gap-2">
                          <select className="flex-1 text-sm rounded border-gray-200 p-1 text-gray-900" value={familiarPieces.p1} onChange={e => setFamiliarPieces({...familiarPieces, p1: e.target.value})}>
                              <option>Pierna</option><option>Entrepierna</option><option>Pecho</option><option>Ala</option>
                          </select>
                          <select className="flex-1 text-sm rounded border-gray-200 p-1 text-gray-900" value={familiarPieces.p2} onChange={e => setFamiliarPieces({...familiarPieces, p2: e.target.value})}>
                              <option>Entrepierna</option><option>Pierna</option><option>Pecho</option><option>Ala</option>
                          </select>
                      </div>
                      <p className="text-[10px] text-orange-500 mt-1 leading-tight">
                         * Si deseas Pierna+Entrepierna usa "Clásico". <br/>
                         * Si deseas Ala+Pecho usa "Supremo".
                      </p>
                   </div>
                )}

                {/* Sides Selector (Dynamic) */}
                {currentProduct.sideOptions && currentProduct.sideOptions.length > 0 && (
                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Guarnición</label>
                        <select 
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 font-bold focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                            value={selectedSideId}
                            onChange={(e) => setSelectedSideId(e.target.value)}
                        >
                            {currentProduct.sideOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Yapa Toggle */}
                {isChickenProduct && (
                    <div className="flex items-center justify-between mb-4 bg-purple-50 p-2 rounded-xl border border-purple-100 cursor-pointer select-none" onClick={() => setIncludeYapa(!includeYapa)}>
                        <div className="flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-bold text-purple-800">¿Incluir Yapa?</span>
                        </div>
                        <div className={`w-8 h-5 rounded-full p-1 transition-colors relative ${includeYapa ? 'bg-purple-600' : 'bg-gray-300'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${includeYapa ? 'translate-x-3' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                )}

                {/* Quantity & Add */}
                <div className="flex gap-3 items-end">
                   <div className="flex-1">
                      <div className="flex items-center h-10 bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full hover:bg-gray-100 font-bold text-lg text-gray-700">-</button>
                        <input type="number" className="w-full h-full text-center font-bold text-lg outline-none text-gray-900" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full hover:bg-gray-100 font-bold text-lg text-gray-700">+</button>
                      </div>
                   </div>
                   <button
                    onClick={handleAddItem}
                    className="flex-1 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                    >
                    <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400"><p>Selecciona un producto</p></div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div>
                  <div className="font-bold text-gray-800 text-sm">
                    <span className="text-orange-600 mr-1">{item.quantity}x</span> {item.productName}
                  </div>
                  {item.variantName && <div className="text-xs text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1 mr-1">{item.variantName}</div>}
                  {item.selectedSides && <div className="text-[10px] text-blue-600 border border-blue-100 inline-block px-1.5 py-0.5 rounded mt-1">{item.selectedSides}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700 mr-1 text-sm">{item.total} Bs</span>
                  <button onClick={() => handleRemoveItem(item.id)} className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-900 text-white">
            <div className="flex justify-between items-end mb-4">
              <div className="text-sm text-gray-400">
                  <p>{orderType === OrderType.TAKEAWAY ? 'Para Llevar' : 'Mesa'}</p>
                  <p className="font-bold text-white">{customerName || 'Cliente Casual'}</p>
              </div>
              <span className="text-3xl font-bold text-green-400">{grandTotal} <span className="text-sm text-green-600/70">Bs</span></span>
            </div>
            <button
              onClick={handleSaveSale}
              disabled={items.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                items.length === 0 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-green-900/50'
              }`}
            >
              Confirmar {orderType === OrderType.TAKEAWAY ? 'Para Llevar' : 'Pedido'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewSaleModal;
