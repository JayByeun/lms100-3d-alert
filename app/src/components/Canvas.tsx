import {useEffect, useRef, useCallback} from 'react';
import {EngineScene, type SceneUpdated} from './scene';

interface CanvasProps {
    running: boolean;
    alarms: Record<string, boolean>;
    theme: boolean;
    onHover: (result: SceneUpdated) => void;
}

export const Canvas = ({running, alarms, theme, onHover}: CanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<EngineScene | null>(null);
    const rafRef = useRef<number>(0);
    const runningRef = useRef(running);
    const alarmsRef = useRef(alarms);

    runningRef.current = running;
    alarmsRef.current = alarms;

    useEffect(() => {
        sceneRef.current?.updateTheme(theme);
    }, [theme]);

    const startLoop = useCallback(() => {
        const loop = () => {
            rafRef.current = requestAnimationFrame(loop);
            if (sceneRef.current) {
                const result = sceneRef.current.update(runningRef.current, alarmsRef.current);
                onHover(result);
            }
        };
        loop();
    }, [onHover]);

    useEffect(() => {
        if(!containerRef.current) {
            return;
        }

        const scene = new EngineScene(containerRef.current);
        sceneRef.current = scene;

         const handleResize = () => {
            scene.resize();
        };

        window.addEventListener('resize', handleResize);

        setTimeout(() => scene.resize(), 50);
        setTimeout(() => scene.resize(), 300);

        startLoop();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafRef.current);
            scene.dispose();
            sceneRef.current = null;
        };
    }, [startLoop]);

    return (
        <div
            ref={containerRef}
            className='w-full h-full relative'
            style={{cursor: 'grab'}}
            onMouseDown={() => {
                if (containerRef.current) {
                    containerRef.current.style.cursor = 'grabbing';
                }
            }}
            onMouseUp={() => {
                if (containerRef.current) {
                    containerRef.current.style.cursor = 'grab';
                }
            }}
        />
    )
}