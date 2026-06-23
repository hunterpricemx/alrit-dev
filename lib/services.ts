export type ServiceId =
  | "wordpress"
  | "webdev"
  | "lms"
  | "ecommerce"
  | "realestate"
  | "systems"
  | "mobile"
  | "automation";

export type Service = {
  id: ServiceId;
  slug: string;
  /** Accent color used on the service card. */
  accent: string;
  /** Inline SVG path data for a simple 24x24 icon. */
  icon: string;
  /** Placeholder media for the gallery card (replace with real art). */
  image: string;
  /** Whether the card art reads as dark (white text) or light (dark text). */
  tone: "dark" | "light";
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/760/1040`;

export const SERVICES: Service[] = [
  { id: "wordpress", slug: "wordpress", accent: "#21759b", tone: "dark", image: img("alrit-svc-wp"), icon: "M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm2 0 2.4 6.6M12 4l3 9 2.5-6.5" },
  { id: "webdev", slug: "desarrollo-web", accent: "#6c5ce7", tone: "dark", image: img("alrit-svc-web"), icon: "m8 9-3 3 3 3m8-6 3 3-3 3M13 6l-2 12" },
  { id: "lms", slug: "lms", accent: "#0984e3", tone: "light", image: img("alrit-svc-lms"), icon: "M3 7l9-4 9 4-9 4-9-4Zm3 2v5c0 1.7 2.7 3 6 3s6-1.3 6-3V9" },
  { id: "ecommerce", slug: "ecommerce", accent: "#e84393", tone: "dark", image: img("alrit-svc-ecom"), icon: "M5 7h14l-1.2 9.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.5L5 7Zm3 0a4 4 0 0 1 8 0" },
  { id: "realestate", slug: "real-estate", accent: "#00b894", tone: "light", image: img("alrit-svc-re"), icon: "M4 11 12 4l8 7M6 10v9h12v-9M10 19v-5h4v5" },
  { id: "systems", slug: "sistemas", accent: "#fdcb6e", tone: "dark", image: img("alrit-svc-sys"), icon: "M5 4h14v12H5zM3 20h18M9 8h6M9 11h6" },
  { id: "mobile", slug: "apps-moviles", accent: "#ff7675", tone: "dark", image: img("alrit-svc-app"), icon: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 15h2" },
  { id: "automation", slug: "automatizaciones", accent: "#fd9644", tone: "light", image: img("alrit-svc-auto"), icon: "M12 8V5m0 14v-3m4-5h3M5 12h3m7.5-4.5 2-2m-13 13 2-2m9 0 2 2m-13-13 2 2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" },
];
