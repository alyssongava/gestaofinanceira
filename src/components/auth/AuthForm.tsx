import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LogIn, UserPlus, Mail } from 'lucide-react';

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, name);
        setMessage('Conta criada com sucesso! Você já pode fazer login.');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (error: any) {
      setMessage(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FinanceApp</h1>
          <p className="text-gray-600 mt-2">Gerencie suas finanças com inteligência</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Input
              label="Nome completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome"
            />
          )}

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
          />

          {mode !== 'reset' && (
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Carregando...' : (
              mode === 'signin' ? 'Entrar' : 
              mode === 'signup' ? 'Criar conta' : 
              'Recuperar senha'
            )}
          </Button>

          {message && (
            <div className={cn(
              'p-3 rounded-lg text-sm text-center',
              message.includes('sucesso') || message.includes('enviado') 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            )}>
              {message}
            </div>
          )}
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-emerald-600 hover:text-emerald-700 text-sm"
              >
                Não tem conta? Cadastre-se
              </button>
              <br />
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Esqueceu a senha?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              Já tem conta? Faça login
            </button>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              Voltar ao login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}