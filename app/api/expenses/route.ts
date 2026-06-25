import { NextRequest, NextResponse } from 'next/server';
import { getDocs, query, where } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getWeekStart } from '@/lib/firestore';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
  try {
    const { paidBy, amount, concept, weekStart } = await request.json();

    if (!paidBy || !amount || !concept) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Validar que el usuario existe
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('__name__', '==', paidBy));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Crear gasto
    const expensesRef = collection(db, 'expenses');
    const weekStartDate = weekStart ? new Date(weekStart) : getWeekStart();

    const docRef = await addDoc(expensesRef, {
      paidBy,
      amount: parseFloat(amount),
      concept: concept.trim(),
      weekStart: weekStartDate,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error al crear gasto:', error);
    return NextResponse.json(
      { error: 'Error al crear gasto' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const partnerId = searchParams.get('partnerId');
    const weekStart = searchParams.get('weekStart');

    if (!userId || !partnerId) {
      return NextResponse.json(
        { error: 'userId y partnerId requeridos' },
        { status: 400 }
      );
    }

    // Obtener gastos de la semana
    const expensesRef = collection(db, 'expenses');
    const weekStartDate = weekStart ? new Date(weekStart) : getWeekStart();

    const q = query(
      expensesRef,
      where('paidBy', 'in', [userId, partnerId]),
      where('weekStart', '==', weekStartDate)
    );

    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      expenses,
    });
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    return NextResponse.json(
      { error: 'Error al obtener gastos' },
      { status: 500 }
    );
  }
}
