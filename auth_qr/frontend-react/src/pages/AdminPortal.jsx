import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, User, Mail, Lock, LogIn, UserPlus, QrCode, Check, X, Loader2, LogOut, Clock, Shield, AlertTriangle, MapPin, Phone, Image, Mic, Calendar, Heart, Activity } from 'lucide-react'
import axios from 'axios'
import './AdminPortal.css'

const API_BASE = 'http://127.0.0.1:8000'
const SUPABASE_STORAGE_URL = 'https://uivbyjeopvtzkhabqarp.supabase.co/storage/v1/object/public/sos-media'
const THINGSPEAK_CHANNEL_ID = '3224774'
const THINGSPEAK_API_KEY = 'GFPRMB5L06IF4JT5'

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [verifyCount, setVerifyCount] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  const [verifiedUser, setVerifiedUser] = useState(null)
  const [emergencyAlerts, setEmergencyAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [vitalSigns, setVitalSigns] = useState({ bp: null, oxygen: null, lastUpdated: null })

  // Login Form
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  // Register Form
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' })
  // Verify Form
  const [encryptedQR, setEncryptedQR] = useState('')

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true)
      fetchEmergencyAlerts()
      fetchVitalSigns()
    }
  }, [token])

  useEffect(() => {
    let interval
    if (isLoggedIn) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
        fetchEmergencyAlerts() // Refresh alerts every second
        fetchVitalSigns() // Refresh vital signs every second
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isLoggedIn])

  // Fetch vital signs from ThingSpeak
  const fetchVitalSigns = async () => {
    try {
      const response = await axios.get(
        `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=1`
      )
      const feeds = response.data.feeds
      if (feeds && feeds.length > 0) {
        const latestFeed = feeds[0]
        setVitalSigns({
          bp: latestFeed.field1 || null, // Assuming field1 is BP
          oxygen: latestFeed.field2 || null, // Assuming field2 is Oxygen
          heartRate: latestFeed.field3 || null, // Optional: field3 for heart rate
          lastUpdated: latestFeed.created_at
        })
      }
    } catch (error) {
      console.error('Error fetching vital signs from ThingSpeak:', error)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post(`${API_BASE}/admin/login`, loginData)
      const newToken = response.data.access_token
      setToken(newToken)
      localStorage.setItem('adminToken', newToken)
      setIsLoggedIn(true)
      setLoginData({ username: '', password: '' })
      setResult({ type: 'success', message: 'Login successful!' })
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.detail || 'Login failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      await axios.post(`${API_BASE}/admin/register`, registerData)
      setResult({ type: 'success', message: 'Registration successful! You can now login.' })
      setRegisterData({ username: '', email: '', password: '' })
      setTimeout(() => setActiveTab('login'), 2000)
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.detail || 'Registration failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setVerifiedUser(null)

    try {
      const response = await axios.post(
        `${API_BASE}/admin/verify-qr`,
        { encrypted_qr: encryptedQR },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setVerifiedUser(response.data.user_data)
      setVerifyCount(prev => prev + 1)
      setResult({ type: 'success', message: 'Identity verified successfully!' })
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout()
        setResult({ type: 'error', message: 'Session expired. Please login again.' })
      } else {
        setResult({
          type: 'error',
          message: error.response?.data?.detail || 'Verification failed'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('adminToken')
    setIsLoggedIn(false)
    setSessionTime(0)
    setVerifyCount(0)
    setVerifiedUser(null)
    setEncryptedQR('')
    setResult(null)
    setEmergencyAlerts([])
  }

  const fetchEmergencyAlerts = async () => {
    if (!token) return
    
    try {
      const response = await axios.get(`${API_BASE}/admin/emergency-alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Emergency alerts response:', response.data) // Debug log
      const alerts = response.data.alerts || []
      setEmergencyAlerts(alerts)
    } catch (error) {
      console.error('Error fetching alerts:', error) // Debug log
      if (error.response?.status === 401) {
        handleLogout()
      }
    }
  }

  const resolveAlert = async (alertId) => {
    try {
      await axios.post(
        `${API_BASE}/admin/emergency-alerts/${alertId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchEmergencyAlerts()
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="admin-portal">
      {/* Background */}
      <div className="admin-bg">
        <div className="grid-overlay"></div>
      </div>

      {/* Header */}
      <motion.section 
        className="portal-header admin-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <Scan className="header-icon admin-icon-color" size={64} />
        </motion.div>
        <h1 className="admin-title">Admin Portal</h1>
        <p>Manage and verify user identities securely</p>
      </motion.section>

      {/* Main Content */}
      <section className="portal-content">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="auth-section"
            >
              {/* Tabs */}
              <div className="auth-tabs">
                <motion.button
                  className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('login'); setResult(null) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn size={18} />
                  Login
                </motion.button>
                <motion.button
                  className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('register'); setResult(null) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus size={18} />
                  Register
                </motion.button>
              </div>

              {/* Login Form */}
              <AnimatePresence mode="wait">
                {activeTab === 'login' && (
                  <motion.div
                    key="login"
                    className="form-container"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2><LogIn size={24} /> Admin Login</h2>
                    <form onSubmit={handleLogin}>
                      <div className="form-group">
                        <label><User size={18} /> Username</label>
                        <input
                          type="text"
                          value={loginData.username}
                          onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                          placeholder="Enter your username"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label><Lock size={18} /> Password</label>
                        <input
                          type="password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                      <motion.button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? <Loader2 className="spin" size={20} /> : <LogIn size={20} />}
                        {loading ? 'Logging in...' : 'Login'}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'register' && (
                  <motion.div
                    key="register"
                    className="form-container"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2><UserPlus size={24} /> Admin Registration</h2>
                    <form onSubmit={handleRegister}>
                      <div className="form-group">
                        <label><User size={18} /> Username</label>
                        <input
                          type="text"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                          placeholder="Choose a username"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label><Mail size={18} /> Email</label>
                        <input
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label><Lock size={18} /> Password</label>
                        <input
                          type="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          placeholder="Choose a strong password"
                          required
                        />
                      </div>
                      <motion.button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? <Loader2 className="spin" size={20} /> : <UserPlus size={20} />}
                        {loading ? 'Registering...' : 'Register'}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    className={`result-box ${result.type}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {result.type === 'success' ? <Check size={20} /> : <X size={20} />}
                    {result.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="dashboard-section"
            >
              {/* Dashboard Header */}
              <div className="dashboard-header">
                <div className="dashboard-title">
                  <h2><Shield size={28} /> Admin Dashboard</h2>
                  <p>Welcome back! Verify user identities and monitor emergency alerts.</p>
                </div>
                <motion.button
                  className="btn btn-outline logout-btn"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={18} />
                  Logout
                </motion.button>
              </div>

              <div className="dashboard-layout">
                {/* Main Content */}
                <div className="main-dashboard">
                  {/* Stats */}
                  <div className="stats-row">
                    <motion.div 
                      className="stat-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <QrCode className="stat-icon" />
                      <div>
                        <h4>Verifications</h4>
                        <p>{verifyCount}</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="stat-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Clock className="stat-icon" />
                      <div>
                        <h4>Session Time</h4>
                        <p>{formatTime(sessionTime)}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Verify Form */}
                  <motion.div 
                    className="form-container verify-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3><Scan size={24} /> Verify QR Code</h3>
                    <p className="form-description">Paste the encrypted QR data to verify a user's identity</p>
                    <form onSubmit={handleVerify}>
                      <div className="form-group">
                        <label><QrCode size={18} /> Encrypted QR Data</label>
                        <textarea
                          value={encryptedQR}
                          onChange={(e) => setEncryptedQR(e.target.value)}
                          placeholder="Paste the encrypted QR data here..."
                          rows={4}
                          required
                        />
                      </div>
                      <motion.button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? <Loader2 className="spin" size={20} /> : <Scan size={20} />}
                        {loading ? 'Verifying...' : 'Verify Identity'}
                      </motion.button>
                    </form>

                    <AnimatePresence>
                      {result && (
                        <motion.div
                          className={`result-box ${result.type}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {result.type === 'success' ? <Check size={20} /> : <X size={20} />}
                          {result.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Verified User */}
                  <AnimatePresence>
                    {verifiedUser && (
                      <motion.div
                        className="verified-user-card"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <div className="verified-header">
                          <Check className="verified-icon" />
                          <h3>Identity Verified</h3>
                          <span className="status-badge">VALID</span>
                        </div>
                        <div className="user-details">
                          {[
                            { icon: User, label: 'Name', value: verifiedUser.name },
                            { icon: Mail, label: 'Email', value: verifiedUser.email },
                            { icon: Shield, label: 'Phone', value: verifiedUser.phone },
                            { icon: Shield, label: 'Voter ID', value: verifiedUser.voter_id },
                            { icon: Shield, label: 'PAN ID', value: verifiedUser.pan_id },
                          ].map((item, index) => (
                            <motion.div
                              key={item.label}
                              className="detail-row"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <span className="detail-label">
                                <item.icon size={16} />
                                {item.label}
                              </span>
                              <span className="detail-value">{item.value}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Emergency Alerts Sidebar */}
                <motion.div
                  className="emergency-sidebar"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="sidebar-header">
                    <AlertTriangle size={24} />
                    <h3>Emergency Alerts</h3>
                    <span className="alert-count">{emergencyAlerts.filter(a => !a.resolved).length}</span>
                  </div>

                  <div className="alerts-container">
                    {!verifiedUser ? (
                      <div className="alerts-locked">
                        <div className="lock-icon">
                          <Shield size={48} />
                        </div>
                        <h4>Identity Verification Required</h4>
                        <p>Please verify a user's identity using their encrypted QR data to access emergency alerts and sensitive information.</p>
                        <div className="lock-steps">
                          <div className="step">
                            <span className="step-num">1</span>
                            <span>Scan user's QR code</span>
                          </div>
                          <div className="step">
                            <span className="step-num">2</span>
                            <span>Paste encrypted data</span>
                          </div>
                          <div className="step">
                            <span className="step-num">3</span>
                            <span>Click "Verify Identity"</span>
                          </div>
                        </div>
                      </div>
                    ) : emergencyAlerts.length === 0 ? (
                      <div className="no-alerts">
                        <Shield size={48} opacity={0.3} />
                        <p>No emergency alerts</p>
                      </div>
                    ) : (
                      emergencyAlerts.map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          className={`alert-card ${alert.resolved ? 'resolved' : 'active'}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="alert-header">
                            <div className="alert-user">
                              <User size={16} />
                              <span>{alert.user_name}</span>
                            </div>
                            {!alert.resolved && (
                              <motion.button
                                className="resolve-btn"
                                onClick={() => resolveAlert(alert.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Check size={14} />
                              </motion.button>
                            )}
                          </div>

                          <div className="alert-time">
                            <Calendar size={14} />
                            <span>{formatTimestamp(alert.created_at)}</span>
                          </div>

                          <div className="alert-location">
                            <MapPin size={16} />
                            <a
                              href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                            </a>
                          </div>

                          <div className="alert-contact">
                            <Phone size={14} />
                            <span>{verifiedUser?.phone || alert.user_phone || 'N/A'}</span>
                          </div>

                          {/* Vital Signs from ThingSpeak */}
                          <div className="vital-signs">
                            <div className="vital-item bp">
                              <Heart size={16} />
                              <div className="vital-info">
                                <span className="vital-label">Blood Pressure</span>
                                <span className="vital-value">{vitalSigns.bp || 'N/A'} mmHg</span>
                              </div>
                            </div>
                            <div className="vital-item oxygen">
                              <Activity size={16} />
                              <div className="vital-info">
                                <span className="vital-label">Oxygen Level</span>
                                <span className="vital-value">{vitalSigns.oxygen || 'N/A'}%</span>
                              </div>
                            </div>
                            {vitalSigns.lastUpdated && (
                              <div className="vital-updated">
                                <Clock size={12} />
                                <span>Updated: {formatTimestamp(vitalSigns.lastUpdated)}</span>
                              </div>
                            )}
                          </div>

                          {alert.message && (
                            <div className="alert-message">
                              <p>{alert.message}</p>
                            </div>
                          )}

                          <div className="alert-media">
                            {alert.photo_url && (
                              <div className="media-item">
                                <Image size={16} />
                                <a
                                  href={`${SUPABASE_STORAGE_URL}/${alert.photo_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={`${SUPABASE_STORAGE_URL}/${alert.photo_url}`}
                                    alt="Emergency"
                                  />
                                </a>
                              </div>
                            )}
                            {alert.audio_url && (
                              <div className="media-item audio-item">
                                <Mic size={16} />
                                <audio controls>
                                  <source src={`${SUPABASE_STORAGE_URL}/${alert.audio_url}`} type="audio/mpeg" />
                                </audio>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}

export default AdminPortal
