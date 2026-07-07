# Mar An Cloth — Space Age Garment Experience

## Project Context

Este sitio es el destino del chip NFC integrado en prendas Mar An Cloth. Al escanear la prenda, el usuario llega aquí y vive una experiencia inmersiva que combina estética Space Age de los años 60 con la identidad de la marca. El sitio también funciona como landing independiente.

---

## Stack

| Tecnología | Rol |
|---|---|
| **Astro** | Framework base / routing / build |
| **React** | Componentes interactivos (islas Astro con `client:load`) |
| **Locomotive Scroll** | Smooth scroll + scroll-triggered animations |
| **GSAP** | Animaciones de alta precisión (timeline, ScrollTrigger) |
| **shadcn/ui** | Sistema de componentes (Dialog, Badge, Tooltip…) |
| **Tailwind CSS v4** | Utilidades de estilo |

> Usar `client:load` en islas React que necesiten Locomotive o GSAP. Usar `client:visible` para secciones below-the-fold.

---

## Development

Iniciar el servidor en modo background:

```bash
astro dev --background
```

Administrar el servidor:

```bash
astro dev stop    # detener
astro dev status  # verificar estado
astro dev logs    # ver logs
```

Instalar dependencias del stack cuando sea necesario:

```bash
pnpm add @astrojs/react react react-dom locomotive-scroll gsap
pnpm add -D @types/react @types/react-dom
pnpm dlx shadcn@latest init
```

---

## Arquitectura de Secciones

El sitio es una **single-page experience** con secciones de pantalla completa (`100dvh`). Locomotive Scroll maneja la navegación fluida entre ellas. Cada sección ocupa exactamente el viewport completo — sin overflow parcial entre secciones.

```
/
├── [HERO]          → Logo animado + tagline, entrada escalonada por scroll
├── [PRENDA]        → Showcase fotográfico/visual de la pieza
├── [COMPOSICIÓN]   → Etiqueta de tela — composición + iconos de cuidado ISO
└── [COLECCIÓN]     → CTA + próximas prendas o siguiente drop
```

Estructura HTML base:

```html
<!-- data-scroll-container requerido por Locomotive -->
<div data-scroll-container>
  <section data-scroll-section class="h-[100dvh]"> <!-- HERO --> </section>
  <section data-scroll-section class="h-[100dvh]"> <!-- PRENDA --> </section>
  <section data-scroll-section class="h-[100dvh]"> <!-- COMPOSICIÓN --> </section>
  <section data-scroll-section class="h-[100dvh]"> <!-- COLECCIÓN --> </section>
</div>
```

---

## Design System — Space Age 60s

### Filosofía

Inspiración directa: Pierre Cardin "Cosmocorps", Courrèges FW1964, Paco Rabanne, NASA Worm (1974). Formas modulares, geometría limpia, contraste extremo entre blanco y negro con destellos cromados. Lo retro-futurista no es decorativo: **es la identidad de la marca**.

### Paleta de Color

```css
/* Definir en globals.css como custom properties */
:root {
  --color-void:    #0a0a0a;   /* negro espacio — fondo secciones oscuras */
  --color-lunar:   #f5f5f0;   /* blanco lunar — fondo secciones claras, texto primario */
  --color-chrome:  #c8c8c8;   /* plata cromada — acentos metálicos, bordes */
  --color-orbit:   #e8e020;   /* amarillo órbita — CTA principal, highlights */
  --color-cosmos:  #1a1aff;   /* azul cosmos — acento secundario */
  --color-signal:  #ff3c00;   /* naranja señal — alertas, detalles de énfasis */
}
```

**Regla de alternancia**: secciones alternan entre `--color-void` (oscura) y `--color-lunar` (clara) para crear ritmo visual. Nunca dos secciones del mismo tono consecutivas.

### Tipografía

```
Display / Hero:   "Space Grotesk" — weight 700–800, tracking -0.04em
Monoespaciada:    "DM Mono" — weight 400, UPPERCASE en labels y specs
Decorativa:       "Bebas Neue" — grandes dimensiones, elementos gráficos
```

Importar desde Google Fonts en el `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=DM+Mono&family=Bebas+Neue&display=swap" rel="stylesheet" />
```

Escala tipográfica con `clamp()` para fluidez:

```css
.text-hero    { font-size: clamp(3rem, 10vw, 9rem); letter-spacing: -0.04em; }
.text-section { font-size: clamp(1.5rem, 4vw, 3.5rem); letter-spacing: -0.02em; }
.text-label   { font-size: 0.6875rem; letter-spacing: 0.2em; text-transform: uppercase; }
```

### Geometría y Forma

