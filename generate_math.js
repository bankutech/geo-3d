const fs = require('fs');
const html = fs.readFileSync('c:/Users/Administrator/geometry/learn.html', 'utf8');

const headMatch = html.match(/<head>([\s\S]*?)<\/head>/);
const headerMatch = html.match(/<header>([\s\S]*?)<\/header>/);
const sidebarMatch = html.match(/<aside class="sidebar" id="sidebar">([\s\S]*?)<\/aside>/);

const template = `<!DOCTYPE html>
<html lang="en">
<head>
${headMatch[1]}
</head>
<body>
<div id="grid-bg"></div>

<div id="srch-overlay">
  <div id="srch-box">
    <input id="srch-input" placeholder="Search topics, formulas, concepts…" autocomplete="off" oninput="doSearch(this.value)">
    <div id="srch-results"></div>
    <span class="srch-close" onclick="closeSearch()">Press Esc to close</span>
  </div>
</div>
<div id="sb-ov" onclick="closeSidebar()"></div>

<header>
${headerMatch[1].replace('class="active"', '').replace('href="math.html"', 'href="math.html" class="active"')}
</header>

<div class="app">
<aside class="sidebar" id="sidebar">
  <span class="sb-label">Progress</span>
  <div class="sb-prog"><div class="sb-prog-fill" id="prog-fill"></div></div>
  <span class="sb-label">Foundations</span>
  <ul id="nav-list">
    <li data-t="m-coords" class="active"><span class="num">01</span>Coordinates</li>
    <li data-t="m-vectors"><span class="num">02</span>Vectors</li>
    <li data-t="m-matrices"><span class="num">03</span>Matrices</li>
    <li data-t="m-quaternions"><span class="num">04</span>Quaternions</li>
    <li data-t="m-euler"><span class="num">05</span>Euler's Formula</li>
  </ul>
</aside>
<main id="content">

<!-- ══ 1. COORDS ══ -->
<section id="m-coords" class="module active">
<div class="abar"></div>
<h1 class="pt">Coordinate Systems</h1>
<p class="ps">Understanding how points are mathematically defined in three-dimensional space.</p>
<div class="c2">
<div class="card ca"><span class="badge bc" style="margin-bottom:0.5rem;">Linear</span><h3 class="ct">Cartesian (x, y, z)</h3><p>The standard 3D grid system. Points are defined by their distance along three mutually perpendicular axes.</p></div>
<div class="card cv"><span class="badge bv" style="margin-bottom:0.5rem;">Angular</span><h3 class="ct">Spherical (r, θ, φ)</h3><p>Points are defined by radial distance, polar angle (inclination), and azimuthal angle. Crucial for orbital mechanics and spherical mapping.</p></div>
</div>
<div class="card ct2"><h3 class="ct">Distance in 3D</h3>
<div class="formula formula-lg">d = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)</div>
<p>The Euclidean distance formula expanded into three dimensions. This exact formula powers the bounding sphere calculations in our physics engine.</p>
</div>
<div class="mfooter"><span></span><button class="bnav" onclick="goTo('m-vectors')">Vectors →</button></div>
</section>

<!-- ══ 2. VECTORS ══ -->
<section id="m-vectors" class="module">
<div class="abar"></div>
<h1 class="pt">Vectors & Dot/Cross Products</h1>
<p class="ps">Mathematical entities with magnitude and direction, essential for physics and rendering calculations.</p>
<div class="fgrid" style="margin-bottom:1.75rem;">
<div class="fc"><div class="fc-name">Dot Product</div><div class="fc-eq">A · B = |A||B|cos(θ)</div></div>
<div class="fc"><div class="fc-name">Cross Product Magnitude</div><div class="fc-eq">|A × B| = |A||B|sin(θ)</div></div>
</div>
<div class="c2">
<div class="card ca"><span class="badge bc" style="margin-bottom:0.5rem;">Scalar Result</span><h3 class="ct">Dot Product</h3><p>Calculates the projection of one vector onto another. Crucial for lighting calculations (Diffuse shading uses N·L).</p></div>
<div class="card cv"><span class="badge bv" style="margin-bottom:0.5rem;">Vector Result</span><h3 class="ct">Cross Product</h3><p>Produces a new vector perpendicular to the plane formed by the input vectors. Essential for calculating face normals in 3D geometry.</p></div>
</div>
<div class="mfooter"><button class="bnav" onclick="goTo('m-coords')">← Coordinates</button><button class="bnav" onclick="goTo('m-matrices')">Matrices →</button></div>
</section>

<!-- ══ 3. MATRICES ══ -->
<section id="m-matrices" class="module">
<div class="abar"></div>
<h1 class="pt">Transformation Matrices</h1>
<p class="ps">In 3D graphics, translating, rotating, and scaling objects is done efficiently using 4x4 matrices.</p>
<div class="card ct2" style="margin-bottom:1.5rem;"><h3 class="ct">Why 4x4 Matrices?</h3><p>A 3x3 matrix can represent rotation and scaling, but cannot represent translation. By adding a 4th coordinate (homogeneous coordinates, w), we can encode translation within the matrix multiplication, allowing us to combine complex transformations into a single matrix.</p></div>
<div class="cg">
<div class="card"><h3 class="ct">Identity Matrix</h3><p>The starting point of all transformations. Leaves vertices unchanged when multiplied.</p></div>
<div class="card"><h3 class="ct">Projection Matrix</h3><p>Converts 3D coordinates into 2D screen space, applying perspective distortion (objects further away appear smaller).</p></div>
<div class="card"><h3 class="ct">View Matrix</h3><p>Transforms the world based on the camera's position and orientation. It moves the world around the camera.</p></div>
</div>
<div class="mfooter"><button class="bnav" onclick="goTo('m-vectors')">← Vectors</button><button class="bnav" onclick="goTo('m-quaternions')">Quaternions →</button></div>
</section>

<!-- ══ 4. QUATERNIONS ══ -->
<section id="m-quaternions" class="module">
<div class="abar"></div>
<h1 class="pt">Quaternions</h1>
<p class="ps">Complex mathematical objects used to represent 3D rotations without Gimbal Lock.</p>
<div class="card camt" style="margin-bottom:1.5rem;"><h3 class="ct">Gimbal Lock</h3><p>When rotating using Euler angles (pitch, yaw, roll), two axes can align, causing a loss of one degree of freedom. Quaternions, defined as $q = w + xi + yj + zk$, avoid this completely and provide perfectly smooth spherical linear interpolation (Slerp).</p></div>
<div class="ipanel">
<div class="ph"><h2 class="st" style="margin:0;">Quaternion Formula</h2><span class="badge ba">Complex Math</span></div>
<div class="pbody">
<div class="pctrl" style="width:100%;">
<div class="formula formula-lg">i² = j² = k² = ijk = -1</div>
<p style="text-align:center;color:var(--muted);margin-top:1rem;">The fundamental equation for quaternion multiplication discovered by William Rowan Hamilton.</p>
</div>
</div>
</div>
<div class="mfooter"><button class="bnav" onclick="goTo('m-matrices')">← Matrices</button><button class="bnav" onclick="goTo('m-euler')">Euler's Formula →</button></div>
</section>

<!-- ══ 5. EULER ══ -->
<section id="m-euler" class="module">
<div class="abar"></div>
<h1 class="pt">Euler's Polyhedron Formula</h1>
<p class="ps">A fundamental topological invariant for all convex polyhedra.</p>
<div class="formula formula-lg">V - E + F = 2</div>
<div class="cg">
<div class="card ca"><h3 class="ct">Vertices (V)</h3><p>The corner points where edges meet.</p></div>
<div class="card cv"><h3 class="ct">Edges (E)</h3><p>The line segments connecting vertices.</p></div>
<div class="card ct2"><h3 class="ct">Faces (F)</h3><p>The flat 2D surfaces bounding the solid.</p></div>
</div>
<div class="ipanel">
<div class="ph"><h2 class="st" style="margin:0;">Verification for Platonic Solids</h2><span class="badge bc">Topology</span></div>
<div class="pctrl" style="width:100%;">
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:0.5rem;text-align:center;margin-bottom:1rem;color:var(--cyan);font-weight:600;">
<div>Solid</div><div>Vertices (V)</div><div>Edges (E)</div><div>Faces (F)</div><div>V - E + F</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:0.5rem;text-align:center;margin-bottom:0.5rem;color:var(--text);">
<div>Tetrahedron</div><div>4</div><div>6</div><div>4</div><div style="color:var(--teal);font-weight:bold;">2</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:0.5rem;text-align:center;margin-bottom:0.5rem;color:var(--text);">
<div>Cube</div><div>8</div><div>12</div><div>6</div><div style="color:var(--teal);font-weight:bold;">2</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:0.5rem;text-align:center;margin-bottom:0.5rem;color:var(--text);">
<div>Octahedron</div><div>6</div><div>12</div><div>8</div><div style="color:var(--teal);font-weight:bold;">2</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:0.5rem;text-align:center;margin-bottom:0.5rem;color:var(--text);">
<div>Dodecahedron</div><div>20</div><div>30</div><div>12</div><div style="color:var(--teal);font-weight:bold;">2</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:0.5rem;text-align:center;color:var(--text);">
<div>Icosahedron</div><div>12</div><div>30</div><div>20</div><div style="color:var(--teal);font-weight:bold;">2</div>
</div>
</div>
</div>
<div class="mfooter"><button class="bnav" onclick="goTo('m-quaternions')">← Quaternions</button><span></span></div>
</section>

</main>
</div>

<script>
// Logic for sidebar navigation
const items = document.querySelectorAll('#nav-list li');
const modules = document.querySelectorAll('.module');
const progFill = document.getElementById('prog-fill');

function updateProgress() {
    let activeIdx = 0;
    items.forEach((item, i) => { if(item.classList.contains('active')) activeIdx = i; });
    if (items.length > 0) {
        const pct = ((activeIdx + 1) / items.length) * 100;
        if(progFill) progFill.style.width = pct + '%';
    }
}

function goTo(id) {
    items.forEach(li => {
        if(li.getAttribute('data-t') === id) li.classList.add('active');
        else li.classList.remove('active');
    });
    modules.forEach(mod => {
        if(mod.id === id) mod.classList.add('active');
        else mod.classList.remove('active');
    });
    window.scrollTo({top: 0, behavior: 'smooth'});
    updateProgress();
    if(typeof closeSidebar === 'function') closeSidebar();
}

items.forEach(item => {
    item.addEventListener('click', () => {
        goTo(item.getAttribute('data-t'));
    });
});

const sidebar = document.getElementById('sidebar');
const sbOv = document.getElementById('sb-ov');
function toggleSidebar() {
    if(sidebar) sidebar.classList.toggle('open');
    if(sbOv) sbOv.classList.toggle('vis');
}
function closeSidebar() {
    if(sidebar) sidebar.classList.remove('open');
    if(sbOv) sbOv.classList.remove('vis');
}

updateProgress();
</script>
<script src="js/script.js?v=2" defer></script>
</body>
</html>`;

fs.writeFileSync('c:/Users/Administrator/geometry/math.html', template);
console.log('math.html rewritten successfully.');
