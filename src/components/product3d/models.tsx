import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef } from "react";
import type { ReactNode, RefObject } from "react";
import type { Group } from "three";
import { DoubleSide } from "three";

export type SceneMode = "full" | "open" | "exploded";

/* Wspólne materiały i wymiary warstw profilu.

   Barwa zestrojona z tokenem `--color-aluminium` (#9ba1a6). Wcześniej profil
   był o kilka wartości jaśniejszy od aluminium reszty strony i wychodził
   prawie biały — a metal, który nie ma ciemniejszej wartości bazowej, nie ma
   też miejsca na jasny refleks i czyta się jak malowany plastik. */
export const ALU = "#a9aeb2";
export const ALU_DEEP = "#7e848a";
export const BREAK_COLOR = "#463c30";

const SHELL_D = 0.055;
export const BREAK_D = 0.032;
export const SHELL_Z = (SHELL_D + BREAK_D) / 2;

/* ================================================================
   RUCH SCENY

   Scena renderuje na żądanie (frameloop="demand"), więc każda animacja musi
   umieć powiedzieć, czy jeszcze trwa — inaczej albo zatrzyma się w połowie,
   albo będzie zamawiać klatki bez końca.
   ================================================================ */

/** Próg, poniżej którego ruch uznajemy za zakończony (jednostki sceny / radiany). */
const SETTLED = 0.0005;

/** Tempo dochodzenia do wartości docelowej — wyżej = ostrzej. */
const RATE = 3.2;

/* Kadr prezentacyjny: model wjeżdża jednym obrotem do ujęcia 3/4. */
const SWING_FROM = -1.05;
const SWING_TO = -0.42;
const SWING_FROM_WIDE = -1.15;
const SWING_TO_WIDE = -0.5;

type Axis = "x" | "y" | "z";
type Vec = { x: number; y: number; z: number };

/**
 * Dosuwa jedną oś obiektu (position albo rotation) do wartości docelowej.
 *
 * Dochodzenie wykładnicze zamiast `lerp(a, b, delta * k)` — tamto zależało od
 * klatkażu, więc ten sam ruch trwał inaczej na 60 i na 120 Hz.
 *
 * Zwraca `true`, dopóki ruch trwa.
 */
function approach(obj: Vec | null | undefined, axis: Axis, target: number, delta: number, rate = RATE) {
  if (!obj) return false;
  const current = obj[axis];
  if (current === target) return false;

  const next = current + (target - current) * (1 - Math.exp(-rate * delta));
  const done = Math.abs(target - next) < SETTLED;
  obj[axis] = done ? target : next;
  return !done;
}

/**
 * Klatka modelu. `step` dostaje przyciętą deltę (po powrocie z innej karty
 * potrafi skoczyć do sekund) i mówi, czy coś jeszcze jedzie — jeśli tak,
 * zamawiamy kolejną klatkę.
 */
function useSceneFrame(step: (delta: number) => boolean) {
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, delta) => {
    if (step(Math.min(delta, 0.05))) invalidate();
  });
}

/**
 * Jednorazowy obrót prezentacyjny przy pierwszym pokazaniu modelu.
 *
 * Zastępuje wcześniejsze wieczne kręcenie się w kółko: tamto walczyło ze
 * sterowaniem użytkownika i nie pozwalało pętli klatek nigdy stanąć.
 */
function useIntroSwing(root: RefObject<Group | null>, from: number, to: number, seconds = 1.6) {
  const t = useRef(0);

  return (delta: number) => {
    if (t.current >= 1 || !root.current) return false;
    t.current = Math.min(1, t.current + delta / seconds);
    const eased = 1 - Math.pow(1 - t.current, 3);
    /* Animacja sceny 3D pisze wprost po obiekcie three.js — to jedyny sposób,
       w jaki r3f rusza modelem między klatkami. Stan Reacta oznaczałby render
       na każdą klatkę, czyli dokładnie to, czego scena unika. */
    // eslint-disable-next-line react/immutability
    root.current.rotation.y = from + (to - from) * eased;
    return true;
  };
}

