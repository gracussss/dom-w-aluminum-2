import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import type { ModelType } from "../../catalog";
import { DoorModel, FacadeModel, SlidingModel, WindowModel } from "./models";
import type { SceneMode } from "./models";

export type { SceneMode };

/** Ustawienia kamery dobrane do gabarytu konstrukcji. */
const CAMERA: Record<string, { position: [number, number, number]; min: number; max: number }> = {
  okno: { position: [2.1, 0.5, 4.3], min: 2.6, max: 7 },
  drzwi: { position: [2.0, 0.3, 4.7], min: 2.8, max: 7.5 },
  przesuwne: { position: [2.6, 0.6, 5.8], min: 3.2, max: 9 },
  fasada: { position: [2.9, 0.9, 6.2], min: 3.4, max: 10 },
};

function ParametricModel({ type, mode }: { type: ModelType; mode: SceneMode }) {
  switch (type) {
    case "drzwi":
      return <DoorModel mode={mode} />;
    case "przesuwne":
      return <SlidingModel mode={mode} />;
    case "fasada":
      return <FacadeModel mode={mode} />;
    default:
      return <WindowModel mode={mode} />;
  }
}

/** Model dostarczony przez producenta (.glb / .gltf). */
function RealModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

/**
 * Model nie może zabierać stronie przewijania.
 *
 * OrbitControls przy podłączeniu ustawia `touch-action: none` na płótnie —
 * od tej chwili jeden palec obraca model, a strony pod nim nie da się
 * przewinąć. Na telefonie kadr 4:5 potrafił zablokować użytkownika w miejscu.
 *
 * `pan-y` oddaje przeglądarce ruch pionowy (przewijanie strony), a poziomy
 * zostawia scenie (obrót). Zoom kółkiem jest wyłączony z tego samego powodu:
 * inaczej kółko nad płótnem jednocześnie przybliża model i przewija stronę.
 *
 * Przy okazji opisujemy płótno dla czytnika ekranu — samo `<canvas>` nic
 * nie znaczy.
 */
function CanvasGuard({ label }: { label?: string }) {
  const canvas = useThree((s) => s.gl.domElement);

  useEffect(() => {
    /* Sterowanie płótnem jest z natury imperatywne — OrbitControls i tak
       zapisuje tu swoje `touch-action`, my tylko pilnujemy naszej wartości. */
    // eslint-disable-next-line react/immutability
    canvas.style.touchAction = "pan-y";

    /* Płótno bez opisu jest dla czytnika ekranu pustym prostokątem.
       Ustawiamy je na elemencie, bo `aria-label` podany komponentowi
       `<Canvas>` nie trafia do DOM-u — r3f zjada nieznane propsy. */
    canvas.setAttribute("role", "img");
    if (label) canvas.setAttribute("aria-label", label);
    const observer = new MutationObserver(() => {
      if (canvas.style.touchAction !== "pan-y") canvas.style.touchAction = "pan-y";
    });
    observer.observe(canvas, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [canvas, label]);

  return null;
}

/**
 * Scena renderuje na żądanie, więc po każdej zmianie stanu trzeba poprosić
 * o klatkę — dalsze klatki zamawiają już same modele, dopóki trwa ruch.
 * Druga prośba w rAF zabezpiecza wznowienie po `frameloop="never"`.
 */
function RenderKick({ trigger }: { trigger: string }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    invalidate();
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [invalidate, trigger]);

  return null;
}

interface SystemSceneProps {
  mode: SceneMode;
  modelType: ModelType;
  /** Gdy ustawione — renderujemy prawdziwy model zamiast parametrycznego. */
  modelUrl?: string | null;
  /** Scena jest w polu widzenia — poza nim pętla klatek stoi. */
  active?: boolean;
  /** Opis sceny dla czytnika ekranu — płótno samo w sobie nic nie znaczy. */
  label?: string;
}

export default function SystemScene({ mode, modelType, modelUrl, active = true, label }: SystemSceneProps) {
  const cam = CAMERA[modelType ?? "okno"] ?? CAMERA.okno;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: cam.position, fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      /* „demand” zamiast ciągłej pętli: klatka powstaje tylko wtedy, gdy coś
         się faktycznie rusza (tryb, orbita, tłumienie). Poza ekranem — nic. */
      frameloop={active ? "demand" : "never"}
    >
      <color attach="background" args={["#141618"]} />

      <RenderKick trigger={`${mode}-${active}-${modelType}`} />
      <CanvasGuard label={label} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#9db4c7" />

      {/* Mapa otoczenia budowana w scenie — bez pobierania plików HDR z sieci.

          Cztery równomierne, białawe płaszczyzny dawały odbicie bez struktury:
          każda ściana profilu miała tę samą wartość i konstrukcja wyglądała
          jak odlew z jasnego tworzywa. Metal potrzebuje ZRÓŻNICOWANEGO
          otoczenia — jasne pasmo, ciemniejsza strona przeciwna — bo to jego
          odbicie, a nie własna barwa, niesie wrażenie materiału. */}
      <Environment resolution={256}>
        {/* Wąskie jasne pasmo nad konstrukcją i PRZED nią. Lico profilu jest
            zwrócone do kamery i zachowuje się jak lustro — refleks widać tylko
            wtedy, gdy źródło stoi po tej samej stronie co patrzący. */}
        <Lightformer intensity={4.2} position={[0, 4, 2.4]} scale={[9, 1.1, 1]} color="#ffffff" />
        {/* Wypełnienie z tyłu. Neutralne, nie błękitne: aluminium prawie nie
            ma własnej barwy i przyjmuje kolor otoczenia — przy błękitnym
            wypełnieniu cały profil wychodził na niebiesko lakierowany. */}
        <Lightformer intensity={1.6} position={[0, 3, -6]} scale={[14, 8, 1]} color="#c3c9cd" />
        {/* Klucz z prawej węższy i mocniejszy niż wypełnienie z lewej.
            Różnica między bokami jest tym, co oko czyta jako metal. */}
        <Lightformer intensity={2.8} position={[5, 1, 2]} scale={[2, 9, 1]} color="#ffffff" />
        <Lightformer intensity={1} position={[-5.5, 0, 1]} scale={[4, 9, 1]} color="#8b9095" />
        {/* Duży, miękki panel ZA kamerą. Lico profilu jest zwrócone do
            patrzącego, więc odbija to, co stoi za nim — bez tego źródła
            największa powierzchnia konstrukcji nie miała czego odbić
            i zostawała ciemna niezależnie od reszty rigu. */}
        <Lightformer intensity={1.8} position={[0, 1, 7]} scale={[10, 8, 1]} color="#dfe3e6" />
        {/* Odbicie od posadzki — ciepłe, żeby dolna krawędź nie była martwa. */}
        <Lightformer intensity={0.6} position={[0, -4, 1]} scale={[10, 3, 1]} color="#8a7a63" />
      </Environment>

      <Suspense fallback={null}>
        {modelUrl ? <RealModel url={modelUrl} /> : <ParametricModel type={modelType} mode={mode} />}
      </Suspense>

      <OrbitControls
        enablePan={false}
        /* Kółko myszy zostaje przy stronie — patrz TouchScrollGuard. */
        enableZoom={false}
        minDistance={cam.min}
        maxDistance={cam.max}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.65}
        enableDamping
        dampingFactor={0.06}
      />
    </Canvas>
  );
}
