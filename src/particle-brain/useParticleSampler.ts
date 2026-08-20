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

  // `colors` is commonly passed as an inline array literal by callers (see
  // README usage example), which creates a new array identity every render.
  // Depend on a stable string key derived from its contents instead, so a
  // parent re-render doesn't trigger a full resample + GPU re-upload.
  const colorsKey = colors.join(',');

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
      // Normalize indexed-ness so mergeGeometries never sees a mix of
      // indexed and non-indexed geometries, which would make it return null.
      geometries.push(stripped.toNonIndexed());
    });

    if (geometries.length === 0) {
      throw new Error(`useParticleSampler: no mesh geometry found in ${modelUrl}`);
    }

    const merged =
      geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);

    if (!merged) {
      throw new Error(
        `useParticleSampler: failed to merge mesh geometries in ${modelUrl} (mismatched indexed/non-indexed meshes)`
      );
    }

    // The model's own pivot (e.g. at its feet, not its visual center) is
    // irrelevant to us — recenter on the bounding-box center so the particle
    // cloud is centered at the origin, matching the camera's fixed look-at
    // target regardless of how the source asset was authored.
    merged.center();

    // Source assets can be authored at any real-world scale. Normalize so
    // the model's bounding sphere always has the same on-screen radius,
    // regardless of the source GLB's units — this keeps sizing consistent
    // when `modelUrl` is swapped for a different model later.
    merged.computeBoundingSphere();
    const sourceRadius = merged.boundingSphere?.radius ?? 1;
    const targetRadius = 1;
    if (sourceRadius > 0) {
      merged.scale(targetRadius / sourceRadius, targetRadius / sourceRadius, targetRadius / sourceRadius);
    }

    return sampleParticles(merged, { count: particleCount, colors });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, modelUrl, particleCount, colorsKey]);
}
