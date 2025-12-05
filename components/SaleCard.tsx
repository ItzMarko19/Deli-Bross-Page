
import React from 'react';
import { Edit2, Zap, AlertCircle, CheckCircle, ChefHat, Clock } from 'lucide-react';
import { Sale, SaleStatus, PaymentMethod } from '../types';

// Helper Icon
const CashIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
);

interface SaleCardProps {
  sale: Sale;
  onEdit: (sale: Sale) => void;
  onToggleDelivered: (saleId: string) => void;
  onOpenPayment: (sale: Sale) => void;
}

const SaleCard: React.FC<SaleCardProps> = ({ sale, onEdit, onToggleDelivered, onOpenPayment }) => {
  const isPaid = sale.status === SaleStatus.PAGADO;
  const isDelivered = sale.delivered;

  // Visual logic for alerts
  let containerClasses = "bg-white rounded-xl transition-all duration-300 relative overflow-hidden group ";
  
  if (!isPaid) {
    // CRITICAL ALERT: Not Paid (Red Glow & Pulse)
    containerClasses += "border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-[pulse_3s_ease-in-out_infinite]";
  } else if (!isDelivered) {
    // WARNING ALERT: Paid but Not Delivered (Yellow Glow)
    containerClasses += "border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]";
  } else {
    // NORMAL: Done
    containerClasses += "border border-gray-100 shadow-sm hover:shadow-md";
  }

  return (
    <div className={containerClasses}>
      {/* Status Strip on Left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${!isPaid ? 'bg-red-500' : (!isDelivered ? 'bg-yellow-400' : 'bg-green-500')}`}></div>

      <div className="p-4 pl-5 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          {/* Header Info */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
              <Clock className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-xs font-bold text-gray-700">
                {new Date(sale.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            
            <button 
                onClick={() => onEdit(sale)} 
                className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-md transition-colors"
                title="Editar Pedido"
            >
                <Edit2 className="w-3.5 h-3.5" />
            </button>

            {isPaid ? (
              <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border ${sale.paymentMethod === PaymentMethod.QR ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                {sale.paymentMethod === PaymentMethod.QR ? <Zap className="w-3 h-3"/> : <CashIcon className="w-3 h-3"/>}
                {sale.paymentMethod}
              </span>
            ) : (
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-red-100 text-red-600 border border-red-200 flex items-center gap-1 animate-bounce">
                <AlertCircle className="w-3 h-3"/> POR COBRAR
              </span>
            )}

            {!isDelivered && (
               <span className="text-xs font-bold px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                 <ChefHat className="w-3 h-3"/> COCINA
               </span>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-1.5">
            {sale.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm items-center">
                <span className="text-gray-800 leading-tight">
                  <span className="font-black text-orange-600 mr-1.5 text-base">{item.quantity}x</span> 
                  {item.productName}
                  {item.variantName && <span className="text-gray-500 text-xs ml-1 font-medium bg-gray-100 px-1 rounded">({item.variantName})</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions & Totals */}
        <div className="flex sm:flex-col justify-between items-end gap-3 sm:gap-2 pl-0 sm:pl-4 sm:border-l border-gray-100 min-w-[140px]">
          <div className="text-right">
            {sale.discount > 0 && (
                <div className="text-xs text-red-500 font-medium bg-red-50 px-1 rounded inline-block mb-1">
                    Descuento: -{sale.discount}
                </div>
            )}
            <div className="text-2xl font-black text-gray-900 leading-none">{sale.finalTotal} <span className="text-xs text-gray-400 font-normal">Bs</span></div>
          </div>
          
          <div className="flex gap-2 w-full justify-end mt-1">
            {/* Delivery Button */}
            <button 
                onClick={() => onToggleDelivered(sale.id)} 
                className={`p-2 rounded-lg transition-all ${
                    isDelivered 
                    ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' 
                    : 'bg-yellow-400 text-white hover:bg-yellow-500 shadow-lg shadow-yellow-200 animate-pulse'
                }`} 
                title={isDelivered ? "Marcar como no entregado" : "ENTREGAR PEDIDO"}
            >
                {isDelivered ? <CheckCircle className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
            </button>
            
            {/* Payment Button */}
            {!isPaid ? (
              <button 
                onClick={() => onOpenPayment(sale)} 
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 transition-transform active:scale-95"
              >
                COBRAR
              </button>
            ) : (
              <div className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200 opacity-80">
                <CheckCircle className="w-3 h-3 mr-1" /> Pagado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleCard;
