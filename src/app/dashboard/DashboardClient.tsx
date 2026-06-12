'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, BookOpen, MessageSquare, Activity,
  LogOut, Key, AlertTriangleIcon, Coins,
  BarChart2, Zap, Clock, ArrowRightIcon, SettingsIcon, MenuIcon, XIcon,
  SparklesIcon, RocketIcon,
} from 'lucide-react'
import CopyButton from '@/components/ui/CopyButton'
import StatusBadge from '@/components/ui/StatusBadge'

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
  { href: '/dashboard', label: 'Overview',   Icon: LayoutDashboard },
  { href: '/docs',      label: 'Docs',        Icon: BookOpen },
  { href: '/playground',label: 'Playground',  Icon: MessageSquare },
  { href: '/status',    label: 'Status',      Icon: Activity },
  { href: '/settings',  label: 'Settings',    Icon: SettingsIcon },
]

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function DashboardClient({ user, primaryKey, recentLogs }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const quotaPercent = primaryKey
    ? Math.min(Math.round((primaryKey.usedTokens / primaryKey.quota) * 100), 100)
    : 0

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const stats = [
    { label: 'Tokens Used',     value: fmt(primaryKey?.usedTokens ?? 0),                                                sub: `of ${fmt(primaryKey?.quota ?? 0)} total`,   Icon: Coins,   color: 'var(--nb-purple)', cls: 'nb-stat-purple' },
    { label: 'Total Requests',  value: fmt(primaryKey?.totalRequests ?? 0),                                            sub: 'all time',                                    Icon: BarChart2, color: 'var(--nb-green)',  cls: 'nb-stat-green' },
    { label: 'Remaining Quota', value: fmt((primaryKey?.quota ?? 0) - (primaryKey?.usedTokens ?? 0)),                 sub: 'tokens left',                                 Icon: Zap,     color: 'var(--nb-blue)',   cls: 'nb-stat-blue' },
    { label: 'Rate Limit',      value: `${primaryKey?.rateLimit ?? 0}/min`,                                           sub: 'requests/minute',                             Icon: Clock,   color: 'var(--nb-orange)', cls: 'nb-stat-orange' },
  ]

  const SidebarContent = () => (
    <>
      <div className="nb-sidebar-logo">
        <div style={{
          width: 36, height: 36,
          background: 'var(--nb-yellow)',
          border: '2px solid var(--nb-yellow-dark)',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 800,
          color: 'var(--nb-black)', flexShrink: 0,
        }}>A</div>
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 800, fontSize: '1rem', color: 'var(--nb-cream)',
          letterSpacing: '-0.01em',
        }}>Aeferalow</span>
      </div>

      <nav className="nb-sidebar-nav">
        <div className="nb-sidebar-section">Navigation</div>
        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="nb-sidebar-item"
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="nb-sidebar-footer">
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '0.8rem', fontWeight: 600,
          color: '#9CA3AF',
          marginBottom: 8,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {user.name ?? user.email}
        </div>
        <button
          id="logout-btn"
          onClick={logout}
          disabled={loggingOut}
          className="nb-btn nb-btn-secondary"
          style={{
            width: '100%', justifyContent: 'center',
            fontSize: '0.8rem', padding: '8px',
            background: '#2A2A2A', color: '#9CA3AF',
            borderColor: '#3A3A3A',
          }}
        >
          <LogOut size={14} />
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </>
  )

  return (
    <div className="nb-dashboard">
      {/* Sidebar — desktop */}
      <aside className={`nb-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 45, display: 'none',
        }} className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="nb-main">
        {/* Topbar */}
        <div className="nb-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="nb-btn nb-btn-secondary nb-btn-icon mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
            >
              {sidebarOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
            </button>
            <div>
              <h1 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.2rem', fontWeight: 800, color: 'var(--nb-black)',
              }}>
                Welcome back, {user.name ?? user.email.split('@')[0]}
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--nb-gray)' }}>
                Here&apos;s your API usage overview
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/playground" className="nb-btn nb-btn-primary nb-btn-sm">
              Try Playground <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>

        <div className="nb-page animate-fade-in">
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {stats.map(({ label, value, sub, color, cls, Icon }) => (
              <div key={label} className={`nb-stat ${cls}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    width: 32, height: 32,
                    background: color + '20',
                    border: `2px solid ${color}`,
                    borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color={color} />
                  </div>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.72rem', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--nb-gray)',
                  }}>{label}</span>
                </div>
                <div className="nb-stat-value">{value}</div>
                <div className="nb-stat-label">{sub}</div>
              </div>
            ))}
          </div>

          {/* Quota Bar */}
          {primaryKey && (
            <div className="nb-card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <BarChart2 size={16} color="var(--nb-blue)" />
                  Token Quota Usage
                </span>
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 800, fontSize: '0.9rem',
                  color: quotaPercent > 80 ? 'var(--nb-red)' : quotaPercent > 60 ? 'var(--nb-orange)' : 'var(--nb-green)',
                }}>{quotaPercent}%</span>
              </div>
              <div style={{
                background: '#F0E8D0',
                border: '2px solid var(--nb-black)',
                borderRadius: 2, height: 12, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: quotaPercent > 80 ? 'var(--nb-red)' : quotaPercent > 60 ? 'var(--nb-orange)' : 'var(--nb-green)',
                  width: `${quotaPercent}%`,
                  transition: 'width 0.8s ease',
                  borderRight: quotaPercent < 100 ? '2px solid var(--nb-black)' : undefined,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: 'var(--nb-gray)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
                <span>{fmt(primaryKey.usedTokens)} used</span>
                <span>{fmt(primaryKey.quota)} total</span>
              </div>
            </div>
          )}

          {/* API Key Card */}
          <div className="nb-card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.05rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Key size={18} color="var(--nb-blue)" />
                Your API Key
              </h2>
              <StatusBadge status={primaryKey?.enabled ? 'active' : 'inactive'} />
            </div>

            {primaryKey ? (
              <>
                <div style={{
                  background: 'var(--nb-black)',
                  border: '2px solid var(--nb-black)',
                  borderRadius: 4,
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, marginBottom: 12,
                  boxShadow: 'var(--nb-shadow-sm)',
                }}>
                  <code style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.875rem',
                    color: 'var(--nb-yellow)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '0.05em',
                  }}>
                    {primaryKey.keyPrefix}
                  </code>
                  <CopyButton text={primaryKey.keyPrefix} label="Copy" size="sm" />
                </div>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '12px', background: '#FFF8E0',
                  border: '2px solid var(--nb-yellow-dark)',
                  borderRadius: 4,
                  fontSize: '0.8125rem', color: 'var(--nb-black)',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500,
                }}>
                  <AlertTriangleIcon size={14} style={{ flexShrink: 0, marginTop: 1, color: 'var(--nb-orange)' }} />
                  Your full key was shown once at creation. Use{' '}
                  <code style={{ fontFamily: 'monospace', background: '#FFE566', padding: '0 4px', borderRadius: 2 }}>
                    Authorization: Bearer afr_xxx
                  </code>
                  {' '}in your requests.
                </div>
              </>
            ) : (
              <div className="nb-empty-state">
                <div className="nb-empty-state-icon">
                  <Key size={36} color="var(--nb-blue)" />
                </div>
                <div className="nb-empty-state-title">No API Key</div>
                <p style={{ fontSize: '0.875rem' }}>Ask your administrator to create an API key for you.</p>
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="nb-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.05rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Activity size={18} color="var(--nb-blue)" />
                Recent Requests
              </h2>
              {recentLogs.length > 0 && (
                <span className="nb-badge nb-badge-blue">{recentLogs.length} entries</span>
              )}
            </div>
            {recentLogs.length === 0 ? (
              <div className="nb-empty-state">
                <div className="nb-empty-state-icon">
                  <RocketIcon size={36} color="var(--nb-blue)" />
                </div>
                <div className="nb-empty-state-title">No requests yet</div>
                <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>
                  Start by trying the <Link href="/playground" style={{ color: 'var(--nb-blue)', fontWeight: 700 }}>Playground</Link>.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="nb-table">
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
                        <td>
                          <span className="nb-badge nb-badge-blue">Provider {log.provider}</span>
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--nb-gray)' }}>
                          {log.model}
                        </td>
                        <td>
                          <StatusBadge status={log.status === 'success' ? 'online' : 'offline'} label={log.status} size="sm" />
                        </td>
                        <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {log.totalTokens.toLocaleString()}
                        </td>
                        <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--nb-gray)' }}>
                          {log.latencyMs}ms
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--nb-gray)' }}>
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

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .mobile-overlay  { display: block !important; }
          .nb-sidebar.open { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
