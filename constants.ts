
import { Product, InventoryItem, KitchenProductionRule, SideOption } from './types';

export const APP_COLORS = {
  primary: '#f97316', // Orange-500
  secondary: '#1e293b', // Slate-800
  success: '#22c55e', // Green-500
  danger: '#ef4444', // Red-500
  warning: '#eab308', // Yellow-500
};

export const DEFAULT_INVENTORY: InventoryItem[] = [
    // --- MATERIA PRIMA (INSUMOS) ---
    { id: 'inv_pollo_crudo', name: 'Pollo Crudo (Entero)', category: 'Insumo', quantity: 20, unit: 'unid', minThreshold: 5 },
    { id: 'inv_papas_cong', name: 'Papas Congeladas', category: 'Insumo', quantity: 20, unit: 'kg', minThreshold: 5 },
    { id: 'inv_nuggets_cong', name: 'Nuggets Congelados', category: 'Insumo', quantity: 5, unit: 'kg', minThreshold: 1 },
    { id: 'inv_fingers_cong', name: 'Fingers Crudos', category: 'Insumo', quantity: 30, unit: 'unid', minThreshold: 10 },
    { id: 'inv_salchicha', name: 'Salchichas', category: 'Insumo', quantity: 5, unit: 'kg', minThreshold: 1 },
    { id: 'inv_arroz', name: 'Arroz Grano', category: 'Insumo', quantity: 10, unit: 'kg', minThreshold: 2 },
    { id: 'inv_platano', name: 'Plátano Crudo', category: 'Insumo', quantity: 40, unit: 'unid', minThreshold: 10 },
    
    // --- INSUMOS PARA SALSAS (NUEVO) ---
    { id: 'inv_tomate', name: 'Tomate', category: 'Insumo', quantity: 5, unit: 'kg', minThreshold: 1 },
    { id: 'inv_locoto', name: 'Locoto', category: 'Insumo', quantity: 2, unit: 'kg', minThreshold: 0.5 },
    { id: 'inv_quirquina', name: 'Quirquiña', category: 'Insumo', quantity: 5, unit: 'paq', minThreshold: 1 },

    // --- CONDIMENTOS Y COCINA ---
    { id: 'inv_aceite', name: 'Aceite', category: 'Insumo', quantity: 20, unit: 'lt', minThreshold: 5 },
    { id: 'inv_sal', name: 'Sal', category: 'Insumo', quantity: 5, unit: 'kg', minThreshold: 1 },
    { id: 'inv_condimento_pollo', name: 'Condimento Pollo', category: 'Insumo', quantity: 5, unit: 'kg', minThreshold: 1 },
    { id: 'inv_harina', name: 'Harina/Rebozador', category: 'Insumo', quantity: 10, unit: 'kg', minThreshold: 2 },

    // --- BEBIDAS (LÍQUIDO/LLENAS) ---
    { id: 'inv_soda_personal', name: 'Soda Personal (Llena)', category: 'Bebida', quantity: 48, unit: 'unid', minThreshold: 12 },
    { id: 'inv_soda_popular', name: 'Soda Popular (Llena)', category: 'Bebida', quantity: 24, unit: 'unid', minThreshold: 6 },
    { id: 'inv_soda_litro', name: 'Soda 1 Litro (Llena)', category: 'Bebida', quantity: 12, unit: 'unid', minThreshold: 4 },
    { id: 'inv_soda_litro_medio', name: 'Soda 1.5 Litros (Llena)', category: 'Bebida', quantity: 12, unit: 'unid', minThreshold: 4 },
    { id: 'inv_frutall_litro', name: 'Frut-all Litro', category: 'Bebida', quantity: 10, unit: 'unid', minThreshold: 2 },
    { id: 'inv_frutall_p', name: 'Frut-all Personal', category: 'Bebida', quantity: 20, unit: 'unid', minThreshold: 5 },

    // --- ENVASES (ACTIVOS) ---
    { id: 'inv_envase_personal', name: 'Envase Personal (Vacío)', category: 'Otro', quantity: 24, unit: 'unid', minThreshold: 0 },
    { id: 'inv_envase_popular', name: 'Envase Popular (Vacío)', category: 'Otro', quantity: 24, unit: 'unid', minThreshold: 0 },
    { id: 'inv_envase_litro', name: 'Envase 1 Litro (Vacío)', category: 'Otro', quantity: 12, unit: 'unid', minThreshold: 0 },
    { id: 'inv_envase_litro_medio', name: 'Envase 1.5 Litros (Vacío)', category: 'Otro', quantity: 12, unit: 'unid', minThreshold: 0 },
    { id: 'inv_caja_pollos', name: 'Cajas de Pollo (Vacías)', category: 'Otro', quantity: 5, unit: 'unid', minThreshold: 1 },

    // --- SALSAS ---
    { id: 'inv_salsa_picante', name: 'Llajua (Preparada)', category: 'Salsa', quantity: 2, unit: 'lt', minThreshold: 0.5 },
    { id: 'inv_mayonesa_grande', name: 'Mayonesa (Balde)', category: 'Salsa', quantity: 1, unit: 'unid', minThreshold: 0.2 },
    { id: 'inv_ketchup_grande', name: 'Ketchup (Galón)', category: 'Salsa', quantity: 1, unit: 'unid', minThreshold: 0.2 },
    { id: 'inv_mostaza_grande', name: 'Mostaza (Galón)', category: 'Salsa', quantity: 1, unit: 'unid', minThreshold: 0.2 },
    
    // --- DESECHABLES ---
    { id: 'inv_plato_grande', name: 'Plato Desechable Grande', category: 'Desechable', quantity: 100, unit: 'unid', minThreshold: 20 },
    { id: 'inv_plato_chico', name: 'Plato Desechable Chico', category: 'Desechable', quantity: 100, unit: 'unid', minThreshold: 20 },
    { id: 'inv_vasos', name: 'Vasos Desechables', category: 'Desechable', quantity: 200, unit: 'unid', minThreshold: 50 },
    // Servilletas ahora en UNIDADES. Paquetes se convierten al comprar.
    { id: 'inv_servilletas', name: 'Servilletas (Sueltas)', category: 'Desechable', quantity: 500, unit: 'unid', minThreshold: 50 },
    { id: 'inv_envase_salsa', name: 'Envase Salsero', category: 'Desechable', quantity: 200, unit: 'unid', minThreshold: 50 },
];

