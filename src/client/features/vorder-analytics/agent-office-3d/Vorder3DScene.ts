import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface Agent3DData {
  id: number;
  name: string;
  nameEn: string;
  role: string;
  avatarUrl: string;
  position: [number, number, number]; // [x, y, z]
  stationName: string;
  cadencePercent: number; // 0 - 100
  cadenceTask: string;
  state: 'WORKING' | 'CHILLING' | 'WALKING' | 'ALERT';
}

export interface Station3DConfig {
  id: string;
  name: string;
  nameAr: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  cameraPos: [number, number, number];
  color: number;
}

export const VORDER_STATIONS_CONFIG: Record<string, Station3DConfig> = {
  desks: {
    id: 'desks',
    name: 'Tactical Holographic War Table',
    nameAr: 'طاولة العمليات التكتيكية المركزية',
    position: [0, 2, 0],
    lookAt: [0, 2, 0],
    cameraPos: [0, 16, 18],
    color: 0x00f0ff,
  },
  server: {
    id: 'server',
    name: 'Cloud Server Cube',
    nameAr: 'محطة الخوادم وقواعد البيانات السحابية',
    position: [-16, 2, -10],
    lookAt: [-16, 2, -10],
    cameraPos: [-6, 12, 0],
    color: 0x00ffff,
  },
  coffee: {
    id: 'coffee',
    name: 'Coffee & Code Bar',
    nameAr: 'محطة القهوة والإعلانات التكتيكية',
    position: [-16, 2, 10],
    lookAt: [-16, 2, 10],
    cameraPos: [-6, 10, 18],
    color: 0xffaa00,
  },
  smoke: {
    id: 'smoke',
    name: 'Sunset Smoke Terrace',
    nameAr: 'شرفة التدخين والاستراحة والتدقيق',
    position: [16, 2, 8],
    lookAt: [16, 2, 8],
    cameraPos: [6, 10, 18],
    color: 0xff4422,
  },
};

