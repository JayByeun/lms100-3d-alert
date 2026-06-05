// src/three/scene.ts
import * as THREE from "three";

export function createScene() {
    /* ================= Scene ================= */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e131a);

    /* ================= Camera ================= */
    const camera = new THREE.PerspectiveCamera(
        50,
        1,
        0.1,
        1000
    );
    camera.position.set(0, 6, 70);

    /* ================= Lights ================= */
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(30, 40, 30);
    scene.add(key);

    /* ================= Groups ================= */
    const model = new THREE.Group();
    const exterior = new THREE.Group();
    const interior = new THREE.Group();
    const airflow = new THREE.Group();

    model.add(exterior, interior, airflow);
    scene.add(model);

    const Z_SCALE = 0.5;
    model.scale.set(1, 1, Z_SCALE);

    /* ================= Materials ================= */
    const baseMats = {
        Inlet: new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 0.85, roughness: 0.35 }),
        LPC: new THREE.MeshStandardMaterial({ color: 0xb3d9ff, metalness: 0.85, roughness: 0.32 }),
        Intercooler: new THREE.MeshStandardMaterial({ color: 0x9be8ff, metalness: 0.85, roughness: 0.3 }),
        HPC: new THREE.MeshStandardMaterial({ color: 0xd0c6ff, metalness: 0.85, roughness: 0.32 }),
        Combustor: new THREE.MeshStandardMaterial({ color: 0xffc08a, metalness: 0.85, roughness: 0.28 }),
        HPT: new THREE.MeshStandardMaterial({ color: 0xff9a9a, metalness: 0.85, roughness: 0.28 }),
        LPT: new THREE.MeshStandardMaterial({ color: 0xffb3d1, metalness: 0.85, roughness: 0.3 }),
        Exhaust: new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 0.85, roughness: 0.35 }),
    };

    const alarmMat = new THREE.MeshStandardMaterial({
        color: 0xff2a2a,
        emissive: 0xff0000,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.25,
    });

    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x4f6475,
        wireframe: true,
    });

    /* ================= Helpers ================= */
    function cyl(
        r1: number,
        r2: number,
        len: number,
        seg: number,
        mat: THREE.Material
    ) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(r1, r2, len, seg, 1, true),
            mat
        );
        mesh.rotation.x = Math.PI / 2;
        return mesh;
    }

    /* ================= State ================= */
    const parts: THREE.Mesh[] = [];

    const alarmState: Record<string, boolean> = {
        Inlet: false,
        LPC: false,
        Intercooler: false,
        HPC: false,
        Combustor: false,
        HPT: false,
        LPT: false,
        Exhaust: false,
    };

    const alarmZones = {
        Combustor: 6.5,
        HPT: 13,
        LPT: 18.5,
    };

    const INTERCOOLER_Z_MIN = -18;
    const INTERCOOLER_Z_MAX = -12;

    const FLOW_ZONES = {
        INLET: [-40, -32],
        LPC: [-32, -22],
        INTERCOOLER: [-18, -12],
        HPC: [-10, 0],
        COMBUSTOR: [4, 9],
        TURBINE: [12, 26],
    };

    const COLD = 0x00d1ff;
    const WARM = 0xffb300;
    const HOT = 0xff2a2a;

    function flowColorByZ(z: number) {
        const cold = new THREE.Color(COLD);
        const warm = new THREE.Color(WARM);
        const hot = new THREE.Color(HOT);

        let temp = 0.3;

        if (z > FLOW_ZONES.LPC[0] && z < FLOW_ZONES.LPC[1]) temp = 0.9;
        if (z > FLOW_ZONES.INTERCOOLER[0] && z < FLOW_ZONES.INTERCOOLER[1]) temp = 0.2;
        if (z > FLOW_ZONES.HPC[0] && z < FLOW_ZONES.HPC[1]) temp = 0.6;
        if (z > FLOW_ZONES.COMBUSTOR[0] && z < FLOW_ZONES.COMBUSTOR[1]) temp = 1.0;
        if (z > FLOW_ZONES.TURBINE[0]) temp = 0.7;

        return temp < 0.5
            ? cold.clone().lerp(warm, temp * 2)
            : warm.clone().lerp(hot, (temp - 0.5) * 2);
    }

    /* ================= Build Model ================= */
    function addPart(name: string, mesh: THREE.Mesh) {
        (mesh as any).userData.name = name;
        parts.push(mesh);
        exterior.add(mesh);
    }

    addPart("Inlet", cyl(2, 2.5, 7.2, 40, baseMats.Inlet));
    parts.at(-1)!.position.z = -37;

    addPart("LPC", cyl(2.5, 2, 8.2, 40, baseMats.LPC));
    parts.at(-1)!.position.z = -26;

    addPart("HPC", cyl(2, 2, 8, 40, baseMats.HPC));
    parts.at(-1)!.position.z = -5;

    addPart("Combustor", cyl(2.5, 2, 6, 32, baseMats.Combustor));
    parts.at(-1)!.position.z = 6.5;

    addPart("HPT", cyl(3.5, 2.5, 4.4, 32, baseMats.HPT));
    parts.at(-1)!.position.z = 13;

    addPart("LPT", cyl(4.5, 3.5, 3.4, 32, baseMats.LPT));
    parts.at(-1)!.position.z = 18.5;

    addPart("Exhaust", cyl(6.5, 4.5, 8, 28, baseMats.Exhaust));
    parts.at(-1)!.position.z = 29;

    return {
        scene,
        camera,
        model,
        exterior,
        interior,
        airflow,

        parts,

        baseMats,
        alarmMat,
        wireMat,

        alarmState,
        alarmZones,

        INTERCOOLER_Z_MIN,
        INTERCOOLER_Z_MAX,

        FLOW_ZONES,
        flowColorByZ,

        Z_SCALE,
    };
}