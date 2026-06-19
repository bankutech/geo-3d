document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Logic
    const navItems = document.querySelectorAll('#nav-list li');
    const modules = document.querySelectorAll('.module');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-t');
            modules.forEach(mod => {
                mod.classList.remove('active');
                if (mod.id === targetId) {
                    mod.classList.add('active');
                    if (window.MuseumEngine) window.MuseumEngine.loadTopic(targetId);
                }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // 2. Global 3D Museum Engine
    if (!window.THREE) {
        console.error("Three.js not loaded.");
        return;
    }

    class GeometryMuseum {
        constructor() {
            this.canvas = document.getElementById('global-3d-canvas');
            if(!this.canvas) return;
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            this.renderer.setScissorTest(true);

            this.scene = new THREE.Scene();
            // Optional background fog
            this.scene.fog = new THREE.FogExp2(0x050816, 0.02);

            this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            this.camera.position.set(0, 0, 10);

            // Lighting
            const ambient = new THREE.AmbientLight(0xffffff, 0.4);
            this.scene.add(ambient);
            const directional = new THREE.DirectionalLight(0xffffff, 0.8);
            directional.position.set(5, 10, 5);
            this.scene.add(directional);
            const point = new THREE.PointLight(0x00e5ff, 1, 20);
            point.position.set(-5, -5, 5);
            this.scene.add(point);

            this.activeObjects = [];
            this.activeViewport = null;
            this.animationId = null;
            this.controls = null;
            this.time = 0;

            window.addEventListener('resize', this.resize.bind(this));
            this.resize();

            // Interactivity setup
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            this.isDragging = false;
            this.draggedObject = null;

            this.animate = this.animate.bind(this);
            this.animate();
        }

        resize() {
            if(!this.renderer) return;
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        clearScene() {
            this.activeObjects.forEach(obj => {
                this.scene.remove(obj);
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
            });
            this.activeObjects = [];
            if (this.controls) { this.controls.dispose(); this.controls = null; }
            this.camera.position.set(0, 0, 10);
            this.camera.lookAt(0,0,0);
        }

        loadTopic(topicId) {
            this.clearScene();
            this.activeViewport = null;

            const material = new THREE.MeshStandardMaterial({ 
                color: 0x00e5ff, roughness: 0.1, metalness: 0.3,
                transparent: true, opacity: 0.8, side: THREE.DoubleSide
            });
            const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

            if (topicId === 'm-intro') {
                // Background universe
                const geo = new THREE.IcosahedronGeometry(3, 1);
                const mesh = new THREE.Mesh(geo, material);
                this.scene.add(mesh);
                this.activeObjects.push(mesh);
                
                const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), wireMat);
                mesh.add(wire);
                
                // Set viewport to null to render full screen
                this.activeViewport = null;
                this.customAnimation = () => {
                    mesh.rotation.y += 0.005;
                    mesh.rotation.x += 0.005;
                };
            }
            else if (topicId === 'm-basics') {
                this.activeViewport = document.getElementById('basics-canvas');
                this.camera.position.set(0, 5, 10);
                this.camera.lookAt(0,0,0);

                // Create a floating grid plane
                const grid = new THREE.GridHelper(20, 20, 0x00e5ff, 0x00e5ff);
                grid.material.opacity = 0.2; grid.material.transparent = true;
                this.scene.add(grid); this.activeObjects.push(grid);

                const type = window.currentBasicType || 'point';
                const sphGeo = new THREE.SphereGeometry(0.2);
                const matW = new THREE.MeshBasicMaterial({color: 0xffffff});
                const matG = new THREE.MeshBasicMaterial({color: 0x10b981});

                if (type === 'point') {
                    const pt = new THREE.Mesh(sphGeo, matW);
                    this.scene.add(pt); this.activeObjects.push(pt);
                    this.customAnimation = () => { pt.position.y = 1 + Math.sin(this.time*2)*0.5; };
                } else if (type === 'line' || type === 'segment' || type === 'ray') {
                    const ptA = new THREE.Mesh(sphGeo, matW); ptA.position.set(-3, 1, 0);
                    const ptB = new THREE.Mesh(sphGeo, matG); ptB.position.set(3, 1, 0);
                    this.scene.add(ptA, ptB); this.activeObjects.push(ptA, ptB);
                    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10,1,0), new THREE.Vector3(10,1,0)]);
                    if(type === 'segment') lineGeo.setFromPoints([ptA.position, ptB.position]);
                    if(type === 'ray') lineGeo.setFromPoints([ptA.position, new THREE.Vector3(10,1,0)]);
                    const lineMat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
                    const line = new THREE.Line(lineGeo, lineMat);
                    this.scene.add(line); this.activeObjects.push(line);
                    this.customAnimation = () => {
                        ptA.position.y = 1 + Math.sin(this.time*2) * 0.5;
                        ptB.position.y = 1 + Math.cos(this.time*1.5) * 0.5;
                        if(type === 'segment') line.geometry.setFromPoints([ptA.position, ptB.position]);
                        if(type === 'line') line.geometry.setFromPoints([new THREE.Vector3(-10, ptA.position.y - (ptB.position.y-ptA.position.y)*1.5, 0), new THREE.Vector3(10, ptA.position.y + (ptB.position.y-ptA.position.y)*1.5, 0)]);
                        if(type === 'ray') line.geometry.setFromPoints([ptA.position, new THREE.Vector3(10, ptA.position.y + (ptB.position.y-ptA.position.y)*2, 0)]);
                    };
                } else if (type === 'plane') {
                    const planeGeo = new THREE.PlaneGeometry(6, 6);
                    const planeMat = new THREE.MeshBasicMaterial({color: 0x00e5ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide});
                    const plane = new THREE.Mesh(planeGeo, planeMat);
                    plane.rotation.x = Math.PI/2;
                    this.scene.add(plane); this.activeObjects.push(plane);
                    this.customAnimation = () => { plane.position.y = Math.sin(this.time)*0.5; };
                } else if (type === 'collinear') {
                    const p1 = new THREE.Mesh(sphGeo, matW); p1.position.set(-3, 1, 0);
                    const p2 = new THREE.Mesh(sphGeo, matG); p2.position.set(0, 1, 0);
                    const p3 = new THREE.Mesh(sphGeo, matW); p3.position.set(3, 1, 0);
                    this.scene.add(p1, p2, p3); this.activeObjects.push(p1, p2, p3);
                    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10,1,0), new THREE.Vector3(10,1,0)]);
                    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2, transparent: true, opacity: 0.3}));
                    this.scene.add(line); this.activeObjects.push(line);
                    this.customAnimation = () => {
                        const y = 1 + Math.sin(this.time)*0.5;
                        p1.position.y = p2.position.y = p3.position.y = y;
                        line.geometry.setFromPoints([new THREE.Vector3(-10,y,0), new THREE.Vector3(10,y,0)]);
                    };
                } else if (type === 'coplanar') {
                    const planeGeo = new THREE.PlaneGeometry(6, 6);
                    const planeMat = new THREE.MeshBasicMaterial({color: 0x00e5ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide});
                    const plane = new THREE.Mesh(planeGeo, planeMat);
                    plane.rotation.x = Math.PI/2;
                    this.scene.add(plane); this.activeObjects.push(plane);
                    
                    const p1 = new THREE.Mesh(sphGeo, matW); p1.position.set(-2, 0, -2);
                    const p2 = new THREE.Mesh(sphGeo, matG); p2.position.set(2, 0, -1);
                    const p3 = new THREE.Mesh(sphGeo, matW); p3.position.set(0, 0, 2);
                    const p4 = new THREE.Mesh(sphGeo, matG); p4.position.set(-1, 0, 1);
                    plane.add(p1, p2, p3, p4);
                    
                    this.customAnimation = () => {
                        plane.position.y = Math.sin(this.time)*0.5;
                        plane.rotation.x = Math.PI/2 + Math.sin(this.time*0.5)*0.2;
                    };
                }
            }
            else if (topicId === 'm-angles') {
                this.activeViewport = document.getElementById('angle-canvas');
                const slider = document.getElementById('angle-slider');
                
                const baseLine = new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(3,0,0)]),
                    new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 3})
                );
                const movingLine = new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(3,0,0)]),
                    new THREE.LineBasicMaterial({color: 0x00e5ff, linewidth: 3})
                );
                this.scene.add(baseLine, movingLine);
                this.activeObjects.push(baseLine, movingLine);

                // 3D Sector (Pie slice) to represent the angle
                const sectorGeo = new THREE.CylinderGeometry(2, 2, 0.1, 32, 1, false, 0, 0);
                const sectorMat = new THREE.MeshStandardMaterial({color: 0x00e5ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide});
                const sector = new THREE.Mesh(sectorGeo, sectorMat);
                sector.rotation.x = Math.PI / 2;
                this.scene.add(sector);
                this.activeObjects.push(sector);

                this.customAnimation = () => {
                    const angleDeg = slider ? parseInt(slider.value) : 45;
                    const angleRad = angleDeg * Math.PI / 180;
                    movingLine.geometry.setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(3*Math.cos(angleRad), 3*Math.sin(angleRad), 0)]);
                    
                    this.scene.remove(sector);
                    const newGeo = new THREE.CylinderGeometry(2, 2, 0.1, 32, 1, false, 0, angleRad || 0.01);
                    sector.geometry.dispose();
                    sector.geometry = newGeo;
                    this.scene.add(sector);
                };
            }
            else if (topicId === 'm-3d') {
                this.activeViewport = document.getElementById('lab-canvas');
                this.camera.position.set(0, 3, 6);
                
                if (window.THREE.OrbitControls) {
                    this.controls = new THREE.OrbitControls(this.camera, document.body);
                    this.controls.enableDamping = true;
                }

                const geo = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
                const mesh = new THREE.Mesh(geo, material);
                this.scene.add(mesh);
                this.activeObjects.push(mesh);

                this.customAnimation = () => {
                    mesh.rotation.y += 0.005;
                    mesh.rotation.x += 0.002;
                    if(this.controls) this.controls.update();
                };
            }
            else if (topicId === 'm-lines') {
                this.activeViewport = document.getElementById('lines-canvas');
                const lineMat = new THREE.LineBasicMaterial({color: 0x10b981, linewidth: 4});
                const l1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3,-3,0), new THREE.Vector3(3,3,0)]), lineMat);
                const l2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3,3,0), new THREE.Vector3(3,-3,0)]), lineMat);
                this.scene.add(l1, l2);
                this.activeObjects.push(l1, l2);
                this.customAnimation = () => { l1.rotation.z += 0.01; l2.rotation.z -= 0.01; };
            }
            else if (topicId === 'm-triangles') {
                this.activeViewport = document.getElementById('pythag-canvas');
                const geo = new THREE.ConeGeometry(2, 4, 3);
                const mesh = new THREE.Mesh(geo, material);
                this.scene.add(mesh);
                this.activeObjects.push(mesh);
                this.customAnimation = () => { mesh.rotation.y += 0.01; mesh.rotation.x += 0.005; };
            }
            else if (topicId === 'm-quads') {
                this.activeViewport = document.getElementById('quad-canvas');
                const geo = new THREE.BoxGeometry(3, 2, 0.5);
                const mesh = new THREE.Mesh(geo, material);
                this.scene.add(mesh);
                this.activeObjects.push(mesh);
                this.customAnimation = () => { 
                    mesh.rotation.y = Math.sin(this.time) * 0.5; 
                    mesh.rotation.x = Math.cos(this.time) * 0.5;
                };
            }
            else if (topicId === 'm-polygons') {
                this.activeViewport = document.getElementById('poly-canvas');
                const geo = new THREE.CylinderGeometry(2, 2, 0.5, 6);
                const mesh = new THREE.Mesh(geo, material);
                this.scene.add(mesh);
                this.activeObjects.push(mesh);
                this.customAnimation = () => { mesh.rotation.y += 0.01; mesh.rotation.z += 0.005; };
            }
            else if (topicId === 'm-circles') {
                this.activeViewport = document.getElementById('circle-canvas');
                const geo = new THREE.TorusGeometry(2, 0.5, 16, 100);
                const mesh = new THREE.Mesh(geo, material);
                this.scene.add(mesh);
                this.activeObjects.push(mesh);
                this.customAnimation = () => { mesh.rotation.x += 0.01; mesh.rotation.y += 0.01; };
            }
            else if (topicId === 'm-coords') {
                this.activeViewport = document.getElementById('coord-canvas');
                const gridXZ = new THREE.GridHelper(10, 10, 0x00e5ff, 0x00e5ff);
                const gridXY = new THREE.GridHelper(10, 10, 0x10b981, 0x10b981);
                gridXY.rotation.x = Math.PI/2;
                gridXZ.material.transparent = true; gridXZ.material.opacity = 0.2;
                gridXY.material.transparent = true; gridXY.material.opacity = 0.2;
                this.scene.add(gridXZ, gridXY);
                this.activeObjects.push(gridXZ, gridXY);
                
                const ptGeo = new THREE.SphereGeometry(0.3);
                const ptMat = new THREE.MeshStandardMaterial({color: 0xf59e0b, emissive: 0xf59e0b});
                const pt = new THREE.Mesh(ptGeo, ptMat);
                this.scene.add(pt);
                this.activeObjects.push(pt);
                
                this.customAnimation = () => {
                    pt.position.x = Math.sin(this.time * 2) * 3;
                    pt.position.y = Math.cos(this.time * 1.5) * 3;
                    pt.position.z = Math.sin(this.time) * 3;
                    this.camera.position.x = Math.sin(this.time * 0.5) * 8;
                    this.camera.position.z = Math.cos(this.time * 0.5) * 8;
                    this.camera.lookAt(0,0,0);
                };
            }
            else if (topicId === 'm-mensuration') {
                this.activeViewport = null; // render behind the whole mensuration tab
                const geo = new THREE.CylinderGeometry(2, 2, 4, 32);
                const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color: 0x7c3aed, transparent: true, opacity: 0.4, wireframe: true}));
                
                // Volume filling effect
                const fillGeo = new THREE.CylinderGeometry(1.9, 1.9, 1, 32);
                const fillMesh = new THREE.Mesh(fillGeo, new THREE.MeshStandardMaterial({color: 0x00e5ff, transparent: true, opacity: 0.8}));
                fillMesh.position.y = -1.5;
                
                this.scene.add(mesh, fillMesh);
                this.activeObjects.push(mesh, fillMesh);
                
                this.customAnimation = () => {
                    mesh.rotation.y += 0.005;
                    fillMesh.rotation.y += 0.005;
                    
                    // Animate filling volume
                    const fillHeight = 2 + Math.sin(this.time) * 2; // 0 to 4
                    fillMesh.geometry.dispose();
                    fillMesh.geometry = new THREE.CylinderGeometry(1.9, 1.9, fillHeight, 32);
                    fillMesh.position.y = -2 + (fillHeight / 2);
                };
            }
            else if (topicId === 'm-advanced') {
                this.activeViewport = document.getElementById('transform-canvas');
                const geo = new THREE.DodecahedronGeometry(2);
                const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color: 0xec4899, wireframe: true}));
                this.scene.add(mesh);
                this.activeObjects.push(mesh);
                this.customAnimation = () => {
                    mesh.rotation.x += 0.01;
                    mesh.rotation.y += 0.02;
                    mesh.scale.setScalar(1 + Math.sin(this.time * 2) * 0.2);
                };
            }
            else {
                // Default fallback: A rotating abstract shape
                this.activeViewport = document.querySelector('.ic'); // just grab the first available
                const geo = new THREE.OctahedronGeometry(2);
                const mesh = new THREE.Mesh(geo, material);
                this.scene.add(mesh);
                this.activeObjects.push(mesh);

                const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), wireMat);
                mesh.add(wire);

                this.customAnimation = () => {
                    mesh.rotation.y += 0.01;
                    mesh.rotation.x += 0.005;
                };
            }
        }

        animate() {
            if(!this.renderer) return;
            this.animationId = requestAnimationFrame(this.animate);
            this.time += 0.01;

            if (this.customAnimation) this.customAnimation();

            if (this.activeViewport) {
                // Get bounds of the placeholder div
                const rect = this.activeViewport.getBoundingClientRect();
                
                // Calculate position considering window scroll and pixel ratio
                const width = rect.right - rect.left;
                const height = rect.bottom - rect.top;
                const left = rect.left;
                const bottom = window.innerHeight - rect.bottom; // WebGL uses bottom-left origin

                this.renderer.setViewport(left, bottom, width, height);
                this.renderer.setScissor(left, bottom, width, height);
                
                // Update camera aspect
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();

                // Clear background of the global canvas ONLY within the scissor region
                this.renderer.setClearColor(0x000000, 0); 
                this.renderer.render(this.scene, this.camera);
            } else {
                // Render full screen
                this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
                this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setClearColor(0x000000, 0); 
                this.renderer.render(this.scene, this.camera);
            }
        }
    }

    // Initialize the engine
    window.MuseumEngine = new GeometryMuseum();

    // Trigger initial load
    setTimeout(() => {
        const activeNav = document.querySelector('#nav-list li.active');
        if (activeNav) {
            window.MuseumEngine.loadTopic(activeNav.getAttribute('data-t'));
        }
    }, 100);

    // Mensuration Logic
    function initMensurationLogic() {
        const shapeSelect = document.getElementById('calc-shape');
        const calcInputs = document.getElementById('calc-inputs');
        const res2d = document.getElementById('calc-results-2d');
        const res3d = document.getElementById('calc-results-3d');
        if (!shapeSelect) return; // Optional element

        // Search Logic for Formulas Tab
        const searchInput = document.getElementById('formula-search');
        if (searchInput) {
            const formulas = document.querySelectorAll('#mens-formulas .formula-item');
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                formulas.forEach(f => {
                    const tags = f.getAttribute('data-tags') || '';
                    const text = f.innerText.toLowerCase();
                    if (tags.includes(term) || text.includes(term)) f.style.display = 'block';
                    else f.style.display = 'none';
                });
            });
        }
        
        function buildCalculator() {
            const shape = shapeSelect.value;
            let html = '';
            if(res2d) res2d.style.display = 'none'; 
            if(res3d) res3d.style.display = 'none';
            if(!calcInputs) return;
            
            if (['square','rectangle','circle','triangle'].includes(shape)) {
                if(res2d) res2d.style.display = 'grid';
                if(shape==='square') html = '<label>Side Length</label><input type="number" id="cinp-a" value="5" class="glass-input">';
                if(shape==='rectangle') html = '<label>Length</label><input type="number" id="cinp-l" value="8" class="glass-input"><label>Width</label><input type="number" id="cinp-w" value="5" class="glass-input">';
                if(shape==='circle') html = '<label>Radius</label><input type="number" id="cinp-r" value="4" class="glass-input">';
                if(shape==='triangle') html = '<label>Base</label><input type="number" id="cinp-b" value="6" class="glass-input"><label>Height</label><input type="number" id="cinp-h" value="4" class="glass-input"><label>Side 1</label><input type="number" id="cinp-s1" value="5" class="glass-input"><label>Side 2</label><input type="number" id="cinp-s2" value="5" class="glass-input">';
            } else {
                if(res3d) res3d.style.display = 'grid';
                if(shape==='cube') html = '<label>Side Length</label><input type="number" id="cinp-a" value="4" class="glass-input">';
                if(shape==='sphere') html = '<label>Radius</label><input type="number" id="cinp-r" value="5" class="glass-input">';
                if(shape==='cylinder') html = '<label>Radius</label><input type="number" id="cinp-r" value="3" class="glass-input"><label>Height</label><input type="number" id="cinp-h" value="7" class="glass-input">';
                if(shape==='cone') html = '<label>Radius</label><input type="number" id="cinp-r" value="4" class="glass-input"><label>Height</label><input type="number" id="cinp-h" value="6" class="glass-input">';
            }
            calcInputs.innerHTML = html;
            calcInputs.querySelectorAll('input').forEach(i => i.addEventListener('input', runCalc));
            runCalc();
        }

        function runCalc() {
            const shape = shapeSelect.value;
            let area=0, perim=0, vol=0, sa=0;
            const getV = (id) => parseFloat(document.getElementById(id)?.value) || 0;
            
            if(shape==='square'){ let a=getV('cinp-a'); area=a*a; perim=4*a; }
            if(shape==='rectangle'){ let l=getV('cinp-l'), w=getV('cinp-w'); area=l*w; perim=2*(l+w); }
            if(shape==='circle'){ let r=getV('cinp-r'); area=Math.PI*r*r; perim=2*Math.PI*r; }
            if(shape==='triangle'){ let b=getV('cinp-b'), h=getV('cinp-h'), s1=getV('cinp-s1'), s2=getV('cinp-s2'); area=0.5*b*h; perim=b+s1+s2; }
            
            if(shape==='cube'){ let a=getV('cinp-a'); vol=a*a*a; sa=6*a*a; }
            if(shape==='sphere'){ let r=getV('cinp-r'); vol=(4/3)*Math.PI*Math.pow(r,3); sa=4*Math.PI*r*r; }
            if(shape==='cylinder'){ let r=getV('cinp-r'), h=getV('cinp-h'); vol=Math.PI*r*r*h; sa=2*Math.PI*r*h + 2*Math.PI*r*r; }
            if(shape==='cone'){ let r=getV('cinp-r'), h=getV('cinp-h'); let l=Math.sqrt(r*r+h*h); vol=(1/3)*Math.PI*r*r*h; sa=Math.PI*r*l + Math.PI*r*r; }

            const aEl = document.getElementById('calc-res-area'); if(aEl) aEl.textContent = area.toFixed(2);
            const pEl = document.getElementById('calc-res-perim'); if(pEl) pEl.textContent = perim.toFixed(2);
            const vEl = document.getElementById('calc-res-vol'); if(vEl) vEl.textContent = vol.toFixed(2);
            const sEl = document.getElementById('calc-res-sa'); if(sEl) sEl.textContent = sa.toFixed(2);
        }

        shapeSelect.addEventListener('change', buildCalculator);
        buildCalculator();
    }
    initMensurationLogic();
});

