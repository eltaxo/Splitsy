'use client';

import { useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getUser } from '@/lib/firestore';
import type { UserDocument } from '@/lib/types';

export interface AuthUser extends Omit<FirebaseUser, 'photoURL'> {
  partnerId: string | null;
  partnerCode: string | null;
  photoURL?: string | null;
  dbUser?: UserDocument;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener datos adicionales de Firestore
          const dbUser = await getUser(firebaseUser.uid);

          if (!dbUser) {
            // Crear usuario en Firestore si no existe
            const { createUser } = await import('@/lib/firestore');
            await createUser(
              firebaseUser.uid,
              firebaseUser.email || '',
              firebaseUser.displayName || 'Usuario'
            );
          }

          setUser({
            ...firebaseUser,
            partnerId: dbUser?.partnerId || null,
            partnerCode: dbUser?.partnerCode || null,
            photoURL: dbUser?.photoURL || firebaseUser.photoURL || null,
            dbUser: dbUser || undefined,
          } as any);
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          // Establecer usuario mínimo aunque falle Firestore
          setUser({
            ...firebaseUser,
            partnerId: null,
            partnerCode: null,
            photoURL: firebaseUser.photoURL || null,
          } as any);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('1. Iniciando signInWithPopup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('2. Popup exitoso, onAuthStateChanged manejará el estado');
      // onAuthStateChanged detectará el cambio y actualizará el estado automáticamente
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };
}
