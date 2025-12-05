import { GoogleGenAI } from "@google/genai";
import { Sale, Expense, Product, ParsedCommand } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeBusinessDay = async (sales: Sale[], expenses: Expense[]) => {
  if (!ai) {
    throw new Error("API Key no configurada");
  }

  const salesSummary = sales.map(s => ({
    hora: new Date(s.timestamp).toLocaleTimeString(),
    productos: s.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
    total: s.finalTotal,
    metodo: s.paymentMethod
  }));

  const expenseSummary = expenses.map(e => ({
    concepto: e.description,
    monto: e.amount
  }));

  const prompt = `
    Actúa como un experto consultor de negocios para restaurantes.
    Analiza los siguientes datos de ventas y gastos del día de hoy para "Deli Bross".
    
    Datos de Ventas:
    ${JSON.stringify(salesSummary)}

    Datos de Gastos:
    ${JSON.stringify(expenseSummary)}

    Por favor provee:
    1. Un breve resumen del rendimiento (puntos altos y bajos).
    2. Una sugerencia creativa para mejorar las ventas basada en los productos más y menos vendidos.
    3. Una recomendación sobre los gastos.
    
    Mantén el tono amigable, motivador y breve (máximo 3 párrafos). Responde en español.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw new Error("No se pudo conectar con el asistente virtual.");
  }
};

export const parseNaturalLanguageCommand = async (text: string, products: Product[]): Promise<ParsedCommand> => {
  if (!ai) {
    throw new Error("API Key no configurada");
  }

  // Create a simplified catalog string for the AI
  const catalog = products.map(p => {
    let str = `ID: ${p.id}, Name: ${p.name}, Price: ${p.price}`;
    if (p.variants && p.variants.length > 0) {
      str += ` | Variants: ${p.variants.map(v => `[ID: ${v.id}, Name: ${v.name}]`).join(', ')}`;
    }
    return str;
  }).join('\n');

  const prompt = `
    Eres un asistente de punto de venta (POS) para un restaurante de pollo frito.
    Tu trabajo es interpretar comandos de texto natural y convertirlos en datos estructurados JSON.
    
    CATÁLOGO DE PRODUCTOS:
    ${catalog}

    INSTRUCCIONES:
    1. Analiza el texto del usuario: "${text}"
    2. Determina el TIPO de acción:
       - SALE: Venta de comida/bebida O consumo interno ("nos comimos", "para nosotros").
       - EXPENSE: Gasto operativo (hielo, gas, compras, taxis).
       - ADD_STOCK: Agregar pollos crudos a la cocina (inventario).
       - CONVERT_CUT: Cortar una presa para hacer cortes/yapas ("corté una presa", "hice cortes").
    
    3. DETALLES POR TIPO:
       
       SI ES SALE:
       - Mapea productos a IDs. Sé flexible (ej: "soda" = "refresco").
       - Extrae cantidades.
       - Busca menciones de DESCUENTO o precio final ("lo dejé en 50").
       - DETECTA ESTADO:
         * "Entregado", "ya les di", "despachado" -> delivered: true
         * "Pagado", "cobrado", "me pagaron" -> paid: true
         * "QR", "Transferencia" -> paymentMethod: "QR"
         * "Efectivo", "Contado" -> paymentMethod: "Efectivo"
         * "Tarjeta", "POS", "Débito" -> paymentMethod: "Tarjeta"
       - IMPORTANTE: SI ES CONSUMO INTERNO ("sacamos para comer", "almuerzo personal"): 
         Calcula el precio total de los productos y ponlo como 'discount'. 
         Ej: 2 pollos (44bs) -> discount: 44. Así el total final es 0.

       SI ES ADD_STOCK:
       - "Metí 5 pollos", "cociné 3 pollos". Extrae 'quantity'.

       SI ES CONVERT_CUT:
       - "Corté una presa", "saqué yapas". Extrae 'quantity' (default 1). Significa convertir presa entera en cortes.

       SI ES EXPENSE:
       - Descripción y monto.

    Responde SOLAMENTE JSON (sin markdown):
    
    {
      "type": "SALE" | "EXPENSE" | "ADD_STOCK" | "CONVERT_CUT",
      "items": [{ "productId": "...", "variantId": "...", "quantity": 1 }],
      "discount": 0,
      "delivered": boolean,
      "paid": boolean,
      "paymentMethod": "QR" | "Efectivo" | "Tarjeta" | null,
      "description": "...",
      "amount": 0,
      "quantity": 0
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Empty response");
    
    return JSON.parse(jsonStr) as ParsedCommand;
  } catch (error) {
    console.error("Error parsing command:", error);
    throw new Error("No pude entender el comando.");
  }
};