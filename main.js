// ============================================================
//  Dark Observatory — 3D Scene + Project Objects + Transitions
// ============================================================

(function() {
    if (typeof THREE === 'undefined') return;

    var isMobile = window.innerWidth <= 768;
    var W = window.innerWidth;
    var H = window.innerHeight;

    // --- Scene ---
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(48, W / H, 0.3, 100);
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

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0x1a1a2e, 2.5));

    var keyLight = new THREE.PointLight(0xffeedd, 80, 25, 1.5);
    keyLight.position.set(6, 5, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);

    scene.add(new THREE.PointLight(0x8888cc, 20, 18, 2)).position.set(-5, -3, 4);
    scene.add(new THREE.PointLight(0xc8a951, 15, 12, 2)).position.set(0, 6, -6);

    // ============================================
    //  ARMILLARY SPHERE (hero constant)
    // ============================================
    var ringGroup = new THREE.Group();
    scene.add(ringGroup);
    ringGroup.position.set(0, 0.8, 0);

    var ringR = isMobile ? 2.8 : 3.8;
    var tubeR = isMobile ? 0.025 : 0.035;

    function makeRing(radius, tube, color) {
        var g = new THREE.TorusGeometry(radius, tube, 12, 128);
        var m = new THREE.MeshStandardMaterial({
            color: color, roughness: 0.22, metalness: 0.95,
            emissive: 0x2a1a00, emissiveIntensity: 0.5,
        });
        var mesh = new THREE.Mesh(g, m);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    var ring1 = makeRing(ringR, tubeR, 0xc8a951);
    ringGroup.add(ring1);

    var ring2 = makeRing(ringR, tubeR, 0xd4b96a);
    ring2.rotation.x = Math.PI / 2;
    ringGroup.add(ring2);

    var ring3 = makeRing(ringR, tubeR, 0xbfa04d);
    ring3.rotation.y = Math.PI / 2;
    ringGroup.add(ring3);

    var centerSphere = new THREE.Mesh(
        new THREE.SphereGeometry(tubeR * 3, 32, 32),
        new THREE.MeshStandardMaterial({
            color: 0xffeedd, roughness: 0.15, metalness: 0.1,
            emissive: 0xffd699, emissiveIntensity: 1.5,
        })
    );
    ringGroup.add(centerSphere);

    // ============================================
    //  PARTICLE FIELD
    // ============================================
    var particleCount = isMobile ? 300 : 650;
    var particleGroup = new THREE.Group();
    scene.add(particleGroup);

    function makeGlow(r, g, b, size) {
        var c = document.createElement('canvas');
        c.width = size; c.height = size;
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
        var mat = new THREE.PointsMaterial({
            size: sizes[0] + Math.random() * (sizes[1] - sizes[0]),
            map: tex,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.6 + Math.random() * 0.3,
        });
        return { mesh: new THREE.Points(geom, mat), origins: origins };
    }

    var layer1 = createParticles(Math.floor(particleCount * 0.5), 22, 14, 10, texWarm, [0.06, 0.14]);
    var layer2 = createParticles(Math.floor(particleCount * 0.3), 20, 12, 9, texGold, [0.04, 0.10]);
    var layer3 = createParticles(Math.floor(particleCount * 0.2), 18, 10, 8, texCool, [0.03, 0.07]);
    var allLayers = [layer1, layer2, layer3];

    particleGroup.add(layer1.mesh);
    particleGroup.add(layer2.mesh);
    particleGroup.add(layer3.mesh);

    // ============================================
    //  PROJECT 3D OBJECTS
    // ============================================
    var projectGroup = new THREE.Group();
    scene.add(projectGroup);

    var projectObjects = {};
    var sectionColors = {
        hero:    0xc8a951,
        defense: 0xc8a951,
        platform:0x7b8cc8,
        digital: 0x5ea8a0,
        agent:   0xc89551,
    };

    function edgeMaterial(color) {
        return new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }

    function nodeMaterial(color) {
        return new THREE.MeshBasicMaterial({ color: color });
    }

    // -- Defense: Wireframe Octahedron (shield/diamond) --
    var defenseGroup = new THREE.Group();
    var defOcta = new THREE.OctahedronGeometry(isMobile ? 1.8 : 2.5, 0);
    defenseGroup.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(defOcta),
        edgeMaterial(0xc8a951)
    ));
    defenseGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        nodeMaterial(0xffeedd)
    ));
    defenseGroup.position.set(3.5, 0.3, -1);
    defenseGroup.scale.set(0.01, 0.01, 0.01);
    defenseGroup.userData = { targetPos: new THREE.Vector3(3.5, 0.3, -1), color: 0xc8a951 };
    projectGroup.add(defenseGroup);
    projectObjects.defense = defenseGroup;

    // -- Platform: Wireframe Globe with rings --
    var platformGroup = new THREE.Group();
    var globeGeom = new THREE.SphereGeometry(isMobile ? 1.8 : 2.5, 24, 16);
    platformGroup.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(globeGeom),
        edgeMaterial(0x7b8cc8)
    ));
    // extra horizontal ring
    var hRing = new THREE.TorusGeometry(isMobile ? 1.8 : 2.5, 0.03, 8, 64);
    platformGroup.add(new THREE.Mesh(hRing, new THREE.MeshBasicMaterial({
        color: 0x7b8cc8, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false,
    })));
    platformGroup.position.set(-3.5, 0, -1);
    platformGroup.scale.set(0.01, 0.01, 0.01);
    platformGroup.userData = { targetPos: new THREE.Vector3(-3.5, 0, -1), color: 0x7b8cc8 };
    projectGroup.add(platformGroup);
    projectObjects.platform = platformGroup;

    // -- Digital: Torus Knot --
    var digitalGroup = new THREE.Group();
    var knotGeom = new THREE.TorusKnotGeometry(
        isMobile ? 1.2 : 1.7,
        isMobile ? 0.25 : 0.35,
        isMobile ? 64 : 100,
        isMobile ? 8 : 12
    );
    digitalGroup.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(knotGeom),
        edgeMaterial(0x5ea8a0)
    ));
    digitalGroup.position.set(3, -0.5, -1.5);
    digitalGroup.scale.set(0.01, 0.01, 0.01);
    digitalGroup.userData = { targetPos: new THREE.Vector3(3, -0.5, -1.5), color: 0x5ea8a0 };
    projectGroup.add(digitalGroup);
    projectObjects.digital = digitalGroup;

    // -- Agent: Node cluster (like neural network) --
    var agentGroup = new THREE.Group();
    var nodeCount = isMobile ? 15 : 25;
    var nodePositions = [];
    for (var ni = 0; ni < nodeCount; ni++) {
        var nx = (Math.random() - 0.5) * (isMobile ? 3 : 4.5);
        var ny = (Math.random() - 0.5) * (isMobile ? 2.5 : 3.5);
        var nz = (Math.random() - 0.5) * (isMobile ? 2 : 3);
        nodePositions.push([nx, ny, nz]);
        agentGroup.add(new THREE.Mesh(
            new THREE.SphereGeometry(isMobile ? 0.06 : 0.08, 8, 8),
            nodeMaterial(0xc89551)
        )).position.set(nx, ny, nz);
    }
    // Connect nearest pairs
    var linePositions = [];
    for (var ai = 0; ai < nodeCount; ai++) {
        var bestD = Infinity, bestJ = -1;
        for (var bi = ai + 1; bi < nodeCount; bi++) {
            var dx2 = nodePositions[ai][0] - nodePositions[bi][0];
            var dy2 = nodePositions[ai][1] - nodePositions[bi][1];
            var dz2 = nodePositions[ai][2] - nodePositions[bi][2];
            var d2 = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;
            if (d2 < bestD && d2 < (isMobile ? 9 : 16)) { bestD = d2; bestJ = bi; }
        }
        if (bestJ !== -1) {
            linePositions.push(
                nodePositions[ai][0], nodePositions[ai][1], nodePositions[ai][2],
                nodePositions[bestJ][0], nodePositions[bestJ][1], nodePositions[bestJ][2]
            );
        }
    }
    if (linePositions.length > 0) {
        var lineGeom = new THREE.BufferGeometry();
        lineGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
        agentGroup.add(new THREE.LineSegments(lineGeom, edgeMaterial(0xc89551)));
    }
    agentGroup.position.set(-3, 0.6, -1.5);
    agentGroup.scale.set(0.01, 0.01, 0.01);
    agentGroup.userData = { targetPos: new THREE.Vector3(-3, 0.6, -1.5), color: 0xc89551 };
    projectGroup.add(agentGroup);
    projectObjects.agent = agentGroup;

    // ============================================
    //  COMET / STREAK SYSTEM
    // ============================================
    var cometGroup = new THREE.Group();
    cometGroup.visible = false;
    scene.add(cometGroup);

    var cometTrailCount = isMobile ? 20 : 40;
    var cometGeom = new THREE.BufferGeometry();
    var cometPositionsArr = new Float32Array(cometTrailCount * 3);
    cometGeom.setAttribute('position', new THREE.BufferAttribute(cometPositionsArr, 3));
    var cometMesh = new THREE.Points(cometGeom, new THREE.PointsMaterial({
        size: isMobile ? 0.06 : 0.1,
        map: texWarm,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
    }));
    cometGroup.add(cometMesh);

    // Bright head
    var headGeom = new THREE.SphereGeometry(isMobile ? 0.12 : 0.2, 8, 8);
    var headMesh = new THREE.Mesh(headGeom, new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
    }));
    cometGroup.add(headMesh);
    cometGroup.userData = {
        active: false,
        startTime: 0,
        duration: 0.5,
        direction: new THREE.Vector3(),
        startPos: new THREE.Vector3(),
    };

    function fireComet(direction) {
        var ud = cometGroup.userData;
        ud.active = true;
        ud.startTime = performance.now() * 0.001;
        ud.direction.copy(direction);
        ud.startPos.copy(direction).multiplyScalar(-25);
        cometGroup.position.copy(ud.startPos);
        cometGroup.visible = true;
    }

    // ============================================
    //  TRANSITION STATE
    // ============================================
    var currentSection = 'hero';
    var previousSection = 'hero';
    var activeObject = null; // currently visible project object
    var targetObject = null;
    var transState = {
        phase: 'idle', // idle | comet | flying-in | done
        startTime: 0,
        fromObj: null,
        toObj: null,
    };

    function triggerTransition(fromSection, toSection) {
        if (toSection === fromSection) return;
        if (toSection === 'hero') {
            // Going back to hero — hide all project objects
            targetObject = null;
            if (activeObject) {
                transState.phase = 'flying-out';
                transState.startTime = performance.now() * 0.001;
                transState.fromObj = activeObject;
                transState.toObj = null;
            }
            activeObject = null;
            document.body.setAttribute('data-section', 'hero');
            return;
        }

        var objName = null;
        if (toSection === 'proj-defense') objName = 'defense';
        else if (toSection === 'proj-platform') objName = 'platform';
        else if (toSection === 'proj-digital') objName = 'digital';
        else if (toSection === 'proj-agent') objName = 'agent';
        if (!objName) return;

        var newObj = projectObjects[objName];
        if (!newObj || activeObject === newObj) return;

        // Fire comet in a random-ish direction
        var dirs = [
            new THREE.Vector3(1, 0.3, -0.5),
            new THREE.Vector3(-1, -0.2, -0.4),
            new THREE.Vector3(0.5, 0.8, -0.6),
            new THREE.Vector3(-0.7, 0.5, -0.3),
        ];
        var dir = dirs[Math.floor(Math.random() * dirs.length)];
        fireComet(dir);

        transState.phase = 'comet';
        transState.startTime = performance.now() * 0.001;
        transState.fromObj = activeObject;
        transState.toObj = newObj;
        targetObject = newObj;

        var accentKey = toSection.replace('proj-', '');
        document.body.setAttribute('data-section', accentKey);

        previousSection = currentSection;
        currentSection = toSection;
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

    var lastSectionCheck = 'hero';

    function updateSection() {
        var sec = getVisibleSection();
        if (sec !== lastSectionCheck) {
            triggerTransition(lastSectionCheck, sec);
            lastSectionCheck = sec;
        }
    }

    // ============================================
    //  EASING
    // ============================================
    function elasticOut(t) {
        if (t <= 0 || t >= 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * 2 * Math.PI / 0.3) + 1;
    }

    // ============================================
    //  MOUSE / TOUCH
    // ============================================
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
    //  ANIMATION LOOP
    // ============================================
    var clock = new THREE.Clock();
    var burstActive = false;
    var burstStart = 0;

    function animate() {
        requestAnimationFrame(animate);

        var dt = Math.min(clock.getDelta(), 0.12);
        var t = performance.now() * 0.001;

        // Section tracking (throttled)
        if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) {
            updateSection();
        }

        // Smooth mouse
        var lerpSpeed = mouse.isMoving ? 2.5 : 1;
        mouse.x += (mouse.tx - mouse.x) * lerpSpeed * dt;
        mouse.y += (mouse.ty - mouse.y) * lerpSpeed * dt;

        // ---- Transition animation ----
        if (transState.phase === 'comet') {
            var elapsed = t - transState.startTime;
            // Move comet
            var ud = cometGroup.userData;
            var cometProgress = Math.min(elapsed / ud.duration, 1);
            var cp = 1 - Math.pow(1 - cometProgress, 3); // ease-out
            cometGroup.position.copy(ud.startPos).lerp(
                ud.direction.clone().multiplyScalar(25), cp
            );

            // Update trail
            var headPos = cometGroup.position.clone();
            for (var ci = 0; ci < cometTrailCount; ci++) {
                var trailT = ci / cometTrailCount;
                cometPositionsArr[ci * 3] = headPos.x - ud.direction.x * trailT * 8;
                cometPositionsArr[ci * 3 + 1] = headPos.y - ud.direction.y * trailT * 8;
                cometPositionsArr[ci * 3 + 2] = headPos.z - ud.direction.z * trailT * 8;
            }
            cometGeom.attributes.position.needsUpdate = true;
            headMesh.position.copy(headPos);
            headMesh.material.opacity = 1 - cometProgress;

            if (cometProgress >= 1) {
                cometGroup.visible = false;
                transState.phase = 'flying-in';
                transState.startTime = t;
                activeObject = transState.toObj;
                burstActive = true;
                burstStart = t;
            }
        }

        if (transState.phase === 'flying-in' && transState.toObj) {
            var flyElapsed = t - transState.startTime;
            var flyDuration = 1.3;
            var flyProgress = Math.min(flyElapsed / flyDuration, 1);
            var eased = elasticOut(flyProgress);
            transState.toObj.scale.setScalar(eased);
            var ud = transState.toObj.userData;
            if (ud && ud.targetPos) {
                var startZ = ud.targetPos.z - 20;
                transState.toObj.position.z = startZ + (ud.targetPos.z - startZ) * eased;
            }
            if (flyProgress >= 1) {
                transState.phase = 'done';
                burstActive = false;
            }
        }

        if (transState.phase === 'flying-out' && transState.fromObj) {
            var outElapsed = t - transState.startTime;
            var outDuration = 0.6;
            var outProgress = Math.min(outElapsed / outDuration, 1);
            var outEased = outProgress * outProgress; // ease-in (accelerate away)
            transState.fromObj.scale.setScalar(1 - outEased);
            if (outProgress >= 1) {
                transState.fromObj.scale.set(0.01, 0.01, 0.01);
                transState.phase = 'idle';
                transState.fromObj = null;
            }
        }

        // ---- Burst flash ----
        var burstIntensity = 0;
        if (burstActive) {
            var burstElapsed = t - burstStart;
            if (burstElapsed < 0.5) {
                burstIntensity = Math.max(0, 1 - burstElapsed / 0.5) * 2.5;
            } else {
                burstActive = false;
            }
        }

        // ---- Ring rotation ----
        ring1.rotation.z += 0.12 * dt;
        ring2.rotation.z += 0.18 * dt;
        ring3.rotation.z += 0.08 * dt;

        ringGroup.rotation.y += mouse.x * 0.2 * dt;
        ringGroup.rotation.x += mouse.y * 0.15 * dt;
        ringGroup.rotation.y += 0.06 * dt;

        // Ring color shift toward section accent
        var sectionColor = sectionColors[lastSectionCheck] || 0xc8a951;
        var targetCol = new THREE.Color(sectionColor);
        var curCol1 = new THREE.Color(ring1.material.color.getHex());
        curCol1.lerp(targetCol, 0.4 * dt);
        ring1.material.color.set(curCol1);
        ring2.material.color.set(new THREE.Color(sectionColor).multiplyScalar(1.08));
        ring3.material.color.set(new THREE.Color(sectionColor).multiplyScalar(0.92));

        // Center sphere
        var pulse = 1 + Math.sin(t * 1.5) * 0.3;
        centerSphere.scale.setScalar(pulse);
        centerSphere.material.emissiveIntensity = 1.2 + Math.sin(t * 1.5) * 0.6 + burstIntensity * 0.5;

        // ---- Particle animation ----
        allLayers.forEach(function(layer, li) {
            var pos = layer.mesh.geometry.attributes.position.array;
            var orig = layer.origins;
            var speed = [0.35, 0.45, 0.55][li];
            var amp = [0.4, 0.3, 0.25][li] * (1 + burstIntensity * 0.6);
            for (var i = 0; i < pos.length / 3; i++) {
                var ox = orig[i * 3], oy = orig[i * 3 + 1], oz = orig[i * 3 + 2];
                pos[i * 3] = ox + Math.sin(t * speed + oy * 0.4) * amp;
                pos[i * 3 + 1] = oy + Math.cos(t * speed * 0.8 + ox * 0.35) * amp * 0.7;
                pos[i * 3 + 2] = oz + Math.sin(t * speed * 0.6 + ox * 0.3) * amp * 0.6;
            }
            layer.mesh.geometry.attributes.position.needsUpdate = true;
            // Burst: briefly increase particle size
            layer.mesh.material.size = (
                [0.06, 0.04, 0.03][li] +
                Math.random() * ([0.14, 0.10, 0.07][li] - [0.06, 0.04, 0.03][li])
            ) * (1 + burstIntensity * 1.5);
        });

        if (burstActive) {
            particleGroup.children.forEach(function(p) {
                if (p.material && p.material.opacity !== undefined) {
                    p.material.opacity = Math.min(1, p.material.opacity + burstIntensity * 0.3);
                }
            });
        }

        // Particle group rotation
        particleGroup.rotation.y += 0.03 * dt;
        particleGroup.rotation.x += 0.015 * dt;
        particleGroup.rotation.y += mouse.x * 0.08 * dt;
        particleGroup.rotation.x += mouse.y * 0.05 * dt;

        // Project object rotation
        if (activeObject && activeObject.scale.x > 0.1) {
            activeObject.rotation.y += 0.3 * dt;
            activeObject.rotation.x += 0.1 * dt;
            activeObject.rotation.y += mouse.x * 0.3 * dt;
            activeObject.rotation.x += mouse.y * 0.2 * dt;
        }

        // Camera sway
        var scrollFactor = window.scrollY / Math.max(document.body.scrollHeight - H, 1);
        camera.position.x += (mouse.x * 0.7 + scrollFactor * 0.5 - camera.position.x) * 0.8 * dt;
        camera.position.y += (1.2 - mouse.y * 0.5 - camera.position.y) * 0.8 * dt;
        camera.lookAt(0, 0.8, 0);

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
    //  SCROLL INTERACTIONS
    // ============================================
    var scrollHint = document.getElementById('scrollHint');
    if (scrollHint) {
        scrollHint.addEventListener('click', function() {
            var firstProject = document.querySelector('.project');
            if (firstProject) firstProject.scrollIntoView({ behavior: 'smooth' });
        });
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
    //  NUMBER COUNTERS
    // ============================================
    function animateNumber(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        var current = 0, duration = 1200, start = performance.now();
        function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            progress = 1 - Math.pow(1 - progress, 3);
            current = Math.round(target * progress);
            el.textContent = current;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    }

    var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                if (el.classList.contains('reveal')) el.classList.add('visible');
                if (el.classList.contains('reveal-children')) el.classList.add('visible');
                el.querySelectorAll('.big-num[data-count], .met-num[data-count]').forEach(function(num) {
                    if (!num.dataset.animated) { num.dataset.animated = '1'; animateNumber(num); }
                });
                revealObserver.unobserve(el);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal, .reveal-children').forEach(function(el) {
        revealObserver.observe(el);
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
