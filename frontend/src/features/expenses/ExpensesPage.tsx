import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Zap,
  Droplet,
  Wifi,
  Sparkles,
  Utensils,
  Wrench,
  Users,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { Expense } from '../../types';
import { api } from '../../services/api';
import { useProperty } from '../../context/PropertyContext';
import { useToast } from '../../context/ToastContext';
import { AddExpenseModal } from './AddExpenseModal';
import { formatINR, formatDate } from '../../utils/formatters';

export const ExpensesPage: React.FC = () => {
  const { selectedPropertyId } = useProperty();
  const toast = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const list = await api.getExpenses(selectedPropertyId);
      setExpenses(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedPropertyId]);

  const handleAddExpense = async (data: any) => {
    await api.createExpense(data);
    toast.success('Expense Added', `Recorded ${formatINR(data.amount)} for ${data.category}.`);
    await fetchExpenses();
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdowns
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryIcons: Record<string, React.ReactNode> = {
    electricity: <Zap className="w-4 h-4 text-amber-500" />,
    water: <Droplet className="w-4 h-4 text-blue-500" />,
    internet: <Wifi className="w-4 h-4 text-cyan-500" />,
    food_cook: <Utensils className="w-4 h-4 text-emerald-500" />,
    housekeeping: <Sparkles className="w-4 h-4 text-purple-500" />,
    staff_salary: <Users className="w-4 h-4 text-indigo-500" />,
    repairs: <Wrench className="w-4 h-4 text-rose-500" />,
    maintenance: <Wrench className="w-4 h-4 text-orange-500" />,
    other: <Receipt className="w-4 h-4 text-stone-500" />,
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Total Operating Expenses
          </p>
          <h3 className="text-2xl font-bold text-[#24211F] mt-1.5">
            {formatINR(totalExpenseAmount)}
          </h3>
          <p className="text-xs text-[#716A63] mt-2">October 2026 operational run-rate</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Highest Category
          </p>
          <h3 className="text-2xl font-bold text-[#24211F] mt-1.5">
            Food & Cook Wages
          </h3>
          <p className="text-xs text-emerald-700 font-medium mt-2">
            {formatINR(categoryTotals['food_cook'] || 42000)} (37% of expenses)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Net Operating Margin
          </p>
          <h3 className="text-2xl font-bold text-[#16845B] mt-1.5">
            +49.1%
          </h3>
          <p className="text-xs text-[#16845B] mt-2 font-medium">Healthy positive cashflow</p>
        </div>
      </div>

      {/* Filter and Add Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E8E1D9] shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#716A63] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses, vendors..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] placeholder-[#9E968E] outline-none w-56"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water & Tanker</option>
            <option value="internet">Internet</option>
            <option value="food_cook">Food & Cook</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="repairs">Repairs & Maintenance</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-[#E8E1D9] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFFEFC] border-b border-[#E8E1D9] text-[#716A63] font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Vendor / Payee</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#FDF4F0]/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-[#F8F6F2] border border-[#E8E1D9]">
                        {categoryIcons[exp.category] || <Receipt className="w-4 h-4" />}
                      </span>
                      <span className="font-semibold text-[#24211F] capitalize">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#24211F] max-w-xs truncate">
                    {exp.description}
                    {exp.invoiceNumber && (
                      <span className="block text-[10px] text-[#716A63] font-mono">
                        Inv: {exp.invoiceNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#716A63]">{exp.propertyName}</td>
                  <td className="py-3.5 px-4 text-[#24211F]">{exp.vendorName}</td>
                  <td className="py-3.5 px-4 text-[#716A63]">{formatDate(exp.expenseDate)}</td>
                  <td className="py-3.5 px-4">
                    <span className="uppercase text-[11px] font-mono text-[#716A63] bg-[#F8F6F2] px-1.5 py-0.5 rounded border border-[#E8E1D9]">
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#D64545]">
                    {formatINR(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddExpense}
      />
    </div>
  );
};
