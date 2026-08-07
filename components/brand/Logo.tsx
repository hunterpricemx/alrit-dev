/**
 * Logo oficial de Alrit.dev.
 *
 * El trazo usa `currentColor`, así que hereda el color del contenedor: tinta
 * sobre el header claro, blanco sobre el footer y el admin oscuros. El acento
 * (".dev" y el destello del isotipo) sale de `--logo-accent`, que por defecto es
 * el cian de marca.
 *
 * El SVG original de Illustrator traía un `<style>` con clases `.st0`–`.st7` y un
 * `id`; ambos son globales al documento y chocan con cualquier otro SVG inline,
 * así que aquí van como atributos.
 */

type LogoProps = {
  className?: string;
  /** `full` = isotipo + palabra (3.3:1). `mark` = solo el isotipo (≈1:1). */
  variant?: "full" | "mark";
  /**
   * Etiqueta para lectores de pantalla. Omítela cuando el contenedor ya etiqueta
   * (p. ej. un <Link aria-label>), y el SVG queda decorativo.
   */
  title?: string;
};

const ACCENT = "var(--logo-accent, #01e7f0)";

/** Isotipo: la "A" angular con su destello. */
const MARK = (
  <>
    <path
      fill="currentColor"
      d="M0,456.51l46.46-79.27,95.98-167.75c2.68-4.69,3.83-9.28,7.51-12.92l73.24-72.55,44.93-44.19,40.58-39.37L350.56,0c1.32.14,3.14,1.32,3.72,2.76l.04,177.27-233.74,191.18-94.86,75.05-16.78,13.65c-3.19-2.19-5.86-2.59-8.93-3.39Z"
    />
    <path
      fill="currentColor"
      d="M385.29,240.11l92.8,200.7-58.55-.6c-11.94-1.94-23-5.14-33.66-10.27-13.48-7.28-24.91-16.24-36.48-26.68l-156.69-.06-3.56-7.05,56.36-50.76,24.06-21.36,14.87.48c9.13,1.32,16.05-1.85,22.57-7.71l78.28-76.7Z"
    />
    <path
      fill={ACCENT}
      d="M370.03,213.97s8.17,19.48,2.43,28.17l-48.96,48.17c-2.08,3.13-9.48,8.87-9.22,8.87-2.98-9.82-3.57-22.72-1.65-29.91l57.39-55.3Z"
    />
  </>
);

/** Logotipo: "ALRIT" en el trazo, ".dev" en el acento. */
const WORDMARK = (
  <>
    <path
      fill="currentColor"
      d="M685.5,272.93l19.6-2.02-27.61-57.46-61.46,120.33-34.83-.17,11.49-23.43,70.37-142.29,28.48.14,79.67,165.53-35.71.13-12.37-22.38-37.63-38.37Z"
    />
    <path
      fill="currentColor"
      d="M974.31,303.21l.16,30.17-146,.05-.04-165.42,32.04-.09.08,135.17,113.76.13Z"
    />
    <path
      fill="currentColor"
      d="M1153.24,273.84l46.57,59.72-37.97.09-47.23-59.9-46.06.03-.23,59.86h-32.12s-.06-165.73-.06-165.73l124.36-.04c10.25,2.24,18.06,7.93,24.99,15.57,3.61,3.94,8.61,8.24,8.66,14.03l.41,43.92c-5.66,11.15-12.82,21.67-23.41,28.39-5.13,3.26-11.34,3.39-17.91,4.06ZM1162.75,230.36v-22.04c-2.75-4.37-6.4-7.37-11.24-9.37l-82.65.13-.21,44.22,82.84-.1c5.99-2.87,11.26-6.82,11.26-12.84Z"
    />
    <path
      fill="currentColor"
      d="M1295.26,333.69l-32.33.06-.04-165.71,32.34-.13.03,165.79Z"
    />
    <path
      fill="currentColor"
      d="M1448.51,333.64l-32.31.07-.04-134.63-59.67-.15.82-31.01,156.42-.02-5.73,31.12-59.5.1v134.53Z"
    />
    <path
      fill={ACCENT}
      d="M1319.8,451.53c-1.19,3.93-4.9,6.42-8.7,6.03-3.42-.34-7.13-2.97-7.4-7.28-.33-5.27,4.36-8.93,9.27-8.36,4.3.5,8.3,4.78,6.83,9.61Z"
    />
    <path
      fill={ACCENT}
      d="M1377.07,449.15c-4.84,6.18-11.93,9.3-19.91,8.76-7.15-.48-14.22-3.83-18.98-10.42-7.17-9.9-7.69-23.59-1.94-34.27,4.8-7.86,12.23-12.22,21.32-12.73,7.49-.42,13.91,1.97,19.55,8.23l.2-34.87,11.66.05.03,82.55-10.92.18-1.01-7.48ZM1350.8,444.32c5.89,5.11,13.88,4.34,19.61.65,5.28-3.4,7.47-9.75,7.29-16.66-.19-6.95-3.27-13.2-8.82-16.1-5.71-2.98-12.9-2.97-18.04,1.56-8.71,7.68-9.27,22.52-.04,30.54Z"
    />
    <path
      fill={ACCENT}
      d="M1432.97,448c5.54-.67,9.47-3.75,12.84-7.78l7.79,5.36c-4.25,8.3-12.81,12.03-21.96,12.35-16.2.58-27.51-10.78-28.56-26.65-1.06-15.96,9.03-29.96,25.47-30.81,8.58-.45,16.44,2.27,21.74,9.16,5.05,6.56,6.78,14.9,5.77,22.76l-40.98.08c-.22,9.25,7.76,16.75,17.89,15.53ZM1444.56,423.33c-.69-9.57-7.97-13.79-15.51-13.46-7.16.31-13.22,5.67-13.88,13.78l29.39-.32Z"
    />
    <path
      fill={ACCENT}
      d="M1504.51,401.58l11.78.38-20.62,54.57-12.63.08-21.6-54.88,12.82.18,15.15,41.87,15.1-42.19Z"
    />
  </>
);

export default function Logo({ className, variant = "full", title }: LogoProps) {
  const label = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true as const };

  return (
    <svg
      className={className}
      viewBox={variant === "mark" ? "0 0 478.09 459.9" : "0 0 1516.29 459.9"}
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      {...label}
    >
      {MARK}
      {variant === "full" && WORDMARK}
    </svg>
  );
}
