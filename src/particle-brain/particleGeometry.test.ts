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
