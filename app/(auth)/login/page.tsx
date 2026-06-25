'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir solo una vez si está autenticado
  useEffect(() => {
    if (loading) return; // Esperar a que cargue el estado de usuario

    if (user) {
      console.log('Usuario autenticado en login, redirigiendo...');
      if (!user.partnerId) {
        console.log('Redirigiendo a /onboarding');
        window.location.replace('/onboarding');
      } else {
        console.log('Redirigiendo a /');
        window.location.replace('/');
      }
    }
  }, [user, loading]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Iniciando login con Google...');
      await signInWithGoogle();
      console.log('Login exitoso!');
      // La redirección se maneja por el useEffect
      setIsLoading(false);
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8E887B]">Cargando...</div>
      </div>
    );
  }

  // Si está autenticado, no mostrar nada (se redirige por useEffect)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8E887B]">Redirigiendo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#15140F]">
      {/* Logo y branding */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-[#C8FF4D] mb-4 font-display">
          Splitsy
        </h1>
        <p className="text-xl text-[#8E887B]">
          Las cuentas claras, el amor intacto
        </p>
      </div>

      {/* Botón de Google */}
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full max-w-sm bg-[#211F18] border-2 border-[#302D24] rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:bg-[#2A2820] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-[#F4F1E8] font-semibold text-lg">
          {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
        </span>
      </button>

      {/* Error */}
      {error && (
        <div className="mt-6 text-center text-[#FF8077] text-sm">
          {error}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-12 text-center text-[#8E887B] text-sm">
        <p>App exclusiva para parejas</p>
        <p className="mt-1">Registra gastos compartidos de forma rápida y sencilla</p>
      </div>
    </div>
  );
}