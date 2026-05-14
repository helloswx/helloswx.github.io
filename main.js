// ============================================================
//  Dark Observatory — 3D Scene + Scroll Interactions
// ============================================================

(function() {
    // ============================================
    //  1. THREE.JS SCENE
    // ============================================
    if (typeof THREE === 'undefined') return;

    var isMobile = window.innerWidth <= 768;
    var W = window.innerWidth;
    var H = window.innerHeight;

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(48, W / H, 0.3, 80);
    camera.position.set(0, 1.2, isMobile ? 16 : 13);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.id = 'bg-canvas';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.body.prepend(renderer.domElement);

    // Lighting
    var ambient = new THREE.AmbientLight(0x1a1a2e, 2.5);
    scene.add(ambient);

    var keyLight = new THREE.PointLight(0xffeedd, 80, 25, 1.5);
    keyLight.position.set(6, 5, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);

    var fillLight = new THREE.PointLight(0x8888cc, 20, 18, 2);
    fillLight.position.set(-5, -3, 4);
    scene.add(fillLight);

    var rimLight = new THREE.PointLight(0xc8a951, 15, 12, 2);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Armillary Sphere
    var ringGroup = new THREE.Group();
    scene.add(ringGroup);
    ringGroup.position.set(0, 0.8, 0);

    var ringRadius = isMobile ? 2.8 : 3.8;
    var tubeRadius = isMobile ? 0.025 : 0.035;
    var ringSegments = 128;
    var tubeSegments = 12;

    function createRing(radius, tube, color, emissiveColor, emissiveIntensity) {
        var geom = new THREE.TorusGeometry(radius, tube, tubeSegments, ringSegments);
        var mat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.22,
            metalness: 0.95,
            emissive: emissiveColor || 0x000000,
            emissiveIntensity: emissiveIntensity || 0,
        });
        var mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    var ring1 = createRing(ringRadius, tubeRadius, 0xc8a951, 0x2a1a00, 0.5);
    ringGroup.add(ring1);

    var ring2 = createRing(ringRadius, tubeRadius, 0xd4b96a, 0x2a1a00, 0.4);
    ring2.rotation.x = Math.PI / 2;
    ringGroup.add(ring2);

    var ring3 = createRing(ringRadius, tubeRadius, 0xbfa04d, 0x2a1a00, 0.45);
    ring3.rotation.y = Math.PI / 2;
    ringGroup.add(ring3);

    var sphereGeom = new THREE.SphereGeometry(tubeRadius * 3, 32, 32);
    var sphereMat = new THREE.MeshStandardMaterial({
        color: 0xffeedd,
        roughness: 0.15,
        metalness: 0.1,
        emissive: 0xffd699,
        emissiveIntensity: 1.5,
    });
    var centerSphere = new THREE.Mesh(sphereGeom, sphereMat);
    ringGroup.add(centerSphere);

    // Particle Field
    var particleCount = isMobile ? 350 : 700;
    var particleGroup = new THREE.Group();
    scene.add(particleGroup);

    function makeGlow(r, g, b, size) {
        var c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        var ctx = c.getContext('2d');
        var grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
        grad.addColorStop(0.05, 'rgba(' + r + ',' + g + ',' + b + ',0.85)');
        grad.addColorStop(0.2, 'rgba(' + r + ',' + g + ',' + b + ',0.3)');
        grad.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ',0.05)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    var texWarm = makeGlow(255, 245, 230, 64);
    var texGold = makeGlow(220, 180, 80, 64);
    var texCool = makeGlow(150, 155, 200, 64);

    function createParticles(count, spreadX, spreadY, spreadZ, tex, sizes) {
        var geom = new THREE.BufferGeometry();
        var positions = new Float32Array(count * 3);
        var origins = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
            var x = (Math.random() - 0.5) * spreadX;
            var y = (Math.random() - 0.5) * spreadY;
            var z = (Math.random() - 0.5) * spreadZ;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            origins[i * 3] = x;
            origins[i * 3 + 1] = y;
            origins[i * 3 + 2] = z;
        }
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var sizeVal = sizes[0] + Math.random() * (sizes[1] - sizes[0]);
        var mat = new THREE.PointsMaterial({
            size: sizeVal,
            map: tex,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.6 + Math.random() * 0.3,
        });
        return { mesh: new THREE.Points(geom, mat), origins: origins };
    }

    var layer1 = createParticles(Math.floor(particleCount * 0.5), 22, 14, 10, texWarm, [0.08, 0.18]);
    var layer2 = createParticles(Math.floor(particleCount * 0.3), 20, 12, 9, texGold, [0.05, 0.12]);
    var layer3 = createParticles(Math.floor(particleCount * 0.2), 18, 10, 8, texCool, [0.03, 0.08]);

    particleGroup.add(layer1.mesh);
    particleGroup.add(layer2.mesh);
    particleGroup.add(layer3.mesh);

    // Mouse tracking
    var mouse = { x: 0, y: 0, tx: 0, ty: 0, isMoving: false };
    var moveTimeout;

    document.addEventListener('mousemove', function(e) {
        mouse.tx = (e.clientX / W) * 2 - 1;
        mouse.ty = -(e.clientY / H) * 2 + 1;
        mouse.isMoving = true;
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(function() { mouse.isMoving = false; }, 1500);
    });

    document.addEventListener('touchmove', function(e) {
        if (e.touches.length) {
            mouse.tx = (e.touches[0].clientX / W) * 2 - 1;
            mouse.ty = -(e.touches[0].clientY / H) * 2 + 1;
            mouse.isMoving = true;
            clearTimeout(moveTimeout);
            moveTimeout = setTimeout(function() { mouse.isMoving = false; }, 1500);
        }
    }, { passive: true });

    // ============================================
    //  2. SCROLL-BASED 3D REACTION
    // ============================================
    var currentSection = 'hero';
    var sectionAccents = {
        'hero':            0xc8a951, // gold
        'proj-defense':    0xc8a951, // gold
        'proj-platform':   0x7b8cc8, // indigo
        'proj-digital':    0x5ea8a0, // teal
        'proj-agent':      0xc89551, // amber
    };

    function updateCurrentSection() {
        var sections = document.querySelectorAll('section[id]');
        var bestId = 'hero';
        var bestRatio = 0;
        sections.forEach(function(sec) {
            var rect = sec.getBoundingClientRect();
            var visibleH = Math.min(rect.bottom, H) - Math.max(rect.top, 0);
            if (visibleH <= 0) return;
            var ratio = visibleH / rect.height;
            if (ratio > bestRatio) { bestRatio = ratio; bestId = sec.id; }
        });
        currentSection = bestId;
    }

    // ============================================
    //  3. NUMBER COUNTER
    // ============================================
    function animateNumber(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        var current = 0;
        var duration = 1200;
        var start = performance.now();

        function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            // ease-out
            progress = 1 - Math.pow(1 - progress, 3);
            current = Math.round(target * progress);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(tick);
    }

    // ============================================
    //  4. INTERSECTION OBSERVER
    // ============================================
    var observerOptions = { threshold: 0.2, rootMargin: '0px 0px -40px 0px' };

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;

                // Trigger reveal
                if (el.classList.contains('reveal')) {
                    el.classList.add('visible');
                }

                // Trigger children reveal
                if (el.classList.contains('reveal-children')) {
                    el.classList.add('visible');
                }

                // Animate numbers inside
                var nums = el.querySelectorAll('.big-num[data-count], .met-num[data-count]');
                nums.forEach(function(num) {
                    if (!num.dataset.animated) {
                        num.dataset.animated = '1';
                        animateNumber(num);
                    }
                });

                observer.unobserve(el);
            }
        });
    }, observerOptions);

    // Observe all elements with .reveal or .reveal-children
    document.querySelectorAll('.reveal, .reveal-children').forEach(function(el) {
        observer.observe(el);
    });

    // ============================================
    //  5. SCROLL HINT
    // ============================================
    var scrollHint = document.getElementById('scrollHint');
    if (scrollHint) {
        scrollHint.addEventListener('click', function() {
            var firstProject = document.querySelector('.project');
            if (firstProject) {
                firstProject.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Hide hint after user scrolls
        var hintHidden = false;
        window.addEventListener('scroll', function() {
            if (!hintHidden && window.scrollY > 100) {
                hintHidden = true;
                scrollHint.style.opacity = '0';
                setTimeout(function() { scrollHint.style.display = 'none'; }, 300);
            }
        }, { passive: true });
    }

    // ============================================
    //  6. ANIMATION LOOP
    // ============================================
    var clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        var dt = Math.min(clock.getDelta(), 0.12);
        var t = performance.now() * 0.001;

        // Update current section
        updateCurrentSection();

        var accentColor = sectionAccents[currentSection] || 0xc8a951;

        // Smooth mouse
        var lerpSpeed = mouse.isMoving ? 2.5 : 1;
        mouse.x += (mouse.tx - mouse.x) * lerpSpeed * dt;
        mouse.y += (mouse.ty - mouse.y) * lerpSpeed * dt;

        // Ring rotations
        ring1.rotation.z += 0.12 * dt;
        ring2.rotation.z += 0.18 * dt;
        ring3.rotation.z += 0.08 * dt;

        // Mouse + auto rotation
        ringGroup.rotation.y += mouse.x * 0.2 * dt;
        ringGroup.rotation.x += mouse.y * 0.15 * dt;
        ringGroup.rotation.y += 0.06 * dt;

        // Subtly shift ring colors toward section accent
        var targetColor = new THREE.Color(accentColor);
        var currentColor = new THREE.Color(ring1.material.color.getHex());
        currentColor.lerp(targetColor, 0.3 * dt);
        ring1.material.color.set(currentColor);
        ring2.material.color.set(new THREE.Color(accentColor).multiplyScalar(1.1));
        ring3.material.color.set(new THREE.Color(accentColor).multiplyScalar(0.9));

        // Center sphere pulse
        var pulse = 1 + Math.sin(t * 1.5) * 0.3;
        centerSphere.scale.setScalar(pulse);
        centerSphere.material.emissiveIntensity = 1.2 + Math.sin(t * 1.5) * 0.6;

        // Particle animation
        function animateLayer(layer, speed, amp) {
            var pos = layer.mesh.geometry.attributes.position.array;
            var orig = layer.origins;
            for (var i = 0; i < pos.length / 3; i++) {
                var ox = orig[i * 3], oy = orig[i * 3 + 1], oz = orig[i * 3 + 2];
                pos[i * 3] = ox + Math.sin(t * speed + oy * 0.4) * amp;
                pos[i * 3 + 1] = oy + Math.cos(t * speed * 0.8 + ox * 0.35) * amp * 0.7;
                pos[i * 3 + 2] = oz + Math.sin(t * speed * 0.6 + ox * 0.3) * amp * 0.6;
            }
            layer.mesh.geometry.attributes.position.needsUpdate = true;
        }

        animateLayer(layer1, 0.35, 0.4);
        animateLayer(layer2, 0.45, 0.3);
        animateLayer(layer3, 0.55, 0.25);

        // Particle group rotation
        particleGroup.rotation.y += 0.03 * dt;
        particleGroup.rotation.x += 0.015 * dt;
        particleGroup.rotation.y += mouse.x * 0.08 * dt;
        particleGroup.rotation.x += mouse.y * 0.05 * dt;

        // Camera sway
        var scrollFactor = window.scrollY / (document.body.scrollHeight - H);
        camera.position.x += (mouse.x * 0.7 + scrollFactor * 0.5 - camera.position.x) * 0.8 * dt;
        camera.position.y += (1.2 - mouse.y * 0.5 - camera.position.y) * 0.8 * dt;
        camera.lookAt(0, 0.8, 0);

        renderer.render(scene, camera);
    }

    animate();

    // Resize
    window.addEventListener('resize', function() {
        W = window.innerWidth;
        H = window.innerHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    });

    // Device orientation for mobile
    if (isMobile && window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e) {
            if (e.beta && e.gamma) {
                mouse.tx = Math.max(-1, Math.min(1, e.gamma / 45));
                mouse.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
            }
        });
    }
})();
