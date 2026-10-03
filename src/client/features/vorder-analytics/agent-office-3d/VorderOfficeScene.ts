import * as THREE from 'three';

export interface VorderAgentConfig {
  id: number;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  color: number;
  hex: string;
  screen: 'strategy' | 'charts' | 'terminal' | 'palette' | 'map' | 'deploy' | 'docs' | 'bugs';
  hair: number;
  shirt: number;
  pants: number;
  avatarUrl: string;
  metrics: string;
  // 8-Axis Procedural Morphology & Wardrobe DNA
  skinTone?: number;
  hairStyle?: 'executive_part' | 'ponytail' | 'spiky_tech' | 'hijab_wrap' | 'beanie_cap' | 'curly_volume';
  outfitStyle?: 'open_blazer_tie' | 'trainee_tactical_vest' | 'tech_hoodie' | 'double_breasted_vest' | 'cyber_turtleneck';
  vestOrJacketColor?: number;
  tieOrAccentColor?: number;
  accessory?: 'glasses_thin' | 'ar_visor' | 'headset_mic' | 'dual_lanyard' | 'none';
  shoeColor?: number;
  heightScale?: number;
  shoulderScale?: number;
  isExpansionTrainee?: boolean;
  nominationId?: string;
  visualProfileSummary?: string;
}

export const VORDER_OFFICE_AGENTS: VorderAgentConfig[] = [
  {
    id: 0,
    name: 'طارق العبدلي',
    nameEn: 'Tariq Al-Abdali',
    role: 'المدير التنفيذي واستراتيجي السيو',
    roleEn: 'Executive Director & Strategy Lead',
    color: 0x0DEEF3,
    hex: '#0DEEF3',
    screen: 'strategy',
    hair: 0x1a1a2e,
    shirt: 0x0A3D5C,
    pants: 0x0A1628,
    skinTone: 0xDFB995,
    hairStyle: 'executive_part',
    outfitStyle: 'open_blazer_tie',
    vestOrJacketColor: 0x0F172A,
    tieOrAccentColor: 0x0DEEF3,
    accessory: 'glasses_thin',
    shoeColor: 0x111827,
    heightScale: 1.05,
    shoulderScale: 1.06,
    avatarUrl: '/game-assets/avatars/agent_01_tariq.png',
    metrics: '38 ظهور GSC معتمد • دقة 99.8%',
  },
  {
    id: 1,
    name: 'سارة المهندس',
    nameEn: 'Sara El-Mohandes',
    role: 'مهندسة الإعلانات العضوية وتصميم UX',
    roleEn: 'Organic Ads & Visual UX Designer',
    color: 0xE040FB,
    hex: '#E040FB',
    screen: 'palette',
    hair: 0x4A148C,
    shirt: 0x6A1B9A,
    pants: 0x1a1a2e,
    skinTone: 0xF3D2B8,
    hairStyle: 'ponytail',
    outfitStyle: 'cyber_turtleneck',
    vestOrJacketColor: 0x4A148C,
    tieOrAccentColor: 0xE040FB,
    accessory: 'glasses_thin',
    shoeColor: 0x311B92,
    heightScale: 0.97,
    shoulderScale: 0.94,
    avatarUrl: '/game-assets/avatars/agent_02_sarah.png',
    metrics: '4 حملات سلة وزد بتكلفة $0.00',
  },
  {
    id: 2,
    name: 'ياسمين الشريف',
    nameEn: 'Yasmine El-Sherif',
    role: 'خبيرة العناقيد الدلالية والبيانات',
    roleEn: 'Semantic Clusters & Keyword Lead',
    color: 0xF5A623,
    hex: '#F5A623',
    screen: 'charts',
    hair: 0x5D3A1A,
    shirt: 0x8B6914,
    pants: 0x3E2723,
    skinTone: 0xE8C3A2,
    hairStyle: 'hijab_wrap',
    outfitStyle: 'double_breasted_vest',
    vestOrJacketColor: 0x4E342E,
    tieOrAccentColor: 0xF5A623,
    accessory: 'dual_lanyard',
    shoeColor: 0x3E2723,
    heightScale: 0.96,
    shoulderScale: 0.95,
    avatarUrl: '/game-assets/avatars/agent_08_nadine.png',
    metrics: '1,775 مصطلح مفهرس • Striking Distance',
  },
  {
    id: 3,
    name: 'عمر الفاروق',
    nameEn: 'Omar El-Farouk',
    role: 'مهندس الروابط والسلطة الدلالية',
    roleEn: 'Internal PageRank & Authority Architect',
    color: 0xFF9100,
    hex: '#FF9100',
    screen: 'deploy',
    hair: 0x1a1a1a,
    shirt: 0xBF360C,
    pants: 0x27272A,
    skinTone: 0xC99E76,
    hairStyle: 'curly_volume',
    outfitStyle: 'double_breasted_vest',
    vestOrJacketColor: 0x7C2D12,
    tieOrAccentColor: 0xFF9100,
    accessory: 'none',
    shoeColor: 0x1F2937,
    heightScale: 1.03,
    shoulderScale: 1.04,
    avatarUrl: '/game-assets/avatars/agent_07_omar.png',
    metrics: '661 مقال مترابط داخلياً • 0 يتامى',
  },
  {
    id: 4,
    name: 'كريم الدسوقي',
    nameEn: 'Karim El-Desouki',
    role: 'مهندس النشر السحابي وقواعد D1',
    roleEn: 'Cloud SWE & D1 Publishing Pipeline',
    color: 0x00E676,
    hex: '#00E676',
    screen: 'terminal',
    hair: 0x222222,
    shirt: 0x1B5E20,
    pants: 0x1a1a2e,
    skinTone: 0xD7AF88,
    hairStyle: 'spiky_tech',
    outfitStyle: 'tech_hoodie',
    vestOrJacketColor: 0x064E3B,
    tieOrAccentColor: 0x00E676,
    accessory: 'headset_mic',
    shoeColor: 0x065F46,
    heightScale: 1.01,
    shoulderScale: 1.02,
    avatarUrl: '/game-assets/avatars/agent_03_kareem.png',
    metrics: '661 = 661 = 661 • استجابة 9ms',
  },
  {
    id: 5,
    name: 'ليلى الألفي',
    nameEn: 'Layla El-Alfi',
    role: 'قائدة الجودة وفاحصة السيو التقني',
    roleEn: 'QA Lead & Technical SEO Auditor',
    color: 0xFF5252,
    hex: '#FF5252',
    screen: 'bugs',
    hair: 0xD84315,
    shirt: 0xC62828,
    pants: 0x212121,
    skinTone: 0xF5D6BE,
    hairStyle: 'ponytail',
    outfitStyle: 'open_blazer_tie',
    vestOrJacketColor: 0x7F1D1D,
    tieOrAccentColor: 0xFF5252,
    accessory: 'ar_visor',
    shoeColor: 0x18181B,
    heightScale: 0.98,
    shoulderScale: 0.96,
    avatarUrl: '/game-assets/avatars/agent_06_layla.png',
    metrics: '100% Core Web Vitals • 0 أخطاء',
  },
  {
    id: 6,
    name: 'فارس النجار',
    nameEn: 'Faris Al-Najjar',
    role: 'قائد السيو الإقليمي والأسواق الخمسة',
    roleEn: 'Regional GEO & Local SEO Commander',
    color: 0x38BDF8,
    hex: '#38BDF8',
    screen: 'map',
    hair: 0x475569,
    shirt: 0x0369A1,
    pants: 0x1E293B,
    skinTone: 0xC59469,
    hairStyle: 'beanie_cap',
    outfitStyle: 'tech_hoodie',
    vestOrJacketColor: 0x0C4A6E,
    tieOrAccentColor: 0x38BDF8,
    accessory: 'headset_mic',
    shoeColor: 0x0F172A,
    heightScale: 1.02,
    shoulderScale: 1.03,
    avatarUrl: '/game-assets/avatars/agent_05_fahd.png',
    metrics: '5 أسواق نشطة (SA/EG/AE/KW/QA)',
  },
  {
    id: 7,
    name: 'نور المرشدي',
    nameEn: 'Nour El-Morshedy',
    role: 'مهندسة اقتباسات الذكاء الاصطناعي GEO',
    roleEn: 'AI Overviews & GEO Entity Specialist',
    color: 0xA855F7,
    hex: '#A855F7',
    screen: 'docs',
    hair: 0x3B0764,
    shirt: 0x581C87,
    pants: 0x1a1a2e,
    skinTone: 0xEDD0B7,
    hairStyle: 'hijab_wrap',
    outfitStyle: 'cyber_turtleneck',
    vestOrJacketColor: 0x4C1D95,
    tieOrAccentColor: 0xA855F7,
    accessory: 'ar_visor',
    shoeColor: 0x2E1065,
    heightScale: 0.97,
    shoulderScale: 0.95,
    avatarUrl: '/game-assets/avatars/agent_04_ziad.png',
    metrics: 'اقتباسات Perplexity و Gemini +34%',
  },
  {
    id: 8,
    name: 'زياد عمران / الخطيب',
    nameEn: 'Ziad Omran / El-Khatib',
    role: 'المشرف العام وحارس الجودة وسجل المهام',
    roleEn: 'QA Sentinel & Host',
    color: 0x448AFF,
    hex: '#448AFF',
    screen: 'bugs',
    hair: 0x3E2723,
    shirt: 0x1565C0,
    pants: 0x263238,
    skinTone: 0xD2A67D,
    hairStyle: 'executive_part',
    outfitStyle: 'open_blazer_tie',
    vestOrJacketColor: 0x1E3A8A,
    tieOrAccentColor: 0x448AFF,
    accessory: 'dual_lanyard',
    shoeColor: 0x0F172A,
    heightScale: 1.04,
    shoulderScale: 1.05,
    avatarUrl: '/game-assets/avatars/agent_09_rami.png',
    metrics: 'التدقيق الجنائي 360° • فحص الروابط والأمن SSL',
  },
];

export interface OfficeSceneCallbacks {
  onTimeUpdate?: (minutes: number) => void;
  onStatusUpdate?: (status: string) => void;
  onMeetingChange?: (inMeeting: boolean) => void;
  onAgentClick?: (agentId: number, agent: VorderAgentConfig) => void;
}

