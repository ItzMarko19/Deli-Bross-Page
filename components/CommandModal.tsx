
import React, { useState } from 'react';
import { X, Wand2, Send, Loader2, ShoppingCart, TrendingDown, AlertCircle, ChefHat, Scissors } from 'lucide-react';
import { ParsedCommand, Product } from '../types';
import { parseNaturalLanguageCommand } from '../services/geminiService';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onExecute: (command: ParsedCommand) => void;
}

const CommandModal: React.FC<CommandModalProps> = ({ isOpen, onClose, products, onExecute }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ParsedCommand | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const parsed = await parseNaturalLanguageCommand(inputText, products);
      if (parsed.type === 'UNKNOWN') {
        setError('No pude entender el comando. Intenta ser más específico (ej: "Venta de 2 pollos simples").');
      } else {
        setResult(parsed);
      }
    } catch (err) {
      setError('Error de conexión con la IA. Verifica tu internet o API Key.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      onExecute(result);
      handleClose();
    }
  };

  const handleClose = () => {
    setInputText('');
    setResult(null);
    setError(null);
    onClose();
  };

  // Helper to get product name for preview
  const getProductName = (id: string, variantId?: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return 'Producto Desconocido';
    let name = prod.name;
    if (variantId && prod.variants) {
      const v = prod.variants.find(v => v.id === variantId);
      if (v) name += ` (${v.name})`;
    }
    return name;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-yellow-300" />
            Comando Mágico
          </h2>
          <button onClick={handleClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-gray-500 text-sm mb-4">
            Escribe lo que vendiste, gastaste o cocinaste. <br/>
            <span className="italic text-gray-400">Ej: "2 simples y una coca, pagado por QR", "Metí 5 pollos a la cocina"</span>
          </p>

          <div className="relative">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none bg-gray-50 text-gray-900"
              rows={3}
              placeholder="Escribe aquí..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
            />
            <button
              onClick={handleAnalyze}
              disabled={isProcessing || !inputText.trim()}
              className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors shadow-sm"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Preview Result */}
          {result && (
            <div className="mt-6 animate-fadeIn">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vista Previa</h3>
              
              {result.type === 'SALE' && (
                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-green-700 font-bold border-b border-green-200 pb-2">
                    <ShoppingCart className="w-5 h-5" /> Nueva Venta Detectada
                  </div>
                  <ul className="space-y-2 mb-3">
                    {result.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm text-gray-700">
                        <span>{getProductName(item.productId, item.variantId)}</span>
                        <span className="font-bold bg-white px-2 rounded border border-green-100">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.discount ? <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Descuento: {result.discount} Bs</span> : null}
                    {result.delivered ? <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Entregado</span> : null}
                    {result.paid ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Pagado {result.paymentMethod ? `(${result.paymentMethod})` : ''}</span> : null}
                  </div>
                </div>
              )}

              {result.type === 'EXPENSE' && (
                <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-red-700 font-bold border-b border-red-200 pb-2">
                    <TrendingDown className="w-5 h-5" /> Nuevo Gasto Detectado
                  </div>
                  <div className="flex justify-between items-center text-gray-800">
                    <span className="font-medium">{result.description || 'Sin descripción'}</span>
                    <span className="text-xl font-bold text-red-600">-{result.amount} Bs</span>
                  </div>
                </div>
              )}

               {result.type === 'ADD_STOCK' && (
                <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-orange-700 font-bold border-b border-orange-200 pb-2">
                    <ChefHat className="w-5 h-5" /> Agregar Stock
                  </div>
                  <div className="text-gray-800">
                    Se añadirán <span className="font-bold">{result.quantity} Pollos</span> a la cocina.
                  </div>
                </div>
              )}

              {result.type === 'CONVERT_CUT' && (
                <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-purple-700 font-bold border-b border-purple-200 pb-2">
                    <Scissors className="w-5 h-5" /> Realizar Cortes
                  </div>
                  <div className="text-gray-800">
                    Se cortarán <span className="font-bold">{result.quantity} Presas</span> para yapas.
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirm}
                className="w-full mt-4 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-transform active:scale-[0.98]"
              >
                {result.type === 'SALE' ? 'Revisar en Carrito' : 'Confirmar y Guardar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandModal;
