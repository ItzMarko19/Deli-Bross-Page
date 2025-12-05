
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Sale, Expense, SaleStatus, Product } from '../types';
import { TrendingUp, DollarSign, Clock, Award, PieChart as PieIcon } from 'lucide-react';

interface StatisticsPanelProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
}

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#eab308'];

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ sales, expenses, products }) => {
  
  // --- 1. Financial Summary (Last 7 days or All time based on filter, currently all time for simplicity) ---
  const financialData = useMemo(() => {
    // Group by date (simple YYYY-MM-DD)
    const data: Record<string, { date: string; ventas: number; gastos: number }> = {};
    
    // Process Sales
    sales.forEach(s => {
      if (s.status !== SaleStatus.PAGADO) return;
      const date = new Date(s.timestamp).toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
      if (!data[date]) data[date] = { date, ventas: 0, gastos: 0 };
      data[date].ventas += s.finalTotal;
    });

    // Process Expenses
    expenses.forEach(e => {
        // Filter out internal conversions
       if (e.description.startsWith('INTERNAL_CONVERT')) return;
       const date = new Date(e.timestamp).toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
       if (!data[date]) data[date] = { date, ventas: 0, gastos: 0 };
       data[date].gastos += e.amount;
    });

    // Convert to array and take last 7 entries
    return Object.values(data).slice(-7);
  }, [sales, expenses]);

  // --- 2. Payment Methods ---
  const paymentMethodData = useMemo(() => {
    let cash = 0;
    let qr = 0;
    sales.forEach(s => {
      if (s.status === SaleStatus.PAGADO) {
        if (s.paymentMethod === 'Efectivo') cash += s.finalTotal;
        if (s.paymentMethod === 'QR') qr += s.finalTotal;
      }
    });
    return [
      { name: 'Efectivo', value: cash },
      { name: 'QR', value: qr }
    ].filter(i => i.value > 0);
  }, [sales]);

  // --- 3. Top Products ---
  const topProductsData = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        const key = item.productName; // Or group by ID if names change
        counts[key] = (counts[key] || 0) + item.quantity;
      });
    });
    
    return Object.entries(counts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // Top 5
  }, [sales]);

  // --- 4. Sales by Hour (Peak Times) ---
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0).map((_, i) => ({ hour: `${i}:00`, ventas: 0 }));
    sales.forEach(s => {
      if (s.status === SaleStatus.PAGADO) {
        const h = new Date(s.timestamp).getHours();
        hours[h].ventas += s.finalTotal;
      }
    });
    // Filter out hours with 0 sales to make chart cleaner? No, better to show the curve.
    return hours;
  }, [sales]);

  // --- 5. Category Share ---
  const categoryData = useMemo(() => {
     const cats: Record<string, number> = {};
     sales.forEach(s => {
        s.items.forEach(i => {
           const prod = products.find(p => p.id === i.productId);
           const cat = prod?.category || 'Otro';
           cats[cat] = (cats[cat] || 0) + i.total;
        });
     });
     return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [sales, products]);

  // Totals for Cards
  const totalRevenue = sales.reduce((acc, s) => s.status === SaleStatus.PAGADO ? acc + s.finalTotal : acc, 0);
  const totalExpenses = expenses.reduce((acc, e) => e.description.startsWith('INTERNAL') ? acc : acc + e.amount, 0);
  const totalOrders = sales.length;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase">Ingresos Totales</p>
            <h3 className="text-2xl font-black text-gray-800">{totalRevenue.toFixed(2)} Bs</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase">Gastos Operativos</p>
            <h3 className="text-2xl font-black text-gray-800">{totalExpenses.toFixed(2)} Bs</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase">Total Pedidos</p>
            <h3 className="text-2xl font-black text-gray-800">{totalOrders}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" /> Balance (Últimos 7 días)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    cursor={{fill: '#f3f4f6'}}
                />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Peaks */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" /> Horas Pico (Ventas)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{fontSize: 10}} interval={2} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="ventas" stroke="#a855f7" fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> Top 5 Productos
          </h3>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{left: 20}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#eab308" radius={[0, 4, 4, 0]} barSize={20}>
                    {topProductsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-blue-500" /> Métodos de Pago
          </h3>
           <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'QR' ? '#3b82f6' : '#22c55e'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatisticsPanel;
