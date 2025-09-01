import React from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Brain,
  Settings,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-transaction', label: 'Nova Transação', icon: Plus },
    { id: 'income', label: 'Receitas', icon: TrendingUp },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'ai-insights', label: 'IA Insights', icon: Brain },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">FinanceApp</h1>
        <p className="text-sm text-gray-500 mt-1">Olá, {user?.user_metadata?.name || 'Usuário'}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200',
                    activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
}