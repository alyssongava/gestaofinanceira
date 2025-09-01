import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactionService';
import { aiService } from '../../services/aiService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  RefreshCw,
  PieChart,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export function AIInsightsPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user]);

  const generateInsights = async () => {
    try {
      setLoading(true);
      const transactions = await transactionService.getTransactions(user!.id);
      
      if (transactions.length > 0) {
        const analysis = aiService.analyzeSpendingPatterns(transactions);
        const cashflowPrediction = aiService.predictCashflow(transactions);
        
        setInsights(analysis);
        setPrediction(cashflowPrediction);
      }
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IA Insights</h1>
          <p className="text-gray-600">Análises inteligentes dos seus hábitos financeiros</p>
        </div>
        <Button onClick={generateInsights} disabled={loading}>
          <Brain className="w-4 h-4 mr-2" />
          Gerar Análise
        </Button>
      </div>

      {!insights && !prediction ? (
        <Card>
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              IA Insights não disponível
            </h3>
            <p className="text-gray-600 mb-4">
              Adicione pelo menos 5 transações para receber análises personalizadas
            </p>
            <Button onClick={generateInsights}>
              Verificar Novamente
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Analysis */}
          {insights && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Análise de Gastos</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Resumo dos Gastos</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Total gasto: {formatCurrency(insights.totalExpenses)}
                  </p>
                  
                  <div className="space-y-2">
                    {insights.topSpendingCategories?.slice(0, 3).map((cat: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">{cat.category}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-blue-900">
                            {formatCurrency(cat.amount)}
                          </span>
                          <span className="text-xs text-blue-600 ml-2">
                            ({cat.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {insights.insights?.map((insight: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        {insight.type === 'savings_suggestion' ? (
                          <Target className="w-4 h-4 text-purple-600" />
                        ) : insight.type === 'spending_pattern' ? (
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-purple-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-purple-700">{insight.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-purple-600">
                            Confiança: {insight.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Cashflow Prediction */}
          {prediction && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Previsão de Fluxo de Caixa</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-medium text-emerald-900 mb-3">
                    Próximo Mês ({prediction.month})
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-700">Receita Prevista</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(prediction.predictedIncome)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-700">Despesa Prevista</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(prediction.predictedExpenses)}
                      </span>
                    </div>
                    
                    <div className="border-t border-emerald-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-800">Saldo Previsto</span>
                        <span className={`font-bold text-lg ${
                          prediction.predictedBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(prediction.predictedBalance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-600">
                        Confiança da previsão: {prediction.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      Baseado na média dos últimos 3 meses
                    </p>
                  </div>
                </div>

                {prediction.predictedBalance < 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">Atenção: Saldo Negativo Previsto</h4>
                        <p className="text-sm text-red-700">
                          Com base no seu padrão atual, você pode ter um saldo negativo no próximo mês. 
                          Considere revisar seus gastos ou aumentar sua receita.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recomendações IA</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">Dica de Economia</h4>
            <p className="text-sm text-yellow-800">
              Analise seus gastos semanalmente para identificar padrões e oportunidades de economia. 
              Pequenas mudanças podem gerar grandes resultados!
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Meta de Poupança</h4>
            <p className="text-sm text-green-800">
              Defina uma meta de economizar 20% da sua receita mensal. 
              Use a regra 50/30/20: 50% gastos essenciais, 30% gastos pessoais, 20% poupança.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}