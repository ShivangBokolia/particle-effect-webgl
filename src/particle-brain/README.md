# ParticleBrain

Renders a 3D mesh's surface as a cloud of colored particles with idle
shimmer and mouse-repel interaction.

## Usage

```tsx
import { ParticleBrain } from './particle-brain/ParticleBrain';

<ParticleBrain
  modelUrl="/brain.glb"
  particleCount={8000}
  colors={['#ffffff', '#f5b100', '#7c5cff', '#2fd9c4']}
  particleSize={0.02}
  repelStrength={0.6}
  repelRadius={1.2}
  springBack={0.08}
  autoRotate
  style={{ width: '100%', height: '600px' }}
/>
```

`ParticleBrain`'s wrapping `<div>` defaults to `width: 100%; height: 100%` so the
canvas fills its parent even in projects without a CSS framework (e.g. no
Tailwind). Pass `style` (merged over the default) to size it explicitly, as
above, or rely on `className` if your project's CSS resolves a height for
that class — `className` alone is not sufficient unless something in your
stylesheet gives it a resolved height.

Only `modelUrl` is required. Swap the placeholder Funko Pop model
(`public/deadpool_funko_pop.glb`) for a real brain GLB by changing
`modelUrl` — no other code changes needed.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelUrl` | `string` | — (required) | Path to a GLB/GLTF file to sample particles from. |
| `particleCount` | `number` | `8000` | Number of particles sampled from the mesh surface. |
| `colors` | `string[]` | `['#ffffff', '#f5b100', '#7c5cff', '#2fd9c4']` | Palette particles are randomly colored from. |
| `particleSize` | `number` | `0.02` | Size of each triangle particle. |
| `repelStrength` | `number` | `0.6` | How far particles push away from the cursor. |
| `repelRadius` | `number` | `1.2` | Radius of cursor influence, in model-space units. |
| `springBack` | `number` | `0.08` | Lerp factor controlling how quickly particles settle back to rest. |
| `autoRotate` | `boolean` | `true` | Slowly rotate the particle group. |
| `className` | `string` | — | Applied to the wrapping `<div>` around the canvas. Does not by itself give the div a resolved height (see `style`). |
| `style` | `CSSProperties` | `{ width: '100%', height: '100%' }` | Applied to the wrapping `<div>`, merged over the default. Pass explicit `width`/`height` to size the canvas without relying on a CSS framework. |
