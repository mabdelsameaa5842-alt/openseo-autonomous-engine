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
    avatarUrl: '/game-assets/avatars/agent_01_tariq.png',
    metrics: '23 ظهور GSC معتمد • دقة 99.8%',
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
    hair: 0x8B4513,
    shirt: 0x8B6914,
    pants: 0x3E2723,
    avatarUrl: '/game-assets/avatars/agent_08_nadine.png',
    metrics: '485 مصطلح مفهرس • ترتيب 48.5',
  },
  {
    id: 3,
    name: 'عمر الفاروق',
    nameEn: 'Omar El-Farouk',
    role: 'صائغ المحتوى والأرشفة الفورية',
    roleEn: 'Content Architect & Pipeline Lead',
    color: 0xFF9100,
    hex: '#FF9100',
    screen: 'deploy',
    hair: 0x1a1a1a,
    shirt: 0xBF360C,
    pants: 0x3E2723,
    avatarUrl: '/game-assets/avatars/agent_07_omar.png',
    metrics: '742 مقال منشور ومؤرشف حياً',
  },
  {
    id: 4,
    name: 'كريم الدسوقي',
    nameEn: 'Karim El-Desouki',
    role: 'مهندس النظم السحابية وقواعد D1',
    roleEn: 'Cloud SWE & D1 Database Guardian',
    color: 0x00E676,
    hex: '#00E676',
    screen: 'terminal',
    hair: 0x222222,
    shirt: 0x1B5E20,
    pants: 0x1a1a2e,
    avatarUrl: '/game-assets/avatars/agent_03_kareem.png',
    metrics: '$0.00 تكلفة • استجابة 9ms',
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
    avatarUrl: '/game-assets/avatars/agent_06_layla.png',
    metrics: '100% Core Web Vitals • 0 أخطاء',
  },
  {
    id: 6,
    name: 'فارس النجار',
    nameEn: 'Faris Al-Tariq',
    role: 'منسق الترددات والأرشفة اللحظية',
    roleEn: 'Audio Director & Tactical Frequency',
    color: 0xCCDDEE,
    hex: '#CCDDEE',
    screen: 'strategy',
    hair: 0x555555,
    shirt: 0x546E7A,
    pants: 0x263238,
    avatarUrl: '/game-assets/avatars/agent_05_fahd.png',
    metrics: 'ترددات Lofi تكتيكية • مزامنة دقيقة',
  },
  {
    id: 7,
    name: 'نور المرشدي',
    nameEn: 'Nour El-Morshedy',
    role: 'باحثة الأسواق وتجربة التحويل CRO',
    roleEn: 'Market Researcher & CRO Specialist',
    color: 0x7C4DFF,
    hex: '#7C4DFF',
    screen: 'docs',
    hair: 0x4E342E,
    shirt: 0x4527A0,
    pants: 0x1a1a2e,
    avatarUrl: '/game-assets/avatars/agent_08_nadine.png',
    metrics: 'تحويل سلات الشراء +34%',
  },
  {
    id: 8,
    name: 'زياد الخطيب',
    nameEn: 'Ziad El-Khatib',
    role: 'مخطط الحملات والاستقبال التكتيكي',
    roleEn: 'Campaign Planner & Office Host',
    color: 0x448AFF,
    hex: '#448AFF',
    screen: 'map',
    hair: 0x3E2723,
    shirt: 0x1565C0,
    pants: 0x263238,
    avatarUrl: '/game-assets/avatars/agent_09_rami.png',
    metrics: 'استهداف 10 مدن رئيسية • مكتب الاستقبال',
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

  // 2. Camera Orbit Controls
  let isDrag = false;
  let prev = { x: 0, y: 0 };
  const sph = { theta: Math.PI / 4.5, phi: Math.PI / 4.5, radius: 34 };
  const tgt = new THREE.Vector3(0, 1.8, 0);
  let autoRot = true;
  let autoTmr: any = null;

  function updCam() {
    const p = Math.max(0.18, Math.min(Math.PI / 2.3, sph.phi));
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
    prev = { x: e.clientX, y: e.clientY };
    autoRot = false;
    clearTimeout(autoTmr);
  };
  const onPointerUp = () => {
    isDrag = false;
    autoTmr = setTimeout(() => { autoRot = true; }, 6000);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!isDrag) return;
    sph.theta -= (e.clientX - prev.x) * 0.005;
    sph.phi += (e.clientY - prev.y) * 0.005;
    prev = { x: e.clientX, y: e.clientY };
    updCam();
  };
  const onWheel = (e: WheelEvent) => {
    sph.radius = Math.max(16, Math.min(50, sph.radius + e.deltaY * 0.03));
    updCam();
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

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

  // Carpet
  const cp = new THREE.Mesh(new THREE.BoxGeometry(10, 0.02, 8), M(0xD0D8E0));
  cp.position.set(-3, 0.01, 0);
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
    new THREE.MeshLambertMaterial({ color: 0x0A1628, transparent: true, opacity: 0.45 })
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

  // ═══════════════════════════════════════════════════
  // MEETING ROOM (Right side)
  // ═══════════════════════════════════════════════════
  const MRX = 8, MRZ = -3;
  const mrGlass = Glass();
  let w = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.5, 5.5), mrGlass);
  w.position.set(MRX - 2.8, 1.75, MRZ);
  office.add(w);

  w = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.5, 0.06), mrGlass);
  w.position.set(MRX - 1.9, 1.75, MRZ + 2.75);
  office.add(w);
  w = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.5, 0.06), mrGlass);
  w.position.set(MRX + 1.9, 1.75, MRZ + 2.75);
  office.add(w);

  // Frame lines
  [[MRX - 2.8, MRZ - 2.75], [MRX - 2.8, MRZ + 2.75], [MRX + 2.8, MRZ - 2.75], [MRX + 2.8, MRZ + 2.75]].forEach(([fx, fz]) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.5, 0.05), M(0x99AABB));
    f.position.set(fx, 1.75, fz);
    office.add(f);
  });

  // Meeting Table
  const mt = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.07, 1.5), M(0xDDE4EC));
  mt.position.set(MRX, 0.72, MRZ);
  mt.castShadow = true;
  mt.receiveShadow = true;
  office.add(mt);
  [[-1.6, -0.55], [-1.6, 0.55], [1.6, -0.55], [1.6, 0.55]].forEach(([tx, tz]) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), M(0xBBCCDD));
    l.position.set(MRX + tx, 0.35, MRZ + tz);
    office.add(l);
  });

  // Meeting chairs
  const meetSeats = [
    { x: MRX - 1.4, z: MRZ - 1.1, ry: 0 },
    { x: MRX, z: MRZ - 1.1, ry: 0 },
    { x: MRX + 1.4, z: MRZ - 1.1, ry: 0 },
    { x: MRX - 1.4, z: MRZ + 1.1, ry: Math.PI },
    { x: MRX, z: MRZ + 1.1, ry: Math.PI },
    { x: MRX + 1.4, z: MRZ + 1.1, ry: Math.PI },
  ];
  meetSeats.forEach((s) => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.35), M(0x37474F));
    seat.position.set(s.x, 0.42, s.z);
    office.add(seat);
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.32, 0.04), M(0x37474F));
    const bz = s.z + (s.ry === 0 ? -0.19 : 0.19);
    bk.position.set(s.x, 0.6, bz);
    office.add(bk);
    [-0.12, 0.12].forEach((ox) => {
      [-0.12, 0.12].forEach((oz) => {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.03), M(0x90A4AE));
        l.position.set(s.x + ox, 0.2, s.z + oz);
        office.add(l);
      });
    });
  });

  // Whiteboard with authentic VORDER SEO stats
  const wbB = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 0.03), M(0xCCCCCC));
  wbB.position.set(MRX, 2.2, MRZ - 2.73);
  office.add(wbB);

  const wbc = document.createElement('canvas');
  wbc.width = 320;
  wbc.height = 130;
  const wbx = wbc.getContext('2d');
  if (wbx) {
    wbx.fillStyle = '#FAFAFA';
    wbx.fillRect(0, 0, 320, 130);
    wbx.font = 'bold 20px sans-serif';
    wbx.fillStyle = '#0DEEF3';
    wbx.fillText('VORDER SEO ROADMAP', 20, 30);
    wbx.font = '12px monospace';
    wbx.fillStyle = '#111827';
    wbx.fillText('GSC: 23 IMPRESSIONS (100% TRUTH)', 20, 55);
    wbx.fillStyle = '#059669';
    wbx.fillText('▸ 742 ARTICLES PUBLISHED & INDEXED', 20, 78);
    wbx.fillStyle = '#2563EB';
    wbx.fillText('▸ D1 AUTONOMOUS ENGINE: $0.00 COST', 20, 100);
    wbx.fillStyle = '#D97706';
    wbx.fillText('▸ SALLA & ZID ORGANIC AD HUBS ACTIVE', 20, 120);
  }
  const wbt = new THREE.CanvasTexture(wbc);
  const wbm = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.92), new THREE.MeshBasicMaterial({ map: wbt }));
  wbm.position.set(MRX, 2.2, MRZ - 2.7);
  office.add(wbm);

  // ═══════════════════════════════════════════════════
  // DESK POSITIONS
  // ═══════════════════════════════════════════════════
  const desks = [
    { x: -8, z: -3 },  // Tariq (RONIN position)
    { x: -4, z: -3 },  // Yasmine (SAGE)
    { x: -8, z: 1.5 }, // Karim (CIPHER)
    { x: -4, z: 1.5 }, // Sara (MUSE)
    { x: 0,  z: -3 },  // Ziad (ATLAS)
    { x: 0,  z: 1.5 }, // Omar (FORGE)
    { x: -8, z: 6 },   // Nour (ECHO)
    { x: -4, z: 6 },   // Layla (SPARK)
  ];

  // ═══════════════════════════════════════════════════
  // CHARACTER BUILDER (Standing & Sitting Voxels)
  // ═══════════════════════════════════════════════════
  function buildChar(agent: VorderAgentConfig, standing = false) {
    const g = new THREE.Group();
    const skin = 0xDEB887;

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
        const sh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.16), M(0x222222));
        sh.position.set(s * 0.08, 0.025, 0);
        g.add(sh);
      });

      // Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.16), M(agent.shirt));
      torso.position.set(0, 0.58, 0);
      torso.castShadow = true;
      g.add(torso);

      // Collar
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.1), M(0xFFFFFF));
      col.position.set(0, 0.74, 0);
      g.add(col);

      // Arms hanging
      [-1, 1].forEach((s) => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), M(agent.shirt));
        arm.position.set(s * 0.2, 0.5, 0);
        g.add(arm);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.07), M(skin));
        hand.position.set(s * 0.2, 0.32, 0);
        g.add(hand);
      });

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), M(skin));
      head.position.set(0, 0.86, 0);
      head.castShadow = true;
      g.add(head);

      // Hair
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), M(agent.hair));
      hair.position.set(0, 0.96, -0.01);
      g.add(hair);
      const hairB = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.04), M(agent.hair));
      hairB.position.set(0, 0.9, -0.11);
      g.add(hairB);

      // Eyes
      [-1, 1].forEach((s) => {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), MB(0xFFFFFF));
        eye.position.set(s * 0.05, 0.88, 0.11);
        g.add(eye);
        const pup = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), MB(0x1a1a2e));
        pup.position.set(s * 0.05, 0.87, 0.115);
        g.add(pup);
      });

      // Badge
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), MB(agent.color));
      badge.position.set(0.16, 0.65, 0.07);
      g.add(badge);
    } else {
      // Sitting character facing -Z (toward monitor)
      // Thighs
      [-1, 1].forEach((s) => {
        const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.1, 0.22), M(agent.pants));
        thigh.position.set(s * 0.09, 0.42, -0.05);
        g.add(thigh);
      });

      // Lower legs
      [-1, 1].forEach((s) => {
        const shin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), M(agent.pants));
        shin.position.set(s * 0.09, 0.24, -0.15);
        g.add(shin);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.14), M(0x222222));
        shoe.position.set(s * 0.09, 0.1, -0.15);
        g.add(shoe);
      });

      // Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.16), M(agent.shirt));
      torso.position.set(0, 0.62, 0);
      torso.castShadow = true;
      g.add(torso);

      // Collar
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.1), M(0xFFFFFF));
      col.position.set(0, 0.77, 0);
      g.add(col);

      // Arms typing
      [-1, 1].forEach((s) => {
        const ua = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), M(agent.shirt));
        ua.position.set(s * 0.2, 0.6, -0.04);
        g.add(ua);
        const fa = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.2), M(skin));
        fa.position.set(s * 0.2, 0.52, -0.18);
        g.add(fa);
      });

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), M(skin));
      head.position.set(0, 0.9, 0);
      head.castShadow = true;
      g.add(head);

      // Hair
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), M(agent.hair));
      hair.position.set(0, 1.0, 0.01);
      g.add(hair);
      const hairB = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.04), M(agent.hair));
      hairB.position.set(0, 0.94, 0.11);
      g.add(hairB);

      // Eyes facing monitor
      [-1, 1].forEach((s) => {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), MB(0xFFFFFF));
        eye.position.set(s * 0.05, 0.92, -0.11);
        g.add(eye);
        const pup = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), MB(0x1a1a2e));
        pup.position.set(s * 0.05, 0.91, -0.115);
        g.add(pup);
      });

      // Badge
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), MB(agent.color));
      badge.position.set(0.16, 0.68, -0.06);
      g.add(badge);
    }

    return g;
  }

  // ═══════════════════════════════════════════════════
  // BUILD WORKSTATIONS FOR 8 AGENTS
  // ═══════════════════════════════════════════════════
  const screenData: any[] = [];
  const agentData: any[] = [];

  VORDER_OFFICE_AGENTS.slice(0, 8).forEach((agent, idx) => {
    const dp = desks[idx];
    const ax = dp.x, az = dp.z;

    // Desk legs
    [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].forEach(([lx, lz]) => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), M(0xBBCCDD));
      l.position.set(ax + lx, 0.35, az + lz);
      l.castShadow = true;
      office.add(l);
    });

    // Desk top
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.75), M(0xE8ECF0));
    dTop.position.set(ax, 0.73, az);
    dTop.castShadow = true;
    dTop.receiveShadow = true;
    office.add(dTop);

    // Front modesty panel
    const dFront = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.38, 0.03), M(0xDDE4EC));
    dFront.position.set(ax, 0.52, az - 0.36);
    office.add(dFront);

    // Monitor Stand
    const monBase = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.12), M(0xAABBCC));
    monBase.position.set(ax, 0.77, az - 0.2);
    office.add(monBase);
    const monStand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), M(0xAABBCC));
    monStand.position.set(ax, 0.88, az - 0.2);
    office.add(monStand);

    const monBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.52, 0.03), M(0x2A2A2A));
    monBody.position.set(ax, 1.28, az - 0.24);
    monBody.castShadow = true;
    office.add(monBody);

    // Live animated screen
    const cv = document.createElement('canvas');
    cv.width = 128;
    cv.height = 80;
    const cx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv);
    tex.minFilter = THREE.LinearFilter;
    const sf = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.46), new THREE.MeshBasicMaterial({ map: tex }));
    sf.position.set(ax, 1.28, az - 0.22);
    office.add(sf);
    screenData.push({ canvas: cv, ctx: cx, tex, type: agent.screen, hex: agent.hex, agent });

    // Keyboard & mouse
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.13), M(0x333333));
    kb.position.set(ax, 0.77, az + 0.02);
    office.add(kb);
    const ms = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.09), M(0x333333));
    ms.position.set(ax + 0.42, 0.77, az + 0.02);
    office.add(ms);

    // Coffee mug
    const mug = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), M(idx % 2 ? 0xFFFFFF : 0x666666));
    mug.position.set(ax + 0.55, 0.8, az + 0.12);
    office.add(mug);

    // Office Chair
    const cz = az + 0.55;
    const cSeat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), M(0x37474F));
    cSeat.position.set(ax, 0.44, cz);
    office.add(cSeat);
    const cBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.04), M(0x37474F));
    cBack.position.set(ax, 0.67, cz + 0.19);
    office.add(cBack);
    [-0.14, 0.14].forEach((ox) => {
      [-0.14, 0.14].forEach((oz) => {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.03), M(0x90A4AE));
        l.position.set(ax + ox, 0.21, cz + oz);
        office.add(l);
      });
    });

    // Desk Underglow
    const dGlow = new THREE.PointLight(agent.color, 0.2, 2.5, 2);
    dGlow.position.set(ax, 0.3, az);
    office.add(dGlow);

    // Sitting Character
    const sittingChar = buildChar(agent, false);
    sittingChar.position.set(ax, 0, az + 0.55);
    sittingChar.userData = { agentId: agent.id };
    office.add(sittingChar);

    // Floating Sprite Label (ALWAYS faces camera, never mirrored!)
    const lc = document.createElement('canvas');
    lc.width = 256;
    lc.height = 64;
    const lctx = lc.getContext('2d');
    if (lctx) {
      lctx.clearRect(0, 0, 256, 64);
      lctx.font = 'bold 20px Tajawal, Cairo, sans-serif';
      lctx.textAlign = 'center';
      lctx.fillStyle = agent.hex;
      lctx.shadowColor = agent.hex;
      lctx.shadowBlur = 8;
      lctx.fillText(agent.name, 128, 26);
      lctx.shadowBlur = 0;
      lctx.font = '12px Tajawal, sans-serif';
      lctx.fillStyle = 'rgba(200, 220, 240, 0.85)';
      lctx.fillText(agent.role.slice(0, 22), 128, 48);
    }
    const lTex = new THREE.CanvasTexture(lc);
    lTex.minFilter = THREE.LinearFilter;
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: lTex, transparent: true, depthTest: false }));
    label.scale.set(1.4, 0.35, 1);
    label.position.set(ax, 1.8, az + 0.55);
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
      dGlow,
      home: { x: ax, z: az + 0.55 },
      state: 'sitting',
      timer: 4 + rng.r(0, 12),
      walkTarget: null,
      walkPause: 0,
      agent,
    });
  });

  // ═══════════════════════════════════════════════════
  // RECEPTION DESK & AGENT 9 (فارس النجار)
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
    lctx.font = 'bold 28px monospace';
    lctx.textAlign = 'center';
    lctx.fillText('◈ VORDER SEO ◈', 128, 40);
    lctx.fillStyle = '#FFFFFF';
    lctx.font = '14px sans-serif';
    lctx.fillText('AUTONOMOUS AI SUITE', 128, 68);
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

  // Reception monitor
  const rcMonBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.03), M(0x2A2A2A));
  rcMonBody.position.set(RCX - 0.4, 1.35, RCZ + 0.08);
  reception.add(rcMonBody);

  // Faris Al-Tariq sitting behind reception desk
  const farisAgent = VORDER_OFFICE_AGENTS[8];
  const farisChar = buildChar(farisAgent, false);
  farisChar.position.set(RCX - 0.4, 0, RCZ - 0.4);
  farisChar.rotation.y = Math.PI;
  farisChar.userData = { agentId: 8 };
  reception.add(farisChar);

  // Faris Label
  const nxLC = document.createElement('canvas');
  nxLC.width = 256;
  nxLC.height = 64;
  const nxCtx = nxLC.getContext('2d');
  if (nxCtx) {
    nxCtx.clearRect(0, 0, 256, 64);
    nxCtx.font = 'bold 20px Tajawal, Cairo, sans-serif';
    nxCtx.textAlign = 'center';
    nxCtx.fillStyle = '#CCDDEE';
    nxCtx.fillText(farisAgent.name, 128, 26);
    nxCtx.font = '12px Tajawal, sans-serif';
    nxCtx.fillStyle = 'rgba(200, 220, 240, 0.85)';
    nxCtx.fillText(farisAgent.role.slice(0, 24), 128, 48);
  }
  const nxTex = new THREE.CanvasTexture(nxLC);
  nxTex.minFilter = THREE.LinearFilter;
  const nxLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: nxTex, transparent: true, depthTest: false }));
  nxLabel.scale.set(1.4, 0.35, 1);
  nxLabel.position.set(RCX - 0.4, 1.8, RCZ - 0.4);
  reception.add(nxLabel);

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
  // WATER COOLER CHAT BUBBLES (Authentic VORDER Arabic Dialogue)
  // ═══════════════════════════════════════════════════
  const chatBubbles: any[] = [];
  const arabicChatPhrases = [
    'أرشفنا 742 مقال بنجاح اليوم 🚀',
    'الكونسول يسجل 23 ظهور معتمد 📈',
    'استهلاك قواعد D1 هو 0.00$ دائماً 🛡️',
    'حملة إعلانات سلة وزد تعمل 100% ✨',
    'كريم حدّث السايت ماب مع جوجل ⚡',
    'ترتيب الكلمات صاعد بثبات 🎯',
    'استجابة السيرفر فائقة السرعة 9ms ⚡',
    'مين جاهز لاجتماع القيادة القادم؟ ☕',
  ];

  function createBubble(x: number, y: number, z: number, text: string, color: string) {
    const bc = document.createElement('canvas');
    bc.width = 240;
    bc.height = 56;
    const bx = bc.getContext('2d');
    if (bx) {
      bx.fillStyle = 'rgba(10, 22, 40, 0.9)';
      bx.beginPath();
      bx.roundRect(4, 4, 232, 48, 12);
      bx.fill();
      bx.strokeStyle = color;
      bx.lineWidth = 2;
      bx.stroke();

      bx.font = 'bold 13px Tajawal, Cairo, sans-serif';
      bx.fillStyle = color;
      bx.textAlign = 'center';
      bx.fillText(text, 120, 32);
    }
    const btex = new THREE.CanvasTexture(bc);
    btex.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: btex, transparent: true, depthTest: false }));
    sprite.scale.set(1.4, 0.35, 1);
    sprite.position.set(x, y + 0.2, z);
    office.add(sprite);
    chatBubbles.push({ sprite, life: 3.5, startY: y + 0.2 });
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
      b.sprite.position.y = b.startY + (3.5 - b.life) * 0.12;
      b.sprite.material.opacity = Math.max(0, b.life / 3.5);
      if (b.life <= 0) {
        office.remove(b.sprite);
        b.sprite.material.dispose();
        chatBubbles.splice(i, 1);
      }
    }
  }

  // ═══════════════════════════════════════════════════
  // WALKING ENGINE
  // ═══════════════════════════════════════════════════
  const walkDestinations = [
    { x: 2, z: 7.5 },
    { x: -10, z: 0 },
    { x: -2, z: -7 },
    { x: 4, z: 5 },
    { x: -6, z: 7 },
    { x: 3, z: 0 },
  ];

  function updateWalkers(delta: number) {
    agentData.forEach((ad) => {
      if (ad.state === 'sitting') {
        ad.timer -= delta;
        if (ad.timer <= 0) {
          ad.state = 'walking_out';
          ad.sittingChar.visible = false;
          ad.walker.visible = true;
          ad.walker.position.set(ad.home.x, 0, ad.home.z);
          const dest = rng.pick(walkDestinations);
          ad.walkTarget = { x: dest.x + rng.r(-0.5, 0.5), z: dest.z + rng.r(-0.5, 0.5) };
          ad.walkPause = 0;
        }
      } else if (ad.state === 'walking_out') {
        const dx = ad.walkTarget.x - ad.walker.position.x;
        const dz = ad.walkTarget.z - ad.walker.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.2) {
          ad.walkPause += delta;
          if (ad.walkPause > 2 + rng.r(0, 2)) {
            ad.state = 'walking_back';
          }
        } else {
          const speed = 1.6 * delta;
          const nx = dx / dist, nz = dz / dist;
          ad.walker.position.x += nx * speed;
          ad.walker.position.z += nz * speed;
          ad.walker.rotation.y = Math.atan2(nx, nz);

          const t = performance.now() * 0.01;
          ad.walker.children.forEach((c: any) => {
            if (c.userData && c.userData.isLeg) {
              c.position.z = Math.sin(t + c.userData.phase) * 0.08;
            }
          });
        }
        ad.label.position.set(ad.walker.position.x, 1.3, ad.walker.position.z);
      } else if (ad.state === 'walking_back') {
        const dx = ad.home.x - ad.walker.position.x;
        const dz = ad.home.z - ad.walker.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.2) {
          ad.state = 'sitting';
          ad.walker.visible = false;
          ad.sittingChar.visible = true;
          ad.label.position.set(ad.home.x, 1.8, ad.home.z);
          ad.timer = 6 + rng.r(0, 14);
          ad.walker.children.forEach((c: any) => {
            if (c.userData && c.userData.isLeg) c.position.z = 0;
          });
        } else {
          const speed = 1.6 * delta;
          const nx = dx / dist, nz = dz / dist;
          ad.walker.position.x += nx * speed;
          ad.walker.position.z += nz * speed;
          ad.walker.rotation.y = Math.atan2(nx, nz);

          const t = performance.now() * 0.01;
          ad.walker.children.forEach((c: any) => {
            if (c.userData && c.userData.isLeg) c.position.z = Math.sin(t + c.userData.phase) * 0.08;
          });
        }
        ad.label.position.set(ad.walker.position.x, 1.3, ad.walker.position.z);
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // MEETING ENGINE
  // ═══════════════════════════════════════════════════
  let inMeeting = false;
  const meetChars: any[] = [];
  VORDER_OFFICE_AGENTS.slice(0, 6).forEach((agent, i) => {
    const mc = buildChar(agent, false);
    const s = meetSeats[i];
    mc.position.set(s.x, 0, s.z);
    mc.rotation.y = s.z < MRZ ? Math.PI : 0;
    mc.visible = false;
    office.add(mc);
    meetChars.push(mc);
  });

  function updateMeeting(minutes: number) {
    const shouldMeet = (minutes >= 600 && minutes <= 630) || (minutes >= 840 && minutes <= 870);
    if (shouldMeet && !inMeeting) {
      inMeeting = true;
      if (onMeetingChange) onMeetingChange(true);
      meetChars.forEach((c) => { c.visible = true; });
      agentData.slice(0, 6).forEach((ad) => {
        if (ad.state !== 'sitting') {
          ad.walker.visible = false;
          ad.sittingChar.visible = false;
        } else {
          ad.sittingChar.visible = false;
        }
        ad.state = 'meeting';
      });
    } else if (!shouldMeet && inMeeting) {
      inMeeting = false;
      if (onMeetingChange) onMeetingChange(false);
      meetChars.forEach((c) => { c.visible = false; });
      agentData.slice(0, 6).forEach((ad) => {
        ad.state = 'sitting';
        ad.sittingChar.visible = true;
        ad.label.position.set(ad.home.x, 1.8, ad.home.z);
        ad.timer = 3 + rng.r(0, 6);
      });
    }
  }

  // ═══════════════════════════════════════════════════
  // SCREEN ANIMATIONS (Live Data Drawing)
  // ═══════════════════════════════════════════════════
  let frame = 0;
  function drawScreen(s: any) {
    const { ctx: c, canvas: cv, type, hex } = s;
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
      c.fillText('VORDER AI // 23 GSC', 12, 48);
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
      for (let i = 0; i < 12; i++) {
        const y = (8 + i * 6 + Math.floor(t * 5)) % (h + 10);
        c.globalAlpha = 0.3 + (i % 3) * 0.15;
        c.fillText('D1_QUERY: SELECT * FROM keywords;'.substr(Math.floor(t * 2 + i * 5) % 25, 22), 4, y);
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
      c.fillText('Articles Indexed...', 10, 38);
      c.fillText(`Article #${Math.floor(t * 3) % 742 + 1}/742`, 10, 50);
      c.fillStyle = '#00E676';
      c.fillText('✓ 742 Live in Site', 10, 64);
    } else if (type === 'docs') {
      c.fillStyle = 'rgba(255,255,255,.08)';
      c.fillRect(8, 8, w - 16, h - 16);
      c.font = '6px monospace';
      c.fillStyle = hex;
      c.globalAlpha = 0.6;
      ['# CRO Research', '', '> Salla & Zid Funnels', '  +34% Cart Conversion', '', '## Key Signals', '- Free D1 engine'].forEach((l, i) => c.fillText(l, 14, 20 + i * 7));
    } else if (type === 'bugs') {
      c.font = '6px monospace';
      [['● PASS 100%', hex], ['● PASS GSC', '#00E676'], ['● PASS D1', hex], ['● AUDIT OK', '#00E676']].forEach(([txt, cl], i) => {
        c.fillStyle = cl;
        c.fillText(txt, 10, 14 + i * 14);
      });
    }
    c.globalAlpha = 1;
    s.tex.needsUpdate = true;
  }

  // ═══════════════════════════════════════════════════
  // 24-HOUR TIME PROGRESSION & DAY/NIGHT LIGHTS
  // ═══════════════════════════════════════════════════
  let timeOfDay = 600; // 10:00 AM default
  const getArabicStatus = (m: number) => {
    if (m < 360) return 'الوردية الليلية · استراتيجية VORDER المستقلة';
    if (m < 540) return 'توافد الوكلاء الصباحي ومزامنة الكونسول';
    if (m >= 600 && m <= 630) return 'اجتماع القيادة التكتيكية جارٍ الآن (غرفة الاجتماعات)';
    if (m < 720) return 'العمل العميق · جميع الوكلاء الـ 9 متصلون';
    if (m < 780) return 'استراحة القهوة والغداء في شرفة اللاونج';
    if (m >= 840 && m <= 870) return 'مراجعة أداء السبرنت والأرشفة الدورية';
    if (m < 1020) return 'تركيز ما بعد الظهيرة وتحسين المقالات';
    if (m < 1140) return 'مراجعة ختام اليوم والنسخ الاحتياطي';
    return 'الوردية الليلية · حراسة قواعد D1 ($0.00)';
  };

  function updateTime(min: number) {
    timeOfDay = min;
    if (onTimeUpdate) onTimeUpdate(min);
    if (onStatusUpdate) onStatusUpdate(getArabicStatus(min));

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
      a.dGlow.intensity = 0.15 + nightF * 0.3;
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
        a.dGlow.intensity = 0.9;
        a.dGlow.distance = 4.5;
      });
      fl.material.color.set(0x060C18);
      cp.material.color.set(0x080E1A);
      rcLight.intensity = 0.8;
    } else {
      updateTime(timeOfDay);
      fl.material.color.set(0xE8E8E8);
      cp.material.color.set(0xD0D8E0);
      rcLight.intensity = 0.4;
    }
  }

  // ═══════════════════════════════════════════════════
  // RAYCASTER AGENT CLICK SELECTION
  // ═══════════════════════════════════════════════════
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handlePointerDownRaycast = (event: MouseEvent) => {
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
          const agent = VORDER_OFFICE_AGENTS[aId];
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
  // RENDER LOOP
  // ═══════════════════════════════════════════════════
  let animId: number;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();
    frame++;

    if (autoRot) {
      sph.theta += 0.0012;
      updCam();
    }

    screenData.forEach(drawScreen);
    updateWalkers(delta);
    checkConversations();
    updateBubbles(delta);

    // Tariq pulse ring animation
    const pulseT = (elapsed * 0.5) % 1;
    pulseRing.scale.set(1 + pulseT * 0.3, 1, 1 + pulseT * 0.3);
    (pulseRing.material as THREE.MeshBasicMaterial).opacity = 0.15 * (1 - pulseT);

    // Floating label subtle bobbing
    agentData.forEach((a, i) => {
      if (a.state === 'sitting') {
        a.label.position.y = 1.8 + Math.sin(elapsed * 1.1 + i * 1.3) * 0.03;
      }
    });
    nxLabel.position.y = 1.8 + Math.sin(elapsed * 1.1 + 9) * 0.03;

    renderer.render(scene, camera);
  }
  animate();

  updateTime(600);

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  return {
    setTime: (min: number) => updateTime(min),
    toggleCyberpunk: () => toggleCyberpunk(),
    isCyberpunk: () => cyberpunkMode,
    flyToAgent: (agentId: number) => {
      const pos = agentId === 8 ? { x: RCX, z: RCZ } : desks[agentId] || { x: 0, z: 0 };
      tgt.set(pos.x, 1.5, pos.z);
      sph.radius = 18;
      updCam();
    },
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', handlePointerDownRaycast);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}