/** Prostokątna rama złożona z czterech profili. */
export function ProfileFrame({
  w,
  h,
  t,
  d = SHELL_D,
  color = ALU,
  roughness = 0.24,
}: {
  w: number;
  h: number;
  t: number;
  d?: number;
  color?: string;
  roughness?: number;
}) {
  /* Metal widać po odbiciu otoczenia, nie po rozproszeniu światła: przy
     `metalness` bliskim 1 składowa rozproszona prawie nie istnieje. Stąd
     ostrzejsze odbicie (niższa chropowatość) i mocniejsza mapa otoczenia —
     to one dają kierunkowy połysk, ten sam, który opisuje klasa `.brushed`. */
  const mat = (
    <meshStandardMaterial color={color} metalness={0.92} roughness={roughness} envMapIntensity={1.45} />
  );
  return (
    <group>
      <mesh position={[0, h / 2 - t / 2, 0]}>
        <boxGeometry args={[w, t, d]} />
        {mat}
      </mesh>
      <mesh position={[0, -(h / 2 - t / 2), 0]}>
        <boxGeometry args={[w, t, d]} />
        {mat}
      </mesh>
      <mesh position={[-(w / 2 - t / 2), 0, 0]}>
        <boxGeometry args={[t, h - 2 * t, d]} />
        {mat}
      </mesh>
      <mesh position={[w / 2 - t / 2, 0, 0]}>
        <boxGeometry args={[t, h - 2 * t, d]} />
        {mat}
      </mesh>
    </group>
  );
}

/** Rama trójwarstwowa: powłoka zewnętrzna — przekładka — powłoka wewnętrzna. */
export function LayeredFrame({
  w,
  h,
  t,
  spread,
  labelOuter,
  labelBreak,
}: {
  w: number;
  h: number;
  t: number;
  spread: number;
  labelOuter?: string;
  labelBreak?: string;
}) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);

  useSceneFrame((delta) => {
    let busy = approach(outer.current?.position, "z", SHELL_Z + spread, delta);
    busy = approach(inner.current?.position, "z", -SHELL_Z - spread, delta) || busy;
    return busy;
  });

  return (
    <group>
      <group ref={outer} position={[0, 0, SHELL_Z]}>
        <ProfileFrame w={w} h={h} t={t} color={ALU} />
        {labelOuter && spread > 0.05 && <Label position={[0, -h / 2 - 0.26, 0]}>{labelOuter}</Label>}
      </group>

      <group>
        <ProfileFrame w={w * 0.995} h={h * 0.995} t={t * 0.72} d={BREAK_D} color={BREAK_COLOR} roughness={0.85} />
        {labelBreak && spread > 0.05 && <Label position={[-w / 2 - 0.34, 0.12, 0]}>{labelBreak}</Label>}
      </group>

      <group ref={inner} position={[0, 0, -SHELL_Z]}>
        <ProfileFrame w={w} h={h} t={t} color={ALU_DEEP} />
      </group>
    </group>
  );
}

export function Label({ position, children }: { position: [number, number, number]; children: ReactNode }) {
  return (
    <Html position={position} center distanceFactor={8} zIndexRange={[10, 0]}>
      <div className="whitespace-nowrap border border-bronze-light/50 bg-void/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bronze-light backdrop-blur-sm">
        {children}
      </div>
    </Html>
  );
}

export function GlassPane({
  w,
  h,
  label,
  showLabel = false,
}: {
  w: number;
  h: number;
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <group>
      {[-0.028, 0.028].map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <planeGeometry args={[w, h]} />
          <meshPhysicalMaterial
            color="#cfe2dc"
            transparent
            opacity={0.16}
            roughness={0.04}
            metalness={0.16}
            side={DoubleSide}
            envMapIntensity={1.6}
          />
        </mesh>
      ))}
      {showLabel && label && <Label position={[0, h / 2 + 0.22, 0]}>{label}</Label>}
    </group>
  );
}

