export const PORTFOLIO_ICONS: Record<string, string> = {
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  house: "M4 11 12 4l8 7M6 10v9h12v-9M10 19v-5h4v5",
  cap: "M3 7l9-4 9 4-9 4-9-4Zm3 2v5c0 1.7 2.7 3 6 3s6-1.3 6-3V9",
  gamepad: "M6 12h4m-2-2v4M15 11h.01M18 13h.01M17.3 5H6.7a4 4 0 0 0-3.98 3.59L2 14a3 3 0 0 0 5.4 2.1L8 15h8l.6 1.1A3 3 0 0 0 22 14l-.72-5.41A4 4 0 0 0 17.3 5Z",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.52-4.48 10-10 10ZM2 21c0-3 1.85-5.36 5.08-6",
  cart: "M6 6h15l-1.5 9h-12zM6 6 5 3H2m4 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm11 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  phone: "M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm3 18h4",
};

export const PORTFOLIO_ICON_KEYS = Object.keys(PORTFOLIO_ICONS);

/** Ícono por defecto según categoría, cuando el proyecto no tiene uno. */
export function iconForCat(cat: string): string {
  if (cat === "realestate") return "house";
  if (cat === "lms") return "cap";
  return "users";
}
