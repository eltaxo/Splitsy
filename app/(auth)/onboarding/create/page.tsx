'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generatePartnerCode, updateUserPartnerCode } from '@/lib/firestore';

export default function CreatePartnerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [partnerCode, setPartnerCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.partnerCode) {
      setPartnerCode(user.partnerCode);
    }
  }, [user]);

  const handleCreatePartner = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Generar código único
      const code = generatePartnerCode();

      // Guardar en Firestore
      await updateUserPartnerCode(user.uid, code);

      setPartnerCode(code);
    } catch (err) {
      console.error('Error al crear pareja:', err);
      setError('Error al crear la cuenta compartida. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!partnerCode) return;

    try {
      await navigator.clipboard.writeText(partnerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleShare = async () => {
    if (!partnerCode) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a Splitsy',
          text: `¡Únete a nuestra cuenta compartida en Splitsy! Tu código es: ${partnerCode}`,
        });
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      handleCopyCode();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8E887B]">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#15140F]">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#F4F1E8] mb-4 font-display">
          Crea vuestra cuenta compartida
        </h1>
        <p className="text-lg text-[#8E887B]">
          Genera un código para compartir con tu pareja
        </p>
      </div>

      {!partnerCode ? (
        <>
          <button
            onClick={handleCreatePartner}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Generando código...' : 'Crear y obtener código'}
          </button>

          {error && (
            <div className="mt-6 text-center text-[#FF8077] text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/onboarding"
              className="text-[#8E887B] hover:text-[#F4F1E8] underline"
            >
              Volver
            </Link>
          </div>
        </>
      ) : (
        <div className="w-full max-w-sm">
          <div className="card mb-6 text-center">
            <p className="text-[#8E887B] mb-6">
              Comparte este código con tu pareja
            </p>

            <div className="bg-[#211F18] rounded-2xl p-8 mb-6 border-2 border-[#302D24]">
              <div className="text-6xl font-bold text-[#C8FF4D] tracking-wider mb-4 font-display">
                {partnerCode}
              </div>
              <p className="text-sm text-[#8E887B]">
                Código de 6 letras
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopyCode}
                className="btn-secondary"
              >
                {copied ? '¡Copiado!' : 'Copiar código'}
              </button>

              <button
                onClick={handleShare}
                className="btn-primary"
              >
                Compartir código
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-[#8E887B]">
            <p className="mb-2">Tu pareja deberá introducir este código para unirse.</p>
            <p>Espera a que se una para empezar a usar la app.</p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/onboarding"
              className="text-[#8E887B] hover:text-[#F4F1E8] underline"
            >
              Volver
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}