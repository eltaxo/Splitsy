'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function OnboardingPage() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8E887B]">Cargando...</div>
      </div>
    );
  }

  if (user.partnerId) {
    // Si ya tiene pareja, mostrar mensaje y opción de ir a home
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#15140F]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F4F1E8] mb-4 font-display">
            ¡Ya tienes una cuenta configurada!
          </h1>
          <p className="text-[#8E887B] mb-6">
            Tu pareja ya está vinculada.
          </p>
          <Link
            href="/"
            className="btn-primary"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#15140F]">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#C8FF4D] mb-4 font-display">
          ¡Bienvenido a Splitsy!
        </h1>
        <p className="text-lg text-[#8E887B]">
          Configura tu cuenta compartida
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Link
          href="/onboarding/create"
          className="btn-primary block text-center"
        >
          Crear cuenta compartida
        </Link>

        <Link
          href="/onboarding/join"
          className="btn-secondary block text-center"
        >
          Unirme con un código
        </Link>
      </div>

      <div className="mt-12 text-center space-y-4">
        <button
          onClick={handleLogout}
          className="text-[#8E887B] hover:text-[#F4F1E8] underline"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}