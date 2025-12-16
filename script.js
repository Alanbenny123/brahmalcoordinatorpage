// ==================== CUSTOM CURSOR ====================
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let outlineX = 0;
let outlineY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.9;
    cursorY += (mouseY - cursorY) * 0.9;
    
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    
    if (cursorDot) {
        cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    }
    if (cursorOutline) {
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
    }
    
    requestAnimationFrame(animateCursor);
}

if (window.innerWidth > 1024) {
    animateCursor();
}

// Cursor hover effects
const hoverElements = document.querySelectorAll('a, button, .work-item, .lab-item, .blog-post, .skill-item, .nav-link, .nav-icon');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});

// ==================== CANVAS ANIMATION ====================
const canvas = document.getElementById('heroCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (1 - distance / 120) * 0.15;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Mouse interaction
    let mouseParticles = [];
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const angle = Math.atan2(dy, dx);
                const force = (150 - distance) / 150;
                particle.x -= Math.cos(angle) * force * 3;
                particle.y -= Math.sin(angle) * force * 3;
            }
        });
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        connectParticles();

        animationId = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
}

// ==================== PAGE LOAD ANIMATION ====================
const pageTransition = document.querySelector('.page-transition');
window.addEventListener('load', () => {
    setTimeout(() => {
        if (pageTransition) {
            pageTransition.classList.add('active');
        }
    }, 500);
});

// ==================== NAVBAR SCROLL ====================
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 100;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== SCROLL REVEAL ANIMATIONS ====================
const revealObserverOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('active');
            }, index * 100);
            revealObserver.unobserve(entry.target);
        }
    });
}, revealObserverOptions);

document.querySelectorAll('[data-reveal]').forEach(el => {
    revealObserver.observe(el);
});

// Reveal text animation
const revealTextObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealTextObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.reveal-text').forEach(text => {
    revealTextObserver.observe(text);
});

// Fade up elements
const fadeUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            fadeUpObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in-up').forEach(el => {
    fadeUpObserver.observe(el);
});

// ==================== PARALLAX EFFECTS ====================
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    
    // Hero parallax
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle && scrolled < window.innerHeight) {
        heroTitle.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroTitle.style.opacity = 1 - scrolled / 800;
    }
    
    if (heroSubtitle && scrolled < window.innerHeight) {
        heroSubtitle.style.opacity = 1 - scrolled / 600;
    }
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// ==================== 3D TILT EFFECT ====================
const workItems = document.querySelectorAll('.work-item');
workItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        const workImage = item.querySelector('.work-image');
        if (workImage) {
            workImage.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            workImage.style.transition = 'none';
        }
    });
    
    item.addEventListener('mouseleave', () => {
        const workImage = item.querySelector('.work-image');
        if (workImage) {
            workImage.style.transition = 'transform 0.5s ease';
            workImage.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        }
    });
});

// ==================== MAGNETIC BUTTONS ====================
const magneticElements = document.querySelectorAll('.submit-btn, .skill-item');
magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        el.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
    });
    
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
    });
});

// ==================== TEXT GLITCH EFFECT ====================
const words = document.querySelectorAll('.word');
words.forEach(word => {
    word.addEventListener('mouseenter', function() {
        const text = this.textContent;
        let iterations = 0;
        
        const interval = setInterval(() => {
            this.textContent = text
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return text[index];
                    }
                    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
                })
                .join('');
            
            iterations += 1/3;
            
            if (iterations >= text.length) {
                clearInterval(interval);
                this.textContent = text;
            }
        }, 30);
    });
});

// ==================== FORM INTERACTIONS ====================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        submitBtn.style.pointerEvents = 'none';
        btnText.textContent = 'SENDING...';
        
        setTimeout(() => {
            btnText.textContent = 'SENT!';
            submitBtn.style.borderColor = '#4CAF50';
            submitBtn.style.color = '#4CAF50';
            
            contactForm.reset();
            
            setTimeout(() => {
                btnText.textContent = originalText;
                submitBtn.style.borderColor = '';
                submitBtn.style.color = '';
                submitBtn.style.pointerEvents = '';
            }, 3000);
        }, 1500);
    });
}

// ==================== SCROLL PROGRESS ====================
const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.3) 100%);
        width: 0%;
        z-index: 10001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
};

createScrollProgress();

// ==================== ACTIVE SECTION HIGHLIGHTING ====================
const updateActiveLink = () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.style.opacity = '0.5';
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.style.opacity = '1';
                }
            });
        }
    });
};

window.addEventListener('scroll', updateActiveLink);

// ==================== IMAGE REVEAL ====================
const imageWrappers = document.querySelectorAll('.image-wrapper');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.parentElement.classList.add('active');
            imageObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

imageWrappers.forEach(wrapper => {
    imageObserver.observe(wrapper);
});

// ==================== STAGGERED WORK ITEMS ====================
const workItemsReveal = document.querySelectorAll('.works-grid .work-item');
const workObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('active');
            }, index * 200);
            workObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