export const KITCHEN_RULES: KitchenProductionRule[] = [
    {
        name: "Cocinar Pollos (Por Unidad)",
        outputs: { stockLogChicken: 1 },
        cookingTimeMinutes: 45,
        inputs: [
            { inventoryId: 'inv_pollo_crudo', quantity: 1 },
            { inventoryId: 'inv_condimento_pollo', quantity: 0.05 }, 
            { inventoryId: 'inv_harina', quantity: 0.1 }, 
            { inventoryId: 'inv_aceite', quantity: 0.15 } 
        ]
    },
    {
        name: "Preparar Llajua (Por Litro)",
        outputs: { inventoryId: 'inv_salsa_picante', quantity: 1 }, // Produce 1 Litro
        cookingTimeMinutes: 15,
        inputs: [
            { inventoryId: 'inv_tomate', quantity: 0.8 }, // 800g tomate
            { inventoryId: 'inv_locoto', quantity: 0.1 }, // 100g locoto
            { inventoryId: 'inv_quirquina', quantity: 0.5 }, // medio paquete
            { inventoryId: 'inv_sal', quantity: 0.01 }
        ]
    },
    {
        name: "Freír Papas (Por Kilo)",
        outputs: { stockLogChicken: 0 }, 
        cookingTimeMinutes: 12,
        inputs: [
            { inventoryId: 'inv_papas_cong', quantity: 1 },
            { inventoryId: 'inv_aceite', quantity: 0.1 },
            { inventoryId: 'inv_sal', quantity: 0.02 }
        ]
    },
    {
        name: "Cocinar Olla Arroz (Por Kilo Grano)",
        outputs: { stockLogChicken: 0 },
        cookingTimeMinutes: 25,
        inputs: [
            { inventoryId: 'inv_arroz', quantity: 1 },
            { inventoryId: 'inv_aceite', quantity: 0.05 },
            { inventoryId: 'inv_sal', quantity: 0.03 }
        ]
    }
];

const STANDARD_SIDES: SideOption[] = [
    { 
        id: 'opt_completo', 
        name: 'Completo (Arroz, Papa, Plátano)', 
        recipe: [
            { inventoryId: 'inv_arroz', quantity: 0.08 },
            { inventoryId: 'inv_papas_cong', quantity: 0.15 },
            { inventoryId: 'inv_platano', quantity: 1 }
        ]
    },
    { 
        id: 'opt_canasta', 
        name: 'Canasta (Papa, Plátano)', 
        recipe: [
            { inventoryId: 'inv_papas_cong', quantity: 0.25 }, // More potatoes
            { inventoryId: 'inv_platano', quantity: 1 }
        ]
    },
    { 
        id: 'opt_solo_papa', 
        name: 'Solo Papa', 
        recipe: [
            { inventoryId: 'inv_papas_cong', quantity: 0.35 } // A lot of potatoes
        ]
    },
    { 
        id: 'opt_solo_arroz', 
        name: 'Solo Arroz', 
        recipe: [
            { inventoryId: 'inv_arroz', quantity: 0.25 }
        ]
    },
    { 
        id: 'opt_sin_platano', 
        name: 'Sin Plátano (Arroz, Papa)', 
        recipe: [
            { inventoryId: 'inv_arroz', quantity: 0.1 },
            { inventoryId: 'inv_papas_cong', quantity: 0.2 }
        ]
    }
];

