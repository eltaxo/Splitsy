'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import MonthlyChart from '@/components/ui/MonthlyChart';
import { formatCurrency } from '@/lib/utils';

export default function EstadisticasPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { stats, history, loading } = useMonthlyStats(selectedMonth);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      if (newDate > new Date()) return prev;
      return newDate;
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#8E887B]">Cargando...</div>;
  }

  if (!stats || stats.expenseCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-[#F4F1E8] mb-2">Sin datos este mes</h2>
        <p className="text-[#8E887B]">No hay gastos registrados en {selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
      </div>
    );
  }

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Tú';
  const partnerName = 'Tu pareja';
  const totalMonth = stats.userTotal + stats.partnerTotal;
  const userPaidMore = stats.userTotal > stats.partnerTotal;
  const difference = Math.abs(stats.userTotal - stats.partnerTotal);

  return (
    <div className="min-h-screen flex flex-col p-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F4F1E8] mb-4">Estadísticas</h1>

        {/* Selector de mes */}
        <div className="flex items-center justify-between">
          <button onClick={() => handleMonthChange('prev')} className="text-[#C8FF4D] text-2xl">←</button>
          <span className="text-lg font-bold text-[#F4F1E8] capitalize">
            {selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => handleMonthChange('next')}
            disabled={selectedMonth >= new Date()}
            className="text-[#C8FF4D] text-2xl disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-[#211F18] border border-[#302D24] rounded-2xl p-4 mb-6">
        <h2 className="text-sm font-bold text-[#8E887B] mb-4">Últimos 6 meses</h2>
        <MonthlyChart history={history} userName={userName} partnerName={partnerName} />
      </div>

      {/* Resumen del mes */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#8E887B]">Resumen de {selectedMonth.toLocaleDateString('es-ES', { month: 'long' })}</h2>

        {/* Total gastado */}
        <div className="bg-[#211F18] border border-[#302D24] rounded-2xl p-4">
          <div className="text-center">
            <div className="text-xs text-[#6B6759] mb-1">Total gastado</div>
            <div className="text-3xl font-bold text-[#C8FF4D]">
              {formatCurrency(totalMonth)} €
            </div>
            <div className="text-xs text-[#6B6759] mt-1">{stats.expenseCount} gastos</div>
          </div>
        </div>

        {/* Desglose por usuario */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#211F18] border border-[#302D24] rounded-xl p-3">
            <div className="text-xs text-[#6B6759] mb-1">{userName}</div>
            <div className="text-lg font-bold text-[#F4F1E8]">{formatCurrency(stats.userTotal)} €</div>
            <div className="text-xs text-[#6B6759]">{stats.userExpenseCount} gastos</div>
          </div>
          <div className="bg-[#211F18] border border-[#302D24] rounded-xl p-3">
            <div className="text-xs text-[#6B6759] mb-1">{partnerName}</div>
            <div className="text-lg font-bold text-[#F4F1E8]">{formatCurrency(stats.partnerTotal)} €</div>
            <div className="text-xs text-[#6B6759]">{stats.partnerExpenseCount} gastos</div>
          </div>
        </div>

        {/* Quién gastó más */}
        {difference > 0.01 && (
          <div className={`rounded-xl p-4 ${userPaidMore ? 'bg-[#16251B] border border-[#2A4A35]' : 'bg-[#1A1515] border border-[#352A2A]'}`}>
            <div className="text-center">
              <div className="text-sm text-[#8E887B] mb-1">
                {userPaidMore ? 'Has gastado más' : 'Tu pareja ha gastado más'}
              </div>
              <div className={`text-xl font-bold ${userPaidMore ? 'text-[#5FE39A]' : 'text-[#FF8077]'}`}>
                {formatCurrency(difference)} €
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
