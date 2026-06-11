'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface ProviderStatus {
  provider: string
  name: string
  model: string
  isOnline: boolean
  latencyMs: number
  successRate: number
  errorRate: number
  lastChecked: string
  totalChecks: number
}

interface HealthData {
  checked_at: string
  providers: ProviderStatus[]
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/internal/health')
      const data = await res.json()
      setHealth(data)
      setLastRefresh(new Date())
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 10_000)
    return () => clearInterval(interval)
  }, [fetchHealth])

  const allOnline = health?.providers.every((p) => p.isOnline)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)', padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 800 }}>A</div>
          <span style={{ fontWeight: 700 }}>Aeferalow API</span>
        </Link>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <Link href="/docs" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Docs</Link>
          <Link href="/chat" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Playground</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>System Status</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className={allOnline ? 'dot-online' : 'dot-offline'} />
            <span style={{ fontWeight: 600, color: allOnline ? 'var(--green)' : 'var(--red)' }}>
              {loading ? 'Checking...' : allOnline ? 'All Systems Operational' : 'Some Systems Degraded'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Auto-refreshing every 10 seconds · Last: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        {/* Provider Cards */}
        <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
          {loading ? (
            Array(3).fill(null).map((_, i) => (
              <div key={i} className="glass" style={{ padding: '24px', opacity: 0.5 }}>
                <div style={{ height: '20px', background: 'var(--border)', borderRadius: '4px', width: '40%', marginBottom: '12px' }} />
                <div style={{ height: '14px', background: 'var(--border)', borderRadius: '4px', width: '60%' }} />
              </div>
            ))
          ) : health?.providers.map((p) => (
            <div key={p.provider} className="glass animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className={p.isOnline ? 'dot-online' : 'dot-offline'} />
                    <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{p.name}</h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Model: {p.model}</p>
                </div>
                <span className={`badge ${p.isOnline ? 'badge-green' : 'badge-red'}`}>
                  {p.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Latency', value: `${p.latencyMs}ms`, good: p.latencyMs < 2000 },
                  { label: 'Success Rate', value: `${p.successRate}%`, good: p.successRate >= 90 },
                  { label: 'Error Rate', value: `${p.errorRate}%`, good: p.errorRate < 10 },
                  { label: 'Total Checks', value: p.totalChecks.toString(), good: true },
                ].map((stat) => (
                  <div key={stat.label} className="glass-2" style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: stat.good ? 'var(--green)' : 'var(--red)' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {p.lastChecked && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '12px' }}>
                  Last checked: {new Date(p.lastChecked).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Manual refresh */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={fetchHealth} className="btn-secondary" style={{ padding: '10px 24px' }}>
            ↺ Refresh Now
          </button>
        </div>
      </div>
    </div>
  )
}
