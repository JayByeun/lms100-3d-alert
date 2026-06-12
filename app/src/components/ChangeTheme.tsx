import { useEffect, useState } from "react";

export const useTheme = () => {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, setDark, toggle: () => setDark(v => !v) };
}