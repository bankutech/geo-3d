document.addEventListener('DOMContentLoaded', () => {
    // 1. Loading Screen
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
            startTextEffects(); // Start text effects after load
        }, 1000); 
    } else {
        startTextEffects();
    }

    // 2. Custom Cursor
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Add hover effect to interactive elements
        const interactives = document.querySelectorAll('a, .btn, .shape-card, .gallery-item, input, button');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }

    // 3. Scroll Progress Bar
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        });
    }

    // 4. Text Scramble & Typewriter Effects
    function startTextEffects() {
        // Scramble
        const logo = document.getElementById('scramble-logo');
        if (logo) {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let iteration = 0;
            const logoOriginal = "GEO";
            const scrambleInterval = setInterval(() => {
                logo.innerText = logoOriginal.split("")
                    .map((letter, index) => {
                        if(index < iteration) return logoOriginal[index];
                        return letters[Math.floor(Math.random() * 26)];
                    }).join("");
                if(iteration >= logoOriginal.length) clearInterval(scrambleInterval);
                iteration += 1 / 3;
            }, 50);
        }

        // Typewriter
        const typeEl = document.getElementById('typewriter-text');
        if (typeEl) {
            const text = typeEl.getAttribute('data-text');
            typeEl.innerHTML = '';
            let i = 0;
            function typeWriter() {
                if (i < text.length) {
                    typeEl.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 40);
                }
            }
            typeWriter();
        }
    }

    // 5. Scroll Reveal
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // 6. Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            themeToggleBtn.textContent = document.body.classList.contains('light-mode') ? 'Toggle Dark' : 'Toggle Light';
        });
    }

    // 7. Shape Search Filter
    const searchInput = document.getElementById('shape-search');
    if (searchInput) {
        const shapeCards = document.querySelectorAll('.shape-card');
        const noResults = document.getElementById('no-results');
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            let visibleCount = 0;
            shapeCards.forEach(card => {
                if (card.getAttribute('data-shape').includes(term)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        });
    }

    // 7.5 Multi-Page Navigation Links
    document.querySelectorAll('.shape-card').forEach(card => {
        card.addEventListener('click', () => {
            const shapeName = card.getAttribute('data-shape');
            if (document.getElementById('threejs-container')) {
                window.dispatchEvent(new CustomEvent('loadShape', { detail: shapeName }));
                document.getElementById('threejs-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.location.href = `index.html?shape=${shapeName}#viewer`;
            }
        });
    });

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-view');
            if (document.getElementById('threejs-container')) {
                window.dispatchEvent(new CustomEvent('loadView', { detail: viewName }));
                document.getElementById('threejs-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.location.href = `index.html?view=${viewName}#viewer`;
            }
        });
    });

    // 7.6 Scroll Spy for Navigation Links
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active-link');
                // The Home link points to # but there is no section with id="", so we handle hero separately
                if (current === 'hero' && link.getAttribute('href') === '#') {
                    link.classList.add('active-link');
                } else if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active-link');
                }
            });
        });
    }

    // 8. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mainNav.classList.remove('active'));
        });
    }

    // 8.5 Phase 2 UI: FAB & Magnetic & Audio
    const fabTop = document.getElementById('fab-top');
    if (fabTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) fabTop.style.display = 'flex';
            else fabTop.style.display = 'none';
        });
        fabTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    let audioCtx;
    function playBeep() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if(audioCtx.state === 'suspended') audioCtx.resume();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // Low volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            console.warn("AudioContext not supported or blocked by browser policy:", e);
        }
    }

    // Add beep to all buttons
    document.querySelectorAll('button, .shape-card, .gallery-item').forEach(el => {
        el.addEventListener('mousedown', playBeep);
    });

    // 9. Mouse Glow Effect
    const glow = document.getElementById('mouse-glow');
    if (glow) {
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }

    // 9. Canvas Particle Background
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        for (let i = 0; i < 100; i++) particles.push(new Particle());
        
        const heroEl = document.getElementById('hero');
        let isParticlesVisible = true;
        if (heroEl) {
            const particleObserver = new IntersectionObserver((entries) => {
                isParticlesVisible = entries[0].isIntersecting;
            }, { threshold: 0 });
            particleObserver.observe(heroEl);
        }

        const animateParticles = () => {
            if (isParticlesVisible) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => { p.update(); p.draw(); });
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // 10. Three.js Engine with Bloom & Interactive Lighting
    // =====================================================
    // HERO 3D SCENE — Immersive animated landing
    // =====================================================
    const heroContainer = document.getElementById('hero-3d-canvas');
    if (heroContainer && typeof THREE !== 'undefined') {
        const heroScene = new THREE.Scene();
        heroScene.fog = new THREE.FogExp2(0x050816, 0.045);

        const heroCamera = new THREE.PerspectiveCamera(60, heroContainer.clientWidth / heroContainer.clientHeight, 0.1, 200);
        heroCamera.position.set(0, 0, 18);

        const heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
        heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        heroRenderer.setClearColor(0x050816, 1);
        heroContainer.appendChild(heroRenderer.domElement);

        // Bloom post-processing for hero
        let heroComposer = null;
        const setupBloom = () => {
            try {
                const renderPass = new THREE.RenderPass(heroScene, heroCamera);
                const bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(heroContainer.clientWidth, heroContainer.clientHeight),
                    1.5, 0.4, 0.85
                );
                bloomPass.threshold = 0.1;
                bloomPass.strength = 1.8;
                bloomPass.radius = 0.6;
                heroComposer = new THREE.EffectComposer(heroRenderer);
                heroComposer.addPass(renderPass);
                heroComposer.addPass(bloomPass);
            } catch(e) {
                console.warn('Bloom not available for hero, using standard rendering');
            }
        };
        // Delay bloom setup to ensure all post-processing scripts are loaded
        setTimeout(setupBloom, 100);

        // Lights
        heroScene.add(new THREE.AmbientLight(0xffffff, 0.15));
        const heroP1 = new THREE.PointLight(0x00e5ff, 2.5, 60);
        heroP1.position.set(10, 15, 10);
        heroScene.add(heroP1);
        const heroP2 = new THREE.PointLight(0x7c3aed, 2, 60);
        heroP2.position.set(-10, -10, -5);
        heroScene.add(heroP2);
        const heroP3 = new THREE.PointLight(0xff6b9d, 1.2, 40);
        heroP3.position.set(5, -8, 12);
        heroScene.add(heroP3);

        // Floating wireframe shapes
        const heroShapes = [];
        const shapeConfigs = [
            { geo: () => new THREE.IcosahedronGeometry(1.5, 0), color: 0x00e5ff },
            { geo: () => new THREE.DodecahedronGeometry(1.8, 0), color: 0x7c3aed },
            { geo: () => new THREE.OctahedronGeometry(1.2, 0), color: 0x00e5ff },
            { geo: () => new THREE.TetrahedronGeometry(1.4, 0), color: 0xff6b9d },
            { geo: () => new THREE.TorusGeometry(1.2, 0.4, 8, 12), color: 0x7c3aed },
            { geo: () => new THREE.IcosahedronGeometry(2.0, 1), color: 0x00e5ff },
            { geo: () => new THREE.BoxGeometry(1.6, 1.6, 1.6), color: 0x7c3aed },
            { geo: () => new THREE.OctahedronGeometry(1.0, 0), color: 0xff6b9d },
            { geo: () => new THREE.DodecahedronGeometry(1.3, 0), color: 0x00e5ff },
            { geo: () => new THREE.TetrahedronGeometry(1.1, 0), color: 0x7c3aed },
            { geo: () => new THREE.TorusKnotGeometry(0.8, 0.25, 64, 8), color: 0x00e5ff },
            { geo: () => new THREE.IcosahedronGeometry(0.9, 0), color: 0xff6b9d },
            { geo: () => new THREE.ConeGeometry(0.8, 1.6, 5), color: 0x7c3aed },
            { geo: () => new THREE.CylinderGeometry(0.5, 0.5, 1.5, 6), color: 0x00e5ff },
            { geo: () => new THREE.DodecahedronGeometry(0.7, 0), color: 0xff6b9d },
            { geo: () => new THREE.TorusGeometry(1.5, 0.2, 16, 20), color: 0x00e5ff },
            { geo: () => new THREE.OctahedronGeometry(1.5, 1), color: 0x7c3aed },
            { geo: () => new THREE.IcosahedronGeometry(1.2, 0), color: 0xff6b9d }
        ];

        shapeConfigs.forEach((cfg, i) => {
            const mat = new THREE.MeshStandardMaterial({
                color: cfg.color,
                wireframe: true,
                emissive: cfg.color,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.85
            });
            const mesh = new THREE.Mesh(cfg.geo(), mat);

            // Distribute shapes in a 3D space
            const angle = (i / shapeConfigs.length) * Math.PI * 2;
            const radius = 6 + Math.random() * 12; // slightly wider spread
            const ySpread = (Math.random() - 0.5) * 16;

            mesh.position.set(
                Math.cos(angle) * radius,
                ySpread,
                Math.sin(angle) * radius - 8
            );

            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // Entrance animation: start at scale 0
            mesh.scale.set(0, 0, 0);

            const shapeData = {
                mesh,
                rotSpeed: { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.01, z: (Math.random() - 0.5) * 0.005 },
                floatSpeed: 0.3 + Math.random() * 0.5,
                floatAmp: 0.3 + Math.random() * 0.6,
                baseY: mesh.position.y,
                orbitSpeed: (Math.random() - 0.5) * 0.0008,
                orbitAngle: angle,
                orbitRadius: radius,
                targetScale: 0.6 + Math.random() * 0.9,
                currentScale: 0,
                entranceDelay: i * 90, // faster stagger
                entranceStarted: false
            };

            heroShapes.push(shapeData);
            heroScene.add(mesh);
        });

        // 3D Particles
        const particleCount = 1200;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
        }
        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x00e5ff,
            size: 0.06,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        const particleSystem = new THREE.Points(particleGeom, particleMat);
        heroScene.add(particleSystem);

        // Mouse tracking for camera parallax
        let heroMouseX = 0, heroMouseY = 0;
        document.addEventListener('mousemove', (e) => {
            heroMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            heroMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Scroll parallax
        let heroScrollY = 0;
        window.addEventListener('scroll', () => {
            heroScrollY = window.scrollY;
        });

        // Animate
        const heroStartTime = performance.now();
        let heroVisible = true;
        
        // Only animate when hero is visible
        const heroObserver = new IntersectionObserver((entries) => {
            heroVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        heroObserver.observe(heroContainer);

        const animateHero = () => {
            requestAnimationFrame(animateHero);
            if (!heroVisible) return;

            const elapsed = performance.now() - heroStartTime;

            // Entrance animations & dynamic pulsing
            heroShapes.forEach((s, idx) => {
                if (!s.entranceStarted && elapsed > s.entranceDelay) {
                    s.entranceStarted = true;
                }
                if (s.entranceStarted && s.currentScale < s.targetScale) {
                    s.currentScale += (s.targetScale - s.currentScale) * 0.04;
                    if (Math.abs(s.targetScale - s.currentScale) < 0.001) s.currentScale = s.targetScale;
                    s.mesh.scale.set(s.currentScale, s.currentScale, s.currentScale);
                }

                // Dynamic pulse: change emissive intensity over time
                if (s.entranceStarted) {
                    const pulse = Math.sin(elapsed * 0.002 + idx) * 0.4 + 0.6; // 0.2 to 1.0
                    s.mesh.material.emissiveIntensity = pulse;
                }

                // Rotate
                s.mesh.rotation.x += s.rotSpeed.x * 1.5;
                s.mesh.rotation.y += s.rotSpeed.y * 1.5;
                s.mesh.rotation.z += s.rotSpeed.z * 1.5;

                // Float up/down
                s.mesh.position.y = s.baseY + Math.sin(elapsed * 0.001 * s.floatSpeed) * (s.floatAmp * 1.5);

                // Dynamic orbit
                s.orbitAngle += s.orbitSpeed * 1.2;
                s.mesh.position.x = Math.cos(s.orbitAngle) * s.orbitRadius;
                s.mesh.position.z = Math.sin(s.orbitAngle) * s.orbitRadius - 8;
            });

            // Particle rotation (a bit faster for dynamism)
            particleSystem.rotation.y += 0.0004;
            particleSystem.rotation.x += 0.0001;

            // Camera mouse parallax (smooth lerp with larger amplitude)
            const targetCamX = heroMouseX * 3.5;
            const targetCamY = -heroMouseY * 2.0 + 1;
            heroCamera.position.x += (targetCamX - heroCamera.position.x) * 0.03;
            heroCamera.position.y += (targetCamY - heroCamera.position.y) * 0.03;

            // Scroll depth parallax
            const scrollOffset = heroScrollY * 0.01;
            heroCamera.position.z = 18 - scrollOffset;
            heroCamera.rotation.x = scrollOffset * 0.025;

            // Fade scroll hint faster
            const scrollHint = document.querySelector('.hero-scroll-hint');
            if (scrollHint) {
                scrollHint.style.opacity = Math.max(0, 0.8 - heroScrollY * 0.003);
                scrollHint.style.transform = `translateY(${heroScrollY * 0.1}px)`;
            }

            heroCamera.lookAt(0, 0, -5);

            if (heroComposer) {
                heroComposer.render();
            } else {
                heroRenderer.render(heroScene, heroCamera);
            }
        };
        animateHero();

        // Responsive resize
        window.addEventListener('resize', () => {
            if (!heroContainer || heroContainer.clientWidth === 0) return;
            heroCamera.aspect = heroContainer.clientWidth / heroContainer.clientHeight;
            heroCamera.updateProjectionMatrix();
            heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
            if (heroComposer) heroComposer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
        });
    }

    // =====================================================
    // VIEWER 3D SCENE — Interactive shape explorer
    // =====================================================
    const container = document.getElementById('threejs-container');
    if (container && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5 for Bloom performance
        container.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;

        // Axis Gizmo Helper
        const axesHelper = new THREE.AxesHelper(3);
        scene.add(axesHelper);

        
class PhysicsEngine {
    constructor() {
        this.enabled = false;
        this.world = null;
        this.shapeBody = null;
        this.floorBody = null;
        
        if (typeof CANNON !== "undefined") {
            this.world = new CANNON.World();
            this.world.gravity.set(0, -9.82, 0);
            this.world.broadphase = new CANNON.NaiveBroadphase();
            
            const floorShape = new CANNON.Plane();
            this.floorBody = new CANNON.Body({ mass: 0, shape: floorShape });
            this.floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            this.floorBody.position.y = -3;
            this.world.addBody(this.floorBody);
            
            const defaultMaterial = new CANNON.Material("default");
            const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
                friction: 0.1,
                restitution: 0.7
            });
            this.world.addContactMaterial(contactMaterial);
        }
    }
    
    setShape(shapeName, geometry, hx, hy, hz) {
        if (!this.world) return;
        if (this.shapeBody) this.world.removeBody(this.shapeBody);
        
        this.shapeBody = new CANNON.Body({ mass: 1 });
        
        const roundShapes = ["sphere", "dodecahedron", "icosahedron", "ellipsoid", "torus", "torus_knot", "hemisphere"];
        const cylindricalShapes = ["cylinder", "cone", "prism_3", "prism_5", "prism_6", "pyramid_3", "pyramid_4", "pyramid_5", "pyramid_6", "frustum"];

        if (roundShapes.includes(shapeName)) {
            geometry.computeBoundingSphere();
            this.shapeBody.addShape(new CANNON.Sphere(geometry.boundingSphere.radius));
        } else if (cylindricalShapes.includes(shapeName)) {
            const rTop = geometry.parameters.radiusTop !== undefined ? geometry.parameters.radiusTop : (shapeName.includes("cone") || shapeName.includes("pyramid") ? 0 : 1.5);
            const rBot = geometry.parameters.radiusBottom !== undefined ? geometry.parameters.radiusBottom : (geometry.parameters.radius || 1.5);
            const h = geometry.parameters.height || (hy * 2);
            const segs = geometry.parameters.radialSegments || 16;
            
            const cylShape = new CANNON.Cylinder(rTop, rBot, h, segs);
            const q = new CANNON.Quaternion();
            q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            this.shapeBody.addShape(cylShape, new CANNON.Vec3(0,0,0), q);
        } else {
            this.shapeBody.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)));
        }

        this.shapeBody.position.set(0, 0, 0);
        this.world.addBody(this.shapeBody);
    }
}
const physics = new PhysicsEngine();


        // Interactive Mouse Light
        const mouseLight = new THREE.PointLight(0xffffff, 0.8, 20);
        scene.add(mouseLight);
        
        // Map mouse to 3D world for light
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
            
            const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));
            
            mouseLight.position.copy(pos);
            mouseLight.position.z = 4; // Moved back to prevent extreme blowout on solid shapes
        });

        // Ambient Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const pointLight1 = new THREE.PointLight(0x00e5ff, 1.0, 50);
        pointLight1.position.set(5, 5, 5);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0x7c3aed, 1.0, 50);
        pointLight2.position.set(-5, -5, 5);
        scene.add(pointLight2);

        // Bloom Post-Processing
        const renderScene = new THREE.RenderPass(scene, camera);
        const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.2;
        bloomPass.strength = 0.5; // Reduced to prevent blinding white cores
        bloomPass.radius = 0.5;

        const composer = new THREE.EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        let currentMesh = null;
        let baseColor = 0x00e5ff;
        
        const materials = {
            wireframe: new THREE.MeshStandardMaterial({ color: baseColor, wireframe: true, emissive: 0x000000 }),
            solid: new THREE.MeshStandardMaterial({ color: baseColor, wireframe: false, roughness: 0.5, metalness: 0.1 }),
            neon: new THREE.MeshStandardMaterial({ color: baseColor, wireframe: true, emissive: baseColor, emissiveIntensity: 0.5 }),
            educational: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, wireframe: false, flatShading: true, roughness: 0.8, metalness: 0.1 })
        };
        let currentMaterial = materials.neon;

        // Geometry Calculator Stats
        const statV = document.getElementById('stat-vertices');
        const statE = document.getElementById('stat-edges');
        const statF = document.getElementById('stat-faces');
        const activeShapeTitle = document.getElementById('active-shape-title');

        const updateGeometryStats = (shapeName, geometry) => {
            const mathStats = {
                // Platonic Solids
                'tetrahedron': { v: 4, e: 6, f: 4 },
                'cube': { v: 8, e: 12, f: 6 },
                'octahedron': { v: 6, e: 12, f: 8 },
                'dodecahedron': { v: 20, e: 30, f: 12 },
                'icosahedron': { v: 12, e: 30, f: 20 },
                
                // Prisms & Cuboids
                'prism_3': { v: 6, e: 9, f: 5 },
                'prism_4': { v: 8, e: 12, f: 6 },
                'cuboid': { v: 8, e: 12, f: 6 },
                'prism_5': { v: 10, e: 15, f: 7 },
                'prism_6': { v: 12, e: 18, f: 8 },
                
                // Pyramids
                'pyramid_3': { v: 4, e: 6, f: 4 },
                'pyramid_4': { v: 5, e: 8, f: 5 },
                'pyramid_5': { v: 6, e: 10, f: 6 },
                'pyramid_6': { v: 7, e: 12, f: 7 },
                
                // Other Polyhedra
                'bipyramid': { v: 6, e: 12, f: 8 },
                'antiprism': { v: 6, e: 12, f: 8 },
                
                // Curved/Topological Solids
                'sphere': { v: 0, e: 0, f: 1 },
                'hemisphere': { v: 0, e: 1, f: 2 },
                'cylinder': { v: 0, e: 2, f: 3 },
                'cone': { v: 1, e: 1, f: 2 },
                'torus': { v: 0, e: 0, f: 1 },
                'ellipsoid': { v: 0, e: 0, f: 1 },
                'capsule': { v: 0, e: 0, f: 1 },
                'frustum': { v: 0, e: 2, f: 3 }
            };

            if (mathStats[shapeName]) {
                statV.textContent = mathStats[shapeName].v;
                statE.textContent = mathStats[shapeName].e;
                statF.textContent = mathStats[shapeName].f;
            } else {
                // Fallback to mesh stats for complex curves (e.g. torus_knot)
                let vertices = 0;
                let faces = 0;
                let edges = 0;

                if (geometry.attributes && geometry.attributes.position) {
                    vertices = geometry.attributes.position.count;
                    faces = geometry.index ? geometry.index.count / 3 : vertices / 3;
                    edges = Math.max(0, vertices + faces - 2);
                }

                statV.textContent = vertices + " (Mesh)";
                statE.textContent = edges + " (Mesh)";
                statF.textContent = faces + " (Mesh)";
            }
        }

        const loadShape = (shapeName) => {
            if (currentMesh) {
                scene.remove(currentMesh);
                if (currentMesh.geometry) currentMesh.geometry.dispose();
                if (currentMesh.material) currentMesh.material.dispose();
            }

            let geometry;
            switch(shapeName) {
                // Basic
                case 'cube': geometry = new THREE.BoxGeometry(2, 2, 2); break;
                case 'cuboid': geometry = new THREE.BoxGeometry(2.5, 1.5, 1); break;
                case 'sphere': geometry = new THREE.SphereGeometry(1.5, 32, 32); break;
                case 'hemisphere': geometry = new THREE.SphereGeometry(1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2); break;
                case 'cylinder': geometry = new THREE.CylinderGeometry(1, 1, 3, 32); break;
                case 'cone': geometry = new THREE.ConeGeometry(1.5, 3, 32); break;
                
                // Pyramids (Cone with distinct radial segments)
                case 'pyramid_3': geometry = new THREE.TetrahedronGeometry(1.5); break;
                case 'pyramid_4': geometry = new THREE.CylinderGeometry(0, 1.5, 3, 4); break;
                case 'pyramid_5': geometry = new THREE.CylinderGeometry(0, 1.5, 3, 5); break;
                case 'pyramid_6': geometry = new THREE.CylinderGeometry(0, 1.5, 3, 6); break;

                // Prisms (Cylinder with distinct radial segments)
                case 'prism_3': geometry = new THREE.CylinderGeometry(1.2, 1.2, 3, 3); break;
                case 'prism_4': geometry = new THREE.BoxGeometry(2, 3, 2); break;
                case 'prism_5': geometry = new THREE.CylinderGeometry(1.2, 1.2, 3, 5); break;
                case 'prism_6': geometry = new THREE.CylinderGeometry(1.2, 1.2, 3, 6); break;

                // Platonic
                case 'tetrahedron': geometry = new THREE.TetrahedronGeometry(1.5); break;
                case 'octahedron': geometry = new THREE.OctahedronGeometry(1.5); break;
                case 'dodecahedron': geometry = new THREE.DodecahedronGeometry(1.5); break;
                case 'icosahedron': geometry = new THREE.IcosahedronGeometry(1.5); break;

                // Other
                case 'torus': geometry = new THREE.TorusGeometry(1.2, 0.5, 16, 100); break;
                case 'ellipsoid': 
                    geometry = new THREE.SphereGeometry(1.5, 32, 32); 
                    geometry.scale(1, 0.5, 0.8); // Scale down Y and Z to make it an ellipsoid
                    break;
                case 'frustum': geometry = new THREE.CylinderGeometry(0.8, 1.5, 3, 32); break; // Truncated cone
                case 'capsule': 
                    // CapsuleGeometry doesn't exist in r128 natively without examples, we'll approximate using a cylinder and two spheres or just Extrude. Wait, CapsuleGeometry was added in r130+.
                    // We'll use a trick: Sphere geometry scaled, or let's use a Cylinder merged, or just use a TorusKnot placeholder if unsupported.
                    // Let's create a custom capsule using Extrude or Lathe? Or simpler: a thick short cylinder with a very high bevel (not easy).
                    // Actually, a tall sphere looks like a capsule if we stretch it? No, that's an ellipsoid.
                    // We'll use an Icosahedron as placeholder if we can't do Capsule, but actually we can just scale a sphere for now or use `THREE.TorusKnot`. Let's use an Ellipsoid-like shape for Capsule (stretched Y).
                    geometry = new THREE.SphereGeometry(1, 32, 32);
                    geometry.scale(1, 2, 1);
                    break;
                case 'bipyramid': geometry = new THREE.OctahedronGeometry(1.5); break; // Octahedron is a square bipyramid
                case 'antiprism': geometry = new THREE.OctahedronGeometry(1.5); break; // Tetrahedron is a digonal antiprism. We'll use Octahedron as triangular antiprism.

            default: geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
            }

            // Fix off-center geometries (like Hemisphere, Pyramids) so they spin perfectly on their axis
            geometry.center();

            currentMesh = new THREE.Mesh(geometry, currentMaterial);
            scene.add(currentMesh);
            updateGeometryStats(shapeName, geometry);

            // Re-sync Physics Body
            geometry.computeBoundingBox();
            const hx = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
            const hy = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
            const hz = (geometry.boundingBox.max.z - geometry.boundingBox.min.z) / 2;
            physics.setShape(shapeName, geometry, hx, hy, hz);
            if (physics.enabled && physics.shapeBody) {
                        physics.shapeBody.position.set(0, 2, 0);
                        physics.shapeBody.velocity.set(0, 0, 0);
                        physics.shapeBody.angularVelocity.set(Math.random(), Math.random(), Math.random());
                    } else if (currentMesh) {
                currentMesh.position.set(0, 0, 0);
                currentMesh.quaternion.set(0, 0, 0, 1);
            }
            
            // Update Active Shape Title
            if (activeShapeTitle) {
                const cleanName = shapeName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                activeShapeTitle.textContent = cleanName;
            }

            // Explosion animation simulation on load
            const meshToScale = currentMesh;
            meshToScale.scale.set(0.1, 0.1, 0.1);
            let growScale = 0.1;
            const explodeIn = () => {
                if(growScale < 1 && meshToScale === currentMesh) {
                    growScale += 0.05;
                    meshToScale.scale.set(growScale, growScale, growScale);
                    requestAnimationFrame(explodeIn);
                }
            };
            explodeIn();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const initialShape = urlParams.get('shape') || 'torus_knot';
        const initialView = urlParams.get('view') || 'neon';
        
        if (materials[initialView]) {
            currentMaterial = materials[initialView];
            if (initialView === 'neon' && bloomPass) {
                bloomPass.strength = 0.6;
                bloomPass.enabled = true;
            }
            else if (bloomPass) {
                bloomPass.strength = 0;
                bloomPass.enabled = false;
            }
        }

        loadShape(initialShape);

        // Listen for dynamic load events
        window.addEventListener('loadShape', (e) => loadShape(e.detail));
        window.addEventListener('loadView', (e) => {
            const view = e.detail;
            if (materials[view]) {
                currentMaterial = materials[view];
                if (currentMesh) {
                    currentMesh.material = currentMaterial;
                    currentMesh.material.needsUpdate = true;
                }
                if (view === 'neon' && bloomPass) {
                    bloomPass.strength = 0.6;
                    bloomPass.enabled = true;
                }
                else if (bloomPass) {
                    bloomPass.strength = 0;
                    bloomPass.enabled = false;
                }
            }
        });

        // Color Picker Logic
        const colorPicker = document.getElementById('shape-color');
        colorPicker.addEventListener('input', (e) => {
            baseColor = new THREE.Color(e.target.value);
            materials.wireframe.color = baseColor;
            materials.solid.color = baseColor;
            materials.neon.color = baseColor;
            materials.neon.emissive = baseColor;
            // Update lights to match
            pointLight1.color = baseColor;
            if(currentMesh) currentMesh.material.needsUpdate = true;
        });

        // Gamification Controls
        const btnGravity = document.getElementById('btn-gravity');
        if (btnGravity) {
            btnGravity.addEventListener('click', () => {
                physics.enabled = !physics.enabled;
                if (physics.enabled && currentMesh && physics.shapeBody) {
                    physics.shapeBody.position.set(currentMesh.position.x, currentMesh.position.y + 4, currentMesh.position.z);
                    physics.shapeBody.velocity.set(0, 0, 0);
                    physics.shapeBody.angularVelocity.set(
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10
                    );
                    btnGravity.style.background = 'var(--primary)';
                    btnGravity.style.color = 'var(--bg-dark)';
                    btnGravity.setAttribute('aria-pressed', 'true');
                } else {
                    btnGravity.style.background = 'transparent';
                    btnGravity.style.color = 'var(--text-primary)';
                    btnGravity.setAttribute('aria-pressed', 'false');
                }
            });
        }

        const btnScreenshot = document.getElementById('btn-screenshot');
        if (btnScreenshot) {
            btnScreenshot.addEventListener('click', () => {
                const dataURL = renderer.domElement.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = dataURL;
                a.download = 'GEO3D_Screenshot.png';
                a.click();
            });
        }

        const btnExport = document.getElementById('btn-export-obj');
        if (btnExport && typeof THREE.OBJExporter !== 'undefined') {
            btnExport.addEventListener('click', () => {
                if(currentMesh) {
                    const exporter = new THREE.OBJExporter();
                    const result = exporter.parse(currentMesh);
                    const blob = new Blob([result], { type: 'text/plain' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'GEO3D_Model.obj';
                    a.click();
                }
            });
        }

        let spinSpeed = 0.01;
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                spinSpeed = parseFloat(e.target.value);
            });
        }

        window.addEventListener('resize', () => {
            if (!container || container.clientWidth === 0) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            composer.setSize(container.clientWidth, container.clientHeight);
        });

        const animate3D = () => {
            requestAnimationFrame(animate3D);
            if (currentMesh) {
                if (physics.enabled && physics.shapeBody) {
                    physics.world.step(1/60);
                    currentMesh.position.copy(physics.shapeBody.position);
                    currentMesh.quaternion.copy(physics.shapeBody.quaternion);
                } else {
                    currentMesh.rotation.x += spinSpeed * 0.5;
                    currentMesh.rotation.y += spinSpeed;
                    
                    // Smooth return to center when physics is disabled
                    currentMesh.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
                    currentMesh.quaternion.slerp(new THREE.Quaternion(0, 0, 0, 1), 0.05);
                }
                
                // Keep the axes helper locked to the object's position so it doesn't get left behind
                if (typeof axesHelper !== 'undefined') {
                    axesHelper.position.copy(currentMesh.position);
                }
            }
            controls.update();
            
            // Only use composer for neon to prevent UnrealBloomPass from breaking solid material rendering
            if (currentMaterial === materials.neon) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }
        }
        animate3D();
        
        // Phase 2: Hero Parallax
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 15;
                const y = (e.clientY / window.innerHeight - 0.5) * 15;
                heroContent.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg)`;
            });
        }
    }
});
