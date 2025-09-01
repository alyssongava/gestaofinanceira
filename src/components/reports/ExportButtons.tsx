import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Download, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportButtonsProps {
  transactions: Transaction[];
  reportData: any;
  period: string;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function ExportButtons({ transactions, reportData, period }: ExportButtonsProps) {
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Relatório Financeiro', 20, 30);
    doc.setFontSize(12);
    doc.text(`Período: ${period}`, 20, 40);
    
    // Summary
    let yPosition = 60;
    doc.setFontSize(14);
    doc.text('Resumo', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`Total de Receitas: ${formatCurrency(reportData?.income || 0)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total de Despesas: ${formatCurrency(reportData?.expenses || 0)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Saldo: ${formatCurrency(reportData?.balance || 0)}`, 20, yPosition);
    
    // Transactions table
    yPosition += 20;
    const tableData = transactions.map(t => [
      formatDate(t.date),
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      formatCurrency(t.amount)
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`relatorio-financeiro-${period.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const csvData = transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-financeiro-${period.toLowerCase().replace(/\s+/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Relatório</h3>
      <div className="flex flex-wrap gap-3">
        <Button onClick={exportToPDF} variant="secondary">
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
        <Button onClick={exportToCSV} variant="secondary">
          <Table className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
        <Button 
          onClick={() => window.print()} 
          variant="secondary"
        >
          <Download className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Exporte seus dados financeiros para análise externa ou backup
      </p>
    </Card>
  );
}