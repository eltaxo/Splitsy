import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface MonthlyStats {
  month: string;           // "2025-01"
  userTotal: number;
  partnerTotal: number;
  expenseCount: number;
  userExpenseCount: number;
  partnerExpenseCount: number;
}

export function useMonthlyStats(selectedMonth: Date) {
  const { user } = useAuth();
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [history, setHistory] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.partnerId) {
      setLoading(false);
      return;
    }

    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        // Calcular rango del mes
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

        const userIds = [user.uid, user.partnerId];

        // Query gastos (sin filtrar por mes en DB, lo hacemos en cliente)
        const expensesRef = collection(db, 'expenses');
        const q = query(expensesRef, where('paidBy', 'in', userIds));
        const querySnapshot = await getDocs(q);

        // Filtrar por mes en cliente y calcular stats
        const allExpenses = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            paidBy: data.paidBy,
            amount: data.amount,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
          };
        }) as Array<{ id: string; paidBy: string; amount: number; createdAt: Date }>;

        const monthExpenses = allExpenses.filter(exp => {
          const date = new Date(exp.createdAt);
          return date >= monthStart && date <= monthEnd;
        });

        const userExpenses = monthExpenses.filter(e => e.paidBy === user.uid);
        const partnerExpenses = monthExpenses.filter(e => e.paidBy === user.partnerId);

        const currentStats: MonthlyStats = {
          month: `${year}-${String(month + 1).padStart(2, '0')}`,
          userTotal: userExpenses.reduce((sum, e) => sum + e.amount, 0),
          partnerTotal: partnerExpenses.reduce((sum, e) => sum + e.amount, 0),
          expenseCount: monthExpenses.length,
          userExpenseCount: userExpenses.length,
          partnerExpenseCount: partnerExpenses.length,
        };

        setStats(currentStats);

        // Obtener historial de últimos 6 meses
        const historyData: MonthlyStats[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(year, month - i, 1);
          const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
          const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

          const mExpenses = allExpenses.filter(exp => {
            const date = new Date(exp.createdAt);
            return date >= mStart && date <= mEnd;
          });

          const mUser = mExpenses.filter(e => e.paidBy === user.uid);
          const mPartner = mExpenses.filter(e => e.paidBy === user.partnerId);

          historyData.push({
            month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            userTotal: mUser.reduce((sum, e) => sum + e.amount, 0),
            partnerTotal: mPartner.reduce((sum, e) => sum + e.amount, 0),
            expenseCount: mExpenses.length,
            userExpenseCount: mUser.length,
            partnerExpenseCount: mPartner.length,
          });
        }

        setHistory(historyData);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [user, selectedMonth]);

  return { stats, history, loading };
}
