// Ultra Modern Experimental JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initThreeJSBackground();
    initNavigation();
    initCustomCursor();
    initGlitchEffects();
    initScrollSync();
    initGeometricShapes();
    initFloatingElements();
    initScreenEffects();
    initProfilePhoto();
});

// ============================================================
//  Three.js 3D Particle Background
// ============================================================
function initThreeJSBackground() {
    if (typeof THREE === 'undefined') return;

    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = isMobile ? 200 : 700;
    const CONNECTION_DIST = isMobile ? 8 : 14;
    const MAX_CONNECTIONS = isMobile ? 0 : 1;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 200);
    camera.position.set(0, 0, 55);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.id = 'bg-canvas';
    document.body.prepend(canvas);

    // --- Glow sprite texture ---
    function createGlowTexture(color, size) {
        var c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        var ctx = c.getContext('2d');
        var gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.15, color);
        gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    var glowTexCyan = createGlowTexture('rgba(0, 255, 255, 1)', 64);
    var glowTexPink = createGlowTexture('rgba(255, 0, 110, 1)', 64);
    var glowTexBlue = createGlowTexture('rgba(0, 71, 255, 1)', 64);

    // --- Particles ---
    var particleGroup = new THREE.Group();
    scene.add(particleGroup);

    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var colors = new Float32Array(PARTICLE_COUNT * 3);
    var origins = new Float32Array(PARTICLE_COUNT * 3);

    var palette = [
        new THREE.Color('#00ffff'),
        new THREE.Color('#ff006e'),
        new THREE.Color('#0047ff'),
        new THREE.Color('#39ff14'),
        new THREE.Color('#ff1493'),
    ];

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        var x = (Math.random() - 0.5) * 80;
        var y = (Math.random() - 0.5) * 60;
        var z = (Math.random() - 0.5) * 40;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        origins[i * 3] = x;
        origins[i * 3 + 1] = y;
        origins[i * 3 + 2] = z;

        var c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    function createParticleLayer(count, size, tex, offset) {
        var geom = new THREE.BufferGeometry();
        var pos = new Float32Array(count * 3);
        var col = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
            var idx = offset + i;
            if (idx >= PARTICLE_COUNT) break;
            pos[i * 3] = positions[idx * 3];
            pos[i * 3 + 1] = positions[idx * 3 + 1];
            pos[i * 3 + 2] = positions[idx * 3 + 2];
            col[i * 3] = colors[idx * 3];
            col[i * 3 + 1] = colors[idx * 3 + 1];
            col[i * 3 + 2] = colors[idx * 3 + 2];
        }
        geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
        var mat = new THREE.PointsMaterial({
            size: size,
            map: tex,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.75,
        });
        return new THREE.Points(geom, mat);
    }

    var third = Math.floor(PARTICLE_COUNT / 3);
    var layer1 = createParticleLayer(third, 0.5, glowTexCyan, 0);
    var layer2 = createParticleLayer(third, 0.35, glowTexPink, third);
    var layer3 = createParticleLayer(PARTICLE_COUNT - third * 2, 0.25, glowTexBlue, third * 2);
    particleGroup.add(layer1);
    particleGroup.add(layer2);
    particleGroup.add(layer3);

    // --- Connection lines (desktop only) ---
    var linesMesh = null;
    if (!isMobile && MAX_CONNECTIONS > 0) {
        var connections = [];
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            var bestDist = Infinity;
            var bestJ = -1;
            var ix = positions[i * 3];
            var iy = positions[i * 3 + 1];
            var iz = positions[i * 3 + 2];
            for (var j = i + 1; j < PARTICLE_COUNT; j++) {
                var dx = ix - positions[j * 3];
                var dy = iy - positions[j * 3 + 1];
                var dz = iz - positions[j * 3 + 2];
                var d = dx * dx + dy * dy + dz * dz;
                if (d < bestDist && d < CONNECTION_DIST * CONNECTION_DIST) {
                    bestDist = d;
                    bestJ = j;
                }
            }
            if (bestJ !== -1) connections.push([i, bestJ]);
        }

        var lineCount = connections.length;
        var lineGeom = new THREE.BufferGeometry();
        var linePos = new Float32Array(lineCount * 6);
        var lineCol = new Float32Array(lineCount * 6);
        for (var k = 0; k < lineCount; k++) {
            var a = connections[k][0];
            var b = connections[k][1];
            linePos[k * 6] = positions[a * 3];
            linePos[k * 6 + 1] = positions[a * 3 + 1];
            linePos[k * 6 + 2] = positions[a * 3 + 2];
            linePos[k * 6 + 3] = positions[b * 3];
            linePos[k * 6 + 4] = positions[b * 3 + 1];
            linePos[k * 6 + 5] = positions[b * 3 + 2];
            var alpha = 0.06;
            lineCol[k * 6] = colors[a * 3] * alpha;
            lineCol[k * 6 + 1] = colors[a * 3 + 1] * alpha;
            lineCol[k * 6 + 2] = colors[a * 3 + 2] * alpha;
            lineCol[k * 6 + 3] = colors[b * 3] * alpha;
            lineCol[k * 6 + 4] = colors[b * 3 + 1] * alpha;
            lineCol[k * 6 + 5] = colors[b * 3 + 2] * alpha;
        }
        lineGeom.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
        lineGeom.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
        var lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.25,
        });
        linesMesh = new THREE.LineSegments(lineGeom, lineMat);
        particleGroup.add(linesMesh);
    }

    // --- Mouse / touch tracking ---
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    document.addEventListener('mousemove', function(e) {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length) {
            mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.ty = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    }, { passive: true });

    // --- Animation ---
    var clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);

        var dt = Math.min(clock.getDelta(), 0.1);
        var t = performance.now() * 0.001;

        // Smooth mouse follow
        mouse.x += (mouse.tx - mouse.x) * 2 * dt;
        mouse.y += (mouse.ty - mouse.y) * 2 * dt;

        // Gentle auto-rotation + mouse influence
        particleGroup.rotation.y += 0.08 * dt;
        particleGroup.rotation.x += 0.03 * dt;
        particleGroup.rotation.x += mouse.y * 0.15 * dt;
        particleGroup.rotation.y += mouse.x * 0.2 * dt;

        // Subtle camera shift
        camera.position.x += (mouse.x * 3 - camera.position.x) * 1.5 * dt;
        camera.position.y += (-mouse.y * 2 - camera.position.y) * 1.5 * dt;
        camera.lookAt(0, 0, 0);

        // Animate particle wave drift
        var posArr1 = layer1.geometry.attributes.position.array;
        var posArr2 = layer2.geometry.attributes.position.array;
        var posArr3 = layer3.geometry.attributes.position.array;

        for (var i = 0; i < third; i++) {
            var idx = i;
            var ox = origins[idx * 3];
            var oy = origins[idx * 3 + 1];
            var oz = origins[idx * 3 + 2];
            posArr1[i * 3] = ox + Math.sin(t * 0.7 + ox * 0.3) * 0.8;
            posArr1[i * 3 + 1] = oy + Math.cos(t * 0.6 + oy * 0.25) * 0.6;
            posArr1[i * 3 + 2] = oz + Math.sin(t * 0.5 + oz * 0.2) * 0.5;

            var idx2 = third + i;
            if (idx2 < PARTICLE_COUNT) {
                posArr2[i * 3] = origins[idx2 * 3] + Math.cos(t * 0.55 + origins[idx2 * 3] * 0.25) * 0.7;
                posArr2[i * 3 + 1] = origins[idx2 * 3 + 1] + Math.sin(t * 0.65 + origins[idx2 * 3 + 1] * 0.3) * 0.55;
                posArr2[i * 3 + 2] = origins[idx2 * 3 + 2] + Math.cos(t * 0.45 + origins[idx2 * 3 + 2] * 0.2) * 0.45;
            }
        }
        for (var j = 0; j < PARTICLE_COUNT - third * 2; j++) {
            var idx3 = third * 2 + j;
            if (idx3 >= PARTICLE_COUNT) break;
            posArr3[j * 3] = origins[idx3 * 3] + Math.sin(t * 0.6 + origins[idx3 * 3] * 0.2) * 0.9;
            posArr3[j * 3 + 1] = origins[idx3 * 3 + 1] + Math.cos(t * 0.5 + origins[idx3 * 3 + 1] * 0.3) * 0.65;
            posArr3[j * 3 + 2] = origins[idx3 * 3 + 2] + Math.sin(t * 0.55 + origins[idx3 * 3 + 2] * 0.15) * 0.5;
        }

        layer1.geometry.attributes.position.needsUpdate = true;
        layer2.geometry.attributes.position.needsUpdate = true;
        layer3.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

    // --- Resize ---
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Navigation functionality
function initNavigation() {
    var hamburger = document.querySelector('.hamburger');
    var navMenu = document.querySelector('.nav-menu');
    var navLinks = document.querySelectorAll('.nav-link');

    hamburger && hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            hamburger && hamburger.classList.remove('active');
            navMenu && navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// Custom Cursor
function initCustomCursor() {
    if (window.innerWidth <= 768) return;

    var cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    var mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    var interactiveElements = document.querySelectorAll('a, button, input, textarea, .nav-link');

    interactiveElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            cursor.style.transform = 'scale(2)';
            cursor.style.mixBlendMode = 'exclusion';
        });
        el.addEventListener('mouseleave', function() {
            cursor.style.transform = 'scale(1)';
            cursor.style.mixBlendMode = 'difference';
        });
    });
}

