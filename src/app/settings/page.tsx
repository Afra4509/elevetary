'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, UserIcon, LockIcon, KeyIcon, BellIcon, InfoIcon } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Tab = 'profile' | 'password' | 'api' | 'notifications'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [name, setName] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)
  const { success, error } = useToast()

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        success('Profile updated successfully!')
      } else {
        const d = await res.json()
        error(d.error ?? 'Failed to update profile')
      }
    } catch {
      error('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { error('Passwords do not match'); return }
    if (newPw.length < 8) { error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      if (res.ok) {
        success('Password changed successfully!')
        setCurrentPw(''); setNewPw(''); setConfirmPw('')
      } else {
        const d = await res.json()
        error(d.error ?? 'Failed to change password')
      }
    } catch {
      error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'profile',       label: 'Profile',       Icon: UserIcon },
    { id: 'password',      label: 'Password',      Icon: LockIcon },
    { id: 'api',           label: 'API',           Icon: KeyIcon },
    { id: 'notifications', label: 'Notifications', Icon: BellIcon },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nb-cream)' }}>
      {/* Topbar */}
      <div style={{
        background: 'var(--nb-black)', borderBottom: '3px solid var(--nb-black)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Link href="/dashboard" className="nb-btn nb-btn-secondary nb-btn-sm"
          style={{ background: '#2A2A2A', color: '#9CA3AF', borderColor: '#3A3A3A' }}>
          <ArrowLeftIcon size={14} /> Dashboard
        </Link>
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 800, fontSize: '1rem', color: 'var(--nb-cream)',
        }}>Settings</span>
      </div>

      <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 24px' }}>
        <div className="nb-mobile-stack" style={{ display: 'flex', gap: 24 }}>
          {/* Tab sidebar */}
          <div className="settings-sidebar" style={{ width: 200, flexShrink: 0 }}>
            <style dangerouslySetInnerHTML={{__html: `
              @media (max-width: 768px) {
                .settings-sidebar {
                  width: 100% !important;
                }
                .settings-tabs {
                  display: flex !important;
                  flex-direction: row !important;
                  overflow-x: auto !important;
                  padding-bottom: 8px !important;
                }
                .settings-tabs > button {
                  white-space: nowrap !important;
                  margin-bottom: 0 !important;
                  margin-right: 8px !important;
                }
              }
            `}} />
            <div className="nb-card settings-tabs" style={{ padding: 8 }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 14px',
                    background: tab === t.id ? 'var(--nb-yellow)' : 'transparent',
                    border: tab === t.id ? '2px solid var(--nb-black)' : '2px solid transparent',
                    borderRadius: 2, cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.875rem',
                    color: 'var(--nb-black)',
                    boxShadow: tab === t.id ? 'var(--nb-shadow-sm)' : 'none',
                    transition: 'all 0.1s',
                    marginBottom: 2,
                  }}
                >
                  <t.Icon size={15} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            {tab === 'profile' && (
              <div className="nb-card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>Profile</h2>
                <p style={{ color: 'var(--nb-gray)', fontSize: '0.875rem', marginBottom: 24 }}>Update your display name and account info</p>
                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="nb-label">Display Name</label>
                    <input className="nb-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <button type="submit" disabled={saving} className="nb-btn nb-btn-primary" style={{ alignSelf: 'flex-start' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'password' && (
              <div className="nb-card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>Change Password</h2>
                <p style={{ color: 'var(--nb-gray)', fontSize: '0.875rem', marginBottom: 24 }}>Choose a strong password of at least 8 characters</p>
                <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Current Password', val: currentPw, set: setCurrentPw, id: 'current-pw' },
                    { label: 'New Password',      val: newPw,    set: setNewPw,    id: 'new-pw' },
                    { label: 'Confirm Password',  val: confirmPw, set: setConfirmPw, id: 'confirm-pw' },
                  ].map(f => (
                    <div key={f.id}>
                      <label className="nb-label">{f.label}</label>
                      <input id={f.id} type="password" className="nb-input" placeholder="••••••••" value={f.val} onChange={e => f.set(e.target.value)} required />
                    </div>
                  ))}
                  <button type="submit" disabled={saving} className="nb-btn nb-btn-danger" style={{ alignSelf: 'flex-start' }}>
                    {saving ? 'Saving...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'api' && (
              <div className="nb-card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>API Settings</h2>
                <p style={{ color: 'var(--nb-gray)', fontSize: '0.875rem', marginBottom: 24 }}>Manage your API key preferences</p>
                <div style={{
                  padding: '16px', background: '#FFF8E0',
                  border: '2px solid var(--nb-yellow-dark)', borderRadius: 4, marginBottom: 20,
                }}>
                  <p style={{ fontSize: '0.875rem', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <KeyIcon size={16} style={{ flexShrink: 0, marginTop: 2 }} /> API key management is available in the <Link href="/dashboard" style={{ color: 'var(--nb-blue)', textDecoration: 'none', fontWeight: 700 }}>Dashboard</Link>.
                    Contact your admin to create, regenerate, or delete keys.
                  </p>
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--nb-gray)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
                    Base URL: <code style={{ fontFamily: 'JetBrains Mono, monospace', background: '#F5F0E8', padding: '2px 8px', border: '1px solid #E5D9C0', borderRadius: 2 }}>
                      {process.env.NEXT_PUBLIC_APP_URL ?? 'https://api.aeferalow.my.id'}/v1
                    </code>
                  </p>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="nb-card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>Notifications</h2>
                <p style={{ color: 'var(--nb-gray)', fontSize: '0.875rem', marginBottom: 24 }}>Configure when you want to be notified</p>
                <div className="nb-empty-state">
                  <div className="nb-empty-state-icon">
                    <BellIcon size={36} color="var(--nb-blue)" />
                  </div>
                  <div className="nb-empty-state-title">Coming Soon</div>
                  <p style={{ fontSize: '0.875rem' }}>Email notifications will be available in the next update.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
