# ParticleBrain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable React component (`ParticleBrain`) that samples a 3D mesh's surface into thousands of colored particles and renders them with GPU-driven idle drift plus mouse-repel/spring-back interaction, matching the Dala.ai hero visual.

**Architecture:** A Vite + React + TypeScript project hosting a self-contained `src/particle-brain/` component folder. A pure, unit-testable function samples particle positions/colors from any `THREE.BufferGeometry` via `MeshSurfaceSampler`; a React hook wires that to `useGLTF`; the public `ParticleBrain` component renders the sampled particles as an `InstancedMesh` of small triangles with a custom GLSL shader that handles idle drift and mouse-repel displacement on the GPU.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Three.js, @react-three/fiber, @react-three/drei.

**Spec:** `docs/superpowers/specs/2026-08-19-particle-brain-component-design.md`

## Global Constraints

- Component-only scope — no portfolio site/nav/other sections in this plan.
- Placeholder asset is `deadpool_funko_pop.glb`; `modelUrl` must remain a plain prop so swapping in the real brain model later requires no code changes.
- Particle displacement (idle drift + mouse repel) runs in the GPU vertex shader (approach A from the spec), not CPU-side per-frame physics.
- Default props: `particleCount=8000`, `colors=["#ffffff", "#f5b100", "#7c5cff", "#2fd9c4"]`, `particleSize=0.02`, `repelStrength=0.6`, `repelRadius=1.2`, `springBack=0.08`, `autoRotate=true`.
- `modelUrl` is the only required prop.
- No git repository exists yet in the project root — Task 1 initializes one so the plan's per-task commits are possible.

---

## Task 1: Scaffold the Vite + React + TypeScript project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`

**Interfaces:**
- Produces: a working `npm run dev` dev server and `npm run test` (Vitest) command that later tasks build on.

- [ ] **Step 1: Initialize git**

```bash
git init
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "particle-brain",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.169.0",
    "@react-three/fiber": "^8.17.10",
    "@react-three/drei": "^9.114.3"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/three": "^0.169.0",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ParticleBrain Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `.gitignore`**

```
node_modules
dist
.DS_Store
```

- [ ] **Step 8: Write `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 9: Write `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 10: Write `src/App.tsx` (placeholder, replaced in Task 4)**

```tsx
export default function App() {
  return <h1>Particle Brain Demo</h1>;
}
```

- [ ] **Step 11: Install dependencies**

```bash
npm install
```

- [ ] **Step 12: Verify the dev server runs**

Run: `npm run dev`
Expected: server starts on `http://localhost:5173`, browser shows "Particle Brain Demo". Stop the server after confirming (Ctrl+C).

- [ ] **Step 13: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json index.html .gitignore src
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

## Task 2: Pure particle-sampling function with unit tests

**Files:**
- Create: `src/particle-brain/particleGeometry.ts`
- Create: `src/particle-brain/particleGeometry.test.ts`
- Modify: move `deadpool_funko_pop.glb` from repo root to `public/deadpool_funko_pop.glb`

**Interfaces:**
- Produces: `sampleParticles(geometry: THREE.BufferGeometry, options: SampleOptions): ParticleData`, `ParticleData { positions: Float32Array; colors: Float32Array; seeds: Float32Array }`, `SampleOptions { count: number; colors: string[]; random?: () => number }`. Task 3's `useParticleSampler` hook consumes this exact function and these exact type names.

- [ ] **Step 1: Move the placeholder GLB into `public/`**

```bash
mkdir -p public
git mv deadpool_funko_pop.glb public/deadpool_funko_pop.glb
```

- [ ] **Step 2: Write the failing tests**

