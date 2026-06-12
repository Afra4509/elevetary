import Link from 'next/link'
import { ZapIcon, ShieldIcon, BarChart3Icon, RefreshCwIcon, CircleIcon, CodeIcon, ArrowRightIcon, CheckIcon } from 'lucide-react'

const FEATURES = [
  {
    icon: <RefreshCwIcon size={22} strokeWidth={2.5} />,
    title: 'Smart Router',
    desc: 'Round-robin, random, or priority routing with circuit breaker. Auto-failover to next provider instantly.',
    color: 'var(--nb-blue)',
    bg: '#EEF2FF',
  },
  {
    icon: <ZapIcon size={22} strokeWidth={2.5} />,
    title: 'Streaming SSE',
    desc: 'Full streaming response support. Works with any OpenAI SDK — zero config changes needed.',
    color: 'var(--nb-orange)',
    bg: '#FFF3EE',
  },
  {
    icon: <ShieldIcon size={22} strokeWidth={2.5} />,
    title: 'Secure by Default',
    desc: 'API keys hashed with SHA-256. Provider keys never exposed. Full audit trail on every request.',
    color: 'var(--nb-green)',
    bg: '#EDFAF5',
  },
  {
    icon: <BarChart3Icon size={22} strokeWidth={2.5} />,
    title: 'Usage Dashboard',
    desc: 'Real-time token usage, request history, quota tracking, and visual analytics charts.',
    color: 'var(--nb-purple)',
    bg: '#F5EEFF',
  },
  {
    icon: <CircleIcon size={22} strokeWidth={2.5} />,
    title: 'Rate Limiting',
    desc: 'Per-key and per-IP rate limits. Anti-spam and anti-flood protection built in at the gateway.',
    color: 'var(--nb-red)',
    bg: '#FFF0F2',
  },
  {
    icon: <CodeIcon size={22} strokeWidth={2.5} />,
    title: 'OpenAI Compatible',
    desc: 'Drop-in replacement for the OpenAI API. Change one URL and you\'re done. No SDK changes.',
    color: 'var(--nb-yellow-dark)',
    bg: '#FFFBEA',
  },
]

