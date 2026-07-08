'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getWeekStart, getPendingSettlement, getUser } from '@/lib/firestore';
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

export function useExpenses(selectedWeek?: Date | null) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [partnerName, setPartnerName] = useState<string>('Tu pareja');
  const [partnerPhotoURL, setPartnerPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.partnerId) {
      setLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        // Usar la semana seleccionada o null para todos los gastos
        const weekStart = selectedWeek !== undefined ? selectedWeek : null;
        const userIds = [user.uid, user.partnerId];

        console.log('📅 Fetching expenses with weekStart:', weekStart);
        console.log('👤 User IDs:', userIds);

        // Obtener datos de la pareja
        if (user.partnerId) {
          const partnerData = await getUser(user.partnerId);
          if (partnerData) {
            setPartnerName(partnerData.name);
            setPartnerPhotoURL(partnerData.photoURL || null);
          }
        }

        // Obtener gastos
        const expensesRef = collection(db, 'expenses');
        let q;

        if (weekStart) {
          // Filtro por semana específica
          try {
            q = query(
              expensesRef,
              where('paidBy', 'in', userIds),
              where('weekStart', '==', weekStart),
              orderBy('createdAt', 'desc')
            );
          } catch (indexError) {
            console.warn('Índice no listo, usando consulta sin ordenamiento');
            q = query(
              expensesRef,
              where('paidBy', 'in', userIds),
              where('weekStart', '==', weekStart)
            );
          }
        } else {
          // Todos los gastos (sin filtro de semana)
          try {
            q = query(
              expensesRef,
              where('paidBy', 'in', userIds),
              orderBy('createdAt', 'desc')
            );
          } catch (indexError) {
            console.warn('Índice no listo, usando consulta sin ordenamiento');
            q = query(
              expensesRef,
              where('paidBy', 'in', userIds)
            );
          }
        }

        const querySnapshot = await getDocs(q);
        console.log('🔍 Query snapshot size:', querySnapshot.size);
        console.log('🔍 Query result:', querySnapshot);

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
        console.log('💰 Expenses data:', expensesData);

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
          creditor = partnerName;
          debt = userDebt;
        } else {
          // Pareja debe a usuario
          debtor = partnerName;
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
        console.error('❌ Error al obtener gastos:', error);
        console.error('Error details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user, selectedWeek]);

  return {
    summary,
    expenses,
    loading,
    partnerName,
    partnerPhotoURL,
  };
}
