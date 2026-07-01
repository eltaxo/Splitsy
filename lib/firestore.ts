import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Query,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserDocument, ExpenseDocument, SettlementDocument } from './types';

// Helper para obtener el lunes de una semana
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea 0
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Generar código de 6 letras
export function generatePartnerCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusiones
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// USERS
export function getUserRef(userId: string) {
  return doc(db, 'users', userId);
}

export async function getUser(userId: string): Promise<UserDocument | null> {
  const docRef = getUserRef(userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserDocument;
  }
  return null;
}

export async function createUser(
  userId: string,
  email: string,
  name: string
): Promise<void> {
  const userRef = getUserRef(userId);
  await setDoc(userRef, {
    email,
    name,
    partnerId: null,
    partnerCode: null,
    createdAt: new Date(),
  });
}

export async function updateUserPartner(
  userId: string,
  partnerId: string
): Promise<void> {
  const userRef = getUserRef(userId);
  await updateDoc(userRef, { partnerId });
}

export async function updateUserPartnerCode(
  userId: string,
  partnerCode: string
): Promise<void> {
  const userRef = getUserRef(userId);
  // Usar setDoc con merge para crear el documento si no existe
  await setDoc(userRef, { partnerCode }, { merge: true });
}

export async function findUserByPartnerCode(
  code: string
): Promise<UserDocument | null> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('partnerCode', '==', code));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return doc.data() as UserDocument;
  }
  return null;
}

// EXPENSES
export function getExpensesRef() {
  return collection(db, 'expenses');
}

export function getExpensesQuery(
  userIds: string[],
  weekStart: Date
): Query {
  const expensesRef = getExpensesRef();
  return query(
    expensesRef,
    where('paidBy', 'in', userIds),
    where('weekStart', '==', weekStart),
    orderBy('createdAt', 'desc')
  );
}

export async function createExpense(
  expenseData: Omit<ExpenseDocument, 'createdAt'> & { createdAt?: Date }
): Promise<void> {
  const expensesRef = getExpensesRef();
  const newExpenseRef = doc(expensesRef);

  await setDoc(newExpenseRef, {
    ...expenseData,
    createdAt: expenseData.createdAt || new Date(),
  });
}

// SETTLEMENTS
export function getSettlementsRef() {
  return collection(db, 'settlements');
}

export function getSettlementsQuery(
  userIds: string[],
  weekStart: Date
): Query {
  const settlementsRef = getSettlementsRef();
  return query(
    settlementsRef,
    where('weekStart', '==', weekStart),
    where('payerId', 'in', userIds)
  );
}

export async function getPendingSettlement(
  weekStart: Date,
  userIds: string[]
): Promise<SettlementDocument | null> {
  const settlementsRef = getSettlementsRef();
  const q = query(
    settlementsRef,
    where('weekStart', '==', weekStart),
    where('status', '==', 'pending')
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data() as SettlementDocument;
    // Verificar que involucra a los usuarios
    if (userIds.includes(data.payerId) || userIds.includes(data.receiverId)) {
      return data;
    }
  }
  return null;
}

export async function createSettlement(
  settlementData: Omit<SettlementDocument, 'sentAt' | 'confirmedAt'> & { sentAt?: Date; confirmedAt?: Date | null }
): Promise<void> {
  const settlementsRef = getSettlementsRef();
  const newSettlementRef = doc(settlementsRef);

  // Convertir fechas a Timestamps
  const { weekStart, sentAt, confirmedAt, ...rest } = settlementData;

  const weekStartTimestamp = weekStart instanceof Date
    ? Timestamp.fromDate(weekStart)
    : weekStart;

  const sentAtTimestamp = Timestamp.fromDate(sentAt || new Date());

  let confirmedAtTimestamp: Timestamp | null = null;
  if (confirmedAt) {
    confirmedAtTimestamp = Timestamp.fromDate(
      confirmedAt instanceof Date ? confirmedAt : (confirmedAt as any).toDate()
    );
  }

  await setDoc(newSettlementRef, {
    ...rest,
    weekStart: weekStartTimestamp,
    sentAt: sentAtTimestamp,
    confirmedAt: confirmedAtTimestamp,
  });
}

export async function confirmSettlement(
  settlementId: string
): Promise<void> {
  const settlementRef = doc(db, 'settlements', settlementId);
  await updateDoc(settlementRef, {
    status: 'confirmed',
    confirmedAt: new Date(),
  });
}

// Helper para obtener ID de documento
export function getDocumentId(collectionName: string): string {
  const colRef = collection(db, collectionName);
  const docRef = doc(colRef);
  return docRef.id;
}
