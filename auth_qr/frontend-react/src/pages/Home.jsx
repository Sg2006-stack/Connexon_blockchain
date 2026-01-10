import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QrCode, Shield, UserPlus, Users, Scan, MapPin, ArrowRight, Sparkles } from 'lucide-react'
import './Home.css'

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const features = [
    { icon: UserPlus, title: 'Register', desc: 'Create your secure profile with verified identity documents' },
    { icon: QrCode, title: 'Get QR Code', desc: 'Receive a unique encrypted QR code linked to your identity' },
    { icon: Shield, title: 'Stay Safe', desc: 'Authorities can verify your identity instantly in emergencies' },
  ]

  const stats = [
    { icon: Users, value: '10,000+', label: 'Registered Users' },
    { icon: Scan, value: '25,000+', label: 'QR Verifications' },
    { icon: MapPin, value: '50+', label: 'Cities Covered' },
  ]

  return (
    <div className="home">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <motion.div 
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="hero-badge">
            <Sparkles size={16} />
            <span>Women Safety Platform</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants}>
            Your Safety,{' '}
            <span className="gradient-text">Our Priority</span>
          </motion.h1>
          
          <motion.p variants={itemVariants}>
            Abhaya provides secure QR-based identification for women's safety. 
            Register once, stay protected everywhere.
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-buttons">
            <Link to="/user" className="btn btn-primary">
              Get Started <ArrowRight size={20} />
            </Link>
            <a href="#features" className="btn btn-outline">
              Learn More
            </a>
          </motion.div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="qr-showcase">
            <motion.div 
              className="qr-icon-wrapper"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <QrCode size={100} className="qr-icon" />
            </motion.div>
            <div className="floating-elements">
              <motion.div 
                className="floating-shield"
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Shield size={32} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">How It Works</h2>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <motion.div 
                className="feature-icon"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon size={32} />
              </motion.div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portals Section */}
      <section className="portals-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Choose Your <span className="gradient-text">Portal</span>
        </motion.h2>

        <div className="portals-grid">
          <motion.div
            className="portal-card user-card"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <div className="portal-icon">
              <Shield size={48} />
            </div>
            <h3>User Portal</h3>
            <p>Register yourself and get your secure QR code for identity verification</p>
            <ul className="portal-features">
              <li>✓ Quick Registration</li>
              <li>✓ Instant QR Generation</li>
              <li>✓ Secure Identity</li>
            </ul>
            <Link to="/user" className="btn btn-primary btn-full">
              Enter User Portal <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            className="portal-card admin-card"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <div className="portal-icon admin-icon">
              <Scan size={48} />
            </div>
            <h3>Admin Portal</h3>
            <p>Verify user identities and manage the safety network</p>
            <ul className="portal-features">
              <li>✓ Admin Authentication</li>
              <li>✓ QR Verification</li>
              <li>✓ User Data Access</li>
            </ul>
            <Link to="/admin" className="btn btn-outline btn-full">
              Enter Admin Portal <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stat-card"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <stat.icon className="stat-icon" size={36} />
              <h4>{stat.value}</h4>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Shield className="footer-icon" />
            <span>Abhaya</span>
          </div>
          <p>© 2026 Abhaya - Women Safety Initiative. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
