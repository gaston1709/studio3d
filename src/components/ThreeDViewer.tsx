"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
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

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let animationFrameId: number;
    const container = containerRef.current;

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fafc"); // Slate 50 to match dashboard backgrounds

    // Create camera
    camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Create controls
    controls = new OrbitControls(camera, renderer.domElement);
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

    // STL loader
    const loader = new STLLoader();

    const loadGeometry = (geometry: THREE.BufferGeometry) => {
      // Create material matching Studio3D brand accent (#FF4F00)
      const material = new THREE.MeshStandardMaterial({
        color: 0xff4f00,
        roughness: 0.4,
        metalness: 0.1,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Center the geometry
      geometry.center();

      // Compute bounding box for dimensions
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (box) {
        const size = new THREE.Vector3();
        box.getSize(size);
        const dims = {
          x: Math.round(size.x * 10) / 10,
          y: Math.round(size.y * 10) / 10,
          z: Math.round(size.z * 10) / 10,
        };
        setDimensions(dims);
        if (onDimensionsComputed) {
          onDimensionsComputed(dims);
        }
      }

      scene.add(mesh);

      // Adjust camera to fit geometry
      geometry.computeBoundingSphere();
      const sphere = geometry.boundingSphere;
      if (sphere) {
        const radius = sphere.radius;
        camera.position.set(radius * 2, radius * 1.5, radius * 2);
        camera.lookAt(mesh.position);
        controls.target.copy(mesh.position);
      }

      setLoading(false);
    };

    // Load file from File object or filePath string
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        try {
          const geometry = loader.parse(buffer);
          loadGeometry(geometry);
        } catch (err) {
          console.error(err);
          setError("No se pudo parsear el archivo STL");
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error leyendo el archivo");
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else if (filePath) {
      loader.load(
        filePath,
        (geometry) => {
          loadGeometry(geometry);
        },
        () => {},
        (err) => {
          console.error(err);
          setError("Error cargando el archivo de impresión 3D");
          setLoading(false);
        }
      );
    } else {
      setError("No se especificó un archivo");
      setLoading(false);
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
  }, [file, filePath]);

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
          <span className="text-3xl mb-4">⚠️</span>
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