- **Border-radius**: `rounded-full` (píldoras) o `rounded-none` (cuadrado puro). Nunca `rounded-md` ni valores intermedios.
- **Divisores**: líneas de `1px solid` en `--color-chrome`. Nunca degradados de borde.
- **Formas decorativas**: círculos perfectos SVG, retículas, líneas de escaneo animadas, módulos hexagonales.
- **Grid**: base de 12 columnas con gutters de `clamp(1rem, 4vw, 4rem)`.

### Efectos Visuales

```css
/* Overlay de líneas de escaneo — sobre fondos oscuros */
.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.018) 2px,
    rgba(255, 255, 255, 0.018) 4px
  );
}

/* Borde cromado sutil */
.chrome-border {
  border: 1px solid rgba(200, 200, 200, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Brillo metálico en texto */
.metallic-text {
  background: linear-gradient(135deg, #fff 0%, #c8c8c8 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Animaciones con Locomotive + GSAP

### Setup de Locomotive con ScrollTrigger

```typescript
// src/lib/locomotive.ts
import LocomotiveScroll from 'locomotive-scroll';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll(container: HTMLElement) {
  const scroll = new LocomotiveScroll({
    el: container,
    smooth: true,
    multiplier: 0.9,
    lerp: 0.08,
  });

  scroll.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(container, {
    scrollTop(value) {
      return arguments.length
        ? scroll.scrollTo(value as number, { duration: 0, disableLerp: true })
        : (scroll as any).scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: (container.style as any).transform ? 'transform' : 'fixed',
  });

  ScrollTrigger.addEventListener('refresh', () => scroll.update());
  ScrollTrigger.refresh();

  return scroll;
}
```

### Wrapper de React

```tsx
// src/components/ScrollContainer.tsx
import { useEffect, useRef } from 'react';
import { initScroll } from '../lib/locomotive';

export function ScrollContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const scroll = initScroll(ref.current);
    return () => scroll.destroy();
  }, []);

  return (
    <div ref={ref} data-scroll-container>
      {children}
    </div>
  );
}
```

### Patrones de Animación por Sección

**Hero — entrada escalonada al cargar:**
```typescript
gsap.timeline({ defaults: { ease: 'power3.out' } })
  .from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.6 })
  .from('.hero-logo', { opacity: 0, y: 50, duration: 1.2 }, '-=0.3')
  .from('.hero-tagline .word', { opacity: 0, y: 30, stagger: 0.07 }, '-=0.6')
  .from('.hero-cta', { opacity: 0, scale: 0.92, duration: 0.5 }, '-=0.2');
```

**Reveal por scroll — línea a línea:**
```typescript
ScrollTrigger.create({
  trigger: '.prenda-heading',
  scroller: '[data-scroll-container]',
  start: 'top 75%',
  onEnter: () =>
    gsap.from('.prenda-heading .word', {
      opacity: 0, y: 40, stagger: 0.06, ease: 'expo.out', duration: 0.9,
    }),
});
```

**Parallax Space Age con Locomotive:**
```html
<!-- Velocidades negativas = movimiento inverso al scroll (efecto profundidad) -->
<img data-scroll data-scroll-speed="0.4" src="..." alt="..." />
<div data-scroll data-scroll-speed="-0.3" class="decorative-circle" />
```

**Etiqueta — caída de entrada:**
```typescript
gsap.from('.etiqueta-card', {
  scrollTrigger: {
    trigger: '.section-etiqueta',
    scroller: '[data-scroll-container]',
    start: 'top 60%',
  },
  y: -80,
  rotation: -3,
  opacity: 0,
  duration: 1.1,
  ease: 'back.out(1.4)',
});
```

### Reglas de Animación

- Micro-interacciones: `150–300ms`
- Transiciones de reveal: `600–1000ms`
- Easing de entrada: `power3.out` / `expo.out` / `back.out`
- Easing de salida: `power2.in`
- Animar **solo** `transform` y `opacity` — nunca `width`, `height`, `top`, `left`
- Máximo 2 elementos animándose simultáneamente en la misma vista
- Siempre respetar `prefers-reduced-motion` — desactivar Locomotive y GSAP si está activo

---

## Sección: Etiqueta de Composición

Esta es la sección central para usuarios que llegan por NFC. Debe replicar con fidelidad la estética de una etiqueta textil cosida en la prenda.

### Layout Visual

```
╔══════════════════════════════╗
║   D · N O R I E G A         ║  ← DM Mono, tracking máximo
╠══════════════════════════════╣
║  COMPOSICIÓN                 ║
║                              ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓  60%           ║  ← barra proporcional al porcentaje
║  ALGODÓN ORGÁNICO            ║
║                              ║
║  ▓▓▓▓▓▓  30%                 ║
║  POLIÉSTER RECICLADO         ║
║                              ║
║  ▓▓  10%                     ║
║  ELASTANO                    ║
╠══════════════════════════════╣
║  INSTRUCCIONES DE CUIDADO    ║
║                              ║
║  [≤30°] [✗SEC] [PLN] [✗BLQ] ║  ← iconos SVG ISO 3758
╠══════════════════════════════╣
║  HECHO EN MÉXICO · RN 00001  ║
╚══════════════════════════════╝
```

### Especificaciones de Diseño de la Etiqueta

- **Fondo de la tarjeta**: `#f0ede6` (crema tela) con textura SVG `feTurbulence` sutil
- **Tipografía**: `DM Mono` exclusivamente, `text-[10px]` a `text-[13px]`, todo en UPPERCASE
- **Borde**: doble línea — `outline: 3px solid #1a1a1a; outline-offset: -6px; border: 1px solid #1a1a1a`
- **Ancho máximo**: `400px` en desktop, `90vw` en móvil
- **Padding interno**: `2rem` con separadores `<hr>` de `1px` color `#1a1a1a`
- **Barras de composición**: `<div>` con `width` proporcional al porcentaje, altura `6px`, colores diferenciados por material
- **Sombra**: `box-shadow: 8px 8px 0px #1a1a1a` — efecto plano estilo retro

