/**
 * Dashboard.jsx - Analytics dashboard with Recharts
 */
import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

const COLORS = ['#3dffa0', '#f5c842', '#5eb8ff', '#ff5e5e', '#c084fc', '#fb923c']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-2)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem'
    }}>
      {label && <div style={{ color: 'var(--text-2)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--primary)' }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export function BadgeChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }))
  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 2 }}>
          Badge Distribution
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Gamification levels</div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
            dataKey="value" nameKey="name" paddingAngle={3}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-2)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DropoutRiskChart({ data }) {
  const chartData = [
    { name: 'Low', value: data?.low || 0, fill: '#3dffa0' },
    { name: 'Medium', value: data?.medium || 0, fill: '#f5c842' },
    { name: 'High', value: data?.high || 0, fill: '#ff5e5e' },
  ]
  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 2 }}>
          Dropout Risk Analysis
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>AI-predicted retention risk</div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barSize={40}>
          <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopSkillsChart({ data }) {
  const chartData = (data || []).slice(0, 8).map(s => ({ name: s.skill, count: s.count }))
  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 2 }}>
          Top Skills in Community
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Most common extracted skills</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" barSize={16}>
          <XAxis type="number" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={90}
            tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TaskCategoryChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }))
  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 2 }}>
          Task Categories
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Available task breakdown</div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={75}
            dataKey="value" nameKey="name" paddingAngle={2}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-2)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
