'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useRef } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function PerfilPage() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      // Subir imagen a Firebase Storage
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);

      // Actualizar documento del usuario
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: downloadURL });

      setSuccessMessage('¡Foto actualizada!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Recargar la página para ver la nueva foto
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Error al actualizar la foto. Por favor, inténtalo de nuevo.');
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

  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';
  const initials = displayName.charAt(0).toUpperCase();
  const photoURL = (user as any).photoURL || null;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 pb-32">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#F4F1E8] mb-2 font-display">
          Perfil
        </h1>
        <p className="text-[#8E887B]">
          Tu cuenta
        </p>
      </div>

      {/* Foto de perfil */}
      <div className="mb-8">
        <div className="relative">
          {photoURL ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#C8FF4D]">
              <img
                src={photoURL}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#C8FF4D] flex items-center justify-center text-[#15140F] font-bold text-5xl border-4 border-[#C8FF4D]">
              {initials}
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute bottom-0 right-0 w-10 h-10 bg-[#211F18] text-[#F4F1E8] rounded-full flex items-center justify-center hover:bg-[#302D24] transition-colors disabled:opacity-50 border-2 border-[#15140F]"
          >
            {isLoading ? '⏳' : '📷'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {successMessage && (
          <div className="text-center mt-3">
            <p className="text-sm text-[#5FE39A] font-medium">
              {successMessage}
            </p>
          </div>
        )}
      </div>

      {/* Información del usuario */}
      <div className="w-full max-w-sm space-y-4">
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#F4F1E8] mb-1 font-display">
              {displayName}
            </h2>
            <p className="text-[#8E887B]">
              {user.email}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#302D24]">
              <span className="text-[#8E887B]">Usuario</span>
              <span className="font-medium text-[#F4F1E8]">
                {displayName}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-[#302D24]">
              <span className="text-[#8E887B]">Email</span>
              <span className="font-medium text-[#F4F1E8] text-sm">
                {user.email}
              </span>
            </div>

            {user.partnerId && (
              <div className="flex justify-between items-center py-2">
                <span className="text-[#8E887B]">Estado</span>
                <span className="font-medium text-[#5FE39A]">
                  Vinculado ✓
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Información de la app */}
        <div className="card bg-[#211F18]">
          <div className="text-center">
            <p className="text-sm text-[#8E887B]">
              Splitsy v1.0.0
            </p>
            <p className="text-xs text-[#8E887B] mt-1">
              Las cuentas claras, el amor intacto 💕
            </p>
          </div>
        </div>

        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          className="btn-secondary w-full border-[#EB5757] text-[#FF8077] hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}