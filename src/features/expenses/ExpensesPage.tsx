import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  Eye,
  TrendingDown,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ExpenseModal } from './components/ExpenseModal';
import { Expense, ExpenseCategory } from '../../types/expense';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';

export const ExpensesPage: React.FC = () => {
  const { filteredExpenses, addExpense, updateExpense, deleteExpense } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Filtered expenses
  const displayExpenses = useMemo(() => {
    return filteredExpenses.filter(e => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.propertyName && e.propertyName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = filterCategory === 'all' || e.category === filterCategory;
      const matchesMethod = filterMethod === 'all' || e.paymentMethod === filterMethod;

      return matchesSearch && matchesCat && matchesMethod;
    });
  }, [filteredExpenses, searchQuery, filterCategory, filterMethod]);

  const totalExpenseAmount = displayExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Category-wise totals
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const handleDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      showToast('Expense Removed', `Deleted ${expenseToDelete.title}.`, 'info');
      setExpenseToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const rows = displayExpenses.map(e => ({
      'Title': e.title,
      'Property': e.propertyName,
      'Category': e.category,
      'Amount (INR)': e.amount,
      'Expense Date': e.expenseDate,
      'Payment Method': e.paymentMethod,
      'Vendor / Payee': e.vendor,
      'Notes': e.notes || ''
    }));
    exportToCSV('StayNest_Operating_Expenses', rows);
    showToast('Export Complete', 'Exported expense ledger to CSV.', 'success');
  };

  return (
    <div>
      <PageHeader
        title="Expenses & Overhead"
        subtitle={`Tracking utility bills, food supplies, vendor invoices and operational expenditures`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Expense
            </Button>
          </div>
        }
      />

      {/* Top Expense Category Breakdown Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Filtered Expenses</span>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--danger-700)', marginTop: '2px' }}>
            {formatCurrency(totalExpenseAmount)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {displayExpenses.length} entries recorded
          </div>
        </div>

        {categoryTotals.slice(0, 3).map(([cat, amt]) => (
          <div key={cat} style={{ padding: '16px', backgroundColor: 'var(--slate-50)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{cat}</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '2px' }}>
              {formatCurrency(amt)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {totalExpenseAmount > 0 ? `${Math.round((amt / totalExpenseAmount) * 100)}% of total` : '0%'}
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-filters">
          <div className="filter-search-box">
            <Search className="filter-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search title, vendor, or property..."
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Electricity', label: 'Electricity' },
              { value: 'Water', label: 'Water' },
              { value: 'Internet', label: 'Internet' },
              { value: 'Food and groceries', label: 'Food & Groceries' },
              { value: 'Housekeeping', label: 'Housekeeping' },
              { value: 'Maintenance and repairs', label: 'Maintenance & Repairs' },
              { value: 'Staff salaries', label: 'Staff Salaries' },
              { value: 'Rent or lease', label: 'Property Rent / Lease' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          <Select
            value={filterMethod}
            onChange={e => setFilterMethod(e.target.value)}
            options={[
              { value: 'all', label: 'All Payment Modes' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Credit Card', label: 'Credit Card' }
            ]}
          />
        </div>
      </div>

      {/* Expenses Table */}
      {displayExpenses.length === 0 ? (
        <EmptyState
          icon={<Receipt size={32} />}
          title="No expenses match your search"
          description="Log utility bills, food supplies, repair invoices or staff payments."
          actionText="Log New Expense"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expense Item & Vendor</th>
                <th>PG Property</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date & Mode</th>
                <th>Remarks / Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayExpenses.map(expense => (
                <tr key={expense.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--slate-900)' }}>
                      {expense.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Vendor: {expense.vendor}
                    </div>
                  </td>
                  <td>
                    {expense.propertyName}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '11.5px',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--slate-100)',
                        color: 'var(--slate-700)',
                        fontWeight: 600
                      }}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--danger-700)' }}>
                      {formatCurrency(expense.amount)}
                    </div>
                  </td>
                  <td>
                    <div>{formatDate(expense.expenseDate)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {expense.paymentMethod}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '240px' }} className="text-truncate">
                      {expense.notes || '—'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px' }}
                        onClick={() => setEditingExpense(expense)}
                        title="Edit Expense"
                        aria-label="Edit Expense"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--danger-600)' }}
                        onClick={() => setExpenseToDelete(expense)}
                        title="Delete Expense"
                        aria-label="Delete Expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <ExpenseModal
        isOpen={isAddModalOpen || Boolean(editingExpense)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={data => {
          if (editingExpense) {
            updateExpense(editingExpense.id, data);
          } else {
            addExpense(data);
          }
        }}
        initialData={editingExpense || undefined}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Expense Entry"
        message={`Are you sure you want to delete the expense entry for "${expenseToDelete?.title}" (${formatCurrency(expenseToDelete?.amount || 0)})?`}
        confirmText="Delete Expense"
      />
    </div>
  );
};
