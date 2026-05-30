"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeDViewerProps {
  file?: File;
  filePath?: string;
  hexColor?: string | null;
  onDimensionsComputed?: (dims: { x: number; y: number; z: number }) => void;
}

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const lines = ["CARGANDO GEOMETRÍA...", "CALCULANDO VOLUMEN...", "ESTIMANDO TIEMPO...", "LISTO."];
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < lines.length) {
        setVisibleLines((prev) => [...prev, lines[current]]);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 300);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--graphite)] z-20 p-8">
      <div className="space-y-3 text-left w-full max-w-xs">
        {visibleLines.map((line, i) => (
          <p
            key={i}
            className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--amber)] animate-[boot-line_150ms_ease-out_both]"
          >
            {line}
          </p>
        ))}
      </div>
      <style>{`
        @keyframes boot-line {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

export default function ThreeDViewer({
  file,
  filePath,
  hexColor,
  onDimensionsComputed,
}: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const [booting, setBooting] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ x: number; y: number; z: number } | null>(null);

  // Trigger boot sequence on file change
  useEffect(() => {
    if (file || filePath) {
      setBooting(true);
      setModelLoaded(false);
      setError(null);
    }
  }, [file, filePath]);

  // Update material color if hexColor changes
  useEffect(() => {
    if (materialRef.current) {
      const colorToSet = hexColor || "var(--amber)";
      // Handle CSS variables or plain hex
      if (colorToSet.startsWith("var(")) {
        // Fallback to amber color
        materialRef.current.color.set(0xff7a1a);
      } else {
        materialRef.current.color.set(colorToSet);
      }
    }
  }, [hexColor]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (booting || (!file && !filePath)) return;

    let animationFrameId: number;
    const container = containerRef.current;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1A1613"); // Match panel-graphite background

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2; // Don't let users look below grid level

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(1, 2, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-1, -2, -1);
    scene.add(dirLight2);

    // Grid Floor - match warm printer theme
    const gridHelper = new THREE.GridHelper(200, 50, 0x2e2822, 0xff7a1a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Initial material color setup
    let initialColor = 0xff7a1a; // var(--amber)
    if (hexColor && !hexColor.startsWith("var(")) {
      initialColor = parseInt(hexColor.replace("#", "0x"), 16);
    }
    const material = new THREE.MeshStandardMaterial({
      color: initialColor,
      roughness: 0.4,
      metalness: 0.1,
    });
    materialRef.current = material;

    const processLoadedObject = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      box.getSize(size);

      const dims = {
        x: Math.round(size.x * 10) / 10,
        y: Math.round(size.y * 10) / 10,
        z: Math.round(size.z * 10) / 10,
      };

      const center = new THREE.Vector3();
      box.getCenter(center);
      object.position.sub(center);

      scene.add(object);

      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      const radius = sphere.radius;
      camera.position.set(radius * 2, radius * 1.5, radius * 2);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      controls.target.set(0, 0, 0);

      setDimensions(dims);
      if (onDimensionsComputed) {
        onDimensionsComputed(dims);
      }
      setModelLoaded(true);
    };

    const loadSTLGeometry = (geometry: THREE.BufferGeometry) => {
      const mesh = new THREE.Mesh(geometry, material);
      processLoadedObject(mesh);
    };

    const loadOBJObject = (group: THREE.Group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });
      processLoadedObject(group);
    };

    const fileName = file?.name || filePath || "";
    const isOBJ = fileName.toLowerCase().endsWith(".obj");

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (isOBJ) {
            const text = e.target?.result as string;
            const objLoader = new OBJLoader();
            const group = objLoader.parse(text);
            loadOBJObject(group);
          } else {
            const buffer = e.target?.result as ArrayBuffer;
            const stlLoader = new STLLoader();
            const geometry = stlLoader.parse(buffer);
            loadSTLGeometry(geometry);
          }
        } catch (err) {
          console.error(err);
          setError(`No se pudo parsear el archivo ${isOBJ ? "OBJ" : "STL"}`);
          setModelLoaded(true); // stop loading screen on error
        }
      };
      reader.onerror = () => {
        setError("Error leyendo el archivo");
        setModelLoaded(true);
      };

      if (isOBJ) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } else if (filePath) {
      if (isOBJ) {
        const objLoader = new OBJLoader();
        objLoader.load(
          filePath,
          (group) => {
            loadOBJObject(group);
          },
          () => {},
          (err) => {
            console.error(err);
            setError("Error cargando el archivo OBJ");
            setModelLoaded(true);
          }
        );
      } else {
        const stlLoader = new STLLoader();
        stlLoader.load(
          filePath,
          (geometry) => {
            loadSTLGeometry(geometry);
          },
          () => {},
          (err) => {
            console.error(err);
            setError("Error cargando el archivo STL");
            setModelLoaded(true);
          }
        );
      }
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [file, filePath, booting]);

  const showLoading = (file || filePath) && (booting || !modelLoaded);

  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[450px] bg-[var(--graphite)] rounded-3xl overflow-hidden border border-[var(--graphite-line)] shadow-inner flex flex-col justify-between">
      {showLoading && (
        <BootSequence onComplete={() => setBooting(false)} />
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--graphite)] z-10 px-6 text-center">
          <span className="text-3xl mb-4">⚠️</span>
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-red-500">{error}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className={`w-full flex-grow h-[300px] sm:h-[450px] transition-opacity duration-300 ${
          showLoading ? "opacity-0" : "opacity-100 layer-press"
        }`}
      />
    </div>
  );
}
