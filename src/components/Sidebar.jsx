import { motion } from 'framer-motion'
import './Sidebar.css'

const Sidebar = () => {
  return (
    <motion.aside
      className="sidebar"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <span className="sidebar-text">2026</span>
    </motion.aside>
  )
}

export default Sidebar

