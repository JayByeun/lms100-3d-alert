import { useEffect, useState } from "react";

export const RED_ORANGE = 0xff2222;
export const RED = 0xff0000;
export const DEEP_SKY_BLUE = 0x00d1ff;
export const SELECTED_YELLOW = 0xffb300;
export const SCARLET = 0xff3300;
export const DUSK = 0x182433;
export const WHITE = 0xffffff;
export const CORNFLOWER_BLUE = 0x4488ff;
export const SAFETY_ORANGE = 0xff7700;
export const INLET = 0x7fdcff;
export const LPC = 0x4fb6ff;
export const INTERCOOLER = 0x2ee6ff;
export const HPC = 0x3f7cff;
export const COMBUSTOR_1 = 0xff4d00;
export const COMBUSTOR_2 = 0x4a0b00;
export const HPT_1 = 0xff6a6a;
export const HPT_2 = 0x3a0000;
export const LPT_1 = 0xff9a3c;
export const LPT_2 = 0x2a1200;
export const EXHAUST = 0x6b7680;
export const DARK_ORANGE = 0xff8800;
export const ELECTRIC_BLUE = 0x7fdcff;

export const threeToCss = (color: number): string => `#${color.toString(16).padStart(6, "0").toUpperCase()}`;
export const cssToThree = (color: string): number => Number(color.replace("#", "0x"));

export const useTheme = () => {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, setDark, toggle: () => setDark(v => !v) };
}