'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Key, ScrollText, Settings,
  LogOut, Plus, Trash2, Ban, CheckCircle, RefreshCw,
  AlertTriangle, ShieldAlert, Activity, Server, Edit, Info, X,
} from 'lucide-react'

interface User { id: string; email: string; name: string | null; role: string; enabled: boolean; createdAt: Date }
interface ApiKey { id: string; keyPrefix: string; name: string; quota: number; usedTokens: number; totalRequests: number; enabled: boolean; rateLimit: number; owner: { email: string }; createdAt: Date }
interface Log { id: string; provider: string; model: string; status: string; totalTokens: number; latencyMs: number; createdAt: Date; apiKey: { keyPrefix: string } | null; user: { email: string } | null }
interface ProviderHealth { provider: string; isOnline: boolean; latencyMs: number; successRate: number; lastChecked: Date }

interface Props {
  users: User[]; apiKeys: ApiKey[]; logs: Log[]
  stats: { totalUsers: number; activeKeys: number; totalReqs: number; successReqs: number; errorReqs: number }
  providerHealth: ProviderHealth[]
  routerMode: string; maintenanceMode: boolean
}

type Tab = 'overview' | 'users' | 'keys' | 'logs' | 'settings'

const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'keys', label: 'API Keys', Icon: Key },
  { id: 'logs', label: 'Logs', Icon: ScrollText },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

