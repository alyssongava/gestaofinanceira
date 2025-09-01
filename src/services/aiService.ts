import { Transaction } from '../types';

export const aiService = {
  analyzeSpendingPatterns(transactions: Transaction[]) {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    const categories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      topSpendingCategories: categories.slice(0, 5),
      totalExpenses,
      insights: this.generateInsights(categories, transactions)
    };
  },

  generateInsights(categories: any[], transactions: Transaction[]) {
    const insights = [];

    // Categoria com maior gasto
    if (categories.length > 0) {
      const topCategory = categories[0];
      if (topCategory.percentage > 30) {
        insights.push({
          type: 'savings_suggestion',
          title: 'Alto gasto em uma categoria',
          description: `Você está gastando ${topCategory.percentage.toFixed(1)}% do seu orçamento em ${topCategory.category}. Considere revisar esses gastos.`,
          confidence: 85
        });
      }
    }

    // Análise de tendência mensal
    const currentMonth = new Date().getMonth();
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.date).getMonth() === currentMonth && t.type === 'expense'
    );
    const currentMonthTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthTransactions = transactions.filter(t => 
      new Date(t.date).getMonth() === previousMonth && t.type === 'expense'
    );
    const previousMonthTotal = previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (previousMonthTotal > 0) {
      const change = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      if (change > 20) {
        insights.push({
          type: 'spending_pattern',
          title: 'Aumento significativo nos gastos',
          description: `Seus gastos aumentaram ${change.toFixed(1)}% em relação ao mês passado. Monitore de perto suas despesas.`,
          confidence: 90
        });
      } else if (change < -10) {
        insights.push({
          type: 'spending_pattern',
          title: 'Economia realizada',
          description: `Parabéns! Você reduziu seus gastos em ${Math.abs(change).toFixed(1)}% em relação ao mês passado.`,
          confidence: 95
        });
      }
    }

    return insights;
  },

  predictCashflow(transactions: Transaction[]) {
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toISOString().substring(0, 7);
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    const months = Object.keys(monthlyData).sort();
    if (months.length < 3) {
      return null;
    }

    const recent = months.slice(-3);
    const avgIncome = recent.reduce((sum, month) => sum + monthlyData[month].income, 0) / 3;
    const avgExpenses = recent.reduce((sum, month) => sum + monthlyData[month].expenses, 0) / 3;

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      month: nextMonth.toISOString().substring(0, 7),
      predictedIncome: Math.round(avgIncome),
      predictedExpenses: Math.round(avgExpenses),
      predictedBalance: Math.round(avgIncome - avgExpenses),
      confidence: 75
    };
  }
};