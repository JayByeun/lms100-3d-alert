import * as THREE from "three";

let rafId: number | null = null;
let disposed = false;

export function createEngine(container: HTMLDivElement, ctx: any) {
    const { scene, camera, model } = ctx;

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });

    container.appendChild(renderer.domElement);

    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;

        if (!w || !h) return;

        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    setTimeout(resize, 50);

    let running = false;

    function setRunning(v: boolean) {
        running = v;
    }

    function animate() {
        if (disposed) return;

        rafId = requestAnimationFrame(animate);

        if (running) {
            model.rotation.y += 0.002;
        }

        renderer.render(scene, camera);
    }

    animate();

    function dispose() {
        disposed = true;

        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }

        window.removeEventListener("resize", resize);

        renderer.dispose();

        // DOM detach
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
    }

    return {
        renderer,
        setRunning,
        dispose,
    };
}