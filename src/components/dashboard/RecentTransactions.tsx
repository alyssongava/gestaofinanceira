import React from 'react';
import { Card } from '../ui/Card';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transações Recentes</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma transação encontrada</p>
          <p className="text-sm">Adicione sua primeira transação para começar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
        <span className="text-sm text-gray-500">{transactions.length} transações</span>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                transaction.type === 'income' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              )}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                'font-semibold',
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              )}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}