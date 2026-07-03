'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyChartProps {
  history: Array<{
    month: string;
    userTotal: number;
    partnerTotal: number;
  }>;
  userName: string;
  partnerName: string;
}

export default function MonthlyChart({ history, userName, partnerName }: MonthlyChartProps) {
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'short' });
  };

  const data = history.map(h => ({
    month: formatMonth(h.month),
    [userName]: h.userTotal,
    [partnerName]: h.partnerTotal,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="#302D24" />
          <XAxis
            dataKey="month"
            stroke="#8E887B"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#8E887B"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#211F18',
              border: '1px solid #302D24',
              borderRadius: '8px',
              color: '#F4F1E8'
            }}
            formatter={(value: any) => [`${typeof value === 'number' ? value.toFixed(2) : '0'} €`, '']}
          />
          <Bar dataKey={userName} fill="#C8FF4D" radius={[4, 4, 0, 0]} />
          <Bar dataKey={partnerName} fill="#2A2820" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
