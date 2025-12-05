
import React, { useState, useMemo } from 'react';
import { Sale, Expense, SaleStatus, Product } from '../types';
import { TrendingUp, TrendingDown, Calendar, Users, ShoppingBag, Clock, DollarSign, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface EconomyViewProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
}

type TimeRange = 'DAY' | 'WEEK' | 'MONTH';
type Tab = 'OVERVIEW' | 'ORDERS' | 'CUSTOMERS' | 'EXPENSES';

const EconomyView: React.FC<EconomyViewProps> = ({ sales, expenses, products }) => {
  const [range, setRange] = useState<TimeRange>('DAY');
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filters
  const filterDate = new Date(selectedDate);
  
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.timestamp);
      const isSameDay = d.toDateString() === filterDate.toDateString();
      
      if (range === 'DAY') return isSameDay;
      if (range === 'WEEK') {
        const diff = Math.abs(d.getTime() - filterDate.getTime());
        return diff < 7 * 24 * 60 * 60 * 1000; 
      }
      if (range === 'MONTH') {
        return d.getMonth() === filterDate.getMonth() && d.getFullYear() === filterDate.getFullYear();
      }
      return false;
    });
  }, [sales, range, selectedDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
        const d = new Date(e.timestamp);
        // exclude internal system logs
        if (e.description.startsWith('INTERNAL')) return false;

        if (range === 'DAY') return d.toDateString() === filterDate.toDateString();
        if (range === 'WEEK') return Math.abs(d.getTime() - filterDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
        if (range === 'MONTH') return d.getMonth() === filterDate.getMonth() && d.getFullYear() === filterDate.getFullYear();
        return false;
    });
  }, [expenses, range, selectedDate]);

  // Aggregates
  const totalRevenue = filteredSales.reduce((acc, s) => s.status === SaleStatus.PAGADO ? acc + s.finalTotal : acc, 0);
  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  // Grouping for Orders Tab
  const ordersByProduct = useMemo(() => {
      const grouped: {[key: string]: {name: string, quantity: number, total: number}} = {};
      filteredSales.forEach(s => {
          if (s.status !== SaleStatus.PAGADO) return;
          s.items.forEach(i => {
              if (!grouped[i.productName]) grouped[i.productName] = { name: i.productName, quantity: 0, total: 0 };
              grouped[i.productName].quantity += i.quantity;
              grouped[i.productName].total += i.total;
          });
      });
      return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const ordersByCustomer = useMemo(() => {
      const grouped: {[key: string]: {name: string, orders: number, total: number, lastVisit: string}} = {};
      filteredSales.forEach(s => {
          if (s.status !== SaleStatus.PAGADO) return;
          const name = s.customerName || 'Cliente Casual';
          if (!grouped[name]) grouped[name] = { name, orders: 0, total: 0, lastVisit: '' };
          grouped[name].orders += 1;
          grouped[name].total += s.finalTotal;
          if (s.timestamp > grouped[name].lastVisit) grouped[name].lastVisit = s.timestamp;
      });
      return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Chart Data
  const chartData = useMemo(() => {
      return [
          { name: 'Ingresos', amount: totalRevenue, fill: '#22c55e' },
          { name: 'Gastos', amount: totalExpense, fill: '#ef4444' },
          { name: 'Neto', amount: netProfit, fill: '#3b82f6' },
      ];
  }, [totalRevenue, totalExpense, netProfit]);


  return (
    <div className="space-y-6 animate-fadeIn pb-24">
        
        {/* Header Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex bg-gray-100 p-1 rounded-xl">
                 {(['OVERVIEW', 'ORDERS', 'CUSTOMERS', 'EXPENSES'] as Tab[]).map(t => (
                     <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                         {t === 'OVERVIEW' ? 'Resumen' : t === 'ORDERS' ? 'Pedidos' : t === 'CUSTOMERS' ? 'Clientes' : 'Gastos'}
                     </button>
                 ))}
             </div>
             <div className="flex items-center gap-2">
                 <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                 />
                 <select 
                    value={range} 
                    onChange={e => setRange(e.target.value as any)}
                    className="p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                     <option value="DAY">Día</option>
                     <option value="WEEK">Semana</option>
                     <option value="MONTH">Mes</option>
                 </select>
             </div>
        </div>

        {/* Content Area */}
        {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600"><TrendingUp className="w-5 h-5"/></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Ingresos</h3>
                        </div>
                        <p className="text-3xl font-black text-gray-800">{totalRevenue.toFixed(2)} <span className="text-sm text-gray-400">Bs</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingDown className="w-5 h-5"/></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Gastos</h3>
                        </div>
                        <p className="text-3xl font-black text-gray-800">{totalExpense.toFixed(2)} <span className="text-sm text-gray-400">Bs</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><DollarSign className="w-5 h-5"/></div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Neto</h3>
                        </div>
                        <p className={`text-3xl font-black ${netProfit >= 0 ? 'text-gray-800' : 'text-red-500'}`}>{netProfit.toFixed(2)} <span className="text-sm text-gray-400">Bs</span></p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-80">
                    <h3 className="font-bold text-gray-800 mb-4">Balance General</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="amount" barSize={30} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {activeTab === 'ORDERS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grouped by Product */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Productos Vendidos
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3 text-center">Cant.</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersByProduct.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                        <td className="px-4 py-3 text-center bg-gray-50 rounded font-bold">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-600">{item.total} Bs</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chronological List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Historial de Pedidos
                    </div>
                    <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                        {filteredSales.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(sale => (
                            <div key={sale.id} className="p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400">{new Date(sale.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <h4 className="font-bold text-gray-800 text-sm">{sale.customerName || 'Cliente'}</h4>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${sale.status === SaleStatus.PAGADO ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {sale.finalTotal} Bs
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    {sale.items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{i.quantity}x {i.productName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'CUSTOMERS' && (
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Ranking de Clientes
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3 text-center">Visitas / Pedidos</th>
                                <th className="px-6 py-3 text-center">Última Visita</th>
                                <th className="px-6 py-3 text-right">Total Gastado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersByCustomer.map((c, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{c.name}</td>
                                    <td className="px-6 py-4 text-center">{c.orders}</td>
                                    <td className="px-6 py-4 text-center text-gray-500">{new Date(c.lastVisit).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-black text-indigo-600">{c.total} Bs</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'EXPENSES' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Detalle de Gastos
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Descripción</th>
                                <th className="px-6 py-3 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((e, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500">{new Date(e.timestamp).toLocaleDateString()} {new Date(e.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{e.description}</td>
                                    <td className="px-6 py-4 text-right font-bold text-red-500">-{e.amount} Bs</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

    </div>
  );
};

export default EconomyView;