```ts
// src/particle-brain/particleGeometry.test.ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { sampleParticles } from './particleGeometry';

describe('sampleParticles', () => {
  it('returns the requested number of particles', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const data = sampleParticles(geometry, { count: 50, colors: ['#ffffff'] });
    expect(data.positions.length).toBe(50 * 3);
    expect(data.colors.length).toBe(50 * 3);
    expect(data.seeds.length).toBe(50);
  });

  it('only uses colors from the provided palette', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const white = new THREE.Color('#ffffff');
    const data = sampleParticles(geometry, { count: 20, colors: ['#ffffff'] });
    for (let i = 0; i < 20; i++) {
      expect(data.colors[i * 3]).toBeCloseTo(white.r);
      expect(data.colors[i * 3 + 1]).toBeCloseTo(white.g);
      expect(data.colors[i * 3 + 2]).toBeCloseTo(white.b);
    }
  });

  it('throws for a non-positive count', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    expect(() =>
      sampleParticles(geometry, { count: 0, colors: ['#fff'] })
    ).toThrow();
  });

  it('throws for an empty color palette', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    expect(() => sampleParticles(geometry, { count: 10, colors: [] })).toThrow();
  });

  it('produces deterministic output for a deterministic random source', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    let seed = 0;
    const deterministicRandom = () => {
      seed += 1;
      return (seed % 100) / 100;
    };
    const a = sampleParticles(geometry, {
      count: 10,
      colors: ['#ffffff', '#000000'],
      random: deterministicRandom,
    });
    seed = 0;
    const b = sampleParticles(geometry, {
      count: 10,
      colors: ['#ffffff', '#000000'],
      random: deterministicRandom,
    });
    expect(a.colors).toEqual(b.colors);
    expect(a.seeds).toEqual(b.seeds);
  });
});
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `npm run test`
Expected: FAIL — `Cannot find module './particleGeometry'` (file doesn't exist yet).

- [ ] **Step 4: Implement `sampleParticles`**

```ts
// src/particle-brain/particleGeometry.ts
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  seeds: Float32Array;
}

export interface SampleOptions {
  count: number;
  colors: string[];
  random?: () => number;
}

export function sampleParticles(
  geometry: THREE.BufferGeometry,
  { count, colors, random = Math.random }: SampleOptions
): ParticleData {
  if (count <= 0) {
    throw new Error('sampleParticles: count must be greater than 0');
  }
  if (colors.length === 0) {
    throw new Error('sampleParticles: colors must contain at least one entry');
  }

  const mesh = new THREE.Mesh(geometry);
  const sampler = new MeshSurfaceSampler(mesh).build();

  const positions = new Float32Array(count * 3);
  const particleColors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  const tempPosition = new THREE.Vector3();
  const tempColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    sampler.sample(tempPosition);
    positions[i * 3] = tempPosition.x;
    positions[i * 3 + 1] = tempPosition.y;
    positions[i * 3 + 2] = tempPosition.z;

    const paletteIndex = Math.floor(random() * colors.length);
    tempColor.set(colors[paletteIndex]);
    particleColors[i * 3] = tempColor.r;
    particleColors[i * 3 + 1] = tempColor.g;
    particleColors[i * 3 + 2] = tempColor.b;

    seeds[i] = random();
  }

  return { positions, colors: particleColors, seeds };
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npm run test`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add public/deadpool_funko_pop.glb src/particle-brain/particleGeometry.ts src/particle-brain/particleGeometry.test.ts
git commit -m "feat: add particle surface-sampling function with tests"
```

---

## Task 3: Static particle rendering with idle drift

**Files:**
- Create: `src/particle-brain/useParticleSampler.ts`
- Create: `src/particle-brain/shaders/particle.vert.glsl`
- Create: `src/particle-brain/shaders/particle.frag.glsl`
- Create: `src/particle-brain/glsl.d.ts`
- Create: `src/particle-brain/ParticleBrain.tsx`

**Interfaces:**
- Consumes: `sampleParticles`, `ParticleData` from Task 2 (`src/particle-brain/particleGeometry.ts`).
- Produces: `useParticleSampler(modelUrl: string, particleCount: number, colors: string[]): ParticleData` (hook). `ParticleBrain` component (initial version, no mouse interaction yet — added in Task 4) rendering an `InstancedMesh` of triangles with idle per-particle drift.

- [ ] **Step 1: Write `src/particle-brain/glsl.d.ts` (ambient module types for raw shader imports)**

```ts
declare module '*.glsl?raw' {
  const content: string;
  export default content;
}
```

- [ ] **Step 2: Write `src/particle-brain/useParticleSampler.ts`**

