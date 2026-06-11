import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: 'white',
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Aeferalow API</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/docs" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Docs</Link>
          <Link href="/status" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Status</Link>
          <Link href="/chat" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Playground</Link>
          <Link href="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 2rem 80px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '20px', padding: '6px 16px', fontSize: '0.8125rem',
          color: 'var(--accent-light)', marginBottom: '24px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
          3 AI Providers · Smart Routing · OpenAI Compatible
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
          Your Own{' '}
          <span className="gradient-text">AI API Gateway</span>
        </h1>

        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Drop-in OpenAI replacement with smart provider routing, automatic failover, rate limiting, 
          and a beautiful dashboard. Start calling AI in minutes.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Get Started →
          </Link>
          <Link href="/docs" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            View Docs
          </Link>
        </div>

        {/* Code snippet */}
        <div className="code-block" style={{ marginTop: '60px', textAlign: 'left' }}>
          <div style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Quick Start</div>
          <pre style={{ color: '#c9d1d9', fontSize: '0.8125rem', lineHeight: 1.6 }}>{`import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: 'afr_your_key_here',
  baseURL: 'https://api.aeferalow.my.id/v1',
})

const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
})`}</pre>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '48px' }}>
          Everything you need
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            { icon: '🔄', title: 'Smart Router', desc: 'Round-robin, random, priority mode with automatic failover and circuit breaker.' },
            { icon: '⚡', title: 'Streaming SSE', desc: 'Full streaming response support compatible with all OpenAI client libraries.' },
            { icon: '🔐', title: 'Secure by Default', desc: 'API keys are hashed. Provider keys never leave the server. Full audit logs.' },
            { icon: '📊', title: 'Usage Dashboard', desc: 'Real-time token usage, request history, quota tracking and visual charts.' },
            { icon: '🛡️', title: 'Rate Limiting', desc: 'Per-key and per-IP rate limits. Anti-spam, anti-flood protection built in.' },
            { icon: '🟢', title: 'Health Monitoring', desc: 'Provider status page with latency, success rate and auto-refresh.' },
          ].map((f) => (
            <div key={f.title} className="glass" style={{ padding: '24px', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
      }}>
        <p>© 2025 Aeferalow API · Built with ♥ · <Link href="/docs" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>Docs</Link> · <Link href="/status" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>Status</Link></p>
      </footer>
    </div>
  )
}