export class Vorder3DScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Subsystems & Interactive Meshes
  private agentMeshes: Map<number, THREE.Group> = new Map();
  private smokeParticles!: THREE.Points;
  private smokePositions: Float32Array = new Float32Array(0);
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();

  // Animated Hologram Elements
  private hologramScanRings: THREE.Mesh[] = [];

  // Camera animation
  private targetCameraPos: THREE.Vector3 | null = null;
  private targetLookAt: THREE.Vector3 | null = null;

  // Callbacks
  public onAgentClick?: (agentId: number) => void;
  public onAgentHover?: (agentId: number | null) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // 1. Scene setup with deep cinematic twilight atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c14);
    this.scene.fog = new THREE.FogExp2(0x0a0c14, 0.012);

    // 2. Camera setup - Isometric Perspective View
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 300);
    this.camera.position.set(16, 22, 26);

    // 3. WebGL Renderer with High Precision & Shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls with Damping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.15; // Prevent flipping below ground
    this.controls.minDistance = 8;
    this.controls.maxDistance = 75;
    this.controls.target.set(0, 2, 0);

    // 5. Lighting
    this.setupLighting();

    // 6. Architecture & Ground (Authentic Office Environment)
    this.setupEnvironment();

    // 7. Tactical Command Station & Perimeter Stations
    this.setupStations();

    // 8. Smoke Terrace Particle Physics
    this.setupSmokePhysics();

    // 9. Trajectory Spline Connections
    this.setupTrajectoryPaths();

    // Event Listeners
    window.addEventListener('resize', this.onResize);
    this.container.addEventListener('pointerdown', this.onPointerDown);
    this.container.addEventListener('pointermove', this.onPointerMove);

    // Start render loop
    this.animate();
  }

  private setupLighting() {
    // Ambient light - warm executive twilight
    const ambient = new THREE.AmbientLight(0xdde5ff, 0.9);
    this.scene.add(ambient);

    // Main Directional Light (Warm sunset sun glancing across the floor)
    const sunLight = new THREE.DirectionalLight(0xff9955, 2.2);
    sunLight.position.set(35, 45, -15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Cyan Neon Table Glow
    const tableLight = new THREE.PointLight(0x00f0ff, 3.8, 28);
    tableLight.position.set(0, 4.5, 0);
    this.scene.add(tableLight);

    // Cyan Neon Server Light
    const serverLight = new THREE.PointLight(0x00ffff, 3.2, 22);
    serverLight.position.set(-16, 5, -10);
    this.scene.add(serverLight);

    // Amber Coffee Bar Light
    const coffeeLight = new THREE.PointLight(0xffaa22, 2.8, 20);
    coffeeLight.position.set(-16, 5, 10);
    this.scene.add(coffeeLight);

    // Fire Red / Orange Smoke Terrace Light
    const smokeLight = new THREE.PointLight(0xff4411, 3.5, 22);
    smokeLight.position.set(16, 5, 8);
    this.scene.add(smokeLight);
  }

  private setupEnvironment() {
    const textureLoader = new THREE.TextureLoader();

    // 1. Executive Parquet & Brushed Metal Flooring
    const floorGeo = new THREE.BoxGeometry(46, 0.8, 42);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141622,
      roughness: 0.35,
      metalness: 0.25,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.4, 0);
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Elegant Grid Accent Lines on Floor
    const grid = new THREE.GridHelper(44, 22, 0x00f0ff, 0x1f2438);
    grid.position.y = 0.02;
    this.scene.add(grid);

    // 2. Smoke Terrace Raised Teak Deck
    const terraceGeo = new THREE.BoxGeometry(16, 1.2, 18);
    const terraceMat = new THREE.MeshStandardMaterial({
      color: 0x3d2218, // Rich teak wood tone
      roughness: 0.55,
      metalness: 0.1,
    });
    const terraceMesh = new THREE.Mesh(terraceGeo, terraceMat);
    terraceMesh.position.set(16, -0.2, 8);
    terraceMesh.receiveShadow = true;
    this.scene.add(terraceMesh);

    // Brass edge divider between parquet and terrace
    const dividerGeo = new THREE.BoxGeometry(0.4, 0.3, 18);
    const dividerMat = new THREE.MeshStandardMaterial({ color: 0xffaa33, metalness: 0.85, roughness: 0.2 });
    const dividerMesh = new THREE.Mesh(dividerGeo, dividerMat);
    dividerMesh.position.set(7.8, 0.15, 8);
    this.scene.add(dividerMesh);

    // Glass railing for the terrace edge
    const railingGeo = new THREE.BoxGeometry(0.1, 2.6, 17.6);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.35,
      transmission: 0.9,
      roughness: 0.1,
      metalness: 0.1,
    });
    const railingMesh = new THREE.Mesh(railingGeo, glassMat);
    railingMesh.position.set(23.9, 1.3, 8);
    this.scene.add(railingMesh);

    // 3. Cyberpunk Sunset Skyline Backdrop behind the terrace
    const skylineTexture = textureLoader.load('/game-assets/vorder_skyline_sunset_backdrop.jpg');
    const skylineGeo = new THREE.PlaneGeometry(65, 36);
    const skylineMat = new THREE.MeshBasicMaterial({
      map: skylineTexture,
      side: THREE.DoubleSide,
    });
    const skylineMesh = new THREE.Mesh(skylineGeo, skylineMat);
    skylineMesh.position.set(25, 14, 8);
    skylineMesh.rotation.y = -Math.PI / 2;
    this.scene.add(skylineMesh);

    // 4. Luxury Dark Wood Panel Wall behind Upper HQ (North Wall)
    const wallGeo = new THREE.BoxGeometry(46, 16, 0.8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x161822,
      roughness: 0.65,
      metalness: 0.2,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 8, -21);
    this.scene.add(wallMesh);

    // 5. Glowing VORDER SEO Neon Emblem on the Wall
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 512;
    logoCanvas.height = 160;
    const lCtx = logoCanvas.getContext('2d');
    if (lCtx) {
      lCtx.fillStyle = 'rgba(15, 18, 28, 0.92)';
      lCtx.beginPath();
      lCtx.roundRect(10, 10, 492, 140, 24);
      lCtx.fill();
      lCtx.strokeStyle = '#00f0ff';
      lCtx.lineWidth = 4;
      lCtx.stroke();

      lCtx.fillStyle = '#ff0055';
      lCtx.font = 'bold 50px monospace';
      lCtx.textAlign = 'center';
      lCtx.fillText('// VORDER SEO //', 256, 75);

      lCtx.fillStyle = '#00f0ff';
      lCtx.font = 'bold 22px sans-serif';
      lCtx.fillText('AUTONOMOUS AI SUITE • مقر العمليات', 256, 120);
    }
    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const logoGeo = new THREE.PlaneGeometry(12, 3.8);
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, 10, -20.5);
    this.scene.add(logoMesh);
  }

  private setupStations() {
    // ========================================================
    // A. THE MASTER HOLOGRAPHIC TACTICAL COMMAND STATION
    // ========================================================
    const warTableGroup = new THREE.Group();
    warTableGroup.position.set(0, 0, 0);

    // 1. Raised Octagonal Titanium Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(6.8, 7.5, 0.6, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f111a,
      roughness: 0.25,
      metalness: 0.7,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.3;
    pedestal.receiveShadow = true;
    warTableGroup.add(pedestal);

    // 2. Beveled Glowing Cyan Base Ring
    const baseGlowRingGeo = new THREE.RingGeometry(6.9, 7.3, 32);
    const baseGlowRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const baseGlowRing = new THREE.Mesh(baseGlowRingGeo, baseGlowRingMat);
    baseGlowRing.rotation.x = -Math.PI / 2;
    baseGlowRing.position.y = 0.61;
    warTableGroup.add(baseGlowRing);

    // 3. Central Tactical Hologram Surface (Procedural High-Tech Cyber Radar)
    // NEVER paste a flat drawing of people on the table surface!
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Obsidian cyber glass base
    ctx.fillStyle = '#060a16';
    ctx.fillRect(0, 0, 1024, 1024);

    // Cyan circular cyber radar grids
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    for (let r = 80; r <= 480; r += 80) {
      ctx.beginPath();
      ctx.arc(512, 512, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Polar radial crosshairs
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(512 + Math.cos(a) * 80, 512 + Math.sin(a) * 80);
      ctx.lineTo(512 + Math.cos(a) * 480, 512 + Math.sin(a) * 480);
      ctx.stroke();
    }

    // Center VORDER emblem & Live Telemetry
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◈ VORDER TACTICAL COMMAND ◈', 512, 470);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('23 ظهور معتمد • 742 مقال منشور • $0.00 تكلفة', 512, 520);

    ctx.fillStyle = '#22c55e';
    ctx.font = '22px monospace';
    ctx.fillText('60 FPS ENGINE • D1 EDGE CLOUD • 9 AGENTS ACTIVE', 512, 565);

    const tacticalTexture = new THREE.CanvasTexture(canvas);

    const tableTopGeo = new THREE.CylinderGeometry(5.8, 5.8, 0.4, 32);
    const tableTopMat = new THREE.MeshStandardMaterial({
      map: tacticalTexture,
      roughness: 0.25,
      metalness: 0.6,
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.y = 0.8;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    warTableGroup.add(tableTop);

    // 4. Rotating Concentric Holographic Cyber Scan Rings
    const scanRing1Geo = new THREE.RingGeometry(5.9, 6.2, 48);
    const scanRing1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const scanRing1 = new THREE.Mesh(scanRing1Geo, scanRing1Mat);
    scanRing1.rotation.x = -Math.PI / 2;
    scanRing1.position.y = 1.05;
    warTableGroup.add(scanRing1);
    this.hologramScanRings.push(scanRing1);

    const scanRing2Geo = new THREE.RingGeometry(4.0, 4.2, 32);
    const scanRing2Mat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const scanRing2 = new THREE.Mesh(scanRing2Geo, scanRing2Mat);
    scanRing2.rotation.x = -Math.PI / 2;
    scanRing2.position.y = 1.08;
    warTableGroup.add(scanRing2);
    this.hologramScanRings.push(scanRing2);

    // 5. Curved Workstation Desks around the Command Center
    const deskGeo = new THREE.BoxGeometry(4.2, 1.4, 1.8);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1a1e2e, roughness: 0.4 });
    const monitorGeo = new THREE.BoxGeometry(2.4, 1.2, 0.08);
    const monitorMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

    // West Workstation
    const westDesk = new THREE.Mesh(deskGeo, deskMat);
    westDesk.position.set(-6.5, 0.7, 0);
    westDesk.rotation.y = Math.PI / 2;
    warTableGroup.add(westDesk);
    const westMonitor = new THREE.Mesh(monitorGeo, monitorMat);
    westMonitor.position.set(-6.5, 1.8, 0);
    westMonitor.rotation.y = Math.PI / 2;
    warTableGroup.add(westMonitor);

    // East Workstation
    const eastDesk = new THREE.Mesh(deskGeo, deskMat);
    eastDesk.position.set(6.5, 0.7, 0);
    eastDesk.rotation.y = -Math.PI / 2;
    warTableGroup.add(eastDesk);
    const eastMonitor = new THREE.Mesh(monitorGeo, monitorMat);
    eastMonitor.position.set(6.5, 1.8, 0);
    eastMonitor.rotation.y = -Math.PI / 2;
    warTableGroup.add(eastMonitor);

    this.scene.add(warTableGroup);

    // ========================================================
    // B. CLOUD SERVER CUBE STATION (-16, 0, -10)
    // ========================================================
    const serverGroup = new THREE.Group();
    serverGroup.position.set(-16, 0, -10);

    const cubeGeo = new THREE.BoxGeometry(7, 6, 7);
    const cubeGlass = new THREE.MeshPhysicalMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.28,
      roughness: 0.15,
      metalness: 0.1,
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeGlass);
    cubeMesh.position.y = 3;
    serverGroup.add(cubeMesh);

    for (let i = -2; i <= 2; i += 2) {
      const rackGeo = new THREE.BoxGeometry(1.4, 5, 5);
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.8 });
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(i, 2.5, 0);
      serverGroup.add(rack);

      const ledGeo = new THREE.BoxGeometry(0.1, 4.6, 0.1);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(i + 0.71, 2.5, 2.2);
      serverGroup.add(led);
    }

    const serverRingGeo = new THREE.RingGeometry(4.2, 4.6, 32);
    const serverRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    const serverRing = new THREE.Mesh(serverRingGeo, serverRingMat);
    serverRing.rotation.x = -Math.PI / 2;
    serverRing.position.y = 0.03;
    serverGroup.add(serverRing);

    this.scene.add(serverGroup);

    // ========================================================
    // C. COFFEE & CODE BAR STATION (-16, 0, 10)
    // ========================================================
    const coffeeGroup = new THREE.Group();
    coffeeGroup.position.set(-16, 0, 10);

    const barGeo = new THREE.BoxGeometry(8, 2.6, 3);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.4 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 1.3, 0);
    bar.castShadow = true;
    coffeeGroup.add(bar);

    const machineGeo = new THREE.BoxGeometry(2, 1.5, 1.5);
    const machineMat = new THREE.MeshStandardMaterial({ color: 0xddaa44, metalness: 0.85, roughness: 0.2 });
    const machine = new THREE.Mesh(machineGeo, machineMat);
    machine.position.set(0, 3.3, 0);
    coffeeGroup.add(machine);

    // Interactive SEO Data Feed Whiteboard
    const wbCanvas = document.createElement('canvas');
    wbCanvas.width = 512;
    wbCanvas.height = 320;
    const wbCtx = wbCanvas.getContext('2d');
    if (wbCtx) {
      wbCtx.fillStyle = '#f8fafc';
      wbCtx.fillRect(0, 0, 512, 320);

      wbCtx.fillStyle = '#0f172a';
      wbCtx.font = 'bold 28px sans-serif';
      wbCtx.textAlign = 'center';
      wbCtx.fillText('SEO DATA FEED & LIVE GA4', 256, 45);

      // Pie chart
      wbCtx.fillStyle = '#38bdf8';
      wbCtx.beginPath();
      wbCtx.moveTo(150, 160);
      wbCtx.arc(150, 160, 65, 0, Math.PI * 1.1);
      wbCtx.fill();

      wbCtx.fillStyle = '#f59e0b';
      wbCtx.beginPath();
      wbCtx.moveTo(150, 160);
      wbCtx.arc(150, 160, 65, Math.PI * 1.1, Math.PI * 1.7);
      wbCtx.fill();

      wbCtx.fillStyle = '#10b981';
      wbCtx.beginPath();
      wbCtx.moveTo(150, 160);
      wbCtx.arc(150, 160, 65, Math.PI * 1.7, Math.PI * 2);
      wbCtx.fill();

      // Metrics
      wbCtx.textAlign = 'left';
      wbCtx.fillStyle = '#1e293b';
      wbCtx.font = 'bold 20px sans-serif';
      wbCtx.fillText('• 23 ظهور GSC معتمد', 270, 120);
      wbCtx.fillText('• 742 مقال مؤرشف', 270, 160);
      wbCtx.fillText('• $0.00 استهلاك سحابي', 270, 200);
      wbCtx.fillText('• 485 مصطلح مفهرس', 270, 240);
    }
    const wbTexture = new THREE.CanvasTexture(wbCanvas);
    const wbGeo = new THREE.PlaneGeometry(6, 3.8);
    const wbMat = new THREE.MeshStandardMaterial({ map: wbTexture, roughness: 0.3 });
    const wbMesh = new THREE.Mesh(wbGeo, wbMat);
    wbMesh.position.set(0, 4.5, -3.5);
    coffeeGroup.add(wbMesh);

    const coffeeRingGeo = new THREE.RingGeometry(4.4, 4.8, 32);
    const coffeeRingMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide });
    const coffeeRing = new THREE.Mesh(coffeeRingGeo, coffeeRingMat);
    coffeeRing.rotation.x = -Math.PI / 2;
    coffeeRing.position.y = 0.03;
    coffeeGroup.add(coffeeRing);

    this.scene.add(coffeeGroup);

    // ========================================================
    // D. SUNSET SMOKE TERRACE CHESTERFIELD LOUNGE (16, 0, 8)
    // ========================================================
    const smokeGroup = new THREE.Group();
    smokeGroup.position.set(16, 0, 8);

    const sofaBaseGeo = new THREE.BoxGeometry(6, 1.6, 2.8);
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x881122, roughness: 0.7 });
    const sofa = new THREE.Mesh(sofaBaseGeo, sofaMat);
    sofa.position.set(0, 1.2, 0);
    sofa.castShadow = true;
    smokeGroup.add(sofa);

    const heaterGeo = new THREE.CylinderGeometry(0.8, 1.2, 6, 16);
    const heaterMat = new THREE.MeshStandardMaterial({ color: 0x222226, metalness: 0.8 });
    const heater = new THREE.Mesh(heaterGeo, heaterMat);
    heater.position.set(4.5, 3.0, -4);
    smokeGroup.add(heater);

    const fireGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xff5511 });
    const fire = new THREE.Mesh(fireGeo, fireMat);
    fire.position.set(4.5, 4.8, -4);
    smokeGroup.add(fire);

    const smokeRingGeo = new THREE.RingGeometry(4.2, 4.6, 32);
    const smokeRingMat = new THREE.MeshBasicMaterial({ color: 0xff3311, side: THREE.DoubleSide });
    const smokeRing = new THREE.Mesh(smokeRingGeo, smokeRingMat);
    smokeRing.rotation.x = -Math.PI / 2;
    smokeRing.position.y = 0.42;
    smokeGroup.add(smokeRing);

    this.scene.add(smokeGroup);
  }

  private setupSmokePhysics() {
    const particleCount = 85;
    const geometry = new THREE.BufferGeometry();
    this.smokePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      this.smokePositions[i * 3 + 0] = 16 + (Math.random() - 0.5) * 3;
      this.smokePositions[i * 3 + 1] = 1.5 + Math.random() * 6;
      this.smokePositions[i * 3 + 2] = 8 + (Math.random() - 0.5) * 3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.smokePositions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xccbbaa,
      size: 0.65,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.smokeParticles = new THREE.Points(geometry, material);
    this.scene.add(this.smokeParticles);
  }

  private setupTrajectoryPaths() {
    // 3D Neon Spline Curves connecting the War Table to Stations
    const pointsToServers = [
      new THREE.Vector3(-4, 0.8, -2),
      new THREE.Vector3(-9, 0.4, -6),
      new THREE.Vector3(-14, 0.08, -8),
    ];
    const curve1 = new THREE.CatmullRomCurve3(pointsToServers);
    const tubeGeo1 = new THREE.TubeGeometry(curve1, 32, 0.1, 8, false);
    const tubeMat1 = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.85 });
    this.scene.add(new THREE.Mesh(tubeGeo1, tubeMat1));

    const pointsToCoffee = [
      new THREE.Vector3(-4, 0.8, 2),
      new THREE.Vector3(-9, 0.4, 6),
      new THREE.Vector3(-14, 0.08, 8),
    ];
    const curve2 = new THREE.CatmullRomCurve3(pointsToCoffee);
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 32, 0.1, 8, false);
    const tubeMat2 = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.85 });
    this.scene.add(new THREE.Mesh(tubeGeo2, tubeMat2));

    const pointsToTerrace = [
      new THREE.Vector3(5, 0.8, 1),
      new THREE.Vector3(10, 0.4, 4),
      new THREE.Vector3(16, 0.45, 8),
    ];
    const curve3 = new THREE.CatmullRomCurve3(pointsToTerrace);
    const tubeGeo3 = new THREE.TubeGeometry(curve3, 32, 0.1, 8, false);
    const tubeMat3 = new THREE.MeshBasicMaterial({ color: 0xff5511, transparent: true, opacity: 0.85 });
    this.scene.add(new THREE.Mesh(tubeGeo3, tubeMat3));
  }

  /**
   * Populate the 9 Human Agent Cyberpunk Holographic Standees
   */
  public setAgents(agents: Agent3DData[]) {
    this.agentMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
    });
    this.agentMeshes.clear();

    const textureLoader = new THREE.TextureLoader();

    agents.forEach((agent) => {
      const agentGroup = new THREE.Group();
      agentGroup.position.set(...agent.position);
      agentGroup.userData = { agentId: agent.id };

      // 1. Neon Floor Base Ring with Role Aura
      const baseGeo = new THREE.RingGeometry(0.9, 1.25, 24);
      const baseMat = new THREE.MeshBasicMaterial({
        color: agent.state === 'ALERT' ? 0xff0044 : agent.state === 'CHILLING' ? 0xff7722 : 0x00e5ff,
        side: THREE.DoubleSide,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.rotation.x = -Math.PI / 2;
      base.position.y = 0.06;
      agentGroup.add(base);

      // 2. Holographic Portrait Standee (Framed High-Res Asset Card)
      const portraitGeo = new THREE.PlaneGeometry(1.8, 2.5);
      const portraitTexture = textureLoader.load(agent.avatarUrl);
      const portraitMat = new THREE.MeshBasicMaterial({
        map: portraitTexture,
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide,
      });
      const portrait = new THREE.Mesh(portraitGeo, portraitMat);
      portrait.position.y = 1.45;
      agentGroup.add(portrait);

      // 3. Overhead Cadence Progress Ring (3D Torus)
      const ringPercent = Math.min(100, Math.max(0, agent.cadencePercent));
      const ringArc = (ringPercent / 100) * Math.PI * 2;
      const progressRingGeo = new THREE.TorusGeometry(0.55, 0.08, 12, 32, ringArc);
      const progressRingMat = new THREE.MeshBasicMaterial({
        color: ringPercent > 80 ? 0x00ff88 : ringPercent > 40 ? 0x00e5ff : 0xffaa00,
      });
      const progressRing = new THREE.Mesh(progressRingGeo, progressRingMat);
      progressRing.rotation.x = Math.PI / 2;
      progressRing.position.y = 3.0;
      agentGroup.add(progressRing);

      // Background Track Ring
      const trackGeo = new THREE.TorusGeometry(0.55, 0.04, 12, 32, Math.PI * 2);
      const trackMat = new THREE.MeshBasicMaterial({ color: 0x333344, transparent: true, opacity: 0.5 });
      const trackRing = new THREE.Mesh(trackGeo, trackMat);
      trackRing.rotation.x = Math.PI / 2;
      trackRing.position.y = 3.0;
      agentGroup.add(trackRing);

      // 4. Overhead Arabic Status & Percentage Pill
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 96;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(12, 16, 28, 0.94)';
        ctx.beginPath();
        ctx.roundRect(4, 4, 292, 88, 18);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = ringPercent > 80 ? '#00ff88' : '#00e5ff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Tajawal, Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.direction = 'rtl';
        ctx.fillText(`${agent.name} • ${agent.cadencePercent}%`, 150, 38);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '15px Tajawal, Cairo, sans-serif';
        ctx.direction = 'rtl';
        ctx.fillText(agent.cadenceTask.slice(0, 24), 150, 70);
      }

      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelGeo = new THREE.PlaneGeometry(2.3, 0.75);
      const labelMat = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.y = 3.65;
      agentGroup.add(label);

      this.scene.add(agentGroup);
      this.agentMeshes.set(agent.id, agentGroup);
    });
  }

  public flyToStation(stationKey: string) {
    const config = VORDER_STATIONS_CONFIG[stationKey];
    if (!config) return;

    this.targetCameraPos = new THREE.Vector3(...config.cameraPos);
    this.targetLookAt = new THREE.Vector3(...config.lookAt);
  }

  public flyToAgent(agentId: number) {
    const agentGroup = this.agentMeshes.get(agentId);
    if (!agentGroup) return;

    const pos = agentGroup.position;
    this.targetCameraPos = new THREE.Vector3(pos.x + 8, pos.y + 6, pos.z + 8);
    this.targetLookAt = new THREE.Vector3(pos.x, pos.y + 1.5, pos.z);
  }

  private onPointerDown = (event: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr) {
        if (curr.userData && curr.userData.agentId !== undefined) {
          if (this.onAgentClick) {
            this.onAgentClick(curr.userData.agentId);
          }
          return;
        }
        curr = curr.parent;
      }
    }
  };

  private onPointerMove = (event: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let foundAgentId: number | null = null;
    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr) {
        if (curr.userData && curr.userData.agentId !== undefined) {
          foundAgentId = curr.userData.agentId;
          break;
        }
        curr = curr.parent;
      }
      if (foundAgentId !== null) break;
    }

    if (this.onAgentHover) {
      this.onAgentHover(foundAgentId);
    }
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.controls.update();

    // Camera Lerp Animation
    if (this.targetCameraPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetLookAt, 0.05);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.2) {
        this.targetCameraPos = null;
        this.targetLookAt = null;
      }
    }

    // Hologram Scan Rings Slow Rotation
    this.hologramScanRings.forEach((ring, idx) => {
      ring.rotation.z += (idx === 0 ? 0.005 : -0.008);
    });

    // Smoke Particles rising in terrace
    if (this.smokePositions.length > 0) {
      const count = this.smokePositions.length / 3;
      for (let i = 0; i < count; i++) {
        this.smokePositions[i * 3 + 1] += delta * (0.8 + (i % 5) * 0.2);
        this.smokePositions[i * 3 + 0] += Math.sin(elapsedTime * 2 + i) * 0.015;

        if (this.smokePositions[i * 3 + 1] > 9.5) {
          this.smokePositions[i * 3 + 1] = 1.6;
          this.smokePositions[i * 3 + 0] = 16 + (Math.random() - 0.5) * 3;
        }
      }
      this.smokeParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Gentle hovering and billboard camera alignment
    // CRITICAL: Rotate 180 deg around Y so the plane's FRONT face points toward the camera,
    // which completely eliminates horizontally mirrored text!
    this.agentMeshes.forEach((mesh, id) => {
      mesh.position.y = Math.sin(elapsedTime * 2.5 + id) * 0.08;

      mesh.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
          child.quaternion.copy(this.camera.quaternion);
          child.rotateY(Math.PI);
        }
      });
    });

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
