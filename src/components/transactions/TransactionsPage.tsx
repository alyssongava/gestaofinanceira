import React, { useState } from 'react';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { Transaction } from '../../types';

export function TransactionsPage() {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
        <p className="text-gray-600">Gerencie suas receitas e despesas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TransactionForm
            onTransactionAdded={handleTransactionAdded}
            editingTransaction={editingTransaction}
            onCancelEdit={handleCancelEdit}
          />
        </div>
        
        <div className="lg:col-span-2">
          <TransactionList
            onEditTransaction={handleEditTransaction}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
}