workItemsReveal.forEach(item => {
    workObserver.observe(item);
});

// ==================== LAB ITEMS RIPPLE ====================
const labItems = document.querySelectorAll('.lab-item');
labItems.forEach(item => {
    item.addEventListener('mouseenter', function(e) {
        const overlay = this.querySelector('.lab-overlay');
        if (overlay) {
            overlay.style.transition = 'none';
            overlay.style.width = '0';
            overlay.style.height = '0';
            
            setTimeout(() => {
                overlay.style.transition = 'width 0.6s ease, height 0.6s ease';
                overlay.style.width = '200%';
                overlay.style.height = '200%';
            }, 10);
        }
    });
    
    item.addEventListener('mouseleave', function() {
        const overlay = this.querySelector('.lab-overlay');
        if (overlay) {
            overlay.style.width = '0';
            overlay.style.height = '0';
        }
    });
});

// ==================== MOBILE MENU ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        const spans = hamburger.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// ==================== PERFORMANCE OPTIMIZATION ====================
// Reduce animations on low-end devices
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
    });
}

// ==================== COUNTDOWN TIMER ====================
function updateCountdown() {
    // Set launch date - Change this to your actual launch date
    const launchDate = new Date('2026-01-01T00:00:00').getTime();
    
    const now = new Date().getTime();
    const distance = launchDate - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    
    if (distance < 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
    }
}

// Update countdown every second
updateCountdown();
setInterval(updateCountdown, 1000);

// ==================== NOTIFY FORM ====================
const notifyForm = document.getElementById('notifyForm');
if (notifyForm) {
    notifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = notifyForm.querySelector('input[type="email"]');
        const notifyBtn = notifyForm.querySelector('.notify-btn');
        const btnText = notifyBtn.querySelector('.btn-text');
        const messageEl = document.querySelector('.notify-message');
        const email = emailInput.value;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            messageEl.textContent = 'Please enter a valid email address';
            messageEl.className = 'notify-message error';
            return;
        }
        
        // Disable button during submission
        notifyBtn.disabled = true;
        btnText.textContent = 'SUBSCRIBING...';
        
        // Simulate API call (replace with actual API endpoint)
        setTimeout(() => {
            // Store email in localStorage (in production, send to backend)
            const subscribers = JSON.parse(localStorage.getItem('brahma26_subscribers') || '[]');
            
            if (subscribers.includes(email)) {
                messageEl.textContent = 'You\'re already subscribed!';
                messageEl.className = 'notify-message';
            } else {
                subscribers.push(email);
                localStorage.setItem('brahma26_subscribers', JSON.stringify(subscribers));
                messageEl.textContent = 'SUCCESS! You\'ll be notified when we launch.';
                messageEl.className = 'notify-message success';
                emailInput.value = '';
            }
            
            btnText.textContent = 'NOTIFY ME';
            notifyBtn.disabled = false;
            
            // Clear message after 5 seconds
            setTimeout(() => {
                messageEl.textContent = '';
                messageEl.className = 'notify-message';
            }, 5000);
        }, 1500);
    });
}

// ==================== ENHANCED TEXT GLITCH FOR BRAHMA 26 ====================
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    heroTitle.style.cursor = 'pointer';
    
    // Store original text
    const words = heroTitle.querySelectorAll('.word');
    const originalTexts = [];
    words.forEach(word => {
        originalTexts.push(word.getAttribute('data-word') || word.textContent.trim());
    });
    
    heroTitle.addEventListener('mouseenter', function() {
        const words = this.querySelectorAll('.word');
        
        words.forEach((word, wordIndex) => {
            const originalText = originalTexts[wordIndex];
            let iterations = 0;
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            
            // Stagger the start of each word's animation
            setTimeout(() => {
                const interval = setInterval(() => {
                    word.textContent = originalText
                        .split('')
                        .map((char, index) => {
                            if (index < iterations) {
                                return originalText[index];
                            }
                            if (char === ' ') return ' ';
                            return letters[Math.floor(Math.random() * letters.length)];
                        })
                        .join('');
                    
                    iterations += 1/3;
                    
                    if (iterations >= originalText.length) {
                        clearInterval(interval);
                        word.textContent = originalText;
                    }
                }, 30);
            }, wordIndex * 100);
        });
    });
}

// ==================== PARTICLE COLOR VARIATIONS ====================
if (canvas) {
    // Add color variations to particles on mouse proximity
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Create temporary glow particles
        if (Math.random() > 0.7) {
            const glowParticle = {
                x: mouseX,
                y: mouseY,
                size: Math.random() * 3 + 1,
                opacity: 1,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 60
            };
        }
    });
}

console.log('🚀 BRAHMA 26 - Coming Soon Page Loaded');
console.log('✨ Canvas particles: Active');
console.log('⏱️ Countdown timer: Running');
console.log('📧 Email notifications: Ready');
console.log('🎨 3D effects: Enabled');
console.log('⚡ Performance: Optimized');
