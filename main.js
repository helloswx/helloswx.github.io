// Placeholder for any interactive JavaScript
/*<header class="site-header">
<img src="ccs.png" alt="ACM SIGSAC Logo" class="ccs-logo"> <!-- ACM SIGSAC Logo -->
<h1>11th ACM Workshop on Adaptive and Autonomous Cyber Defense (AACD 2024)</h1>

<nav class="site-nav">
    <ul>
        In conjunction with the&nbsp;
        <li><a href="https://www.sigsac.org/ccs/CCS2024/">ACM Conference on Computer and Communications Security (CCS)</a></li>
        <li>October 14-18, 2024 Salt Lake City, U.S.A.</li>
        <!-- Other navigation items -->
    </ul>
</nav>
</header>*/

// Ultra Modern Experimental JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initCustomCursor();
    initGlitchEffects();
    initScrollSync();
    initGeometricShapes();
    initFloatingElements();
    initScreenEffects();
    initProfilePhoto();
    
    console.log('🔥 WenXiang Sun - Ultra Modern Portfolio Loaded! 🔥');
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Smooth scrolling for navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Custom Cursor
function initCustomCursor() {
    if (window.innerWidth <= 768) return; // Skip on mobile
    
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 直接更新位置，去除延迟
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .nav-link');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
            cursor.style.mixBlendMode = 'exclusion';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.mixBlendMode = 'difference';
        });
    });
}

// Glitch Effects
function initGlitchEffects() {
    const heroTitle = document.querySelector('.hero-title');
    const contactTitle = document.querySelector('.contact-title.accent');
    
    function addGlitchEffect(element) {
        if (!element) return;
        
        const text = element.textContent;
        element.setAttribute('data-text', text);
        element.classList.add('glitch');
        
        // Random glitch trigger
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance
                element.style.animation = 'none';
                element.offsetHeight; // Trigger reflow
                element.style.animation = 'glitch-1 0.3s ease-out';
                
                setTimeout(() => {
                    element.style.animation = '';
                }, 300);
            }
        }, 2000);
    }
    
    addGlitchEffect(heroTitle);
    addGlitchEffect(contactTitle);
}

// Scroll synchronization between sections
function initScrollSync() {
    const homeSection = document.querySelector('.home-section');
    const contactSection = document.querySelector('.contact-section');
    
    if (!homeSection || !contactSection) return;
    
    let isScrolling = false;
    
    function syncScroll() {
        if (isScrolling) return;
        
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        
        // Add parallax effects based on scroll
        homeSection.style.transform = `translateY(${scrollPercent * 50}px)`;
        contactSection.style.transform = `translateY(${-scrollPercent * 50}px)`;
        
        // Change navbar style based on scroll position
        const navbar = document.querySelector('.navbar');
        if (scrollPercent > 0.5) {
            navbar.style.color = 'var(--neon-pink)';
        } else {
            navbar.style.color = '';
        }
    }
    
    window.addEventListener('scroll', () => {
        requestAnimationFrame(syncScroll);
    });
}

// Geometric shapes animation
function initGeometricShapes() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        // Add random movement on hover
        shape.addEventListener('mouseenter', () => {
            shape.style.transform += ` scale(1.2)`;
            shape.style.borderColor = `var(--neon-${['pink', 'yellow', 'green', 'cyan'][index % 4]})`;
        });
        
        shape.addEventListener('mouseleave', () => {
            shape.style.transform = shape.style.transform.replace(' scale(1.2)', '');
            shape.style.borderColor = '';
        });
        
        // Random position changes
        setInterval(() => {
            if (Math.random() < 0.3) {
                const randomX = Math.random() * 20 - 10;
                const randomY = Math.random() * 20 - 10;
                shape.style.transform += ` translate(${randomX}px, ${randomY}px)`;
                
                setTimeout(() => {
                    shape.style.transform = shape.style.transform.replace(` translate(${randomX}px, ${randomY}px)`, '');
                }, 1000);
            }
        }, 3000);
    });
}

