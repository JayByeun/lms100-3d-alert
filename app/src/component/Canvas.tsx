import { useEffect, useRef } from "react";
import { createScene } from "../three/scene";
import { createEngine } from "../three/engine";

export default function ThreeCanvas({ running }: { running: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const engineRef = useRef<any>(null);

    useEffect(() => {
        if (!ref.current) return;

        const ctx = createScene();
        const engine = createEngine(ref.current, ctx);

        engineRef.current = engine;
        engine.setRunning(running);

        return () => {
            engine.dispose();
            engineRef.current = null;
        };
    }, []);

    useEffect(() => {
        engineRef.current?.setRunning(running);
    }, [running]);

    return <div ref={ref} className="w-full h-full" />;
}