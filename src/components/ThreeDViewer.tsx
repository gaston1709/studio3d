"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeDViewerProps {
  file?: File;
  filePath?: string;
  onDimensionsComputed?: (dims: { x: number; y: number; z: number }) => void;
}

export default function ThreeDViewer({ file, filePath, onDimensionsComputed }: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let animationFrameId: number;
    const container = containerRef.current;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fafc"); // Slate 50 to match dashboard backgrounds

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

    // Add grid floor
    const gridHelper = new THREE.GridHelper(200, 50, 0xcbd5e1, 0xf1f5f9);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Material matching Studio3D brand accent (#FF4F00)
    const material = new THREE.MeshStandardMaterial({
      color: 0xff4f00,
      roughness: 0.4,
      metalness: 0.1,
    });

    const processLoadedObject = (object: THREE.Object3D) => {
      // Compute bounding box for dimensions
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      const dims = {
        x: Math.round(size.x * 10) / 10,
        y: Math.round(size.y * 10) / 10,
        z: Math.round(size.z * 10) / 10,
      };

      // Center the object
      const center = new THREE.Vector3();
      box.getCenter(center);
      object.position.sub(center);

      scene.add(object);

      // Adjust camera to fit
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      const radius = sphere.radius;
      camera.position.set(radius * 2, radius * 1.5, radius * 2);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      controls.target.set(0, 0, 0);

      setTimeout(() => {
        setDimensions(dims);
        if (onDimensionsComputed) {
          onDimensionsComputed(dims);
        }
        setLoading(false);
      }, 0);
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

    // Load file from File object or filePath string
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
          setTimeout(() => {
            setError(`No se pudo parsear el archivo ${isOBJ ? 'OBJ' : 'STL'}`);
            setLoading(false);
          }, 0);
        }
      };
      reader.onerror = () => {
        setTimeout(() => {
          setError("Error leyendo el archivo");
          setLoading(false);
        }, 0);
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
            setTimeout(() => {
              setError("Error cargando el archivo OBJ");
              setLoading(false);
            }, 0);
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
            setTimeout(() => {
              setError("Error cargando el archivo STL");
              setLoading(false);
            }, 0);
          }
        );
      }
    } else {
      setTimeout(() => {
        setError("No se especificó un archivo");
        setLoading(false);
      }, 0);
    }

    // Animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      
      // Clean up WebGL resources
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [file, filePath, onDimensionsComputed]);

  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[450px] bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-900/5 shadow-inner flex flex-col justify-between">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Analizando malla 3D...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 px-6 text-center">
          <svg className="w-10 h-10 text-red-500 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">{error}</p>
        </div>
      )}

      <div ref={containerRef} className="w-full flex-grow h-[300px] sm:h-[450px]" />

      {dimensions && !loading && !error && (
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 border-t-2 border-slate-900/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500 z-10">
          <span>Dimensiones calculadas:</span>
          <div className="flex gap-4 text-slate-900">
            <div>X: <span className="text-[#FF4F00]">{dimensions.x}</span> mm</div>
            <div>Y: <span className="text-[#FF4F00]">{dimensions.y}</span> mm</div>
            <div>Z: <span className="text-[#FF4F00]">{dimensions.z}</span> mm</div>
          </div>
        </div>
      )}
    </div>
  );
}
