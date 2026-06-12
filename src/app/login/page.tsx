'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon, LockIcon, MailIcon, RefreshCwIcon, ZapIcon, ShieldIcon, BarChart3Icon, AlertCircleIcon } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }

      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--nb-cream)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left panel — decorative */}
      <div style={{
        flex: 1,
        background: 'var(--nb-black)',
        borderRight: '3px solid var(--nb-black)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
      }}
        className="hide-mobile"
      >
        <div>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            textDecoration: 'none',
          }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--nb-yellow)',
              border: '3px solid var(--nb-yellow-dark)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 18, fontWeight: 800, color: 'var(--nb-black)',
            }}>A</div>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800, fontSize: '1.15rem', color: 'var(--nb-cream)',
            }}>Aeferalow API</span>
          </Link>
        </div>

        <div>
          <div style={{
            background: '#2A2A2A',
            border: '2px solid #3A3A3A',
            borderRadius: 4,
            padding: '24px',
            marginBottom: 32,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.8rem',
            color: '#9CA3AF',
            lineHeight: 1.8,
          }}>
            <span style={{ color: '#7B9FF9' }}>const</span>{' '}
            <span style={{ color: '#06D6A0' }}>client</span>{' '}
            <span style={{ color: '#E8E8E8' }}>=</span>{' '}
            <span style={{ color: '#FFE566' }}>new OpenAI</span>
            <span style={{ color: '#E8E8E8' }}>(&#123;</span>
            <br />
            <span style={{ paddingLeft: 16, color: '#C084FC' }}>apiKey:</span>{' '}
            <span style={{ color: '#FFE566' }}>&apos;afr_your_key&apos;</span>
            <span style={{ color: '#E8E8E8' }}>,</span>
            <br />
            <span style={{ paddingLeft: 16, color: '#C084FC' }}>baseURL:</span>{' '}
            <span style={{ color: '#FFE566' }}>&apos;/api/v1&apos;</span>
            <br />
            <span style={{ color: '#E8E8E8' }}>&#125;)</span>
          </div>
          {([
            [<RefreshCwIcon size={15} key="r" />, 'Smart provider routing with failover'],
            [<ZapIcon size={15} key="z" />, 'Streaming SSE responses'],
            [<ShieldIcon size={15} key="s" />, 'SHA-256 hashed API keys'],
            [<BarChart3Icon size={15} key="b" />, 'Real-time usage analytics'],
          ] as [React.ReactNode, string][]).map(([icon, text]) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              color: '#9CA3AF',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.875rem', fontWeight: 500,
              marginBottom: 12,
            }}>
              <span style={{ color: 'var(--nb-yellow)', flexShrink: 0 }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>

        <p style={{
          color: '#4B5563',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '0.75rem',
        }}>
          © 2025 Aeferalow API
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: '100%', maxWidth: 520,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'nb-slide-up 0.3s ease' }}>

          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--nb-gray)', textDecoration: 'none',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.825rem',
            marginBottom: 32,
          }}>
            <ArrowLeftIcon size={14} /> Back to home
          </Link>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '2rem', fontWeight: 800,
            color: 'var(--nb-black)',
            marginBottom: 6, letterSpacing: '-0.02em',
          }}>Welcome back</h1>
          <p style={{ color: 'var(--nb-gray)', fontSize: '0.9rem', marginBottom: 32 }}>
            Sign in to access your API dashboard
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FFF0F2',
              border: '2px solid var(--nb-red)',
              borderRadius: 4,
              padding: '12px 16px',
              color: 'var(--nb-red)',
              fontSize: '0.875rem',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              marginBottom: 20,
              boxShadow: 'var(--nb-shadow-red)',
            }}>
              <AlertCircleIcon size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="nb-label" htmlFor="email">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MailIcon size={12} /> Email Address
                </span>
              </label>
              <input
                id="email"
                type="email"
                className="nb-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="nb-label" htmlFor="password">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LockIcon size={12} /> Password
                </span>
              </label>
              <input
                id="password"
                type="password"
                className="nb-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="nb-btn nb-btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 4, fontSize: '1rem' }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: '2.5px solid rgba(26,26,26,0.3)',
                    borderTopColor: 'var(--nb-black)',
                    borderRadius: '50%',
                  }} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRightIcon size={16} /></>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 24, padding: '16px',
            background: '#F5F0E8',
            border: '2px solid #E5E0D0',
            borderRadius: 4,
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--nb-gray)', fontSize: '0.825rem', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500 }}>
              Don&apos;t have an account?{' '}
              <span style={{ color: 'var(--nb-black)', fontWeight: 700 }}>Contact your administrator</span>.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
