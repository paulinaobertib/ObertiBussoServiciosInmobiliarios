type Gap = number | { xs?: number; sm?: number; md?: number };

export const fabSlot = (slot: number, size = "3.5rem", gap: Gap = { xs: 8, sm: 12, md: 16 }) => {
  const gx = typeof gap === "number" ? gap : gap.xs ?? 8;
  const gs = typeof gap === "number" ? gap : gap.sm ?? gx;
  const gm = typeof gap === "number" ? gap : gap.md ?? gs;

  return {
    position: "fixed" as const,
    zIndex: 10,
    top: "auto",
    left: "auto",
    bottom: {
      xs: `calc(16px + env(safe-area-inset-bottom, 0px))`,
      sm: `calc(20px + env(safe-area-inset-bottom, 0px))`,
      md: `calc(24px + env(safe-area-inset-bottom, 0px))`,
    },
    right: {
      xs: `calc(16px + env(safe-area-inset-right, 0px) + ${slot} * (${size} + ${gx}px))`,
      sm: `calc(20px + env(safe-area-inset-right, 0px) + ${slot} * (${size} + ${gs}px))`,
      md: `calc(24px + env(safe-area-inset-right, 0px) + ${slot} * (${size} + ${gm}px))`,
    },
  };
};
