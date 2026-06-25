// Tipos principales de la aplicación

export interface User {
  id: string;
  email: string;
  name: string;
  partnerId: string | null;
  partnerCode: string | null;
  createdAt: Date;
}

export interface Expense {
  id: string;
  paidBy: string;
  amount: number;
  concept: string;
  weekStart: Date;
  createdAt: Date;
}

export interface Settlement {
  id: string;
  weekStart: Date;
  payerId: string;
  receiverId: string;
  amount: number;
  status: 'pending' | 'confirmed';
  sentAt: Date;
  confirmedAt: Date | null;
}

// Tipos para UI
export interface WeekSummary {
  weekStart: Date;
  userTotal: number;
  partnerTotal: number;
  debt: number;
  debtor: string | null;
  creditor: string | null;
  isSettled: boolean;
}

export interface ExpenseWithUser extends Expense {
  userName: string;
  userEmail: string;
}

// Firestore document types
export interface UserDocument {
  email: string;
  name: string;
  partnerId: string | null;
  partnerCode: string | null;
  photoURL?: string;
  createdAt: FirebaseFirestore.Timestamp | Date;
}

export interface ExpenseDocument {
  paidBy: string;
  amount: number;
  concept: string;
  weekStart: FirebaseFirestore.Timestamp | Date;
  createdAt: FirebaseFirestore.Timestamp | Date;
}

export interface SettlementDocument {
  weekStart: FirebaseFirestore.Timestamp | Date;
  payerId: string;
  receiverId: string;
  amount: number;
  status: 'pending' | 'confirmed';
  sentAt: FirebaseFirestore.Timestamp | Date;
  confirmedAt: FirebaseFirestore.Timestamp | Date | null;
}
