'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, BookOpen, MessageSquare, Activity,
  LogOut, Copy, Check, Key, AlertTriangle, Coins,
  BarChart2, Zap, Clock, ArrowRight,
} from 'lucide-react'

interface ApiKey {
  id: string; keyPrefix: string; name: string; quota: number;
  usedTokens: number; totalRequests: number; rateLimit: number;
  enabled: boolean; expiresAt: Date | null; createdAt: Date;
}

interface RecentLog {
  id: string; provider: string; model: string; status: string;
  totalTokens: number; latencyMs: number; createdAt: Date;
}

interface User {
  id: string; email: string; name: string | null; role: string;
}

interface Props {
  user: User
  primaryKey: ApiKey | null
  recentLogs: RecentLog[]
}

const navItems = [
  { href: '/dashboard', label: 'Overview', Icon: LayoutDashboard },
  { href: '/docs', label: 'Docs', Icon: BookOpen },
  { href: '/chat', label: 'Playground', Icon: MessageSquare },
  { href: '/status', label: 'Status', Icon: Activity },
]

export default function DashboardClient({ user, primaryKey, recentLogs }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const quotaPercent = primaryKey
    ? Math.min(Math.round((primaryKey.usedTokens / primaryKey.quota) * 100), 100)
    : 0

  async function copyKeyInfo() {
    if (!primaryKey) return
    await navigator.clipboard.writeText(primaryKey.keyPrefix)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function formatNumber(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
    return n.toString()
  }

  const stats = [
    { label: 'Tokens Used', value: formatNumber(primaryKey?.usedTokens ?? 0), sub: `of ${formatNumber(primaryKey?.quota ?? 0)} quota`, color: 'var(--accent-light)', Icon: Coins },
    { label: 'Total Requests', value: formatNumber(primaryKey?.totalRequests ?? 0), sub: 'all time', color: 'var(--green)', Icon: BarChart2 },
    { label: 'Remaining Quota', value: formatNumber((primaryKey?.quota ?? 0) - (primaryKey?.usedTokens ?? 0)), sub: 'tokens left', color: 'var(--blue)', Icon: Zap },
    { label: 'Rate Limit', value: String(primaryKey?.rateLimit ?? 0), sub: 'req / minute', color: 'var(--yellow)', Icon: Clock },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>A</div>
            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>Aeferalow API</span>
          </Link>
        </div>

        <nav style={{ padding: '16px', flex: 1 }}>
          {navItems.map(({ href, label, Icon }) => (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px',
              color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem',
              marginBottom: '4px', transition: 'all 0.2s',
            }}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name ?? user.email}
          </div>
          <button onClick={logout} disabled={loggingOut} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '8px', gap: '6px' }}>
            <LogOut size={14} />
            {loggingOut ? 'Logging out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' }}>
        <div className="animate-fade-in">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>
            Welcome back, {user.name ?? user.email.split('@')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Here&apos;s your API usage overview
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {stats.map(({ label, value, sub, color, Icon }) => (
              <div key={label} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '12px' }}>
                  <Icon size={14} color={color} />
                  {label}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color, marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Quota Bar */}
          {primaryKey && (
            <div className="glass" style={{ padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart2 size={16} color="var(--accent-light)" />
                  Token Quota Usage
                </span>
                <span style={{ color: quotaPercent > 80 ? 'var(--red)' : 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{quotaPercent}%</span>
              </div>
              <div style={{ background: 'var(--bg-card2)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  background: quotaPercent > 80 ? 'var(--red)' : quotaPercent > 60 ? 'var(--yellow)' : 'linear-gradient(90deg, #7c3aed, #6d28d9)',
                  width: `${quotaPercent}%`,
                  transition: 'width 0.8s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{formatNumber(primaryKey.usedTokens)} used</span>
                <span>{formatNumber(primaryKey.quota)} total</span>
              </div>
            </div>
          )}

          {/* API Key */}
          <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="var(--accent-light)" />
                Your API Key
              </h2>
              <span className={`badge ${primaryKey?.enabled ? 'badge-green' : 'badge-red'}`}>
                {primaryKey?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>

            {primaryKey ? (
              <>
                <div className="glass-2" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {primaryKey.keyPrefix}
                  </code>
                  <button onClick={copyKeyInfo} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', flexShrink: 0, gap: '6px' }}>
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--yellow)' }} />
                  Your full API key was shown once at creation. Contact admin to regenerate.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowRight size={14} />
                  Use as: <code style={{ color: 'var(--accent-light)', fontSize: '0.8rem' }}>Authorization: Bearer afr_xxx</code>
                </p>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No API key yet. Ask your administrator to create one.</p>
            )}
          </div>

          {/* Recent Requests */}
          <div className="glass" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--accent-light)" />
              Recent Requests
            </h2>
            {recentLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
                No requests yet. Start by trying the <Link href="/chat" style={{ color: 'var(--accent-light)' }}>Playground</Link>.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Model</th>
                      <th>Status</th>
                      <th>Tokens</th>
                      <th>Latency</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log) => (
                      <tr key={log.id}>
                        <td><span className="badge badge-purple">Provider {log.provider}</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.model}</td>
                        <td><span className={`badge ${log.status === 'success' ? 'badge-green' : 'badge-red'}`}>{log.status}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{log.totalTokens.toLocaleString('en-US')}</td>
                        <td style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{log.latencyMs}ms</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
