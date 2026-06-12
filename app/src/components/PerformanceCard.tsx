type Color = 'indigo' | 'amber' | 'red' | 'green';

const colorMap = (dark: boolean) => {
    return {
        indigo: dark ? 'text-indigo-300' : 'text-indigo-500' ,
        amber: dark ? 'text-amber-300': 'text-amber-500',
        red:  dark ? 'text-red-400': 'text-red-500',
        green: dark ? 'text-emerald-300': 'text-emerald-500',
    }
}

export const PerformanceCard = ({label, value, unit, color='indigo', dark = false, warning = false}: {
    label: string,
    value: string | number,
    unit: string,
    dark?: boolean,
    color?: Color,
    warning?: boolean,
}) => {
    return (
        <div className={`rounded border px-3 py-2.5 ${warning ? 'border-red-500/50 bg-red-950/30' : 'border-black/8 bg-black/3 dark:border-white/8 dark:bg-white/3'}`}>
            <div className="dark:text-white/40 text-xs tracking-widest uppercase mb-1">{label}</div>
                <div className={`font-display text-xl font-semibold tracking-tight ${warning ? 'text-red-400' : colorMap(dark)[color]}`}>
                    {value}
                <span className="text-xs font-normal ml-1 opacity-70">{unit}</span>
            </div>
        </div>
    )
};
