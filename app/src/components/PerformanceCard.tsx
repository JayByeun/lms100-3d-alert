type Color = 'indigo' | 'amber' | 'red' | 'green';

const colorMap = {
    indigo: 'text-indigo-300',
    amber: 'text-amber-300',
    red: 'text-red-400',
    green: 'text-emerald-300',
}

export const PerformanceCard = ({label, value, unit, color='indigo', warning = false}: {
    label: string,
    value: string | number,
    unit: string,
    color?: Color,
    warning?: boolean,
}) => {
    return (
        <div className={`rounded border px-3 py-2.5 ${warning ? 'border-red-500/50 bg-red-950/30' : 'border-white/8 bg-white/3'}`}>
            <div className="text-white/40 text-xs tracking-widest uppercase mb-1">{label}</div>
                <div className={`font-mono text-xl font-semibold tracking-tight ${warning ? 'text-red-400' : colorMap[color]}`}>
                    {value}
                <span className="text-xs font-normal ml-1 opacity-70">{unit}</span>
            </div>
        </div>
    )
};
