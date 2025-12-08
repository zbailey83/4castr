/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Center, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// TypeScript workaround for missing React Three Fiber intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      instancedMesh: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      orthographicCamera: any;
    }
  }
}

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const sphereGeo = new THREE.SphereGeometry(1, 8, 8);

// Voxel Text Component (Reused)
const VoxelText = ({ text, position, scale = 1 }: { text: string, position: [number, number, number], scale?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [voxels, setVoxels] = useState<[number, number, number][]>([]);
  
  // Cyberpunk/Data palette
  const colors = useMemo(() => [
    '#3b82f6', '#2563eb', '#1d4ed8', // Blues
    '#8b5cf6', '#7c3aed', // Violets
    '#06b6d4', '#0891b2', // Cyans
    '#f43f5e', '#e11d48'  // Accents
  ], []);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const fontSize = 20;
    const font = `900 ${fontSize}px monospace`; 
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.font = font;
    const width = ctx.measureText(text).width;
    const height = fontSize * 1.2;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.font = font;
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';
    ctx.fillText(text, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    const points: [number, number, number][] = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (imageData.data[index + 3] > 128) {
          points.push([x, (height - y), 0]);
        }
      }
    }
    setVoxels(points);
  }, [text]);

  useEffect(() => {
    if (meshRef.current && voxels.length > 0) {
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();
      
      voxels.forEach((pos, i) => {
        dummy.position.set(pos[0] * scale, pos[1] * scale, 0);
        const height = 0.5 + Math.random() * 1.5;
        dummy.scale.set(scale * 0.9, scale * 0.9, scale * height); 
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);

        const colorIdx = Math.floor((pos[0] / (voxels.length/5)) * colors.length) % colors.length;
        const baseColor = colors[colorIdx] || colors[0];
        color.set(baseColor).offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
        meshRef.current!.setColorAt(i, color);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [voxels, scale, colors]);

  return (
    <group position={position}>
       <instancedMesh ref={meshRef} args={[boxGeo, undefined, voxels.length]} castShadow receiveShadow>
         <meshStandardMaterial roughness={0.2} metalness={0.6} emissive="#1e3a8a" emissiveIntensity={0.2} />
       </instancedMesh>
    </group>
  );
};

// Bird Component (Reused)
const Bird = ({ speed, offset, position, range = 10 }: { speed: number, offset: number, position: [number, number, number], range?: number }) => {
  const group = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (group.current && leftWing.current && rightWing.current) {
      const t = clock.elapsedTime + offset;
      group.current.position.x = position[0] + Math.sin(t * speed * 0.5) * range;
      group.current.position.z = position[2] + Math.cos(t * speed * 0.5) * range * 0.5;
      group.current.position.y = position[1] + Math.sin(t * 2) * 0.5;
      
      const dx = Math.cos(t * speed * 0.5);
      const dz = -Math.sin(t * speed * 0.5) * 0.5;
      group.current.rotation.y = Math.atan2(dx, dz);

      const flap = Math.sin(t * 15);
      leftWing.current.rotation.z = flap * 0.5;
      rightWing.current.rotation.z = -flap * 0.5;
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh position={[0, -0.05, 0]} geometry={boxGeo} scale={[0.1, 0.1, 0.3]}>
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh ref={leftWing} position={[0.15, 0.05, 0]} geometry={boxGeo} scale={[0.3, 0.05, 0.15]}>
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh ref={rightWing} position={[-0.15, 0.05, 0]} geometry={boxGeo} scale={[0.3, 0.05, 0.15]}>
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
};

// Cloud Component (Reused)
const Cloud = ({ position, scale, speed }: { position: [number, number, number], scale: number, speed: number }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
      if (group.current) {
          group.current.position.x += speed * delta;
          if (group.current.position.x > 25) group.current.position.x = -25;
      }
  });

  const bubbles = useMemo(() => Array.from({length: 5 + Math.random() * 3}).map(() => ({
      pos: [Math.random()*2 - 1, Math.random()*0.8, Math.random()*1 - 0.5] as [number, number, number],
      scale: 0.6 + Math.random() * 0.6
  })), []);

  return (
      <group ref={group} position={position} scale={scale}>
          {bubbles.map((b, i) => (
              <mesh key={i} geometry={sphereGeo} position={b.pos} scale={b.scale} castShadow>
                  <meshStandardMaterial color="#e0f2fe" opacity={0.8} transparent flatShading />
              </mesh>
          ))}
      </group>
  )
}

const GroundCanvas = () => {
  const size = 18;
  const tiles = useMemo(() => {
    const t = [];
    const offset = size / 2 - 0.5;
    for(let x = 0; x < size; x++) {
      for(let z = 0; z < size; z++) {
        const noise = Math.sin(x * 0.5) + Math.cos(z * 0.5);
        // Tech grid colors
        let color = '#0f172a'; // Slate 900
        if (noise > 1) color = '#1e293b'; // Slate 800
        else if (noise < -0.5) color = '#020617'; // Slate 950
        
        t.push({ x: x - offset, z: z - offset, color });
      }
    }
    return t;
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if(meshRef.current) {
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();
      tiles.forEach((t, i) => {
         dummy.position.set(t.x, 0, t.z);
         dummy.scale.set(0.95, 0.5, 0.95);
         dummy.updateMatrix();
         meshRef.current!.setMatrixAt(i, dummy.matrix);
         meshRef.current!.setColorAt(i, color.set(t.color));
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [tiles]);

  return (
    <group position={[0, -4, 0]}>
        <instancedMesh ref={meshRef} args={[boxGeo, undefined, tiles.length]} receiveShadow>
          <meshStandardMaterial roughness={0.5} metalness={0.8} />
        </instancedMesh>
    </group>
  );
};

export const Background3D = () => {
  return (
    <div className="absolute inset-0 bg-slate-900 -z-10">
      <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }}>
           <ambientLight intensity={0.5} />
           <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]}>
              <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
           </directionalLight>
           <Environment preset="night" />

           <PerspectiveCamera position={[0, 6, 14]} fov={50} makeDefault />
           
           <Center position={[0, 3, 0]}>
             <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <VoxelText text="4CASTR" position={[0, 0, 0]} scale={0.5} />
             </Float>
           </Center>

           <Cloud position={[-8, 6, -5]} scale={1.5} speed={0.5} />
           <Cloud position={[8, 4, -2]} scale={1.2} speed={0.3} />
           <Bird position={[0, 5, 5]} speed={0.8} offset={0} range={12} />
           <Bird position={[2, 6, 4]} speed={0.9} offset={2} range={14} />

           <GroundCanvas />
      </Canvas>
    </div>
  );
};