export default function AdminClient({ users, apiKeys, logs, stats, providerHealth, routerMode, maintenanceMode }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [routerModeState, setRouterModeState] = useState(routerMode)
  const [maintenance, setMaintenance] = useState(maintenanceMode)
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' })
  const [newKeyTarget, setNewKeyTarget] = useState('')
  const [newKeyName, setNewKeyName] = useState('Default Key')
  const [newKeyQuota, setNewKeyQuota] = useState(100000)
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(60)
  const [createdKey, setCreatedKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editUserForm, setEditUserForm] = useState({ role: 'user', password: '' })

  function showMsg(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 5000)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  async function createUser() {
    if (!newUser.email || !newUser.password) return showMsg('error:Email and password required')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (res.ok) { showMsg('success:User created successfully'); setNewUser({ email: '', password: '', name: '', role: 'user' }); router.refresh() }
      else showMsg(`error:${data.error}`)
    } finally { setLoading(false) }
  }

  async function deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) { showMsg('success:User deleted'); router.refresh() }
    else { const d = await res.json(); showMsg(`error:${d.error}`) }
  }

  async function saveUserEdit() {
    if (!editingUser) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserForm),
      })
      if (res.ok) { 
        showMsg('success:User updated successfully')
        setEditingUser(null)
        router.refresh() 
      }
      else { const d = await res.json(); showMsg(`error:${d.error}`) }
    } finally { setLoading(false) }
  }

  async function createKey() {
    if (!newKeyTarget) return showMsg('error:Please select a user')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, userId: newKeyTarget, quota: newKeyQuota, rateLimit: newKeyRateLimit }),
      })
      const data = await res.json()
      if (res.ok) { setCreatedKey(data.key); router.refresh() }
      else showMsg(`error:${data.error}`)
    } finally { setLoading(false) }
  }

  async function toggleKey(id: string, enabled: boolean) {
    await fetch(`/api/admin/keys/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    })
    router.refresh()
  }

  async function deleteKey(id: string) {
    if (!confirm('Delete this API key? This action cannot be undone.')) return
    await fetch(`/api/admin/keys/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function saveConfig() {
    const res = await fetch('/api/admin/config', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ router_mode: routerModeState, maintenance_mode: maintenance }),
    })
    if (res.ok) showMsg('success:Settings saved')
    else showMsg('error:Failed to save settings')
  }

  const isSuccess = msg.startsWith('success:')
  const msgText = msg.replace(/^(success|error):/, '')

  return (
    <div className="nb-mobile-stack" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="nb-sidebar">
        <div className="nb-sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white' }}>A</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--nb-cream)' }}>Afra Panel</div>
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Aeferalow API</div>
            </div>
          </div>
        </div>

        <nav className="nb-sidebar-nav">
          <div className="nb-sidebar-section">Menu</div>
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`nb-sidebar-item ${tab === id ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', background: tab === id ? undefined : 'transparent' }}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="nb-sidebar-footer">
          <button onClick={logout} className="nb-sidebar-item" style={{ width: '100%', justifyContent: 'center', background: 'transparent' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '32px', overflow: 'auto', background: 'var(--nb-cream)' }}>
        {msg && (
          <div style={{
            marginBottom: '20px', padding: '12px 16px',
            background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: '8px', fontSize: '0.875rem',
            color: isSuccess ? 'var(--green)' : 'var(--red)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {isSuccess ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {msgText}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Platform statistics at a glance</p>

            <div className="nb-grid-stats" style={{ marginBottom: '32px' }}>
              {[
                { label: 'Total Users', value: stats.totalUsers, color: 'var(--nb-blue)', Icon: Users },
                { label: 'Active Keys', value: stats.activeKeys, color: 'var(--nb-green)', Icon: Key },
                { label: 'Total Requests', value: stats.totalReqs, color: 'var(--nb-purple)', Icon: Activity },
                { label: 'Success', value: stats.successReqs, color: 'var(--nb-green)', Icon: CheckCircle },
                { label: 'Errors', value: stats.errorReqs, color: 'var(--nb-red)', Icon: AlertTriangle },
              ].map(({ label, value, color, Icon }) => (
                <div key={label} className="nb-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--nb-gray)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>
                    <Icon size={16} color={color} /> {label}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={16} color="var(--accent-light)" /> Provider Health
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {providerHealth.length === 0 ? (
                <p style={{ color: 'var(--nb-gray)' }}>No health data yet. Visit <a href="/status" style={{ color: 'var(--nb-blue)' }}>/status</a> to trigger a check.</p>
              ) : providerHealth.map((p) => (
                <div key={p.provider} className="nb-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={p.isOnline ? 'nb-dot nb-dot-green' : 'nb-dot nb-dot-red'} style={{ width: 10, height: 10, borderWidth: 2 }} />
                    <span style={{ fontWeight: 600 }}>Provider {p.provider}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '0.875rem', color: 'var(--nb-gray)' }}>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{p.latencyMs}ms</span>
                    <span style={{ color: p.successRate >= 90 ? 'var(--nb-green-dark)' : 'var(--nb-red)', fontWeight: 800 }}>{Math.round(p.successRate)}% uptime</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={22} /> Users
            </h1>

            <div className="nb-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Create User (Invite Only)</h2>
              <div className="nb-grid-stats" style={{ gap: '12px', marginBottom: '12px' }}>
                <input className="nb-input" placeholder="Email address" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <input className="nb-input" type="password" placeholder="Password (min 8 chars)" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <input className="nb-input" placeholder="Display name (optional)" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                <select className="nb-input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button onClick={createUser} disabled={loading} className="nb-btn nb-btn-primary" style={{ gap: '6px' }}>
                <Plus size={16} /> Create User
              </button>
            </div>

            <div className="nb-card" style={{ overflowX: 'auto', padding: '0' }}>
              <table className="nb-table">
                <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.email}</td>
                      <td style={{ color: 'var(--nb-gray)' }}>{u.name ?? '—'}</td>
                      <td><span className={`nb-badge ${u.role === 'admin' ? 'nb-badge-purple' : 'nb-badge-yellow'}`}>{u.role}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--nb-gray)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditingUser(u); setEditUserForm({ role: u.role, password: '' }) }} className="nb-btn nb-btn-secondary nb-btn-sm" style={{ gap: '4px' }}>
                            <Edit size={12} /> Edit
                          </button>
                          <button onClick={() => deleteUser(u.id)} className="nb-btn nb-btn-red nb-btn-sm" style={{ gap: '4px' }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingUser && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div className="nb-card" style={{ width: '400px', padding: '24px', position: 'relative' }}>
                  <button onClick={() => setEditingUser(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--nb-gray)', cursor: 'pointer' }}><X size={20} /></button>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Edit User</h2>
                  <p style={{ color: 'var(--nb-gray)', fontSize: '0.875rem', marginBottom: '20px' }}>{editingUser.email}</p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--nb-gray)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Role</label>
                    <select className="nb-input" value={editUserForm.role} onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--nb-gray)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>New Password (leave blank to keep current)</label>
                    <input className="nb-input" type="password" placeholder="New password (min 8 chars)" value={editUserForm.password} onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })} />
                  </div>
                  
                  <button onClick={saveUserEdit} disabled={loading} className="nb-btn nb-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Changes</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* KEYS */}
        {tab === 'keys' && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Key size={22} /> API Keys
            </h1>

            <div className="nb-card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Info size={20} color="var(--nb-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--nb-blue)', marginBottom: '4px' }}>Security Notice</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--nb-black)', lineHeight: 1.5 }}>
                  For security reasons, full API keys are <strong>never stored</strong> in our database. We only store an irreversible cryptographic hash and the prefix (e.g. <code>afr_1234...</code>) to identify them. Therefore, you cannot view the full key after it is created. If a user loses their key, you must delete the old one and generate a new one.
                </p>
              </div>
            </div>

            <div className="nb-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Create API Key</h2>
              <div className="nb-grid-stats" style={{ gap: '12px', marginBottom: '16px' }}>
                <select className="nb-input" value={newKeyTarget} onChange={(e) => setNewKeyTarget(e.target.value)}>
                  <option value="">Select User</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
                </select>
                <input className="nb-input" placeholder="Key Name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--nb-gray)', marginBottom: '4px', display: 'block', fontWeight: 600 }}>Token Quota</label>
                  <input className="nb-input" type="number" value={newKeyQuota} onChange={(e) => setNewKeyQuota(Number(e.target.value))} min={1000} step={10000} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--nb-gray)', marginBottom: '4px', display: 'block', fontWeight: 600 }}>Rate Limit (req/min)</label>
                  <input className="nb-input" type="number" value={newKeyRateLimit} onChange={(e) => setNewKeyRateLimit(Number(e.target.value))} min={1} max={1000} />
                </div>
              </div>
              <button onClick={createKey} disabled={loading || !newKeyTarget} className="nb-btn nb-btn-primary" style={{ gap: '6px' }}>
                <RefreshCw size={16} /> Generate Key
              </button>

              {createdKey && (
                <div className="nb-card" style={{ marginTop: '16px', padding: '16px', background: 'var(--nb-cream)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--nb-orange)', marginBottom: '10px', fontWeight: 600 }}>
                    <AlertTriangle size={14} /> Save this key now — it will NOT be shown again!
                  </div>
                  <code style={{ fontFamily: 'monospace', fontSize: '1rem', wordBreak: 'break-all', color: 'var(--nb-green-dark)', display: 'block', fontWeight: 800 }}>{createdKey}</code>
                </div>
              )}
            </div>

            <div className="nb-card" style={{ overflowX: 'auto', padding: '0' }}>
              <table className="nb-table">
                <thead><tr><th>Prefix</th><th>Owner</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {apiKeys.map((k) => {
                    const pct = Math.min(Math.round((k.usedTokens / k.quota) * 100), 100)
                    return (
                      <tr key={k.id}>
                        <td><code style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{k.keyPrefix}</code></td>
                        <td style={{ color: 'var(--nb-gray)', fontSize: '0.85rem' }}>{k.owner.email}</td>
                        <td>
                          <div style={{ fontSize: '0.8rem', marginBottom: '4px', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                            {k.usedTokens.toLocaleString('en-US')} / {k.quota.toLocaleString('en-US')}
                          </div>
                          <div style={{ background: 'var(--nb-cream)', border: '1px solid var(--nb-black)', borderRadius: '0', height: '6px', width: '100px' }}>
                            <div style={{ height: '100%', background: pct > 80 ? 'var(--nb-red)' : 'var(--nb-green)', width: `${pct}%`, borderRight: '1px solid var(--nb-black)' }} />
                          </div>
                        </td>
                        <td><span className={`nb-badge ${k.enabled ? 'nb-badge-green' : 'nb-badge-red'}`}>{k.enabled ? 'Active' : 'Suspended'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => toggleKey(k.id, k.enabled)} className="nb-btn nb-btn-secondary nb-btn-sm" style={{ gap: '4px' }}>
                              {k.enabled ? <><Ban size={12} /> Suspend</> : <><CheckCircle size={12} /> Enable</>}
                            </button>
                            <button onClick={() => deleteKey(k.id)} className="nb-btn nb-btn-red nb-btn-sm" style={{ gap: '4px' }}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOGS */}
        {tab === 'logs' && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ScrollText size={22} /> Request Logs
            </h1>
            <div className="nb-card" style={{ overflowX: 'auto', padding: '0' }}>
              <table className="nb-table">
                <thead><tr><th>Time</th><th>User</th><th>Provider</th><th>Model</th><th>Tokens</th><th>Latency</th><th>Status</th></tr></thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--nb-gray)', whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleString()}</td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{l.user?.email ?? '—'}</td>
                      <td><span className="nb-badge nb-badge-purple">Provider {l.provider}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--nb-gray)' }}>{l.model}</td>
                      <td style={{ fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{l.totalTokens.toLocaleString('en-US')}</td>
                      <td style={{ fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{l.latencyMs}ms</td>
                      <td><span className={`nb-badge ${l.status === 'success' ? 'nb-badge-green' : 'nb-badge-red'}`}>{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={22} /> Settings
            </h1>

            <div className="nb-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>Router Mode</h2>
              <p style={{ color: 'var(--nb-gray)', fontSize: '0.875rem', marginBottom: '20px', fontWeight: 500 }}>Controls how traffic is distributed across providers.</p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {[
                  { mode: 'round-robin', desc: 'Even distribution' },
                  { mode: 'random', desc: 'Random selection' },
                  { mode: 'priority', desc: 'Priority cascade' },
                ].map(({ mode, desc }) => (
                  <button key={mode} onClick={() => setRouterModeState(mode)} style={{
                    padding: '16px 20px', borderRadius: '0', border: '2px solid',
                    borderColor: 'var(--nb-black)',
                    background: routerModeState === mode ? 'var(--nb-yellow)' : 'var(--nb-white)',
                    color: 'var(--nb-black)',
                    boxShadow: routerModeState === mode ? '4px 4px 0 var(--nb-black)' : 'none',
                    transform: routerModeState === mode ? 'translate(-2px, -2px)' : 'none',
                    cursor: 'pointer', fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize',
                    textAlign: 'left', transition: 'all 0.1s', minWidth: '180px'
                  }}>
                    <div>{mode}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px', fontWeight: 500 }}>{desc}</div>
                  </button>
                ))}
              </div>

              <h2 style={{ fontWeight: 800, marginBottom: '16px' }}>Maintenance Mode</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
                <button onClick={() => setMaintenance(!maintenance)} style={{
                  width: '48px', height: '28px', borderRadius: '0', border: '2px solid var(--nb-black)', cursor: 'pointer',
                  background: maintenance ? 'var(--nb-red)' : 'var(--nb-white)', position: 'relative',
                  transition: 'background 0.1s', flexShrink: 0,
                  boxShadow: '2px 2px 0 var(--nb-black)'
                }}>
                  <span style={{
                    position: 'absolute', top: '1px', left: maintenance ? '21px' : '1px',
                    width: '22px', height: '22px', background: 'var(--nb-black)',
                    transition: 'left 0.1s',
                  }} />
                </button>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: maintenance ? 'var(--nb-red)' : 'var(--nb-black)' }}>
                    {maintenance ? <><ShieldAlert size={16} /> Maintenance is ON</> : 'Maintenance is OFF'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--nb-gray)', fontWeight: 500, marginTop: '4px' }}>When ON, all API calls return 503 Service Unavailable</div>
                </div>
              </div>

              <button onClick={saveConfig} className="nb-btn nb-btn-primary" style={{ gap: '6px' }}>
                <CheckCircle size={16} /> Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
