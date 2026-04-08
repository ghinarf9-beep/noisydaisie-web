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

// --- 1. Komponen Ruangan Realistik (No Looping) ---
function DimensionBox({ position, texturePath }: { position: [number, number, number], texturePath: string }) {
  const tex = useTexture(texturePath);
  tex.colorSpace = THREE.SRGBColorSpace;

  const materials = useMemo(() => {
    // Sisi Kanan: Ambil area kanan gambar
    const rightSide = tex.clone();
    rightSide.offset.set(0.6, 0); 
    rightSide.repeat.set(0.4, 1);

    // Sisi Kiri: Ambil area kiri gambar
    const leftSide = tex.clone();
    leftSide.offset.set(0, 0); 
    leftSide.repeat.set(0.4, 1);

    // Atap: Ambil area atas tengah
    const topSide = tex.clone();
    topSide.offset.set(0.2, 0.7);
    topSide.repeat.set(0.6, 0.3);

    // Lantai: Ambil area bawah tengah
    const bottomSide = tex.clone();
    bottomSide.offset.set(0.2, 0);
    bottomSide.repeat.set(0.6, 0.3);

    // Sisi Belakang (Ujung lorong): Ambil tengah-tengah
    const backSide = tex.clone();
    backSide.offset.set(0.3, 0.2);
    backSide.repeat.set(0.4, 0.6);

    return [
      new THREE.MeshStandardMaterial({ map: rightSide, side: THREE.BackSide }), // Right
      new THREE.MeshStandardMaterial({ map: leftSide, side: THREE.BackSide }),  // Left
      new THREE.MeshStandardMaterial({ map: topSide, side: THREE.BackSide }),   // Top
      new THREE.MeshStandardMaterial({ map: bottomSide, side: THREE.BackSide }),// Bottom
      new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),        // Front (Bolong)
      new THREE.MeshStandardMaterial({ map: backSide, side: THREE.BackSide }),  // Back
    ];
  }, [tex]);

  return (
    <mesh position={position}>
      <boxGeometry args={[12, 10, 40]} />
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  );
}

// --- 2. Komponen Pendukung Lainnya ---
function PortalGate({ position, texturePath }: { position: [number, number, number], texturePath: string }) {
  const tex = useTexture(texturePath);
  return (
    <mesh position={position}>
      <planeGeometry args={[12, 10]} />
      <meshStandardMaterial map={tex} side={THREE.DoubleSide} transparent opacity={0.9} />
    </mesh>
  );
}

function MovingObject({ position, texturePath }: { position: [number, number, number], texturePath: string }) {
  const video = useMemo(() => {
    if (typeof window === "undefined") return null;
    const v = document.createElement("video");
    v.src = texturePath;
    v.crossOrigin = "Anonymous";
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.play().catch(() => {});
    return v;
  }, [texturePath]);
  if (!video) return null;
  return (
    <mesh position={position}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial side={THREE.DoubleSide} transparent>
        <videoTexture attach="map" args={[video]} />
      </meshStandardMaterial>
    </mesh>
  );
}

// --- 3. World Engine ---
function World() {
  const scroll = useScroll();
  const firstGateRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    state.camera.position.z = 15 - scroll.offset * 180;
    state.camera.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    if (firstGateRef.current) {
      (firstGateRef.current.material as THREE.MeshStandardMaterial).opacity = 1 - scroll.offset * 30;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 5, 5]} intensity={20} color="#ffffff" />
      <pointLight position={[0, 5, -40]} intensity={20} color="#ffaa55" />

      {/* DIMENSI 1 */}
      <mesh ref={firstGateRef} position={[0, 0, 10]}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial map={useTexture("/istana1.jpeg")} transparent />
      </mesh>
      <DimensionBox position={[0, 0, -10]} texturePath="/istana1.jpeg" />
      <MovingObject position={[-3, 0, -15]} texturePath="/animasi.gif" />

      {/* TRANSISI 1-2 */}
      <PortalGate position={[0, 0, -29.9]} texturePath="/istana2.jpeg" />

      {/* DIMENSI 2 */}
      <DimensionBox position={[0, 0, -50]} texturePath="/istana2.jpeg" />
      <Text position={[0, 2.5, -45]} fontSize={0.4} color="#ffaa55" fontStyle="italic">
        THE HIDDEN PASSAGE
      </Text>

      {/* TRANSISI 2-3 */}
      <PortalGate position={[0, 0, -69.9]} texturePath="/istana3.jpeg" />

      {/* DIMENSI 3 */}
      <DimensionBox position={[0, 0, -90]} texturePath="/istana3.jpeg" />
      <Text position={[0, 2.5, -85]} fontSize={0.5} color="white" fontStyle="italic">
        @NOISYDAISIE
      </Text>
    </>
  );
}

// --- 4. Main Component ---
export default function Home() {
  return (
    <main className="h-screen w-full bg-black overflow-hidden">
      <div className="absolute top-10 left-10 z-10 text-white mix-blend-difference pointer-events-none">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">NOISYDAISIE</h1>
        <div className="flex gap-4 mt-2">
          <p className="text-[10px] opacity-40 uppercase tracking-[0.2em]">HAHA HIHI HAHA HIHI</p>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={["#000000"]} />
        <ScrollControls pages={15} damping={0.2}>
          <Suspense fallback={<Html center><p className="text-white animate-pulse uppercase tracking-widest">Entering Palace...</p></Html>}>
            <World />
            <Environment preset="night" />
          </Suspense>
        </ScrollControls>
      </Canvas>
      
      <div className="absolute bottom-10 w-full text-center pointer-events-none opacity-20">
        <p className="text-[10px] text-white uppercase tracking-[0.5em] animate-bounce">Time To Bloom</p>
      </div>
    </main>
  );
}