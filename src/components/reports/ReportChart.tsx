import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Transaction } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface ReportChartProps {
  transactions: Transaction[];
}

export function ReportChart({ transactions }: ReportChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('bar');

  const processDataForCharts = () => {
    // Monthly data for line and bar charts
    const monthlyData = transactions.reduce((acc, t) => {
      const monthKey = new Date(t.date).toLocaleDateString('pt-BR', { 
        month: '2-digit', 
        year: 'numeric' 
      });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, receitas: 0, despesas: 0, saldo: 0 };
      }
      
      if (t.type === 'income') {
        acc[monthKey].receitas += t.amount;
      } else {
        acc[monthKey].despesas += t.amount;
      }
      
      acc[monthKey].saldo = acc[monthKey].receitas - acc[monthKey].despesas;
      
      return acc;
    }, {} as Record<string, any>);

    const lineBarData = Object.values(monthlyData).sort((a: any, b: any) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    // Category data for pie chart
    const categoryData = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { lineBarData, pieData };
  };

  const { lineBarData, pieData } = processDataForCharts();

  const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', 
    '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'
  ];

  const chartButtons = [
    { type: 'bar' as const, icon: BarChart3, label: 'Barras' },
    { type: 'line' as const, icon: TrendingUp, label: 'Linha' },
    { type: 'pie' as const, icon: PieChartIcon, label: 'Pizza' }
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={lineBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="receitas" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Receitas"
            />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="Despesas"
            />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Saldo"
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={lineBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
            <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
          </BarChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise visual dos seus dados financeiros</p>
        </div>
        <Button variant="secondary" onClick={loadReportData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Period Selection */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Período de Análise</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'current-month', label: 'Mês Atual' },
            { value: 'last-month', label: 'Mês Passado' },
            { value: 'current-year', label: 'Ano Atual' },
            { value: 'last-year', label: 'Ano Passado' }
          ].map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? 'primary' : 'secondary'}
              onClick={() => setPeriod(option.value)}
              className="justify-center"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Chart Controls */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Visualização</h3>
          <div className="flex gap-2">
            {chartButtons.map((button) => {
              const Icon = button.icon;
              return (
                <Button
                  key={button.type}
                  variant={chartType === button.type ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setChartType(button.type)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {button.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
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