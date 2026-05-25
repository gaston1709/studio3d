"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeDPrinterSimulatorProps {
  onFileLoaded?: (file: File) => void;
}

export default function ThreeDPrinterSimulator({ onFileLoaded }: ThreeDPrinterSimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [speedMode, setSpeedMode] = useState<"silent" | "standard" | "sport" | "ludicrous">("standard");
  const [filamentColor, setFilamentColor] = useState("#FF4F00"); // Brand orange default
  const [isPaused, setIsPaused] = useState(false);
  
  // Telemetry states
  const [progress, setProgress] = useState(0);
  const [nozzleTemp, setNozzleTemp] = useState(0);
  const [bedTemp, setBedTemp] = useState(0);
  const [layerHeight, setLayerHeight] = useState(0);
  const [printTime, setPrintTime] = useState("00:00:00");
  const [activeFileName, setActiveFileName] = useState<string>("Engranaje_Helicoidal.stl");

  // Keep speed multiplier in ref for the animation loop
  const speedMultiplierRef = useRef(1);
  useEffect(() => {
    switch (speedMode) {
      case "silent": speedMultiplierRef.current = 0.5; break;
      case "standard": speedMultiplierRef.current = 1.0; break;
      case "sport": speedMultiplierRef.current = 2.0; break;
      case "ludicrous": speedMultiplierRef.current = 4.0; break;
    }
  }, [speedMode]);

  // Keep colors and pauses in refs
  const filamentColorRef = useRef(filamentColor);
  useEffect(() => {
    filamentColorRef.current = filamentColor;
  }, [filamentColor]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDropRef = useRef<(file: File) => void>(() => {});

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'stl' || extension === 'obj') {
        setActiveFileName(file.name);
        handleDropRef.current(file);
        if (onFileLoaded) {
          onFileLoaded(file);
        }
      } else {
        alert("Por favor cargá un archivo .stl o .obj válido.");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setActiveFileName(file.name);
      handleDropRef.current(file);
      if (onFileLoaded) {
        onFileLoaded(file);
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f172a"); // Dark slate background to match high-end dark dashboard styling

    // CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(120, 110, 120);

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true; // Crucial for layer printing simulation!
    container.appendChild(renderer.domElement);

    // ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below bed
    controls.minDistance = 30;
    controls.maxDistance = 250;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // Industrial orange overhead worklight
    const orangeLight = new THREE.DirectionalLight(0xff4f00, 0.8);
    orangeLight.position.set(50, 150, 50);
    scene.add(orangeLight);

    // White fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    fillLight.position.set(-60, 100, -60);
    fillLight.castShadow = true;
    fillLight.shadow.mapSize.width = 1024;
    fillLight.shadow.mapSize.height = 1024;
    scene.add(fillLight);

    // PRINTER STRUCTURE GROUP
    const printerGroup = new THREE.Group();
    scene.add(printerGroup);

    // 1. Build Plate (Base de Impresión)
    const bedWidth = 80;
    const bedLength = 80;
    const bedHeight = 4;
    const bedGeo = new THREE.BoxGeometry(bedWidth, bedHeight, bedLength);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Slate 800
      roughness: 0.8,
      metalness: 0.7,
    });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.y = bedHeight / 2;
    bedMesh.receiveShadow = true;
    printerGroup.add(bedMesh);

    // Grid helper on top of build plate (representing print bed grids)
    const bedGrid = new THREE.GridHelper(bedWidth, 20, 0xff4f00, 0x475569);
    bedGrid.position.y = bedHeight + 0.01;
    printerGroup.add(bedGrid);

    // 2. Vertical Rods / Frame (Columnas del gantry)
    const pillarGeo = new THREE.BoxGeometry(4, 80, 4);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate 600
      metalness: 0.9,
      roughness: 0.2,
    });

    const pillars: THREE.Mesh[] = [];
    const positions = [
      [-bedWidth / 2 - 2, 40, -bedLength / 2 - 2],
      [bedWidth / 2 + 2, 40, -bedLength / 2 - 2],
      [-bedWidth / 2 - 2, 40, bedLength / 2 + 2],
      [bedWidth / 2 + 2, 40, bedLength / 2 + 2],
    ];

    positions.forEach((pos) => {
      const pillar = new THREE.Mesh(pillarGeo, metalMat);
      pillar.position.set(pos[0], pos[1], pos[2]);
      pillar.castShadow = true;
      printerGroup.add(pillar);
      pillars.push(pillar);
    });

    // Top rails
    const topRailGeoX = new THREE.BoxGeometry(bedWidth + 8, 3, 3);
    const railX1 = new THREE.Mesh(topRailGeoX, metalMat);
    railX1.position.set(0, 80, -bedLength / 2 - 2);
    printerGroup.add(railX1);

    const railX2 = new THREE.Mesh(topRailGeoX, metalMat);
    railX2.position.set(0, 80, bedLength / 2 + 2);
    printerGroup.add(railX2);

    const topRailGeoZ = new THREE.BoxGeometry(3, 3, bedLength + 8);
    const railZ1 = new THREE.Mesh(topRailGeoZ, metalMat);
    railZ1.position.set(-bedWidth / 2 - 2, 80, 0);
    printerGroup.add(railZ1);

    const railZ2 = new THREE.Mesh(topRailGeoZ, metalMat);
    railZ2.position.set(bedWidth / 2 + 2, 80, 0);
    printerGroup.add(railZ2);

    // 3. Printer Gantry & Toolhead (Extrusor)
    const gantryGroup = new THREE.Group();
    printerGroup.add(gantryGroup);

    // Gantry Rail (eje X móvil en Y)
    const gantryRailGeo = new THREE.BoxGeometry(bedWidth, 3, 6);
    const gantryRailMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Slate 700
      metalness: 0.8,
      roughness: 0.4,
    });
    const gantryRail = new THREE.Mesh(gantryRailGeo, gantryRailMat);
    gantryRail.castShadow = true;
    gantryGroup.add(gantryRail);

    // Extruder Body (Cabezal)
    const extruderGeo = new THREE.BoxGeometry(10, 10, 8);
    const extruderMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Slate 900 carbon
      roughness: 0.5,
      metalness: 0.2,
    });
    const extruderMesh = new THREE.Mesh(extruderGeo, extruderMat);
    extruderMesh.castShadow = true;
    gantryGroup.add(extruderMesh);

    // Filament guide tube (aesthetic)
    const tubeGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 8);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.position.y = 11;
    extruderMesh.add(tubeMesh);

    // Nozzle tip (Boquilla)
    const nozzleGeo = new THREE.ConeGeometry(1.5, 3, 8);
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Brass color
      metalness: 0.9,
      roughness: 0.1,
    });
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleMesh.position.set(0, -6.5, 0);
    nozzleMesh.rotation.x = Math.PI;
    extruderMesh.add(nozzleMesh);

    // Glowing spot beneath the nozzle (extrusion point)
    const nozzleLight = new THREE.PointLight(0xff4f00, 1.5, 15);
    nozzleLight.position.set(0, -8, 0);
    extruderMesh.add(nozzleLight);

    // Visual nozzle glow sphere (molten filament indicator)
    const nozzleGlowGeo = new THREE.SphereGeometry(0.6, 8, 8);
    const nozzleGlowMat = new THREE.MeshBasicMaterial({ color: 0xff4f00 });
    const nozzleGlowMesh = new THREE.Mesh(nozzleGlowGeo, nozzleGlowMat);
    nozzleGlowMesh.position.set(0, -8, 0);
    extruderMesh.add(nozzleGlowMesh);

    // CLIPPING PLANES FOR MODEL
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10); // Clips anything above Z height
    const modelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(filamentColorRef.current),
      roughness: 0.35,
      metalness: 0.15,
      clippingPlanes: [clippingPlane],
      clipIntersection: false,
      shadowSide: THREE.DoubleSide,
    });

    // PRINTED MODEL GROUP
    let printedModel: THREE.Object3D | null = null;
    const modelContainer = new THREE.Group();
    scene.add(modelContainer);

    // Helper to generate a default mechanical gear
    const generateDefaultGear = () => {
      const gearGroup = new THREE.Group();

      // Main core
      const coreGeo = new THREE.CylinderGeometry(18, 18, 25, 32);
      const core = new THREE.Mesh(coreGeo, modelMaterial);
      core.castShadow = true;
      core.receiveShadow = true;
      gearGroup.add(core);

      // Shaft hole (subtract effect - represented by dark inner cylinder)
      const shaftGeo = new THREE.CylinderGeometry(6, 6, 25.2, 16);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      gearGroup.add(shaft);

      // Teeth
      const numTeeth = 10;
      for (let i = 0; i < numTeeth; i++) {
        const angle = (i / numTeeth) * Math.PI * 2;
        const toothGeo = new THREE.BoxGeometry(6, 25, 8);
        const tooth = new THREE.Mesh(toothGeo, modelMaterial);
        tooth.position.set(Math.cos(angle) * 19, 0, Math.sin(angle) * 19);
        tooth.rotation.y = -angle;
        tooth.castShadow = true;
        tooth.receiveShadow = true;
        gearGroup.add(tooth);
      }

      // Lift gear to sit on bed
      gearGroup.position.y = 12.5 + bedHeight;
      return gearGroup;
    };

    // Set initial model
    printedModel = generateDefaultGear();
    modelContainer.add(printedModel);

    // TOOLPATH TRACER (Draws glowing orange outlines on the current print layer)
    const maxLinePoints = 120;
    const linePositions = new Float32Array(maxLinePoints * 3);
    const lineColors = new Float32Array(maxLinePoints * 3);

    // Pre-fill colors with glowing orange
    for (let i = 0; i < maxLinePoints; i++) {
      lineColors[i * 3] = 1.0;     // R
      lineColors[i * 3 + 1] = 0.31; // G (#FF4F00 is roughly R:1.0, G:0.31, B:0.0)
      lineColors[i * 3 + 2] = 0.0;  // B
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const toolpathLine = new THREE.Line(lineGeo, lineMat);
    scene.add(toolpathLine);

    const linePointsQueue: THREE.Vector3[] = [];

    // FILE LOADING LOGIC
    const loadSTL = (buffer: ArrayBuffer) => {
      const loader = new STLLoader();
      try {
        const geometry = loader.parse(buffer);
        replaceModelWithGeometry(geometry);
      } catch (e) {
        console.error("Error loading STL", e);
        alert("Error cargando el archivo STL.");
      }
    };

    const loadOBJ = (text: string) => {
      const loader = new OBJLoader();
      try {
        const obj = loader.parse(text);
        
        // Extract geometries
        const geometries: THREE.BufferGeometry[] = [];
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            geometries.push(child.geometry.clone());
          }
        });

        if (geometries.length > 0) {
          // Merge or just take the first one for simplicity
          replaceModelWithGeometry(geometries[0]);
        } else {
          alert("El archivo OBJ no contiene mallas 3D válidas.");
        }
      } catch (e) {
        console.error("Error loading OBJ", e);
        alert("Error cargando el archivo OBJ.");
      }
    };

    const replaceModelWithGeometry = (geometry: THREE.BufferGeometry) => {
      if (printedModel) {
        modelContainer.remove(printedModel);
      }

      // Compute bounding box
      geometry.computeBoundingBox();
      const box = geometry.boundingBox || new THREE.Box3();
      const size = new THREE.Vector3();
      box.getSize(size);

      // Center geometry
      const center = new THREE.Vector3();
      box.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      // Scale to fit our print area (max height 35, max width/length 55)
      const scaleX = 55 / size.x;
      const scaleY = 35 / size.y;
      const scaleZ = 55 / size.z;
      const finalScale = Math.min(scaleX, scaleY, scaleZ, 1.5); // capped scale
      geometry.scale(finalScale, finalScale, finalScale);

      // Compute new height
      geometry.computeBoundingBox();
      const newBox = geometry.boundingBox || new THREE.Box3();
      const newSize = new THREE.Vector3();
      newBox.getSize(newSize);

      const mesh = new THREE.Mesh(geometry, modelMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Position sitting on the build plate
      mesh.position.y = newSize.y / 2 + bedHeight;

      printedModel = mesh;
      modelContainer.add(printedModel);

      // Reset print progress variables
      currentPrintHeight = bedHeight;
      modelMaxY = newSize.y + bedHeight;
      currentProgress = 0;
      elapsedSeconds = 0;
    };

    // Store load handlers in the ref to bridge React event handlers to canvas
    handleDropRef.current = (file: File) => {
      const reader = new FileReader();
      const isOBJ = file.name.toLowerCase().endsWith(".obj");
      
      reader.onload = (e) => {
        if (isOBJ) {
          loadOBJ(e.target?.result as string);
        } else {
          loadSTL(e.target?.result as ArrayBuffer);
        }
      };

      if (isOBJ) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    };

    // SIMULATION ANIMATION VARIABLES
    let currentPrintHeight = bedHeight;
    let modelMaxY = 25 + bedHeight; // Default gear height + bed offset
    let angleOffset = 0;
    let pathRadius = 18;
    let currentProgress = 0;
    let elapsedSeconds = 0;

    // Time ticker for telemetry
    const timerInterval = setInterval(() => {
      if (isPausedRef.current) return;
      
      elapsedSeconds += 1 * speedMultiplierRef.current;
      
      // Calculate formatted time
      const hrs = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
      const secs = Math.floor(elapsedSeconds % 60).toString().padStart(2, '0');
      setPrintTime(`${hrs}:${mins}:${secs}`);

      // Fluctuating telemetry
      const randNozzle = 219 + Math.sin(Date.now() / 1000) * 1.5;
      const randBed = 60 + Math.sin(Date.now() / 2000) * 0.4;
      setNozzleTemp(Math.round(randNozzle));
      setBedTemp(Math.round(randBed));
    }, 1000);

    // ANIMATION LOOP
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // 1. Controls update
      controls.update();

      // 2. Check pauses
      if (!isPausedRef.current) {
        // Material color update
        if (modelMaterial.color.getHexString() !== filamentColorRef.current.replace("#", "").toLowerCase()) {
          modelMaterial.color.set(filamentColorRef.current);
        }

        // Apply rotation to model to simulate print head spiral paths relative to model
        if (printedModel) {
          printedModel.rotation.y += 0.002 * speedMultiplierRef.current;
        }

        // Trace a path for the nozzle head
        angleOffset += 0.08 * speedMultiplierRef.current;
        
        // Draw a flower/gear shape path for the print head
        const gearTeeth = 8;
        const currentRadius = pathRadius + Math.sin(angleOffset * gearTeeth) * 3;
        
        const targetHeadX = Math.cos(angleOffset) * currentRadius;
        const targetHeadZ = Math.sin(angleOffset) * currentRadius;
        
        // Toolhead follows target position
        gantryGroup.position.y = currentPrintHeight + 8; // Gantry sits slightly above current layer
        
        // Toolhead moves on rails
        extruderMesh.position.x = targetHeadX;
        extruderMesh.position.z = targetHeadZ;

        // Gantry bar matches extruder's Z position to hold it
        gantryRail.position.z = targetHeadZ;

        // 3. Update Printed Heights (clipping planes)
        // Climb Y rate: proportional to speed multiplier
        currentPrintHeight += 0.008 * speedMultiplierRef.current;
        
        if (currentPrintHeight > modelMaxY) {
          // Reset print to loop
          currentPrintHeight = bedHeight;
          currentProgress = 0;
          elapsedSeconds = 0;
          if (printedModel) {
            printedModel.rotation.y = 0;
          }
        }

        // Set clipping plane height
        clippingPlane.constant = currentPrintHeight;

        // Calculate progress percentage
        const progressPercentage = Math.min(
          Math.max(((currentPrintHeight - bedHeight) / (modelMaxY - bedHeight)) * 100, 0),
          100
        );
        setProgress(Math.round(progressPercentage));
        setLayerHeight(parseFloat((currentPrintHeight - bedHeight).toFixed(2)));

        // 4. Update dynamic toolpath line (outline on active layer)
        const nozzleTipPos = new THREE.Vector3(targetHeadX, currentPrintHeight, targetHeadZ);
        linePointsQueue.push(nozzleTipPos);
        
        if (linePointsQueue.length > maxLinePoints) {
          linePointsQueue.shift();
        }

        // Write points into Float32Array for WebGL line buffer update
        const positionsAttr = toolpathLine.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < maxLinePoints; i++) {
          const pt = linePointsQueue[i] || nozzleTipPos;
          positionsAttr.setXYZ(i, pt.x, pt.y, pt.z);
        }
        positionsAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE EVENT
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // CLEANUP
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      clearInterval(timerInterval);
      
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full rounded-[2rem] overflow-hidden border-4 border-slate-900 bg-slate-950 shadow-2xl flex flex-col ${
        dragActive ? "border-[#FF4F00] scale-[1.01]" : "border-slate-900"
      } transition-all duration-300`}
    >
      {/* 3D RENDER CANVAS */}
      <div ref={containerRef} className="w-full h-[320px] sm:h-[400px] md:h-[450px]" />

      {/* DRAG OVERLAY */}
      {dragActive && (
        <div className="absolute inset-0 bg-[#FF4F00]/10 backdrop-blur-sm pointer-events-none flex flex-col items-center justify-center border-4 border-dashed border-[#FF4F00] m-4 rounded-[1.5rem] z-20">
          <div className="bg-slate-950 p-6 rounded-full border-2 border-[#FF4F00] shadow-xl mb-4 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FF4F00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="text-white text-md font-black uppercase tracking-[0.2em] bg-slate-950 px-4 py-2 rounded-lg border border-[#FF4F00]/30 shadow-md">
            Soltá tu STL o OBJ acá
          </span>
        </div>
      )}

      {/* DYNAMIC TELEMETRY OVERLAY PANEL */}
      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-[10px] font-mono text-slate-300 pointer-events-none space-y-2 select-none shadow-lg z-10">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-green-500 pulse-led-green'}`} />
          <span className="font-black text-white uppercase tracking-wider">
            {isPaused ? "PAUSADO" : "FABRICANDO EN VIVO"}
          </span>
        </div>
        <div className="space-y-1">
          <div><span className="text-slate-500">ARCHIVO:</span> <span className="text-[#FF4F00] font-black">{activeFileName}</span></div>
          <div><span className="text-slate-500">TEMP BOQUILLA:</span> <span className="text-white">{nozzleTemp}°C</span> / 220°C</div>
          <div><span className="text-slate-500">TEMP CAMA:</span> <span className="text-white">{bedTemp}°C</span> / 60°C</div>
          <div><span className="text-slate-500">ALTURA CAPA:</span> <span className="text-white">{layerHeight} mm</span></div>
          <div><span className="text-slate-500">TIEMPO IMP.:</span> <span className="text-white">{printTime}</span></div>
          <div><span className="text-slate-500">PROGRAMA:</span> <span className="text-white">G-CODE S3D.v1</span></div>
        </div>
      </div>

      {/* REAL-TIME PROGRESS BAR */}
      <div className="h-2 w-full bg-slate-800 relative">
        <div 
          className="h-full bg-[#FF4F00] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute right-3 -top-6 bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-[8px] font-mono text-white tracking-widest font-black uppercase">
          PROG: {progress}%
        </div>
      </div>

      {/* FACTORY CONTROLS (Interactable) */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* DRAG TRIGGER / BUTTON */}
        <div className="md:col-span-4 flex items-center gap-3">
          <label className="flex-grow flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-[#FF4F00] hover:text-white bg-slate-950 text-slate-400 p-3 rounded-xl cursor-pointer text-xs font-black uppercase tracking-wider transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF4F00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Cargar STL/OBJ
            <input type="file" accept=".stl,.obj" className="hidden" onChange={handleFileInput} />
          </label>
        </div>

        {/* SPEED SELECTOR */}
        <div className="md:col-span-5 flex items-center justify-between gap-2 border border-slate-800 bg-slate-950 p-2 rounded-xl">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-2">VELOCIDAD:</span>
          <div className="flex gap-1">
            {(["silent", "standard", "sport", "ludicrous"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSpeedMode(mode)}
                className={`text-[8px] font-black uppercase tracking-wider px-2 py-1.5 rounded-lg border transition-all ${
                  speedMode === mode
                    ? "bg-[#FF4F00] text-white border-[#FF4F00]"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                {mode === "ludicrous" ? "⚡ Ludicrous" : mode}
              </button>
            ))}
          </div>
        </div>

        {/* CONTROLS: PAUSE & COLOR */}
        <div className="md:col-span-3 flex justify-between gap-3">
          {/* Pause Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex-grow p-3 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${
              isPaused
                ? "bg-[#FF4F00] text-white border-[#FF4F00] animate-pulse"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {isPaused ? "REANUDAR" : "PAUSAR"}
          </button>

          {/* Filament Color Picker */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">COLOR:</span>
            <div className="flex gap-1.5">
              {["#FF4F00", "#10b981", "#3b82f6", "#eab308", "#ec4899"].map((color) => (
                <button
                  key={color}
                  onClick={() => setFilamentColor(color)}
                  className={`w-4 h-4 rounded-full border shadow-inner transition-transform hover:scale-125 ${
                    filamentColor === color ? "border-white scale-110" : "border-slate-800"
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Filamento ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
