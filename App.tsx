
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Menu, TrendingDown, Wand2, ChefHat, ExternalLink } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import EconomyView from './components/EconomyView'; // New
import InventoryView from './components/InventoryView'; 

// Modals
import NewSaleModal from './components/NewSaleModal';
import PaymentModal from './components/PaymentModal';
import ExpenseModal from './components/ExpenseModal';
import MenuSettingsModal from './components/MenuSettingsModal';
import StockControlModal from './components/StockControlModal';
import CommandModal from './components/CommandModal';

// Services & Types
import { analyzeBusinessDay } from './services/geminiService';
import { Sale, SaleItem, SaleStatus, PaymentMethod, Expense, Product, StockLog, ParsedCommand, SaleDraft, InventoryItem, KitchenProductionRule, TransactionType, OrderType } from './types';
import { DEFAULT_MENU, DEFAULT_INVENTORY, KITCHEN_RULES } from './constants';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error loading key ${key} from storage`, e);
    return fallback;
  }
};

const getTodayStr = () => new Date().toDateString();

const App: React.FC = () => {
  // --- Global State ---
  const [currentView, setCurrentView] = useState<'dashboard' | 'economy' | 'inventory'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Data State ---
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage('deli_sales', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('deli_expenses', []));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('deli_products', DEFAULT_MENU));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadFromStorage('deli_inventory', DEFAULT_INVENTORY));
  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => loadFromStorage('deli_stock_logs', []));
  
  // NEW: Global Cash Flow
  const [globalCash, setGlobalCash] = useState<number>(() => loadFromStorage('deli_global_cash', 0));
  
  const [chickenStock, setChickenStock] = useState<number>(0);
  const [cutsStock, setCutsStock] = useState<number>(0);

  // --- Modal Visibility State ---
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isMenuSettingsOpen, setIsMenuSettingsOpen] = useState(false);
  const [isStockControlOpen, setIsStockControlOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  
  // --- Transaction State ---
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [aiSaleDraft, setAiSaleDraft] = useState<SaleDraft | null>(null);
  
  // NEW: Minimized Drafts
  const [drafts, setDrafts] = useState<SaleDraft[]>(() => loadFromStorage('deli_drafts', []));

  // --- AI State ---
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('deli_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('deli_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('deli_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('deli_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('deli_stock_logs', JSON.stringify(stockLogs)); }, [stockLogs]);
  useEffect(() => { localStorage.setItem('deli_global_cash', JSON.stringify(globalCash)); }, [globalCash]);
  useEffect(() => { localStorage.setItem('deli_drafts', JSON.stringify(drafts)); }, [drafts]);

  // --- Stock Logic Calculation (Fried Chicken pieces specific) ---
  useEffect(() => {
    const todayStr = getTodayStr();
    
    // Logs (Added Today)
    const todaysAddedPieces = stockLogs
      .filter(log => new Date(log.timestamp).toDateString() === todayStr)
      .reduce((acc, log) => acc + log.totalPieces, 0);

    // Sales Consumption (Today)
    let piecesConsumed = 0;
    let cutsConsumed = 0;
    
    sales.filter(s => new Date(s.timestamp).toDateString() === todayStr).forEach(sale => {
      sale.items.forEach(item => {
        if (item.productName.toLowerCase().includes('corte') || item.productName.toLowerCase().includes('yapa') || item.productId === 'e_corte') {
             cutsConsumed += item.quantity;
        } else {
             piecesConsumed += (item.quantity * (item.stockCostPerUnit || 0));
        }
      });
    });

    // Conversions
    const convertedLog = expenses
        .filter(e => e.description.startsWith('INTERNAL_CONVERT') && new Date(e.timestamp).toDateString() === todayStr);
    
    let piecesConvertedToCuts = 0;
    convertedLog.forEach(e => {
        const match = e.description.match(/INTERNAL_CONVERT_(\d+)/);
        if (match) piecesConvertedToCuts += parseInt(match[1]);
    });

    const totalCutsProduced = piecesConvertedToCuts * 3;

    setChickenStock(todaysAddedPieces - piecesConsumed - piecesConvertedToCuts);
    setCutsStock(totalCutsProduced - cutsConsumed);

  }, [sales, stockLogs, expenses]);


  // --- HANDLERS ---

  // 1. Kitchen Production (Deduct Ingredients -> Add Cooked Chicken Log OR Produce Sauce)
  const handleKitchenProduction = (rule: KitchenProductionRule, multiplier: number, customStartTime?: string) => {
      // 1. Deduct raw ingredients
      const newInventory = [...inventory];
      rule.inputs.forEach(input => {
          const itemIdx = newInventory.findIndex(i => i.id === input.inventoryId);
          if (itemIdx >= 0) {
              newInventory[itemIdx].quantity = Math.max(0, newInventory[itemIdx].quantity - (input.quantity * multiplier));
          }
      });

      // 2. Add Produced Item (if it's an inventory item like Llajua)
      if (rule.outputs.inventoryId && rule.outputs.quantity) {
          const outIdx = newInventory.findIndex(i => i.id === rule.outputs.inventoryId);
          if (outIdx >= 0) {
              newInventory[outIdx].quantity += (rule.outputs.quantity * multiplier);
          }
      }
      setInventory(newInventory);

      // Calculate timestamps
      const start = customStartTime 
        ? new Date(new Date().toDateString() + ' ' + customStartTime) 
        : new Date();
      
      const targetTime = new Date(start.getTime() + rule.cookingTimeMinutes * 60000);

      // 3. Log it (Useful for timers)
      const stockOutput = rule.outputs.stockLogChicken || 0;
      const totalChickens = stockOutput * multiplier;
      
      if (stockOutput > 0 || rule.cookingTimeMinutes > 0) {
          const newLog: StockLog = { 
              id: Date.now().toString(), 
              timestamp: start.toISOString(),
              targetCompletionTime: targetTime.toISOString(),
              ruleName: rule.name,
              quantityChickens: totalChickens, 
              totalPieces: totalChickens * 8 
          };
          setStockLogs(prev => [newLog, ...prev]);
      }
  };

  // 2. Expenses / Purchases / Withdrawals
  const handleFinancialTransaction = (description: string, amount: number, type: TransactionType, inventoryDetails?: {id: string, qty: number}) => {
      const newExpense: Expense = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          description,
          amount,
          type
      };
      setExpenses(prev => [newExpense, ...prev]);

      if (type === 'EXPENSE_INVENTORY' && inventoryDetails) {
          // Subtract money, Add Stock
          setGlobalCash(prev => prev - amount);
          
          setInventory(prev => prev.map(item => {
              if (item.id === inventoryDetails.id) {
                  return { ...item, quantity: item.quantity + inventoryDetails.qty };
              }
              return item;
          }));
      } else if (type === 'EXPENSE_OPERATIONAL' || type === 'WITHDRAWAL') {
          setGlobalCash(prev => prev - amount);
      } else if (type === 'DEPOSIT') {
          setGlobalCash(prev => prev + amount);
      }
  };

  const handleConvertCut = (quantityPieces: number) => {
    handleFinancialTransaction(`INTERNAL_CONVERT_${quantityPieces}_PIECES`, 0, 'EXPENSE_OPERATIONAL');
  };

  // 3. Save Sale (Update Revenue + Deduct Inventory based on Recipe + Logic)
  const handleSaveSale = (items: SaleItem[], orderType: OrderType, customerName: string, customDate?: string, delivered: boolean = false) => {
    // Check Auto-Cuts logic (Existing)
    let requiredCuts = 0;
    items.forEach(item => {
         if (item.productName.toLowerCase().includes('corte') || item.productName.toLowerCase().includes('yapa') || item.productId === 'e_corte') {
            requiredCuts += item.quantity;
        }
    });
    if (requiredCuts > 0 && cutsStock < requiredCuts) {
        const deficit = requiredCuts - cutsStock;
        handleConvertCut(Math.ceil(deficit / 3));
    }

    // DEDUCT INVENTORY
    const newInventory = [...inventory];
    const isTakeaway = orderType === OrderType.TAKEAWAY;

    items.forEach(saleItem => {
        const product = products.find(p => p.id === saleItem.productId);
        if (!product) return;

        // 1. Base Recipe Deduction
        if (product.recipe) {
             product.recipe.forEach(ing => {
                 const invIdx = newInventory.findIndex(i => i.id === ing.inventoryId);
                 if (invIdx >= 0) {
                     const deductAmount = ing.quantity * saleItem.quantity;
                     newInventory[invIdx].quantity = Math.max(0, newInventory[invIdx].quantity - deductAmount);
                 }
             });
        }

        // 2. Specific Side Dish Recipe Deduction
        if (saleItem.selectedSides && product.sideOptions) {
            // Match the name back to the option ID to find recipe
            // Note: SaleItem stores name for display, we check match.
            const selectedSide = product.sideOptions.find(s => s.name === saleItem.selectedSides);
            if (selectedSide && selectedSide.recipe) {
                selectedSide.recipe.forEach(ing => {
                    const invIdx = newInventory.findIndex(i => i.id === ing.inventoryId);
                    if (invIdx >= 0) {
                         const deductAmount = ing.quantity * saleItem.quantity;
                         newInventory[invIdx].quantity = Math.max(0, newInventory[invIdx].quantity - deductAmount);
                    }
                });
            }
        }

        // 3. Napkin Deduction (1 per unit sold)
        // Find napkin item
        const napkinIdx = newInventory.findIndex(i => i.id === 'inv_servilletas');
        if (napkinIdx >= 0) {
             newInventory[napkinIdx].quantity = Math.max(0, newInventory[napkinIdx].quantity - saleItem.quantity);
        }

        // 4. Plate Deduction (Only if Takeaway & product needs plate)
        if (isTakeaway && product.plateSize && product.plateSize !== 'none') {
             const plateId = product.plateSize === 'large' ? 'inv_plato_grande' : 'inv_plato_chico';
             const plateIdx = newInventory.findIndex(i => i.id === plateId);
             if (plateIdx >= 0) {
                  newInventory[plateIdx].quantity = Math.max(0, newInventory[plateIdx].quantity - saleItem.quantity);
             }
        }
    });
    setInventory(newInventory);

    // Save Sale
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = aiSaleDraft?.discount || (saleToEdit ? saleToEdit.discount : 0);
    let saleId = '';

    if (saleToEdit) {
      saleId = saleToEdit.id;
      const updatedSale: Sale = {
        ...saleToEdit,
        timestamp: customDate || saleToEdit.timestamp,
        customerName,
        orderType,
        items, subtotal, discount,
        finalTotal: Math.max(0, subtotal - discount),
        delivered: delivered
      };
      setSales(sales.map(s => s.id === updatedSale.id ? updatedSale : s));
      setSaleToEdit(null);
    } else {
      saleId = Date.now().toString();
      const newSale: Sale = {
        id: saleId,
        timestamp: customDate || new Date().toISOString(),
        customerName,
        orderType,
        items, subtotal, discount,
        finalTotal: Math.max(0, subtotal - discount),
        status: aiSaleDraft?.paid ? SaleStatus.PAGADO : SaleStatus.PENDIENTE,
        paymentMethod: aiSaleDraft?.paymentMethod || null,
        delivered: delivered || (aiSaleDraft?.delivered || false),
      };
      setSales([newSale, ...sales]);
    }
    setAiSaleDraft(null);

    // Add to cash if AI says paid
    if (aiSaleDraft?.paid && aiSaleDraft.paymentMethod && !saleToEdit) {
         setGlobalCash(prev => prev + Math.max(0, subtotal - discount));
    }
  };

  const handleConfirmPayment = (saleId: string, method: PaymentMethod, discount: number) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    const finalAmount = Math.max(0, sale.subtotal - discount);

    setSales(sales.map(s => {
      if (s.id === saleId) {
        return {
          ...s,
          status: SaleStatus.PAGADO,
          paymentMethod: method,
          discount: discount,
          finalTotal: finalAmount
        };
      }
      return s;
    }));
    setGlobalCash(prev => prev + finalAmount);
  };
  
  // Draft / Minimize Handlers
  const handleMinimizeDraft = (draft: SaleDraft) => {
    // If we are minimizing, we close the current modal and add to list
    setDrafts(prev => [...prev, draft]);
    setIsNewSaleOpen(false);
    setAiSaleDraft(null);
    setSaleToEdit(null);
  };

  const handleResumeDraft = (index: number) => {
    const draft = drafts[index];
    const newDrafts = drafts.filter((_, i) => i !== index);
    setDrafts(newDrafts);
    
    // Check if it was an existing sale being edited
    if (draft.originalSaleId) {
        const original = sales.find(s => s.id === draft.originalSaleId);
        if (original) {
            setSaleToEdit(original); // Load original ID
            // BUT we must overlay the draft changes, so we pass initialDraft too?
            // Simplified: If editing, we just reopen the edit modal. 
            // If the user made changes before minimizing, those are in `draft`.
            // So we treat it as a "draft" that happens to have an ID.
            // NewSaleModal uses initialDraft preferentially if provided.
        }
    } else {
        setSaleToEdit(null);
    }
    
    setAiSaleDraft(draft);
    setIsNewSaleOpen(true);
  };

  const handleUpdateStockLog = (id: string, newTimestamp: string) => {
    setStockLogs(prev => prev.map(log => log.id === id ? { ...log, timestamp: newTimestamp } : log));
  };
  const handleEditSale = (sale: Sale) => {
    setSaleToEdit(sale);
    setAiSaleDraft(null);
    setIsNewSaleOpen(true);
  };
  const handleOpenPayment = (sale: Sale) => {
    setSelectedSaleForPayment(sale);
    setIsPaymentOpen(true);
  };
  const handleToggleDelivered = (saleId: string) => {
    setSales(sales.map(s => s.id === saleId ? { ...s, delivered: !s.delivered } : s));
  };
  
  // AI Command Execution
  const handleExecuteCommand = (command: ParsedCommand) => {
    if (command.type === 'SALE' && command.items) {
       const saleItems: SaleItem[] = [];
       command.items.forEach(cItem => {
        const product = products.find(p => p.id === cItem.productId);
        if (!product) return;
        let variant = undefined;
        let price = product.price;
        let stockCost = product.stockCost || 0;
        let variantName = undefined;

        if (cItem.variantId && product.variants) {
          variant = product.variants.find(v => v.id === cItem.variantId);
          if (variant) {
             price = variant.price;
             stockCost = variant.stockCost ?? product.stockCost ?? 0;
             variantName = variant.name;
          }
        }
        saleItems.push({
          id: Date.now().toString() + Math.random(),
          productId: product.id,
          productName: product.name,
          variantName,
          quantity: cItem.quantity,
          unitPrice: price,
          total: price * cItem.quantity,
          stockCostPerUnit: stockCost
        });
      });
      if (saleItems.length > 0) {
        setSaleToEdit(null);
        setAiSaleDraft({
          items: saleItems,
          discount: command.discount,
          delivered: command.delivered,
          paid: command.paid,
          paymentMethod: command.paymentMethod
        });
        setIsNewSaleOpen(true);
      }
    } else if (command.type === 'EXPENSE' && command.description && command.amount) {
      handleFinancialTransaction(command.description, command.amount, 'EXPENSE_OPERATIONAL');
    } else if (command.type === 'ADD_STOCK' && command.quantity) {
      handleKitchenProduction(KITCHEN_RULES[0], command.quantity); 
    }
  };

  const handleGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);
    try {
      const result = await analyzeBusinessDay(sales, expenses);
      setAiAnalysis(result);
    } catch (err: any) {
      setAiError(err.message || "Error desconocido");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- Sidebar Component --- */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenStock={() => setIsStockControlOpen(true)}
        onOpenMenu={() => setIsMenuSettingsOpen(true)}
        onOpenExpense={() => setIsExpenseOpen(true)}
      />

      {/* --- Top Navbar --- */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100 px-4 h-16 flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            {currentView === 'dashboard' && 'Tablero Principal'}
            {currentView === 'economy' && 'Economía y Reportes'}
            {currentView === 'inventory' && 'Inventario General'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
           {currentView === 'dashboard' && (
             <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100 shadow-sm animate-fadeIn">
                <ChefHat className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-700">{chickenStock} Presas</span>
             </div>
           )}
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'economy' ? (
          <EconomyView sales={sales} expenses={expenses} products={products} />
        ) : currentView === 'inventory' ? (
          <InventoryView inventory={inventory} onUpdateInventory={setInventory} />
        ) : (
          <DashboardView 
            sales={sales}
            expenses={expenses}
            chickenStock={chickenStock}
            cutsStock={cutsStock}
            stockLogs={stockLogs} 
            onOpenStockControl={() => setIsStockControlOpen(true)}
            onOpenExpense={() => setIsExpenseOpen(true)}
            onEditSale={handleEditSale}
            onToggleDelivered={handleToggleDelivered}
            onOpenPayment={handleOpenPayment}
            aiAnalysis={aiAnalysis}
            isAnalyzing={isAnalyzing}
            aiError={aiError}
            onAnalyze={handleGeminiAnalysis}
            onClearAnalysis={() => setAiAnalysis(null)}
          />
        )}
      </main>

      {/* --- Floating Action Buttons (FAB) --- */}
      {currentView === 'dashboard' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
          
          {/* Minimized Draft Bubbles */}
          <div className="absolute bottom-24 right-0 flex flex-col gap-3 items-end pointer-events-none w-64">
             {drafts.map((draft, idx) => (
                <button 
                  key={idx}
                  className="pointer-events-auto bg-white border-2 border-orange-500 shadow-xl rounded-2xl p-2.5 flex items-center gap-3 animate-bounce-in transform hover:scale-105 transition-all w-full relative group"
                  onClick={() => handleResumeDraft(idx)}
                >
                  <div className="bg-orange-100 w-8 h-8 flex items-center justify-center rounded-full text-orange-600 font-bold text-xs shrink-0">
                      {draft.items.reduce((a, b) => a + b.quantity, 0)}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{draft.customerName || 'Cliente Nuevo'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{draft.items.reduce((a,b)=>a+b.total,0)} Bs • {draft.orderType === OrderType.TAKEAWAY ? 'Llevar' : 'Mesa'}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                  
                  {draft.originalSaleId && (
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm font-bold">Editando</span>
                  )}
                </button>
             ))}
          </div>

          <button
            onClick={() => setIsCommandModalOpen(true)}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-indigo-400 group relative"
            title="Asistente de Voz / Texto"
          >
            <Wand2 className="w-7 h-7" />
          </button>
          
          <button
            onClick={() => setIsExpenseOpen(true)}
            className="md:hidden w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-red-400"
          >
            <TrendingDown className="w-7 h-7" />
          </button>

          <button
            onClick={() => {
              setSaleToEdit(null);
              setAiSaleDraft(null);
              setIsNewSaleOpen(true);
            }}
            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-xl shadow-orange-300 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-4 border-white"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* --- Modals --- */}
      <NewSaleModal 
        isOpen={isNewSaleOpen} 
        onClose={() => setIsNewSaleOpen(false)} 
        onSave={handleSaveSale}
        onMinimize={handleMinimizeDraft}
        products={products}
        initialSale={saleToEdit}
        initialDraft={aiSaleDraft}
      />
      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        sale={selectedSaleForPayment}
        onConfirm={handleConfirmPayment}
      />
      <ExpenseModal 
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        inventory={inventory}
        totalCash={globalCash}
        onSaveExpense={handleFinancialTransaction}
      />
      <MenuSettingsModal
        isOpen={isMenuSettingsOpen}
        onClose={() => setIsMenuSettingsOpen(false)}
        products={products}
        inventory={inventory}
        onUpdateProducts={setProducts}
      />
      <StockControlModal
        isOpen={isStockControlOpen}
        onClose={() => setIsStockControlOpen(false)}
        stockLogs={stockLogs}
        inventory={inventory}
        onKitchenProduction={handleKitchenProduction}
        onConvertCut={handleConvertCut}
      />
      <CommandModal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
        products={products}
        onExecute={handleExecuteCommand}
      />
    </div>
  );
};

export default App;
