import { useState } from 'react'
import { motion } from 'framer-motion'
import './NotifyForm.css'

const NotifyForm = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      setMessageType('error')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      // Check localStorage for existing subscribers
      const subscribers = JSON.parse(localStorage.getItem('brahma26_subscribers') || '[]')

      if (subscribers.includes(email)) {
        setMessage("You're already on the list!")
        setMessageType('')
      } else {
        subscribers.push(email)
        localStorage.setItem('brahma26_subscribers', JSON.stringify(subscribers))
        setMessage("Perfect! You'll be the first to know when we launch.")
        setMessageType('success')
        setEmail('')
      }

      setIsSubmitting(false)

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 5000)
    }, 1500)
  }

  return (
    <motion.div
      className="notify-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <form className="notify-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email to get notified"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
        />
        <button type="submit" className="notify-btn hoverable" disabled={isSubmitting}>
          <span className="btn-text">
            {isSubmitting ? 'Subscribing...' : 'Notify Me'}
          </span>
          <span className="btn-hover"></span>
        </button>
      </form>
      {message && (
        <motion.p
          className={`notify-message ${messageType}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  )
}

export default NotifyForm

