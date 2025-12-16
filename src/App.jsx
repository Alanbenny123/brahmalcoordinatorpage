import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import SocialSidebar from './components/SocialSidebar'
import Sidebar from './components/Sidebar'
import ParticleCanvas from './components/ParticleCanvas'
import ScrollProgress from './components/ScrollProgress'
import AnimatedBackground from './components/AnimatedBackground'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500)
  }, [])

  return (
    <>
      {/* Page Transition */}
      <motion.div
        className="page-transition"
        initial={{ y: 0 }}
        animate={{ y: isLoaded ? '-100%' : 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Custom Cursor */}
      <CustomCursor />

      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Navigation */}
      <Navbar />

      {/* Sidebars */}
      <SocialSidebar />
      <Sidebar />

      {/* Main Content */}
      <main>
        <Hero />
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}

export default App

