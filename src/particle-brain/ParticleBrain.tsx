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
