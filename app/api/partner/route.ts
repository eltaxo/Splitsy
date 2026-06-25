import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin no está configurado correctamente' },
        { status: 500 }
      );
    }

    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Código y userId requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario con el código usando Admin SDK
    const usersSnapshot = await adminDb
      .collection('users')
      .where('partnerCode', '==', code)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'Código no encontrado' },
        { status: 404 }
      );
    }

    const partnerDoc = usersSnapshot.docs[0];
    const partnerData = partnerDoc.data();
    const partnerId = partnerDoc.id;

    // Validaciones
    if (partnerId === userId) {
      return NextResponse.json(
        { error: 'No puedes usar tu propio código' },
        { status: 400 }
      );
    }

    if (partnerData.partnerId) {
      return NextResponse.json(
        { error: 'Este código ya está vinculado a otra pareja' },
        { status: 400 }
      );
    }

    // Verificar y crear documento del usuario si no existe
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // Obtener datos del usuario desde Firebase Auth
      try {
        const userRecord = await adminAuth!.getUser(userId);
        await adminDb.collection('users').doc(userId).set({
          email: userRecord.email || '',
          name: userRecord.displayName || 'Usuario',
          partnerId: null,
          partnerCode: null,
          createdAt: new Date(),
        });
      } catch (authError) {
        console.error('Error getting user from Auth:', authError);
        return NextResponse.json(
          { error: 'Error al obtener datos del usuario. Por favor, cierra sesión y vuelve a entrar.' },
          { status: 500 }
        );
      }
    }

    await adminDb.collection('users').doc(userId).update({
      partnerId: partnerId
    });

    await adminDb.collection('users').doc(partnerId).update({
      partnerId: userId
    });

    return NextResponse.json({
      success: true,
      partnerId,
      partnerName: partnerData.name,
    });
  } catch (error) {
    console.error('Error al vincular pareja:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    // Proporcionar más información sobre el error
    let errorMessage = 'Error al vincular pareja';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
