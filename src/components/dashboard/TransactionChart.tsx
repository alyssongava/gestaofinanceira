import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card } from '../ui/Card';
import { Transaction } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface TransactionChartProps {
  transactions: Transaction[];
}

export function TransactionChart({ transactions }: TransactionChartProps) {
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('pt-BR', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      if (t.type === 'income') {
        existing.receitas += t.amount;
      } else {
        existing.despesas += t.amount;
      }
    } else {
      acc.push({
        month,
        receitas: t.type === 'income' ? t.amount : 0,
        despesas: t.type === 'expense' ? t.amount : 0
      });
    }
    
    return acc;
  }, [] as Array<{ month: string; receitas: number; despesas: number }>);

  const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', 
    '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas vs Despesas</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}