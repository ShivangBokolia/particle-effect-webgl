# Particle Brain

A reusable React component that renders a 3D model's surface as a cloud of
colored particles — idle shimmer, GPU-driven displacement, and mouse-repel
interaction with spring-back, in the style of a particle-brain hero
animation. Built with React, Three.js, and react-three-fiber.

The project currently ships with a placeholder model
(`public/deadpool_funko_pop.glb`) standing in for the eventual brain
asset — see [Changing the 3D model](#changing-the-3d-model) below.

## What's here

- `src/particle-brain/ParticleBrain.tsx` — the public component.
- `src/particle-brain/useParticleSampler.ts` — loads a GLB and samples
  particle positions from its surface.
- `src/particle-brain/particleGeometry.ts` — the underlying (unit-tested)
  surface-sampling logic.
- `src/particle-brain/shaders/` — the GLSL vertex/fragment shaders that
  drive idle drift, mouse-repel displacement, and particle color.
- `src/particle-brain/README.md` — the component's own API reference
  (props, defaults, usage).
- `src/App.tsx` — a demo page that mounts `ParticleBrain` full-viewport,
  for visually trying it out.

## Running it

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). You should
see the particle field rendered from the placeholder model, with idle
shimmer and mouse-repel interaction on hover.

Other commands:

```bash
npm run build      # production build
npm run preview    # preview a production build locally
npm run test        # run the unit test suite (Vitest)
npx tsc --noEmit    # type-check
```

## Changing the 3D model

`ParticleBrain` takes the model as a plain prop, so swapping it is a
one-line change — no other code changes are required:

1. Add your `.glb`/`.gltf` file to the `public/` folder (e.g.
   `public/brain.glb`). Anything in `public/` is served as-is at the app's
   root, so `public/brain.glb` becomes reachable at `/brain.glb`.
2. Update the `modelUrl` prop wherever `ParticleBrain` is used — currently
   in `src/App.tsx`:

   ```tsx
   <ParticleBrain modelUrl="/brain.glb" />
   ```

That's it. The component automatically:
- samples particles evenly across whatever mesh surface(s) the new model
  has (works with single- or multi-mesh GLBs),
- **recenters** the particle cloud on the model's bounding-box center, and
- **normalizes its scale** to a fixed on-screen size,

so a differently sized or off-center source model still renders centered
and consistently sized without any manual tuning.

If you want to keep both models around (e.g. to compare), just add a
second file to `public/` and switch `modelUrl` between them — or render
two `<ParticleBrain>` instances side by side, each with its own
`modelUrl`.

For the full list of tunable props (particle count, colors, particle size,
repel strength/radius, spring-back speed, auto-rotate, sizing), see
[`src/particle-brain/README.md`](src/particle-brain/README.md).

## Design background

The design rationale (why particles are GPU-instanced, why displacement
runs in the vertex shader, why colors are configurable, etc.) is recorded
in [`docs/superpowers/specs/2026-08-19-particle-brain-component-design.md`](docs/superpowers/specs/2026-08-19-particle-brain-component-design.md),
with the implementation plan in
[`docs/superpowers/plans/2026-08-19-particle-brain-component.md`](docs/superpowers/plans/2026-08-19-particle-brain-component.md).
