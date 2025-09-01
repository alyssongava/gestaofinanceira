import React from 'react';
import { Card } from '../ui/Card';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AIInsightsProps {
  insights: any;
}

export function AIInsights({ insights }: AIInsightsProps) {
  if (!insights || !insights.insights?.length) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">IA Insights</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Adicione mais transações para</p>
          <p className="text-sm">receber insights personalizados</p>
        </div>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'savings_suggestion':
        return <Target className="w-5 h-5 text-orange-500" />;
      case 'spending_pattern':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">IA Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.insights.map((insight: any, index: number) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100"
          >
            <div className="flex items-start gap-3">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
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

        {insights.prediction && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Previsão do Próximo Mês</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Receita prevista</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(insights.prediction.predictedIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Despesa prevista</p>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(insights.prediction.predictedExpenses)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-200">
                  <p className="text-gray-600 text-xs">Saldo previsto</p>
                  <p className="font-bold text-emerald-700">
                    {formatCurrency(insights.prediction.predictedBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}