### Colores de Barras de Composición

```
Algodón orgánico:        #2d5016  (verde oscuro)
Poliéster reciclado:     #1a1aff  (azul cosmos)
Elastano:                #ff3c00  (naranja señal)
Lana merino:             #8b4513  (marrón)
Lyocell / TENCEL:        #4a7c59  (verde salvia)
```

### Iconos de Cuidado ISO 3758

Crear como componentes React SVG en `src/components/icons/CareIcons.tsx`:

- `WashColdIcon` — tina de agua con "30" interior
- `NoDryerIcon` — cuadrado con círculo tachado con X
- `IronLowIcon` — silueta de plancha con un punto
- `NoBleachIcon` — triángulo tachado con X
- `DryCleanIcon` — círculo simple

Todos los iconos: `viewBox="0 0 24 24"`, `width="28" height="28"`, `stroke="currentColor"`, `stroke-width="1.5"`, `fill="none"`. Cada uno con `aria-label` descriptivo en español.

---

## Estructura de Archivos

```
src/
├── components/
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── PrendaSection.tsx
│   │   ├── EtiquetaSection.tsx
│   │   └── ColeccionSection.tsx
│   ├── ui/                        # componentes shadcn/ui
│   ├── icons/
│   │   ├── CareIcons.tsx          # iconos ISO de cuidado de tela
│   │   └── BrandIcons.tsx
│   └── ScrollContainer.tsx        # wrapper de Locomotive
├── lib/
│   ├── locomotive.ts              # setup Locomotive + ScrollTrigger
│   └── animations.ts             # funciones de animación reutilizables
├── styles/
│   └── globals.css                # tokens CSS + Tailwind base
└── pages/
    └── index.astro                # punto de entrada
```

---

## Accesibilidad

- Contraste mínimo 4.5:1 en todo texto — verificar especialmente blanco sobre negro y viceversa
- Todos los iconos SVG de cuidado deben tener `aria-label` en español (ej: `aria-label="Lavar a máximo 30°C"`)
- La etiqueta de composición debe ser completamente legible sin animaciones
- Respetar `prefers-reduced-motion`: no inicializar Locomotive ni GSAP si está activo
- Tab order lógico: el scroll controlado no debe romper la navegación por teclado

---

## Responsive

| Breakpoint | Comportamiento |
|---|---|
| `< 640px` | Locomotive deshabilitado; CSS `scroll-snap-type: y mandatory` por sección; etiqueta a `90vw` |
| `640–1024px` | Locomotive activo con `lerp: 0.1`; layout de dos columnas en sección prenda |
| `> 1024px` | Experiencia completa; parallax activo; etiqueta centrada con `max-w-[400px]` |

En móvil el parallax se reemplaza con `scroll-snap` nativo para garantizar performance. No sacrificar fluidez de scroll por efectos visuales en dispositivos de gama media/baja.

---

## Referencias de Estilo

- Courrèges FW1964 — blanco/negro puro, siluetas geométricas, módulos
- Pierre Cardin "Cosmocorps" 1967 — círculos, plata, uniformes espaciales
- NASA Graphics Standards Manual 1975 — retícula técnica, tipografía funcional
- Etiquetas textiles vintage — DM Mono, crema, especificaciones densas

---

## Documentación

- [Locomotive Scroll](https://scroll.locomotive.ca/docs)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [shadcn/ui](https://ui.shadcn.com)
- [Astro + React integration](https://docs.astro.build/en/guides/framework-components/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Astro Routing](https://docs.astro.build/en/guides/routing/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
