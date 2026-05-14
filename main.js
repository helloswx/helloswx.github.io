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
//  Three.js 3D Scene — Wireframe centerpiece + particle field
// ============================================================
function initThreeJSBackground() {
    if (typeof THREE === 'undefined') return;

    var isMobile = window.innerWidth <= 768;
    var W = window.innerWidth;
    var H = window.innerHeight;

    // --- Scene, Camera, Renderer ---
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, W / H, 0.5, 300);
    camera.position.set(0, 0, isMobile ? 35 : 45);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.id = 'bg-canvas';
    document.body.prepend(renderer.domElement);

    // --- Lighting (for mesh) ---
    var ambientLight = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambientLight);

    // --- Glow texture for particles ---
    function makeGlow(r, g, b, size) {
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        var gd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
        gd.addColorStop(0.08, 'rgba(' + r + ',' + g + ',' + b + ',0.9)');
        gd.addColorStop(0.3, 'rgba(' + r + ',' + g + ',' + b + ',0.2)');
        gd.addColorStop(0.7, 'rgba(0,0,0,0)');
        ctx.fillStyle = gd;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(canvas);
    }

    var texCyan = makeGlow(0, 255, 255, 64);
    var texPink = makeGlow(255, 0, 110, 64);
    var texWhite = makeGlow(200, 220, 255, 64);

    // ============================================
    //  1. CENTERPIECE — Glowing wireframe Icosahedron
    // ============================================
    var icoGeom = new THREE.IcosahedronGeometry(isMobile ? 4 : 6, 1);
    var icoEdges = new THREE.EdgesGeometry(icoGeom);
    var icoLine = new THREE.LineSegments(icoEdges,
        new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    );
    scene.add(icoLine);

    // Outer wireframe sphere (subtle)
    var sphereGeom = new THREE.SphereGeometry(isMobile ? 5.5 : 8, 32, 16);
    var sphereWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(sphereGeom),
        new THREE.LineBasicMaterial({
            color: 0xff006e,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    );
    scene.add(sphereWire);

    // ============================================
    //  2. ORBITING RING of bright glow particles
    // ============================================
    var ringCount = isMobile ? 80 : 200;
    var ringGeom = new THREE.BufferGeometry();
    var ringPositions = new Float32Array(ringCount * 3);
    var ringColors = new Float32Array(ringCount * 3);
    var ringRadius = isMobile ? 5 : 7.5;

    var ringPalette = [
        [0, 1, 1],    // cyan
        [1, 0, 0.43], // pink
        [0, 0.28, 1], // blue
    ];

    for (var i = 0; i < ringCount; i++) {
        var angle = (i / ringCount) * Math.PI * 2;
        var phi = Math.random() * Math.PI * 0.7 + 0.15;
        var r = ringRadius + (Math.random() - 0.5) * 1.5;
        ringPositions[i * 3] = Math.cos(angle) * Math.sin(phi) * r;
        ringPositions[i * 3 + 1] = Math.cos(phi) * r * 0.6;
        ringPositions[i * 3 + 2] = Math.sin(angle) * Math.sin(phi) * r;
        var pc = ringPalette[Math.floor(Math.random() * ringPalette.length)];
        ringColors[i * 3] = pc[0];
        ringColors[i * 3 + 1] = pc[1];
        ringColors[i * 3 + 2] = pc[2];
    }
    ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    ringGeom.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));
    var ringMesh = new THREE.Points(ringGeom, new THREE.PointsMaterial({
        size: isMobile ? 0.35 : 0.45,
        map: texWhite,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
    }));
    scene.add(ringMesh);

    // ============================================
    //  3. BACKGROUND STARFIELD
    // ============================================
    var starCount = isMobile ? 300 : 900;
    var starGeom = new THREE.BufferGeometry();
    var starPos = new Float32Array(starCount * 3);
    var starCol = new Float32Array(starCount * 3);
    var starOrigins = new Float32Array(starCount * 3);

    var starPalette = [
        [0, 1, 1], [1, 0, 0.43], [0, 0.28, 1],
        [0.22, 1, 0.08], [0.6, 0.2, 1],
    ];

    for (var s = 0; s < starCount; s++) {
        var sx = (Math.random() - 0.5) * 70;
        var sy = (Math.random() - 0.5) * 50;
        var sz = (Math.random() - 0.5) * 35 - 5;
        starPos[s * 3] = sx;
        starPos[s * 3 + 1] = sy;
        starPos[s * 3 + 2] = sz;
        starOrigins[s * 3] = sx;
        starOrigins[s * 3 + 1] = sy;
        starOrigins[s * 3 + 2] = sz;
        var sc = starPalette[Math.floor(Math.random() * starPalette.length)];
        starCol[s * 3] = sc[0];
        starCol[s * 3 + 1] = sc[1];
        starCol[s * 3 + 2] = sc[2];
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    var stars = new THREE.Points(starGeom, new THREE.PointsMaterial({
        size: isMobile ? 0.2 : 0.28,
        map: texCyan,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
    }));
    scene.add(stars);

    // ============================================
    //  4. CONNECTION LINES (desktop only)
    // ============================================
    var linesMesh = null;
    if (!isMobile) {
        var connDist = 8;
        var pairs = [];
        for (var ai = 0; ai < starCount; ai++) {
            var bestD = connDist * connDist;
            var bestIdx = -1;
            var ax = starPos[ai * 3], ay = starPos[ai * 3 + 1], az = starPos[ai * 3 + 2];
            for (var bi = ai + 1; bi < starCount; bi++) {
                var dx = ax - starPos[bi * 3];
                var dy = ay - starPos[bi * 3 + 1];
                var dz = az - starPos[bi * 3 + 2];
                var d2 = dx * dx + dy * dy + dz * dz;
                if (d2 < bestD) { bestD = d2; bestIdx = bi; }
            }
            if (bestIdx !== -1) pairs.push([ai, bestIdx]);
        }
        if (pairs.length > 0) {
            var lineGeom = new THREE.BufferGeometry();
            var lineArr = new Float32Array(pairs.length * 6);
            var lcolArr = new Float32Array(pairs.length * 6);
            for (var pi = 0; pi < pairs.length; pi++) {
                var a = pairs[pi][0], b = pairs[pi][1];
                lineArr[pi * 6] = starPos[a * 3];
                lineArr[pi * 6 + 1] = starPos[a * 3 + 1];
                lineArr[pi * 6 + 2] = starPos[a * 3 + 2];
                lineArr[pi * 6 + 3] = starPos[b * 3];
                lineArr[pi * 6 + 4] = starPos[b * 3 + 1];
                lineArr[pi * 6 + 5] = starPos[b * 3 + 2];
                lcolArr[pi * 6] = starCol[a * 3] * 0.08;
                lcolArr[pi * 6 + 1] = starCol[a * 3 + 1] * 0.08;
                lcolArr[pi * 6 + 2] = starCol[a * 3 + 2] * 0.08;
                lcolArr[pi * 6 + 3] = starCol[b * 3] * 0.08;
                lcolArr[pi * 6 + 4] = starCol[b * 3 + 1] * 0.08;
                lcolArr[pi * 6 + 5] = starCol[b * 3 + 2] * 0.08;
            }
            lineGeom.setAttribute('position', new THREE.BufferAttribute(lineArr, 3));
            lineGeom.setAttribute('color', new THREE.BufferAttribute(lcolArr, 3));
            linesMesh = new THREE.LineSegments(lineGeom, new THREE.LineBasicMaterial({
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true,
                opacity: 0.3,
            }));
            scene.add(linesMesh);
        }
    }

    // ============================================
    //  INTERACTION
    // ============================================
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

    // ============================================
    //  ANIMATION LOOP
    // ============================================
    var clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        var dt = Math.min(clock.getDelta(), 0.1);
        var t = performance.now() * 0.001;

        // Smooth mouse
        mouse.x += (mouse.tx - mouse.x) * 2.5 * dt;
        mouse.y += (mouse.ty - mouse.y) * 2.5 * dt;

        // Rotate centerpiece
        icoLine.rotation.x += 0.3 * dt;
        icoLine.rotation.y += 0.5 * dt;
        icoLine.rotation.z += 0.15 * dt;
        // Mouse influence on centerpiece
        icoLine.rotation.y += mouse.x * 0.5 * dt;
        icoLine.rotation.x += mouse.y * 0.3 * dt;

        sphereWire.rotation.x -= 0.1 * dt;
        sphereWire.rotation.y -= 0.2 * dt;

        // Rotate ring
        ringMesh.rotation.y += 0.4 * dt;
        ringMesh.rotation.x += 0.15 * dt;
        ringMesh.rotation.y += mouse.x * 0.3 * dt;
        ringMesh.rotation.x += mouse.y * 0.2 * dt;

        // Rotate starfield
        stars.rotation.y += 0.05 * dt;
        stars.rotation.x += 0.02 * dt;
        stars.rotation.y += mouse.x * 0.1 * dt;
        stars.rotation.x += mouse.y * 0.08 * dt;
        if (linesMesh) {
            linesMesh.rotation.copy(stars.rotation);
        }

        // Wave animation on stars
        var sp = stars.geometry.attributes.position.array;
        for (var wi = 0; wi < starCount; wi++) {
            var ox = starOrigins[wi * 3], oy = starOrigins[wi * 3 + 1], oz = starOrigins[wi * 3 + 2];
            sp[wi * 3] = ox + Math.sin(t * 0.5 + ox * 0.3) * 0.5;
            sp[wi * 3 + 1] = oy + Math.cos(t * 0.4 + oy * 0.25) * 0.4;
            sp[wi * 3 + 2] = oz + Math.sin(t * 0.35 + oz * 0.2) * 0.35;
        }
        stars.geometry.attributes.position.needsUpdate = true;

        // Dynamic centerpiece color
        var hue = (t * 0.05) % 1;
        var c = new THREE.Color().setHSL(hue, 1, 0.6);
        icoLine.material.color = c;

        // Subtle camera sway
        camera.position.x += (mouse.x * 2 - camera.position.x) * 1.2 * dt;
        camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 1.2 * dt;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

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
