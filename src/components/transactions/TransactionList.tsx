import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Transaction, Category } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { 
  Edit, 
  Trash2, 
  Filter, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TransactionListProps {
  onEditTransaction?: (transaction: Transaction) => void;
  refreshTrigger?: number;
}

export function TransactionList({ onEditTransaction, refreshTrigger }: TransactionListProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '' as '' | 'income' | 'expense',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
  }, [user, refreshTrigger]);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, categoriesData] = await Promise.all([
        transactionService.getTransactions(user!.id),
        categoryService.getCategories(user!.id)
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const filterParams = {
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.category && { category: filters.category }),
        ...(filters.type && { type: filters.type })
      };

      const data = await transactionService.getTransactions(user!.id, filterParams);
      
      // Apply search filter on frontend
      let filteredData = data;
      if (filters.search) {
        filteredData = data.filter(t => 
          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setTransactions(filteredData);
    } catch (error) {
      console.error('Erro ao filtrar transações:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      await transactionService.deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar transações..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-200"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-200"
          >
            <option value="">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <Input
            label="Data inicial"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />

          <Input
            label="Data final"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />

          <div className="flex items-end">
            <Button variant="secondary" onClick={clearFilters} className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Transações ({transactions.length})
          </h3>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p>Nenhuma transação encontrada</p>
            <p className="text-sm">Ajuste os filtros ou adicione uma nova transação</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  )}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-6 h-6" />
                    ) : (
                      <ArrowDownRight className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={cn(
                      'text-lg font-semibold',
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditTransaction?.(transaction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}