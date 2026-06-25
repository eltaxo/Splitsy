'use client';

import Link from 'next/link';

interface FridayBannerProps {
  debtorName?: string;
  amount?: number;
}

export default function FridayBanner({
  debtorName,
  amount,
}: FridayBannerProps) {
  if (!debtorName || !amount) {
    return null;
  }

  const formattedAmount = amount.toFixed(2);

  return (
    <Link
      href="/liquidar"
      className="block flex items-center gap-3 bg-[#211F18] border border-[#3A4327] rounded-2xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95"
    >
      <div className="text-2xl">💸</div>
      <div className="flex-1 leading-tight">
        <p className="text-white text-sm font-bold mb-0.5">
          Es viernes
        </p>
        <p className="text-white text-xs text-[#B8B2A4]">
          {debtorName} te debe <span className="text-[#C8FF4D] font-bold">{formattedAmount}€</span>
        </p>
      </div>
      <div className="bg-[#C8FF4D] text-[#15140F] font-bold text-xs px-3 py-2 rounded-xl whitespace-nowrap">
        Liquidar →
      </div>
    </Link>
  );
}
