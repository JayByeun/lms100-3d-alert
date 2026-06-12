import { PART_FULL_NAMES, type PartName } from "./engine";

export const HoverLabel = ({name, screenPos, alarmed}: {
    name: PartName,
    screenPos: {x: number, y: number},
    alarmed: boolean
}) => {
    return (
        <div
        className="absolute z-20 pointer-events-none"
        style={{ left: screenPos.x, top: screenPos.y, transform: 'translate(-50%, -100%)' }}
        >
        <div className={`flex flex-col items-center`}>
            <div className={`px-3 py-1.5 rounded border text-xs font-mono whitespace-nowrap shadow-lg backdrop-blur-sm ${
            alarmed
                ? 'border-red-400/70 bg-red-600 dark:bg-red-950/80 text-white dark:text-red-200 shadow-red-900/40'
                : 'border-indigo-400/40 bg-indigo-300/20 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-200 shadow-indigo-900/30'
            }`}>
            {alarmed && <span className="mr-2">⚠</span>}
            {PART_FULL_NAMES[name] ?? name}
            </div>
            {/* Connector line */}
            <div className={`w-px h-4 ${alarmed ? 'bg-red-400/50' : 'bg-indigo-400/40'}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${alarmed ? 'bg-red-400' : 'bg-indigo-400'}`} />
        </div>
        </div>
    );
}
