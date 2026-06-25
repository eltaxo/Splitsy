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
        // Obtener datos adicionales de Firestore
        const dbUser = await getUser(firebaseUser.uid);

        setUser({
          ...firebaseUser,
          partnerId: dbUser?.partnerId || null,
          partnerCode: dbUser?.partnerCode || null,
          photoURL: dbUser?.photoURL || firebaseUser.photoURL || null,
          dbUser: dbUser || undefined,
        } as any);
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
      console.log('2. Popup exitoso, obteniendo usuario...');
      const firebaseUser = result.user;
      console.log('3. Usuario obtenido:', firebaseUser.uid, firebaseUser.email);

      // Establecer el usuario inmediatamente SIN esperar a Firestore
      console.log('4. Estableciendo usuario en estado...');
      setUser({
        ...firebaseUser,
        partnerId: null,
        partnerCode: null,
      });
      console.log('5. Usuario establecido correctamente');

      // Intentar acceder a Firestore de forma asíncrona (no bloquear)
      setTimeout(async () => {
        try {
          console.log('6. Intentando acceder a Firestore...');
          const dbUser = await getUser(firebaseUser.uid);
          console.log('7. Usuario de Firestore obtenido:', dbUser);

          if (!dbUser) {
            // Crear usuario en Firestore
            const { createUser } = await import('@/lib/firestore');
            await createUser(
              firebaseUser.uid,
              firebaseUser.email || '',
              firebaseUser.displayName || 'Usuario'
            );
          } else {
            // Actualizar con datos de Firestore
            if (user) {
              setUser({
                ...user,
                partnerId: dbUser.partnerId,
                partnerCode: dbUser.partnerCode,
                dbUser,
              });
            }
          }
        } catch (firestoreError) {
          console.error('Error accediendo a Firestore:', firestoreError);
          // No bloquear el login por errores de Firestore
        }
      }, 100);

      return firebaseUser;
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
