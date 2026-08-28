import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { Vector3 } from "three";
import type { Group } from "three";
import { ALU, ALU_DEEP, BREAK_COLOR, BREAK_D, GlassPane, ProfileFrame, SHELL_Z } from "./models";

/* Proporcje te same co w modelu interaktywnym — to ta sama konstrukcja,
   tylko prowadzona scrollem zamiast przyciskami. */
const W = 1.9;
const H = 2.45;
const FRAME_T = 0.15;
const SASH_T = 0.13;
const SASH_W = W - 2 * FRAME_T - 0.03;
const SASH_H = H - 2 * FRAME_T - 0.03;

/* Skrajne wartości rozsunięcia warstw i otwarcia skrzydła. */
const SHELL_SPREAD = 0.42;
const SASH_SHIFT = 0.95;
const GLASS_SHIFT = 1.7;
const SASH_ANGLE = -0.85;

interface Key {
  /** Pozycja w sekwencji, 0–1. */
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
  /** Otwarcie skrzydła, 0–1. */
  open: number;
  /** Rozłożenie konstrukcji na warstwy, 0–1. */
  explode: number;
}

/**
 * Klatki kluczowe historii: konstrukcja → profil → ruch skrzydła → warstwy →
 * przekrój → powrót do całości. Kolejność i kadry odpowiadają krokom opisanym
 * w warstwie tekstowej sekcji.
 */
/*
 * Cele kamery są policzone tak, żeby konstrukcja stanęła w prawej części
 * kadru: punkt patrzenia jest przesunięty o kawałek w lewo od modelu wzdłuż
 * ekranowej osi poziomej danego ujęcia. Lewa strona kadru zostaje na typografię.
 */
const KEYS: Key[] = [
  { t: 0.0, pos: [2.6, 0.7, 5.4], look: [-0.54, 0, 0.26], open: 0, explode: 0 },
  { t: 0.2, pos: [2.05, 0.95, 3.05], look: [-0.72, 0.72, 0.3], open: 0, explode: 0 },
  { t: 0.4, pos: [2.2, 0.35, 3.6], look: [-0.51, 0, 0.31], open: 1, explode: 0 },
  { t: 0.6, pos: [3.1, 0.6, 4.6], look: [-0.5, 0, 0.34], open: 0.2, explode: 1 },
  { t: 0.8, pos: [4.4, 0.08, 1.15], look: [-0.12, 0.05, 0.49], open: 0.1, explode: 1 },
  { t: 1.0, pos: [2.6, 0.7, 5.4], look: [-0.54, 0, 0.26], open: 0, explode: 0 },
];

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function mix(a: number, b: number, k: number) {
  return a + (b - a) * k;
}

/** Stan sceny dla zadanego postępu scrolla. */
function sample(p: number) {
  const clamped = Math.min(1, Math.max(0, p));

  let i = 0;
  while (i < KEYS.length - 2 && clamped > KEYS[i + 1].t) i++;

  const a = KEYS[i];
  const b = KEYS[i + 1];
  const span = b.t - a.t;
  const k = smoothstep(span <= 0 ? 0 : (clamped - a.t) / span);

  return {
    px: mix(a.pos[0], b.pos[0], k),
    py: mix(a.pos[1], b.pos[1], k),
    pz: mix(a.pos[2], b.pos[2], k),
    lx: mix(a.look[0], b.look[0], k),
    ly: mix(a.look[1], b.look[1], k),
    lz: mix(a.look[2], b.look[2], k),
    open: mix(a.open, b.open, k),
    explode: mix(a.explode, b.explode, k),
  };
}

/**
 * Konstrukcja okna prowadzona wprost z postępu scrolla.
 *
 * Wartości ustawiane są bez tłumienia — wygładzanie robi już `scrub`
 * ScrollTriggera, więc każda klatka jest w pełni określona przez `progress`
 * i nic nie musi „dojeżdżać" po zatrzymaniu scrolla.
 */
