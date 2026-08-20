import { ParticleBrain } from './particle-brain/ParticleBrain';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <ParticleBrain
        modelUrl="/deadpool_funko_pop.glb"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
