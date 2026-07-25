# YaMMT — Yet Another Mode-Matching Tool

A browser-based tool for visualizing Gaussian laser beam propagation and mode-matching with optical components. Client-side only — no backend, no build-time server, just a static site.

**Live app**: https://sestei.github.io/yammt/

YaMMT is heavily inspired by Nico Lastzka's JamMT. However, JamMT hasn't been maintained for many years, and new ideas and usability features have not made it into the tool. Therefore, YaMMT is a complete rewrite (making heavy usage of Claude) and should eventually have all good features of JamMT, but improve upon usability (no Java needed, runs on a tablet!) and add a few more ideas later on.

## Missing essential features

These features are high on the priority list to be implemented:

- no mode-matching assistant yet (but also, do try manually — it will give you a better understanding of the behaviour of Gaussian beams),
- lens materials are not yet supported, i.e. there is no automatic calculation of refractive index for the beam wavelength,
- astigmatic optics are not yet supported.

## Features

- Define a starting Gaussian beam (wavelength, waist size, waist position) and watch it propagate along an interactive graph, with 1σ/2σ/3σ envelopes.
- Pan and zoom the graph (scroll, shift-scroll, drag, ctrl-scroll for y-zoom); x-axis units selectable as mm/cm/m/holes (2.5cm or 1" optical table hole spacing).
- Optional secondary y-axis showing Gouy phase or wavefront radius of curvature.
- Four component types, each with true ABCD-matrix physics where applicable:
  - **Thin lens** — focal length, diameter.
  - **Thick lens** — refractive index, left/right radius of curvature, diameter, center thickness; drawn true-to-scale.
  - **Beam analyzer** — read-only readout of beam radius, Gouy phase, wavefront curvature, q-parameter, Rayleigh range, distance to waist at a point; doesn't affect the beam.
  - **Placeholder** — marks a region as occupied, preventing lenses from being placed there.
- Drag-and-drop or click-to-add components from a palette; drag, lock, and group (1–9) components; nudge the selected component with the arrow keys (1mm steps, 0.1mm with Shift).
- A **lens database**: predefined and user-managed thin/thick lens shapes, stored inside the scene file itself, addable to the graph by drag or a button.
- Save/load scenes as JSON; export the graph as a self-contained SVG or a PNG.
- Responsive layout that collapses to a single scrollable sidebar on tablet-width screens, with collapsible panel sections.

See [`PROJECT_SKETCH.md`](./PROJECT_SKETCH.md) for the original design sketch and further add-on ideas (astigmatic beams/lenses, Zemax import, mode-matching optimizer) that aren't implemented yet.

## Development

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run type-check   # tsc, no emit
npm run lint         # oxlint
npm test             # vitest
npm run build        # production build to dist/
npm run preview      # preview the production build locally
```

## Tech stack

- React 19 + TypeScript, built with Vite
- Zustand for state (`src/state/sceneStore.ts`)
- Pure SVG rendering for the graph (no canvas), with a hand-rolled ABCD-matrix/complex-q optics engine in `src/lib/optics/`
- Vitest for unit tests (physics, geometry, tick generation, serialization — anything pure and deterministic; interaction/DOM rendering is verified manually)
- oxlint for linting

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which type-checks, tests, builds, and deploys to GitHub Pages automatically.
