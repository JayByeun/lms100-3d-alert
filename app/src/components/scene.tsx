import * as THREE from 'three';
import {RED, RED_ORANGE, DEEP_SKY_BLUE, SELECTED_YELLOW, SCARLET, BLACK, DUSK, WHITE, CORNFLOWER_BLUE, SAFETY_ORANGE, INLET, LPC, INTERCOOLER, COMBUSTOR_1, COMBUSTOR_2, HPT_2, HPT_1, LPT_1, LPT_2, HPC, EXHAUST, DARK_ORANGE, ELECTRIC_BLUE} from './ui/colors';


export interface SceneUpdated {
    hover: string | null;
    screenPos: {x: number, y: number} | null;
}

const FLOW_START_Z = -42;
const FLOW_END_Z = 34;
const FLOW_COUNT = 22;
const INTERCOOLER_Z_MIN = -18;
const INTERCOOLER_Z_MAX = -12;
const Z_SCALE = 0.5;

const ALARM_ZONE_Z: Record<string, number> = {
  Combustor: 6.5,
  HPT: 13,
  LPT: 18.5,
};

const FLOW_ZONES = {
  LPC: [-32, -22] as [number, number],
  INTERCOOLER: [-18, -12] as [number, number],
  HPC: [-10, 0] as [number, number],
  COMBUSTOR: [4, 9] as [number, number],
  TURBINE: [12, 26] as [number, number],
};

const makeCylinder = (
    r1: number,
    r2: number,
    len: number,
    seg: number,
    mat: THREE.Material,
    open = true
): THREE.Mesh => {
    const geo = new THREE.CylinderGeometry(r1, r2, len, seg, 1, open);
    const m = new THREE.Mesh(geo, mat);

    m.rotation.x = Math.PI / 2;

    return m;
}

const stageCylinder = (
  rIn: number,
  rOut: number,
  len: number,
  mat: THREE.Material
) => {
  const geo = new THREE.CylinderGeometry(rIn, rOut, len, 64, 1, true);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
};

const flowColorByZ = (z: number): THREE.Color => {
    const cold = new THREE.Color(DEEP_SKY_BLUE);
    const warm = new THREE.Color(SELECTED_YELLOW);
    const hot = new THREE.Color(SCARLET);
    let temp = 0.25;

    if (z > FLOW_ZONES.LPC[0] && z < FLOW_ZONES.LPC[1]) temp = 0.85;
    if (z > FLOW_ZONES.INTERCOOLER[0] && z < FLOW_ZONES.INTERCOOLER[1]) temp = 0.15;
    if (z > FLOW_ZONES.HPC[0] && z < FLOW_ZONES.HPC[1]) temp = 0.6;
    if (z > FLOW_ZONES.COMBUSTOR[0] && z < FLOW_ZONES.COMBUSTOR[1]) temp = 1.0;
    if (z > FLOW_ZONES.TURBINE[0]) temp = 0.72;

    if (temp < 0.5) return cold.clone().lerp(warm, temp * 2);
    return warm.clone().lerp(hot, (temp - 0.5) * 2);
}

