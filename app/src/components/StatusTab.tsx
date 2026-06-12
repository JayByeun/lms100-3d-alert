export const StatusTab = ({active, color = 'green'}: {active: boolean, color?: string}) => {
    const colorMap: Record<string, string> = {
        green: active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-white/15',
        red: active ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse' : 'bg-white/15',
        indigo: active ? 'bg-indigo-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]' : 'bg-white/15',
        amber: active ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)] animate-pulse' : 'bg-white/15',
    };

    return (
        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${colorMap[color] ?? colorMap.green}`} />
    );
}