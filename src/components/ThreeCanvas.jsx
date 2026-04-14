import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Environment, Float } from '@react-three/drei';

function AbstractShape() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1.5}>
        <Icosahedron args={[1, 0, 0]}>
          <MeshDistortMaterial 
            color="#b0b0b0" 
            attach="material" 
            distort={0.4} 
            speed={2} 
            roughness={0} 
            metalness={0.8}
            transmission={0.9} /* Glass-like */
            thickness={1}
            ior={1.5}
          />
        </Icosahedron>
      </mesh>
    </Float>
  );
}

export default function ThreeCanvas() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#fbbf24" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />
        <AbstractShape />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
