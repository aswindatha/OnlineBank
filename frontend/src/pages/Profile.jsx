import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Lock, Palette, Save, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { accountApi } from '../api/account'
import { Card, CardBody, CardHeader, CardTitle, Button, Avatar, Badge, Spinner } from '../components/ui'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [account, setAccount] = useState(null)
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '' })
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || '#4f46e5')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingColor, setSavingColor] = useState(false)

  useEffect(() => {
    accountApi.getAccount().then((res) => setAccount(res.data))
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await accountApi.updateProfile(profileForm)
      updateUser(res.data)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await accountApi.changePassword(passwordForm)
      toast.success('Password changed successfully')
      setPasswordForm({ old_password: '', new_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleColorSave = async () => {
    setSavingColor(true)
    try {
      await accountApi.updateAvatarColor(avatarColor)
      updateUser({ ...user, avatar_color: avatarColor })
      toast.success('Avatar color updated')
    } catch (err) {
      toast.error('Failed to update avatar color')
    } finally {
      setSavingColor(false)
    }
  }

  const colorOptions = ['#4f46e5', '#1a237e', '#1565c0', '#2e7d32', '#6a1b9a', '#e65100', '#00695c', '#ad1457', '#c2185b', '#00838f']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {/* Profile header card */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar name={user?.full_name} color={avatarColor} size={80} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.full_name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</p>
              <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant={user?.role === 'admin' ? 'error' : 'info'}>{user?.role}</Badge>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
            {account && (
              <div className="text-center sm:text-right space-y-1">
                <div>
                  <p className="text-xs text-slate-400">Account Number</p>
                  <p className="font-mono font-semibold text-slate-700 dark:text-slate-200">{account.account_number}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">IFSC Code</p>
                  <p className="font-mono font-semibold text-slate-700 dark:text-slate-200">{account.ifsc}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Branch</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{account.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Member since</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{account.created_at?.split(' ')[0]}</p>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit profile */}
        <Card>
          <CardHeader>
            <CardTitle><User size={18} className="inline mr-2" />Edit Profile</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} className="input-field pl-11" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="input-field pl-11" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="input-field pl-11" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <textarea value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="input-field pl-11 resize-none" rows={2} required />
                </div>
              </div>
              <Button type="submit" disabled={savingProfile} className="w-full">
                {savingProfile ? <Spinner size={18} /> : <><Save size={18} />Save Changes</>}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle><Lock size={18} className="inline mr-2" />Change Password</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePasswordSave} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Current Password</label>
                  <input type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} className="input-field" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">New Password</label>
                  <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="input-field" required minLength={4} />
                </div>
                <Button type="submit" variant="secondary" disabled={savingPassword} className="w-full">
                  {savingPassword ? <Spinner size={18} /> : 'Update Password'}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Avatar color */}
          <Card>
            <CardHeader>
              <CardTitle><Palette size={18} className="inline mr-2" />Avatar Color</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2 mb-4">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setAvatarColor(color)}
                    className={`w-10 h-10 rounded-full transition-all ${avatarColor === color ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-primary-400 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  >
                    {avatarColor === color && <CheckCircle size={18} className="text-white mx-auto" />}
                  </button>
                ))}
              </div>
              <Button variant="secondary" onClick={handleColorSave} disabled={savingColor} className="w-full">
                {savingColor ? <Spinner size={18} /> : 'Apply Color'}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
