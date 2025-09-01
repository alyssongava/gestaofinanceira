import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Category, Transaction } from '../../types';
import { Plus, X } from 'lucide-react';

interface TransactionFormProps {
  onTransactionAdded?: () => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

export function TransactionForm({ 
  onTransactionAdded, 
  editingTransaction, 
  onCancelEdit 
}: TransactionFormProps) {
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCategories();
  }, [type]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
    }
  }, [editingTransaction]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories(user!.id, type);
      setCategories(data);
      if (data.length > 0 && !category) {
        setCategory(data[0].name);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const transactionData = {
        user_id: user!.id,
        type,
        amount: parseFloat(amount),
        description,
        category,
        date
      };

      if (editingTransaction) {
        await transactionService.updateTransaction(editingTransaction.id, transactionData);
        setMessage('Transação atualizada com sucesso!');
        onCancelEdit?.();
      } else {
        await transactionService.createTransaction(transactionData);
        setMessage('Transação adicionada com sucesso!');
        
        // Reset form
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
      }

      onTransactionAdded?.();
    } catch (error: any) {
      setMessage(error.message || 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    onCancelEdit?.();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
        </h2>
        {editingTransaction && (
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              type === 'income'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              type === 'expense'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Despesa
          </button>
        </div>

        <Input
          label="Valor"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          required
        />

        <Input
          label="Descrição"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva a transação"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-200"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : (editingTransaction ? 'Atualizar' : 'Adicionar')}
          </Button>
          {editingTransaction && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm text-center ${
            message.includes('sucesso')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </Card>
  );
}