// Glitch Effects
function initGlitchEffects() {
    var heroTitle = document.querySelector('.hero-title');
    var contactTitle = document.querySelector('.contact-title.accent');

    function addGlitchEffect(element) {
        if (!element) return;
        var text = element.textContent;
        element.setAttribute('data-text', text);
        element.classList.add('glitch');

        setInterval(function() {
            if (Math.random() < 0.1) {
                element.style.animation = 'none';
                element.offsetHeight;
                element.style.animation = 'glitch-1 0.3s ease-out';
                setTimeout(function() {
                    element.style.animation = '';
                }, 300);
            }
        }, 2000);
    }

    addGlitchEffect(heroTitle);
    addGlitchEffect(contactTitle);
}

// Scroll synchronization
function initScrollSync() {
    var homeSection = document.querySelector('.home-section');
    var contactSection = document.querySelector('.contact-section');
    if (!homeSection || !contactSection) return;

    var isScrolling = false;

    function syncScroll() {
        if (isScrolling) return;
        var scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        homeSection.style.transform = 'translateY(' + (scrollPercent * 50) + 'px)';
        contactSection.style.transform = 'translateY(' + (-scrollPercent * 50) + 'px)';

        var navbar = document.querySelector('.navbar');
        if (scrollPercent > 0.5) {
            navbar.style.color = 'var(--neon-pink)';
        } else {
            navbar.style.color = '';
        }
    }

    window.addEventListener('scroll', function() {
        requestAnimationFrame(syncScroll);
    });
}

