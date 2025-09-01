import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactionService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Transaction } from '../../types';
import { ReportChart } from './ReportChart';
import { ExportButtons } from './ExportButtons';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  RefreshCw 
} from 'lucide-react';
import { formatCurrency, getMonthName } from '../../lib/utils';

export function ReportsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState('current-month');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, period]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      const { startDate, endDate } = getDateRange(period);
      const data = await transactionService.getTransactions(user!.id, {
        startDate,
        endDate
      });

      setTransactions(data);
      generateReportData(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    let startDate: string, endDate: string;

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  const generateReportData = (transactions: Transaction[]) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    const categoryTotals = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    setReportData({
      income,
      expenses,
      balance,
      totalTransactions: transactions.length,
      topCategories,
      transactions
    });
  };

  const getPeriodTitle = () => {
    switch (period) {
      case 'current-month':
        return `${getMonthName(new Date())} ${new Date().getFullYear()}`;
      case 'last-month':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return `${getMonthName(lastMonth)} ${lastMonth.getFullYear()}`;
      case 'current-year':
        return new Date().getFullYear().toString();
      case 'last-year':
        return (new Date().getFullYear() - 1).toString();
      default:
        return 'Período Selecionado';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada - {getPeriodTitle()}</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="current-month">Mês Atual</option>
            <option value="last-month">Mês Passado</option>
            <option value="current-year">Ano Atual</option>
            <option value="last-year">Ano Passado</option>
          </select>
          <Button variant="secondary" onClick={loadReportData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(reportData?.income || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(reportData?.expenses || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Saldo</p>
              <p className={cn(
                'text-xl font-bold',
                (reportData?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {formatCurrency(reportData?.balance || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transações</p>
              <p className="text-xl font-bold text-purple-600">
                {reportData?.totalTransactions || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <ReportChart transactions={transactions} />

      {/* Top Categories */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categorias</h3>
        <div className="space-y-3">
          {reportData?.topCategories?.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{item.category}</span>
              <span className="font-semibold">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Options */}
      <ExportButtons 
        transactions={transactions} 
        reportData={reportData}
        period={getPeriodTitle()}
      />
    </div>
  );
}