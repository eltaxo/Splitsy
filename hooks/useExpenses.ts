'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getWeekStart, getPendingSettlement } from '@/lib/firestore';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ExpenseSummary {
  userTotal: number;
  partnerTotal: number;
  debt: number;
  debtor: string | null;
  creditor: string | null;
  isSettled: boolean;
}

export function useExpenses() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.partnerId) {
      setLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const weekStart = getWeekStart();
        const userIds = [user.uid, user.partnerId];

        // Obtener gastos de la semana (versión temporal sin orderBy para evitar índice)
        const expensesRef = collection(db, 'expenses');
        let q;

        try {
          // Intentar con orderBy primero (cuando el índice esté listo)
          q = query(
            expensesRef,
            where('paidBy', 'in', userIds),
            where('weekStart', '==', weekStart),
            orderBy('createdAt', 'desc')
          );
        } catch (indexError) {
          // Si el índice no está listo, usar sin orderBy
          console.warn('Índice no listo, usando consulta sin ordenamiento');
          q = query(
            expensesRef,
            where('paidBy', 'in', userIds),
            where('weekStart', '==', weekStart)
          );
        }

        const querySnapshot = await getDocs(q);
        const expensesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            paidBy: data.paidBy,
            amount: data.amount,
            concept: data.concept,
            // Convertir Timestamp a Date si es necesario
            createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
              ? data.createdAt.toDate()
              : data.createdAt,
            weekStart: data.weekStart && typeof data.weekStart.toDate === 'function'
              ? data.weekStart.toDate()
              : data.weekStart,
            receipt_url: data.receipt_url || null,  // NUEVO
            note: data.note || null,                // NUEVO
          } as { paidBy: string; amount: number; concept: string; createdAt: Date; weekStart: Date; receipt_url?: string | null; note?: string | null };
        });

        setExpenses(expensesData);

        // Calcular totales
        const userExpenses = expensesData.filter((e) => e.paidBy === user.uid);
        const partnerExpenses = expensesData.filter((e) => e.paidBy === user.partnerId);

        const userTotal = userExpenses.reduce((sum, e) => sum + e.amount, 0);
        const partnerTotal = partnerExpenses.reduce((sum, e) => sum + e.amount, 0);

        // Calcular deuda
        const total = userTotal + partnerTotal;
        const half = total / 2;
        const userDebt = half - userTotal;
        const partnerDebt = half - partnerTotal;

        let debtor: string | null = null;
        let creditor: string | null = null;
        let debt = 0;
        let isSettled = false;

        if (Math.abs(userDebt) < 0.01) {
          // Están al día
          isSettled = true;
        } else if (userDebt > 0) {
          // Usuario debe a pareja
          debtor = user.displayName || user.email?.split('@')[0] || 'Tú';
          creditor = 'Tu pareja';
          debt = userDebt;
        } else {
          // Pareja debe a usuario
          debtor = 'Tu pareja';
          creditor = user.displayName || user.email?.split('@')[0] || 'Tú';
          debt = partnerDebt;
        }

        setSummary({
          userTotal,
          partnerTotal,
          debt,
          debtor,
          creditor,
          isSettled,
        });
      } catch (error) {
        console.error('Error al obtener gastos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  return {
    summary,
    expenses,
    loading,
  };
}
