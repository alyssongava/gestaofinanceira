export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  type: 'savings_suggestion' | 'spending_pattern' | 'cashflow_prediction';
  title: string;
  description: string;
  confidence: number;
  data: any;
  created_at: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyChange: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}