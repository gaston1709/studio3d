"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeDPrinterSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"solid" | "wireframe" | "gcode">("solid");
  const [sliceHeight, setSliceHeight] = useState(100); // 0 to 100 percentage
  const [autoRotate, setAutoRotate] = useState(true);

  // Keep state in refs for the animation loop
  const viewModeRef = useRef(viewMode);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  const sliceHeightRef = useRef(sliceHeight);
  useEffect(() => { sliceHeightRef.current = sliceHeight; }, [sliceHeight]);

  const autoRotateRef = useRef(autoRotate);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#090d16"); // Dark deep CAD environment

    // CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(90, 75, 90);

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true; // For slicer clipping
    container.appendChild(renderer.domElement);

    // ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't look below ground
    controls.minDistance = 35;
    controls.maxDistance = 200;

    // LIGHTING (Studio style)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.6);
    scene.add(ambientLight);

    // Rim light (highlighting edges)
    const rimLight = new THREE.DirectionalLight(0xff4f00, 1.2);
    rimLight.position.set(50, 40, -50);
    scene.add(rimLight);

    // Key light (cool white)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(-50, 80, 50);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill light (subtle blue)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(50, 60, 50);
    scene.add(fillLight);

    // CAD Floor Grid & Coordinate Lines
    const gridHelper = new THREE.GridHelper(80, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Subtle build envelope box
    const boxGeo = new THREE.BoxGeometry(70, 45, 70);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxLineMat = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.4 });
    const boxLines = new THREE.LineSegments(boxEdges, boxLineMat);
    boxLines.position.y = 22.5;
    scene.add(boxLines);

    // Clipping plane for slicer mode
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 20);

    // MATERIALS
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0xff4f00, // Brand Orange
      roughness: 0.35,
      metalness: 0.15,
      clippingPlanes: [clippingPlane],
    });

    const wireframeMat = new THREE.MeshStandardMaterial({
      color: 0xff4f00,
      wireframe: true,
      clippingPlanes: [clippingPlane],
    });

    // HIGH END GEOMETRY: MECHANICAL TURBINE ROTOR
    const rotorGroup = new THREE.Group();
    scene.add(rotorGroup);

    // Part 1: Main rotor base hub
    const hubGeo = new THREE.CylinderGeometry(8, 12, 16, 32);
    const hub = new THREE.Mesh(hubGeo, solidMat);
    hub.castShadow = true;
    hub.receiveShadow = true;
    hub.position.y = 8;
    rotorGroup.add(hub);

    // Part 2: Outer rim
    const rimGeo = new THREE.CylinderGeometry(28, 28, 6, 48, 1, true);
    const rim = new THREE.Mesh(rimGeo, solidMat);
    rim.castShadow = true;
    rim.receiveShadow = true;
    rim.position.y = 8;
    rotorGroup.add(rim);

    // Part 3: Rotor blades (angled & curved look)
    const numBlades = 12;
    for (let i = 0; i < numBlades; i++) {
      const angle = (i / numBlades) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(1.5, 14, 11);
      const blade = new THREE.Mesh(bladeGeo, solidMat);
      
      // Position blade between inner hub and outer rim
      blade.position.set(Math.cos(angle) * 18, 8, Math.sin(angle) * 18);
      blade.rotation.y = -angle + 0.6; // Twist
      blade.rotation.z = 0.15; // Incline
      blade.castShadow = true;
      blade.receiveShadow = true;
      rotorGroup.add(blade);
    }

    // Part 4: Center mounting shaft flange
    const flangeGeo = new THREE.CylinderGeometry(14, 14, 2, 32);
    const flange = new THREE.Mesh(flangeGeo, solidMat);
    flange.position.y = 1;
    flange.castShadow = true;
    flange.receiveShadow = true;
    rotorGroup.add(flange);

    // Part 5: Bolt heads on flange
    const boltGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.2, 8);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bolt = new THREE.Mesh(boltGeo, solidMat);
      bolt.position.set(Math.cos(angle) * 11, 2.1, Math.sin(angle) * 11);
      bolt.rotation.y = angle;
      bolt.castShadow = true;
      rotorGroup.add(bolt);
    }

    // G-CODE / TOOLPATH RECONSTRUCTION (Slicer View)
    // We construct toolpath lines representing the sliced rotor layers
    const toolpathGroup = new THREE.Group();
    scene.add(toolpathGroup);

    const layerHeights: number[] = [];
    const numLayers = 40;
    const maxModelHeight = 16;
    for (let i = 0; i < numLayers; i++) {
      layerHeights.push((i / numLayers) * maxModelHeight + 0.1);
    }

    const gcodeLineMat = new THREE.LineBasicMaterial({
      color: 0xff5f1f, // Bright neon orange
      transparent: true,
      opacity: 0.8,
      linewidth: 1,
    });

    layerHeights.forEach((h) => {
      // Draw outer rim circle
      const rimPoints: THREE.Vector3[] = [];
      const rimRadius = 28;
      for (let j = 0; j <= 60; j++) {
        const theta = (j / 60) * Math.PI * 2;
        rimPoints.push(new THREE.Vector3(Math.cos(theta) * rimRadius, h, Math.sin(theta) * rimRadius));
      }
      const rimLineGeo = new THREE.BufferGeometry().setFromPoints(rimPoints);
      const rimLine = new THREE.Line(rimLineGeo, gcodeLineMat);
      toolpathGroup.add(rimLine);

      // Draw inner hub circle
      const hubPoints: THREE.Vector3[] = [];
      // Hub radius interpolates from 12 at bottom to 8 at top
      const hubRadius = 12 - (h / maxModelHeight) * 4;
      for (let j = 0; j <= 30; j++) {
        const theta = (j / 30) * Math.PI * 2;
        hubPoints.push(new THREE.Vector3(Math.cos(theta) * hubRadius, h, Math.sin(theta) * hubRadius));
      }
      const hubLineGeo = new THREE.BufferGeometry().setFromPoints(hubPoints);
      const hubLine = new THREE.Line(hubLineGeo, gcodeLineMat);
      toolpathGroup.add(hubLine);

      // Draw blade paths (lines connecting hub to rim)
      for (let b = 0; b < numBlades; b++) {
        const angle = (b / numBlades) * Math.PI * 2;
        
        // Linear path representing blade cross section
        const startX = Math.cos(angle) * hubRadius;
        const startZ = Math.sin(angle) * hubRadius;
        const endX = Math.cos(angle + 0.4) * rimRadius;
        const endZ = Math.sin(angle + 0.4) * rimRadius;

        const bladePoints = [
          new THREE.Vector3(startX, h, startZ),
          new THREE.Vector3(endX, h, endZ)
        ];
        const bladeLineGeo = new THREE.BufferGeometry().setFromPoints(bladePoints);
        const bladeLine = new THREE.Line(bladeLineGeo, gcodeLineMat);
        toolpathGroup.add(bladeLine);
      }
    });

    // ANIMATION LOOP
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Apply controls damping
      controls.update();

      // Render mode management
      const currentMode = viewModeRef.current;
      const currentSlice = sliceHeightRef.current; // 0 to 100
      const activeHeight = (currentSlice / 100) * maxModelHeight;

      // Update clipping plane height
      clippingPlane.constant = activeHeight;

      if (currentMode === "gcode") {
        rotorGroup.visible = false;
        toolpathGroup.visible = true;

        // Hide layers above active height in G-code mode
        toolpathGroup.children.forEach((child) => {
          if (child instanceof THREE.Line) {
            const positions = child.geometry.attributes.position;
            if (positions && positions.count > 0) {
              const yVal = positions.getY(0); // Check height of first point
              child.visible = yVal <= activeHeight;
            }
          }
        });
      } else {
        rotorGroup.visible = true;
        toolpathGroup.visible = false;

        // Swap material based on mode
        rotorGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = currentMode === "wireframe" ? wireframeMat : solidMat;
          }
        });
      }

      // Auto rotation
      if (autoRotateRef.current) {
        rotorGroup.rotation.y += 0.003;
        toolpathGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE EVENT
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // CLEANUP
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col bg-[#0b0f19] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      
      {/* 3D VIEWPORT CANVAS */}
      <div ref={containerRef} className="w-full h-[320px] sm:h-[380px] md:h-[420px]" />

      {/* CAD METRICS HUD OVERLAY */}
      <div className="absolute top-4 left-4 bg-[#090d16]/90 border border-slate-800 rounded-2xl p-4 text-[9px] font-mono text-slate-400 pointer-events-none select-none shadow-md z-10 space-y-1.5">
        <div className="font-black text-[#FF4F00] uppercase tracking-widest border-b border-slate-800 pb-1.5 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F00]" />
          CAD INSPECTOR v1.0
        </div>
        <div><span className="text-slate-600">ARCHIVO:</span> rotor_industrial.stl</div>
        <div><span className="text-slate-600">VOLUMEN:</span> 58.4 cm³</div>
        <div><span className="text-slate-600">PESO EST.:</span> 72.4 g</div>
        <div><span className="text-slate-600">DIM.:</span> 95 x 95 x 35 mm</div>
        <div><span className="text-slate-600">POLÍG.:</span> 14,240 Triángulos</div>
        <div><span className="text-slate-600">ANÁLISIS:</span> MALLA MANIFOLD OK</div>
      </div>

      {/* TOP RIGHT VIEW CONTROLS */}
      <button 
        onClick={() => setAutoRotate(!autoRotate)}
        className={`absolute top-4 right-4 text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border transition-all z-10 ${
          autoRotate 
            ? "bg-[#FF4F00] text-white border-[#FF4F00]" 
            : "bg-[#090d16] text-slate-400 border-slate-800 hover:text-white"
        }`}
      >
        {autoRotate ? "↻ AUTO-ROTR" : "⏸ ESTÁTICO"}
      </button>

      {/* INTERACTIVE CAD VIEWBAR */}
      <div className="bg-[#090d16] border-t border-slate-850 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        
        {/* VIEW SELECTOR */}
        <div className="flex bg-[#0b0f19] border border-slate-800 p-1 rounded-xl">
          {(["solid", "wireframe", "gcode"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`text-[9px] font-mono font-black uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all ${
                viewMode === mode
                  ? "bg-[#FF4F00] text-white"
                  : "text-slate-400 hover:text-white bg-transparent"
              }`}
            >
              {mode === "solid" ? "Sólido" : mode === "wireframe" ? "Malla 3D" : "G-Code"}
            </button>
          ))}
        </div>

        {/* SLICER SLIDER (Interactive toolpath layers) */}
        <div className="flex-grow max-w-xs md:max-w-md flex items-center gap-3">
          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">
            CORTAR CAPAS:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliceHeight}
            onChange={(e) => setSliceHeight(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF4F00]"
          />
          <span className="text-[9px] font-mono text-[#FF4F00] font-black w-8 text-right">
            {sliceHeight}%
          </span>
        </div>
      </div>
    </div>
  );
}
