import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  white: '#ffffff',
  yellow: '#ffcc00',
  red: '#ff0000',
  orange: '#ff6600',
  blue: '#0000ff',
  green: '#00cc00',
  black: '#111111'
};

const Cubie = ({ position, colors }: { position: [number, number, number], colors: string[] }) => {
  return (
    <group position={position}>
      <RoundedBox args={[0.95, 0.95, 0.95]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={COLORS.black} />
      </RoundedBox>
      {/* Stickers */}
      {/* Top */}
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color={colors[0] || COLORS.black} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color={colors[1] || COLORS.black} />
      </mesh>
      {/* Front */}
      <mesh position={[0, 0, 0.48]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color={colors[2] || COLORS.black} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0, -0.48]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color={colors[3] || COLORS.black} />
      </mesh>
      {/* Left */}
      <mesh position={[-0.48, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color={colors[4] || COLORS.black} />
      </mesh>
      {/* Right */}
      <mesh position={[0.48, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color={colors[5] || COLORS.black} />
      </mesh>
    </group>
  );
};

export const Cube3D = ({ cubeState }: { cubeState: any }) => {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Canvas camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group>
          {Array.from({ length: 27 }).map((_, i) => {
            const x = (i % 3) - 1;
            const y = Math.floor((i / 3) % 3) - 1;
            const z = Math.floor(i / 9) - 1;
            
            // Logic to determine which faces are visible and their colors
            const colors = [
              y === 1 ? COLORS.white : COLORS.black, // Up
              y === -1 ? COLORS.yellow : COLORS.black, // Down
              z === 1 ? COLORS.green : COLORS.black, // Front
              z === -1 ? COLORS.blue : COLORS.black, // Back
              x === -1 ? COLORS.orange : COLORS.black, // Left
              x === 1 ? COLORS.red : COLORS.black, // Right
            ];

            return <Cubie key={i} position={[x, y, z]} colors={colors} />;
          })}
        </group>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
};
