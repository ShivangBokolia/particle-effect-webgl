# ParticleBrain — Design Spec

Date: 2026-08-19

## Goal

A reusable React component that renders a 3D mesh (a brain, eventually) as a
cloud of colored particles, matching the visual style of the Dala.ai
landing-page hero (screenshot reference: particles arranged into a brain
silhouette, idle shimmer, particles disperse outward from the mouse cursor
and spring back when it moves away).

Scope: **component only** — not a full portfolio site. Ships as a
self-contained folder that can be dropped into any React app.

## Inputs / current assets

- Brain GLB not yet available. Placeholder asset in project root:
  `deadpool_funko_pop.glb` — used to validate the full pipeline
  (mesh → surface sampling → particles → mouse interaction) end-to-end.
  Swapping in the real brain model later is a one-line `modelUrl` prop
  change; no code changes required.

## Package structure

```
particle-brain/
  ParticleBrain.tsx        # public component + prop types
  useParticleSampler.ts    # GLB -> sampled surface points (hook)
  shaders/
    particle.vert.glsl
    particle.frag.glsl
  ParticleBrain.stories.tsx (optional demo harness)
```

Peer deps: `react`, `three`, `@react-three/fiber`, `@react-three/drei`
(for `useGLTF` and `MeshSurfaceSampler`).

## Design

### 1. Particle sourcing

`useGLTF(modelUrl)` loads the mesh. On load, traverse all mesh children,
merge geometries, and run `MeshSurfaceSampler` to pick `particleCount`
points weighted by triangle area — gives even coverage over the whole
surface regardless of which mesh is loaded. Each sampled point gets:

- a random per-particle seed (idle jitter phase)
- a color assigned from the `colors` palette prop (nearest-match /
  noise-based gradient lookup)

### 2. Rendering

Particles render as GPU-instanced small triangles (`InstancedMesh` with a
triangle `BufferGeometry`), not plain `gl.POINTS` — visually matches the
screenshot's triangle glyphs and scales correctly with camera distance. A
custom `ShaderMaterial` handles per-instance position, color, and scale.

### 3. Interaction (GPU-side)

Each frame:

1. Raycast the pointer against an invisible plane at the model's centroid
   depth → 3D world-space hit point.
2. Upload hit point as `uMouse` uniform, plus `uHover` flag.
3. Vertex shader: `dist = distance(restPos, uMouse)`;
   `push = normalize(restPos - uMouse) * repelStrength * falloff(dist, repelRadius)`.
4. Spring back toward rest position (`springBack` lerp factor) when the
   mouse moves away or leaves the canvas.
5. Always-on slow per-particle noise-based idle drift, layered under the
   repel displacement, so the shape feels "alive" even without interaction.

All displacement math runs on the GPU (vertex shader), so it scales to
10k+ particles at 60fps — this ruled out the CPU-physics alternative
(approach B), which was capped in the low thousands before frame drops.

### 4. Component API

```tsx
<ParticleBrain
  modelUrl="/deadpool_funko_pop.glb"   // swappable later for the real brain
  particleCount={8000}
  colors={["#ffffff", "#f5b100", "#7c5cff", "#2fd9c4"]}
  particleSize={0.02}
  repelStrength={0.6}
  repelRadius={1.2}
  springBack={0.08}
  autoRotate
  className="h-[600px] w-full"
/>
```

`modelUrl` is the only required prop. All visual/behavior knobs are props
with defaults tuned to match the screenshot.

### 5. Performance & testing

- `particleCount` defaults to a value benchmarked to hold 60fps on
  mid-range hardware (~8k); exposed as a prop so callers can tune for
  their own device targets.
- Manual visual testing via a demo/story harness page — no automated
  visual-regression tests planned (component-only scope, not an app).
- Dispose GLTF geometry/material on unmount to avoid WebGL context leaks.

## Decisions log

- Placeholder GLB accepted as stand-in asset; real brain model to be
  swapped in later without code changes.
- Colors are configurable via a `colors` prop (not hardcoded) for reuse
  across different brand palettes.
- Chose GPU shader displacement (approach A) over CPU-driven per-frame
  physics (approach B) for particle-count headroom and smoothness.
