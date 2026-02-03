import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
// @ts-ignore
import Cube from 'cubejs';

const COLORS = {
  U: '#ffffff', // White
  D: '#ffff00', // Yellow
  F: '#ff0000', // Red
  B: '#ff6600', // Orange
  L: '#0000ff', // Blue
  R: '#00cc00', // Green
  K: '#111111'  // Black
};

const COLOR_MAP: Record<string, string> = {
  'W': COLORS.U,
  'Y': COLORS.D,
  'R': COLORS.F,
  'O': COLORS.B,
  'B': COLORS.L,
  'G': COLORS.R,
};

const Cubie = ({ position, stickers, cubieRef }: { position: [number, number, number], stickers: string[], cubieRef: any }) => {
  return (
    <group ref={cubieRef} position={position}>
      <RoundedBox args={[0.96, 0.96, 0.96]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={COLORS.K} />
      </RoundedBox>
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[0]] || COLORS.K} />
      </mesh>
      <mesh position={[0, -0.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[1]] || COLORS.K} />
      </mesh>
      <mesh position={[0, 0, 0.48]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[2]] || COLORS.K} />
      </mesh>
      <mesh position={[0, 0, -0.48]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[3]] || COLORS.K} />
      </mesh>
      <mesh position={[-0.48, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[4]] || COLORS.K} />
      </mesh>
      <mesh position={[0.48, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[5]] || COLORS.K} />
      </mesh>
    </group>
  );
};

export const Cube3D = forwardRef((_props, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const cubiesRefs = useRef<any[]>([]);
  const moveQueue = useRef<string[]>([]);
  const isAnimating = useRef(false);
  
  // Mathematical representation
  const mathCube = useMemo(() => new Cube(), []);

  useImperativeHandle(ref, () => ({
    addMove: (move: string) => {
      moveQueue.current.push(move);
      processQueue();
    },
    getFacelets: () => {
        return mathCube.asString();
    },
    reset: () => {
        window.location.reload();
    }
  }));

  const processQueue = () => {
    if (isAnimating.current || moveQueue.current.length === 0) return;
    const move = moveQueue.current.shift();
    if (move) {
        mathCube.move(move);
        performMove(move);
    }
  };

  const cubiesData = useMemo(() => {
    const items = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const stickers = [
            y === 1 ? 'W' : 'K', // U (White)
            y === -1 ? 'Y' : 'K', // D (Yellow)
            z === 1 ? 'R' : 'K', // F (Red)
            z === -1 ? 'O' : 'K', // B (Orange)
            x === -1 ? 'B' : 'K', // L (Blue)
            x === 1 ? 'G' : 'K', // R (Green)
          ];
          items.push({ pos: [x, y, z] as [number, number, number], stickers });
        }
      }
    }
    return items;
  }, []);

  const performMove = (moveStr: string) => {
    isAnimating.current = true;
    const moveType = moveStr[0];
    const isPrime = moveStr.includes("'");
    const isDouble = moveStr.includes("2");
    
    const baseAngles: Record<string, number> = {
      U: -1, D: 1,
      L: 1, R: -1,
      F: -1, B: 1,
      M: 1, E: 1, S: -1
    };
    
    let angle = (baseAngles[moveType] || -1) * (Math.PI / 2);
    if (isPrime) angle *= -1;
    if (isDouble) angle *= 2;
    
    let predicate: (p: THREE.Vector3) => boolean;
    switch (moveType) {
      case 'U': predicate = (p) => p.y > 0.5; break;
      case 'D': predicate = (p) => p.y < -0.5; break;
      case 'L': predicate = (p) => p.x < -0.5; break;
      case 'R': predicate = (p) => p.x > 0.5; break;
      case 'F': predicate = (p) => p.z > 0.5; break;
      case 'B': predicate = (p) => p.z < -0.5; break;
      case 'M': predicate = (p) => Math.abs(p.x) < 0.1; break;
      case 'E': predicate = (p) => Math.abs(p.y) < 0.1; break;
      case 'S': predicate = (p) => Math.abs(p.z) < 0.1; break;
      case 'x': predicate = () => true; break;
      case 'y': predicate = () => true; break;
      case 'z': predicate = () => true; break;
      default: predicate = () => false;
    }

    const movingCubies = cubiesRefs.current.filter(ref => {
        if (!ref) return false;
        const worldPos = new THREE.Vector3();
        ref.getWorldPosition(worldPos);
        return predicate(new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z));
    });
    
    const pivot = new THREE.Group();
    groupRef.current?.add(pivot);
    movingCubies.forEach(c => pivot.add(c));

    const duration = 200;
    const start = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const currentAngle = angle * progress;
      
      if (moveType === 'U' || moveType === 'D' || moveType === 'E' || moveType === 'y') pivot.rotation.y = currentAngle;
      else if (moveType === 'L' || moveType === 'R' || moveType === 'M' || moveType === 'x') pivot.rotation.x = currentAngle;
      else if (moveType === 'F' || moveType === 'B' || moveType === 'S' || moveType === 'z') pivot.rotation.z = currentAngle;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        pivot.updateMatrixWorld();
        movingCubies.forEach(c => {
          groupRef.current?.add(c);
          c.applyMatrix4(pivot.matrixWorld);
          c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
          c.updateMatrix();
        });
        groupRef.current?.remove(pivot);
        isAnimating.current = false;
        processQueue();
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />
        <group ref={groupRef}>
          {cubiesData.map((c, i) => (
            <Cubie 
              key={i} 
              position={c.pos} 
              stickers={c.stickers} 
              cubieRef={(el: any) => cubiesRefs.current[i] = el} 
            />
          ))}
        </group>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
});