// Geometric shapes animation
function initGeometricShapes() {
    var shapes = document.querySelectorAll('.shape');
    shapes.forEach(function(shape, index) {
        shape.addEventListener('mouseenter', function() {
            shape.style.transform += ' scale(1.2)';
            var colors = ['pink', 'yellow', 'green', 'cyan'];
            shape.style.borderColor = 'var(--neon-' + colors[index % 4] + ')';
        });
        shape.addEventListener('mouseleave', function() {
            shape.style.transform = shape.style.transform.replace(' scale(1.2)', '');
            shape.style.borderColor = '';
        });
        setInterval(function() {
            if (Math.random() < 0.3) {
                var randomX = Math.random() * 20 - 10;
                var randomY = Math.random() * 20 - 10;
                shape.style.transform += ' translate(' + randomX + 'px, ' + randomY + 'px)';
                setTimeout(function() {
                    shape.style.transform = shape.style.transform.replace(' translate(' + randomX + 'px, ' + randomY + 'px)', '');
                }, 1000);
            }
        }, 3000);
    });
}

// Enhanced floating elements
function initFloatingElements() {
    var elements = document.querySelectorAll('.element');
    elements.forEach(function(element) {
        element.addEventListener('mouseenter', function() {
            element.style.animationPlayState = 'paused';
            element.style.transform = 'scale(1.5) rotate(45deg)';
            element.style.boxShadow = '0 0 30px currentColor';
        });
        element.addEventListener('mouseleave', function() {
            element.style.animationPlayState = 'running';
            element.style.transform = '';
            element.style.boxShadow = '';
        });
        setInterval(function() {
            var colors = ['--neon-cyan', '--neon-pink', '--neon-yellow', '--neon-green'];
            var randomColor = colors[Math.floor(Math.random() * colors.length)];
            element.style.borderColor = 'var(' + randomColor + ')';
            element.style.color = 'var(' + randomColor + ')';
            setTimeout(function() {
                element.style.borderColor = '';
                element.style.color = '';
            }, 1000);
        }, 5000);
    });
}

