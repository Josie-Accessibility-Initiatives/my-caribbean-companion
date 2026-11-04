'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtTick } from '@/lib/format'

const TEAL = 'var(--color-primary)'

/** Horizontal bar chart of each cost category in USD. */
export default function CostBreakdownChart({
  data,
}: {
  data: { name: string; amount: number }[]
}) {
  return (
    <div className="ce-chart">
      <p className="ce-chart-title">Cost breakdown by category</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 48, bottom: 4, left: 8 }}>
          <XAxis
            type="number"
            fontSize={11}
            tick={{ fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => fmtTick(v, '$')}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={118}
            fontSize={11.5}
            tick={{ fill: '#4b5563' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`$${Math.round(Number(value)).toLocaleString()} USD`, 'Amount']}
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            cursor={{ fill: '#f3f4f6' }}
          />
          <Bar dataKey="amount" fill={TEAL} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
