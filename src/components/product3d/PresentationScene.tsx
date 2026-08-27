import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Vector3 } from "three";
import type { Group } from "three";
import { ALU, ALU_DEEP, BREAK_COLOR, ProfileFrame, approach, useSceneFrame } from "./models";
import { PRESENTATION_STEPS } from "./presentation";

/* ------------------------------------------------------------------
   PREZENTACJA KONSTRUKCJI — SCENA

   Model jest zbudowany z DWÓCH rodzajów liczb i trzeba je rozróżniać:

   1. `depth` — głębokość zabudowy, przychodzi z parametru systemu
      (z podanym źródłem) i jest odwzorowana w skali 1:1. To jedyny wymiar,
      który scena podpisuje.

   2. proporcje otworu, szerokości profili w widoku i podział głębokości
      między powłoki — POGLĄDOWE. Producent ich publicznie nie podaje,
      więc nie są nigdzie opisane ani wymiarowane. Zmiana tych stałych
      nie zmienia żadnej informacji o systemie.
   ------------------------------------------------------------------ */

/* Przykładowa konstrukcja jednoskrzydłowa — wymiar otworu, nie systemu. */
const W = 1.2;
const H = 1.5;

/* Szerokości profili w widoku — poglądowe. */
const FRAME_FACE = 0.1;
const SASH_FACE = 0.085;

/* Podział głębokości na powłoki i przekładkę — poglądowy, ale sumuje się
   dokładnie do potwierdzonej głębokości zabudowy. */
const SHELL_RATIO = 0.34;
const BREAK_RATIO = 1 - 2 * SHELL_RATIO;

/* Skrajne przesunięcia przy rozłożeniu na warstwy. */
const SHELL_SPREAD = 0.075;
const SASH_SPREAD = 0.16;
const GLASS_SPREAD = 0.3;
const SASH_ANGLE = -0.9;

const SASH_W = W - 2 * FRAME_FACE - 0.006;
const SASH_H = H - 2 * FRAME_FACE - 0.006;
const GLASS_W = SASH_W - 2 * SASH_FACE;
const GLASS_H = SASH_H - 2 * SASH_FACE;

const BRONZE = "#c3a175";

/** Etykieta w scenie — numer zgodny z legendą schematu przekroju. */
function PartTag({ position, no, children }: { position: [number, number, number]; no: string; children: ReactNode }) {
  return (
    <Html position={position} center distanceFactor={1.6} zIndexRange={[10, 0]}>
      <div className="flex items-center gap-2 whitespace-nowrap border border-bronze-light/50 bg-void/85 px-2 py-1 backdrop-blur-sm">
        <span className="flex h-4 w-4 items-center justify-center bg-bronze-light font-mono text-[9px] text-void">
          {no}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bronze-light">{children}</span>
      </div>
    </Html>
  );
}

/**
 * Wymiar głębokości zabudowy — jedyna liczba, którą scena podpisuje.
 * Rysowany jak na rysunku technicznym: linia z zasięgami na końcach.
 */
function DepthDimension({ depth, label }: { depth: number; label: string }) {
  const half = depth / 2;
  const tick = 0.05;
  const x = -W / 2 - 0.05;
  const y = 0;

  return (
    <group position={[x, y, 0]}>
      <mesh>
        <boxGeometry args={[0.003, 0.003, depth]} />
        <meshBasicMaterial color={BRONZE} />
      </mesh>
      {[-half, half].map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <boxGeometry args={[0.003, tick, 0.003]} />
          <meshBasicMaterial color={BRONZE} />
        </mesh>
      ))}
      <Html position={[0, -0.07, 0]} center distanceFactor={0.9} zIndexRange={[10, 0]}>
        <div className="whitespace-nowrap border border-bronze-light/50 bg-void/85 px-2.5 py-1 text-center backdrop-blur-sm">
          <span className="block font-mono text-[13px] leading-none text-bronze-light">{label}</span>
          <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.16em] text-limestone/60">
            Głębokość zabudowy
          </span>
        </div>
      </Html>
    </group>
  );
}

interface RigProps {
  depth: number;
  depthLabel: string;
  step: number;
}