```ts
import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { sampleParticles, ParticleData } from './particleGeometry';

export function useParticleSampler(
  modelUrl: string,
  particleCount: number,
  colors: string[]
): ParticleData {
  const gltf = useGLTF(modelUrl);

  return useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];

    gltf.scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);

      // MeshSurfaceSampler and mergeGeometries only need position + index;
      // strip other attributes so meshes with mismatched attribute sets
      // (e.g. differing UV channels) can still be merged.
      const stripped = new THREE.BufferGeometry();
      stripped.setAttribute('position', geometry.getAttribute('position'));
      if (geometry.index) stripped.setIndex(geometry.index);
      geometries.push(stripped);
    });

    if (geometries.length === 0) {
      throw new Error(`useParticleSampler: no mesh geometry found in ${modelUrl}`);
    }

    const merged =
      geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);

    return sampleParticles(merged, { count: particleCount, colors });
  }, [gltf, modelUrl, particleCount, colors]);
}
```

- [ ] **Step 3: Write `src/particle-brain/shaders/particle.vert.glsl` (idle drift only)**

```glsl
uniform float uTime;
uniform float uParticleSize;

attribute vec3 aRestPosition;
attribute vec3 aColor;
attribute float aSeed;

varying vec3 vColor;

void main() {
  vColor = aColor;

  float driftX = sin(uTime * 0.6 + aSeed * 6.2831853) * 0.02;
  float driftY = cos(uTime * 0.5 + aSeed * 9.4247780) * 0.02;
  float driftZ = sin(uTime * 0.4 + aSeed * 3.1415927) * 0.02;
  vec3 drifted = aRestPosition + vec3(driftX, driftY, driftZ);

  vec3 localOffset = position * uParticleSize;
  vec4 mvPosition = modelViewMatrix * vec4(drifted + localOffset, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
```

- [ ] **Step 4: Write `src/particle-brain/shaders/particle.frag.glsl`**

```glsl
varying vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, 1.0);
}
```

- [ ] **Step 5: Write `src/particle-brain/ParticleBrain.tsx` (initial version)**

```tsx
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useParticleSampler } from './useParticleSampler';
import vertexShader from './shaders/particle.vert.glsl?raw';
import fragmentShader from './shaders/particle.frag.glsl?raw';

export interface ParticleBrainProps {
  modelUrl: string;
  particleCount?: number;
  colors?: string[];
  particleSize?: number;
  autoRotate?: boolean;
  className?: string;
}

const DEFAULT_COLORS = ['#ffffff', '#f5b100', '#7c5cff', '#2fd9c4'];

function ParticleField({
  modelUrl,
  particleCount,
  colors,
  particleSize,
  autoRotate,
}: Required<Omit<ParticleBrainProps, 'className'>>) {
  const { positions, colors: particleColors, seeds } = useParticleSampler(
    modelUrl,
    particleCount,
    colors
  );

  const groupRef = useRef<THREE.Group>(null);

  const triangleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const verts = new Float32Array([0, 0.6, 0, -0.5, -0.4, 0, 0.5, -0.4, 0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geometry.setAttribute('aRestPosition', new THREE.InstancedBufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(particleColors, 3));
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    return geometry;
  }, [positions, particleColors, seeds]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uParticleSize: { value: particleSize },
        },
      }),
    [particleSize]
  );

  useEffect(() => {
    return () => {
      triangleGeometry.dispose();
      material.dispose();
    };
  }, [triangleGeometry, material]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh args={[triangleGeometry, material, particleCount]} />
    </group>
  );
}

export function ParticleBrain({ className, ...props }: ParticleBrainProps) {
  const particleCount = props.particleCount ?? 8000;
  const colors = props.colors ?? DEFAULT_COLORS;
  const particleSize = props.particleSize ?? 0.02;
  const autoRotate = props.autoRotate ?? true;

  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ParticleField
          modelUrl={props.modelUrl}
          particleCount={particleCount}
          colors={colors}
          particleSize={particleSize}
          autoRotate={autoRotate}
        />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/particle-brain
git commit -m "feat: render static particle field with idle drift"
```

