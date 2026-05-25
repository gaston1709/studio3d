"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeDPrinterSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f172a"); // Dark slate background to match clean, professional dark components

    // CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(110, 85, 110);

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true; // For layer printing simulation
    container.appendChild(renderer.domElement);

    // ORBIT CONTROLS (Cinematic mode)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below bed
    controls.enableZoom = false; // Disable zoom to keep it as a clean visual block
    controls.autoRotate = true; // Auto rotate for premium 3D showcase feel
    controls.autoRotateSpeed = 0.6;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Subtle orange directional light
    const orangeLight = new THREE.DirectionalLight(0xff4f00, 0.6);
    orangeLight.position.set(40, 120, 40);
    scene.add(orangeLight);

    // Main studio key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(-50, 100, -50);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // PRINTER STRUCTURE GROUP
    const printerGroup = new THREE.Group();
    scene.add(printerGroup);

    // 1. Build Plate (Base de Impresión)
    const bedWidth = 70;
    const bedLength = 70;
    const bedHeight = 3;
    const bedGeo = new THREE.BoxGeometry(bedWidth, bedHeight, bedLength);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Slate 800
      roughness: 0.7,
      metalness: 0.8,
    });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.y = bedHeight / 2;
    bedMesh.receiveShadow = true;
    printerGroup.add(bedMesh);

    // Subtle dark print sheet surface
    const sheetGeo = new THREE.PlaneGeometry(bedWidth - 4, bedLength - 4);
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Slate 950
      roughness: 0.9,
      metalness: 0.1,
    });
    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    sheetMesh.rotation.x = -Math.PI / 2;
    sheetMesh.position.y = bedHeight + 0.01;
    sheetMesh.receiveShadow = true;
    printerGroup.add(sheetMesh);

    // 2. Minimalist Steel rods/columns
    const pillarGeo = new THREE.CylinderGeometry(1.5, 1.5, 75, 16);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Slate 500
      metalness: 0.9,
      roughness: 0.15,
    });

    const positions = [
      [-bedWidth / 2 - 2, 37.5, -bedLength / 2 - 2],
      [bedWidth / 2 + 2, 37.5, -bedLength / 2 - 2],
      [-bedWidth / 2 - 2, 37.5, bedLength / 2 + 2],
      [bedWidth / 2 + 2, 37.5, bedLength / 2 + 2],
    ];

    positions.forEach((pos) => {
      const pillar = new THREE.Mesh(pillarGeo, metalMat);
      pillar.position.set(pos[0], pos[1], pos[2]);
      printerGroup.add(pillar);
    });

    // Top metal frame
    const topFrameGeoX = new THREE.BoxGeometry(bedWidth + 8, 2, 2);
    const topX1 = new THREE.Mesh(topFrameGeoX, metalMat);
    topX1.position.set(0, 75, -bedLength / 2 - 2);
    printerGroup.add(topX1);
    
    const topX2 = new THREE.Mesh(topFrameGeoX, metalMat);
    topX2.position.set(0, 75, bedLength / 2 + 2);
    printerGroup.add(topX2);

    const topFrameGeoZ = new THREE.BoxGeometry(2, 2, bedLength + 8);
    const topZ1 = new THREE.Mesh(topFrameGeoZ, metalMat);
    topZ1.position.set(-bedWidth / 2 - 2, 75, 0);
    printerGroup.add(topZ1);
    
    const topZ2 = new THREE.Mesh(topFrameGeoZ, metalMat);
    topZ2.position.set(bedWidth / 2 + 2, 75, 0);
    printerGroup.add(topZ2);

    // 3. Extruder Gantry Assembly
    const gantryGroup = new THREE.Group();
    printerGroup.add(gantryGroup);

    // Sleek carbon gantry rail
    const gantryRailGeo = new THREE.BoxGeometry(bedWidth, 2, 4);
    const gantryRailMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Slate 700
      metalness: 0.7,
      roughness: 0.3,
    });
    const gantryRail = new THREE.Mesh(gantryRailGeo, gantryRailMat);
    gantryRail.castShadow = true;
    gantryGroup.add(gantryRail);

    // Sleek minimalist print head
    const extruderGeo = new THREE.BoxGeometry(7, 8, 6);
    const extruderMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // Matte black
      roughness: 0.6,
      metalness: 0.3,
    });
    const extruderMesh = new THREE.Mesh(extruderGeo, extruderMat);
    extruderMesh.castShadow = true;
    gantryGroup.add(extruderMesh);

    // Nozzle
    const nozzleGeo = new THREE.ConeGeometry(1, 2, 8);
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Brass
      metalness: 0.9,
      roughness: 0.1,
    });
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleMesh.position.set(0, -5, 0);
    nozzleMesh.rotation.x = Math.PI;
    extruderMesh.add(nozzleMesh);

    // Molten filament nozzle glow light
    const nozzleLight = new THREE.PointLight(0xff4f00, 1.2, 12);
    nozzleLight.position.set(0, -6, 0);
    extruderMesh.add(nozzleLight);

    // Visual glowing dot
    const nozzleGlowGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const nozzleGlowMat = new THREE.MeshBasicMaterial({ color: 0xff4f00 });
    const nozzleGlowMesh = new THREE.Mesh(nozzleGlowGeo, nozzleGlowMat);
    nozzleGlowMesh.position.set(0, -6, 0);
    extruderMesh.add(nozzleGlowMesh);

    // CLIPPING PLANES FOR MODEL
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10);
    const modelMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4f00, // Premium industrial orange
      roughness: 0.3,
      metalness: 0.2,
      clippingPlanes: [clippingPlane],
      shadowSide: THREE.DoubleSide,
    });

    // 4. PRETTY PRINTED MODEL: A detailed turbine wheel
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Base hub
    const hubGeo = new THREE.CylinderGeometry(8, 12, 18, 32);
    const hub = new THREE.Mesh(hubGeo, modelMaterial);
    hub.castShadow = true;
    hub.receiveShadow = true;
    modelGroup.add(hub);

    // Turbine Blades
    const numBlades = 12;
    for (let i = 0; i < numBlades; i++) {
      const angle = (i / numBlades) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(2, 18, 14);
      
      // Twist geometry to simulate turbine blade angle
      const bladeMesh = new THREE.Mesh(bladeGeo, modelMaterial);
      bladeMesh.position.set(Math.cos(angle) * 11, 0, Math.sin(angle) * 11);
      bladeMesh.rotation.y = -angle + 0.5; // Angled blade
      bladeMesh.rotation.z = 0.2; // Tilted blade
      bladeMesh.castShadow = true;
      bladeMesh.receiveShadow = true;
      modelGroup.add(bladeMesh);
    }

    // Sit model neatly on bed surface
    modelGroup.position.y = 9 + bedHeight;

    // TOOLPATH TRACER (Glowing lines on active layer)
    const maxLinePoints = 60;
    const linePositions = new Float32Array(maxLinePoints * 3);
    const lineColors = new Float32Array(maxLinePoints * 3);
    for (let i = 0; i < maxLinePoints; i++) {
      lineColors[i * 3] = 1.0;
      lineColors[i * 3 + 1] = 0.31;
      lineColors[i * 3 + 2] = 0.0;
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const toolpathLine = new THREE.Line(lineGeo, lineMat);
    scene.add(toolpathLine);

    const linePointsQueue: THREE.Vector3[] = [];

    // SIMULATION VARIABLES
    let currentPrintHeight = bedHeight;
    const modelMaxY = 18 + bedHeight; // height of turbine
    let angleOffset = 0;

    // ANIMATION LOOP
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      controls.update();

      // Slow model rotation to simulate print alignment
      modelGroup.rotation.y += 0.0015;

      // Print head moves in a beautiful rosette pattern
      angleOffset += 0.05;
      
      const currentRadius = 14 + Math.sin(angleOffset * 6) * 3;
      const headX = Math.cos(angleOffset) * currentRadius;
      const headZ = Math.sin(angleOffset) * currentRadius;

      // Position extruder
      gantryGroup.position.y = currentPrintHeight + 6;
      extruderMesh.position.x = headX;
      extruderMesh.position.z = headZ;
      gantryRail.position.z = headZ;

      // Slowly grow print height
      currentPrintHeight += 0.005;
      if (currentPrintHeight > modelMaxY) {
        currentPrintHeight = bedHeight;
        modelGroup.rotation.y = 0;
      }

      clippingPlane.constant = currentPrintHeight;

      // Feed active layer outlines
      const tipPos = new THREE.Vector3(headX, currentPrintHeight, headZ);
      linePointsQueue.push(tipPos);
      if (linePointsQueue.length > maxLinePoints) {
        linePointsQueue.shift();
      }

      const posAttr = toolpathLine.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < maxLinePoints; i++) {
        const pt = linePointsQueue[i] || tipPos;
        posAttr.setXYZ(i, pt.x, pt.y, pt.z);
      }
      posAttr.needsUpdate = true;

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
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-[320px] sm:h-[400px] md:h-[450px] lg:h-[480px] rounded-[2rem] overflow-hidden border-2 border-slate-900 shadow-2xl relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