export const DEFAULT_MENU: Product[] = [
  // --- SUB: POLLO ---
  { 
    id: 'c_pollo_simple', 
    name: 'Pollo Simple', 
    price: 22, 
    category: 'Comida', 
    subcategory: 'Pollo',
    stockCost: 1,
    plateSize: 'large',
    sideOptions: STANDARD_SIDES
  },
  { 
    id: 'c_pollo_doble', 
    name: 'Pollo Doble', 
    price: 34, 
    category: 'Comida', 
    subcategory: 'Pollo',
    stockCost: 2, 
    plateSize: 'large',
    sideOptions: STANDARD_SIDES,
    variants: [
      { id: 'v_pd_clasico', name: 'Clásico (Pierna+Entrepierna)', price: 34, stockCost: 2 },
      { id: 'v_pd_supremo', name: 'Supremo (Ala+Pecho)', price: 36, stockCost: 2 },
      { id: 'v_pd_familiar', name: 'Familiar (A elección)', price: 38, stockCost: 2 }
    ]
  },

  // --- SUB: ALITAS ---
  {
    id: 'c_alitas',
    name: 'Alitas de Pollo',
    price: 35, 
    category: 'Comida', 
    subcategory: 'Alitas de pollo',
    stockCost: 0,
    plateSize: 'large',
    sideOptions: STANDARD_SIDES,
    variants: [
      { id: 'v_alitas_6', name: '6 Unidades', price: 35 },
      { id: 'v_alitas_9', name: '9 Unidades', price: 45 },
      { id: 'v_alitas_12', name: '12 Unidades', price: 55 }
    ]
  },

  // --- SUB: FINGERS ---
  {
    id: 'c_fingers',
    name: 'Fingers',
    price: 35,
    category: 'Comida',
    subcategory: 'Fingers',
    stockCost: 0,
    plateSize: 'small',
    sideOptions: STANDARD_SIDES,
    variants: [
      { id: 'v_fingers_6', name: '6 Unidades', price: 35 },
      { id: 'v_fingers_9', name: '9 Unidades', price: 45 },
      { id: 'v_fingers_12', name: '12 Unidades', price: 55 }
    ],
    recipe: [
        { inventoryId: 'inv_fingers_cong', quantity: 6 }
    ]
  },

  // --- SUB: NUGGETS ---
  {
    id: 'c_nuggets',
    name: 'Nuggets',
    price: 25,
    category: 'Comida',
    subcategory: 'Nuggets',
    stockCost: 0,
    plateSize: 'small',
    sideOptions: STANDARD_SIDES,
    variants: [
      { id: 'v_nuggets_6', name: '6 Unidades', price: 25 },
      { id: 'v_nuggets_9', name: '9 Unidades', price: 35 },
      { id: 'v_nuggets_12', name: '12 Unidades', price: 45 }
    ]
  },

  // --- SUB: SALCHIPAPA ---
  {
    id: 'c_salchi',
    name: 'Salchipapa',
    price: 20,
    category: 'Comida', 
    subcategory: 'Salchipapa',
    stockCost: 0,
    plateSize: 'large',
    sideOptions: [], // No sides selector for Salchipapa
    variants: [
      { id: 'v_salchi_nor', name: 'Normal', price: 20 },
      { id: 'v_salchi_esp', name: 'Especial', price: 25 }
    ],
    recipe: [
        { inventoryId: 'inv_salchicha', quantity: 0.2 },
        { inventoryId: 'inv_papas_cong', quantity: 0.3 }
    ]
  },

  // --- BEBIDAS ---
  { id: 'b_personal', name: 'Refresco Personal', price: 3, category: 'Bebida', recipe: [{ inventoryId: 'inv_soda_personal', quantity: 1 }] },
  { id: 'b_popular', name: 'Refresco Popular', price: 8, category: 'Bebida', recipe: [{ inventoryId: 'inv_soda_popular', quantity: 1 }] },
  { id: 'b_litro', name: 'Refresco Litro', price: 12, category: 'Bebida', recipe: [{ inventoryId: 'inv_soda_litro', quantity: 1 }] },
  { id: 'b_litro_medio', name: 'Refresco 1.5 Litros', price: 16, category: 'Bebida', recipe: [{ inventoryId: 'inv_soda_litro_medio', quantity: 1 }] },
  { id: 'b_frutall_l', name: 'Frut-all Litro', price: 17, category: 'Bebida', recipe: [{ inventoryId: 'inv_frutall_litro', quantity: 1 }] },
  { id: 'b_frutall_p', name: 'Frut-all Personal', price: 7, category: 'Bebida', recipe: [{ inventoryId: 'inv_frutall_p', quantity: 1 }] },

  // --- EXTRAS ---
  { id: 'e_papa', name: 'Porción Papa', price: 15, category: 'Extra', plateSize: 'small', recipe: [{ inventoryId: 'inv_papas_cong', quantity: 0.3 }] },
  { id: 'e_arroz', name: 'Porción Arroz', price: 15, category: 'Extra', plateSize: 'small', recipe: [{ inventoryId: 'inv_arroz', quantity: 0.08 }] },
  { id: 'e_platano', name: 'Porción Plátano', price: 15, category: 'Extra', plateSize: 'small', recipe: [{ inventoryId: 'inv_platano', quantity: 1 }] },
  { id: 'e_corte', name: 'Corte / Yapa', price: 0, category: 'Extra' }, 
];
