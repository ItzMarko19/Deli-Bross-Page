
export enum PaymentMethod {
  QR = 'QR',
  EFECTIVO = 'Efectivo',
  TARJETA = 'Tarjeta',
  PENDIENTE = 'Pendiente'
}

export enum SaleStatus {
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado'
}

export enum OrderType {
  DINE_IN = 'Mesa',
  TAKEAWAY = 'Para Llevar'
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stockCost?: number; // Legacy: Chicken pieces
}

// Mapping sale to inventory
export interface RecipeItem {
  inventoryId: string;
  quantity: number; // Amount to deduct per sale unit
}

export interface SideOption {
  id: string;
  name: string;
  recipe?: RecipeItem[]; // Specific inventory cost for this side (e.g. Canasta uses more potatoes than Completo)
}

export interface Product {
  id: string;
  name: string;
  price: number; // Base price
  category: 'Comida' | 'Bebida' | 'Extra';
  subcategory?: string; 
  variants?: ProductVariant[];
  stockCost?: number; // Consumption of fried chicken pieces
  recipe?: RecipeItem[]; // Base Ingredients (e.g. The meat itself)
  
  // New Configs
  plateSize?: 'none' | 'small' | 'large'; // Which disposable plate to use if takeaway
  sideOptions?: SideOption[]; // Configurable sides list with their own recipes
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  stockCostPerUnit?: number;
  // New details
  selectedSides?: string; // e.g. "Solo Papa"
  customization?: string; // e.g. "Pecho + Ala"
}

export interface Sale {
  id: string;
  timestamp: string; // ISO String
  customerName?: string; // New: Track by customer
  orderType: OrderType; // New: Eat in vs Takeaway
  items: SaleItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  status: SaleStatus;
  paymentMethod: PaymentMethod | null;
  delivered: boolean;
}

// --- NEW INVENTORY TYPES ---

export type InventoryCategory = 'Insumo' | 'Bebida' | 'Desechable' | 'Salsa' | 'Otro';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: 'unid' | 'kg' | 'lt' | 'gr' | 'ml' | 'paq';
  minThreshold: number; // Low stock alert level
  costPerUnit?: number; // Avg cost
}

export interface KitchenProductionRule {
    name: string; 
    outputs: { stockLogChicken?: number; inventoryId?: string; quantity?: number }; // Can produce chicken count OR inventory item (Llajua)
    inputs: { inventoryId: string; quantity: number }[]; // Raw materials to deduct
    cookingTimeMinutes: number; // Duration of the process
}

// --- NEW FINANCIAL TYPES ---

export type TransactionType = 'SALE_REVENUE' | 'EXPENSE_OPERATIONAL' | 'EXPENSE_INVENTORY' | 'WITHDRAWAL' | 'DEPOSIT';

export interface FinancialTransaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  description: string;
  amount: number; // Negative for expenses/withdrawals
  relatedEntityId?: string; // Expense ID or Sale ID
}

export interface Expense {
  id: string;
  timestamp: string;
  description: string;
  amount: number;
  type?: TransactionType; // Backwards compatibility
}

export interface StockLog {
  id: string;
  timestamp: string; // When it was started/logged
  targetCompletionTime?: string; // When it finishes cooking
  ruleName?: string; // What was cooked
  quantityChickens: number; // How many whole chickens added
  totalPieces: number; // calculated pieces
}

// AI Command Types
export type CommandType = 'SALE' | 'EXPENSE' | 'ADD_STOCK' | 'CONVERT_CUT' | 'UNKNOWN';

export interface ParsedCommandItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ParsedCommand {
  type: CommandType;
  items?: ParsedCommandItem[]; // For Sale
  discount?: number; // For Sale
  description?: string; // For Expense
  amount?: number; // For Expense/Stock
  quantity?: number; // For Stock
  confidence?: string;
  // Status flags
  delivered?: boolean;
  paid?: boolean;
  paymentMethod?: PaymentMethod | null;
}

export interface SaleDraft {
  items: SaleItem[];
  discount?: number;
  delivered?: boolean;
  paid?: boolean;
  paymentMethod?: PaymentMethod | null;
  // Minimized state support
  customerName?: string;
  orderType?: OrderType;
  originalSaleId?: string; // If editing an existing sale
  timestamp?: number; // For sorting bubbles
}
