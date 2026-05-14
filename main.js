// ============================================================
//  Constellation — 3D Scene + Project Objects
//  Scale-based transitions, no z-position fly-in
// ============================================================

(function() {
    if (typeof THREE === 'undefined') return;

    var isMobile = window.innerWidth <= 768;
    var W = window.innerWidth;
    var H = window.innerHeight;

    // ============================================
    //  SCENE SETUP
    // ============================================
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(48, W / H, 0.3, 80);
    camera.position.set(0, -0.5, isMobile ? 14 : 12);
    camera.lookAt(0, -0.5, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.id = 'bg-canvas';
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    document.body.prepend(renderer.domElement);

    // ============================================
    //  LIGHTING
    // ============================================
    scene.add(new THREE.AmbientLight(0x1a1a2e, 2.2));

    var keyLight = new THREE.PointLight(0xffeedd, 70, 22, 1.5);
    keyLight.position.set(6, 4, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);

    scene.add(new THREE.PointLight(0x8888cc, 18, 16, 2)).position.set(-5, -2, 4);
    scene.add(new THREE.PointLight(0xc8a951, 12, 10, 2)).position.set(0, 5, -5);

    // ============================================
    //  TEXTURES
    // ============================================
    function makeGlowTex(r, g, b, size) {
        var c = document.createElement('canvas');
        c.width = size; c.height = size;
        var ctx = c.getContext('2d');
        var grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
        grad.addColorStop(0.04, 'rgba(' + r + ',' + g + ',' + b + ',0.8)');
        grad.addColorStop(0.18, 'rgba(' + r + ',' + g + ',' + b + ',0.25)');
        grad.addColorStop(0.45, 'rgba(' + r + ',' + g + ',' + b + ',0.04)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    var texStar = makeGlowTex(255, 248, 235, 64);
    var texGold = makeGlowTex(220, 180, 80, 64);
    var texCool = makeGlowTex(150, 155, 210, 64);

    function glowMaterial(color, emissiveIntensity) {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.18,
            metalness: 0.05,
            emissive: color,
            emissiveIntensity: emissiveIntensity || 1.5,
        });
    }

    // ============================================
    //  STARFIELD (background particles)
    // ============================================
    var starGroup = new THREE.Group();
    scene.add(starGroup);

    function createStarLayer(count, spread, tex, sizeRange, opacity) {
        var geom = new THREE.BufferGeometry();
        var positions = new Float32Array(count * 3);
        var origins = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
            var x = (Math.random() - 0.5) * spread[0];
            var y = (Math.random() - 0.5) * spread[1];
            var z = (Math.random() - 0.5) * spread[2];
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            origins[i * 3] = x;
            origins[i * 3 + 1] = y;
            origins[i * 3 + 2] = z;
        }
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var mat = new THREE.PointsMaterial({
            size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
            map: tex,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: opacity + Math.random() * 0.2,
        });
        var points = new THREE.Points(geom, mat);
        starGroup.add(points);
        return { mesh: points, origins: origins, speed: 0.2 + Math.random() * 0.4, amp: 0.1 + Math.random() * 0.4 };
    }

    var starLayers = [];
    starLayers.push(createStarLayer(isMobile ? 200 : 450, [20, 14, 10], texStar, [0.04, 0.10], 0.55));
    starLayers.push(createStarLayer(isMobile ? 80 : 180, [18, 12, 9], texGold, [0.03, 0.08], 0.45));
    starLayers.push(createStarLayer(isMobile ? 50 : 100, [16, 10, 8], texCool, [0.02, 0.06], 0.4));

    // ============================================
    //  CENTRAL STRUCTURE — Armillary Sphere
    // ============================================
    var ringGroup = new THREE.Group();
    scene.add(ringGroup);
    ringGroup.position.set(0, -0.5, 0);

    var ringRadius = isMobile ? 2.6 : 3.5;
    var ringTube = isMobile ? 0.022 : 0.03;

    function createRing(radius, tube, colorHex) {
        var geom = new THREE.TorusGeometry(radius, tube, 12, 128);
        var mat = new THREE.MeshStandardMaterial({
            color: colorHex, roughness: 0.2, metalness: 0.92,
            emissive: new THREE.Color(colorHex).multiplyScalar(0.3),
            emissiveIntensity: 0.5,
        });
        var mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    var ring1 = createRing(ringRadius, ringTube, 0xc8a951);
    ringGroup.add(ring1);

    var ring2 = createRing(ringRadius, ringTube, 0xd4b96a);
    ring2.rotation.x = Math.PI / 2;
    ringGroup.add(ring2);

    var ring3 = createRing(ringRadius, ringTube, 0xbfa04d);
    ring3.rotation.y = Math.PI / 2;
    ringGroup.add(ring3);

    // Glowing center
    var coreSphere = new THREE.Mesh(
        new THREE.SphereGeometry(ringTube * 3.5, 32, 32),
        glowMaterial(0xc8a951, 2.0)
    );
    ringGroup.add(coreSphere);

    // Outer glow shell
    var glowShell = new THREE.Mesh(
        new THREE.SphereGeometry(ringTube * 6, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0xc8a951,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    );
    ringGroup.add(glowShell);

    // ============================================
    //  PROJECT 3D OBJECTS
    //  All at center position, scale 0.01 initially
    // ============================================
    var projectGroup = new THREE.Group();
    projectGroup.position.set(0, -0.5, 0);
    scene.add(projectGroup);

    var projectObjects = {};
    var accentColors = {
        hero:    0xc8a951,
        defense: 0xc8a951,
        platform:0x7b8cc8,
        digital: 0x5ea8a0,
        agent:   0xc89551,
    };

    function edgeMat(hex) {
        return new THREE.LineBasicMaterial({
            color: hex,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }

    // -- DEFENSE: Wireframe Octahedron (crystal/shield) --
    var defenseObj = new THREE.Group();
    var octaSize = isMobile ? 1.6 : 2.4;
    var octaGeom = new THREE.OctahedronGeometry(octaSize, 0);
    defenseObj.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(octaGeom),
        edgeMat(0xc8a951)
    ));
    // Inner glow core
    defenseObj.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0xffeedd,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    ));
    defenseObj.add(new THREE.Mesh(
        new THREE.SphereGeometry(octaSize * 0.35, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0xc8a951,
            transparent: true,
            opacity: 0.06,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    ));
    defenseObj.userData = { accent: 0xc8a951, rotSpeed: 0.25 };
    projectGroup.add(defenseObj);
    projectObjects.defense = defenseObj;

    // -- PLATFORM: Wireframe Globe + orbiting dots --
    var platformObj = new THREE.Group();
    var globeR = isMobile ? 1.5 : 2.2;
    platformObj.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.SphereGeometry(globeR, 20, 14)),
        edgeMat(0x7b8cc8)
    ));
    // Horizontal ring
    platformObj.add(new THREE.Mesh(
        new THREE.TorusGeometry(globeR, 0.025, 8, 64),
        new THREE.MeshBasicMaterial({
            color: 0x7b8cc8,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    ));
    // Orbiting dots
    var orbitDots = new THREE.Group();
    for (var od = 0; od < 8; od++) {
        var dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xaab8e8,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })
        );
        dot.userData = {
            orbitR: globeR + 0.3,
            orbitSpeed: 0.4 + Math.random() * 0.8,
            orbitPhase: Math.random() * Math.PI * 2,
            orbitPlane: Math.random() * Math.PI,
        };
        orbitDots.add(dot);
    }
    platformObj.add(orbitDots);
    platformObj.userData = { accent: 0x7b8cc8, rotSpeed: 0.2, orbitGroup: orbitDots };
    projectGroup.add(platformObj);
    projectObjects.platform = platformObj;

    // -- DIGITAL: Torus Knot --
    var digitalObj = new THREE.Group();
    var knotR = isMobile ? 1.1 : 1.5;
    var knotTube = isMobile ? 0.2 : 0.3;
    var knotP = isMobile ? 2 : 3;
    var knotQ = isMobile ? 3 : 5;
    digitalObj.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.TorusKnotGeometry(knotR, knotTube, isMobile ? 48 : 80, isMobile ? 6 : 10, knotP, knotQ)),
        edgeMat(0x5ea8a0)
    ));
    digitalObj.userData = { accent: 0x5ea8a0, rotSpeed: 0.3 };
    projectGroup.add(digitalObj);
    projectObjects.digital = digitalObj;

    // -- AGENT: Neural node cluster --
    var agentObj = new THREE.Group();
    var nodeCount = isMobile ? 16 : 28;
    var nodePositions = [];
    var spread = isMobile ? 2.5 : 4;
    for (var ni = 0; ni < nodeCount; ni++) {
        var nx = (Math.random() - 0.5) * spread;
        var ny = (Math.random() - 0.5) * spread * 0.7;
        var nz = (Math.random() - 0.5) * spread * 0.6;
        nodePositions.push([nx, ny, nz]);
        var nodeDot = new THREE.Mesh(
            new THREE.SphereGeometry(isMobile ? 0.05 : 0.07, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xc89551,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })
        );
        nodeDot.position.set(nx, ny, nz);
        nodeDot.userData = { basePos: [nx, ny, nz], phase: Math.random() * Math.PI * 2 };
        agentObj.add(nodeDot);
    }
    // Connect nearby nodes
    var lineVerts = [];
    for (var ai = 0; ai < nodeCount; ai++) {
        for (var bi = ai + 1; bi < nodeCount; bi++) {
            var dx = nodePositions[ai][0] - nodePositions[bi][0];
            var dy = nodePositions[ai][1] - nodePositions[bi][1];
            var dz = nodePositions[ai][2] - nodePositions[bi][2];
            var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < spread * 0.5) {
                lineVerts.push(nodePositions[ai][0], nodePositions[ai][1], nodePositions[ai][2]);
                lineVerts.push(nodePositions[bi][0], nodePositions[bi][1], nodePositions[bi][2]);
            }
        }
    }
    if (lineVerts.length > 0) {
        var lineGeom = new THREE.BufferGeometry();
        lineGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
        agentObj.add(new THREE.LineSegments(lineGeom, edgeMat(0xc89551)));
    }
    agentObj.userData = { accent: 0xc89551, rotSpeed: 0.15 };
    projectGroup.add(agentObj);
    projectObjects.agent = agentObj;

    // All start hidden
    for (var key in projectObjects) {
        projectObjects[key].scale.set(0.01, 0.01, 0.01);
    }

    // ============================================
    //  STREAK / FLASH SYSTEM (simplified comet)
    // ============================================
    var streakGroup = new THREE.Group();
    streakGroup.visible = false;
    scene.add(streakGroup);

    var streakTrailCount = isMobile ? 12 : 20;
    var streakGeom = new THREE.BufferGeometry();
    var streakPositions = new Float32Array(streakTrailCount * 3);
    streakGeom.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
    var streakPoints = new THREE.Points(streakGeom, new THREE.PointsMaterial({
        size: isMobile ? 0.05 : 0.08,
        map: texGold,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.85,
    }));
    streakGroup.add(streakPoints);

    var streakHead = new THREE.Mesh(
        new THREE.SphereGeometry(isMobile ? 0.1 : 0.16, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
        })
    );
    streakGroup.add(streakHead);

    var streakState = {
        active: false,
        startTime: 0,
        duration: 0.45,
        dir: new THREE.Vector3(),
        startPos: new THREE.Vector3(),
    };

    function fireStreak() {
        var dirs = [
            new THREE.Vector3(1, 0.25, -0.4),
            new THREE.Vector3(-1, -0.15, -0.35),
            new THREE.Vector3(0.4, 0.7, -0.5),
            new THREE.Vector3(-0.6, 0.4, -0.3),
            new THREE.Vector3(0.8, -0.3, -0.45),
        ];
        var d = dirs[Math.floor(Math.random() * dirs.length)].clone().normalize();
        streakState.active = true;
        streakState.startTime = performance.now() * 0.001;
        streakState.dir.copy(d);
        streakState.startPos.copy(d).multiplyScalar(-20);
        streakGroup.position.copy(streakState.startPos);
        streakGroup.visible = true;
    }

    function updateStreakTrail(headPos, dir) {
        for (var i = 0; i < streakTrailCount; i++) {
            var t = i / streakTrailCount;
            streakPositions[i * 3] = headPos.x - dir.x * t * 6;
            streakPositions[i * 3 + 1] = headPos.y - dir.y * t * 6;
            streakPositions[i * 3 + 2] = headPos.z - dir.z * t * 6;
        }
        streakGeom.attributes.position.needsUpdate = true;
    }

    // ============================================
    //  TRANSITION SYSTEM (scale-based, no z-fly)
    // ============================================
    var currentSection = 'hero';
    var activeObjName = null;
    var transition = {
        phase: 'idle', // idle | streak | scale-in | done
        startTime: 0,
        targetName: null,
        prevName: null,
    };

    function startTransition(toSection) {
        if (toSection === currentSection) return;

        // Clean up any in-progress transition
        if (transition.targetName && projectObjects[transition.targetName]) {
            projectObjects[transition.targetName].scale.set(0.01, 0.01, 0.01);
        }
        if (transition.prevName && projectObjects[transition.prevName]) {
            projectObjects[transition.prevName].scale.set(0.01, 0.01, 0.01);
        }

        var prev = currentSection;
        currentSection = toSection;

        // Map section to object name
        var objName = null;
        if (toSection === 'proj-defense') objName = 'defense';
        else if (toSection === 'proj-platform') objName = 'platform';
        else if (toSection === 'proj-digital') objName = 'digital';
        else if (toSection === 'proj-agent') objName = 'agent';

        // Update body data-section for CSS background
        var accentKey = toSection.replace('proj-', '');
        if (toSection === 'hero') accentKey = 'hero';
        document.body.setAttribute('data-section', accentKey);

        if (toSection === 'hero') {
            // Hide all project objects
            if (activeObjName && projectObjects[activeObjName]) {
                transition.phase = 'scale-out';
                transition.startTime = performance.now() * 0.001;
                transition.prevName = activeObjName;
                transition.targetName = null;
            }
            activeObjName = null;
            return;
        }

        if (!objName || !projectObjects[objName]) return;
        if (activeObjName === objName) return;

        // Fire streak
        fireStreak();
        transition.phase = 'streak';
        transition.startTime = performance.now() * 0.001;
        transition.prevName = activeObjName;
        transition.targetName = objName;
    }

    // ============================================
    //  EASING
    // ============================================
    function elasticOut(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * 2 * Math.PI / 0.3) + 1;
    }

    // ============================================
    //  SECTION TRACKING
    // ============================================
    function getVisibleSection() {
        var sections = document.querySelectorAll('section[id]');
        var best = 'hero';
        var bestRatio = 0;
        sections.forEach(function(sec) {
            var rect = sec.getBoundingClientRect();
            var visibleH = Math.min(rect.bottom, H) - Math.max(rect.top, 0);
            if (visibleH <= 0) return;
            var ratio = visibleH / Math.min(rect.height, H);
            if (ratio > bestRatio) { bestRatio = ratio; best = sec.id; }
        });
        return best;
    }

    var trackedSection = 'hero';

    // ============================================
    //  MOUSE / TOUCH PARALLAX
    // ============================================
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    document.addEventListener('mousemove', function(e) {
        mouse.tx = (e.clientX / W) * 2 - 1;
        mouse.ty = -(e.clientY / H) * 2 + 1;
    });

    document.addEventListener('touchmove', function(e) {
        if (e.touches.length) {
            mouse.tx = (e.touches[0].clientX / W) * 2 - 1;
            mouse.ty = -(e.touches[0].clientY / H) * 2 + 1;
        }
    }, { passive: true });

    // ============================================
    //  ANIMATION LOOP
    // ============================================
    var clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        var dt = Math.min(clock.getDelta(), 0.12);
        var t = performance.now() * 0.001;

        // Section tracking (4Hz)
        if (Math.floor(t * 4) !== Math.floor((t - Math.max(dt, 0.01)) * 4)) {
            var sec = getVisibleSection();
            if (sec !== trackedSection) {
                startTransition(sec);
                trackedSection = sec;
            }
        }

        // Smooth mouse follow
        var lerpSpd = 2.5;
        mouse.x += (mouse.tx - mouse.x) * lerpSpd * dt;
        mouse.y += (mouse.ty - mouse.y) * lerpSpd * dt;

        // ---- Handle Streak ----
        if (transition.phase === 'streak') {
            var sElapsed = t - transition.startTime;
            var sProgress = Math.min(sElapsed / streakState.duration, 1);
            var sEased = 1 - Math.pow(1 - sProgress, 3);

            streakGroup.position.copy(streakState.startPos).lerp(
                streakState.dir.clone().multiplyScalar(20), sEased
            );
            updateStreakTrail(streakGroup.position, streakState.dir);
            streakHead.position.copy(streakGroup.position);
            streakHead.material.opacity = 1 - sProgress;

            if (sProgress >= 1) {
                streakGroup.visible = false;
                streakState.active = false;
                transition.phase = 'scale-in';
                transition.startTime = t;
                activeObjName = transition.targetName;
            }
        }

        // ---- Scale In (elastic) ----
        if (transition.phase === 'scale-in' && transition.targetName) {
            var siElapsed = t - transition.startTime;
            var siDuration = 1.3;
            var siProgress = Math.min(siElapsed / siDuration, 1);
            var siEased = elasticOut(siProgress);

            // Scale up the new object
            var obj = projectObjects[transition.targetName];
            if (obj) obj.scale.setScalar(siEased);

            if (siProgress >= 1) {
                transition.phase = 'done';
            }
        }

        // ---- Scale Out previous ----
        if (transition.prevName && transition.phase !== 'done' && transition.prevName !== transition.targetName) {
            var prevObj = projectObjects[transition.prevName];
            if (prevObj) {
                var outProgress = Math.min(1, (t - transition.startTime) / 0.5);
                prevObj.scale.setScalar(Math.max(0.01, 1 - outProgress));
                if (outProgress >= 1 && transition.phase !== 'scale-out') {
                    transition.prevName = null;
                }
            }
        }

        // ---- Scale Out (hero transition) ----
        if (transition.phase === 'scale-out') {
            var soElapsed = t - transition.startTime;
            var soProgress = Math.min(soElapsed / 0.5, 1);
            if (transition.prevName && projectObjects[transition.prevName]) {
                projectObjects[transition.prevName].scale.setScalar(Math.max(0.01, 1 - soProgress));
            }
            if (soProgress >= 1) {
                if (transition.prevName && projectObjects[transition.prevName]) {
                    projectObjects[transition.prevName].scale.set(0.01, 0.01, 0.01);
                }
                transition.phase = 'idle';
                transition.prevName = null;
            }
        }

        // ---- Rotate central rings ----
        ring1.rotation.z += 0.12 * dt;
        ring2.rotation.z += 0.18 * dt;
        ring3.rotation.z += 0.08 * dt;
        ringGroup.rotation.y += mouse.x * 0.18 * dt + 0.05 * dt;
        ringGroup.rotation.x += mouse.y * 0.12 * dt;

        // Ring color drift toward section accent
        var currentAccent = accentColors[trackedSection.replace('proj-', '')] || 0xc8a951;
        var targetColor = new THREE.Color(currentAccent);
        ring1.material.color.lerp(targetColor, 0.5 * dt);
        ring2.material.color.copy(targetColor).multiplyScalar(1.06);
        ring3.material.color.copy(targetColor).multiplyScalar(0.94);

        // Core pulse
        var pulse = 1 + Math.sin(t * 1.4) * 0.35;
        coreSphere.scale.setScalar(pulse);
        coreSphere.material.emissiveIntensity = 1.3 + Math.sin(t * 1.4) * 0.7;
        coreSphere.material.emissive.copy(targetColor);
        coreSphere.material.color.copy(targetColor);
        glowShell.material.color.copy(targetColor);

        // ---- Animate starfield ----
        starLayers.forEach(function(layer) {
            var pos = layer.mesh.geometry.attributes.position.array;
            var orig = layer.origins;
            for (var i = 0; i < pos.length / 3; i++) {
                var ox = orig[i * 3], oy = orig[i * 3 + 1], oz = orig[i * 3 + 2];
                pos[i * 3] = ox + Math.sin(t * layer.speed + oy * 0.5) * layer.amp;
                pos[i * 3 + 1] = oy + Math.cos(t * layer.speed * 0.7 + ox * 0.4) * layer.amp * 0.6;
                pos[i * 3 + 2] = oz + Math.sin(t * layer.speed * 0.5 + ox * 0.35) * layer.amp * 0.5;
            }
            layer.mesh.geometry.attributes.position.needsUpdate = true;
        });
        starGroup.rotation.y += 0.02 * dt;
        starGroup.rotation.x += 0.008 * dt;
        starGroup.rotation.y += mouse.x * 0.05 * dt;
        starGroup.rotation.x += mouse.y * 0.03 * dt;

        // ---- Animate active project object ----
        if (activeObjName && projectObjects[activeObjName]) {
            var aObj = projectObjects[activeObjName];
            if (aObj.scale.x > 0.05) {
                var rs = aObj.userData.rotSpeed || 0.2;
                aObj.rotation.y += rs * dt;
                aObj.rotation.x += rs * 0.3 * dt;
                aObj.rotation.y += mouse.x * 0.25 * dt;
                aObj.rotation.x += mouse.y * 0.15 * dt;

                // Platform: animate orbiting dots
                if (activeObjName === 'platform' && aObj.userData.orbitGroup) {
                    aObj.userData.orbitGroup.children.forEach(function(dot) {
                        var ud = dot.userData;
                        ud.orbitPhase += ud.orbitSpeed * dt;
                        dot.position.x = Math.cos(ud.orbitPhase) * ud.orbitR;
                        dot.position.y = Math.sin(ud.orbitPhase) * ud.orbitR * Math.cos(ud.orbitPlane);
                        dot.position.z = Math.sin(ud.orbitPhase) * ud.orbitR * Math.sin(ud.orbitPlane);
                    });
                }

                // Agent: subtle node pulse
                if (activeObjName === 'agent') {
                    aObj.children.forEach(function(child) {
                        if (child.isMesh && child.userData.basePos) {
                            var bp = child.userData.basePos;
                            var p = child.userData.phase;
                            var s = 0.85 + Math.sin(t * 2 + p) * 0.15;
                            child.scale.setScalar(s);
                        }
                    });
                }
            }
        }

        // ---- Camera sway ----
        camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.7 * dt;
        camera.position.y += (-0.5 - mouse.y * 0.35 - camera.position.y) * 0.7 * dt;
        camera.lookAt(0, -0.5, 0);

        renderer.render(scene, camera);
    }

    animate();

    // ============================================
    //  RESIZE
    // ============================================
    window.addEventListener('resize', function() {
        W = window.innerWidth;
        H = window.innerHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    });

    // ============================================
    //  SCROLL HINT
    // ============================================
    var scrollHint = document.getElementById('scrollHint');
    if (scrollHint) {
        scrollHint.addEventListener('click', function() {
            var firstProject = document.querySelector('.project-section');
            if (firstProject) firstProject.scrollIntoView({ behavior: 'smooth' });
        });
        var hintGone = false;
        window.addEventListener('scroll', function() {
            if (!hintGone && window.scrollY > 120) {
                hintGone = true;
                scrollHint.style.opacity = '0';
                setTimeout(function() { scrollHint.style.display = 'none'; }, 350);
            }
        }, { passive: true });
    }

    // ============================================
    //  NUMBER COUNTERS + REVEAL
    // ============================================
    function animateNumber(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        var current = 0, duration = 1300, start = performance.now();
        function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            progress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            current = Math.round(target * progress);
            el.textContent = current;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    }

    var revealObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                if (el.classList.contains('reveal')) el.classList.add('visible');
                if (el.classList.contains('reveal-children')) el.classList.add('visible');
                el.querySelectorAll('[data-count]').forEach(function(num) {
                    if (!num.dataset.animated) { num.dataset.animated = '1'; animateNumber(num); }
                });
                revealObs.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-children').forEach(function(el) {
        revealObs.observe(el);
    });

    // ============================================
    //  DEVICE ORIENTATION (mobile)
    // ============================================
    if (isMobile && window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e) {
            if (e.beta != null && e.gamma != null) {
                mouse.tx = Math.max(-1, Math.min(1, e.gamma / 40));
                mouse.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 40));
            }
        });
    }
})();