function Handle({ position, vertical = true }: { position: [number, number, number]; vertical?: boolean }) {
  return (
    <mesh position={position} rotation={vertical ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
      <capsuleGeometry args={[0.024, 0.2, 4, 12]} />
      <meshStandardMaterial color="#8a8f94" metalness={0.95} roughness={0.22} />
    </mesh>
  );
}

/* ================================================================
   OKNO ROZWIERNE
   ================================================================ */
export function WindowModel({ mode }: { mode: SceneMode }) {
  const root = useRef<Group>(null);
  const sash = useRef<Group>(null);
  const glass = useRef<Group>(null);

  const W = 1.9;
  const H = 2.45;
  const FRAME_T = 0.15;
  const SASH_T = 0.13;
  const sashW = W - 2 * FRAME_T - 0.03;
  const sashH = H - 2 * FRAME_T - 0.03;
  const exploded = mode === "exploded";
  const spread = exploded ? 0.42 : 0;

  const swing = useIntroSwing(root, SWING_FROM, SWING_TO);

  useSceneFrame((delta) => {
    let busy = swing(delta);
    busy = approach(sash.current?.rotation, "y", mode === "open" ? -0.85 : 0, delta) || busy;
    busy = approach(sash.current?.position, "z", exploded ? 0.95 : 0, delta) || busy;
    busy = approach(glass.current?.position, "z", exploded ? 1.7 : 0, delta) || busy;
    return busy;
  });

  return (
    <group ref={root} rotation={[0, SWING_FROM, 0]}>
      <LayeredFrame w={W} h={H} t={FRAME_T} spread={spread} labelOuter="Ościeżnica" labelBreak="Przekładka termiczna" />

      <group position={[-sashW / 2, 0, 0]}>
        <group ref={sash}>
          <group position={[sashW / 2, 0, 0]}>
            <LayeredFrame w={sashW} h={sashH} t={SASH_T} spread={spread * 0.7} labelOuter="Skrzydło" />
            <group ref={glass}>
              <GlassPane
                w={sashW - 2 * SASH_T}
                h={sashH - 2 * SASH_T}
                label="Pakiet szybowy"
                showLabel={exploded}
              />
            </group>
            <Handle position={[sashW / 2 - SASH_T / 2, -0.1, 0.075]} />
          </group>
        </group>
      </group>
    </group>
  );
}

/* ================================================================
   DRZWI ROZWIERNE — panel dolny + przeszklenie górne
   ================================================================ */
export function DoorModel({ mode }: { mode: SceneMode }) {
  const root = useRef<Group>(null);
  const leaf = useRef<Group>(null);
  const glass = useRef<Group>(null);

  const W = 1.25;
  const H = 2.65;
  const FRAME_T = 0.16;
  const LEAF_T = 0.15;
  const leafW = W - 2 * FRAME_T - 0.03;
  const leafH = H - 2 * FRAME_T - 0.03;
  const exploded = mode === "exploded";
  const spread = exploded ? 0.42 : 0;

  const innerW = leafW - 2 * LEAF_T;
  const innerH = leafH - 2 * LEAF_T;
  const panelH = innerH * 0.34;
  const glassH = innerH - panelH - 0.04;

  const swing = useIntroSwing(root, SWING_FROM, SWING_TO);

  useSceneFrame((delta) => {
    let busy = swing(delta);
    busy = approach(leaf.current?.rotation, "y", mode === "open" ? -1.0 : 0, delta) || busy;
    busy = approach(leaf.current?.position, "z", exploded ? 0.95 : 0, delta) || busy;
    busy = approach(glass.current?.position, "z", exploded ? 1.7 : 0, delta) || busy;
    return busy;
  });

  return (
    <group ref={root} rotation={[0, SWING_FROM, 0]} position={[0, -0.1, 0]}>
      <LayeredFrame w={W} h={H} t={FRAME_T} spread={spread} labelOuter="Ościeżnica" labelBreak="Przekładka termiczna" />

      <group position={[-leafW / 2, 0, 0]}>
        <group ref={leaf}>
          <group position={[leafW / 2, 0, 0]}>
            <LayeredFrame w={leafW} h={leafH} t={LEAF_T} spread={spread * 0.7} labelOuter="Skrzydło drzwiowe" />

            {/* panel dolny */}
            <mesh position={[0, -innerH / 2 + panelH / 2, 0]}>
              <boxGeometry args={[innerW, panelH, 0.05]} />
              <meshStandardMaterial color={ALU_DEEP} metalness={0.9} roughness={0.35} />
            </mesh>

            {/* przeszklenie górne */}
            <group ref={glass} position={[0, innerH / 2 - glassH / 2, 0]}>
              <GlassPane w={innerW} h={glassH} label="Przeszklenie" showLabel={exploded} />
            </group>

            <Handle position={[leafW / 2 - LEAF_T / 2, -0.05, 0.08]} />
          </group>
        </group>
      </group>

      {/* próg */}
      <mesh position={[0, -H / 2 - 0.03, 0]}>
        <boxGeometry args={[W, 0.06, 0.2]} />
        <meshStandardMaterial color={ALU_DEEP} metalness={0.9} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ================================================================
   DRZWI PRZESUWNE (HS) — skrzydło stałe + przesuwne na dwóch torach
   ================================================================ */
export function SlidingModel({ mode }: { mode: SceneMode }) {
  const root = useRef<Group>(null);
  const moving = useRef<Group>(null);
  const fixedSash = useRef<Group>(null);

  const W = 3.4;
  const H = 2.6;
  const FRAME_T = 0.14;
  const SASH_T = 0.11;
  const sashW = (W - 2 * FRAME_T) / 2;
  const sashH = H - 2 * FRAME_T - 0.02;
  const exploded = mode === "exploded";
  const spread = exploded ? 0.34 : 0;

  const swing = useIntroSwing(root, SWING_FROM_WIDE, SWING_TO_WIDE);

  useSceneFrame((delta) => {
    const openX = mode === "open" ? -sashW * 0.88 : 0;
    let busy = swing(delta);
    busy = approach(moving.current?.position, "x", sashW / 2 + openX, delta) || busy;
    busy = approach(moving.current?.position, "z", exploded ? -0.75 : -0.1, delta) || busy;
    busy = approach(fixedSash.current?.position, "z", exploded ? 0.75 : 0.1, delta) || busy;
    return busy;
  });

  return (
    <group ref={root} rotation={[0, SWING_FROM_WIDE, 0]} scale={0.85}>
      <LayeredFrame w={W} h={H} t={FRAME_T} spread={spread} labelOuter="Ościeżnica" labelBreak="Przekładka termiczna" />

      {/* skrzydło stałe (lewe) */}
      <group ref={fixedSash} position={[-sashW / 2, 0, 0.1]}>
        <ProfileFrame w={sashW} h={sashH} t={SASH_T} d={0.1} color={ALU} />
        <GlassPane w={sashW - 2 * SASH_T} h={sashH - 2 * SASH_T} label="Skrzydło stałe" showLabel={exploded} />
      </group>

      {/* skrzydło przesuwne (prawe) */}
      <group ref={moving} position={[sashW / 2, 0, -0.1]}>
        <ProfileFrame w={sashW} h={sashH} t={SASH_T} d={0.1} color={ALU_DEEP} />
        <GlassPane w={sashW - 2 * SASH_T} h={sashH - 2 * SASH_T} label="Skrzydło przesuwne" showLabel={exploded} />
        <Handle position={[-sashW / 2 + SASH_T / 2, 0, 0.07]} />
      </group>

      {/* szyna dolna */}
      <mesh position={[0, -H / 2 + 0.02, 0]}>
        <boxGeometry args={[W - 2 * FRAME_T, 0.04, 0.26]} />
        <meshStandardMaterial color={ALU_DEEP} metalness={0.95} roughness={0.25} />
      </mesh>
    </group>
  );
}

/* ================================================================
   FASADA SŁUPOWO-RYGLOWA — siatka słupów i rygli
   ================================================================ */
export function FacadeModel({ mode }: { mode: SceneMode }) {
  const root = useRef<Group>(null);
  const mullions = useRef<Group>(null);
  const transoms = useRef<Group>(null);
  const glazing = useRef<Group>(null);

  const W = 3.6;
  const H = 3.2;
  const T = 0.12;
  const DEPTH = 0.22;
  const cols = 3;
  const rows = 2;
  const exploded = mode === "exploded";

  const colW = W / cols;
  const rowH = H / rows;

  const swing = useIntroSwing(root, SWING_FROM_WIDE, SWING_TO_WIDE);

  useSceneFrame((delta) => {
    let busy = swing(delta);
    busy = approach(mullions.current?.position, "z", exploded ? -0.7 : 0, delta) || busy;
    busy = approach(transoms.current?.position, "z", exploded ? -0.1 : 0, delta) || busy;
    busy = approach(glazing.current?.position, "z", exploded ? 0.9 : DEPTH / 2, delta) || busy;
    return busy;
  });

  const mullionX = Array.from({ length: cols + 1 }, (_, i) => -W / 2 + i * colW);
  const transomY = Array.from({ length: rows + 1 }, (_, i) => -H / 2 + i * rowH);

  return (
    <group ref={root} rotation={[0, SWING_FROM_WIDE, 0]} scale={0.8}>
      {/* słupy */}
      <group ref={mullions}>
        {mullionX.map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[T, H, DEPTH]} />
            <meshStandardMaterial color={ALU} metalness={0.92} roughness={0.3} />
          </mesh>
        ))}
        {exploded && <Label position={[-W / 2 - 0.4, H / 2 - 0.3, 0]}>Słupy</Label>}
      </group>

      {/* rygle */}
      <group ref={transoms}>
        {transomY.map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[W, T, DEPTH * 0.8]} />
            <meshStandardMaterial color={ALU_DEEP} metalness={0.92} roughness={0.32} />
          </mesh>
        ))}
        {exploded && <Label position={[W / 2 + 0.35, 0, 0]}>Rygle</Label>}
      </group>

      {/* przeszklenie pól */}
      <group ref={glazing} position={[0, 0, DEPTH / 2]}>
        {Array.from({ length: cols }).map((_, c) =>
          Array.from({ length: rows }).map((_, r) => (
            <group
              key={`${c}-${r}`}
              position={[-W / 2 + colW * (c + 0.5), -H / 2 + rowH * (r + 0.5), 0]}
            >
              <GlassPane w={colW - T - 0.02} h={rowH - T - 0.02} />
            </group>
          ))
        )}
        {exploded && <Label position={[0, -H / 2 - 0.35, 0]}>Pakiety szybowe</Label>}
      </group>
    </group>
  );
}
