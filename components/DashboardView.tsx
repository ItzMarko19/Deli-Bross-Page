
import React, { useState, useEffect } from 'react';
import { ChefHat, History, TrendingDown, Sparkles, Loader2, TrendingUp, DollarSign, Award, AlertTriangle, Clock, Flame } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Sale, StockLog, Expense, SaleStatus, PaymentMethod } from '../types';
import SaleCard from './SaleCard';

interface DashboardViewProps {
  sales: Sale[];
  expenses: Expense[];
  chickenStock: number;
  cutsStock: number;
  stockLogs?: StockLog[]; // Added prop
  onOpenStockControl: () => void;
  onOpenExpense: () => void;
  onEditSale: (sale: Sale) => void;
  onToggleDelivered: (id: string) => void;
  onOpenPayment: (sale: Sale) => void;
  aiAnalysis: string | null;
  isAnalyzing: boolean;
  aiError: string | null;
  onAnalyze: () => void;
  onClearAnalysis: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  sales, expenses, chickenStock, cutsStock, stockLogs = [],
  onOpenStockControl, onOpenExpense,
  onEditSale, onToggleDelivered, onOpenPayment,
  aiAnalysis, isAnalyzing, aiError, onAnalyze, onClearAnalysis
}) => {
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getTodayStr = () => new Date().toDateString();
  
  // Calculate Daily Stats
  const todaysSales = sales.filter(s => new Date(s.timestamp).toDateString() === getTodayStr());
  const todaysExpenses = expenses.filter(e => new Date(e.timestamp).toDateString() === getTodayStr());

  const totalSales = todaysSales.reduce((acc, s) => s.status === SaleStatus.PAGADO ? acc + s.finalTotal : acc, 0);
  const totalCash = todaysSales.reduce((acc, s) => (s.status === SaleStatus.PAGADO && s.paymentMethod === PaymentMethod.EFECTIVO) ? acc + s.finalTotal : acc, 0);
  const totalQR = todaysSales.reduce((acc, s) => (s.status === SaleStatus.PAGADO && s.paymentMethod === PaymentMethod.QR) ? acc + s.finalTotal : acc, 0);
  const pendingAmount = todaysSales.reduce((acc, s) => s.status === SaleStatus.PENDIENTE ? acc + s.finalTotal : acc, 0);
  const totalExpenseAmount = todaysExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalSales - totalExpenseAmount;

  const chartData = [
     { name: 'Efectivo', value: totalCash, color: '#22c55e' },
     { name: 'QR', value: totalQR, color: '#3b82f6' },
     { name: 'Gastos', value: totalExpenseAmount, color: '#ef4444' },
  ];

  // Active Timers Logic
  const activeTimers = stockLogs.filter(log => {
      if (!log.targetCompletionTime) return false;
      return new Date(log.targetCompletionTime) > currentTime;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      
      {/* Red Alert Banner */}
      {chickenStock <= 5 && (
         <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-bold text-lg">ALERTA CRÍTICA: QUEDAN POCOS POLLOS ({chickenStock} Presas)</span>
            <button 
               onClick={onOpenStockControl}
               className="bg-white text-red-600 px-3 py-1 rounded-lg font-bold text-sm hover:bg-red-50"
            >
               Reponer Ahora
            </button>
         </div>
      )}
            
      {/* Inventory & Kitchen Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-orange-500"></div>
            <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                <ChefHat className="w-8 h-8" />
            </div>
            <div>
                <h3 className="font-bold text-gray-800 text-lg">Control de Cocina</h3>
                <p className="text-sm text-gray-500">Stock listo para vender</p>
            </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
            <div className="text-center group">
                <span className={`block text-3xl font-black transition-all ${chickenStock <= 5 ? 'text-red-500 scale-110' : 'text-gray-800 group-hover:text-orange-600'}`}>
                {chickenStock}
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Presas</span>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
            <div className="text-center group">
                <span className="block text-3xl font-black text-purple-600 group-hover:scale-110 transition-transform">
                {cutsStock}
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cortes</span>
            </div>
            <button 
                onClick={onOpenStockControl}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all active:scale-95 hover:shadow-gray-900/20"
            >
                Gestionar
            </button>
            </div>
        </div>
        
        {/* Active Cooking Timers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
             <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <Flame className={`w-5 h-5 ${activeTimers.length > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}`} /> 
                     Cocina en Curso
                 </h3>
                 <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{activeTimers.length} Activos</span>
             </div>
             
             {activeTimers.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-20 text-gray-400 text-xs">
                     <Clock className="w-6 h-6 mb-1 opacity-50" />
                     Nada cocinándose ahora
                 </div>
             ) : (
                 <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                     {activeTimers.map(log => {
                         const end = new Date(log.targetCompletionTime!);
                         const diffMs = end.getTime() - currentTime.getTime();
                         const diffMins = Math.ceil(diffMs / 60000);
                         return (
                             <div key={log.id} className="flex justify-between items-center bg-orange-50 p-2 rounded-lg border border-orange-100">
                                 <div className="flex flex-col">
                                     <span className="text-xs font-bold text-gray-700">{log.ruleName}</span>
                                     <span className="text-[10px] text-gray-500">Termina: {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 </div>
                                 <div className="text-right">
                                     <span className="block font-black text-orange-600">{diffMins} min</span>
                                 </div>
                             </div>
                         )
                     })}
                 </div>
             )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sales */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden group hover:border-orange-300 transition-colors">
          <div className="absolute -right-4 -top-4 bg-orange-50 w-24 h-24 rounded-full group-hover:bg-orange-100 transition-colors"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-orange-600 uppercase mb-1 tracking-wide flex items-center gap-1"><DollarSign className="w-3 h-3"/>Ventas Hoy</p>
            <h3 className="text-3xl font-black text-gray-800 tracking-tight">{totalSales.toFixed(2)} <span className="text-sm font-normal text-gray-400">Bs</span></h3>
          </div>
        </div>
        
        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-red-200 transition-colors">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><History className="w-3 h-3"/>Pendiente</p>
          <h3 className={`text-3xl font-black tracking-tight ${pendingAmount > 0 ? 'text-red-500' : 'text-gray-800'}`}>{pendingAmount.toFixed(2)} <span className="text-sm font-normal text-gray-400">Bs</span></h3>
        </div>
        
        {/* Expenses */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-50 hover:border-red-200 transition-colors">
          <p className="text-xs font-bold text-red-500 uppercase mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3"/>Gastos</p>
          <h3 className="text-3xl font-black text-gray-800 tracking-tight">{totalExpenseAmount.toFixed(2)} <span className="text-sm font-normal text-gray-400">Bs</span></h3>
        </div>
        
        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 hover:border-green-300 transition-colors">
          <p className="text-xs font-bold text-green-600 uppercase mb-1 flex items-center gap-1"><Award className="w-3 h-3"/>Ganancia Neta</p>
          <h3 className="text-3xl font-black text-gray-800 tracking-tight">{netProfit.toFixed(2)} <span className="text-sm font-normal text-gray-400">Bs</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Feed: Sale List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-16 z-20">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" /> 
              <span>Pedidos de Hoy</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{todaysSales.length}</span>
            </h2>
            <button 
                onClick={onOpenExpense}
                className="hidden md:flex px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors items-center gap-2 border border-red-100"
              >
                <TrendingDown className="w-4 h-4" /> Registrar Gasto
            </button>
          </div>

          <div className="space-y-4">
            {todaysSales.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <History className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Aún no hay ventas registradas hoy.</p>
                <p className="text-xs text-gray-400 mt-1">Usa el botón "+" o el comando mágico.</p>
              </div>
            )}
            
            {todaysSales
              .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((sale) => (
                <SaleCard 
                    key={sale.id}
                    sale={sale}
                    onEdit={onEditSale}
                    onToggleDelivered={onToggleDelivered}
                    onOpenPayment={onOpenPayment}
                />
            ))}
          </div>
        </div>

        {/* Right Sidebar: AI & Mini Chart */}
        <div className="space-y-6">
          
          {/* AI Card */}
          <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden border border-indigo-500/30">
            <div className="absolute top-0 right-0 p-3 opacity-10"><Sparkles className="w-24 h-24" /></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" /> Asistente IA</h3>
              {!aiAnalysis ? (
                <div className="space-y-4">
                  <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
                    Obtén un resumen inteligente, consejos de venta y análisis de rendimiento con un clic.
                  </p>
                  <button 
                    onClick={onAnalyze} 
                    disabled={isAnalyzing} 
                    className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Analizar Negocio'}
                  </button>
                  {aiError && <p className="text-xs text-red-300 mt-2 bg-red-900/50 p-2 rounded">{aiError}</p>}
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <div className="prose prose-sm prose-invert max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="whitespace-pre-line text-sm text-indigo-50 leading-relaxed font-light">{aiAnalysis}</div>
                  </div>
                  <button onClick={onClearAnalysis} className="mt-4 text-xs font-bold text-indigo-200 hover:text-white uppercase tracking-wider">Cerrar Análisis</button>
                </div>
              )}
            </div>
          </div>

          {/* Mini Financial Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Resumen Financiero
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}} width={60} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
