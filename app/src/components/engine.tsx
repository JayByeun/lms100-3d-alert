import {useState, useCallback} from 'react';

export type PartName = 'Inlet' | 'LPC' | 'Intercooler' | 'HPC' | 'Combustor' | 'HPT' | 'LPT' | 'Exhaust';

export const PART_FULL_NAMES: Record<PartName, string> = {
    Inlet: 'Air Inlet',
    LPC: 'Low Pressure Compressor',
    Intercooler: 'Intercooler',
    HPC: 'High Pressure Compressor',
    Combustor: 'Combustor',
    HPT: 'High Pressure Turbine',
    LPT: 'Low Pressure Turbine',
    Exhaust: 'Exhaust Nozzle',
};

export const ALL_PARTS: PartName[] = [
    'Inlet', 'LPC', 'Intercooler', 'HPC',
    'Combustor', 'HPT', 'LPT', 'Exhaust',
];

type AlarmState = Record<PartName, boolean>;

const DEFAULT_ALARMS: AlarmState = {
    Inlet: false, LPC: false, Intercooler: false, HPC: false,
    Combustor: false, HPT: false, LPT: false, Exhaust: false,
};

export interface EngineState {
    running: boolean;
    alarms: AlarmState;
    user: {username: string} | null;
}

export const useEngine = () => {
    const [running, setRunning] = useState(false);
    const [alarms, setAlarms] = useState<AlarmState>({...DEFAULT_ALARMS});
    const [user, setUser] = useState<{username: string} | null>(null);

    const toggleRun = useCallback(() => setRunning(r => !r), []);
    const toggleAlarm = useCallback((name: PartName) => {
        setAlarms(prev => ({...prev, [name]: !prev[name]}));
    }, []);

    const removeAlarms = useCallback(() => {
        setAlarms({...DEFAULT_ALARMS});
    }, []);

    const login = useCallback((username: string) => {
        setUser({username});
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setRunning(false);
    }, []);

    const alarmCount = Object.values(alarms).filter(Boolean).length;

    return {
        running,
        alarms,
        user,
        alarmCount,
        toggleRun,
        toggleAlarm,
        removeAlarms,
        login,
        logout,
    }
}
