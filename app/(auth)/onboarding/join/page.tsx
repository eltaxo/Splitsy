'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  findUserByPartnerCode,
  updateUserPartner,
} from '@/lib/firestore';

export default function JoinPartnerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Si ya tiene pareja, redirigir solo una vez
    if (user.partnerId && !success) {
      window.location.replace('/');
    }
  }, [user, success]);

  const handleCodeChange = (value: string) => {
    // Solo letras y números, máximo 6 caracteres
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(cleaned);
    setError(null);
  };

  const handleJoin = async () => {
    if (!user || code.length !== 6) {
      setError('Introduce un código de 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Usar API para vincular pareja
      const response = await fetch('/api/partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al unirse a la pareja');
        setIsLoading(false);
        return;
      }

      // Éxito - forzar recarga de página para que useAuth obtenga los datos actualizados
      window.location.replace('/');
    } catch (err) {
      console.error('Error al unirse a pareja:', err);
      setError('Error al unirse. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8E887B]">Cargando...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#15140F]">
        <div className="text-center">
          <div className="text-6xl mb-6">✓</div>
          <h2 className="text-2xl font-bold text-[#5FE39A] mb-4 font-display">
            ¡Pareja vinculada!
          </h2>
          <p className="text-[#8E887B]">
            Redirigiendo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#15140F]">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#F4F1E8] mb-4 font-display">
          Únete a una cuenta compartida
        </h1>
        <p className="text-lg text-[#8E887B]">
          Introduce el código que te dio tu pareja
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="card mb-6">
          <div className="bg-[#211F18] rounded-2xl p-6 mb-6 border-2 border-[#302D24]">
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="ABC123"
              className="w-full text-center text-5xl font-bold bg-transparent border-none outline-none text-[#C8FF4D] tracking-widest uppercase placeholder-[#6B6759]"
              maxLength={6}
              autoFocus
            />
            <p className="text-center text-sm text-[#8E887B] mt-2">
              Código de 6 caracteres
            </p>
          </div>

          <button
            onClick={handleJoin}
            disabled={isLoading || code.length !== 6}
            className="btn-primary"
          >
            {isLoading ? 'Verificando...' : 'Unirme'}
          </button>

          {error && (
            <div className="mt-4 text-center text-[#FF8077] text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/onboarding"
            className="text-[#8E887B] hover:text-[#F4F1E8] underline"
          >
            Volver
          </Link>
        </div>
      </div>
    </div>
  );
}