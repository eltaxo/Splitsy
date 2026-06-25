'use client';
import { formatCurrency, formatTime, formatDate, conceptEmoji } from '@/lib/utils';

interface Expense {
  id: string;
  paidBy: string;
  amount: number;
  concept: string;
  createdAt: Date;
}

interface ExpenseListProps {
  expenses: Expense[];
  currentUserId: string;
  currentUserName: string;
  partnerName: string;
}

export default function ExpenseList({
  expenses,
  currentUserId,
  currentUserName,
  partnerName,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 rounded-[30px] bg-[#211F18] border border-[#302D24] flex items-center justify-center mx-auto text-4xl">
          🧾
        </div>
        <p className="text-xl font-bold text-[#F4F1E8] mt-5 font-display">
          Aún no hay gastos
        </p>
        <p className="text-sm font-semibold text-[#8E887B] mt-2">
          Esta semana empieza limpia. ¡Empezad a apuntar! 🙌
        </p>
      </div>
    );
  }

  const grouped = expenses.reduce((g, e) => {
    const key = formatDate(new Date(e.createdAt));
    (g[key] ||= []).push(e);
    return g;
  }, {} as Record<string, Expense[]>);

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([dateKey, dayExpenses]) => (
        <div key={dateKey}>
          <h3 className="text-sm font-bold text-[#8E887B] capitalize mb-3">
            {dateKey}
          </h3>
          <div className="space-y-2">
            {dayExpenses.map((expense) => {
              const payerName =
                expense.paidBy === currentUserId
                  ? currentUserName
                  : partnerName;
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 bg-[#211F18] border border-[#302D24] rounded-2xl px-3.5 py-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#2A2820] flex items-center justify-center text-xl shrink-0">
                    {conceptEmoji(expense.concept)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#F4F1E8] text-[14.5px] leading-tight truncate">
                      {expense.concept}
                    </p>
                    <p className="text-xs text-[#8E887B] mt-0.5 truncate">
                      {payerName} · {formatTime(expense.createdAt)}
                    </p>
                  </div>
                  <p className="text-base font-bold text-[#F4F1E8] font-display whitespace-nowrap">
                    {formatCurrency(expense.amount)} €
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}