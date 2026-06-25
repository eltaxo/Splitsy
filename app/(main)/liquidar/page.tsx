'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { useRouter } from 'next/navigation';
import { createSettlement, getPendingSettlement, confirmSettlement, getWeekStart } from '@/lib/firestore';
import { formatCurrency } from '@/lib/utils';

export default function LiquidarPage() {
  const { user, loading } = useAuth();
  const { summary } = useExpenses();
  const router = useRouter();
  const [pendingSettlement, setPendingSettlement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !user.partnerId) return;

    const checkPendingSettlement = async () => {
      try {
        const weekStart = getWeekStart();
        const userIds: string[] = [user.uid, user.partnerId].filter(Boolean) as string[];

        const pending = await getPendingSettlement(weekStart, userIds);
        setPendingSettlement(pending);
      } catch (error) {
        console.error('Error al obtener liquidación pendiente:', error);
      }
    };

    checkPendingSettlement();
  }, [user]);

  const handleCreateSettlement = async () => {
    if (!user || !user.partnerId || !summary) return;

    setIsLoading(true);
    setError(null);

    try {
      const weekStart = getWeekStart();

      // Determinar quién paga y quién recibe
      let payerId: string;
      let receiverId: string;

      if (summary.debtor === 'Tú' || summary.debtor === (user.displayName || user.email?.split('@')[0])) {
        payerId = user.uid;
        receiverId = user.partnerId;
      } else {
        payerId = user.partnerId;
        receiverId = user.uid;
      }

      await createSettlement({
        weekStart,
        payerId,
        receiverId,
        amount: summary.debt,
        status: 'pending',
        sentAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => {
        // Refrescar para mostrar la liquidación pendiente
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al crear liquidación:', error);
      setError('Error al crear la liquidación. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReception = async () => {
    if (!pendingSettlement) return;

    setIsLoading(true);
    setError(null);

    try {
      await confirmSettlement(pendingSettlement.id);

      setSuccess(true);
      setTimeout(() => {
        router.push('/resumen');
      }, 2000);
    } catch (error) {
      console.error('Error al confirmar liquidación:', error);
      setError('Error al confirmar la liquidación. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !summary) {
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
  const isPayer = pendingSettlement?.payerId === user.uid;
  const isReceiver = pendingSettlement?.receiverId === user.uid;

  // Vista: Usuario debe pagar
  if (!pendingSettlement && !summary.isSettled && summary.debt > 0) {
    const userIsDebtor = summary.debtor === 'Tú' || summary.debtor === userName;

    if (!userIsDebtor) {
      // El usuario es el acreedor, no el deudor
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="card text-center max-w-sm w-full">
            <p className="text-4xl mb-4">⏳</p>
            <h2 className="text-xl font-bold text-[#F4F1E8] mb-2">
              Esperando a tu pareja
            </h2>
            <p className="text-[#8E887B] mb-6">
              {summary.debtor} debe enviarte {formatCurrency(summary.debt)}€
            </p>
            <p className="text-sm text-[#8E887B]">
              Cuando realice el Bizum, recibirás un aviso para confirmarlo
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card max-w-sm w-full">
          <h1 className="text-2xl font-extrabold text-[#F4F1E8] font-display mb-6 text-center">
            Toca liquidar
          </h1>

          {/* Resumen */}
          <div className="mb-6">
            <div className="bg-[#211F18] border border-[#302D24] rounded-2xl p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-[#8E887B]">Tú has gastado:</span>
                <span className="font-bold text-[#F4F1E8] font-display">
                  {formatCurrency(summary.userTotal)} €
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E887B]">Tu pareja:</span>
                <span className="font-bold text-[#F4F1E8] font-display">
                  {formatCurrency(summary.partnerTotal)} €
                </span>
              </div>
            </div>

            {/* Panel de énfasis oscuro */}
            <div className="relative overflow-hidden bg-[#0D0C0A] border border-[#2A2820] rounded-3xl p-8 text-center">
              <p className="text-xs font-bold tracking-wider uppercase text-[#B8B2A4]">Tienes que enviar</p>
              <p className="text-5xl font-extrabold text-[#C8FF4D] font-display my-2">{formatCurrency(summary.debt)} €</p>
              <p className="text-sm text-[#B8B2A4]">Haz un Bizum a tu pareja</p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-4">✓</p>
              <p className="text-[#5FE39A] font-bold">
                ¡Registrado!
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleCreateSettlement}
                disabled={isLoading}
                className="btn-primary mb-4"
              >
                {isLoading ? 'Registrando...' : 'Ya lo he enviado'}
              </button>

              <p className="text-center text-sm text-[#8E887B]">
                Tu pareja recibirá un aviso para confirmarlo
              </p>
            </>
          )}

          {error && (
            <div className="mt-4 text-center text-[#FF8077] text-sm">
              {error}
            </div>
          )}

          <button
            onClick={() => router.back()}
            className="w-full mt-6 text-[#8E887B] hover:text-[#F4F1E8] underline"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Vista: Liquidación pendiente (usuario envió)
  if (pendingSettlement && isPayer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card text-center max-w-sm w-full">
          <p className="text-4xl mb-4">⏰</p>
          <h2 className="text-xl font-bold text-[#F4F1E8] mb-2">
            Esperando confirmación
          </h2>
          <p className="text-[#8E887B] mb-6">
            Esperando que tu pareja confirme el Bizum de {formatCurrency(pendingSettlement.amount || 0)} €
          </p>
          <p className="text-sm text-[#8E887B]">
            Recibirás un aviso cuando lo confirme
          </p>
        </div>
      </div>
    );
  }

  // Vista: Usuario debe confirmar recepción
  if (pendingSettlement && isReceiver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card max-w-sm w-full">
          <div className="text-center mb-6">
            <p className="text-4xl mb-4">💸</p>
            <h2 className="text-xl font-bold text-[#F4F1E8] mb-2">
              Tu pareja te ha enviado dinero
            </h2>
            <p className="text-[#8E887B]">
              {formatCurrency(pendingSettlement.amount || 0)} € via Bizum
            </p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-4">✓</p>
              <p className="text-[#5FE39A] font-bold">
                ¡Confirmado!
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleConfirmReception}
                disabled={isLoading}
                className="btn-primary bg-[#27AE60] hover:bg-green-600 mb-4"
              >
                {isLoading ? 'Confirmando...' : 'Confirmar que lo he recibido'}
              </button>

              <button
                onClick={() => setShowConfirm(true)}
                className="btn-secondary border-[#EB5757] text-[#FF8077] hover:bg-red-50"
              >
                Hay un problema
              </button>

              {showConfirm && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-[#FF8077] mb-3">
                    Si el importe no es correcto, contacta con tu pareja para resolverlo.
                  </p>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-[#FF8077] underline text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="mt-4 text-center text-[#FF8077] text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista: Semana liquidada
  if (summary.isSettled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card text-center max-w-sm w-full">
          <p className="text-6xl mb-6">🎉</p>
          <h2 className="text-2xl font-bold text-[#5FE39A] mb-4">
            ¡Semana cerrada!
          </h2>
          <p className="text-[#8E887B] mb-6">
            Estáis al día con los gastos
          </p>

          <div className="bg-[#211F18] rounded-xl p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-[#8E887B]">Tú has gastado:</span>
              <span className="font-bold text-[#F4F1E8]">
                {formatCurrency(summary.userTotal)} €
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E887B]">Tu pareja:</span>
              <span className="font-bold text-[#F4F1E8]">
                {formatCurrency(summary.partnerTotal)} €
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/resumen')}
            className="btn-primary"
          >
            Ver resumen
          </button>
        </div>
      </div>
    );
  }

  // Vista: No hay gastos esta semana
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="card text-center max-w-sm w-full">
        <p className="text-4xl mb-4">📝</p>
        <h2 className="text-xl font-bold text-[#F4F1E8] mb-2">
          Sin gastos esta semana
        </h2>
        <p className="text-[#8E887B] mb-6">
          Aún no hay gastos para liquidar
        </p>
        <button
          onClick={() => router.push('/')}
          className="btn-primary"
        >
          Añadir gasto
        </button>
      </div>
    </div>
  );
}