export class EngineScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  private model: THREE.Group;
  private exterior: THREE.Group;
  private interior: THREE.Group;
  private rotor: THREE.Group;
  private airflow: THREE.Group;
  private parts: THREE.Mesh[] = [];
  private flowArrows: THREE.Group[] = [];
  private flame!: THREE.Mesh;
  private combustorLight!: THREE.PointLight;

  private baseMats: Record<string, THREE.MeshStandardMaterial> = {};
  private alarmMat: THREE.MeshStandardMaterial;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-9999, -9999);

  private rx = 0.15;
  private ry = -0.3;
  private drag = false;
  private lx = 0;
  private ly = 0;
  private zoom = 72;

  private container: HTMLElement;

  private _mdHandler!: (e: MouseEvent) => void;
  private _muHandler!: () => void;
  private _mmHandler!: (e: MouseEvent) => void;
  private _wlHandler!: (e: WheelEvent) => void;
  private _rzHandler!: () => void;

  constructor(container: HTMLElement) {
    this.container = container;

    /* Scene */
  //   this.scene = new THREE.Scene();
  //   const bg = new THREE.Color(
  //     getComputedStyle(document.documentElement)
  //       .getPropertyValue("--bg-hex")
  //       .trim()
  //   );
  //     console.log(getComputedStyle(document.documentElement)
  // .getPropertyValue("--bg-hex"));

    // this.scene.background = new THREE.Color(bg);
    this.scene = new THREE.Scene();

    /* Camera */
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1000);
    this.camera.position.set(0, 5, this.zoom);

    /* Renderer */
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    /* Groups */
    this.model = new THREE.Group();
    this.model.scale.set(1, 1, Z_SCALE);
    this.scene.add(this.model);

    this.exterior = new THREE.Group();
    this.interior = new THREE.Group();
    this.airflow = new THREE.Group();
    this.rotor = new THREE.Group();
    this.model.add(this.exterior, this.interior, this.airflow);
    this.interior.add(this.rotor);

    /* Alarm mat */
    this.alarmMat = new THREE.MeshStandardMaterial({
      color: RED_ORANGE,
      emissive: RED,
      emissiveIntensity: 1.1,
      metalness: 0.9,
      roughness: 0.18,
    });

    this.setupLighting();
    this.setupMaterials();
    this.setupGeometry();
    this.setupAirflow();
    this.setupEvents();
    this.resize();
  }

  updateTheme(dark: boolean) {
    this.scene.background = new THREE.Color(
      dark ? 0x060c12 : 0xF4F6F9
    );
  }

  /* ---- Lighting ---- */
  private setupLighting() {
    this.scene.add(new THREE.AmbientLight(DUSK, 2.2));

    const key = new THREE.DirectionalLight(WHITE, 2.5);
    key.position.set(30, 40, 30);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(CORNFLOWER_BLUE, 1.0);
    rim.position.set(-25, 5, -35);
    this.scene.add(rim);

    const fill = new THREE.DirectionalLight(0xffe8cc, 0.5);
    fill.position.set(-20, -25, 15);
    this.scene.add(fill);

    /* Combustor glow */
    this.combustorLight = new THREE.PointLight(SAFETY_ORANGE, 0, 35);
    this.combustorLight.position.set(0, 0, 6.5);
    this.model.add(this.combustorLight);
  }

  /* ---- Materials ---- */
  private setupMaterials() {
    const m = (col: number, metal = 0.88, rough = 0.22, emissive = 0, emInt = 0) =>
      new THREE.MeshStandardMaterial({
        color: col,
        metalness: metal,
        roughness: rough,
        emissive: emissive,
        emissiveIntensity: emInt,
      });

    this.baseMats = {
      Inlet: m(INLET, 0.85, 0.08),
      LPC: m(LPC, 0.9, 0.2),
      Intercooler: m(INTERCOOLER, 0.82, 0.25),
      HPC: m(HPC, 0.9, 0.2),
      Combustor: m(COMBUSTOR_1, 1.2, 0.35, COMBUSTOR_2, 0.5),
      HPT: m(HPT_1, 0.95, 0.22, HPT_2, 0.3),
      LPT: m(LPT_1, 0.86, 0.22, LPT_2, 0.15),
      Exhaust: m(EXHAUST, 0.92, 0.28),
    };
  }

  /* ---- Geometry ---- */
  private addPart(name: string, mesh: THREE.Mesh) {
    mesh.userData.name = name;
    this.parts.push(mesh);
    this.exterior.add(mesh);
    return mesh;
  }

  private addRotorSection(
    zStart: number,
    zEnd: number,
    radius: number,
    bladeLen: number,
    mat: THREE.Material,
    bladeCount = 22
  ) {
    const bGeo = new THREE.BoxGeometry(0.13, bladeLen, 0.48);
    for (let z = zStart; z <= zEnd; z += 1.1) {
      for (let i = 0; i < bladeCount; i++) {
        const b = new THREE.Mesh(bGeo, mat);
        const a = (i / bladeCount) * Math.PI * 2;
        b.position.set(Math.cos(a) * radius, Math.sin(a) * radius, z);
        b.rotation.z = a + 0.15; // slight twist
        this.rotor.add(b);
      }
    }
  }

  private setupGeometry() {
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x3a5570, wireframe: true });

    /* Engine sections */
    const inlet = this.addPart('Inlet', stageCylinder(3.2, 2.4, 7.2, this.baseMats.Inlet));
    inlet.position.z = -37;

    const lpc = this.addPart('LPC', stageCylinder(2.4, 1.9, 8.2, this.baseMats.LPC));
    lpc.position.z = -26;

    const hpc = this.addPart('HPC', stageCylinder(1.9, 1.5, 8, this.baseMats.HPC));
    hpc.position.z = -5;

    const combustor = this.addPart('Combustor', stageCylinder(2.2, 3.0, 6, this.baseMats.Combustor));
    combustor.position.z = 6.5;

    /* Combustor outer ring for glow effect */
    const combustorGlow = makeCylinder(2.55, 2.05, 6.2, 36, new THREE.MeshBasicMaterial({
      color: SAFETY_ORANGE,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    combustorGlow.position.z = 6.5;
    combustorGlow.userData.noAlarm = true;
    this.exterior.add(combustorGlow);

    const hpt = this.addPart('HPT', stageCylinder(3.0, 3.8, 4.4, this.baseMats.HPT));
    hpt.position.z = 13;

    const lpt = this.addPart('LPT', stageCylinder(3.8, 4.6, 3.4, this.baseMats.LPT));
    lpt.position.z = 18.5;

    const exhaust = this.addPart('Exhaust', stageCylinder(4.6, 6.0, 8, this.baseMats.Exhaust));
    exhaust.position.z = 29;

    /* Intercooler shell */
    const IC_RADIUS = 6.8;
    const IC_LEN = 7.8;
    const icShell = new THREE.Mesh(
      new THREE.CylinderGeometry(IC_RADIUS, IC_RADIUS, IC_LEN, 64, 1, true, Math.PI * 0.22, Math.PI * 0.72),
      this.baseMats.Intercooler
    );
    icShell.rotation.x = Math.PI / 2;
    icShell.position.z = -15;
    this.addPart('Intercooler', icShell);

    /* Intercooler fins */
    const finMat = new THREE.MeshStandardMaterial({ color: 0x8ed8ff, metalness: 0.4, roughness: 0.55 });
    const FIN_COUNT = 44;
    const FIN_R = IC_RADIUS - 0.55;
    for (let i = 0; i < FIN_COUNT; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.09, IC_LEN * 0.86, 0.28), finMat);
      fin.userData.hideLabel = true;
      const a = Math.PI * 0.22 + (i / FIN_COUNT) * Math.PI * 0.72;
      fin.position.set(Math.cos(a) * FIN_R, 0, Math.sin(a) * FIN_R);
      fin.rotation.y = a;
      icShell.add(fin);
    }

    /* Flame */
    const flameMat = new THREE.MeshStandardMaterial({
      color: DARK_ORANGE,
      emissive: RED_ORANGE,
      emissiveIntensity: 2.2,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.flame = makeCylinder(1.9, 1.4, 4.2, 28, flameMat, true);
    this.flame.position.z = 6.5;
    this.flame.renderOrder = 10;
    this.interior.add(this.flame);

    /* Inner flame core */
    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffee00,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerFlame = makeCylinder(1.1, 0.8, 3.8, 20, innerFlameMat, true);
    innerFlame.position.z = 6.5;
    innerFlame.renderOrder = 11;
    this.interior.add(innerFlame);

    /* Rotors */
    this.addRotorSection(-30, -22, 2.2, 2.5, wireMat);
    this.addRotorSection(-8, -1, 2.1, 2.3, wireMat);
    this.addRotorSection(11, 15, 3.5, 2.9, wireMat, 18);
    this.addRotorSection(17, 21, 4.6, 3.3, wireMat, 16);

    /* Center shaft */
    const shaft = makeCylinder(0.45, 0.45, 78, 12, wireMat);
    this.interior.add(shaft);
  }

  /* ---- Airflow ---- */
  private setupAirflow() {
    for (let i = 0; i < FLOW_COUNT; i++) {
      const arrow = this.makeArrow();
      arrow.position.z = THREE.MathUtils.lerp(FLOW_START_Z, FLOW_END_Z, i / FLOW_COUNT);
      /* Distribute arrows vertically within the engine cross-section */
      arrow.position.y = (i % 3 - 1) * 0.5;
      this.airflow.add(arrow);
      this.flowArrows.push(arrow);
    }
  }

  private makeArrow(): THREE.Group {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({
      color: ELECTRIC_BLUE,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.0, 7), mat.clone());
    body.rotation.x = Math.PI / 2;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.72, 9), mat.clone());
    head.position.z = 1.38;
    head.rotation.x = Math.PI / 2;
    g.add(body, head);
    return g;
  }

  /* ---- Events ---- */
  private setupEvents() {
    const el = this.renderer.domElement;

    this._mdHandler = (e) => { this.drag = true; this.lx = e.clientX; this.ly = e.clientY; };
    this._muHandler = () => { this.drag = false; };
    this._mmHandler = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (this.drag) {
        this.ry += (e.clientX - this.lx) * 0.004;
        this.rx += (e.clientY - this.ly) * 0.004;
        this.lx = e.clientX;
        this.ly = e.clientY;
      }
    };
    this._wlHandler = (e) => {
      e.preventDefault();
      this.zoom = Math.max(42, Math.min(130, this.zoom + e.deltaY * 0.03));
    };
    this._rzHandler = () => this.resize();

    el.addEventListener('mousedown', this._mdHandler);
    window.addEventListener('mouseup', this._muHandler);
    window.addEventListener('mousemove', this._mmHandler);
    el.addEventListener('wheel', this._wlHandler, { passive: false });
    window.addEventListener('resize', this._rzHandler);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /* ---- Update (called per frame) ---- */
  update(running: boolean, alarms: Record<string, boolean>): SceneUpdated {
    this.model.rotation.x = this.rx;
    this.model.rotation.y = this.ry;
    this.camera.position.z = this.zoom;

    const t = performance.now() * 0.001;

    /* Update part materials based on alarm state */
    for (const p of this.parts) {
      const name = p.userData.name as string;
      if (!name || p.userData.hideLabel || p.userData.noAlarm) continue;
      if (this.baseMats[name]) {
        p.material = alarms[name] ? this.alarmMat : this.baseMats[name];
      }
    }

    if (running) {
      this.rotor.rotation.z += 0.055;

      /* Flame animation */
      const flameMat = this.flame.material as THREE.MeshStandardMaterial;
      flameMat.emissiveIntensity = alarms.Combustor
        ? 3.0 + Math.sin(t * 8) * 1.0
        : 2.2 + Math.sin(t * 5) * 0.5;
      this.flame.scale.y = 1 + Math.sin(t * 3.5) * 0.1;
      this.flame.scale.x = 1 + Math.sin(t * 2.8) * 0.06;

      /* Combustor light */
      this.combustorLight.intensity = alarms.Combustor
        ? 6 + Math.sin(t * 9) * 2.5
        : 3.5 + Math.sin(t * 5) * 1.0;
    } else {
      this.combustorLight.intensity *= 0.92; // fade out
    }

    /* Airflow animation */
    const FLOW_SPEED = running ? 0.2 : 0;

    for (const a of this.flowArrows) {
      if (!running) {
        a.visible = false;
        continue;
      }
      a.visible = true;
      a.position.z += FLOW_SPEED;
      if (a.position.z > FLOW_END_Z) a.position.z = FLOW_START_Z;

      const z = a.position.z;
      const color = flowColorByZ(z);

      /* Intercooler spread */
      if (z > INTERCOOLER_Z_MIN && z < INTERCOOLER_Z_MAX) {
        const spread = Math.sin((z - INTERCOOLER_Z_MIN) * 1.3) * 1.6;
        a.position.y = spread + (a.position.y > 0 ? 0.5 : -0.5);
        color.set(0x00d8ff);
      } else {
        a.position.y *= 0.88;
      }

      /* Alarm zone blinking */
      let forceVisible = true;
      for (const [name, zPos] of Object.entries(ALARM_ZONE_Z)) {
        if (alarms[name] && Math.abs(z - zPos) < 3) {
          forceVisible = Math.sin(t * 12) > 0;
          color.set(RED_ORANGE);
        }
      }
      a.visible = forceVisible;

      a.children.forEach(child => {
        const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (m) m.color.copy(color);
      });
    }

    /* Raycasting for hover */
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.parts, true);
    const hit = hits.find(h => !h.object.userData.hideLabel && !h.object.userData.noAlarm);

    this.renderer.render(this.scene, this.camera);

    if (hit) {
      const name = (hit.object.userData.name || hit.object.parent?.userData?.name) as string;
      const wp = new THREE.Vector3();
      hit.object.getWorldPosition(wp);
      wp.y += 3.5 / Z_SCALE;
      const proj = wp.project(this.camera);
      const rect = this.container.getBoundingClientRect();
      return {
        hover: name || null,
        screenPos: {
          x: (proj.x * 0.5 + 0.5) * rect.width,
          y: (-proj.y * 0.5 + 0.5) * rect.height,
        },
      };
    }

    return { hover: null, screenPos: null };
  }

  dispose() {
    const el = this.renderer.domElement;
    el.removeEventListener('mousedown', this._mdHandler);
    window.removeEventListener('mouseup', this._muHandler);
    window.removeEventListener('mousemove', this._mmHandler);
    el.removeEventListener('wheel', this._wlHandler);
    window.removeEventListener('resize', this._rzHandler);
    this.renderer.dispose();
    if (el.parentNode) el.parentNode.removeChild(el);
  }
}
