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
