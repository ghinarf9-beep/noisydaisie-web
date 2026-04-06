"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, Suspense, useMemo } from "react";
import * as THREE from "three";
import { 
  useTexture, 
  ScrollControls, 
  useScroll, 
  Billboard, 
  Float, 
  Environment, 
  Text,
  Html 
} from "@react-three/drei";

// --- 1. Komponen Animasi Orang Ngobrol (Sprite Engine) ---
function AnimatedPeople({ position, texturePath, rows = 1, cols = 4, fps = 8 }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const tex = useTexture(texturePath);
  
  const spriteTex = useMemo(() => {
    const t = tex.clone();
    t.matrixAutoUpdate = false;
    t.repeat.set(1 / cols, 1 / rows);
    return t;
  }, [tex, rows, cols]);

  useFrame((state) => {
    const totalFrames = rows * cols;
    const frameIndex = Math.floor(state.clock.elapsedTime * fps) % totalFrames;
    
    const col = frameIndex % cols;
    const row = Math.floor(frameIndex / cols);
    
    spriteTex.offset.x = col / cols;
    spriteTex.offset.y = 1 - (row + 1) / rows;

    const dist = state.camera.position.z - position[2];
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, Math.min(1, dist * 0.5));
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <Billboard position={position}>
        <mesh ref={meshRef}>
          <planeGeometry args={[4, 4]} />
          <meshStandardMaterial map={spriteTex} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </Billboard>
    </Float>
  );
}

// --- 2. Komponen Ruangan (DimensionBox) ---
function DimensionBox({ position, texturePath }: { position: [number, number, number], texturePath: string }) {
  const tex = useTexture(texturePath);
  tex.colorSpace = THREE.SRGBColorSpace;

  const materials = useMemo(() => {
    const side = tex.clone();
    side.wrapS = side.wrapT = THREE.RepeatWrapping;
    
    const top = tex.clone(); 
    top.offset.set(0, 0.7); 
    top.repeat.set(1, 0.3);
    
    const bottom = tex.clone(); 
    bottom.offset.set(0, 0); 
    bottom.repeat.set(1, 0.3);

    return [
      new THREE.MeshStandardMaterial({ map: side, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ map: side, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ map: top, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ map: bottom, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }), 
      new THREE.MeshStandardMaterial({ map: side, side: THREE.DoubleSide }),
    ];
  }, [tex]);

  return (
    <mesh position={position} material={materials}>
      <boxGeometry args={[12, 10, 40]} />
    </mesh>
  );
}

// --- 3. Komponen Pintu Portal ---
function PortalGate({ position, texturePath }: { position: [number, number, number], texturePath: string }) {
  const tex = useTexture(texturePath);
  return (
    <mesh position={position}>
      <planeGeometry args={[12, 10]} />
      <meshStandardMaterial map={tex} side={THREE.DoubleSide} transparent />
    </mesh>
  );
}

// --- 4. Inti Dunia (World Engine) ---
function World() {
  const scroll = useScroll();
  const firstGateRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    // Jalur Maju Kamera
    state.camera.position.z = 15 - scroll.offset * 180;
    // Efek jalan kaki
    state.camera.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;

    if (firstGateRef.current) {
      (firstGateRef.current.material as THREE.MeshStandardMaterial).opacity = 1 - scroll.offset * 30;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 4, 5]} intensity={10} color="#ffffff" />
      <pointLight position={[0, 4, -35]} intensity={10} color="#ffffff" />

      {/* --- DIMENSI 1 --- */}
      <mesh ref={firstGateRef} position={[0, 0, 10]}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial map={useTexture("/pintu.jpg")} transparent />
      </mesh>
      
      <DimensionBox position={[0, 0, -10]} texturePath="/lorong.jpg" />
      
      {/* Objek Animasi Orang Ngobrol (Ganti /pintu.jpg ke aset Bubu nanti) */}
      <AnimatedPeople 
        position={[3, -1.5, -15]} 
        texturePath="/pintu.jpg" 
        cols={4} 
        rows={1} 
        fps={6}
      />

      {/* --- TRANSISI PINTU --- */}
      <PortalGate position={[0, 0, -29.9]} texturePath="/pintu.jpg" />

      {/* --- DIMENSI 2 --- */}
      <DimensionBox position={[0, 0, -50]} texturePath="/lorong.jpg" />
      
      <AnimatedPeople 
        position={[-3, -1.5, -55]} 
        texturePath="/pintu.jpg" 
        cols={4} 
        fps={4}
      />

      <Text position={[0, 2.5, -45]} fontSize={0.3} color="white" fontStyle="italic">
        OUR NEW PRODUCT
      </Text>

      {/* --- DIMENSI 3 --- */}
      <PortalGate position={[0, 0, -69.9]} texturePath="/pintu.jpg" />
      <DimensionBox position={[0, 0, -90]} texturePath="/lorong.jpg" />
    </>
  );
}

// --- 5. Main Component ---
export default function Home() {
  return (
    <main className="h-screen w-full bg-black overflow-hidden font-sans">
      <div className="absolute top-10 left-10 z-10 text-white mix-blend-difference pointer-events-none">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">NOISYDAISIE</h1>
        <div className="flex gap-4 mt-2">
          <p className="text-[10px] opacity-40 uppercase tracking-[0.2em]">Coded by Nara</p>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.2em]">Designed by Bubu</p>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={["#000000"]} />
        <ScrollControls pages={15} damping={0.2}>
          <Suspense fallback={<Html center><p className="text-white animate-pulse">WE PRESENT</p></Html>}>
            <World />
            <Environment preset="night" />
          </Suspense>
        </ScrollControls>
      </Canvas>
      
      <div className="absolute bottom-10 w-full text-center pointer-events-none opacity-20">
        <p className="text-[10px] text-white uppercase tracking-[0.5em] animate-bounce">Scroll Down</p>
      </div>
    </main>
  );
}