---

## Task 4: Wire up the demo harness and visually verify

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `ParticleBrain` from `src/particle-brain/ParticleBrain.tsx` (Task 3).

- [ ] **Step 1: Replace `src/App.tsx` with a demo of the component**

```tsx
import { ParticleBrain } from './particle-brain/ParticleBrain';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <ParticleBrain
        modelUrl="/deadpool_funko_pop.glb"
        className="h-full w-full"
      />
    </div>
  );
}
```

- [ ] **Step 2: Run the dev server and visually verify**

Run: `npm run dev`, open `http://localhost:5173`.
Expected: a particle field shaped like the placeholder model (Funko Pop) renders, particles slowly drift/shimmer, and the group slowly auto-rotates. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up ParticleBrain demo harness"
```

---

## Task 5: Mouse-repel interaction with spring-back

**Files:**
- Modify: `src/particle-brain/shaders/particle.vert.glsl`
- Modify: `src/particle-brain/ParticleBrain.tsx`

**Interfaces:**
- Consumes: `ParticleBrainProps`, `ParticleField` from Task 3 — extends both with `repelStrength`, `repelRadius`, `springBack`.
- Produces: final interactive behavior relied on by Task 6's public API pass.

- [ ] **Step 1: Replace `src/particle-brain/shaders/particle.vert.glsl` with the mouse-repel version**

```glsl
uniform float uTime;
uniform vec3 uMouse;
uniform float uMouseInfluence;
uniform float uRepelStrength;
uniform float uRepelRadius;
uniform float uParticleSize;

attribute vec3 aRestPosition;
attribute vec3 aColor;
attribute float aSeed;

varying vec3 vColor;

void main() {
  vColor = aColor;

  float driftX = sin(uTime * 0.6 + aSeed * 6.2831853) * 0.02;
  float driftY = cos(uTime * 0.5 + aSeed * 9.4247780) * 0.02;
  float driftZ = sin(uTime * 0.4 + aSeed * 3.1415927) * 0.02;
  vec3 drifted = aRestPosition + vec3(driftX, driftY, driftZ);

  vec3 toParticle = aRestPosition - uMouse;
  float dist = length(toParticle);
  float falloff = clamp(1.0 - dist / uRepelRadius, 0.0, 1.0);
  falloff *= falloff;
  vec3 pushDir = dist > 0.0001 ? normalize(toParticle) : vec3(0.0, 1.0, 0.0);
  vec3 repelled = drifted + pushDir * uRepelStrength * falloff * uMouseInfluence;

  vec3 localOffset = position * uParticleSize;
  vec4 mvPosition = modelViewMatrix * vec4(repelled + localOffset, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
```

`uMouseInfluence` is a single scalar (not a per-particle value) that the CPU side lerps toward 1 while the pointer is over the canvas and toward 0 when it leaves — this produces the spring-back feel from the spec without needing persistent per-particle GPU state.

- [ ] **Step 2: Replace `src/particle-brain/ParticleBrain.tsx` with the interactive version**

```tsx
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useParticleSampler } from './useParticleSampler';
import vertexShader from './shaders/particle.vert.glsl?raw';
import fragmentShader from './shaders/particle.frag.glsl?raw';

export interface ParticleBrainProps {
  modelUrl: string;
  particleCount?: number;
  colors?: string[];
  particleSize?: number;
  repelStrength?: number;
  repelRadius?: number;
  springBack?: number;
  autoRotate?: boolean;
  className?: string;
}

const DEFAULT_COLORS = ['#ffffff', '#f5b100', '#7c5cff', '#2fd9c4'];

function ParticleField({
  modelUrl,
  particleCount,
  colors,
  particleSize,
  repelStrength,
  repelRadius,
  springBack,
  autoRotate,
}: Required<Omit<ParticleBrainProps, 'className'>>) {
  const { positions, colors: particleColors, seeds } = useParticleSampler(
    modelUrl,
    particleCount,
    colors
  );

  const groupRef = useRef<THREE.Group>(null);
  const mouseInfluence = useRef(0);
  const raycastPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const planeHit = useMemo(() => new THREE.Vector3(), []);
  const { camera, pointer, raycaster } = useThree();

  const triangleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const verts = new Float32Array([0, 0.6, 0, -0.5, -0.4, 0, 0.5, -0.4, 0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geometry.setAttribute('aRestPosition', new THREE.InstancedBufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(particleColors, 3));
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    return geometry;
  }, [positions, particleColors, seeds]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector3() },
          uMouseInfluence: { value: 0 },
          uRepelStrength: { value: repelStrength },
          uRepelRadius: { value: repelRadius },
          uParticleSize: { value: particleSize },
        },
      }),
    [repelStrength, repelRadius, particleSize]
  );

  useEffect(() => {
    return () => {
      triangleGeometry.dispose();
      material.dispose();
    };
  }, [triangleGeometry, material]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;

    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(raycastPlane, planeHit);
    const targetInfluence = hit ? 1 : 0;
    if (hit) {
      material.uniforms.uMouse.value.copy(planeHit);
    }

    mouseInfluence.current += (targetInfluence - mouseInfluence.current) * springBack;
    material.uniforms.uMouseInfluence.value = mouseInfluence.current;

    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh args={[triangleGeometry, material, particleCount]} />
    </group>
  );
}

