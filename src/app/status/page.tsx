'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { RefreshCwIcon, ArrowLeftIcon, ActivityIcon, TimerIcon, CheckCircle2Icon, XCircleIcon, BarChart3Icon } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'

interface ProviderStatus {
  provider: string; name: string; model: string; isOnline: boolean;
  latencyMs: number; successRate: number; errorRate: number;
  lastChecked: string; totalChecks: number;
}

interface HealthData {
  checked_at: string
  providers: ProviderStatus[]
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const fetchHealth = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/internal/health')
      const data = await res.json()
      setHealth(data)
      setLastRefresh(new Date())
    } catch { /* silent */ } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    const iv = setInterval(fetchHealth, 10_000)
    return () => clearInterval(iv)
  }, [fetchHealth])

  const allOnline = health?.providers.every(p => p.isOnline) ?? false
  const anyOnline = health?.providers.some(p => p.isOnline) ?? false

  const overallStatus = loading ? 'checking'
    : allOnline ? 'all-ok'
    : anyOnline ? 'partial'
    : 'down'

  const overallConfig = {
    'checking': { label: 'Checking...', color: 'var(--nb-gray)', bg: 'var(--nb-gray-light)' },
    'all-ok':   { label: 'All Systems Operational', color: 'var(--nb-green-dark)', bg: '#EDFAF5' },
    'partial':  { label: 'Partial Outage', color: 'var(--nb-orange)', bg: '#FFF3EE' },
    'down':     { label: 'Major Outage', color: 'var(--nb-red)', bg: '#FFF0F2' },
  }[overallStatus]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nb-cream)' }}>
      {/* Navbar */}
      <nav className="nb-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          }}>
            <div style={{
              width: 36, height: 36, background: 'var(--nb-yellow)',
              border: '2px solid var(--nb-yellow-dark)', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--nb-black)',
            }}>A</div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: 'var(--nb-cream)' }}>
              Aeferalow API
            </span>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/docs" className="nb-btn nb-btn-secondary nb-btn-sm"
            style={{ background: '#2A2A2A', color: '#9CA3AF', borderColor: '#3A3A3A' }}>Docs</Link>
          <Link href="/playground" className="nb-btn nb-btn-primary nb-btn-sm">Playground</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="nb-tag" style={{ marginBottom: 16, display: 'inline-block' }}>Status</span>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em',
            marginBottom: 16,
          }}>System Status</h1>

          {/* Overall status banner */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: overallConfig.bg,
            border: `3px solid var(--nb-black)`,
            borderRadius: 4, padding: '14px 28px',
            boxShadow: 'var(--nb-shadow)',
            marginBottom: 16,
          }}>
            <div style={{
              width: 14, height: 14,
              background: overallConfig.color,
              borderRadius: '50%',
              border: '2px solid var(--nb-black)',
              animation: overallStatus === 'all-ok' ? 'nb-pulse 2s ease infinite' : undefined,
            }} />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1rem', fontWeight: 800,
              color: overallConfig.color,
            }}>{overallConfig.label}</span>
          </div>

          <p style={{ color: 'var(--nb-gray)', fontSize: '0.875rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            Auto-refreshing every 10s · Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        {/* Provider Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="nb-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div className="nb-skeleton" style={{ height: 20, width: '30%', borderRadius: 2 }} />
                  <div className="nb-skeleton" style={{ height: 20, width: '15%', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[1,2,3,4].map(j => (
                    <div key={j} className="nb-skeleton" style={{ height: 60, borderRadius: 4 }} />
                  ))}
                </div>
              </div>
            ))
          ) : health?.providers.map((p, i) => (
            <div
              key={p.provider}
              className="nb-card animate-fade-in"
              style={{
                padding: 24,
                borderLeft: `6px solid ${p.isOnline ? 'var(--nb-green)' : 'var(--nb-red)'}`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 20,
              }}>
                <div>
                  <h3 style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '1.1rem', fontWeight: 800, marginBottom: 4,
                  }}>{p.name}</h3>
                  <p style={{ color: 'var(--nb-gray)', fontSize: '0.825rem', fontFamily: 'Space Grotesk, sans-serif' }}>
                    Model: <code style={{ fontFamily: 'JetBrains Mono, monospace', background: '#F5F0E8', padding: '1px 6px', borderRadius: 2 }}>{p.model}</code>
                  </p>
                </div>
                <StatusBadge status={p.isOnline ? 'online' : 'offline'} />
              </div>

              <div className="nb-grid-status">
                {[
                  { label: 'Latency',      value: `${p.latencyMs}ms`,       good: p.latencyMs < 2000,  icon: <TimerIcon size={12} /> },
                  { label: 'Success Rate', value: `${p.successRate}%`,      good: p.successRate >= 90, icon: <CheckCircle2Icon size={12} /> },
                  { label: 'Error Rate',   value: `${p.errorRate}%`,        good: p.errorRate < 10,    icon: <XCircleIcon size={12} /> },
                  { label: 'Total Checks', value: p.totalChecks.toString(), good: true,                icon: <BarChart3Icon size={12} /> },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: 'var(--nb-cream)',
                    border: '2px solid var(--nb-black)',
                    borderRadius: 4, padding: '12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--nb-gray)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      {stat.icon} {stat.label}
                    </div>
                    <div style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 800, fontSize: '1.1rem',
                      color: stat.good ? 'var(--nb-green-dark)' : 'var(--nb-red)',
                    }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {p.lastChecked && (
                <p style={{ color: 'var(--nb-gray)', fontSize: '0.75rem', marginTop: 12, fontFamily: 'Space Grotesk, sans-serif' }}>
                  Last checked: {new Date(p.lastChecked).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Refresh button */}
        <div style={{ textAlign: 'center' }}>
          <button
            id="refresh-btn"
            onClick={fetchHealth}
            disabled={refreshing}
            className="nb-btn nb-btn-secondary"
          >
            <RefreshCwIcon size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
