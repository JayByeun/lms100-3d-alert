import {PART_FULL_NAMES, type PartName} from './engine';
import {Button} from './button';

export const AlarmController = ({name, alarmed, onToggle}: {
    name: PartName,
    alarmed: boolean,
    onToggle: () => void,
}) => {
    return (
        <div className={`flex items-center justify-between px-3 py-2 rounded border transition-all duration-200 ${
        alarmed
            ? 'dark:border-red-500/60 bg-red-950/30'
            : 'border-black/6 bg-background/2 hover:bg-background/4 dark:border-white/6'
        }`}>
        <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
            alarmed ? 'bg-red-500 shadow-[0_0_6px_rgba(255,60,60,0.8)]' : 'bg-emerald-400/60'
            } ${alarmed ? 'animate-pulse' : ''}`} />
            <span className={`text-xs tracking-wide ${alarmed ? 'text-red-600 dark:text-red-300' : 'text-black dark:text-white/65'}`}>
                {PART_FULL_NAMES[name]}
            </span>
        </div>
        <Button
            variant={alarmed ? 'alarm-active' : 'alarm'}
            size="sm"
            onClick={onToggle}
        >
            {alarmed ? '⚠ ALARM' : 'NORMAL'}
        </Button>
        </div>
    );
}
