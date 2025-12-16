import { useState, useEffect } from 'react'
import './CustomCursor.css'

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [outlinePosition, setOutlinePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, .hoverable')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  useEffect(() => {
    const animate = () => {
      setCursorPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.9,
        y: prev.y + (mousePosition.y - prev.y) * 0.9
      }))

      setOutlinePosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.15,
        y: prev.y + (mousePosition.y - prev.y) * 0.15
      }))

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [mousePosition])

  if (window.innerWidth <= 1024) return null

  return (
    <>
      <div
        className="cursor-dot"
        style={{
          transform: `translate(${cursorPosition.x}px, ${cursorPosition.y}px)`
        }}
      />
      <div
        className={`cursor-outline ${isHovering ? 'hover' : ''}`}
        style={{
          transform: `translate(${outlinePosition.x}px, ${outlinePosition.y}px)`
        }}
      />
    </>
  )
}

export default CustomCursor


