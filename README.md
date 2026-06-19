# Geometry Showcase

A portfolio-level visualization of 3D geometric shapes, featuring a modern glassmorphism design, interactive features, and dark/light modes.

## Folder Structure

- `index.html` - The main entry point featuring the unified Single Page Application (Hero, 3D Viewer, Solids Library, and Visual Gallery).
- `math.html` - A standalone mathematical/engineering details page.
- `styles.css` - Custom styling with vanilla CSS variables for theming.
- `script.js` - Dynamic interactions including Three.js engine setup, Cannon.js physics, canvas particles, mouse glow, theme toggling, and search filtering.
- `assets/`
  - `geometry-scene.png` - Full 3D render.
  - `gallery/` - Render views (wireframe, solid, neon, educational).

## Design System

- **Background (Dark)**: `#050816`
- **Primary Color**: `#00e5ff`
- **Secondary Color**: `#7c3aed`
- **Text Color**: `#ffffff`
- **Effects**: Glassmorphism, smooth parallax scrolling, Canvas particle background.

## Running Locally

Run any static server in the root directory:

```bash
python -m http.server 8000
# or
npx serve
```