const PERKS = [
  'No vendor lock-in',
  'Self-hosted & private',
  'OpenAI SDK compatible',
  '3 providers, 1 key',
  'Free to deploy on Vercel',
  'Supabase PostgreSQL',
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--nb-cream)' }}>

      {/* ── Navbar ── */}
      <nav className="nb-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--nb-yellow)',
            border: '3px solid var(--nb-cream)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 18, fontWeight: 800, color: 'var(--nb-black)',
          }}>A</div>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800, fontSize: '1.15rem', color: 'var(--nb-cream)',
            letterSpacing: '-0.02em',
          }}>Aeferalow API</span>
          <span style={{
            background: 'var(--nb-yellow)',
            border: '2px solid var(--nb-yellow-dark)',
            borderRadius: 2,
            padding: '2px 8px',
            fontSize: '0.65rem',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800,
            color: 'var(--nb-black)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>Beta</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/docs" style={{
            color: '#9CA3AF', textDecoration: 'none',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.875rem',
            padding: '6px 12px',
          }}>Docs</Link>
          <Link href="/status" style={{
            color: '#9CA3AF', textDecoration: 'none',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.875rem',
            padding: '6px 12px',
          }}>Status</Link>
          <Link href="/playground" style={{
            color: '#9CA3AF', textDecoration: 'none',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.875rem',
            padding: '6px 12px',
          }}>Playground</Link>
          <Link href="/login" className="nb-btn nb-btn-primary" style={{ padding: '8px 18px' }}>
            Sign In →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '80px 2rem 60px',
        textAlign: 'center',
        animation: 'nb-slide-up 0.4s ease',
      }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <span className="nb-badge nb-badge-green">
            <span className="nb-dot nb-dot-green" style={{ width: 7, height: 7, borderWidth: 1.5 }} />
            Live · 3 AI Providers · OpenAI Compatible
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2.8rem, 7vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          color: 'var(--nb-black)',
          marginBottom: 24,
          letterSpacing: '-0.03em',
        }}>
          Your Own{' '}
          <span style={{
            background: 'var(--nb-yellow)',
            padding: '0 12px 4px',
            border: '3px solid var(--nb-black)',
            display: 'inline-block',
            transform: 'rotate(-1deg)',
            marginTop: 4,
          }}>
            AI Gateway
          </span>
          <br />in Minutes.
        </h1>

        <p style={{
          fontSize: '1.125rem',
          color: 'var(--nb-gray)',
          lineHeight: 1.7,
          maxWidth: 560,
          margin: '0 auto 40px',
          fontWeight: 500,
        }}>
          Drop-in OpenAI replacement with smart provider routing, automatic failover,
          rate limiting, and a beautiful dashboard. Self-host on Vercel for free.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
          <Link href="/login" className="nb-btn nb-btn-primary nb-btn-lg">
            Get Started Free <ArrowRightIcon size={18} />
          </Link>
          <Link href="/docs" className="nb-btn nb-btn-secondary nb-btn-lg">
            Read the Docs
          </Link>
        </div>

        {/* Perks */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {PERKS.map(p => (
            <span key={p} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--nb-white)',
              border: '2px solid var(--nb-black)',
              borderRadius: 2,
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              boxShadow: '2px 2px 0 var(--nb-black)',
            }}>
              <CheckIcon size={12} strokeWidth={3} color="var(--nb-green-dark)" />
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ── Code Snippet ── */}
      <section style={{ maxWidth: 820, margin: '0 auto 80px', padding: '0 2rem' }}>
        <div className="nb-code" style={{ boxShadow: 'var(--nb-shadow-lg)' }}>
          <div className="nb-code-header" style={{ margin: '-20px -20px 20px' }}>
            <span>Quick Start</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--nb-red)', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--nb-yellow)', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--nb-green)', display: 'inline-block' }} />
            </div>
          </div>
          <pre style={{ color: '#E8E8E8', fontSize: '0.875rem', lineHeight: 1.8, margin: 0, overflowX: 'auto' }}>{`import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: 'afr_your_key_here',         // Get this from the dashboard
  baseURL: 'https://api.aeferalow.my.id/v1', // ← only change needed
})

const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
})

for await (const chunk of response) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '')
}`}</pre>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="nb-tag">Features</span>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '2.2rem', fontWeight: 800,
            marginTop: 12, letterSpacing: '-0.02em',
          }}>Everything you need</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="nb-card"
              style={{ padding: 28, animationDelay: `${i * 0.05}s` }}
            >
              <div style={{
                width: 48, height: 48,
                background: f.bg,
                border: '2px solid var(--nb-black)',
                borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color,
                marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.05rem', fontWeight: 800,
                marginBottom: 8,
              }}>{f.title}</h3>
              <p style={{ color: 'var(--nb-gray)', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 80px' }}>
        <div style={{
          background: 'var(--nb-black)',
          border: '3px solid var(--nb-black)',
          borderRadius: 4,
          padding: '48px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 24,
          boxShadow: 'var(--nb-shadow-xl)',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.8rem', fontWeight: 800, color: 'var(--nb-cream)',
              marginBottom: 8, letterSpacing: '-0.02em',
            }}>Ready to get started?</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
              Deploy your AI API Gateway in under 5 minutes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/login" className="nb-btn nb-btn-primary nb-btn-lg">
              Create Account <ArrowRightIcon size={18} />
            </Link>
            <Link href="/playground" className="nb-btn nb-btn-secondary nb-btn-lg"
              style={{ background: '#2A2A2A', color: 'var(--nb-cream)', borderColor: '#4B5563' }}>
              Try Playground
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '3px solid var(--nb-black)',
        padding: '28px 2rem',
        background: 'var(--nb-white)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700, fontSize: '0.875rem',
        }}>© 2025 Aeferalow API</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Docs', '/docs'], ['Status', '/status'], ['Playground', '/playground'], ['Login', '/login']].map(([label, href]) => (
            <Link key={label} href={href} style={{
              color: 'var(--nb-gray)', textDecoration: 'none',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.875rem',
            }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