function Rig({ progress }: { progress: RefObject<number> }) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const sash = useRef<Group>(null);
  const glass = useRef<Group>(null);
  const look = useMemo(() => new Vector3(), []);
  const eye = useMemo(() => new Vector3(), []);

  useFrame(({ camera, size }) => {
    const s = sample(progress.current ?? 0);

    /* Kadr dopasowany do proporcji ekranu. Ujęcia są komponowane pod szeroki
       widok: model stoi po prawej, lewa połowa zostaje na typografię. Na wąskim
       ekranie żadnej „lewej połowy” nie ma — model wraca na środek, unosi się
       nad blok tekstu, a kamera cofa się, bo pionowy kadr przy fov 38°
       obcinałby konstrukcję o proporcjach 1,9 × 2,45 m.
       0 przy 900 px i szerzej, 1 przy 400 px i węziej. */
    const narrow = Math.min(1, Math.max(0, (900 - size.width) / 500));

    look.set(s.lx * (1 - narrow), s.ly - 0.4 * narrow, s.lz);
    eye
      .set(s.px, s.py, s.pz)
      .sub(look)
      .multiplyScalar(1 + 0.5 * narrow)
      .add(look);

    camera.position.copy(eye);
    camera.lookAt(look);

    if (outer.current) outer.current.position.z = SHELL_Z + SHELL_SPREAD * s.explode;
    if (inner.current) inner.current.position.z = -SHELL_Z - SHELL_SPREAD * s.explode;
    if (sash.current) {
      sash.current.rotation.y = SASH_ANGLE * s.open;
      sash.current.position.z = SASH_SHIFT * s.explode;
    }
    if (glass.current) glass.current.position.z = GLASS_SHIFT * s.explode;
  });

  return (
    <group>
      {/* Ościeżnica: powłoka zewnętrzna — przekładka — powłoka wewnętrzna */}
      <group ref={outer} position={[0, 0, SHELL_Z]}>
        <ProfileFrame w={W} h={H} t={FRAME_T} color={ALU} />
      </group>
      <group>
        <ProfileFrame
          w={W * 0.995}
          h={H * 0.995}
          t={FRAME_T * 0.72}
          d={BREAK_D}
          color={BREAK_COLOR}
          roughness={0.85}
        />
      </group>
      <group ref={inner} position={[0, 0, -SHELL_Z]}>
        <ProfileFrame w={W} h={H} t={FRAME_T} color={ALU_DEEP} />
      </group>

      {/* Skrzydło obraca się wokół krawędzi, nie wokół własnego środka */}
      <group position={[-SASH_W / 2, 0, 0]}>
        <group ref={sash}>
          <group position={[SASH_W / 2, 0, 0]}>
            <ProfileFrame w={SASH_W} h={SASH_H} t={SASH_T} color={ALU} />
            <group ref={glass}>
              <GlassPane w={SASH_W - 2 * SASH_T} h={SASH_H - 2 * SASH_T} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/** Udostępnia sekcji funkcję odświeżenia — scroll sam zamawia klatki. */
function Bind({ bind }: { bind: (invalidate: () => void) => void }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    bind(invalidate);
    invalidate();
  }, [bind, invalidate]);

  return null;
}

interface StorySceneProps {
  /** Postęp sekwencji 0–1, zapisywany przez ScrollTrigger poza Reactem. */
  progress: RefObject<number>;
  /** Sekcja jest w polu widzenia. */
  active: boolean;
  bind: (invalidate: () => void) => void;
}

export default function StoryScene({ progress, active, bind }: StorySceneProps) {
  /* Telefony mają gęste ekrany i słabsze GPU, a scena zajmuje cały kadr:
     na małych szerokościach ścinamy pułap DPR i wyłączamy wygładzanie
     krawędzi. Liczone raz, przy montażu — scena montuje się dopiero przy
     wejściu w widok i nie przeżywa obrotu ekranu w trakcie sekwencji. */
  const small = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      /* Scena zajmuje cały ekran, więc pułap DPR niżej niż w podglądzie karty. */
      dpr={[1, small ? 1.25 : 1.6]}
      camera={{ position: KEYS[0].pos, fov: 38 }}
      gl={{ antialias: !small, powerPreference: "high-performance" }}
      frameloop={active ? "demand" : "never"}
    >
      <color attach="background" args={["#141618"]} />

      <Bind bind={bind} />

      {/* Jaśniej niż w podglądzie karty — nad sceną leżą jeszcze warstwy
          tonalne pod typografię, a aluminium musi zostać czytelne. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <directionalLight position={[0, 1.5, 6]} intensity={0.9} />
      <directionalLight position={[-5, 2, -3]} intensity={0.7} color="#9db4c7" />

      <Environment resolution={192}>
        <Lightformer intensity={3} position={[0, 4, -4]} scale={[12, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-5, 0, 2]} scale={[3, 10, 1]} color="#c8d4dd" />
        <Lightformer intensity={1.8} position={[5, 1, 2]} scale={[3, 10, 1]} color="#ffffff" />
        <Lightformer intensity={0.9} position={[0, -4, 1]} scale={[10, 3, 1]} color="#8a7a63" />
      </Environment>

      <Rig progress={progress} />
    </Canvas>
  );
}