function Rig({ depth, depthLabel, step }: RigProps) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const sash = useRef<Group>(null);
  const glass = useRef<Group>(null);
  const look = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera);

  const shellD = depth * SHELL_RATIO;
  const breakD = depth * BREAK_RATIO;
  /* Środek powłoki względem środka profilu — z tego składa się pełna głębokość. */
  const shellZ = (shellD + breakD) / 2;

  const frame = PRESENTATION_STEPS[step] ?? PRESENTATION_STEPS[0];

  // Zmiana kroku musi obudzić pętlę — scena renderuje na żądanie.
  useEffect(() => invalidate(), [invalidate, step]);

  useSceneFrame((delta) => {
    let busy = approach(camera.position, "x", frame.camera.pos[0], delta, 2.6);
    busy = approach(camera.position, "y", frame.camera.pos[1], delta, 2.6) || busy;
    busy = approach(camera.position, "z", frame.camera.pos[2], delta, 2.6) || busy;

    busy = approach(look, "x", frame.camera.look[0], delta, 2.6) || busy;
    busy = approach(look, "y", frame.camera.look[1], delta, 2.6) || busy;
    busy = approach(look, "z", frame.camera.look[2], delta, 2.6) || busy;
    target.copy(look);
    camera.lookAt(target);

    busy = approach(sash.current?.rotation, "y", SASH_ANGLE * frame.open, delta) || busy;
    busy = approach(outer.current?.position, "z", shellZ + SHELL_SPREAD * frame.spread, delta) || busy;
    busy = approach(inner.current?.position, "z", -shellZ - SHELL_SPREAD * frame.spread, delta) || busy;
    busy = approach(sash.current?.position, "z", SASH_SPREAD * frame.spread, delta) || busy;
    busy = approach(glass.current?.position, "z", GLASS_SPREAD * frame.spread, delta) || busy;

    return busy;
  });

  return (
    <group>
      {/* OŚCIEŻNICA — powłoka zewnętrzna, przekładka, powłoka wewnętrzna */}
      <group ref={outer} position={[0, 0, shellZ]}>
        <ProfileFrame w={W} h={H} t={FRAME_FACE} d={shellD} color={ALU} />
      </group>
      <group>
        <ProfileFrame
          w={W * 0.995}
          h={H * 0.995}
          t={FRAME_FACE * 0.7}
          d={breakD}
          color={BREAK_COLOR}
          roughness={0.85}
        />
      </group>
      <group ref={inner} position={[0, 0, -shellZ]}>
        <ProfileFrame w={W} h={H} t={FRAME_FACE} d={shellD} color={ALU_DEEP} />
      </group>

      {/* SKRZYDŁO — obrót wokół krawędzi, nie wokół własnego środka */}
      <group position={[-SASH_W / 2, 0, 0]}>
        <group ref={sash}>
          <group position={[SASH_W / 2, 0, 0]}>
            <ProfileFrame w={SASH_W} h={SASH_H} t={SASH_FACE} d={depth * 0.82} color={ALU} />
            <group ref={glass}>
              <mesh>
                <planeGeometry args={[GLASS_W, GLASS_H]} />
                <meshPhysicalMaterial
                  color="#cfe2dc"
                  transparent
                  opacity={0.18}
                  roughness={0.04}
                  metalness={0.16}
                  envMapIntensity={1.6}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {frame.dimension && <DepthDimension depth={depth} label={depthLabel} />}

      {frame.parts && (
        <>
          <PartTag position={[-W / 2 - 0.16, H / 2 - 0.2, 0]} no="1">
            Ościeżnica
          </PartTag>
          <PartTag position={[0.14, H / 2 + 0.1, 0.16]} no="2">
            Skrzydło
          </PartTag>
          <PartTag position={[W / 2 + 0.22, -0.12, 0]} no="3">
            Przekładka termiczna
          </PartTag>
          <PartTag position={[0, -H / 2 - 0.14, 0.46]} no="6">
            Pakiet szybowy
          </PartTag>
        </>
      )}
    </group>
  );
}

interface PresentationSceneProps {
  depth: number;
  depthLabel: string;
  step: number;
  /** Sekcja jest w polu widzenia — poza nim pętla klatek stoi. */
  active: boolean;
  label?: string;
}

export default function PresentationScene({
  depth,
  depthLabel,
  step,
  active,
  label,
}: PresentationSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: PRESENTATION_STEPS[0].camera.pos, fov: 34 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      frameloop={active ? "demand" : "never"}
      aria-label={label}
    >
      <color attach="background" args={["#141618"]} />

      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 4]} intensity={2.1} />
      <directionalLight position={[0, 1.2, 5]} intensity={0.8} />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#9db4c7" />

      <Environment resolution={192}>
        <Lightformer intensity={2.8} position={[0, 4, -4]} scale={[12, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-5, 0, 2]} scale={[3, 10, 1]} color="#c8d4dd" />
        <Lightformer intensity={1.7} position={[5, 1, 2]} scale={[3, 10, 1]} color="#ffffff" />
        <Lightformer intensity={0.9} position={[0, -4, 1]} scale={[10, 3, 1]} color="#8a7a63" />
      </Environment>

      <Rig depth={depth} depthLabel={depthLabel} step={step} />
    </Canvas>
  );
}
