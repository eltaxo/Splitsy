'use client';

import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import SummaryCard from '@/components/ui/SummaryCard';
import ExpenseList from '@/components/ui/ExpenseList';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ResumenPage() {
  const { user, loading } = useAuth();
  const { summary, expenses, loading: expensesLoading } = useExpenses();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || expensesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8E887B]">Cargando...</div>
      </div>
    );
  }

  if (!user || !user.partnerId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#15140F]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F4F1E8] mb-4">
            Necesitas una pareja
          </h1>
          <p className="text-[#8E887B] mb-6">
            Configura tu cuenta compartida primero
          </p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="btn-primary max-w-xs"
          >
            Configurar
          </button>
        </div>
      </div>
    );
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'Tú';
  const partnerName = 'Tu pareja'; // TODO: Obtener nombre real de la pareja

  return (
    <div className="min-h-screen flex flex-col p-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#F4F1E8] mb-2">
          Resumen
        </h1>
        <p className="text-[#8E887B]">
          Esta semana
        </p>
      </div>

      {/* Resumen de la semana */}
      {summary && (
        <div className="mb-8">
          <SummaryCard
            userTotal={summary.userTotal}
            partnerTotal={summary.partnerTotal}
            debt={summary.debt}
            debtor={summary.debtor}
            creditor={summary.creditor}
            isSettled={summary.isSettled}
            userName={userName}
          />
        </div>
      )}

      {/* Lista de gastos */}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-[#F4F1E8] mb-4">
          Gastos de esta semana
        </h2>
        <ExpenseList
          expenses={expenses}
          currentUserId={user.uid}
          currentUserName={userName}
          partnerName={partnerName}
        />
      </div>

      {/* Semanas anteriores (placeholder) */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#F4F1E8] mb-4">
          Semanas anteriores
        </h2>
        <div className="card text-center py-6">
          <p className="text-[#8E887B] text-sm">
            Próximamente podrás ver semanas anteriores
          </p>
        </div>
      </div>
    </div>
  );
}
