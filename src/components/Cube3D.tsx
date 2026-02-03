import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  U: '#ffffff', // White
  D: '#ffcc00', // Yellow
  F: '#ff0000', // Red
  B: '#0000ff', // Blue
  L: '#ff6600', // Orange
  R: '#00cc00', // Green
  K: '#111111'  // Black
};

// Precise color extraction from Sungmin's photos
// Based on center pieces: F:Red, U:Yellow, R:Green, B:Orange, D:White, L:Blue
const INITIAL_STATE = {
  U: ['W', 'G', 'R', 'W', 'Y', 'O', 'W', 'R', 'R'], // Yellow center
  D: ['Y', 'B', 'O', 'Y', 'W', 'G', 'Y', 'B', 'B'], // White center
  F: ['W', 'Y', 'Y', 'G', 'R', 'R', 'O', 'R', 'G'], // Red center
  B: ['R', 'W', 'W', 'O', 'O', 'B', 'G', 'O', 'Y'], // Orange center
  L: ['R', 'R', 'O', 'W', 'B', 'G', 'B', 'Y', 'G'], // Blue center
  R: ['Y', 'O', 'G', 'B', 'G', 'W', 'O', 'B', 'B'], // Green center
};

const COLOR_MAP: Record<string, string> = {
  'W': COLORS.U,
  'Y': COLORS.D,
  'R': COLORS.F,
  'B': COLORS.B,
  'O': COLORS.L,
  'G': COLORS.R,
};

const Cubie = ({ position, stickers, cubieRef }: { position: [number, number, number], stickers: string[], cubieRef: any }) => {
  return (
    <group ref={cubieRef} position={position}>
      <RoundedBox args={[0.96, 0.96, 0.96]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={COLORS.K} />
      </RoundedBox>
      {/* Top, Bottom, Front, Back, Left, Right */}
      <mesh position={[0, 0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[0]] || COLORS.K} />
      </mesh>
      <mesh position={[0, -0.49, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[1]] || COLORS.K} />
      </mesh>
      <mesh position={[0, 0, 0.49]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[2]] || COLORS.K} />
      </mesh>
      <mesh position={[0, 0, -0.49]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[3]] || COLORS.K} />
      </mesh>
      <mesh position={[-0.49, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.82, 0.82]} />
        <meshStandardMaterial color={COLOR_MAP[stickers[4]] || COLORS.K} />
      </mesh>
      <mesh position={[0.49, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
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

  useImperativeHandle(ref, () => ({
    addMove: (move: string) => {
      moveQueue.current.push(move);
      processQueue();
    },
    reset: () => {
        // Simple reload for reset in this prototype
        window.location.reload();
    }
  }));

  const processQueue = () => {
    if (isAnimating.current || moveQueue.current.length === 0) return;
    const move = moveQueue.current.shift();
    if (move) performMove(move);
  };

  const cubiesData = useMemo(() => {
    const items = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const stickers = [
            y === 1 ? INITIAL_STATE.U[ (x+1) + (z+1)*3 ] : 'K',
            y === -1 ? INITIAL_STATE.D[ (x+1) + (2-(z+1))*3 ] : 'K',
            z === 1 ? INITIAL_STATE.F[ (x+1) + (1-y)*3 ] : 'K',
            z === -1 ? INITIAL_STATE.B[ (1-x) + (1-y)*3 ] : 'K',
            x === -1 ? INITIAL_STATE.L[ (z+1) + (1-y)*3 ] : 'K',
            x === 1 ? INITIAL_STATE.R[ (2-(z+1)) + (1-y)*3 ] : 'K',
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
    
    let angle = -Math.PI / 2;
    if (isPrime) angle = Math.PI / 2;
    if (isDouble) angle = Math.PI;
    
    let predicate: (p: THREE.Vector3) => boolean;
    switch (moveType) {
      case 'U': predicate = (p) => p.y > 0.5; break;
      case 'D': predicate = (p) => p.y < -0.5; break;
      case 'L': predicate = (p) => p.x < -0.5; break;
      case 'R': predicate = (p) => p.x > 0.5; break;
      case 'F': predicate = (p) => p.z > 0.5; break;
      case 'B': predicate = (p) => p.z < -0.5; break;
      default: predicate = () => false;
    }

    const movingCubies = cubiesRefs.current.filter(ref => {
        if (!ref) return false;
        const worldPos = new THREE.Vector3();
        ref.getWorldPosition(worldPos);
        return predicate(new THREE.Vector3(Math.round(worldPos.x), Math.round(worldPos.y), Math.round(worldPos.z)));
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
      
      if (moveType === 'U' || moveType === 'D') pivot.rotation.y = currentAngle;
      if (moveType === 'L' || moveType === 'R') pivot.rotation.x = currentAngle;
      if (moveType === 'F' || moveType === 'B') pivot.rotation.z = currentAngle;

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
