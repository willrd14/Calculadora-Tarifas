import { Font } from "@react-pdf/renderer";

import spaceGroteskBold from "@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff";

import ibmPlexSansRegular from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff";
import ibmPlexSansMedium from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff";
import ibmPlexSansSemiBold from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff";

// Roboto Mono, not IBM Plex Mono: @react-pdf/renderer's font subsetter
// (pdfkit + fontkit) throws "RangeError: Offset is outside the bounds of
// the DataView" while embedding IBM Plex Mono as soon as the rendered text
// contains a space next to certain glyphs (e.g. "No. 001", "Fecha: ...") —
// reproduced in isolation, unrelated to accents/woff-vs-woff2/multi-font
// use. Roboto Mono renders the same content fine and is visually close
// enough to the template's monospace numerals.
import robotoMonoRegular from "@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff";
import robotoMonoMedium from "@fontsource/roboto-mono/files/roboto-mono-latin-500-normal.woff";
import robotoMonoSemiBold from "@fontsource/roboto-mono/files/roboto-mono-latin-600-normal.woff";

export const FONT_SANS = "IBM Plex Sans";
export const FONT_MONO = "Roboto Mono";
export const FONT_DISPLAY = "Space Grotesk";

let registered = false;

/**
 * Registra en `@react-pdf/renderer` las fuentes usadas por la plantilla de
 * cotización (self-hosted vía `@fontsource/*`, sin depender de red en
 * tiempo de ejecución). Idempotente — solo se registra una vez.
 */
export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: FONT_DISPLAY,
    fonts: [{ src: spaceGroteskBold, fontWeight: 700 }],
  });

  Font.register({
    family: FONT_SANS,
    fonts: [
      { src: ibmPlexSansRegular, fontWeight: 400 },
      { src: ibmPlexSansMedium, fontWeight: 500 },
      { src: ibmPlexSansSemiBold, fontWeight: 600 },
    ],
  });

  Font.register({
    family: FONT_MONO,
    fonts: [
      { src: robotoMonoRegular, fontWeight: 400 },
      { src: robotoMonoMedium, fontWeight: 500 },
      { src: robotoMonoSemiBold, fontWeight: 600 },
    ],
  });
}
