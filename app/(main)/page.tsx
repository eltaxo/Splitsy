'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import ExpenseForm from '@/components/forms/ExpenseForm';
import FridayBanner from '@/components/ui/FridayBanner';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);
  const [debtorName, setDebtorName] = useState<string | undefined>();
  const [debtAmount, setDebtAmount] = useState<number | undefined>();

  useEffect(() => {
    console.log('HomePage useEffect:', { loading, user: !!user, partnerId: user?.partnerId });
    // NO redirecciones automáticas - cada página maneja su lógica
  }, [user, loading]);

  useEffect(() => {
    // Comprobar si es viernes y mostrar banner
    if (!user || !user.partnerId) return;

    const checkFridayBanner = async () => {
      try {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = domingo, 5 = viernes

        // Es viernes (o posterior)
        if (dayOfWeek >= 5) {
          // Calcular deuda de esta semana
          const { getExpensesQuery, getWeekStart } = await import('@/lib/firestore');
          const { getDocs } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const weekStart = getWeekStart(new Date());
          const userIds: string[] = [user.uid, user.partnerId].filter(Boolean) as string[];

          const q = getExpensesQuery(userIds, weekStart);
          const querySnapshot = await getDocs(q);

          const expenses = querySnapshot.docs.map(doc => doc.data());
          const myExpenses = expenses.filter((e: any) => e.paidBy === user.uid);
          const partnerExpenses = expenses.filter((e: any) => e.paidBy === user.partnerId);

          const myTotal = myExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
          const partnerTotal = partnerExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
          const grandTotal = myTotal + partnerTotal;
          const debt = myTotal - grandTotal / 2;

          // Mostrar banner si hay deuda significativa
          if (Math.abs(debt) > 0.01 && expenses.length > 0) {
            const iOwe = debt < 0;
            const amountOwed = Math.abs(debt);

            setDebtAmount(amountOwed);
            setDebtorName(iOwe ? 'Tú' : 'Tu pareja');
            setShowBanner(true);
          }
        }
      } catch (error) {
        console.error('Error al calcular deuda para banner:', error);
      }
    };

    checkFridayBanner();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8E887B]">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario, mostrar loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8E887B]">Cargando...</div>
      </div>
    );
  }

  // Si no tiene pareja, mostrar pantalla de onboarding temporal
  if (!user.partnerId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#15140F]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F4F1E8] mb-4">
            ¡Bienvenido a Splitsy!
          </h1>
          <p className="text-[#8E887B] mb-6">
            Primero necesitas configurar tu cuenta compartida
          </p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="btn-primary max-w-xs"
          >
            Ir a configurar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[#C8FF4D]">
              <img
                src={user.photoURL}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl bg-[#C8FF4D] flex items-center justify-center font-bold text-lg">
              {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-[#8E887B] tracking-wide">
              Hola, {(user.displayName || user.email?.split('@')[0] || 'Usuario')}
            </div>
            <div className="font-bold text-lg leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              Nuevo gasto
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-xl bg-[#211F18] border-2 border-[#15140F] flex items-center justify-center font-bold text-sm">
            {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Banner de viernes (condicional) */}
      {showBanner && (
        <div className="mb-6">
          <FridayBanner debtorName={debtorName} amount={debtAmount} />
        </div>
      )}

      {/* Formulario de gasto */}
      <div className="flex-1">
        <ExpenseForm
          onSuccess={() => {
            // Refrescar datos si es necesario
          }}
        />
      </div>
    </div>
  );
}