// GLOBAL FUNCTIONS TO PREVENT CONSOLE ERRORS
window.doSearch = function(term) {
    const results = document.getElementById('srch-results');
    if (!results) return;
    if(term.length < 2) { results.innerHTML = ''; return; }
    results.innerHTML = `<div class="sri">No actual search implemented, but you typed: ${term}</div>`;
};

window.closeSearch = function() {
    document.getElementById('srch-overlay').classList.remove('vis');
};

window.openSearch = function() {
    document.getElementById('srch-overlay').classList.add('vis');
    document.getElementById('srch-input').focus();
};

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sb-ov');
    if(sidebar) sidebar.classList.toggle('open');
    if(overlay) overlay.classList.toggle('vis');
};

window.closeSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sb-ov');
    if(sidebar) sidebar.classList.remove('open');
    if(overlay) overlay.classList.remove('vis');
};

window.goTo = function(topicId) {
    const navItem = document.querySelector(`#nav-list li[data-t="${topicId}"]`);
    if(navItem) navItem.click();
};

window.hilite = function(type, btn) {
    const btns = btn.parentElement.querySelectorAll('.btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const nameEl = document.getElementById('elem-name');
    const dimEl = document.getElementById('elem-dim');
    if(nameEl) nameEl.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    if(dimEl) {
        if(type === 'point') dimEl.textContent = '0D';
        else if (type === 'plane' || type === 'coplanar') dimEl.textContent = '2D';
        else dimEl.textContent = '1D';
    }
    
    window.currentBasicType = type;
    if (window.MuseumEngine) window.MuseumEngine.loadTopic('m-basics');
};

window.updateAngle = function(val) {
    const valEl = document.getElementById('angle-val');
    const typeEl = document.getElementById('angle-type');
    const compEl = document.getElementById('angle-comp');
    const suppEl = document.getElementById('angle-supp');
    if(valEl) valEl.textContent = val + '°';
    const v = parseInt(val);
    let type = 'Acute';
    if(v === 0) type = 'Zero';
    else if(v > 0 && v < 90) type = 'Acute';
    else if(v === 90) type = 'Right';
    else if(v > 90 && v < 180) type = 'Obtuse';
    else if(v === 180) type = 'Straight';
    else if(v > 180 && v < 360) type = 'Reflex';
    else if(v === 360) type = 'Complete';
    if(typeEl) typeEl.textContent = type;
    if(compEl) compEl.textContent = (v <= 90) ? (90 - v) + '°' : 'N/A';
    if(suppEl) suppEl.textContent = (v <= 180) ? (180 - v) + '°' : 'N/A';
};

window.setLines = function(type, btn) {
    const btns = btn.parentElement.querySelectorAll('.btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const desc = document.getElementById('line-desc');
    if(desc) desc.textContent = `Selected relationship: ${type}`;
};

window.updatePythag = function() {
    const a = parseInt(document.getElementById('pythag-a')?.value || 0);
    const b = parseInt(document.getElementById('pythag-b')?.value || 0);
    const valA = document.getElementById('pa-val');
    const valB = document.getElementById('pb-val');
    const sumEl = document.getElementById('pythag-sum');
    const cEl = document.getElementById('pythag-c');
    
    if(valA) valA.textContent = a;
    if(valB) valB.textContent = b;
    if(sumEl) sumEl.textContent = (a*a + b*b);
    if(cEl) cEl.textContent = Math.sqrt(a*a + b*b).toFixed(2);
};

window.selectQuad = function(type, btn) {
    const btns = btn.parentElement.querySelectorAll('.btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.updatePoly = function(val) {
    const label = document.getElementById('poly-n-label');
    const sumEl = document.getElementById('poly-sum');
    const eachEl = document.getElementById('poly-each');
    const extEl = document.getElementById('poly-ext');
    
    const v = parseInt(val);
    const names = {3:'Triangle',4:'Quadrilateral',5:'Pentagon',6:'Hexagon',7:'Heptagon',8:'Octagon',9:'Nonagon',10:'Decagon',11:'Hendecagon',12:'Dodecagon'};
    if(label) label.textContent = `${v} — ${names[v]||'Polygon'}`;
    const sum = (v - 2) * 180;
    if(sumEl) sumEl.textContent = sum + '°';
    if(eachEl) eachEl.textContent = (sum / v).toFixed(1) + '°';
    if(extEl) extEl.textContent = (360 / v).toFixed(1) + '°';
};

window.updateCircle = function(val) {
    const r = parseInt(val);
    const rVal = document.getElementById('c-r-val');
    const diam = document.getElementById('c-diam');
    const circ = document.getElementById('c-circ');
    const area = document.getElementById('c-area');
    
    if(rVal) rVal.textContent = r;
    if(diam) diam.textContent = r * 2;
    if(circ) circ.textContent = (2 * Math.PI * r).toFixed(2);
    if(area) area.textContent = (Math.PI * r * r).toFixed(2);
};

window.setCP = function(type, btn) {
    const btns = btn.parentElement.querySelectorAll('.btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.updateCoords = function() {
    const ax = parseFloat(document.getElementById('ax')?.value || 0);
    const ay = parseFloat(document.getElementById('ay')?.value || 0);
    const bx = parseFloat(document.getElementById('bx')?.value || 0);
    const by = parseFloat(document.getElementById('by')?.value || 0);
    
    const dist = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const grad = (bx - ax !== 0) ? ((by - ay) / (bx - ax)) : Infinity;
    
    const dEl = document.getElementById('c-dist');
    const mEl = document.getElementById('c-mid');
    const gEl = document.getElementById('c-grad');
    const eqEl = document.getElementById('c-eq');
    
    if(dEl) dEl.textContent = dist.toFixed(2);
    if(mEl) mEl.textContent = `(${mx.toFixed(1)}, ${my.toFixed(1)})`;
    if(gEl) gEl.textContent = grad === Infinity ? 'Undefined' : grad.toFixed(2);
    if(eqEl) {
        if (grad === Infinity) eqEl.textContent = `x = ${ax}`;
        else {
            const c = ay - grad * ax;
            eqEl.textContent = `y = ${grad.toFixed(2)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c).toFixed(2)}`;
        }
    }
};

window.setTab = function(tabId, btn) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tc');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    contents.forEach(c => c.classList.remove('active'));
    const content = document.getElementById(tabId);
    if(content) content.classList.add('active');
};

window.updateCalc = function() {
    // This is handled by initMensurationLogic internally if we trigger a change event, 
    // but the inline handler can just dispatch it:
    const sel = document.getElementById('calc-shape');
    if(sel) sel.dispatchEvent(new Event('change'));
};

window.selectTri = function(type, btn) {
    const btns = btn.parentElement.querySelectorAll('.btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const desc = document.getElementById('tri-desc');
    const canvas = document.getElementById('tri-type-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.strokeStyle = '#00e5ff';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 3;
    
    if (type === 'equilateral') {
        if(desc) desc.textContent = 'All three sides are equal length. All interior angles are exactly 60°.';
        ctx.moveTo(140, 40);
        ctx.lineTo(60, 180);
        ctx.lineTo(220, 180);
    } else if (type === 'isosceles') {
        if(desc) desc.textContent = 'Two sides equal. The base angles opposite those sides are always equal to each other.';
        ctx.moveTo(140, 20);
        ctx.lineTo(100, 200);
        ctx.lineTo(180, 200);
    } else if (type === 'scalene') {
        if(desc) desc.textContent = 'No sides equal. All three angles are different. No lines of symmetry exist.';
        ctx.moveTo(80, 80);
        ctx.lineTo(40, 200);
        ctx.lineTo(240, 180);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};