export function ParticleBrain({ className, ...props }: ParticleBrainProps) {
  const particleCount = props.particleCount ?? 8000;
  const colors = props.colors ?? DEFAULT_COLORS;
  const particleSize = props.particleSize ?? 0.02;
  const repelStrength = props.repelStrength ?? 0.6;
  const repelRadius = props.repelRadius ?? 1.2;
  const springBack = props.springBack ?? 0.08;
  const autoRotate = props.autoRotate ?? true;

  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ParticleField
          modelUrl={props.modelUrl}
          particleCount={particleCount}
          colors={colors}
          particleSize={particleSize}
          repelStrength={repelStrength}
          repelRadius={repelRadius}
          springBack={springBack}
          autoRotate={autoRotate}
        />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manually verify interaction**

Run: `npm run dev`, open `http://localhost:5173`, move the mouse over the particle field.
Expected: particles near the cursor push outward; when the mouse leaves the canvas or stops hovering the shape, particles ease back to their rest positions over roughly half a second (controlled by `springBack`).

- [ ] **Step 5: Commit**

```bash
git add src/particle-brain
git commit -m "feat: add mouse-repel interaction with spring-back"
```

---

## Task 6: Final polish, disposal check, and usage docs

**Files:**
- Modify: `src/particle-brain/ParticleBrain.tsx` (verify disposal only — no behavior change expected)
- Create: `src/particle-brain/README.md`

**Interfaces:**
- No new interfaces — this task verifies and documents the public API finalized in Task 5.

- [ ] **Step 1: Verify WebGL resource cleanup**

Run: `npm run dev`, open the demo, then navigate away by temporarily replacing `<App />`'s render with `null` via React DevTools (or add a toggle button) and confirm via the browser's `chrome://gpu`/WebGL context count (or simply that no console warnings about leaked contexts appear) that unmounting `ParticleBrain` does not leak. The `useEffect` cleanup added in Task 3/5 already disposes `triangleGeometry` and `material` on unmount — confirm no additional untracked `THREE.*` objects were introduced in Task 5 (there weren't: `raycastPlane` and `planeHit` are plain JS objects, no GPU resources).
Expected: no new disposal gaps found. If any are found, add `.dispose()` calls in the same `useEffect` cleanup and re-run this step.

- [ ] **Step 2: Write `src/particle-brain/README.md`**

```markdown
# ParticleBrain

Renders a 3D mesh's surface as a cloud of colored particles with idle
shimmer and mouse-repel interaction.

## Usage

\`\`\`tsx
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
  className="h-[600px] w-full"
/>
\`\`\`

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
| `className` | `string` | — | Applied to the wrapping `<div>` around the canvas. |
```

- [ ] **Step 3: Full test and type-check pass**

Run: `npm run test && npx tsc --noEmit`
Expected: all tests pass, no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/particle-brain/README.md
git commit -m "docs: add ParticleBrain usage README"
```
