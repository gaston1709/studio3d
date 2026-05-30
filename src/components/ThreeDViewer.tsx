"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface ViewerFile {
  id: string;
  file?: File;
  filePath?: string;
  hexColor?: string | null;
}

interface ThreeDViewerProps {
  files?: ViewerFile[];
  activeFileId?: string | null;
  // Compatibility fallback
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
  files,
  activeFileId,
  file,
  filePath,
  hexColor,
  onDimensionsComputed,
}: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrappersRef = useRef<Map<string, THREE.Group>>(new Map());
  const [booting, setBooting] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unify single and multi-file rendering inputs
  const filesToLoad = useMemo(() => {
    const list: ViewerFile[] = [];
    if (files && files.length > 0) {
      list.push(...files);
    } else if (file) {
      list.push({ id: "single", file, hexColor });
    } else if (filePath) {
      list.push({ id: "single", filePath, hexColor });
    }
    return list;
  }, [files, file, filePath, hexColor]);

  // Compute cache-busting key/hash for loaded files
  const filesHash = useMemo(() => {
    return filesToLoad
      .map((f) => `${f.id}-${f.file?.name || ""}-${f.file?.size || 0}-${f.filePath || ""}-${f.hexColor || ""}`)
      .join("|");
  }, [filesToLoad]);

  // Trigger boot sequence on file change
  useEffect(() => {
    if (filesHash) {
      setBooting(true);
      setModelLoaded(false);
      setError(null);
    }
  }, [filesHash]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (booting || filesToLoad.length === 0) return;

    let animationFrameId: number;
    const container = containerRef.current;

    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // Create renderer with alpha support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    // Add studio lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(100, 200, 100);
    scene.add(dirLight1);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(-100, 200, -100);
    scene.add(rimLight);

    const headlight = new THREE.PointLight(0xffffff, 0.5, 0);
    camera.add(headlight);
    scene.add(camera);

    // 320mm Bed grid helper
    const gridHelper = new THREE.GridHelper(320, 32, 0x2e2822, 0xff7a1a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Promise-based file loader
    const loadFileGeometry = (vf: ViewerFile): Promise<THREE.Object3D> => {
      return new Promise((resolve, reject) => {
        const name = vf.file?.name || vf.filePath || "";
        const isOBJ = name.toLowerCase().endsWith(".obj");
        const is3MF = name.toLowerCase().endsWith(".3mf");

        let initialColor = 0xff7a1a;
        if (vf.hexColor && !vf.hexColor.startsWith("var(")) {
          initialColor = parseInt(vf.hexColor.replace("#", "0x"), 16);
        }
        const material = new THREE.MeshStandardMaterial({
          color: initialColor,
          roughness: 0.3,
          metalness: 0.2,
          side: THREE.DoubleSide,
        });

        const setupObject = (object: THREE.Object3D) => {
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = material;
            }
          });
          resolve(object);
        };

        const setupGeometry = (geometry: THREE.BufferGeometry) => {
          geometry.computeVertexNormals();
          const mesh = new THREE.Mesh(geometry, material);
          resolve(mesh);
        };

        if (vf.file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              if (isOBJ) {
                const text = e.target?.result as string;
                const objLoader = new OBJLoader();
                const group = objLoader.parse(text);
                setupObject(group);
              } else if (is3MF) {
                const buffer = e.target?.result as ArrayBuffer;
                const loader3mf = new ThreeMFLoader();
                const group = loader3mf.parse(buffer);
                setupObject(group);
              } else {
                const buffer = e.target?.result as ArrayBuffer;
                const stlLoader = new STLLoader();
                const geometry = stlLoader.parse(buffer);
                setupGeometry(geometry);
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error("Error leyendo archivo"));
          if (isOBJ) {
            reader.readAsText(vf.file);
          } else {
            reader.readAsArrayBuffer(vf.file);
          }
        } else if (vf.filePath) {
          if (isOBJ) {
            const objLoader = new OBJLoader();
            objLoader.load(vf.filePath, setupObject, undefined, reject);
          } else if (is3MF) {
            const loader3mf = new ThreeMFLoader();
            loader3mf.load(vf.filePath, setupObject, undefined, reject);
          } else {
            const stlLoader = new STLLoader();
            stlLoader.load(vf.filePath, setupGeometry, undefined, reject);
          }
        } else {
          reject(new Error("Falta archivo o filePath"));
        }
      });
    };

    // Load all files
    Promise.all(
      filesToLoad.map(async (vf) => {
        try {
          const obj = await loadFileGeometry(vf);
          return { vf, obj };
        } catch (err) {
          console.error("Error loading model: ", vf.file?.name || vf.filePath, err);
          return null;
        }
      })
    )
      .then((results) => {
        const validResults = results.filter(
          (r): r is { vf: ViewerFile; obj: THREE.Object3D } => r !== null
        );

        if (validResults.length === 0) {
          setError("No se pudo cargar ninguna de las piezas.");
          setModelLoaded(true);
          return;
        }

        const sceneGroup = new THREE.Group();
        wrappersRef.current.clear();

        // Wrap meshes and compute sizes
        const items = validResults.map(({ vf, obj }) => {
          const box = new THREE.Box3().setFromObject(obj);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);

          // Center the object inside its own container, rest bottom at Y=0
          obj.position.copy(center).negate();
          obj.position.y += size.y / 2;

          const wrapper = new THREE.Group();
          wrapper.add(obj);

          // Compute individual dimensions for callback
          const dims = {
            x: Math.round(size.x * 10) / 10,
            y: Math.round(size.y * 10) / 10,
            z: Math.round(size.z * 10) / 10,
          };

          if (onDimensionsComputed && validResults.length === 1) {
            onDimensionsComputed(dims);
          }

          wrappersRef.current.set(vf.id, wrapper);
          return { vf, wrapper, size };
        });

        // Arrange wrappers side-by-side along the X-axis
        const gap = 20; // 20mm gap between models
        const totalWidth =
          items.reduce((sum, item) => sum + item.size.x, 0) + gap * (items.length - 1);

        let currentX = -totalWidth / 2;
        items.forEach((item) => {
          item.wrapper.position.x = currentX + item.size.x / 2;
          item.wrapper.position.y = 0;
          item.wrapper.position.z = 0;
          sceneGroup.add(item.wrapper);
          currentX += item.size.x + gap;
        });

        scene.add(sceneGroup);

        // Frame the camera to view the entire layout
        const groupBounds = new THREE.Box3().setFromObject(sceneGroup);
        const groupCenter = new THREE.Vector3();
        groupBounds.getCenter(groupCenter);
        const groupSphere = new THREE.Sphere();
        groupBounds.getBoundingSphere(groupSphere);
        const radius = Math.max(groupSphere.radius, 40);

        camera.position.set(radius * 2, radius * 1.5, radius * 2);
        camera.lookAt(groupCenter);
        controls.target.copy(groupCenter);

        setModelLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setError("Error cargando los modelos 3D");
        setModelLoaded(true);
      });

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
  }, [filesHash, booting]);

  // Handle live updates to the highlighted/inspected file wrapper (adds BoxHelper)
  useEffect(() => {
    if (!modelLoaded) return;

    wrappersRef.current.forEach((wrapper) => {
      const helpers = wrapper.children.filter((c) => c instanceof THREE.BoxHelper);
      helpers.forEach((h) => wrapper.remove(h));
    });

    if (activeFileId) {
      const activeWrapper = wrappersRef.current.get(activeFileId);
      if (activeWrapper) {
        let firstMesh: THREE.Object3D | null = null;
        activeWrapper.traverse((child) => {
          if (child instanceof THREE.Mesh && !firstMesh) {
            firstMesh = child;
          }
        });
        if (firstMesh) {
          const boxHelper = new THREE.BoxHelper(firstMesh, 0xff7a1a);
          activeWrapper.add(boxHelper);
        }
      }
    }
  }, [activeFileId, modelLoaded]);

  const showLoading = filesToLoad.length > 0 && (booting || !modelLoaded);

  return (
    <div
      className="relative w-full h-full min-h-[300px] sm:min-h-[450px] rounded-3xl overflow-hidden border border-[var(--graphite-line)] shadow-inner flex flex-col justify-between"
      style={{
        background: "radial-gradient(circle at center, #2E2822 0%, #1A1613 100%)",
      }}
    >
      {showLoading && <BootSequence onComplete={() => setBooting(false)} />}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--graphite)] z-10 px-6 text-center">
          <span className="text-3xl mb-4">⚠️</span>
          <p className="mono text-[10px] uppercase tracking-[0.28em] text-red-500">{error}</p>
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

