import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/user', label: 'User Portal' },
    { path: '/admin', label: 'Admin Portal' },
  ]

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <Link to="/" className="nav-brand">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Shield className="brand-icon" />
        </motion.div>
        <span>Abhaya</span>
      </Link>

      <div className={`nav-links ${isOpen ? 'active' : ''}`}>
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.div
                  className="nav-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>
    </motion.nav>
  )
}

export default Navbar
