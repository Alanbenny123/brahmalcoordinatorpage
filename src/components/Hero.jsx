import { useState } from 'react'
import { motion } from 'framer-motion'
import ParticleCanvas from './ParticleCanvas'
import GlitchText from './GlitchText'
import Countdown from './Countdown'
import NotifyForm from './NotifyForm'
import './Hero.css'

const Hero = () => {
  return (
    <section className="hero">
      <ParticleCanvas />
      <div className="hero-bg-gradient"></div>
      <div className="noise-overlay"></div>

      <div className="hero-content">
        <motion.div
          className="coming-soon-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span>Coming Soon</span>
        </motion.div>

        <div className="hero-text-container">
          <GlitchText />
        </div>

        <motion.div
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <p>Something Extraordinary Is Coming</p>
        </motion.div>

        <Countdown />
        <NotifyForm />
      </div>

      <motion.div
        className="launch-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <span>Launching 2026</span>
      </motion.div>
    </section>
  )
}

export default Hero

