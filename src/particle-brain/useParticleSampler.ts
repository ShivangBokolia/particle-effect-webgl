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
