import { useState } from 'react'
import { motion } from 'framer-motion'
import './GlitchText.css'

const GlitchText = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [displayText, setDisplayText] = useState(['BRAHMA', '26'])
  const originalText = ['BRAHMA', '26']

  const handleHover = () => {
    if (isHovering) return
    setIsHovering(true)

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    originalText.forEach((word, wordIndex) => {
      let iterations = 0

      const interval = setInterval(() => {
        setDisplayText(prev => {
          const newText = [...prev]
          newText[wordIndex] = word
            .split('')
            .map((char, index) => {
              if (index < iterations) {
                return word[index]
              }
              return letters[Math.floor(Math.random() * letters.length)]
            })
            .join('')
          return newText
        })

        iterations += 1 / 3

        if (iterations >= word.length) {
          clearInterval(interval)
          setDisplayText(prev => {
            const newText = [...prev]
            newText[wordIndex] = word
            return newText
          })
          if (wordIndex === originalText.length - 1) {
            setTimeout(() => setIsHovering(false), 500)
          }
        }
      }, 30)
    })
  }

  return (
    <h1
      className="glitch-title hoverable"
      onMouseEnter={handleHover}
    >
      <div className="title-line">
        <motion.span
          className="word-wrapper highlight"
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <span className="word">{displayText[0]}</span>
        </motion.span>
        <motion.span
          className="word-wrapper highlight"
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <span className="word">{displayText[1]}</span>
        </motion.span>
      </div>
    </h1>
  )
}

export default GlitchText


