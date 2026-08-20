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
