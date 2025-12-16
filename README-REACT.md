# BRAHMA 26 - React Version

A modern, high-performance Coming Soon page built with **React 18**, **Vite**, and **Framer Motion**.

![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-purple?style=for-the-badge&logo=vite)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.16-pink?style=for-the-badge)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ✨ Features

### React Architecture
- **Component-Based** - Modular, reusable React components
- **Hooks** - useState, useEffect, useRef, custom hooks
- **Framer Motion** - Smooth, declarative animations
- **Vite** - Lightning-fast HMR and build times

### Key Components

```
src/
├── components/
│   ├── CustomCursor.jsx      # Smooth custom cursor
│   ├── Navbar.jsx             # Animated navigation
│   ├── Hero.jsx               # Main hero section
│   ├── GlitchText.jsx         # BRAHMA 26 glitch effect
│   ├── Countdown.jsx          # Live countdown timer
│   ├── NotifyForm.jsx         # Email subscription
│   ├── ParticleCanvas.jsx     # Canvas particle system
│   ├── About.jsx              # Feature cards
│   ├── Footer.jsx             # Footer links
│   ├── SocialSidebar.jsx      # Social icons
│   ├── Sidebar.jsx            # Right sidebar
│   └── ScrollProgress.jsx     # Progress bar
├── App.jsx                    # Main app component
├── main.jsx                   # React entry point
└── index.css                  # Global styles
```

## 🎨 Animations

### Framer Motion Integration
- **Page transitions** - Smooth entrance/exit
- **Scroll animations** - useInView hook
- **Staggered reveals** - Sequential component mounting
- **Gesture animations** - Hover, tap interactions

### Custom Effects
- **Glitch text** - Character randomization on hover
- **Particle system** - Canvas-based with mouse interaction
- **Cursor tracking** - Smooth following with easing
- **Countdown timer** - Real-time updates

## 🔧 Configuration

### Change Launch Date

Edit `src/components/Countdown.jsx`:

```jsx
const launchDate = new Date('2026-01-01T00:00:00').getTime()
```

### Customize Colors

Edit `src/index.css`:

```css
:root {
  --primary-bg: #000000;
  --secondary-bg: #0a0a0a;
  --text-primary: #ffffff;
  --text-secondary: #888888;
}
```

### Particle Settings

Edit `src/components/ParticleCanvas.jsx`:

```jsx
const particleCount = Math.floor((canvas.width * canvas.height) / 15000)
```

## 📦 Production Build

```bash
# Build optimized bundle
npm run build

# Output in dist/ folder
# Upload to your hosting provider
```

## 🎯 Component Props

### GlitchText
```jsx
<GlitchText />
// No props - self-contained
```

### Countdown
```jsx
<Countdown />
// Automatically calculates from launch date
```

### NotifyForm
```jsx
<NotifyForm />
// Handles email validation and storage
```

## 🔌 Backend Integration

To connect to a real backend API:

Edit `src/components/NotifyForm.jsx`:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    setMessage(data.message)
    setMessageType('success')
  } catch (error) {
    setMessage('Something went wrong')
    setMessageType('error')
  }
}
```

## 🎭 Framer Motion Examples

### Simple Fade In
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
>
  Content
</motion.div>
```

### Scroll-Triggered Animation
```jsx
const ref = useRef(null)
const isInView = useInView(ref, { once: true })

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 50 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
>
  Content
</motion.div>
```

### Staggered Children
```jsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.2 } }
  }}
>
  {items.map(item => (
    <motion.div variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

## 🚀 Performance

- **Code Splitting** - Vite automatic chunking
- **Lazy Loading** - Dynamic imports for heavy components
- **RequestAnimationFrame** - Smooth 60fps animations
- **CSS Transforms** - Hardware acceleration
- **Debounced Handlers** - Optimized scroll/resize

## 📱 Responsive Design

- **Mobile First** - Responsive from 320px+
- **Breakpoints**: 768px (tablet), 1024px (desktop)
- **Touch Optimized** - No cursor on mobile
- **Flexible Grid** - Auto-fit minmax patterns

## 🛠 Development

### File Watching
Vite provides instant HMR - changes reflect immediately

### Component Development
Each component is isolated with its own CSS file

### Debugging
React DevTools compatible for state inspection

## 📊 Bundle Size

Production build is highly optimized:
- **React**: ~42KB (gzipped)
- **Framer Motion**: ~35KB (gzipped)
- **Custom Code**: ~15KB (gzipped)
- **Total**: ~92KB (gzipped)

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

Free to use for personal and commercial projects.

---

**Built with React** ⚛️ **Powered by Vite** ⚡ **Animated with Framer Motion** 🎭

*BRAHMA 26 - Coming Soon 2026*

