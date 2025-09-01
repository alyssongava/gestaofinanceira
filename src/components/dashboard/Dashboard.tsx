import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactionService';
import { aiService } from '../../services/aiService';
import { StatsCard } from './StatsCard';
import { TransactionChart } from './TransactionChart';
import { RecentTransactions } from './RecentTransactions';
import { AIInsights } from './AIInsights';
import { Card } from '../ui/Card';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, getMonthName } from '../../lib/utils';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, transactions] = await Promise.all([
        transactionService.getDashboardStats(user!.id),
        transactionService.getTransactions(user!.id)
      ]);

      setStats(dashboardStats);
      
      if (transactions.length > 0) {
        const aiAnalysis = aiService.analyzeSpendingPatterns(transactions);
        const prediction = aiService.predictCashflow(transactions);
        setInsights({ ...aiAnalysis, prediction });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const currentMonth = getMonthName(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumo financeiro de {currentMonth}</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Receitas"
          value={stats?.totalIncome || 0}
          icon={<TrendingUp className="w-8 h-8" />}
          type="positive"
        />
        <StatsCard
          title="Despesas"
          value={stats?.totalExpenses || 0}
          icon={<TrendingDown className="w-8 h-8" />}
          type="negative"
        />
        <StatsCard
          title="Saldo"
          value={stats?.balance || 0}
          icon={<Wallet className="w-8 h-8" />}
          type={stats?.balance >= 0 ? 'positive' : 'negative'}
        />
        <StatsCard
          title="Economia"
          value={Math.max(0, (stats?.totalIncome || 0) - (stats?.totalExpenses || 0))}
          icon={<PiggyBank className="w-8 h-8" />}
          type="positive"
        />
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionChart transactions={stats?.transactions || []} />
        <AIInsights insights={insights} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={stats?.transactions?.slice(0, 10) || []} />
    </div>
  );
}