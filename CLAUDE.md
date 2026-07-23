# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YAMMT** (Yet Another Mode-Matching Tool) is a browser-based visualization and modeling tool for Gaussian laser beam propagation and mode-matching with optical components (lenses, analyzers, placeholders).

**Key constraint**: Client-side only—no backend server required. The entire application must run in the browser.

## Architecture

The application follows a typical modern web architecture:

- **Frontend**: React with TypeScript (recommended for type safety in optical calculations)
- **State management**: Zustand or similar lightweight store (for beam state, components, UI state)
- **Visualization**: Canvas or SVG-based rendering (Canvas likely preferred for performance with zoom/pan interactions)
- **Build tool**: Vite (modern, fast, tree-shaking friendly)
- **Optical calculations**: Custom module(s) for ABCD matrix math, Gaussian beam propagation, and wavefront calculations

### Core Modules (to be created)

1. **Optical Physics Engine** (`src/lib/optics/`)
   - Gaussian beam model: waist size, position, Rayleigh range, q-parameter
   - ABCD matrix operations for thin/thick lenses
   - Beam propagation with component interactions
   - Gouy phase and wavefront curvature calculations
   - Support for astigmatic beams (future)

2. **Component Models** (`src/lib/components/`)
   - Thin lens (focal length, diameter)
   - Thick lens (radius of curvature, thickness, refractive index, diameter)
   - Beam analyzer (reads properties at a location, doesn't modify beam)
   - Placeholder (marks occupied regions, doesn't affect beam)
   - Component grouping (groups 0–9 for synchronized movement)

3. **UI Layer** (`src/components/`)
   - Main graph canvas (zoom, pan, component dragging)
   - Settings panel (wavelength, waist, x-axis units: mm/cm/m/holes with 2.5cm or 1" spacing)
   - Component palette (drag-to-add to graph)
   - Properties panels (per-component settings)

4. **Rendering** (`src/lib/render/`)
   - Graph axes and scale indicators
   - Beam envelopes (1σ, 2σ, 3σ)
   - Component vector graphics (stylized lens glyphs, analyzer markers, placeholders)
   - Secondary y-axis overlay (Gouy phase or wavefront curvature, optional)

5. **State & Persistence** (`src/lib/state/`)
   - Zustand store for beam, components, viewport, UI settings
   - Serialization to JSON for save/load
   - SVG/PNG export capability

## Development Setup (future)

```bash
# Install dependencies
npm install

# Development server (typically on http://localhost:5173)
npm run dev

# Run type checking
npm run type-check

# Linting and formatting
npm run lint
npm run format

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Key Implementation Notes

### Optical Calculations
- Use complex numbers for q-parameters (real + imaginary parts for wavefront curvature and Rayleigh range)
- ABCD matrices operate on 2×2 format: M = [[A, B], [C, D]]
- Beam diameter at position z depends on waist position and Rayleigh range
- Gouy phase = atan(z / z_R) where z_R is Rayleigh range

### Rendering Challenges
- **Zoom/Pan**: Canvas transforms or SVG viewBox; ensure smooth interaction and correct coordinate mapping
- **Adaptive drawing**: Component detail (e.g., thick lens curvature) should scale with zoom level to avoid visual clutter
- **Coordinate systems**: Map beam axis units (mm/cm/m/holes) to canvas pixels dynamically
- **Performance**: Lazy render components outside viewport; debounce resize/scroll

### User Interaction Patterns
- Scroll wheel: x-axis navigation
- Shift+Scroll or drag: alternative x-axis movement
- Ctrl+Scroll: y-axis zoom
- Component dragging: update position, recalculate beam, re-render
- Keyboard shortcuts: 0–9 to group/ungroup components, drag to move groups together

### File Format
- Save format: JSON with beam parameters, component array, viewport state
- Export: SVG (vector) or PNG/JPG (raster) via canvas rendering

## Testing Strategy

- **Unit tests** for optical calculations (beam propagation, matrix operations, q-parameter updates)
- **Integration tests** for component interactions (dragging, grouping, property updates)
- **Visual/E2E tests** for rendering and UI interactions (if tooling added later)

## Future Extensions (from spec)

- Astigmatic beams (separate x/y parameters and rendering)
- Astigmatic lenses
- Lens database (e.g., Thorlabs catalog)
- Zemax file format reader
- Mode-matching optimizer (algorithm to find optimal 2-lens combo from database)