// Enhanced floating elements
function initFloatingElements() {
    const elements = document.querySelectorAll('.element');
    
    elements.forEach(element => {
        // Mouse interaction
        element.addEventListener('mouseenter', () => {
            element.style.animationPlayState = 'paused';
            element.style.transform = 'scale(1.5) rotate(45deg)';
            element.style.boxShadow = '0 0 30px currentColor';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.animationPlayState = 'running';
            element.style.transform = '';
            element.style.boxShadow = '';
        });
        
        // Random color changes
        setInterval(() => {
            const colors = ['--neon-cyan', '--neon-pink', '--neon-yellow', '--neon-green'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            element.style.borderColor = `var(${randomColor})`;
            element.style.color = `var(${randomColor})`;
            
            setTimeout(() => {
                element.style.borderColor = '';
                element.style.color = '';
            }, 1000);
        }, 5000);
    });
}

// Screen effects and visual enhancements
function initScreenEffects() {
    // Add dynamic background effects
    const homeSection = document.querySelector('.home-section');
    const contactSection = document.querySelector('.contact-section');
    
    // Random screen flashes
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance
            document.body.style.background = 'var(--neon-cyan)';
            setTimeout(() => {
                document.body.style.background = '';
            }, 50);
        }
    }, 1000);
    
    // Intersection observer for section transitions
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.filter = 'brightness(1.1) contrast(1.1)';
            } else {
                entry.target.style.filter = '';
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(homeSection);
    observer.observe(contactSection);
    
    // Add scan lines effect
    const scanlines = document.createElement('div');
    scanlines.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.03) 2px,
            rgba(0, 255, 255, 0.03) 4px
        );
        pointer-events: none;
        z-index: 9999;
        animation: scanlines 0.1s linear infinite;
    `;
    document.body.appendChild(scanlines);
}

// Profile photo interactions
function initProfilePhoto() {
    const photoContainer = document.querySelector('.photo-container');
    const profileImg = document.querySelector('.profile-img');
    
    if (!photoContainer || !profileImg) return;
    
    // Random color changes for border
    setInterval(() => {
        if (Math.random() < 0.3) {
            const colors = ['--neon-cyan', '--neon-pink', '--neon-yellow', '--neon-green'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            profileImg.style.borderColor = `var(${randomColor})`;
            profileImg.style.boxShadow = `
                0 0 20px var(${randomColor}),
                0 0 40px var(${randomColor}),
                inset 0 0 20px rgba(0, 255, 255, 0.1)
            `;
            
            setTimeout(() => {
                profileImg.style.borderColor = '';
                profileImg.style.boxShadow = '';
            }, 2000);
        }
    }, 3000);
    
    // Click effect
    photoContainer.addEventListener('click', () => {
        profileImg.style.animation = 'none';
        profileImg.offsetHeight; // Trigger reflow
        profileImg.style.animation = 'photoClick 0.6s ease-out';
        
        // Add glitch effect
        const glitchEffect = document.createElement('div');
        glitchEffect.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(0, 255, 255, 0.1);
            animation: glitchFlash 0.3s ease-out;
            pointer-events: none;
        `;
        photoContainer.appendChild(glitchEffect);
        
        setTimeout(() => {
            glitchEffect.remove();
            profileImg.style.animation = '';
        }, 600);
    });
    
    // Mouse movement parallax
    photoContainer.addEventListener('mousemove', (e) => {
        const rect = photoContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = (mouseY / rect.height) * 10;
        const rotateY = (mouseX / rect.width) * -10;
        
        profileImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    photoContainer.addEventListener('mouseleave', () => {
        profileImg.style.transform = '';
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .custom-cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        background: var(--neon-cyan);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        mix-blend-mode: difference;
        transition: transform 0.2s ease;
    }
    
    @keyframes scanlines {
        0% { transform: translateY(0); }
        100% { transform: translateY(4px); }
    }
    
    .form-field {
        transition: all 0.3s ease;
    }
    
    /* Mobile adjustments */
    @media (max-width: 768px) {
        .custom-cursor {
            display: none;
        }
        
        body {
            cursor: auto;
        }
    }
`;

document.head.appendChild(style);

// Keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to scroll to contact section
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const contactSection = document.querySelector('#contact');
        contactSection?.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Escape to close mobile menu
    if (e.key === 'Escape') {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});