# Template — Plantilla de Cotización

Diseño de referencia para el PDF de cotización que la app "Calculadora de
Tarifas" debe generar (ver `docs/PRD.md` §5.3 en la raíz del proyecto).

- **Diseño editable en línea:** https://claude.ai/artifact/4HTHdAFXv1MKBTc7DLp8ev
- `Main.dc.html` — fuente del diseño (formato Design Components). Sirve como
  referencia visual exacta: colores, tipografía, espaciados y estructura de
  cada sección (encabezado, datos del cliente, tabla de ítems, totales,
  condiciones, pie de página).
- `canvas.json` — layout del canvas (tamaño de página tipo Carta, 816×1200px
  a 96px/pulgada).

## Paleta y tipografía

- Acento: `#1d4ed8` (azul)
- Fondo: `#fdfcfa` · Texto principal: `#1c1a17` · Texto secundario: `#6b6459`
- Tipografías: Space Grotesk (títulos), IBM Plex Sans (texto), IBM Plex Mono
  (números, fechas, montos)

## Cómo usarla en el código

Este archivo no se importa directamente — es la referencia de diseño. Al
implementar la Fase 2 del PRD (exportación a PDF con jsPDF o
@react-pdf/renderer), replicar esta estructura y estos valores exactos
(colores, tamaños de fuente, espaciados) en el componente/plantilla de PDF
del proyecto.

Los campos entre corchetes (`[Nombre del cliente]`, `[Módulo 1]`, etc.) son
los que la app debe rellenar dinámicamente con los datos reales de cada
cotización.
