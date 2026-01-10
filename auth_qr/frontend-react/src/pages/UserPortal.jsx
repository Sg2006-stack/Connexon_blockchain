import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, CreditCard, FileText, Shield, QrCode, Download, Copy, Check, Loader2, X, LogIn, UserPlus, LogOut } from 'lucide-react'
import axios from 'axios'
import './UserPortal.css'

const API_BASE = 'http://127.0.0.1:8000'

const UserPortal = () => {
  const [activeTab, setActiveTab] = useState('login') // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    voter_id: '',
    pan_id: ''
  })
  const [loginData, setLoginData] = useState({
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [qrData, setQrData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post(`${API_BASE}/user/login`, loginData)
      setLoggedInUser(response.data.user)
      setResult({ type: 'success', message: 'Login successful!' })
      setLoginData({ email: '', phone: '' })
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.detail || 'Login failed. Please check your credentials.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post(`${API_BASE}/user/register`, formData)
      setQrData(response.data)
      setShowModal(true)
      setFormData({ name: '', email: '', phone: '', voter_id: '', pan_id: '' })
      setResult({ type: 'success', message: 'Registration successful!' })
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.detail || 'Registration failed. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || qrData?.encrypted_qr || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputFields = [
    { name: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Enter your full name' },
    { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'Enter your email' },
    { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: 'Enter your phone number' },
    { name: 'voter_id', label: 'Voter ID', icon: FileText, type: 'text', placeholder: 'Enter your Voter ID' },
    { name: 'pan_id', label: 'PAN ID', icon: CreditCard, type: 'text', placeholder: 'Enter your PAN ID' },
  ]

  // User Dashboard Component
  const UserDashboard = () => (
    <motion.div
      className="user-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <div className="user-avatar">
          <User size={48} />
        </div>
        <div className="user-welcome">
          <h2>Welcome back, <span className="gradient-text">{loggedInUser.name}</span></h2>
          <p>Here's your secure identity information</p>
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

      <div className="dashboard-content">
        {/* QR Code Section */}
        <motion.div
          className="qr-section"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3><QrCode size={24} /> Your QR Code</h3>
          <div className="qr-display-large">
            {loggedInUser.qr_path || loggedInUser.encrypted_qr ? (
              <img 
                src={loggedInUser.qr_path ? `${API_BASE}/qr/${loggedInUser.qr_path.split('/').pop()}` : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(loggedInUser.encrypted_qr)}`} 
                alt="Your QR Code" 
              />
            ) : (
              <div className="qr-placeholder">
                <QrCode size={100} />
                <p>QR Code Available</p>
              </div>
            )}
          </div>
          <div className="qr-actions">
            {(loggedInUser.qr_path || loggedInUser.encrypted_qr) && (
              <a
                href={loggedInUser.qr_path ? `${API_BASE}/qr/${loggedInUser.qr_path.split('/').pop()}` : `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(loggedInUser.encrypted_qr)}`}
                download="abhaya-qr.png"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={18} />
                Download QR
              </a>
            )}
            <button className="btn btn-outline" onClick={() => copyToClipboard(loggedInUser.encrypted_qr)}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Data'}
            </button>
          </div>
        </motion.div>

        {/* User Info Section */}
        <motion.div
          className="info-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3><Shield size={24} /> Your Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <User size={20} />
              <div>
                <label>Full Name</label>
                <span>{loggedInUser.name}</span>
              </div>
            </div>
            <div className="info-item">
              <Mail size={20} />
              <div>
                <label>Email</label>
                <span>{loggedInUser.email}</span>
              </div>
            </div>
            <div className="info-item">
              <Phone size={20} />
              <div>
                <label>Phone</label>
                <span>{loggedInUser.phone}</span>
              </div>
            </div>
            <div className="info-item">
              <FileText size={20} />
              <div>
                <label>Voter ID</label>
                <span>{loggedInUser.voter_id}</span>
              </div>
            </div>
            <div className="info-item">
              <CreditCard size={20} />
              <div>
                <label>PAN ID</label>
                <span>{loggedInUser.pan_id}</span>
              </div>
            </div>
          </div>

          <div className="encrypted-section">
            <label>Encrypted QR Data:</label>
            <textarea readOnly value={loggedInUser.encrypted_qr || ''} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <div className="user-portal">
      {/* Background Animation */}
      <div className="bg-particles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [-20, -100],
              x: Math.random() * 40 - 20
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.section 
        className="portal-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <Shield className="header-icon" size={56} />
        </motion.div>
        <h1><span className="gradient-text">User Portal</span></h1>
        <p>{loggedInUser ? 'View your profile and secure QR code' : 'Login or register to get your secure QR code'}</p>
      </motion.section>

      {/* Main Content */}
      <section className="portal-content">
        {loggedInUser ? (
          <UserDashboard />
        ) : (
          <>
            <motion.div 
              className="form-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Tab Switcher */}
              <div className="tab-switcher">
                <button
                  className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('login'); setResult(null); }}
                >
                  <LogIn size={18} />
                  Login
                </button>
                <button
                  className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('register'); setResult(null); }}
                >
                  <UserPlus size={18} />
                  Register
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="form-header">
                      <LogIn className="form-icon" />
                      <h2>User Login</h2>
                    </div>
                    <p className="form-description">
                      Login with your registered email and phone number to access your QR code.
                    </p>

                    <form onSubmit={handleLogin}>
                      <div className="form-grid login-grid">
                        <motion.div
                          className="form-group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label>
                            <Mail size={18} />
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            placeholder="Enter your registered email"
                            required
                          />
                        </motion.div>
                        <motion.div
                          className="form-group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label>
                            <Phone size={18} />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={loginData.phone}
                            onChange={handleLoginChange}
                            placeholder="Enter your registered phone"
                            required
                          />
                        </motion.div>
                      </div>

                      <motion.button
                        type="submit"
                        className="btn btn-primary btn-full submit-btn"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="spin" size={20} />
                            Logging in...
                          </>
                        ) : (
                          <>
                            <LogIn size={20} />
                            Login
                          </>
                        )}
                      </motion.button>
                    </form>

                    <p className="switch-text">
                      Don't have an account?{' '}
                      <button onClick={() => setActiveTab('register')}>Register here</button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="form-header">
                      <QrCode className="form-icon" />
                      <h2>User Registration</h2>
                    </div>
                    <p className="form-description">
                      Fill in your details to generate your secure QR code. Your information is encrypted and protected.
                    </p>

                    <form onSubmit={handleSubmit}>
                      <div className="form-grid">
                        {inputFields.map((field, index) => (
                          <motion.div
                            key={field.name}
                            className="form-group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                          >
                            <label>
                              <field.icon size={18} />
                              {field.label}
                            </label>
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              placeholder={field.placeholder}
                              required
                            />
                          </motion.div>
                        ))}
                      </div>

                      <motion.button
                        type="submit"
                        className="btn btn-primary btn-full submit-btn"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="spin" size={20} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <QrCode size={20} />
                            Register & Generate QR Code
                          </>
                        )}
                      </motion.button>
                    </form>

                    <p className="switch-text">
                      Already registered?{' '}
                      <button onClick={() => setActiveTab('login')}>Login here</button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

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

            {/* Info Cards */}
            <div className="info-cards">
              {[
                { icon: Shield, title: 'Secure & Encrypted', desc: 'Your data is protected with advanced encryption' },
                { icon: QrCode, title: 'Instant QR', desc: 'Get your QR code immediately after registration' },
                { icon: Check, title: 'Quick Verification', desc: 'Verify identity in seconds during emergencies' },
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  className="info-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <card.icon className="info-icon" />
                  <h4>{card.title}</h4>
                  <p>{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* QR Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Check className="success-icon" size={64} />
              </motion.div>

              <h2>Registration <span className="gradient-text">Successful!</span></h2>

              <div className="qr-display">
                {qrData?.qr_path ? (
                  <img src={`${API_BASE}/qr/${qrData.qr_path.split('/').pop()}`} alt="Your QR Code" />
                ) : qrData?.encrypted_qr ? (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.encrypted_qr)}`} alt="Your QR Code" />
                ) : (
                  <div className="qr-placeholder">
                    <QrCode size={80} />
                    <p>QR code generated</p>
                  </div>
                )}
              </div>

              <p className="modal-description">
                Save this QR code. It's your secure identity verification.
              </p>

              <div className="modal-actions">
                {(qrData?.qr_path || qrData?.encrypted_qr) && (
                  <a
                    href={qrData?.qr_path ? `${API_BASE}/qr/${qrData.qr_path.split('/').pop()}` : `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData.encrypted_qr)}`}
                    download="abhaya-qr.png"
                    className="btn btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download size={18} />
                    Download QR
                  </a>
                )}
                <button className="btn btn-outline" onClick={() => copyToClipboard(qrData?.encrypted_qr)}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Data'}
                </button>
              </div>

              <div className="encrypted-data">
                <label>Encrypted QR Data:</label>
                <textarea readOnly value={qrData?.encrypted_qr || ''} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserPortal
