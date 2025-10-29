import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";

const options = [
  { value: "light", icon: <Sun className="h-5 w-5" /> },
  { value: "system", icon: <Monitor className="h-5 w-5" /> },
  { value: "dark", icon: <Moon className="h-5 w-5" /> },
];

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState("system");

  useEffect(() => {
    setMounted(true);
    setActive(theme ?? "system");
  }, [theme]);

  if (!mounted) {
    return (
      <div className="h-10 w-[150px] rounded-full bg-muted animate-pulse" />
    );
  }

  const index = options.findIndex((o) => o.value === active);
  const slotWidth = 150 / options.length; // total width / jumlah opsi

  return (
    <div className="relative flex h-7 w-[150px] overflow-hidden rounded-full border bg-muted">
      {/* Sliding indicator */}
      <motion.div
        layoutId="theme-indicator"
        className="absolute top-0 left-0 h-full rounded-full bg-foreground"
        style={{ width: slotWidth }}
        initial={false}
        animate={{ x: index * slotWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />

      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => {
            setTheme(opt.value as "dark" | "light" | "system");
            setActive(opt.value);
          }}
          className={`relative z-10 flex flex-1 items-center justify-center transition-colors ${
            active === opt.value ? "text-background" : "text-foreground"
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
