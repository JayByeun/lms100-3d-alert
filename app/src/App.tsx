import {useState, useCallback, useRef, useEffect} from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import {useEngine, ALL_PARTS, type PartName} from './components/engine';
import {Canvas} from './components/Canvas';
import {Button} from './components/button';
import {PerformanceCard} from './components/PerformanceCard';
import {AlarmController} from './components/AlarmController';
import type {SceneUpdated} from './components/scene';
import {LoginModal} from './components/LoginModal';
import {HoverLabel} from './components/HoverLabel';
import {StatusTab} from './components/StatusTab';
import sisoLogo_light from "./assets/SISO_White.png";
import sisoLogo_dark from "./assets/LOGO_Blue.png";
import {initializeAuth} from './auth/msal';
import {useTheme} from './components/ChangeTheme';
import {INLET, LPC, INTERCOOLER, COMBUSTOR_1, HPC, EXHAUST, threeToCss} from './components/ui/colors';

/* ===================== App ===================== */
export default function App() {
  const engine = useEngine();
  const [hover, setHover] = useState<SceneUpdated>({ hover: null, screenPos: null });
  const [rpm, setRpm] = useState(0);
  const {dark, toggle} = useTheme();

  const rpmRef = useRef(0);
  const runningRef = useRef(engine.running);
  const alarmCountRef = useRef(engine.alarmCount);
  runningRef.current = engine.running;
  alarmCountRef.current = engine.alarmCount;

  useEffect(() => {
    initializeAuth();
  }, []);

  const handleHoverChange = useCallback((result: SceneUpdated) => {
    setHover(result);
    const target = runningRef.current ? (alarmCountRef.current > 0 ? 2800 : 3600) : 0;
    rpmRef.current += (target - rpmRef.current) * 0.018;
    setRpm(Math.round(rpmRef.current));
  }, []);

  const getMetrics = () => {
    const r = rpmRef.current;
    const frac = r / 3600;
    return {
      rpm: Math.round(r),
      inletTemp: Math.round(15 + frac * 5),
      exhaustTemp: Math.round(400 + frac * 180 + (engine.alarms.Combustor ? 120 : 0)),
      pressure: (r > 0 ? (frac * 22.5).toFixed(1) : '0.0'),
      power: Math.round(frac * 100 * (engine.alarms.Combustor ? 0.72 : 1)),
      heatRate: r > 0 ? (8200 - frac * 1200).toFixed(0) : '--',
    };
  };

  const m = getMetrics();

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="w-full h-full flex flex-col overflow-hidden min-h-0 font-mono">

        {/* ===== Top Header ===== */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 h-25 border-b border-white/6 bg-background">
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="flex items-center gap-7">
              <div className="relative w-16 h-16">
                <div className="flex inset-0 rounded-sm border border-indigo-400/40 dark:bg-indigo-500/10 w-20 h-15">
                    <img
                      src={dark ? sisoLogo_light : sisoLogo_dark}
                      alt="SISO"
                      className="flex z-10 w-full h-full object-contain px-2"
                    />
                </div>
              </div>
              <div>
                <div className="text-black dark:text-white text-s font-semibold tracking-widest">3D STATUS MONITORING SYSTEM</div>
                <div className="text-black dark:text-white/35 text-xs tracking-wider">LMS100</div>
              </div>
            </div>

            <div className="h-5 w-px bg-white/8" />

            {/* Engine ID */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-black dark:text-white/30 text-s tracking-wider">UNIT</span>
              <span className="text-indigo-600 dark:text-indigo-300 text-s font-mono tracking-widest">U1</span>
            </div>

            <div className="h-5 w-px bg-white/8" />

            {/* Status dots */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <StatusTab active={engine.running} color="green" />
                <span className="text-s tracking-wider text-black dark:text-white/40">{engine.running ? 'RUNNING' : 'OFFLINE'}</span>
              </div>
              {engine.alarmCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <StatusTab active color="amber" />
                  <span className="text-s tracking-wider text-amber-600 dark:text-amber-400">{engine.alarmCount} ALARM{engine.alarmCount > 1 ? 'S' : ''}</span>
                </div>
              )}
            </div>
          </div>

          <div className='flex gap-5'>
            <Button variant="ghost" onClick={toggle}>
                {dark ? "LIGHT MODE" : "DARK MODE"}
            </Button>

            {/* Right: user + login */}
            <div className="flex items-center gap-3">
              {engine.user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                      <span className="text-indigo-300 text-xs font-bold">{engine.user.username[0].toUpperCase()}</span>
                    </div>
                    <span className="text-black dark:text-white/60 text-xs tracking-wide hidden sm:block">{engine.user.username}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={engine.logout}>LOGOUT</Button>
                </div>
              ) : (
                <LoginModal />
              )}
            </div>
          </div>
        </header>

        {/* ===== Body ===== */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* === Left Panel: Parts ===  */}
          <aside className="w-65 flex-shrink-0 flex flex-col border-r border-white/6 overflow-y-auto bg-background">
            <div className="px-3 pt-4 pb-2">
              <div className="text-xs tracking-widest text-black dark:text-white/30 uppercase mb-3">Engine Sections</div>
              <div className="space-y-3">
                {ALL_PARTS.map(name => (
                  <AlarmController
                    key={name}
                    name={name}
                    alarmed={engine.alarms[name]}
                    onToggle={() => engine.toggleAlarm(name)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto px-3 pb-4 pt-3 border-t border-white/5 space-y-2">
              {engine.alarmCount > 0 && (
                <Button variant="stop" size="md" className="w-full" onClick={engine.removeAlarms}>
                  ✕ CLEAR ALL ALARMS
                </Button>
              )}
            </div>
          </aside>

          {/* === Center: Canvas === */}
          <main className="flex-1 relative overflow-hidden" style={{ background: '#060c12' }}>
            {/* Background grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `
                linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }} />

            {/* Corner decorations */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-indigo-400/20 pointer-events-none" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-indigo-400/20 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-indigo-400/20 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-indigo-400/20 pointer-events-none" />

            {/* Canvas */}
            <Canvas
              running={engine.running}
              alarms={engine.alarms}
              theme={dark}
              onHover={handleHoverChange}
            />

            {/* Hover label */}
            {hover.hover && hover.screenPos && (
              <HoverLabel
                name={hover.hover as PartName}
                screenPos={hover.screenPos}
                alarmed={engine.alarms[hover.hover as PartName] ?? false}
              />
            )}

            {/* Run indicator badge */}
            {engine.running && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-600 dark:border-emerald-400/30 bg-emerald-100 dark:bg-emerald-950/60 backdrop-blur-sm pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-300 text-xs tracking-widest font-mono font-semibold">ENGINE RUNNING</span>
              </div>
            )}

            {/* Drag hint */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-black dark:text-white/15 text-xs tracking-widest pointer-events-none">
              DRAG TO ROTATE · SCROLL TO ZOOM
            </div>
          </main>

          {/* === Right Panel: Metrics === */}
          <aside className="w-70 flex-shrink-0 flex flex-col border-l border-white/6 overflow-y-auto bg-background">
            <div className="px-3 pt-4 pb-3">
              <div className="text-xs tracking-widest text-black dark:text-white/30 uppercase mb-3">Performance</div>

              <div className="space-y-2">
                <PerformanceCard label="Shaft Speed" value={rpm.toLocaleString()} unit="rpm"
                  color={rpm > 3200 ? 'amber' : 'indigo'}
                  warning={engine.alarms.HPT || engine.alarms.LPT}
                  dark={dark}
                />
                <PerformanceCard label="Output Power" value={m.power} unit="MW"
                  color={m.power < 70 && engine.running ? 'amber' : 'green'}
                  dark={dark}
                />
                <PerformanceCard label="Exhaust Temp" value={m.exhaustTemp} unit="°C"
                  color={m.exhaustTemp > 520 ? 'red' : m.exhaustTemp > 480 ? 'amber' : 'indigo'}
                  warning={engine.alarms.Combustor}
                  dark={dark}
                />
                <PerformanceCard label="Inlet Temp" value={m.inletTemp} unit="°C" color="indigo" dark={dark} />
                <PerformanceCard label="Compressor P" value={m.pressure} unit="bar" color="indigo" dark={dark} />
                <PerformanceCard label="Heat Rate" value={m.heatRate} unit="BTU/kWh"
                  color="green"
                  dark={dark}
                />
              </div>
            </div>

            {/* Airflow section */}
            <div className="px-3 pt-2 pb-3 border-t border-white/5">
              <div className="text-xs tracking-widest text-black dark:text-white/30 uppercase mb-2">Airflow Temps</div>
              <div className="space-y-1.5">
                {[
                  { label: 'Inlet', temp: '15°C', color: threeToCss(INLET) },
                  { label: 'Post-LPC', temp: '160°C', color: threeToCss(LPC) },
                  { label: 'Intercooler', temp: '40°C', color: threeToCss(INTERCOOLER) },
                  { label: 'Post-HPC', temp: '320°C', color: threeToCss(HPC) },
                  { label: 'Combustor', temp: '1250°C', color: threeToCss(COMBUSTOR_1) },
                  { label: 'Exhaust', temp: `${m.exhaustTemp}°C`, color: threeToCss(EXHAUST) },
                ].map(({ label, temp, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                      <span className="text-black dark:text-white/45 text-xs">{label}</span>
                    </div>
                    <span className="font-mono text-xs" style={{ color }}>{temp}</span>
                  </div>
                ))}
              </div>
            </div>            
          </aside>
        </div>

        {/* ===== Bottom Control Bar ===== */}
        <footer className="flex-shrink-0 flex items-center justify-between px-5 h-15 border-t border-white/6">
          <div className="flex items-center gap-2">
            {/* Run/Stop toggle */}
            <Button
              variant={engine.running ? 'stop' : 'run'}
              size="md"
              onClick={() => {
                // if (!engine.user && !engine.running) return;
                engine.toggleRun();
              }}
              // disabled={!engine.user}
              // title={!engine.user ? 'Login required to control engine' : ''}
            >
              <div className={`w-2 h-2 rounded-full ${engine.running ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
              {engine.running ? 'STOP ENGINE' : 'START ENGINE'}
            </Button>

            {!engine.user && (
              <span className="text-black dark:text-white/25 text-xs tracking-wide">· Login required to control</span>
            )}
          </div>

          {/* Center: time & ID */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-black dark:text-white/25 tracking-wider">
            <span>SER: LMS100-01-0100</span>
            <span>·</span>
            <span>PLANT: Sentinel</span>
            <span>·</span>
            <span>{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
          </div>

          {/* Right: status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-black dark:text-white/30 tracking-wide">
              <StatusTab active={!engine.alarmCount} color={engine.alarmCount ? 'amber' : 'green'} />
              {engine.alarmCount > 0 ? `${engine.alarmCount} FAULT(S)` : 'ALL SYSTEMS NOMINAL'}
            </div>
          </div>
        </footer>
      </div>
    </Tooltip.Provider>
  );
}