export function createVorderOfficeScene(container: HTMLElement, callbacks: OfficeSceneCallbacks = {}) {
  const { onTimeUpdate, onStatusUpdate, onMeetingChange, onAgentClick } = callbacks;

  // Pseudo-random generator with fixed seed for determinism
  class RNG {
    s: number;
    constructor(s = 42) { this.s = s; }
    n() { this.s = (this.s * 16807) % 2147483647; return (this.s - 1) / 2147483646; }
    r(a: number, b: number) { return a + this.n() * (b - a); }
    i(a: number, b: number) { return Math.floor(this.r(a, b + 1)); }
    pick<T>(a: T[]): T { return a[this.i(0, a.length - 1)]; }
  }
  const rng = new RNG(2026);

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000C1E);
  scene.fog = new THREE.FogExp2(0x000C1E, 0.005);

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 500);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  // 2. Camera Orbit & Pan Controls (Fully Fixed: Drag-vs-Click suppression & Right-Click Pan)
  let isDrag = false;
  let isPan = false;
  let pointerDownPos = { x: 0, y: 0 };
  let prev = { x: 0, y: 0 };
  const sph = { theta: 0.0, phi: Math.PI / 3.8, radius: 31.5 };
  const tgt = new THREE.Vector3(-1.0, 1.3, 0.5);
  let autoRot = false;
  let autoTmr: any = null;

  function updCam() {
    const p = Math.max(0.18, Math.min(Math.PI / 2.25, sph.phi));
    sph.phi = p;
    camera.position.set(
      sph.radius * Math.sin(p) * Math.sin(sph.theta) + tgt.x,
      sph.radius * Math.cos(p) + tgt.y,
      sph.radius * Math.sin(p) * Math.cos(sph.theta) + tgt.z
    );
    camera.lookAt(tgt);
  }
  updCam();

  const onPointerDown = (e: PointerEvent) => {
    isDrag = true;
    pointerDownPos = { x: e.clientX, y: e.clientY };
    isPan = (e.button === 2) || (e.button === 1) || e.shiftKey;
    prev = { x: e.clientX, y: e.clientY };
    autoRot = false;
    clearTimeout(autoTmr);
  };

  const onPointerUp = () => {
    isDrag = false;
    isPan = false;
    autoTmr = setTimeout(() => { autoRot = false; }, 8000);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDrag) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;

    if (isPan) {
      // Pan camera target along horizontal camera plane
      const rightX = Math.cos(sph.theta);
      const rightZ = -Math.sin(sph.theta);
      const fwdX = -Math.sin(sph.theta);
      const fwdZ = -Math.cos(sph.theta);
      const panSpeed = 0.022 * (sph.radius / 30);
      tgt.x -= (dx * rightX - dy * fwdX) * panSpeed;
      tgt.z -= (dx * rightZ - dy * fwdZ) * panSpeed;
      tgt.x = Math.max(-14, Math.min(14, tgt.x));
      tgt.z = Math.max(-12, Math.min(12, tgt.z));
    } else {
      // Orbit camera
      sph.theta -= dx * 0.005;
      sph.phi = Math.max(0.18, Math.min(Math.PI / 2.25, sph.phi + dy * 0.005));
    }

    prev = { x: e.clientX, y: e.clientY };
    updCam();
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * 0.02, 2.2);
    sph.radius = Math.max(12, Math.min(48, sph.radius + delta));
    updCam();
  };

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault(); // Prevent right-click context menu when panning
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  renderer.domElement.addEventListener('contextmenu', onContextMenu);

  // 3. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xFFF8F0, 1.2);
  sun.position.set(12, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -22;
  sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 22;
  sun.shadow.camera.bottom = -22;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  scene.add(new THREE.DirectionalLight(0xCCDDFF, 0.4).translateX(-10).translateY(12));
  scene.add(new THREE.HemisphereLight(0xDDE8F0, 0xB0BEC5, 0.4));

  // 4. Materials & Helpers
  const office = new THREE.Group();
  scene.add(office);

  const M = (c: number, o: Record<string, any> = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const MB = (c: number) => new THREE.MeshBasicMaterial({ color: c });
  const Glass = () => new THREE.MeshPhysicalMaterial({ color: 0xBBCCDD, transparent: true, opacity: 0.08, roughness: 0 });

  // Floor
  const fl = new THREE.Mesh(new THREE.BoxGeometry(26, 0.15, 20), M(0xE8E8E8));
  fl.position.y = -0.075;
  fl.receiveShadow = true;
  office.add(fl);

  // Carpet for open workstation bay
  const cp = new THREE.Mesh(new THREE.BoxGeometry(11, 0.02, 11), M(0xD0D8E0));
  cp.position.set(-4, 0.01, 1.5);
  cp.receiveShadow = true;
  office.add(cp);

  // Transparent glass walls
  [[0, -9.5, 26, 4, 0.06], [0, 9.5, 26, 4, 0.06], [-12.5, 0, 0.06, 4, 20], [12.5, 0, 0.06, 4, 20]].forEach(([x, z, w, h, d]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), Glass());
    wall.position.set(x, h / 2, z);
    office.add(wall);
  });

  // Edge frames
  [[-12.5, -9.5], [-12.5, 9.5], [12.5, -9.5], [12.5, 9.5]].forEach(([x, z]) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4, 0.08), M(0xAABBCC));
    f.position.set(x, 2, z);
    office.add(f);
  });

  // Ceiling
  const ceil = new THREE.Mesh(
    new THREE.BoxGeometry(26, 0.1, 20),
    new THREE.MeshLambertMaterial({ color: 0x0A1628, transparent: true, opacity: 0.1, depthWrite: false })
  );
  ceil.position.y = 4.05;
  office.add(ceil);

  // Ceiling recessed light panels
  for (let i = -2; i <= 2; i++) {
    for (let j = -1; j <= 1; j++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(3, 0.03, 1), MB(0xF0F4FF));
      p.position.set(i * 4.5, 3.98, j * 5);
      office.add(p);
      const pl = new THREE.PointLight(0xFFFFFF, 0.25, 10, 1.8);
      pl.position.set(i * 4.5, 3.8, j * 5);
      office.add(pl);
    }
  }

  // Active runtime list of agents (starts with 9 core agents, grows dynamically as nominations are approved)
  const activeAgentsList: VorderAgentConfig[] = [...VORDER_OFFICE_AGENTS];
  const spawnedNominationIds = new Set<string>();

  // ═══════════════════════════════════════════════════
  // DESK POSITIONS (Base 3x3 Grid for 0..8 + Dynamic Expansion Slots for 9+)
  // ═══════════════════════════════════════════════════
  const desks: Array<{ x: number; z: number }> = [
    { x: -8, z: -3 },  // Desk 0: Tariq (North-West)
    { x: -4, z: -3 },  // Desk 1: Sara (North-Center)
    { x: 0,  z: -3 },  // Desk 2: Yasmine (North-East)
    { x: -8, z: 1.5 }, // Desk 3: Omar (Mid-West)
    { x: -4, z: 1.5 }, // Desk 4: Karim (Mid-Center)
    { x: 0,  z: 1.5 }, // Desk 5: Layla (Mid-East)
    { x: -8, z: 6 },   // Desk 6: Faris (South-West)
    { x: -4, z: 6 },   // Desk 7: Nour (South-Center)
    { x: 0,  z: 6 },   // Desk 8: Ziad Omran (South-East)
  ];

  const expansionDeskSlots: Array<{ x: number; z: number }> = [
    { x: 2.0, z: 1.5 },  // Slot 9 (East Wing Mid — clear of Meeting Room West Wall)
    { x: 2.0, z: 6.0 },  // Slot 10 (East Wing South)
    { x: -8.0, z: -6.2 }, // Slot 11 (North Wing West)
    { x: -4.0, z: -6.2 }, // Slot 12 (North Wing Center)
    { x: 0.0,  z: -6.2 }, // Slot 13 (North Wing East)
    { x: 2.0,  z: -6.2 }, // Slot 14 (North-East Corner — clear of Meeting Room West Wall)
  ];

  function getOrAssignDeskPosition(slotIndex: number): { x: number; z: number } {
    if (desks[slotIndex]) return desks[slotIndex];
    const expIdx = slotIndex - 9;
    const coord =
      expansionDeskSlots[expIdx] || {
        x: -8 + (expIdx % 4) * 3.7,
        z: -6.2 - Math.floor(expIdx / 4) * 2.8,
      };
    desks[slotIndex] = coord;
    return coord;
  }

  // ═══════════════════════════════════════════════════
  // CHARACTER BUILDER (8-Axis Procedural Voxel Morphology, Outfits & Accessories)
  // ═══════════════════════════════════════════════════
  function buildChar(agent: VorderAgentConfig, standing = false) {
    const g = new THREE.Group();
    const skin = agent.skinTone || 0xDEB887;
    const shoeCol = agent.shoeColor || 0x222222;
    const vestCol = agent.vestOrJacketColor || 0x1E293B;
    const accentCol = agent.tieOrAccentColor || agent.color;
    const outfit = agent.outfitStyle || 'open_blazer_tie';
    const hairStyle = agent.hairStyle || 'executive_part';
    const accessory = agent.accessory || 'none';

    const torsoY = standing ? 0.58 : 0.62;
    const headY = standing ? 0.86 : 0.90;
    const faceZDir = standing ? 1 : -1; // Standing faces +Z, Sitting faces -Z (toward monitor)

    if (standing) {
      // Legs
      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), M(agent.pants));
      leftLeg.position.set(-0.08, 0.2, 0);
      g.add(leftLeg);
      leftLeg.userData = { isLeg: true, phase: 0 };

      const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), M(agent.pants));
      rightLeg.position.set(0.08, 0.2, 0);
      g.add(rightLeg);
      rightLeg.userData = { isLeg: true, phase: Math.PI };

      // Shoes
      [-1, 1].forEach((s) => {
        const sh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.16), M(shoeCol));
        sh.position.set(s * 0.08, 0.025, 0);
        g.add(sh);
      });

      // Base Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.16), M(agent.shirt));
      torso.position.set(0, torsoY, 0);
      torso.castShadow = true;
      g.add(torso);

      // Arms hanging with walking swing references
      [-1, 1].forEach((s) => {
        const armGroup = new THREE.Group();
        armGroup.position.set(s * 0.2, 0.65, 0);
        const sleeveColor = outfit === 'open_blazer_tie' || outfit === 'tech_hoodie' ? vestCol : agent.shirt;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), M(sleeveColor));
        arm.position.set(0, -0.15, 0);
        armGroup.add(arm);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.07), M(skin));
        hand.position.set(0, -0.32, 0);
        armGroup.add(hand);
        armGroup.userData = { isWalkerArm: true, phase: s > 0 ? 0 : Math.PI };
        g.add(armGroup);
      });
    } else {
      // Sitting character facing -Z (toward monitor and keyboard)
      [-1, 1].forEach((s) => {
        const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.1, 0.22), M(agent.pants));
        thigh.position.set(s * 0.09, 0.42, -0.05);
        g.add(thigh);
      });

      [-1, 1].forEach((s) => {
        const shin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), M(agent.pants));
        shin.position.set(s * 0.09, 0.24, -0.15);
        g.add(shin);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.14), M(shoeCol));
        shoe.position.set(s * 0.09, 0.1, -0.15);
        g.add(shoe);
      });

      // Base Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.16), M(agent.shirt));
      torso.position.set(0, torsoY, 0);
      torso.castShadow = true;
      g.add(torso);

      // Arms typing actively on keyboard
      [-1, 1].forEach((s) => {
        const armGroup = new THREE.Group();
        armGroup.position.set(s * 0.2, 0.62, -0.04);
        const sleeveColor = outfit === 'open_blazer_tie' || outfit === 'tech_hoodie' ? vestCol : agent.shirt;
        const ua = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.08), M(sleeveColor));
        ua.position.set(0, -0.06, -0.04);
        armGroup.add(ua);
        const fa = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.18), M(skin));
        fa.position.set(0, -0.12, -0.14);
        armGroup.add(fa);
        armGroup.userData = { isTypingArm: true, side: s };
        g.add(armGroup);
      });
    }

    // ─── Multi-Layered Wardrobe Geometry (5 Distinct Outfits) ───
    const frontZ = faceZDir * 0.086;
    if (outfit === 'open_blazer_tie') {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.11), M(0xFFFFFF));
      col.position.set(0, torsoY + 0.15, 0);
      g.add(col);
      // Left & Right Blazer Lapels
      [-1, 1].forEach((s) => {
        const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.27, 0.175), M(vestCol));
        lapel.position.set(s * 0.10, torsoY, 0);
        g.add(lapel);
      });
      // Necktie
      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.21, 0.015), MB(accentCol));
      tie.position.set(0, torsoY + 0.01, frontZ);
      g.add(tie);
    } else if (outfit === 'trainee_tactical_vest') {
      // Tactical Trainee Vest Shell
      const vest = new THREE.Mesh(new THREE.BoxGeometry(0.295, 0.25, 0.175), M(vestCol));
      vest.position.set(0, torsoY - 0.01, 0);
      g.add(vest);
      // Glowing Shoulder Epaulettes
      [-1, 1].forEach((s) => {
        const ep = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.14), MB(accentCol));
        ep.position.set(s * 0.11, torsoY + 0.145, 0);
        g.add(ep);
      });
      // High-visibility Trainee Chest Stripe & Lanyard ID Card
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.015), MB(accentCol));
      stripe.position.set(0, torsoY + 0.05, frontZ);
      g.add(stripe);
      const idCard = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.085, 0.018), MB(0xFFFFFF));
      idCard.position.set(-0.06, torsoY - 0.03, frontZ + faceZDir * 0.005);
      g.add(idCard);
    } else if (outfit === 'tech_hoodie') {
      // Rear Hood resting behind neck
      const hood = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.12), M(vestCol));
      hood.position.set(0, torsoY + 0.16, -faceZDir * 0.05);
      g.add(hood);
      // Drawstrings
      [-1, 1].forEach((s) => {
        const cord = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.015), MB(accentCol));
        cord.position.set(s * 0.045, torsoY + 0.06, frontZ);
        g.add(cord);
      });
    } else if (outfit === 'double_breasted_vest') {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.11), M(0xFFFFFF));
      col.position.set(0, torsoY + 0.15, 0);
      g.add(col);
      const waistcoat = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.24, 0.172), M(vestCol));
      waistcoat.position.set(0, torsoY - 0.01, 0);
      g.add(waistcoat);
      [-0.04, 0.04].forEach((bx) => {
        [-0.04, 0.03].forEach((by) => {
          const btn = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.015), MB(accentCol));
          btn.position.set(bx, torsoY + by, frontZ);
          g.add(btn);
        });
      });
    } else if (outfit === 'cyber_turtleneck') {
      // High Turtleneck Collar
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.07, 0.14), M(vestCol));
      neck.position.set(0, torsoY + 0.16, 0);
      g.add(neck);
      const chestNeon = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.025, 0.015), MB(accentCol));
      chestNeon.position.set(0, torsoY + 0.06, frontZ);
      g.add(chestNeon);
    }

    // Badge
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), MB(agent.color));
    badge.position.set(0.15, torsoY + 0.06, faceZDir * 0.065);
    g.add(badge);

    // ─── Head & Eyes ───
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), M(skin));
    head.position.set(0, headY, 0);
    head.castShadow = true;
    g.add(head);

    [-1, 1].forEach((s) => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), MB(0xFFFFFF));
      eye.position.set(s * 0.05, headY + 0.02, faceZDir * 0.105);
      g.add(eye);
      const pup = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), MB(0x1a1a2e));
      pup.position.set(s * 0.05, headY + 0.015, faceZDir * 0.112);
      g.add(pup);
    });

    // ─── 6 Distinct 3D Hair / Headwear Styles ───
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), M(agent.hair));
    hairTop.position.set(0, headY + 0.10, -faceZDir * 0.01);
    g.add(hairTop);

    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.045), M(agent.hair));
    hairBack.position.set(0, headY + 0.04, -faceZDir * 0.11);
    g.add(hairBack);

    if (hairStyle === 'ponytail') {
      const pony = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.07), M(agent.hair));
      pony.position.set(0, headY - 0.02, -faceZDir * 0.145);
      g.add(pony);
    } else if (hairStyle === 'spiky_tech') {
      [-0.06, 0, 0.06].forEach((sx, i) => {
        const spike = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.08), M(agent.hair));
        spike.position.set(sx, headY + 0.15, faceZDir * (0.02 - i * 0.02));
        spike.rotation.z = sx * 2.2;
        g.add(spike);
      });
    } else if (hairStyle === 'hijab_wrap') {
      const wrapSides = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.22, 0.21), M(agent.hair));
      wrapSides.position.set(0, headY + 0.01, -faceZDir * 0.015);
      g.add(wrapSides);
      const wrapNeck = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.08, 0.18), M(agent.hair));
      wrapNeck.position.set(0, headY - 0.11, 0);
      g.add(wrapNeck);
    } else if (hairStyle === 'beanie_cap') {
      const beanie = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.10, 0.23), M(vestCol));
      beanie.position.set(0, headY + 0.105, 0);
      g.add(beanie);
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.238, 0.03, 0.238), MB(accentCol));
      rim.position.set(0, headY + 0.065, 0);
      g.add(rim);
    } else if (hairStyle === 'curly_volume') {
      const afro = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.25), M(agent.hair));
      afro.position.set(0, headY + 0.11, 0);
      g.add(afro);
    }

    // ─── 3D Facial & Head Accessories ───
    if (accessory === 'glasses_thin') {
      [-1, 1].forEach((s) => {
        const frameRim = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.045, 0.015), MB(0x111827));
        frameRim.position.set(s * 0.052, headY + 0.02, faceZDir * 0.114);
        g.add(frameRim);
      });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.015), MB(accentCol));
      bridge.position.set(0, headY + 0.025, faceZDir * 0.116);
      g.add(bridge);
    } else if (accessory === 'ar_visor') {
      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.215, 0.048, 0.025),
        new THREE.MeshBasicMaterial({ color: accentCol, transparent: true, opacity: 0.85 })
      );
      visor.position.set(0, headY + 0.022, faceZDir * 0.112);
      g.add(visor);
    } else if (accessory === 'headset_mic') {
      [-1, 1].forEach((s) => {
        const cup = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.075, 0.075), M(0x1E293B));
        cup.position.set(s * 0.115, headY + 0.01, 0);
        g.add(cup);
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.04, 0.04), MB(accentCol));
        led.position.set(s * 0.132, headY + 0.01, 0);
        g.add(led);
      });
      const micBoom = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.11), MB(accentCol));
      micBoom.position.set(0.11, headY - 0.04, faceZDir * 0.06);
      g.add(micBoom);
    } else if (accessory === 'dual_lanyard') {
      [-1, 1].forEach((s) => {
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.16, 0.015), MB(accentCol));
        strap.position.set(s * 0.03, torsoY + 0.06, frontZ);
        strap.rotation.z = s * 0.22;
        g.add(strap);
      });
    }

    // Apply anthropometric body scale variations so no two agents have identical silhouettes
    const sx = agent.shoulderScale || 1.0;
    const sy = agent.heightScale || 1.0;
    g.scale.set(sx, sy, sx);

    return g;
  }

  // ═══════════════════════════════════════════════════
  // FUNCTION 1: spawnAgentWorkstationWithPC(agent, slotIndex)
  // Dynamically builds a desk, 3D illuminated PC tower, live monitor, chair, and spawns the agent!
  // ═══════════════════════════════════════════════════
  const screenData: any[] = [];
  const agentData: any[] = [];
  const defaultAgentBadges: Record<number, string[]> = {
    0: ['⚡ يدير العمليات ويعتمد الخطط', '📊 يراقب مؤشرات الظهور في كونسول', '🎯 يوجه حصص دول النشر'],
    1: ['📈 تحلل الـ ROAS في GA4', '🎯 تضبط سرعة العرض TURBO_3X', '💰 تراقب مسارات التحويل CAPI'],
    2: ['🔍 تحصد كلمات Striking Distance', '🧠 تصنف نوايا الباحثين (Intent)', '📊 تحلل فجوات الكلمات بكونسول'],
    3: ['🔗 يبني شبكة الروابط والـ PageRank', '🏛️ يعزز موثوقية الدومين Authority', '⚓ يوزع نصوص الـ Anchor الدلالية'],
    4: ['🚀 ينشر المقالات ويحدث Sitemap', '📡 يطلق نبضات IndexNow الفورية', '📝 يدير طابور النشر الاستراتيجي'],
    5: ['⚡ تفحص Core Web Vitals والـ Schema', '🔬 تدقق سرعة الموبايل LCP/CLS', '🛡️ تحرس صحة الموقع 100%'],
    6: ['🌍 يضبط حصص السعودية ومصر والخليج', '📍 يربط المحتوى بمدن الرياض والقاهرة', '🗺️ يحسن ظهور الـ Local 3-Pack'],
    7: ['🤖 تهندس اقتباسات الذكاء الاصطناعي GEO', '✨ تبني خريطة الـ Entities لـ Gemini', '📑 تطور فقرات الإجابة المباشرة'],
    8: ['🛡️ يراقب قواعد D1 وفلتر ذاكرة المالك', '⚙️ يحرس نقاط الاستئناف Checkpoints', '🔒 يدقق اللوجز الجنائية لحظياً'],
  };

  function spawnAgentWorkstationWithPC(agent: VorderAgentConfig, slotIndex: number) {
    const dp = getOrAssignDeskPosition(slotIndex);
    const ax = dp.x, az = dp.z;

    // Expand open-bay carpet dynamically when expansion workstations (slotIndex >= 9) are added
    if (slotIndex >= 9) {
      let minX = -9.5, maxX = 1.5, minZ = -4.5, maxZ = 7.5;
      desks.forEach((d) => {
        if (!d) return;
        minX = Math.min(minX, d.x - 1.4);
        maxX = Math.max(maxX, d.x + 1.4);
        minZ = Math.min(minZ, d.z - 1.4);
        maxZ = Math.max(maxZ, d.z + 1.4);
      });
      const newW = Math.max(11, maxX - minX);
      const newD = Math.max(11, maxZ - minZ);
      cp.scale.set(newW / 11, 1, newD / 11);
      cp.position.set((minX + maxX) / 2, 0.01, (minZ + maxZ) / 2);
    }

    const deskGroup = new THREE.Group();
    deskGroup.userData = { workstationSlot: slotIndex, agentId: agent.id };

    // Desk legs
    [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].forEach(([lx, lz]) => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), M(0xBBCCDD));
      l.position.set(ax + lx, 0.35, az + lz);
      l.castShadow = true;
      deskGroup.add(l);
    });

    // Desk top (expansion workstations get a subtle glowing front edge strip)
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.75), M(0xE8ECF0));
    dTop.position.set(ax, 0.73, az);
    dTop.castShadow = true;
    dTop.receiveShadow = true;
    deskGroup.add(dTop);

    if (slotIndex >= 9) {
      const edgeTrim = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.022, 0.025), MB(agent.color));
      edgeTrim.position.set(ax, 0.74, az - 0.37);
      deskGroup.add(edgeTrim);
    }

    // Front modesty panel
    const dFront = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.38, 0.03), M(0xDDE4EC));
    dFront.position.set(ax, 0.52, az - 0.36);
    deskGroup.add(dFront);

    // ─── 3D Illuminated PC Workstation Tower (with RGB GPU Strip & Power LED) ───
    const pcChassis = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.38, 0.36), M(0x1E293B));
    pcChassis.position.set(ax - 0.56, 0.94, az - 0.14);
    pcChassis.castShadow = true;
    deskGroup.add(pcChassis);

    const pcRgbBar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.32, 0.025), MB(agent.color));
    pcRgbBar.position.set(ax - 0.455, 0.94, az + 0.03);
    deskGroup.add(pcRgbBar);

    const pcGlassSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.30, 0.28),
      new THREE.MeshBasicMaterial({ color: agent.color, transparent: true, opacity: 0.25 })
    );
    pcGlassSide.position.set(ax - 0.455, 0.94, az - 0.14);
    deskGroup.add(pcGlassSide);

    // Monitor Stand & Ultrawide Display
    const monBase = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.12), M(0xAABBCC));
    monBase.position.set(ax, 0.77, az - 0.2);
    deskGroup.add(monBase);
    const monStand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), M(0xAABBCC));
    monStand.position.set(ax, 0.88, az - 0.2);
    deskGroup.add(monStand);

    const monBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.52, 0.03), M(0x2A2A2A));
    monBody.position.set(ax, 1.28, az - 0.24);
    monBody.castShadow = true;
    deskGroup.add(monBody);

    // Live animated screen CanvasTexture
    const cv = document.createElement('canvas');
    cv.width = 128;
    cv.height = 80;
    const cx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv);
    tex.minFilter = THREE.LinearFilter;
    const sf = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.46), new THREE.MeshBasicMaterial({ map: tex }));
    sf.position.set(ax, 1.28, az - 0.22);
    deskGroup.add(sf);
    screenData.push({ canvas: cv, ctx: cx, tex, type: agent.screen, hex: agent.hex, agent });

    // Keyboard & mouse
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.13), M(0x333333));
    kb.position.set(ax, 0.77, az + 0.02);
    deskGroup.add(kb);
    const ms = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.09), M(0x333333));
    ms.position.set(ax + 0.42, 0.77, az + 0.02);
    deskGroup.add(ms);

    // Coffee mug
    const mug = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), M(slotIndex % 2 ? 0xFFFFFF : agent.color));
    mug.position.set(ax + 0.55, 0.8, az + 0.12);
    deskGroup.add(mug);

    // Ergonomic Office Chair
    const cz = az + 0.55;
    const cSeat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), M(0x37474F));
    cSeat.position.set(ax, 0.44, cz);
    deskGroup.add(cSeat);
    const cBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.04), M(0x37474F));
    cBack.position.set(ax, 0.67, cz + 0.19);
    deskGroup.add(cBack);
    const chairAccent = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.035, 0.048), MB(agent.color));
    chairAccent.position.set(ax, 0.84, cz + 0.19);
    deskGroup.add(chairAccent);

    [-0.14, 0.14].forEach((ox) => {
      [-0.14, 0.14].forEach((oz) => {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.03), M(0x90A4AE));
        l.position.set(ax + ox, 0.21, cz + oz);
        deskGroup.add(l);
      });
    });

    office.add(deskGroup);

    // Desk Underglow
    const dGlow = new THREE.PointLight(agent.color, 0.25, 2.8, 2);
    dGlow.position.set(ax, 0.3, az);
    office.add(dGlow);

    // Sitting Character
    const sittingChar = buildChar(agent, false);
    sittingChar.position.set(ax, 0, az + 0.55);
    sittingChar.userData = { agentId: agent.id };
    office.add(sittingChar);

    // Dynamic Overhead Holographic Billboard Sprite (Name + Role + Duty % Progress)
    const lc = document.createElement('canvas');
    lc.width = 256;
    lc.height = 72;
    const lctx = lc.getContext('2d');
    const lTex = new THREE.CanvasTexture(lc);
    lTex.minFilter = THREE.LinearFilter;

    function renderLabelCanvas(progressPct: number, statusBadge: string) {
      if (!lctx) return;
      lctx.clearRect(0, 0, 256, 72);

      lctx.fillStyle = 'rgba(8, 16, 32, 0.88)';
      lctx.beginPath();
      lctx.roundRect(4, 4, 248, 64, 12);
      lctx.fill();
      lctx.strokeStyle = agent.hex;
      lctx.lineWidth = agent.isExpansionTrainee ? 2.2 : 1.5;
      lctx.stroke();

      lctx.font = 'bold 17px Tajawal, Cairo, sans-serif';
      lctx.textAlign = 'center';
      lctx.fillStyle = agent.hex;
      const titleText = agent.isExpansionTrainee ? `★ ${agent.name}` : agent.name;
      lctx.fillText(titleText, 128, 25);

      const barW = 180, barH = 5;
      const barX = (256 - barW) / 2;
      const barY = 34;
      lctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      lctx.fillRect(barX, barY, barW, barH);
      lctx.fillStyle = agent.hex;
      lctx.fillRect(barX, barY, (barW * Math.min(100, Math.max(0, progressPct))) / 100, barH);

      lctx.font = '11px Tajawal, sans-serif';
      lctx.fillStyle = 'rgba(220, 235, 255, 0.96)';
      lctx.fillText(statusBadge, 128, 56);
      lTex.needsUpdate = true;
    }

    const customBadges = defaultAgentBadges[agent.id] || [
      `⚡ ينفذ مهام ${agent.role.slice(0, 22)}`,
      `🚀 يعزز نتائج الفريق (${agent.name})`,
      `📊 يزامن مخرجاته مع قواعد D1`,
    ];
    const initPct = 36 + ((agent.id * 17) % 58);
    const initBadge = customBadges[0];
    renderLabelCanvas(initPct, `${initBadge} (${initPct}%)`);

    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: lTex, transparent: true, depthTest: false }));
    label.scale.set(1.55, 0.44, 1);
    label.position.set(ax, 1.85, az + 0.55);
    office.add(label);

    // Standing Walker Character (hidden initially)
    const walker = buildChar(agent, true);
    walker.visible = false;
    walker.userData = { agentId: agent.id };
    office.add(walker);

    agentData.push({
      sittingChar,
      walker,
      label,
      renderLabelCanvas,
      dGlow,
      deskGroup,
      home: { x: ax, z: az + 0.55 },
      state: 'sitting',
      timer: 4 + rng.r(0, 6),
      walkTarget: null,
      walkDestinationLabel: '',
      walkPause: 0,
      liveProgressPct: initPct,
      liveBadgeAr: initBadge,
      badgeOptions: customBadges,
      agent,
    });
  }

  // Spawn initial 9 core workstations
  VORDER_OFFICE_AGENTS.forEach((agent, idx) => {
    spawnAgentWorkstationWithPC(agent, idx);
  });

  // ═══════════════════════════════════════════════════
  // FUNCTION 2: expandMeetingRoomAndAddChair(totalAgentsCount)
  // Parametrically builds/expands the conference room, table, chairs, and whiteboard!
  // ═══════════════════════════════════════════════════
  const MRX = 7.8, MRZ = -3.0;
  const meetingRoomGroup = new THREE.Group();
  office.add(meetingRoomGroup);

  const meetSeats: Array<{ x: number; z: number; ry: number; isHead: boolean }> = [];
  const meetChars: any[] = [];
  let lastPubCount = 661;
  let lastGscImp = 48;
  let lastKwCount = 1775;
  let currentRoomHalfX = 3.75;
  let currentRoomHalfZ = 3.1;

  const wbc = document.createElement('canvas');
  wbc.width = 360;
  wbc.height = 140;
  const wbx = wbc.getContext('2d');
  const wbt = new THREE.CanvasTexture(wbc);

  function drawWhiteboard(pubCount = lastPubCount, gscImp = lastGscImp, kwCount = lastKwCount, agentsCount = activeAgentsList.length) {
    lastPubCount = pubCount;
    lastGscImp = gscImp;
    lastKwCount = kwCount;
    if (!wbx) return;
    wbx.fillStyle = '#FAFAFA';
    wbx.fillRect(0, 0, 360, 140);
    wbx.font = 'bold 16px sans-serif';
    wbx.fillStyle = '#059669';
    wbx.fillText(`VORDER 360° LIVE TELEMETRY (${agentsCount} AGENTS)`, 10, 26);
    wbx.font = 'bold 12px monospace';
    wbx.fillStyle = '#111827';
    wbx.fillText(`▸ BLOG: ${pubCount} = SITEMAP: ${pubCount} = D1: ${pubCount}`, 12, 52);
    wbx.fillStyle = '#059669';
    wbx.fillText(`▸ KEYWORDS: ${kwCount} • SITE AUDIT: 100%`, 12, 76);
    wbx.fillStyle = '#2563EB';
    wbx.fillText(`▸ GSC: ${gscImp} IMPRESSIONS • TURBO_3X`, 12, 100);
    wbx.fillStyle = '#D97706';
    wbx.fillText(`▸ ACTIVE TEAM: ${agentsCount} SEATS & WORKSTATIONS`, 12, 122);
    wbt.needsUpdate = true;
  }

  function expandMeetingRoomAndAddChair(totalAgentsCount: number) {
    // Clear previous meeting room static meshes
    while (meetingRoomGroup.children.length > 0) {
      const child = meetingRoomGroup.children[0] as any;
      meetingRoomGroup.remove(child);
    }

    const sideAgents = Math.max(8, totalAgentsCount - 1);
    const sidePairs = Math.ceil(sideAgents / 2); // 4 pairs for 9 agents, 5 pairs for 10-11, 6 pairs for 12-13...
    const extraPairs = Math.max(0, sidePairs - 4);

    const tableLen = Math.min(6.4, 5.2 + extraPairs * 0.55);
    const tableWidthZ = 1.7 + Math.min(0.35, extraPairs * 0.08);
    const roomHalfX = Math.min(4.2, Math.max(3.7, tableLen / 2 + 0.95));
    const roomHalfZ = Math.min(3.8, Math.max(3.1, 3.1 + extraPairs * 0.18));
    currentRoomHalfX = roomHalfX;
    currentRoomHalfZ = roomHalfZ;

    const mrGlass = Glass();
    // West glass wall of meeting room
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.5, roomHalfZ * 2), mrGlass);
    westWall.position.set(MRX - roomHalfX, 1.75, MRZ);
    meetingRoomGroup.add(westWall);

    // South glass walls with doorway
    const doorHalfGap = 1.25;
    const southSegW = Math.max(1.8, roomHalfX - doorHalfGap);
    const southLeft = new THREE.Mesh(new THREE.BoxGeometry(southSegW, 3.5, 0.06), mrGlass);
    southLeft.position.set(MRX - roomHalfX + southSegW / 2, 1.75, MRZ + roomHalfZ);
    meetingRoomGroup.add(southLeft);

    const southRight = new THREE.Mesh(new THREE.BoxGeometry(southSegW, 3.5, 0.06), mrGlass);
    southRight.position.set(MRX + roomHalfX - southSegW / 2, 1.75, MRZ + roomHalfZ);
    meetingRoomGroup.add(southRight);

    // Corner frames
    [
      [MRX - roomHalfX, MRZ - roomHalfZ],
      [MRX - roomHalfX, MRZ + roomHalfZ],
      [MRX + roomHalfX, MRZ - roomHalfZ],
      [MRX + roomHalfX, MRZ + roomHalfZ],
    ].forEach(([fx, fz]) => {
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.5, 0.05), M(0x99AABB));
      f.position.set(fx, 1.75, fz);
      meetingRoomGroup.add(f);
    });

    // Parametric Conference Table
    const mt = new THREE.Mesh(new THREE.BoxGeometry(tableLen, 0.08, tableWidthZ), M(0xDDE4EC));
    mt.position.set(MRX + 0.2, 0.72, MRZ);
    mt.castShadow = true;
    mt.receiveShadow = true;
    meetingRoomGroup.add(mt);

    const legSpanX = tableLen / 2 - 0.45;
    const legSpanZ = tableWidthZ / 2 - 0.2;
    [
      [-legSpanX, -legSpanZ],
      [0, -legSpanZ],
      [legSpanX, -legSpanZ],
      [-legSpanX, legSpanZ],
      [0, legSpanZ],
      [legSpanX, legSpanZ],
    ].forEach(([tx, tz]) => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), M(0xBBCCDD));
      l.position.set(MRX + 0.2 + tx, 0.35, MRZ + tz);
      meetingRoomGroup.add(l);
    });

    // Rebuild meetSeats array for all totalAgentsCount seats
    meetSeats.length = 0;
    const headX = MRX + 0.2 - tableLen / 2 - 0.32;
    meetSeats.push({ x: headX, z: MRZ, ry: Math.PI / 2, isHead: true }); // Seat 0: Tariq

    const northCount = Math.ceil((totalAgentsCount - 1) / 2);
    const southCount = (totalAgentsCount - 1) - northCount;
    const startX = MRX + 0.2 - tableLen / 2 + 0.65;
    const endX = MRX + 0.2 + tableLen / 2 - 0.55;

    for (let i = 0; i < northCount; i++) {
      const ratio = northCount <= 1 ? 0.5 : i / (northCount - 1);
      const sx = startX + ratio * (endX - startX);
      meetSeats.push({ x: sx, z: MRZ - (tableWidthZ / 2 + 0.37), ry: 0, isHead: false });
    }
    for (let i = 0; i < southCount; i++) {
      const ratio = southCount <= 1 ? 0.5 : i / (southCount - 1);
      const sx = startX + ratio * (endX - startX);
      meetSeats.push({ x: sx, z: MRZ + (tableWidthZ / 2 + 0.37), ry: Math.PI, isHead: false });
    }

    meetSeats.forEach((s, idx) => {
      const ag = activeAgentsList[idx];
      const isExpansionSeat = idx >= 9;
      const chairColor = s.isHead ? 0x1E293B : isExpansionSeat ? 0x1E293B : 0x37474F;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.38), M(chairColor));
      seat.position.set(s.x, 0.42, s.z);
      meetingRoomGroup.add(seat);

      const bk = new THREE.Mesh(
        s.isHead
          ? new THREE.BoxGeometry(0.04, 0.38, 0.38)
          : new THREE.BoxGeometry(0.38, 0.34, 0.04),
        M(chairColor)
      );
      const bx = s.isHead ? s.x - 0.19 : s.x;
      const bz = s.isHead ? s.z : s.z + (s.ry === 0 ? -0.19 : 0.19);
      bk.position.set(bx, 0.61, bz);
      meetingRoomGroup.add(bk);

      // Highlight newly added expansion chairs with their agent's glowing neon accent bar
      if (ag && (isExpansionSeat || s.isHead)) {
        const topBar = new THREE.Mesh(
          s.isHead ? new THREE.BoxGeometry(0.05, 0.035, 0.36) : new THREE.BoxGeometry(0.36, 0.035, 0.05),
          MB(ag.color)
        );
        topBar.position.set(bx, 0.79, bz);
        meetingRoomGroup.add(topBar);
      }

      [-0.13, 0.13].forEach((ox) => {
        [-0.13, 0.13].forEach((oz) => {
          const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.03), M(0x90A4AE));
          l.position.set(s.x + ox, 0.2, s.z + oz);
          meetingRoomGroup.add(l);
        });
      });
    });

    // Whiteboard inside meeting room
    const wbB = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.15, 0.03), M(0xCCCCCC));
    wbB.position.set(MRX + 0.2, 2.2, MRZ - roomHalfZ + 0.15);
    meetingRoomGroup.add(wbB);

    drawWhiteboard(lastPubCount, lastGscImp, lastKwCount, totalAgentsCount);
    const wbm = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.92), new THREE.MeshBasicMaterial({ map: wbt }));
    wbm.position.set(MRX, 2.2, MRZ - roomHalfZ + 0.4);
    meetingRoomGroup.add(wbm);

    // Sync seated meeting characters positions and spawn any missing meetChar
    activeAgentsList.forEach((ag, i) => {
      const s = meetSeats[i] || meetSeats[0];
      if (!meetChars[i]) {
        const mc = buildChar(ag, false);
        mc.userData = { agentId: ag.id };
        mc.visible = false;
        office.add(mc);
        meetChars[i] = mc;
      }
      meetChars[i].position.set(s.x, 0, s.z);
      meetChars[i].rotation.y = s.isHead ? Math.PI / 2 : s.z < MRZ ? 0 : Math.PI;
    });
  }

  // Initial Meeting Room build for the 9 core agents
  expandMeetingRoomAndAddChair(activeAgentsList.length);

  // ═══════════════════════════════════════════════════
  // RECEPTION DESK (East Side Entrance Checkpoint)
  // ═══════════════════════════════════════════════════
  const reception = new THREE.Group();
  const RCX = 8, RCZ = 6.5;

  const rcDesk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.9, 0.6), M(0x1A2A3A));
  rcDesk.position.set(RCX, 0.45, RCZ);
  rcDesk.castShadow = true;
  reception.add(rcDesk);

  const rcTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 0.7), M(0xDDE4EC));
  rcTop.position.set(RCX, 0.92, RCZ);
  reception.add(rcTop);

  // VORDER SEO Logo on front of reception
  const logoCanvas = document.createElement('canvas');
  logoCanvas.width = 256;
  logoCanvas.height = 90;
  const lctx = logoCanvas.getContext('2d');
  if (lctx) {
    lctx.fillStyle = '#1A2A3A';
    lctx.fillRect(0, 0, 256, 90);
    lctx.fillStyle = '#0DEEF3';
    lctx.font = 'bold 26px monospace';
    lctx.textAlign = 'center';
    lctx.fillText('◈ VORDER SEO ◈', 128, 38);
    lctx.fillStyle = '#FFFFFF';
    lctx.font = '13px sans-serif';
    lctx.fillText('AUTONOMOUS AI SUITE', 128, 66);
  }
  const logoTex = new THREE.CanvasTexture(logoCanvas);
  logoTex.minFilter = THREE.LinearFilter;
  const rcLogoMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.6), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true }));
  rcLogoMesh.position.set(RCX, 0.5, RCZ + 0.31);
  reception.add(rcLogoMesh);

  // Underglow light
  const rcLight = new THREE.PointLight(0x0DEEF3, 0.4, 3.5, 2);
  rcLight.position.set(RCX, 0.1, RCZ + 0.5);
  reception.add(rcLight);

  // Reception terminal monitor
  const rcMonBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.03), M(0x2A2A2A));
  rcMonBody.position.set(RCX - 0.4, 1.35, RCZ + 0.08);
  reception.add(rcMonBody);

  office.add(reception);

  // ═══════════════════════════════════════════════════
  // WATER COOLER & SNACK AREA
  // ═══════════════════════════════════════════════════
  const wc = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.55, 0.28), M(0xE0E0E0));
  wc.position.set(-10, 0.28, 0);
  office.add(wc);

  // Water bottle on top
  const wcBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 16), new THREE.MeshPhysicalMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.6 }));
  wcBottle.position.set(-10, 0.75, 0);
  office.add(wcBottle);

  // Lounge Sofa Area
  const lounge = new THREE.Group();
  const SX = 10.5, SZ = 6;
  const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 2), M(0x37474F));
  sofaBase.position.set(SX, 0.175, SZ);
  lounge.add(sofaBase);
  const cTable = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 1), M(0xDDE4EC));
  cTable.position.set(SX - 0.7, 0.38, SZ);
  lounge.add(cTable);
  office.add(lounge);

  // ═══════════════════════════════════════════════════
  // TARIQ PULSE RING (At Desk 0)
  // ═══════════════════════════════════════════════════
  const tariqDesk = desks[0];
  const pulseRing = new THREE.Mesh(
    new THREE.RingGeometry(1.3, 1.33, 32),
    new THREE.MeshBasicMaterial({ color: 0x0DEEF3, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  pulseRing.rotation.x = -Math.PI / 2;
  pulseRing.position.set(tariqDesk.x, 0.02, tariqDesk.z + 0.2);
  office.add(pulseRing);

  // ═══════════════════════════════════════════════════
  // 2D NAVIGATION GRID & A* PATHFINDING ENGINE (Zero Teleportation & Zero Wall Clipping)
  // ═══════════════════════════════════════════════════
  const NAV_MIN_X = -12.0;
  const NAV_MAX_X = 12.0;
  const NAV_MIN_Z = -9.0;
  const NAV_MAX_Z = 9.0;
  const NAV_CELL = 0.45;
  const NAV_COLS = Math.ceil((NAV_MAX_X - NAV_MIN_X) / NAV_CELL);
  const NAV_ROWS = Math.ceil((NAV_MAX_Z - NAV_MIN_Z) / NAV_CELL);
  const navBlocked = new Uint8Array(NAV_COLS * NAV_ROWS);

  function worldToGrid(x: number, z: number): { c: number; r: number } {
    const c = Math.max(0, Math.min(NAV_COLS - 1, Math.floor((x - NAV_MIN_X) / NAV_CELL)));
    const r = Math.max(0, Math.min(NAV_ROWS - 1, Math.floor((z - NAV_MIN_Z) / NAV_CELL)));
    return { c, r };
  }

  function gridToWorld(c: number, r: number): { x: number; z: number } {
    return {
      x: Number((NAV_MIN_X + (c + 0.5) * NAV_CELL).toFixed(2)),
      z: Number((NAV_MIN_Z + (r + 0.5) * NAV_CELL).toFixed(2)),
    };
  }

  function markRectBlocked(minX: number, maxX: number, minZ: number, maxZ: number, blocked = 1) {
    const p1 = worldToGrid(minX, minZ);
    const p2 = worldToGrid(maxX, maxZ);
    for (let r = Math.min(p1.r, p2.r); r <= Math.max(p1.r, p2.r); r++) {
      for (let c = Math.min(p1.c, p2.c); c <= Math.max(p1.c, p2.c); c++) {
        navBlocked[r * NAV_COLS + c] = blocked;
      }
    }
  }

  function rebuildNavGridObstacles() {
    navBlocked.fill(0);
    // 1. Block all workstation desk surfaces (while leaving chair positions at az + 0.55 walkable)
    desks.forEach((d) => {
      if (!d) return;
      markRectBlocked(d.x - 0.82, d.x + 0.82, d.z - 0.46, d.z + 0.24, 1);
    });
    // 2. Block reception desk & water cooler
    markRectBlocked(RCX - 1.35, RCX + 1.35, RCZ - 0.38, RCZ + 0.38, 1);
    markRectBlocked(-10.3, -9.7, -0.3, 0.3, 1);

    // 3. Block meeting room glass walls EXCEPT the South Doorway gap (x in [MRX - 1.15, MRX + 1.15])
    const sideAgents = Math.max(8, activeAgentsList.length - 1);
    const sidePairs = Math.ceil(sideAgents / 2);
    const extraPairs = Math.max(0, sidePairs - 4);
    const tableLen = 5.2 + extraPairs * 0.95;
    const tableWidthZ = 1.7 + Math.min(0.35, extraPairs * 0.1);
    const roomHalfX = Math.max(3.7, tableLen / 2 + 1.15);
    const roomHalfZ = Math.max(3.1, 3.1 + extraPairs * 0.22);

    // West wall of meeting room
    markRectBlocked(MRX - roomHalfX - 0.22, MRX - roomHalfX + 0.22, MRZ - roomHalfZ, MRZ + roomHalfZ, 1);
    // South wall left & right of doorway
    markRectBlocked(MRX - roomHalfX, MRX - 1.15, MRZ + roomHalfZ - 0.22, MRZ + roomHalfZ + 0.22, 1);
    markRectBlocked(MRX + 1.15, MRX + roomHalfX, MRZ + roomHalfZ - 0.22, MRZ + roomHalfZ + 0.22, 1);
    // Conference table surface (leaving chairs around it walkable)
    markRectBlocked(
      MRX + 0.2 - tableLen / 2 - 0.12,
      MRX + 0.2 + tableLen / 2 + 0.12,
      MRZ - tableWidthZ / 2 - 0.12,
      MRZ + tableWidthZ / 2 + 0.12,
      1
    );
    // Ensure doorway corridor is explicitly open
    markRectBlocked(MRX - 1.05, MRX + 1.05, MRZ + roomHalfZ - 0.5, MRZ + roomHalfZ + 0.5, 0);
  }
  rebuildNavGridObstacles();

  function findSmoothPath(
    startX: number,
    startZ: number,
    goalX: number,
    goalZ: number
  ): Array<{ x: number; z: number }> {
    const start = worldToGrid(startX, startZ);
    const goal = worldToGrid(goalX, goalZ);
    if (start.c === goal.c && start.r === goal.r) {
      return [{ x: goalX, z: goalZ }];
    }

    const total = NAV_COLS * NAV_ROWS;
    const gScore = new Float32Array(total).fill(Infinity);
    const fScore = new Float32Array(total).fill(Infinity);
    const cameFrom = new Int32Array(total).fill(-1);
    const closed = new Uint8Array(total);
    const open: number[] = [];

    const startIdx = start.r * NAV_COLS + start.c;
    const goalIdx = goal.r * NAV_COLS + goal.c;
    gScore[startIdx] = 0;
    fScore[startIdx] = Math.hypot(goal.c - start.c, goal.r - start.r);
    open.push(startIdx);

    const dirs = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, 1.414],
      [-1, 1, 1.414],
      [1, -1, 1.414],
      [-1, -1, 1.414],
    ];

    let found = false;
    let iterations = 0;
    while (open.length > 0 && iterations < 1600) {
      iterations++;
      let bestPos = 0;
      for (let i = 1; i < open.length; i++) {
        if (fScore[open[i]] < fScore[open[bestPos]]) bestPos = i;
      }
      const current = open.splice(bestPos, 1)[0];
      if (current === goalIdx) {
        found = true;
        break;
      }
      closed[current] = 1;
      const cr = Math.floor(current / NAV_COLS);
      const cc = current % NAV_COLS;

      for (const [dc, dr, cost] of dirs) {
        const nc = cc + dc;
        const nr = cr + dr;
        if (nc < 0 || nc >= NAV_COLS || nr < 0 || nr >= NAV_ROWS) continue;
        const nIdx = nr * NAV_COLS + nc;
        if (closed[nIdx]) continue;
        // Allow stepping onto startIdx or goalIdx even if near a desk edge
        if (navBlocked[nIdx] && nIdx !== goalIdx && nIdx !== startIdx) continue;

        const tentativeG = gScore[current] + cost;
        if (tentativeG < gScore[nIdx]) {
          cameFrom[nIdx] = current;
          gScore[nIdx] = tentativeG;
          fScore[nIdx] = tentativeG + Math.hypot(goal.c - nc, goal.r - nr);
          if (!open.includes(nIdx)) open.push(nIdx);
        }
      }
    }

    if (!found) {
      // Fallback via safe central corridor & doorway
      return [
        { x: startX, z: Math.max(startZ, 3.2) },
        { x: MRX, z: 1.2 },
        { x: goalX, z: goalZ },
      ];
    }

    const rawPath: Array<{ x: number; z: number }> = [];
    let curr = goalIdx;
    while (curr !== -1 && curr !== startIdx) {
      const r = Math.floor(curr / NAV_COLS);
      const c = curr % NAV_COLS;
      rawPath.push(gridToWorld(c, r));
      curr = cameFrom[curr];
    }
    rawPath.reverse();

    // Downsample every 2nd waypoint for natural smooth stride + exact goal
    const smoothed: Array<{ x: number; z: number }> = [];
    for (let i = 0; i < rawPath.length; i += 2) {
      smoothed.push(rawPath[i]);
    }
    smoothed.push({ x: goalX, z: goalZ });
    return smoothed;
  }

  // ═══════════════════════════════════════════════════
  // 3D 8-PLATFORM SERVER RACKS WALL (East Wing Live Infrastructure Telemetry)
  // ═══════════════════════════════════════════════════
  const serverWallGroup = new THREE.Group();
  office.add(serverWallGroup);
  const serverRackUnits: Array<{
    id: string;
    label: string;
    status: 'LIVE' | 'KV_CACHE' | 'UNLINKED';
    metricText: string;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    tex: THREE.CanvasTexture;
    ledStrip: THREE.Mesh;
    pointLight: THREE.PointLight;
  }> = [];

  const DEFAULT_11_PLATFORMS: Array<{
    id: string;
    label: string;
    status: 'LIVE' | 'KV_CACHE' | 'UNLINKED';
    metricText: string;
  }> = [
    { id: 'gsc', label: '1. Search Console', status: 'LIVE', metricText: 'Search Console Live' },
    { id: 'ga4', label: '2. Analytics GA4', status: 'LIVE', metricText: 'GA4 Analytics Live' },
    { id: 'google_ads', label: '3. Google Ads API', status: 'LIVE', metricText: 'Keywords Store Live' },
    { id: 'google_ai_studio', label: '4. Gemini 2.5 AI', status: 'LIVE', metricText: '6 Models • OAuth' },
    { id: 'supabase', label: '5. Supabase DB', status: 'LIVE', metricText: 'Vector Sync OK' },
    { id: 'github', label: '6. GitHub CI/CD', status: 'LIVE', metricText: 'Workflows Guarded' },
    { id: 'vercel', label: '7. Vercel Edge', status: 'LIVE', metricText: 'Dynamic Blog Routes' },
    { id: 'cloudflare', label: '8. Cloudflare D1+KV', status: 'LIVE', metricText: '5 Indexes • Shield' },
    { id: 'clerk', label: '9. Clerk Identity', status: 'LIVE', metricText: 'Auth Shield Active' },
    { id: 'camber', label: '10. Camber Cloud', status: 'LIVE', metricText: 'Pods Engine Ready' },
    { id: 'tavily', label: '11. Tavily Grounding', status: 'LIVE', metricText: 'Web Grounding Live' },
  ];

  function renderServerRackCanvas(unit: (typeof serverRackUnits)[number]) {
    const ctx = unit.ctx;
    if (!ctx) return;
    const w = unit.canvas.width;
    const h = unit.canvas.height;
    ctx.fillStyle = '#070D19';
    ctx.fillRect(0, 0, w, h);

    const statusColor =
      unit.status === 'LIVE' ? '#00E676' : unit.status === 'KV_CACHE' ? '#F59E0B' : '#EF4444';
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(unit.label, 10, 24);

    ctx.fillStyle = statusColor;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`● ${unit.status}`, 10, 46);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '11px monospace';
    ctx.fillText(unit.metricText.slice(0, 22), 10, 68);
    unit.tex.needsUpdate = true;
  }

  function spawn8PlatformServerWall() {
    const baseX = 11.85;
    const startZ = 0.35;
    const spacingZ = 0.76;

    DEFAULT_11_PLATFORMS.forEach((plat, idx) => {
      const rz = startZ + idx * spacingZ;
      const rack = new THREE.Group();

      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.68, 0.70), M(0x0F172A));
      cabinet.position.set(baseX, 0.84, rz);
      cabinet.castShadow = true;
      rack.add(cabinet);

      const ledColor = plat.status === 'LIVE' ? 0x00E676 : plat.status === 'KV_CACHE' ? 0xF59E0B : 0xEF4444;
      const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.52, 0.04), MB(ledColor));
      ledStrip.position.set(baseX - 0.24, 0.84, rz - 0.32);
      rack.add(ledStrip);

      const cv = document.createElement('canvas');
      cv.width = 180;
      cv.height = 84;
      const ctx = cv.getContext('2d');
      const tex = new THREE.CanvasTexture(cv);
      tex.minFilter = THREE.LinearFilter;

      const screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.68, 0.34),
        new THREE.MeshBasicMaterial({ map: tex })
      );
      screenMesh.rotation.y = -Math.PI / 2;
      screenMesh.position.set(baseX - 0.24, 1.25, rz);
      rack.add(screenMesh);

      const pLight = new THREE.PointLight(ledColor, 0.22, 2.2, 2);
      pLight.position.set(baseX - 0.4, 1.1, rz);
      rack.add(pLight);

      serverWallGroup.add(rack);
      const unit = {
        id: plat.id,
        label: plat.label,
        status: plat.status,
        metricText: plat.metricText,
        canvas: cv,
        ctx,
        tex,
        ledStrip,
        pointLight: pLight,
      };
      renderServerRackCanvas(unit);
      serverRackUnits.push(unit);
    });
  }
  spawn8PlatformServerWall();

  function update8PlatformServerRacks(
    racks?: Array<{ id: string; label?: string; status: 'LIVE' | 'KV_CACHE' | 'UNLINKED'; metricText?: string }>
  ) {
    if (!Array.isArray(racks)) return;
    racks.forEach((r) => {
      const unit = serverRackUnits.find((u) => u.id === r.id);
      if (!unit) return;
      unit.status = r.status || 'LIVE';
      if (r.metricText) unit.metricText = r.metricText;
      const colHex = unit.status === 'LIVE' ? 0x00E676 : unit.status === 'KV_CACHE' ? 0xF59E0B : 0xEF4444;
      (unit.ledStrip.material as THREE.MeshBasicMaterial).color.setHex(colHex);
      unit.pointLight.color.setHex(colHex);
      renderServerRackCanvas(unit);
    });
  }

  // ═══════════════════════════════════════════════════
  // 3D GLOWING DATA PACKET BEAMS BETWEEN AGENT DESKS (QuadraticBezierCurve3)
  // ═══════════════════════════════════════════════════
  const activeDataPulses: Array<{
    curve: THREE.QuadraticBezierCurve3;
    packetMesh: THREE.Mesh;
    lineMesh: THREE.Line;
    progress: number;
    speed: number;
  }> = [];

  function spawn3DDataPulseBetweenDesks(fromIdx: number, toIdx: number, colorHex = 0x0DEEF3) {
    const d1 = desks[fromIdx] || desks[0];
    const d2 = desks[toIdx] || desks[1];
    if (!d1 || !d2) return;

    const pStart = new THREE.Vector3(d1.x, 1.25, d1.z - 0.15);
    const pEnd = new THREE.Vector3(d2.x, 1.25, d2.z - 0.15);
    const mid = new THREE.Vector3((d1.x + d2.x) / 2, 2.55, (d1.z + d2.z) / 2);
    const curve = new THREE.QuadraticBezierCurve3(pStart, mid, pEnd);

    const points = curve.getPoints(24);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.45,
    });
    const lineMesh = new THREE.Line(lineGeo, lineMat);
    office.add(lineMesh);

    const packetGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const packetMesh = new THREE.Mesh(packetGeo, packetMat);
    packetMesh.position.copy(pStart);
    office.add(packetMesh);

    activeDataPulses.push({
      curve,
      packetMesh,
      lineMesh,
      progress: 0,
      speed: 0.55,
    });
  }

  function update3DDataPulses(delta: number) {
    for (let i = activeDataPulses.length - 1; i >= 0; i--) {
      const p = activeDataPulses[i];
      p.progress += delta * p.speed;
      if (p.progress >= 1) {
        office.remove(p.packetMesh);
        office.remove(p.lineMesh);
        p.packetMesh.geometry.dispose();
        (p.packetMesh.material as THREE.Material).dispose();
        p.lineMesh.geometry.dispose();
        (p.lineMesh.material as THREE.Material).dispose();
        activeDataPulses.splice(i, 1);
      } else {
        const pt = p.curve.getPointAt(p.progress);
        p.packetMesh.position.copy(pt);
      }
    }
  }

  // ═══════════════════════════════════════════════════
  // WATER COOLER CHAT BUBBLES (Distinct Agent Personalities — Zero VRAM Leak)
  // ═══════════════════════════════════════════════════
  const chatBubbles: any[] = [];
  const arabicChatPhrases = [
    'المدونة والسايت ماب وD1 متطابقين 100% وطابور النشر 100/100 🚀',
    'صحة الموقع Site Audit ثابتة عند 100% بدون أي تحذير تقني 🛡️',
    'كونسول مسجل 40 ظهور فعلي بمتوسط ترتيب 9.4 في التصاعد 📈',
    'سرعة العرض شغالة بوضع TURBO_3X في السعودية ومصر والخليج ✨',
    'فقرات الإجابة المباشرة GEO رفعت جاهزية الاقتباس في AI Overviews 🧠',
    'شبكة الروابط الداخلية بتغذي صفحات الـ Striking Distance تلقائياً 🔗',
    'فلتر ذاكرة المالك في D1 نشط ويمنع أي جمل مرفوضة فوراً ⚡',
    'درع حماية D1 (5 فهارس مركبة + لقطة OAUTH_KV) يحمي الحصة اليومية 100% 🔒',
  ];

  let meetingBreakDialogues: Array<{ idx: number; text: string }> = [
    { idx: 0, text: 'طارق: اجتماع المراجعة اللحظية — نراجع تسريع الـ 40 ظهور في كونسول! 🎙️' },
    { idx: 5, text: 'ليلى: هندسياً مؤشرات CWV والـ Schema وSite Audit عند 100%! 🛡️' },
    { idx: 4, text: 'كريم: خط النشر شغال بأقصى سرعة والسايت ماب وIndexNow متزامنين! ⚡' },
    { idx: 2, text: 'ياسمين: اصطدت تكتلات كلمات جديدة في منطقة Striking Distance! 📈' },
    { idx: 1, text: 'سارة: بلغة الـ ROAS رفعنا سرعة العرض إلى TURBO_3X في الأسواق النشطة! 🎯' },
    { idx: 7, text: 'نور: دعمت المقالات بفقرات Direct Answer لرفع اقتباسات Perplexity! 🧠' },
    { idx: 3, text: 'عمر: ضاعفت تدفق الـ Internal PageRank للصفحات المحققة للظهور! 🔗' },
    { idx: 6, text: 'فارس: حصص الرياض وجدة والقاهرة ودبي مضبوطة إقليمياً بدقة! 📍' },
    { idx: 8, text: 'زياد: سجلات الرقابة ودرع حماية D1 في OAUTH_KV موثقة ومحمية 100%! 🔒' },
  ];

  function createBubble(x: number, y: number, z: number, text: string, color: string) {
    const bc = document.createElement('canvas');
    bc.width = 340;
    bc.height = 60;
    const bx = bc.getContext('2d');
    if (bx) {
      bx.fillStyle = 'rgba(10, 22, 40, 0.92)';
      bx.beginPath();
      bx.roundRect(4, 4, 332, 52, 12);
      bx.fill();
      bx.strokeStyle = color;
      bx.lineWidth = 2;
      bx.stroke();

      bx.font = 'bold 12px Tajawal, Cairo, sans-serif';
      bx.fillStyle = color;
      bx.textAlign = 'center';
      bx.fillText(text.slice(0, 62), 170, 34);
    }
    const btex = new THREE.CanvasTexture(bc);
    btex.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: btex, transparent: true, depthTest: false }));
    sprite.scale.set(2.0, 0.38, 1);
    sprite.position.set(x, y + 0.25, z);
    office.add(sprite);
    chatBubbles.push({ sprite, life: 4.0, startY: y + 0.25 });
  }

  function checkConversations() {
    for (let i = 0; i < agentData.length; i++) {
      const a = agentData[i];
      if (!a.walker.visible) continue;
      for (let j = i + 1; j < agentData.length; j++) {
        const b = agentData[j];
        if (!b.walker.visible) continue;
        const dx = a.walker.position.x - b.walker.position.x;
        const dz = a.walker.position.z - b.walker.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.5 && !a._chatCooldown && !b._chatCooldown) {
          const mx = (a.walker.position.x + b.walker.position.x) / 2;
          const mz = (a.walker.position.z + b.walker.position.z) / 2;
          const phrase = rng.pick(arabicChatPhrases);
          createBubble(mx, 1.4, mz, phrase, a.agent.hex);
          a._chatCooldown = 10;
          b._chatCooldown = 10;
        }
      }
      if (a._chatCooldown) a._chatCooldown -= 0.016;
      if (a._chatCooldown < 0) a._chatCooldown = 0;
    }
  }

  function updateBubbles(delta: number) {
    for (let i = chatBubbles.length - 1; i >= 0; i--) {
      const b = chatBubbles[i];
      b.life -= delta;
      b.sprite.position.y = b.startY + (4.0 - b.life) * 0.12;
      b.sprite.material.opacity = Math.max(0, b.life / 4.0);
      if (b.life <= 0) {
        office.remove(b.sprite);
        if (b.sprite.material.map) {
          b.sprite.material.map.dispose();
        }
        b.sprite.material.dispose();
        chatBubbles.splice(i, 1);
      }
    }
  }

  // ═══════════════════════════════════════════════════
  // WALKING, A* PATHWAY NAVIGATION & PEER-TO-PEER TASK HANDOVER ENGINE
  // ═══════════════════════════════════════════════════
  const walkDestinations = [
    { x: 2, z: 7.5, label: '🚶 يتفقد الممر الجنوبي' },
    { x: -10, z: 0, label: '💧 يتوجه لمبرد المياه' },
    { x: -2, z: -7, label: '🪟 يراجع المؤشرات عند النافذة' },
    { x: 11.0, z: 4.2, label: '🖥️ يفحص جدار السيرفرات للمنصات الـ 8' },
    { x: -6, z: 7, label: '🚶 جولة تفقدية في القسم' },
    { x: 3, z: 0, label: '🤝 ينسق مهمة سريعة بالوسط' },
    { x: 8, z: 5.5, label: '🛡️ يتفقد بوابة الاستقبال والأمان' },
    { x: 10.5, z: 6, label: '☕ استراحة قصيرة في الصالة' },
  ];

  function animateWalkerLimbs(walker: THREE.Group, speedFactor = 1) {
    const t = performance.now() * 0.012 * speedFactor;
    walker.children.forEach((c: any) => {
      if (c.userData && c.userData.isLeg) {
        c.position.z = Math.sin(t + c.userData.phase) * 0.085;
      }
      if (c.userData && c.userData.isWalkerArm) {
        c.rotation.x = Math.sin(t + c.userData.phase) * 0.38;
      }
    });
  }

  function resetWalkerLimbs(walker: THREE.Group) {
    walker.children.forEach((c: any) => {
      if (c.userData && c.userData.isLeg) c.position.z = 0;
      if (c.userData && c.userData.isWalkerArm) c.rotation.x = 0;
    });
  }

  function advanceAlongPathQueue(ad: any, delta: number, moveSpeed = 2.25): boolean {
    if (!ad.pathQueue || ad.pathQueue.length === 0) {
      if (!ad.walkTarget) return true;
      ad.pathQueue = [ad.walkTarget];
    }
    const target = ad.pathQueue[0];
    const dx = target.x - ad.walker.position.x;
    const dz = target.z - ad.walker.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.22) {
      ad.pathQueue.shift();
      if (ad.pathQueue.length === 0) {
        ad.walker.position.set(target.x, 0, target.z);
        return true;
      }
      return false;
    }
    const step = Math.min(dist, moveSpeed * delta);
    const nx = dx / dist;
    const nz = dz / dist;
    ad.walker.position.x += nx * step;
    ad.walker.position.z += nz * step;
    ad.walker.rotation.y = Math.atan2(nx, nz);
    animateWalkerLimbs(ad.walker, moveSpeed / 1.6);
    ad.label.position.set(ad.walker.position.x, 1.4, ad.walker.position.z);
    return false;
  }

  function triggerAgentTaskHandoverWalk(fromIdx: number, toIdx: number, taskLabel: string) {
    if (inMeeting) return;
    const sender = agentData[fromIdx];
    const receiver = agentData[toIdx];
    if (!sender || !receiver) return;

    // Always fire a 3D glowing data packet arc between their desks immediately!
    spawn3DDataPulseBetweenDesks(fromIdx, toIdx, sender.agent.color);

    // If sender is sitting at their desk, have them physically walk to receiver's desk along A* path
    if (sender.state === 'sitting') {
      sender.state = 'walking_handover_to_peer';
      sender.sittingChar.visible = false;
      sender.walker.visible = true;
      sender.walker.position.set(sender.home.x, 0, sender.home.z);
      const targetPos = { x: receiver.home.x + 0.55, z: receiver.home.z + 0.25 };
      sender.pathQueue = findSmoothPath(sender.home.x, sender.home.z, targetPos.x, targetPos.z);
      sender.walkTarget = targetPos;
      sender.walkDestinationLabel = `⚡ يسلم مهمة لـ ${receiver.agent.name.split(' ')[0]}: ${taskLabel.slice(0, 28)}`;
      sender.handoverPeerIdx = toIdx;
      sender.handoverTaskLabel = taskLabel;
      sender.walkPause = 0;
      sender.renderLabelCanvas(sender.liveProgressPct || 88, sender.walkDestinationLabel);
    }
  }

  function updateWalkers(delta: number) {
    const totalSeats = activeAgentsList.length;
    agentData.forEach((ad, idx) => {
      // 1. Walking along A* Path to Meeting Room Chair (Zero Teleportation!)
      if (ad.state === 'walking_to_meeting_chair') {
        const arrived = advanceAlongPathQueue(ad, delta, 2.85);
        if (arrived) {
          const seat = meetSeats[idx] || meetSeats[0];
          ad.state = 'meeting';
          ad.walker.visible = false;
          resetWalkerLimbs(ad.walker);
          if (meetChars[idx]) {
            meetChars[idx].visible = true;
          }
          ad.label.position.set(seat.x, 1.85, seat.z);
          ad.renderLabelCanvas(100, `🎙️ جالس على مقعده #${idx + 1} (${totalSeats} كراسي)`);
        }
        return;
      }

      // 2. Walking along A* Path from Meeting Room Chair back to Desk
      if (ad.state === 'walking_from_meeting_to_desk') {
        const arrived = advanceAlongPathQueue(ad, delta, 2.65);
        if (arrived) {
          ad.state = 'sitting';
          ad.walker.visible = false;
          resetWalkerLimbs(ad.walker);
          ad.sittingChar.visible = true;
          ad.label.position.set(ad.home.x, 1.85, ad.home.z);
          ad.timer = 10 + rng.r(0, 16);
          const pct = ad.liveProgressPct || 85;
          const badge = ad.liveBadgeAr || ad.badgeOptions?.[0] || '⚡ ينفذ مهامه الحية';
          ad.renderLabelCanvas(pct, `${badge} (${pct}%)`);
        }
        return;
      }

      // 3. Peer-to-Peer Task Handover Walk between Agent Desks
      if (ad.state === 'walking_handover_to_peer') {
        const arrived = advanceAlongPathQueue(ad, delta, 2.35);
        if (arrived) {
          if (ad.walkPause === 0) {
            resetWalkerLimbs(ad.walker);
            const peer = agentData[ad.handoverPeerIdx ?? 0];
            const peerName = peer?.agent?.name?.split(' ')[0] || 'زميله';
            createBubble(
              ad.walker.position.x,
              1.5,
              ad.walker.position.z,
              `🤝 تسليم مهمة لـ ${peerName}: ${String(ad.handoverTaskLabel || '').slice(0, 38)}`,
              ad.agent.hex
            );
            ad.renderLabelCanvas(ad.liveProgressPct || 90, `🤝 يسلم المخرجات إلى ${peerName}`);
          }
          ad.walkPause += delta;
          if (ad.walkPause > 2.4) {
            ad.state = 'walking_back';
            ad.pathQueue = findSmoothPath(ad.walker.position.x, ad.walker.position.z, ad.home.x, ad.home.z);
            ad.renderLabelCanvas(ad.liveProgressPct || 92, `🚶 يعود لمكتبه بعد تسليم المهمة (${ad.liveProgressPct || 92}%)`);
          }
        }
        return;
      }

      if (ad.state === 'sitting') {
        ad.timer -= delta;
        if (ad.timer <= 0) {
          ad.state = 'walking_out';
          ad.sittingChar.visible = false;
          ad.walker.visible = true;
          ad.walker.position.set(ad.home.x, 0, ad.home.z);

          let dest: { x: number; z: number; label?: string };
          if (ad.agent.id === 8 && rng.n() > 0.35) {
            if (rng.n() > 0.5) {
              dest = { x: 11.0, z: 4.2, label: '🖥️ يفحص جدار المنصات الـ 8 ودرع D1' };
            } else {
              const peerIdx = rng.i(0, Math.min(8, desks.length - 1));
              const peerDesk = desks[peerIdx];
              spawn3DDataPulseBetweenDesks(ad.agent.id, peerIdx, ad.agent.color);
              dest = { x: peerDesk.x + 0.5, z: peerDesk.z + 0.3, label: '🔍 يراجع جودة المخرجات مع زميله' };
            }
          } else {
            dest = rng.pick(walkDestinations);
          }

          const targetX = dest.x + rng.r(-0.3, 0.3);
          const targetZ = dest.z + rng.r(-0.3, 0.3);
          ad.walkTarget = { x: targetX, z: targetZ };
          ad.pathQueue = findSmoothPath(ad.home.x, ad.home.z, targetX, targetZ);
          ad.walkDestinationLabel = dest.label || '🚶 يتحرك داخل المكتب';
          ad.walkPause = 0;
          ad.renderLabelCanvas(ad.liveProgressPct || 80, ad.walkDestinationLabel);
        }
      } else if (ad.state === 'walking_out') {
        const arrived = advanceAlongPathQueue(ad, delta, 1.85);
        if (arrived) {
          if (ad.walkPause === 0) {
            resetWalkerLimbs(ad.walker);
            ad.renderLabelCanvas(
              ad.liveProgressPct || 85,
              ad.walkDestinationLabel.replace('يتوجه', 'في استراحة عند').replace('يتحرك', 'ينسق الآن')
            );
          }
          ad.walkPause += delta;
          if (ad.walkPause > 2.8 + rng.r(0, 2.5)) {
            ad.state = 'walking_back';
            ad.pathQueue = findSmoothPath(ad.walker.position.x, ad.walker.position.z, ad.home.x, ad.home.z);
            ad.renderLabelCanvas(ad.liveProgressPct || 88, `🚶 يعود لمكتبه عبر الممر (${ad.liveProgressPct || 88}%)`);
          }
        }
      } else if (ad.state === 'walking_back') {
        const arrived = advanceAlongPathQueue(ad, delta, 1.95);
        if (arrived) {
          ad.state = 'sitting';
          ad.walker.visible = false;
          resetWalkerLimbs(ad.walker);
          ad.sittingChar.visible = true;
          ad.label.position.set(ad.home.x, 1.85, ad.home.z);
          ad.timer = 12 + rng.r(0, 18);
          const pct = ad.liveProgressPct || 85;
          const badge = ad.liveBadgeAr || ad.badgeOptions?.[0] || '⚡ ينفذ مهامه الحية';
          ad.renderLabelCanvas(pct, `${badge} (${pct}%)`);
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // FUNCTION 3: generateUniqueAgentMorphologyAndSpawn(nomination, newIndex)
  // Generates a 100% unique 8-axis 3D appearance & wardrobe, then calls Function 1 & Function 2!
  // ═══════════════════════════════════════════════════
  function hslToHexColor(hDeg: number, sPct: number, lPct: number): { num: number; hex: string } {
    const c = new THREE.Color();
    c.setHSL(((hDeg % 360) + 360) % 360 / 360, sPct / 100, lPct / 100);
    return { num: c.getHex(), hex: `#${c.getHexString().toUpperCase()}` };
  }

  function generateUniqueAgentMorphologyAndSpawn(nomination: any, newIndex: number): VorderAgentConfig {
    const seed = typeof nomination?.seedIndex === 'number' ? nomination.seedIndex : newIndex;
    const goldenHue = (seed * 137.508 + 28) % 360;
    const primaryTone = hslToHexColor(goldenHue, 88, 56);
    const shirtTone = hslToHexColor((goldenHue + 18) % 360, 68, 32);
    const vestTone = hslToHexColor((goldenHue + 195) % 360, 52, 20);
    const pantsTone = hslToHexColor((goldenHue + 210) % 360, 35, 15);
    const hairTone = hslToHexColor((seed * 67) % 360, 42, 18 + (seed % 3) * 8);

    const SKIN_TONES = [0xF5D6BE, 0xEDD0B7, 0xDFB995, 0xC99E76, 0xB3835B, 0x8D5B3C];
    const HAIR_STYLES: Array<NonNullable<VorderAgentConfig['hairStyle']>> = [
      'spiky_tech',
      'beanie_cap',
      'curly_volume',
      'ponytail',
      'hijab_wrap',
      'executive_part',
    ];
    const OUTFIT_STYLES: Array<NonNullable<VorderAgentConfig['outfitStyle']>> = [
      'trainee_tactical_vest',
      'tech_hoodie',
      'cyber_turtleneck',
      'double_breasted_vest',
      'open_blazer_tie',
    ];
    const ACCESSORIES: Array<NonNullable<VorderAgentConfig['accessory']>> = [
      'ar_visor',
      'headset_mic',
      'dual_lanyard',
      'glasses_thin',
    ];
    const SCREENS: Array<VorderAgentConfig['screen']> = [
      'terminal',
      'charts',
      'strategy',
      'map',
      'deploy',
      'docs',
      'palette',
      'bugs',
    ];
    const AVATARS = [
      '/game-assets/avatars/agent_03_kareem.png',
      '/game-assets/avatars/agent_05_fahd.png',
      '/game-assets/avatars/agent_07_omar.png',
      '/game-assets/avatars/agent_08_nadine.png',
      '/game-assets/avatars/agent_04_ziad.png',
    ];

    const chosenOutfit = OUTFIT_STYLES[(seed * 3) % OUTFIT_STYLES.length];
    const chosenHair = HAIR_STYLES[(seed * 5) % HAIR_STYLES.length];
    const chosenAccessory = ACCESSORIES[(seed * 7) % ACCESSORIES.length];

    const newAgent: VorderAgentConfig = {
      id: newIndex,
      nominationId: nomination?.id || `nom_exp_${newIndex}`,
      name: nomination?.agentName || `وكيل توسع #${newIndex - 8}`,
      nameEn: nomination?.title || `Expansion Specialist #${newIndex - 8}`,
      role: nomination?.title || 'وكيل توسع متخصص ومعتمد',
      roleEn: nomination?.proposedByRole || 'Autonomous Expansion Agent',
      color: primaryTone.num,
      hex: primaryTone.hex,
      screen: SCREENS[seed % SCREENS.length],
      hair: hairTone.num,
      shirt: shirtTone.num,
      pants: pantsTone.num,
      skinTone: SKIN_TONES[(seed * 5) % SKIN_TONES.length],
      hairStyle: chosenHair,
      outfitStyle: chosenOutfit,
      vestOrJacketColor: vestTone.num,
      tieOrAccentColor: primaryTone.num,
      accessory: chosenAccessory,
      shoeColor: 0x111827,
      heightScale: Number((0.95 + ((seed * 11) % 13) * 0.01).toFixed(2)),
      shoulderScale: Number((0.94 + ((seed * 7) % 14) * 0.01).toFixed(2)),
      isExpansionTrainee: true,
      visualProfileSummary:
        nomination?.visualProfileSummary ||
        `مظهر 3D فريد (${chosenOutfit} + ${chosenHair} + ${chosenAccessory}) بلون ${primaryTone.hex}`,
      avatarUrl: AVATARS[seed % AVATARS.length],
      metrics: nomination?.expectedImpact || 'مكتب مستقل بكمبيوتر حي • مقعد رسمي في غرفة الاجتماعات',
    };

    activeAgentsList[newIndex] = newAgent;

    // 1. Call Function 1: Spawn new workstation with illuminated 3D PC tower, live monitor & chair
    spawnAgentWorkstationWithPC(newAgent, newIndex);

    // 2. Call Function 2: Expand meeting room, extend conference table & add new chair
    expandMeetingRoomAndAddChair(activeAgentsList.length);
    rebuildNavGridObstacles();

    // 3. Register in live meeting & office dialogues
    const shortName = newAgent.name.split(' ')[0];
    meetingBreakDialogues.push({
      idx: newIndex,
      text: `${shortName}: مكتبي وحاسوبي جاهزين وبنفذ مهام ${newAgent.role.slice(0, 25)} فوراً! 🚀`,
    });
    liveOfficeActivities.push(
      `🚀 ${newAgent.name} (${newAgent.role}) يعمل من مكتبه الجديد رقم #${newIndex + 1} ويدعم مؤشرات D1`
    );

    // 4. If currently in a meeting, walk the new agent along the A* path to their new chair!
    if (inMeeting) {
      const seat = meetSeats[newIndex] || meetSeats[0];
      const ad = agentData[newIndex];
      if (ad) {
        ad.sittingChar.visible = false;
        ad.walker.visible = true;
        ad.walker.position.set(ad.home.x, 0, ad.home.z);
        ad.pathQueue = [
          ...findSmoothPath(ad.home.x, ad.home.z, MRX, 0.35),
          { x: seat.x, z: seat.z },
        ];
        ad.state = 'walking_to_meeting_chair';
        ad.renderLabelCanvas(95, `🚶 يتوجه لمقعده الجديد #${newIndex + 1} في غرفة الاجتماعات`);
      }
    } else {
      const deskCoord = desks[newIndex] || { x: 0, z: 0 };
      createBubble(
        deskCoord.x,
        1.55,
        deskCoord.z + 0.4,
        `تم تجهيز مكتبي وحاسوبي وانضمامي للفريق! (${newAgent.name}) 🚀`,
        newAgent.hex
      );
    }

    return newAgent;
  }

  function syncApprovedExpansionAgents(approvedNominations: any[]) {
    if (!Array.isArray(approvedNominations)) return;
    let addedAny = false;
    approvedNominations.forEach((nom) => {
      const nomId = String(nom?.id || nom?.agentName || '');
      if (!nomId || spawnedNominationIds.has(nomId)) return;
      spawnedNominationIds.add(nomId);
      const nextIndex = activeAgentsList.length;
      generateUniqueAgentMorphologyAndSpawn(nom, nextIndex);
      addedAny = true;
    });
    if (addedAny) {
      refreshAgentOverheadLabels(timeOfDay);
      if (onStatusUpdate) onStatusUpdate(getArabicStatus(timeOfDay));
    }
  }

  // ═══════════════════════════════════════════════════
  // DYNAMIC N-AGENT MEETING ROOM ENGINE (Pathfinding Walk through Doorway to Assigned Chair!)
  // ═══════════════════════════════════════════════════
  let inMeeting = false;
  let manualMeetingOverride: boolean | null = null;
  let meetingChatTimer = 0;
  let meetingSpeakerPointer = 0;

  function applyMeetingState(active: boolean) {
    const totalSeats = activeAgentsList.length;
    if (active && !inMeeting) {
      inMeeting = true;
      if (onMeetingChange) onMeetingChange(true);
      // Do NOT teleport! Have every agent stand up from their desk/current position and walk through the South doorway to their assigned chair!
      meetChars.forEach((c) => {
        if (c) c.visible = false;
      });
      agentData.forEach((ad, idx) => {
        const seat = meetSeats[idx] || meetSeats[0];
        const startX = ad.walker.visible ? ad.walker.position.x : ad.home.x;
        const startZ = ad.walker.visible ? ad.walker.position.z : ad.home.z;
        ad.sittingChar.visible = false;
        ad.walker.visible = true;
        ad.walker.position.set(startX, 0, startZ);

        // Route via meeting room South doorway (MRX, 0.45) then to the approach point behind their chair
        const doorwayX = MRX + ((idx % 3) - 1) * 0.32;
        const doorwayZ = 0.45;
        const pathToDoor = findSmoothPath(startX, startZ, doorwayX, doorwayZ);
        const insideDoorPt = { x: doorwayX, z: -0.65 };
        const chairApproachPt = {
          x: seat.isHead ? seat.x - 0.35 : seat.x,
          z: seat.isHead ? seat.z : seat.z + (seat.z < MRZ ? -0.35 : 0.35),
        };
        ad.pathQueue = [
          ...pathToDoor,
          insideDoorPt,
          chairApproachPt,
          { x: seat.x, z: seat.z },
        ];
        ad.state = 'walking_to_meeting_chair';
        ad.renderLabelCanvas(96, `🚶 يتوجه عبر الممر لمقعده #${idx + 1} في غرفة الاجتماعات`);
      });
      const firstLine = meetingBreakDialogues[0];
      const firstSeat = meetSeats[firstLine.idx] || meetSeats[0];
      const firstAg = activeAgentsList[firstLine.idx] || activeAgentsList[0];
      createBubble(firstSeat.x, 1.55, firstSeat.z, firstLine.text, firstAg.hex);
      meetingSpeakerPointer = 1;
      meetingChatTimer = 3.6;
    } else if (!active && inMeeting) {
      inMeeting = false;
      if (onMeetingChange) onMeetingChange(false);
      // Stand up from meeting chairs and walk back through the doorway to each agent's desk!
      meetChars.forEach((c) => {
        if (c) c.visible = false;
      });
      agentData.forEach((ad, idx) => {
        const seat = meetSeats[idx] || meetSeats[0];
        const startX = ad.state === 'meeting' ? seat.x : ad.walker.position.x;
        const startZ = ad.state === 'meeting' ? seat.z : ad.walker.position.z;
        ad.sittingChar.visible = false;
        ad.walker.visible = true;
        ad.walker.position.set(startX, 0, startZ);

        const doorwayX = MRX + ((idx % 3) - 1) * 0.32;
        const pathBack = findSmoothPath(doorwayX, 0.55, ad.home.x, ad.home.z);
        ad.pathQueue = [
          { x: doorwayX, z: -0.55 },
          { x: doorwayX, z: 0.55 },
          ...pathBack,
        ];
        ad.state = 'walking_from_meeting_to_desk';
        ad.renderLabelCanvas(ad.liveProgressPct || 88, `🚶 يعود من غرفة الاجتماعات إلى مكتبه #${idx + 1}`);
      });
    }
  }

  function updateMeeting(minutes: number) {
    const cycleMin = minutes % 30;
    const shouldMeet =
      manualMeetingOverride !== null
        ? manualMeetingOverride
        : cycleMin >= 25 && cycleMin <= 30;
    applyMeetingState(shouldMeet);
  }

  function updateMeetingConversation(delta: number) {
    if (!inMeeting) return;
    meetingChatTimer -= delta;
    if (meetingChatTimer <= 0) {
      const turn = meetingBreakDialogues[meetingSpeakerPointer % meetingBreakDialogues.length];
      const seat = meetSeats[turn.idx] || meetSeats[0];
      const ag = activeAgentsList[turn.idx] || activeAgentsList[0];
      createBubble(seat.x, 1.55, seat.z, turn.text, ag.hex);
      meetingSpeakerPointer = (meetingSpeakerPointer + 1) % meetingBreakDialogues.length;
      meetingChatTimer = 3.4;
    }
  }

  // ═══════════════════════════════════════════════════
  // SCREEN ANIMATIONS (Live Data Drawing on Curved Screens)
  // ═══════════════════════════════════════════════════
  let frame = 0;
  let livePublishedCount = 0;
  let liveGscImpressions = 0;
  let liveKeywordsCount = 0;
  let lastHandoverTimestampProcessed = '';

  function drawScreen(s: any) {
    if (!s) return;
    const { ctx: c, canvas: cv, type, hex, agent } = s;
    const w = cv.width, h = cv.height;
    c.fillStyle = '#0D1117';
    c.fillRect(0, 0, w, h);
    const t = frame * 0.02;
    c.globalAlpha = 1;

    if (type === 'strategy') {
      c.fillStyle = hex;
      c.globalAlpha = 0.15;
      c.beginPath();
      c.moveTo(w / 2, 10);
      c.lineTo(w / 2 - 18, 38);
      c.lineTo(w / 2 + 18, 38);
      c.closePath();
      c.fill();
      c.globalAlpha = 1;
      c.font = 'bold 8px sans-serif';
      c.fillText(`VORDER AI // ${liveGscImpressions} GSC`, 10, 48);
      for (let i = 0; i < 6; i++) {
        const y = (54 + i * 5 + Math.floor(t * 3)) % h;
        c.globalAlpha = 0.2 + Math.sin(i + t) * 0.1;
        c.fillRect(8, y, 20 + Math.sin(i * 2 + t) * 20, 2);
      }
    } else if (type === 'charts') {
      c.fillStyle = hex;
      for (let i = 0; i < 6; i++) {
        const bh = 10 + Math.abs(Math.sin(t + i * 0.8)) * 40;
        c.globalAlpha = 0.5;
        c.fillRect(10 + i * 18, h - 8 - bh, 12, bh);
      }
      c.strokeStyle = hex;
      c.globalAlpha = 0.7;
      c.lineWidth = 1.5;
      c.beginPath();
      for (let x = 0; x < w; x += 4) {
        const y = 25 + Math.sin(x * 0.04 + t) * 12;
        x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    } else if (type === 'terminal') {
      c.font = '6px monospace';
      c.fillStyle = hex;
      const syncBanner = `D1_SYNC: ${livePublishedCount}=${livePublishedCount}=${livePublishedCount} ZERO LOSS;`;
      for (let i = 0; i < 12; i++) {
        const y = (8 + i * 6 + Math.floor(t * 5)) % (h + 10);
        c.globalAlpha = 0.3 + (i % 3) * 0.15;
        c.fillText(syncBanner.substr(Math.floor(t * 2 + i * 5) % 25, 22), 4, y);
      }
      if (Math.sin(t * 4) > 0) {
        c.globalAlpha = 0.8;
        c.fillRect(4, h - 12, 5, 7);
      }
    } else if (type === 'palette') {
      ['#E040FB', '#FF4081', '#7C4DFF', '#448AFF', '#18FFFF', '#69F0AE'].forEach((cl, i) => {
        c.fillStyle = cl;
        c.globalAlpha = 0.6;
        c.fillRect(8 + (i % 3) * 38, 8 + Math.floor(i / 3) * 22, 30, 16);
      });
    } else if (type === 'map') {
      c.strokeStyle = hex;
      c.globalAlpha = 0.2;
      c.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        c.beginPath(); c.moveTo(0, i * 10 + 5); c.lineTo(w, i * 10 + 5); c.stroke();
        c.beginPath(); c.moveTo(i * 16 + 5, 0); c.lineTo(i * 16 + 5, h); c.stroke();
      }
      c.globalAlpha = 0.6;
      c.fillStyle = hex;
      [[30, 20], [70, 45], [100, 30], [50, 60]].forEach(([dx, dy]) => {
        c.beginPath(); c.arc(dx + Math.sin(t + dx) * 0.5, dy, 3, 0, Math.PI * 2); c.fill();
      });
    } else if (type === 'deploy') {
      c.fillStyle = hex;
      c.globalAlpha = 0.15;
      c.fillRect(10, 10, w - 20, 12);
      c.globalAlpha = 0.6;
      c.fillRect(10, 10, (w - 20) * ((Math.sin(t * 0.5) + 1) / 2), 12);
      c.font = '6px monospace';
      c.fillStyle = hex;
      c.globalAlpha = 0.8;
      c.fillText('Blog = Sitemap = D1', 10, 38);
      c.fillText(`Article #${Math.floor(t * 3) % Math.max(1, livePublishedCount) + 1}/${livePublishedCount}`, 10, 50);
      c.fillStyle = '#00E676';
      c.fillText(`✓ ${livePublishedCount}=${livePublishedCount}=${livePublishedCount} Sync`, 10, 64);
    } else if (type === 'docs') {
      c.fillStyle = 'rgba(255,255,255,.08)';
      c.fillRect(8, 8, w - 16, h - 16);
      c.font = '6px monospace';
      c.fillStyle = hex;
      c.globalAlpha = 0.6;
      ['# Expert Research', '', '> Consent Mode v2', '  +301 Redirects OK', '', '## Site Audit 100%', `- ${liveKeywordsCount} Keywords`].forEach((l, i) => c.fillText(l, 14, 20 + i * 7));
    } else if (type === 'bugs') {
      c.font = '6px monospace';
      if (agent.id === 8) {
        c.fillStyle = hex;
        c.fillText('WATCHDOG 360 // QA HOST', 6, 12);
        [['✓ SITE AUDIT: 100%', '#00E676'], [`✓ D1 SYNC: ${livePublishedCount}=${livePublishedCount}`, hex], ['✓ WARNINGS: 0', '#00E676'], ['✓ 8/8 PLATFORMS OK', hex]].forEach(([txt, cl], i) => {
          c.fillStyle = cl;
          c.fillText(txt, 6, 26 + i * 12);
        });
      } else {
        [['● AUDIT 100%', hex], ['● 0 WARNINGS', '#00E676'], [`● ${livePublishedCount} SYNCED`, hex], ['● 8/8 PLUGGED', '#00E676']].forEach(([txt, cl], i) => {
          c.fillStyle = cl;
          c.fillText(txt, 10, 14 + i * 14);
        });
      }
    }
    c.globalAlpha = 1;
    s.tex.needsUpdate = true;
  }

  // ═══════════════════════════════════════════════════
  // 24-HOUR TIME PROGRESSION, DYNAMIC OFFICE STATUS & PER-AGENT LIVE TELEMETRY
  // ═══════════════════════════════════════════════════
  let timeOfDay = 540; // 9:00 AM Default
  let statusRotationTick = 0;
  const liveOfficeActivities = [
    '⚡ طارق العبدلي يدير التكتيكات ويعتمد خطة تسريع العرض TURBO_3X',
    '🔍 ياسمين الشريف تحصد كلمات Striking Distance من Google Search Console',
    '📈 سارة المهندس تحلل عائد ROAS وتضبط أحداث التحويل في GA4',
    '🚀 كريم الدسوقي ينشر المقالات في المدونة ويحدث Sitemap.xml و IndexNow',
    '🤖 نور المرشدي تهندس فقرات الإجابة المباشرة لتصدر Google AI Overviews',
    '🔗 عمر الفاروق يدور سلطة الـ Internal PageRank لدعم صفحات الظهور',
    '🌍 فارس النجار يوازن حصص النشر بين السعودية (35%) ومصر (25%) والخليج',
    '🔬 ليلى الألفي تراقب مؤشرات Core Web Vitals وتحافظ على Site Audit 100%',
    '🛡️ زياد عمران يحرس قواعد D1 ويطبق فلتر ذاكرة المالك المتعلمة بصرامة',
  ];

  const getArabicStatus = (m: number) => {
    const cycleMin = m % 30;
    const totalSeats = activeAgentsList.length;
    if (manualMeetingOverride || cycleMin >= 25) {
      return `🎙️ اجتماع الطاولة المستديرة الحي (${totalSeats} وكلاء على ${totalSeats} كراسي — مراجعة الـ ${liveGscImpressions} ظهوراً واعتماد القرارات)`;
    }
    if (cycleMin >= 22 && cycleMin < 25) {
      return '☕ استراحة قصيرة وتبادل نقاشات سريعة بين الوكلاء قبل اجتماع الطاولة المستديرة';
    }
    const activeWalkers = agentData.filter((a) => a.state !== 'sitting' && a.state !== 'meeting');
    if (activeWalkers.length > 0 && statusRotationTick % 2 === 0) {
      const w = activeWalkers[statusRotationTick % activeWalkers.length];
      return `${w.agent.name}: ${w.walkDestinationLabel || 'يتحرك في مسار ذكي لتنسيق مهمة داخل المكتب'} · باقي الفريق (${totalSeats} وكلاء) ينفذ المهام`;
    }
    return liveOfficeActivities[statusRotationTick % liveOfficeActivities.length];
  };

  function refreshAgentOverheadLabels(min: number) {
    const cycleMin = min % 30;
    const isMeet = manualMeetingOverride || cycleMin >= 25;
    const isBreak = !isMeet && cycleMin >= 22 && cycleMin < 25;
    const totalSeats = activeAgentsList.length;

    agentData.forEach((ad, idx) => {
      if (
        ad.state === 'walking_to_meeting_chair' ||
        ad.state === 'walking_from_meeting_to_desk' ||
        ad.state === 'walking_handover_to_peer' ||
        ad.state === 'walking_out' ||
        ad.state === 'walking_back'
      ) {
        return;
      }
      if (isMeet || ad.state === 'meeting') {
        ad.renderLabelCanvas(100, `🎙️ اجتماع الطاولة المستديرة (${totalSeats} كراسي)`);
      } else if (isBreak) {
        const rem = Math.max(1, Math.ceil(25 - cycleMin));
        ad.renderLabelCanvas(100, `☕ استراحة قصيرة (${rem}د للاجتماع)`);
      } else {
        const pct = ad.liveProgressPct || (65 + ((idx * 7) % 30));
        const badge =
          ad.liveBadgeAr ||
          ad.badgeOptions?.[Math.floor((statusRotationTick + idx) / 2) % ad.badgeOptions.length] ||
          '⚡ ينفذ مهامه الحية';
        ad.renderLabelCanvas(pct, `${badge} (${pct}%)`);
      }
    });
  }

  function updateTime(min: number) {
    timeOfDay = min;
    if (onTimeUpdate) onTimeUpdate(min);
    if (onStatusUpdate) onStatusUpdate(getArabicStatus(min));

    refreshAgentOverheadLabels(min);

    let df: number;
    if (min < 360) df = 0.3;
    else if (min < 480) df = 0.3 + (min - 360) / 120 * 0.7;
    else if (min < 1020) df = 1;
    else if (min < 1140) df = 1 - (min - 1020) / 120 * 0.7;
    else df = 0.3;

    sun.intensity = 0.4 + df * 0.7;
    ambient.intensity = 0.4 + df * 0.3;
    scene.background = new THREE.Color(0x000C1E);
    scene.fog = new THREE.FogExp2(0x000C1E, 0.005);
    renderer.toneMappingExposure = 0.8 + df * 0.5;

    const nightF = 1 - df;
    agentData.forEach((a) => {
      a.dGlow.intensity = 0.18 + nightF * 0.3;
    });
    updateMeeting(min);
  }

  // ═══════════════════════════════════════════════════
  // CYBERPUNK (LIGHTS OFF) MODE
  // ═══════════════════════════════════════════════════
  let cyberpunkMode = false;
  function toggleCyberpunk() {
    cyberpunkMode = !cyberpunkMode;
    if (cyberpunkMode) {
      ambient.intensity = 0.12;
      sun.intensity = 0.08;
      renderer.toneMappingExposure = 0.55;
      agentData.forEach((a) => {
        a.dGlow.intensity = 0.95;
        a.dGlow.distance = 4.8;
      });
      fl.material.color.set(0x060C18);
      cp.material.color.set(0x080E1A);
      rcLight.intensity = 0.85;
    } else {
      updateTime(timeOfDay);
      fl.material.color.set(0xE8E8E8);
      cp.material.color.set(0xD0D8E0);
      rcLight.intensity = 0.4;
    }
  }

  // ═══════════════════════════════════════════════════
  // RAYCASTER AGENT CLICK SELECTION (Supports all 9 Core + Dynamically Spawned Agents!)
  // ═══════════════════════════════════════════════════
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handlePointerDownRaycast = (event: MouseEvent) => {
    if (event.button !== 0) return;
    const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
    if (dist > 6) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(office.children, true);
    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr) {
        if (curr.userData && curr.userData.agentId !== undefined) {
          const aId = curr.userData.agentId;
          const agent = activeAgentsList[aId] || VORDER_OFFICE_AGENTS[aId];
          if (agent && onAgentClick) {
            onAgentClick(aId, agent);
          }
          return;
        }
        curr = curr.parent;
      }
    }
  };
  renderer.domElement.addEventListener('click', handlePointerDownRaycast);

  // ═══════════════════════════════════════════════════
  // RENDER & ANIMATION LOOP (With Procedural Typing, 3D Data Pulses, A* Walks & Staggered GPU Screens)
  // ═══════════════════════════════════════════════════
  let animId: number;
  const clock = new THREE.Clock();
  let timeTickAccumulator = 0;
  let pulseSpawnAccumulator = 0;

  // Draw all screens once initially
  screenData.forEach(drawScreen);

  function animate() {
    animId = requestAnimationFrame(animate);
    if (typeof document !== 'undefined' && document.hidden) return;

    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();
    frame++;

    // Periodic organic data pulse between collaborating agents when working at desks
    pulseSpawnAccumulator += delta;
    if (pulseSpawnAccumulator >= 6.5 && !inMeeting) {
      pulseSpawnAccumulator = 0;
      const pairs = [
        [1, 4], // Yasmine (GSC) -> Nour (GEO)
        [4, 3], // Nour (GEO) -> Karim (CMS)
        [3, 5], // Karim (CMS) -> Omar (PageRank)
        [0, 2], // Tariq -> Sara (ROAS)
        [7, 8], // Laila (CWV) -> Ziad (Watchdog)
      ];
      const [fromIdx, toIdx] = pairs[Math.floor(elapsed) % pairs.length];
      const fromAg = activeAgentsList[fromIdx];
      if (fromAg) {
        spawn3DDataPulseBetweenDesks(fromIdx, toIdx, parseInt(fromAg.hex.replace('#', ''), 16));
      }
    }

    timeTickAccumulator += delta;
    if (timeTickAccumulator >= 2.5) {
      timeTickAccumulator = 0;
      statusRotationTick++;
      timeOfDay = (timeOfDay + 1) % 1440;
      updateTime(timeOfDay);
    }

    if (autoRot) {
      sph.theta += 0.001;
      updCam();
    }

    // Stagger curved monitor canvas redraws (1 monitor per frame instead of all 9+ every frame)
    if (screenData.length > 0) {
      drawScreen(screenData[frame % screenData.length]);
    }

    updateWalkers(delta);
    update3DDataPulses(delta);
    checkConversations();
    updateMeetingConversation(delta);
    updateBubbles(delta);

    const typingFreq = elapsed * 14;
    agentData.forEach((a, idx) => {
      if (a.state === 'sitting' && a.sittingChar.visible) {
        a.sittingChar.children.forEach((c: any) => {
          if (c.userData && c.userData.isTypingArm) {
            const sidePhase = c.userData.side > 0 ? 0 : 2.5;
            c.rotation.x = Math.sin(typingFreq + idx * 1.7 + sidePhase) * 0.12;
            c.position.y = 0.62 + Math.cos(typingFreq * 1.1 + idx * 2.1) * 0.01;
          }
        });
      }
    });

    const pulseT = (elapsed * 0.5) % 1;
    pulseRing.scale.set(1 + pulseT * 0.3, 1, 1 + pulseT * 0.3);
    (pulseRing.material as THREE.MeshBasicMaterial).opacity = 0.15 * (1 - pulseT);

    agentData.forEach((a, i) => {
      if (a.state === 'sitting' || a.state === 'meeting') {
        a.label.position.y = 1.85 + Math.sin(elapsed * 1.2 + i * 1.1) * 0.03;
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  updateTime(540);

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  return {
    setTime: (min: number) => {
      manualMeetingOverride = null;
      updateTime(min);
    },
    syncApprovedExpansionAgents,
    spawnAgentWorkstationWithPC,
    expandMeetingRoomAndAddChair,
    generateUniqueAgentMorphologyAndSpawn,
    triggerAgentTaskHandoverWalk,
    spawn3DDataPulseBetweenDesks,
    flyToServerWall: () => {
      tgt.set(11.4, 1.5, 4.2);
      sph.radius = 12.5;
      sph.theta = -Math.PI / 6;
      sph.phi = Math.PI / 3.2;
      updCam();
    },
    getActiveAgents: () => activeAgentsList,
    updateLiveTelemetry: (payload: {
      publishedCount?: number;
      gscImpressions?: number;
      keywordsCount?: number;
      approvedExpansionAgents?: any[];
      platformRacksStatus?: Array<{
        id: string;
        label?: string;
        status: 'LIVE' | 'KV_CACHE' | 'UNLINKED' | string;
        metricText?: string;
        ledHex?: string;
      }>;
      recentPipelineHandovers?: Array<{
        fromAgentIndex: number;
        toAgentIndex: number;
        taskSummaryAr: string;
        timestamp?: string;
      }>;
      dialogue?: Array<{
        speakerId?: string;
        speakerName?: string;
        messageAr?: string;
      }>;
      agentsLiveTelemetry?: Array<{
        agentIndex: number;
        statusBadgeAr: string;
        progressPct: number;
        currentTaskTitle?: string;
      }>;
    }) => {
      if (Array.isArray(payload.approvedExpansionAgents)) {
        syncApprovedExpansionAgents(payload.approvedExpansionAgents);
      }
      if (payload.publishedCount) livePublishedCount = payload.publishedCount;
      if (payload.gscImpressions) liveGscImpressions = payload.gscImpressions;
      if (payload.keywordsCount) liveKeywordsCount = payload.keywordsCount;

      if (payload.publishedCount || payload.gscImpressions || payload.keywordsCount) {
        drawWhiteboard(
          livePublishedCount,
          liveGscImpressions,
          liveKeywordsCount,
          activeAgentsList.length
        );
      }
      if (Array.isArray(payload.platformRacksStatus) && payload.platformRacksStatus.length > 0) {
        update8PlatformServerRacks(payload.platformRacksStatus as any);
      }
      if (Array.isArray(payload.dialogue) && payload.dialogue.length > 0) {
        const mappedTurns = payload.dialogue
          .filter((d: any) => d && (d.messageAr || d.text))
          .map((d: any, idx) => {
            const rawSpeaker = String(d.speakerName || d.agentName || '').replace(/^[^\u0600-\u06FFa-zA-Z0-9]+\s*/, '').trim();
            const firstWord = rawSpeaker.split(' ')[0] || '';
            const msgText = String(d.messageAr || d.text || '').trim();
            const foundIdx = activeAgentsList.findIndex(
              (ag) =>
                (d.agentId && ag.nominationId === d.agentId) ||
                (firstWord && ag.name.includes(firstWord))
            );
            const resolvedIdx = foundIdx >= 0 ? foundIdx : idx % activeAgentsList.length;
            const speakerShort = activeAgentsList[resolvedIdx]?.name.split(' ')[0] || firstWord || 'وكيل';
            return {
              idx: resolvedIdx,
              text: `${speakerShort}: ${msgText.slice(0, 72)}`,
            };
          });
        if (mappedTurns.length >= 1) {
          meetingBreakDialogues = mappedTurns;
          const latestTurn = mappedTurns[mappedTurns.length - 1];
          const deskCoord = desks[latestTurn.idx];
          const ag = activeAgentsList[latestTurn.idx];
          if (deskCoord && ag && !inMeeting && chatBubbles.length < 3) {
            createBubble(deskCoord.x, 1.55, deskCoord.z + 0.35, latestTurn.text, ag.hex);
          }
        }
      }
      if (Array.isArray(payload.recentPipelineHandovers) && payload.recentPipelineHandovers.length > 0) {
        const latest: any = payload.recentPipelineHandovers[0];
        const taskSummary = String(latest.taskLabel || latest.taskSummaryAr || 'تسليم مخرجات الحملة');
        const sig = `${latest.fromAgentIndex}->${latest.toAgentIndex}:${taskSummary}`;
        if (sig !== lastHandoverTimestampProcessed && !inMeeting) {
          lastHandoverTimestampProcessed = sig;
          triggerAgentTaskHandoverWalk(latest.fromAgentIndex, latest.toAgentIndex, taskSummary);
        }
      }
      if (Array.isArray(payload.agentsLiveTelemetry)) {
        payload.agentsLiveTelemetry.forEach((item) => {
          const ad = agentData[item.agentIndex];
          if (ad) {
            ad.liveBadgeAr = item.statusBadgeAr || ad.liveBadgeAr;
            if (typeof item.progressPct === 'number') {
              ad.liveProgressPct = item.progressPct;
            }
          }
        });
        refreshAgentOverheadLabels(timeOfDay);
      }
    },
    toggleCyberpunk: () => toggleCyberpunk(),
    isCyberpunk: () => cyberpunkMode,
    toggleMeetingRoom: () => {
      const nextState = !inMeeting;
      manualMeetingOverride = nextState;
      applyMeetingState(nextState);
      if (nextState) {
        tgt.set(MRX, 1.4, MRZ);
        sph.radius = 15;
        sph.theta = Math.PI / 5;
        sph.phi = Math.PI / 3.8;
        updCam();
      } else {
        tgt.set(-1.0, 1.3, 0.5);
        sph.radius = 31.5;
        sph.theta = 0.0;
        sph.phi = Math.PI / 3.8;
        updCam();
      }
      if (onStatusUpdate) onStatusUpdate(getArabicStatus(timeOfDay));
      return nextState;
    },
    flyToMeetingRoom: () => {
      manualMeetingOverride = true;
      applyMeetingState(true);
      tgt.set(MRX, 1.4, MRZ);
      sph.radius = 15;
      sph.theta = Math.PI / 5;
      sph.phi = Math.PI / 3.8;
      updCam();
      if (onStatusUpdate) onStatusUpdate(getArabicStatus(timeOfDay));
    },
    zoomIn: () => {
      sph.radius = Math.max(12, sph.radius - 4);
      updCam();
    },
    zoomOut: () => {
      sph.radius = Math.min(48, sph.radius + 4);
      updCam();
    },
    resetCamera: () => {
      tgt.set(-1.0, 1.3, 0.5);
      sph.radius = 31.5;
      sph.theta = 0.0;
      sph.phi = Math.PI / 3.8;
      updCam();
    },
    flyToAgent: (agentId: number) => {
      const pos = inMeeting ? (meetSeats[agentId] || { x: MRX, z: MRZ }) : (desks[agentId] || { x: 0, z: 0 });
      tgt.set(pos.x, 1.5, pos.z);
      sph.radius = 16;
      updCam();
    },
    getSpatialAuditSnapshot: () => {
      const westWallX = Number((MRX - currentRoomHalfX).toFixed(2));
      let hasDeskCollision = false;
      for (let i = 0; i < desks.length; i++) {
        const d1 = desks[i];
        if (!d1) continue;
        if (d1.z <= MRZ + currentRoomHalfZ + 0.4 && d1.x + 0.75 >= westWallX - 0.1) {
          hasDeskCollision = true;
        }
        for (let j = i + 1; j < desks.length; j++) {
          const d2 = desks[j];
          if (!d2) continue;
          const dist = Math.hypot(d1.x - d2.x, d1.z - d2.z);
          if (dist < 1.6) hasDeskCollision = true;
        }
      }
      return {
        officeDimensions: {
          floorWidth: 26,
          floorDepth: 20,
          wallHeight: 4,
          meetingRoomCenter: { x: MRX, z: MRZ },
          meetingRoomHalfExtents: { halfX: currentRoomHalfX, halfZ: currentRoomHalfZ },
          meetingRoomWestWallX: westWallX,
        },
        totalAgentsCount: activeAgentsList.length,
        desksCount: desks.length,
        meetingChairsCount: meetSeats.length,
        inMeeting,
        zeroDeskWallCollisions: !hasDeskCollision,
        activeBubblesCount: chatBubbles.length,
        activeDataPulsesCount: activeDataPulses.length,
        serverRacksCount: serverRackUnits.length,
        desks: desks.map((d, idx) => ({
          slotIndex: idx,
          x: d.x,
          z: d.z,
          agentName: activeAgentsList[idx]?.name || '',
          role: activeAgentsList[idx]?.role || '',
          isExpansion: idx >= 9,
        })),
        meetingChairs: meetSeats.map((s, idx) => ({
          seatIndex: idx,
          x: Number(s.x.toFixed(2)),
          z: Number(s.z.toFixed(2)),
          isHead: s.isHead,
          assignedAgent: activeAgentsList[idx]?.name || '',
        })),
        agentsState: agentData.map((ad, idx) => ({
          index: idx,
          name: ad.agent.name,
          role: ad.agent.role,
          isExpansionTrainee: Boolean(ad.agent.isExpansionTrainee),
          state: ad.state,
          position: ad.walker.visible
            ? { x: Number(ad.walker.position.x.toFixed(2)), z: Number(ad.walker.position.z.toFixed(2)) }
            : { x: ad.home.x, z: ad.home.z },
          badge: ad.liveBadgeAr,
          progressPct: ad.liveProgressPct,
        })),
      };
    },
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      renderer.domElement.removeEventListener('click', handlePointerDownRaycast);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}
