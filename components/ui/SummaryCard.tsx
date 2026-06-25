'use client';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardProps {
  userTotal: number;
  partnerTotal: number;
  debt: number;
  debtor: string | null;
  creditor: string | null;
  isSettled: boolean;
  userName: string;
}

export default function SummaryCard({
  userTotal,
  partnerTotal,
  debt,
  debtor,
  creditor,
  isSettled,
  userName,
}: SummaryCardProps) {
  return (
    <div className="space-y-3">
      {/* Tarjetas de totales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#211F18] border border-[#302D24] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#C8FF4D] text-[#15140F] flex items-center justify-center font-bold text-sm font-display">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-[#F4F1E8]">{userName}</span>
          </div>
          <p className="text-2xl font-extrabold text-[#F4F1E8] font-display">{formatCurrency(userTotal)} €</p>
        </div>

        <div className="bg-[#211F18] border border-[#302D24] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#2A2820] text-[#F4F1E8] flex items-center justify-center font-bold text-sm font-display">
              {(creditor ?? 'Pareja').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-[#F4F1E8]">{creditor ?? 'Pareja'}</span>
          </div>
          <p className="text-2xl font-extrabold text-[#F4F1E8] font-display">{formatCurrency(partnerTotal)} €</p>
        </div>
      </div>

      {/* Resultado — panel oscuro de énfasis */}
      {isSettled ? (
        <div className="bg-[#16251B] border border-[#234430] rounded-3xl p-8 text-center">
          <p className="text-5xl mb-2">🎉</p>
          <p className="text-2xl font-extrabold text-[#5FE39A] font-display">¡Estáis al día!</p>
          <p className="text-sm font-semibold text-[#86C9A2] mt-1.5">Ninguno debe nada esta semana</p>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-[#0D0C0A] border border-[#2A2820] rounded-3xl p-6 text-center">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ background: 'rgba(200,255,77,.13)' }} />
          <p className="relative text-xs font-semibold text-[#B8B2A4]">Cuentas de la semana</p>
          <p className="relative text-lg font-bold text-[#F4F1E8] mt-2 leading-snug font-display">
            {debtor === userName ? 'Tú le debes' : `${debtor} le debe`}
            <br />
            <span className="text-[40px] font-extrabold text-[#C8FF4D] tracking-tight">{formatCurrency(debt)} €</span>
            <br />
            a {debtor === userName ? creditor : userName}
          </p>
        </div>
      )}
    </div>
  );
}