// Screen effects
function initScreenEffects() {
    var homeSection = document.querySelector('.home-section');
    var contactSection = document.querySelector('.contact-section');

    setInterval(function() {
        if (Math.random() < 0.05) {
            document.body.style.background = 'var(--neon-cyan)';
            setTimeout(function() {
                document.body.style.background = '';
            }, 50);
        }
    }, 1000);

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.filter = 'brightness(1.1) contrast(1.1)';
            } else {
                entry.target.style.filter = '';
            }
        });
    }, { threshold: 0.5 });

    observer.observe(homeSection);
    observer.observe(contactSection);

    var scanlines = document.createElement('div');
    scanlines.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100%',
        'height: 100%',
        'background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
        'pointer-events: none',
        'z-index: 9999',
        'animation: scanlines 0.1s linear infinite'
    ].join(';');
    document.body.appendChild(scanlines);
}

// Profile photo interactions
function initProfilePhoto() {
    var photoContainer = document.querySelector('.photo-container');
    var profileImg = document.querySelector('.profile-img');
    if (!photoContainer || !profileImg) return;

    setInterval(function() {
        if (Math.random() < 0.3) {
            var colors = ['--neon-cyan', '--neon-pink', '--neon-yellow', '--neon-green'];
            var randomColor = colors[Math.floor(Math.random() * colors.length)];
            profileImg.style.borderColor = 'var(' + randomColor + ')';
            profileImg.style.boxShadow = [
                '0 0 20px var(' + randomColor + ')',
                '0 0 40px var(' + randomColor + ')',
                'inset 0 0 20px rgba(0, 255, 255, 0.1)'
            ].join(',');
            setTimeout(function() {
                profileImg.style.borderColor = '';
                profileImg.style.boxShadow = '';
            }, 2000);
        }
    }, 3000);

    photoContainer.addEventListener('click', function() {
        profileImg.style.animation = 'none';
        profileImg.offsetHeight;
        profileImg.style.animation = 'photoClick 0.6s ease-out';

        var glitchEffect = document.createElement('div');
        glitchEffect.style.cssText = [
            'position: absolute',
            'top: 0',
            'left: 0',
            'width: 100%',
            'height: 100%',
            'border-radius: 50%',
            'background: rgba(0, 255, 255, 0.1)',
            'animation: glitchFlash 0.3s ease-out',
            'pointer-events: none'
        ].join(';');
        photoContainer.appendChild(glitchEffect);

        setTimeout(function() {
            glitchEffect.remove();
            profileImg.style.animation = '';
        }, 600);
    });

    photoContainer.addEventListener('mousemove', function(e) {
        var rect = photoContainer.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var mouseX = e.clientX - centerX;
        var mouseY = e.clientY - centerY;
        var rotateX = (mouseY / rect.height) * 10;
        var rotateY = (mouseX / rect.width) * -10;
        profileImg.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.05)';
    });

    photoContainer.addEventListener('mouseleave', function() {
        profileImg.style.transform = '';
    });
}

// Add CSS animations for cursor and scanlines
var style = document.createElement('style');
style.textContent = [
    '.custom-cursor {',
    '  position: fixed;',
    '  width: 20px;',
    '  height: 20px;',
    '  background: var(--neon-cyan);',
    '  border-radius: 50%;',
    '  pointer-events: none;',
    '  z-index: 10000;',
    '  mix-blend-mode: difference;',
    '  transition: transform 0.2s ease;',
    '}',
    '@keyframes scanlines {',
    '  0% { transform: translateY(0); }',
    '  100% { transform: translateY(4px); }',
    '}',
    '@media (max-width: 768px) {',
    '  .custom-cursor { display: none; }',
    '  body { cursor: auto; }',
    '}'
].join('\n');
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        var contactSection = document.querySelector('#contact');
        contactSection && contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'Escape') {
        var hamburger = document.querySelector('.hamburger');
        var navMenu = document.querySelector('.nav-menu');
        hamburger && hamburger.classList.remove('active');
        navMenu && navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});
