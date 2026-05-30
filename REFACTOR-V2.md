# Studio 3D — Refactor V2: "La máquina está encendida"

> Un plan de rediseño completo para toda la app.  
> La V1 ("capa por capa") fue un buen concepto aplicado solo a la landing.  
> La V2 lo convierte en el lenguaje de toda la experiencia — y agrega los elementos que la hacen verdaderamente especial.

---

## El concepto central

**La app es una impresora que está ON.**

No es una plataforma. No es un dashboard. Es una máquina caliente, en un taller chico, haciendo trabajo real. Desde que entrás (encendés la máquina) hasta que retirás tu pieza (impresión completa), cada pantalla refleja una fase del proceso físico.

Esto no es una metáfora decorativa. Es el principio organizador de cada decisión de diseño: copy, color, animación, layout.

---

## Lo que hace que esto sea especial (y no genérico)

Hay **tres elementos únicos** que ningún template tiene porque vienen de cómo funciona realmente una impresora FDM:

### 1. Color vivo según el filamento seleccionado
Cuando el usuario elige un material/color en el formulario de pedido, una variable CSS (`--accent`) se actualiza hacia ese color de filamento. Si elegís PLA Rojo, todo el acento del formulario vira levemente al rojo. Si elegís PLA Negro, el tono se enfría. La UI refleja físicamente la elección del material.

Esto es funcional, no decorativo. Es único porque viene del dominio real del taller.

### 2. El estado del pedido como animación de capa
La tarjeta de un pedido en estado **PRINTING** tiene una animación CSS de capas construyéndose de abajo hacia arriba, en el color de filamento del pedido. No es una barra de progreso genérica — es una print bed que se llena, capa por capa, en el color exacto de tu pieza. Los otros estados tienen variantes estáticas que comunican su fase.

### 3. El rail Z cambia de significado por página
El rail Z-height que ya existe en la landing no es un decorado de scroll. En cada página significa algo diferente y real:
- **Landing:** progreso de scroll (`SCROLL · Z XXmm`)
- **Formulario de pedido:** progreso de llenado del form (`PROGRESO · XX%`)
- **Lista de pedidos:** cantidad de piezas impresas (`X PIEZAS`)
- **Sigue siendo visible** — como el display de la impresora, siempre presente.

---

## Sistema de diseño (tokens)

### Paleta — misma base V1, extendida

```css
/* Existentes de V1 */
--paper: #F7F3EC        /* panel crema cálido */
--paper-line: #E7DFD2   /* hairline en papel */
--graphite: #1A1613     /* panel grafito cálido */
--graphite-line: #2E2822
--ink: #2A2722          /* texto sobre papel */
--ink-soft: #6B6359     /* texto secundario */
--amber: #FF7A1A        /* acento filamento */
--amber-glow: #FFB066   /* ámbar claro */

/* Nuevos para V2 */
--accent: var(--amber)          /* se sobreescribe con JS cuando hay color elegido */
--layer-active: var(--accent)   /* color de capa en animación */
--temp-cold: #8BA4C0    /* azul frío — estados vacíos / cancelado */
--temp-warm: var(--amber)       /* caliente — activo / imprimiendo */
--temp-done: #C8974A    /* dorado — entregado / completo */
```

### Tipografía

| Rol | Font | Uso |
|-----|------|-----|
| Headings | Space Grotesk, medium/semibold | Títulos de página, nombres |
| Body | Inter, regular/medium | Texto, descripciones |
| Máquina | Space Mono | Labels técnicos, contadores, monos del rail Z, estados |

**Regla:** la máquina habla en mono, las personas hablan en Inter.  
**Eliminar:** `font-black` en todo salvo casos muy específicos. El exceso de bold fue lo que hizo la V1 genérica.

### Texturas y efectos

- **Layer lines:** fondo de `repeating-linear-gradient` ya existente — aplicar en todas las secciones activas/calientes, no solo en la landing
- **Lab notebook:** tarjetas con muy leve textura de papel (`background-image: noise` via CSS o SVG inline tiny) — sutil, casi invisible, pero da calidez táctil
- **Warm shadow:** `box-shadow: 0 4px 32px color-mix(in srgb, var(--amber) 8%, transparent)` en lugar de sombras neutras

---

## Páginas — plan de cambios

### `/` — Landing (V1 → mejorar)

**Problema V1:** el hero es correcto en concepto pero el h1 aparece de golpe. El layer-build es CSS puro con delay, funciona, pero no tiene el drama de una pieza construyéndose de verdad.

**V2 mejoras:**
- El h1 se revela **palabra por palabra**, cada una subiendo como una capa individual (stagger más fino: 5 palabras × 120ms delay cada una)
- La sección de Materiales muestra el color de filamento como un swatch 3D (círculo con gradient radial que simula un filamento enrollado) en vez de un círculo plano
- Agregar una línea de "estado del taller" en el hero: `mono` pequeño, "· Taller abierto · Una impresora · Atención personalizada ·"
- Quitar el `space-y-24 sm:space-y-40` del wrapper — los panels V1 ya manejan el ritmo

---

### `/auth/signin` y `/auth/signup` — "Encender la máquina"

**Problema actual:** sigue siendo "Acceso Terminal", "Email Usuario", "Autenticar" — el copy más frío del sistema.

**V2 concepto:** la impresora arranca. El formulario es el panel de inicio del taller.

**Cambios:**
- Heading: simplemente **"Entrá"** / **"Creá tu cuenta"** — sin jerga
- Fondo: `panel-paper` con `layer-lines` muy tenue (opacity 30%) — el taller en reposo
- El botón de submit: en hover muestra un micro-loader de capa subiendo (mismo `@keyframes layer-build` pero en el botón) antes de hacer el request
- Copy del link: "¿Primera vez?" en vez de "¿Nuevo en el nodo?"
- Form card: sin el `backdrop-blur` que parece UI de smartphone — fondo papel sólido, border `paper-line`, sin border-radius exagerado (`rounded-2xl` en vez de `rounded-[3rem]`)
- Error/success states: fondo `color-mix(in srgb, var(--amber) 10%, white)` para success, mismo approach en rojo para error — sin el `emerald` genérico

---

### `/orders/new` — "El banco de trabajo"

**Es la página más importante de la app.** El 3D viewer existe pero está encerrado en el `OrderForm` como un elemento más. V2 lo pone en el centro.

**Layout V2:**
```
┌─────────────────────────────────────────────────────┐
│  Navbar                                              │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│   VISOR 3D               │   FORMULARIO             │
│   (60% del viewport)     │   (40%, scrolleable)     │
│                          │                          │
│   El modelo rota.        │   Material ──────────   │
│   Las dimensiones        │   Color   ──────────   │
│   aparecen como          │   Escala  ──────────   │
│   cotas de plano         │   Notas   ──────────   │
│                          │                          │
│                          │   [ Enviar pedido ]      │
└──────────────────────────┴──────────────────────────┘
```

- El Z-height rail en esta página muestra el **progreso del formulario** (0-100% según campos completados)
- Al elegir color de filamento → `document.documentElement.style.setProperty('--accent', hexCode)` → toda la UI de esta página cambia al color del filamento elegido
- Las dimensiones del modelo 3D aparecen como cotas flotantes sobre el viewer (etiquetas mono con líneas de cota, como un plano técnico real)
- En mobile: stack vertical, visor arriba (altura fija 50vh), formulario abajo scrolleable

---

### `/orders` — "Historial de impresión"

**Problema actual:** copy frío ("Activo Digital", "Polímero", "Cromática", "Ciclo de Entrega"), tarjetas blancas genéricas, estados de colores arbitrarios (blue-50, purple-50 etc.).

**V2 concepto:** cada tarjeta es una pieza. El estado del pedido es su fase en la impresora.

**Sistema de estados visual:**

| Estado | Visual | Animación |
|--------|--------|-----------|
| PENDING_QUOTE | Capa dashed, ámbar frío | Pulso lento |
| QUOTED | Capa sólida, ámbar | Estático |
| PAYMENT_PENDING | Capa sólida, ámbar + icono | Estático |
| ACCEPTED | Capa sólida, primer layer completo | Estático |
| PRINTING | **Layer lines construyéndose** en el color del filamento | Animación continua ↑ |
| FINISHED | Print bed lleno, dorado | Estático |
| SHIPPED | Línea de envío lateral | Estático |
| DELIVERED | Golden fill, estado completo | Estático |
| CANCELLED | Capa vacía, frío | Estático |

**Copy V2:**
- "Activo Digital" → el nombre del archivo directamente, sin label de industria
- "Polímero" → "Material"
- "Cromática" → "Color"
- "Ciclo de Entrega" → "Entrega"
- Empty state: **"Todavía no imprimimos nada tuyo."** + botón "Mandanos tu primer archivo →"

**Layout tarjeta:**
- Lado izquierdo: animación de estado (la print bed / layer lines)
- Centro: info del pedido (nombre, material, color, entrega)
- Derecha: precio y acción principal

---

### Navbar — "El panel de la máquina"

**Problema actual:** es una navbar genérica restyled con la paleta nueva.

**V2 concepto:** el header de una impresora. Siempre muestra el estado más importante.

**Cambios:**
- Si el usuario tiene un pedido en `PRINTING`: en el centro de la navbar aparece un micro-indicador: `● IMPRIMIENDO` con el color de filamento y el nombre del archivo. Es el display del printer.
- Si no hay pedido activo: simplemente el logo y los links, sin decoración extra
- El logo con `mix-blend-multiply` (ya está) queda bien — conservar
- En desktop: reducir tracking de los links — el `uppercase tracking-widest` es lo que sigue dando sensación de template

---

### Footer — conservar V1 con ajuste menor

El footer de V1 es correcto. Un ajuste:
- Agregar en el cierre: una línea mono muy pequeña con la fecha de hoy en formato técnico: `IMPRESIÓN COMPLETADA · 2026` — le da la firma de taller real

---

## Componentes nuevos a crear

| Componente | Descripción |
|-----------|-------------|
| `PrintBedStatus` | Animación CSS de print bed para tarjetas de pedido. Recibe `status` y `hexColor`. |
| `FilamentSwatch` | Swatch circular que simula un filamento enrollado (gradient radial). Reemplaza el círculo plano de color. |
| `DimensionOverlay` | Overlay de cotas SVG sobre el visor 3D en /orders/new. |
| `ZHeightRail` (v2) | Refactorizar el actual para aceptar un `mode` prop: `scroll` / `form` / `counter`. |
| `MachineStatusBar` | Micro-indicador en Navbar para pedido activo en PRINTING. |
| `WarmInput` | Input con focus state amber, sin los bordes heavy del diseño actual. |

---

## Componentes existentes que reutilizar sin cambios

- `ThreeDViewer.tsx` — el visor funciona bien, solo cambia su contenedor/layout
- `ScrollReveal.tsx` — conservar tal cual
- `OrderRatingForm.tsx` — restylear con tokens V2, lógica intacta
- Todo el sistema de auth (`signIn`, `signOut`, `useSession`) — solo CSS

---

## Sistema de animaciones — física FDM como lenguaje de movimiento

> **Regla de oro:** cada animación tiene un análogo físico en cómo funciona una impresora FDM.  
> Si no podés nombrar el proceso físico que imita, no va.  
> Anti-patrón: fade-up genérico, spring bounce, parallax, partículas, tilt magnético, glassmorphism.

---

### Los 6 primitivos de animación del sistema

Estas son las unidades atómicas. Todo lo demás se construye combinándolas.

---

#### 1. `nozzle-draw` — Deposición de material
**Físico:** el nozzle se mueve en XY depositando filamento en línea continua.  
**UI:** el contenido aparece siendo *dibujado* por un punto que se mueve de izquierda a derecha, dejando contenido visible en su estela — NO un fade, NO un slide.

```css
@keyframes nozzle-draw {
  0%   { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0% 0 0); }
}
```

El truco: mientras el clip-path avanza, un `::before` pseudo-element con `background: var(--amber)` corre justo en el borde del clip — como el material caliente saliendo del nozzle. A 16px de ancho, naranja brillante, desaparece cuando el clip llega al otro lado.

**Velocidad:** constante, `timing-function: linear` — los motores de paso no easeán.  
**Duración:** 600–900ms según el ancho del elemento.  
**Usado en:** headlines, cards al entrar al viewport, labels de sección, cualquier elemento inline.

---

#### 2. `layer-press` — Adherencia de capa
**Físico:** cada nueva capa se presiona contra la anterior, ligeramente comprimida al depositarse.  
**UI:** el elemento aparece con una compresión vertical muy sutil (97% de altura) que se expande a 100% en 120ms. Casi imperceptible pero le da *peso* físico al aparecer.

```css
@keyframes layer-press {
  0%   { transform: scaleY(0.97); opacity: 0.6; }
  60%  { transform: scaleY(1.005); }
  100% { transform: scaleY(1); opacity: 1; }
}
```

**Usado en:** tarjetas de pedido al cargar, secciones completas, el form card en auth.

---

#### 3. `stepper-tick` — Motor de paso
**Físico:** los motores paso a paso de una impresora 3D no se mueven suavemente — dan pequeños saltos discretos.  
**UI:** números, contadores y el Z-rail NO usan `transition: all linear`. Usan `steps(1)` — saltan en valores enteros. La Z-height counter del rail debería verse como un odómetro de impresora, no como un número que flota.

```css
/* Rail Z: cada incremento es un step, no una interpolación */
.z-counter { font-variant-numeric: tabular-nums; }
/* JS: incrementar en enteros vía requestAnimationFrame, sin lerp */
```

**Regla:** todo contador/número en la UI usa `steps()` o actualización entera. Nada de `0 → 147` con decimales en el medio.

---

#### 4. `thermal-glow` — Calor radiante
**Físico:** el nozzle a 200°C irradia calor. Las cámaras térmicas muestran un halo cálido alrededor de la zona activa.  
**UI:** hover state de elementos interactivos — en lugar de `scale(1.02)` (genérico), el elemento emite un halo cálido ámbar que crece desde el centro. Ningún movimiento de layout, solo radiación de calor.

```css
.warm-interactive {
  transition: box-shadow 300ms ease-out;
}
.warm-interactive:hover {
  box-shadow: 
    0 0 0 1px color-mix(in srgb, var(--amber) 20%, transparent),
    0 4px 24px color-mix(in srgb, var(--amber) 15%, transparent),
    0 12px 48px color-mix(in srgb, var(--amber) 8%, transparent);
}
```

**Intensidad variable:** el `MachineStatusBar` con pedido PRINTING tiene un glow más intenso y pulsante. El filament swatch del color seleccionado tiene el glow más fuerte de toda la UI.

---

#### 5. `perimeter-trace` — Trazado de perímetro
**Físico:** antes de llenar el interior (infill), la impresora siempre traza el perímetro exterior de la pieza.  
**UI:** en hover de tarjetas y botones, un borde fino ámbar se *dibuja* alrededor del elemento siguiendo el perímetro — top → right → bottom → left — no aparece instantáneamente.

```css
/* Con pseudo-elements + clip-path o SVG stroke-dasharray trick */
.perimeter-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1.5px solid var(--amber);
  border-radius: inherit;
  opacity: 0;
  /* stroke-dasharray animation clockwise */
  transition: opacity 200ms;
}
.perimeter-card:hover::after {
  opacity: 1;
  animation: trace-perimeter 500ms linear both;
}
```

**Usado en:** tarjetas de pedido, material cards en landing, botones secundarios.

---

#### 6. `retraction-vanish` — Retracción
**Físico:** antes de que el nozzle se mueva sin extruir, retrae el filamento para evitar stringing — un movimiento hacia atrás antes de desaparecer.  
**UI:** exit animation de elementos (toasts, errores, modales). No desaparecen hacia abajo ni hacia arriba — hacen un micro-suck: se contraen levemente hacia su centro (inverse de `layer-press`), luego se disuelven.

```css
@keyframes retraction-vanish {
  0%   { transform: scale(1); opacity: 1; }
  30%  { transform: scale(0.98); opacity: 0.8; }
  100% { transform: scale(0.95); opacity: 0; }
}
```

---

### Animaciones por página

---

#### Landing `/`

**Hero — el h1 se extruye, no aparece**

Cada palabra del h1 tiene su propio `nozzle-draw` con stagger de 140ms. El efecto: como si el nozzle estuviera escribiendo el headline en tiempo real de izquierda a derecha, palabra por palabra. El borde ámbar del clip corre sobre el texto gris carbón — contraste violento y fugaz.

Duración total del headline: ~700ms (5 palabras × 140ms).

**Hero — las layer-lines respiran**

El fondo de layer-lines del hero tiene una animación de `background-position-y` muy lenta — 45 segundos para un ciclo completo. Las líneas suben imperceptiblemente, como si la pieza siguiera creciendo mientras leés. Es el tipo de cosa que notás si la mirás fijo pero no "ves" si solo pasás por ahí.

```css
@keyframes layers-rise {
  from { background-position-y: 0; }
  to   { background-position-y: -6px; } /* 1 layer gap */
}
.hero-layer-bg {
  animation: layers-rise 45s linear infinite;
}
```

**Scrollear = el nozzle se mueve**

Un punto ámbar de 6px de diámetro vive pegado al margen izquierdo del contenido. Cuando scrolleás, se mueve en Y — pero no suavemente. Se mueve en **saltos discretos** (stepper-tick), posicionándose en la coordenada Y de cada seam de sección al pasar por ellas. Como el nozzle moviéndose de una capa a la siguiente. Este es el reemplazo del rail Z en mobile (el rail completo solo se muestra en desktop).

**Seams — el separador se dibuja antes que el contenido**

Cada `layer-seam` hairline se dibuja de izquierda a derecha (`nozzle-draw` sobre el `::before`) antes de que la sección de abajo entre al viewport. El label del seam aparece con `stepper-tick` — una letra a la vez, rápido, como un display de impresora printeando texto.

**Materiales — el filament swatch**

Los swatches de color en las material cards no son círculos planos. Son círculos con un `conic-gradient` que simula el enrrollamiento del filamento (unas vueltas concéntricas levemente visibles) + una pequeña specular highlight. En hover: el círculo rota lentamente (2s) como si el spool estuviera desenvolviéndose.

```css
.filament-swatch {
  background: conic-gradient(
    from 0deg,
    color-mix(in srgb, var(--swatch-color) 80%, black) 0deg,
    var(--swatch-color) 90deg,
    color-mix(in srgb, var(--swatch-color) 90%, white) 180deg,
    var(--swatch-color) 270deg,
    color-mix(in srgb, var(--swatch-color) 80%, black) 360deg
  );
  border-radius: 50%;
  transition: transform 2s linear;
}
.filament-swatch:hover {
  transform: rotate(180deg);
}
```

**CTA section — el fondo de grafito "se llena"**

Cuando la sección CTA entra al viewport, las `layer-lines-dark` del fondo tienen una animación de altura: el gradiente que hace las líneas empieza en `background-size: 100% 0` y crece a `background-size: 100% 100%` en 1.2s. Es la sección más dramática de la página — el panel oscuro *se construye* delante tuyo.

---

#### Auth `/auth/signin` y `/auth/signup`

**La máquina arranca en frío**

Al cargar la página, los campos del formulario aparecen uno por uno con `nozzle-draw` + 100ms de stagger entre cada uno. Pero hay un detalle: antes de que aparezca el primer campo, hay un pequeño texto mono en la esquina superior del form que "printea" un mensaje de boot:

```
INICIANDO SESIÓN...
```

Mono, pequeño, aparece letra a letra en ~400ms (`stepper-tick`), luego se desvanece. Y recién ahí el form hace su entrada. Este momento de ~400ms transforma lo que sería una pantalla de login aburrida en el arranque de una máquina.

**Submit — calentando el nozzle**

El botón de submit tiene tres estados visuales:
1. **Reposo:** ámbar sólido, texto "Entrar"
2. **Hover:** `thermal-glow` + texto cambia a un mono pequeño `200°C ·`
3. **Loading (click):** el botón se transforma — el texto desaparece y una barra `layer-build` llena el botón de izquierda a derecha mientras el request está en vuelo. Como el primer layer del print job.

Si hay error: el botón hace `retraction-vanish`, el mensaje de error aparece con `layer-press`, y el botón vuelve a su estado reposo.

---

#### Formulario `/orders/new`

**Boot sequence del 3D viewer**

Cuando el usuario sube un archivo, antes de que el modelo aparezca en el canvas, el área del viewer muestra un boot sequence en mono sobre fondo grafito:

```
CARGANDO GEOMETRÍA...
CALCULANDO VOLUMEN...
ESTIMANDO TIEMPO...
LISTO.
```

Cada línea aparece con `stepper-tick`, una tras otra, con 300ms entre líneas. Luego el canvas hace `layer-press` y el modelo aparece rotando suavemente.

Si el archivo es inválido: el texto es `ERROR DE GEOMETRÍA.` y el área hace `retraction-vanish`.

**El acento se calienta al elegir filamento**

Cuando el usuario selecciona un color de filamento, `--accent` no cambia instantáneamente. Hay una transición de 600ms que pasa por un tono intermedio más caliente (simulando el nozzle calentándose hasta la temperatura del material nuevo antes de extruir). En CSS:

```css
:root {
  --accent: #FF7A1A;
  transition: --accent 600ms ease-in-out; /* custom property transition — CSS Houdini */
}
```

Si el browser no soporta `@property` (Houdini), fallback instantáneo — graceful degradation.

**El Z-rail muestra el progreso del form**

El rail en esta página no es de scroll — es de completitud del formulario. Por cada campo obligatorio completado, el rail sube un step (stepper-tick). El contador muestra `PROGRESO · XX%`. Cuando llega a 100%, el rail se llena por completo de ámbar y el botón de submit se habilita con un `thermal-glow` súbito — la pieza está lista para imprimir.

**Cotas sobre el modelo 3D**

Cuando las dimensiones del modelo se calculan, aparecen flotando sobre el canvas como cotas de un plano técnico:
- Líneas horizontales/verticales finas
- Etiquetas mono con los valores exactos
- Estas etiquetas entran con `stepper-tick`
- No son decorativas — son los datos reales del modelo

---

#### Lista de pedidos `/orders`

**Tarjeta PRINTING — la única animación continua de la app**

Una tarjeta en estado PRINTING es la pieza que *está en la impresora ahora mismo*. Merece la animación más elaborada del sistema:

```
┌─────────────────────────────────────────────────────┐
│ ● [filament color bar, construyéndose de abajo ↑]   │
│   ──── IMPRIMIENDO ────────────────────────── x%    │
│   nombre_del_archivo.stl                            │
│   PLA · Rojo · Entrega: vie 30 may                  │
│                                      $XXX  [→]      │
└─────────────────────────────────────────────────────┘
```

El `filament color bar` es una columna vertical de ~16px en el lado izquierdo de la tarjeta. Tiene la animación de `layer-build` continua en el `hexCode` del color del pedido — si el usuario pidió PLA Rojo, esa columna está construyéndose en rojo, capa por capa, en loop. Un punto de 4px (el nozzle) corre de abajo hacia arriba justo en el frente del frente de construcción.

**Tarjeta hover — perímetro primero**

Todas las tarjetas que no están en PRINTING usan `perimeter-trace` en hover. El borde ámbar traza el contorno de la tarjeta antes de que el `thermal-glow` empiece. Secuencia exacta: perimeter (500ms) → glow (200ms overlap).

**Empty state — la print bed en reposo**

Si no hay pedidos, en lugar de texto centrado sobre fondo blanco:

Una representación minimalista de una print bed vacía — un grid muy tenue de líneas finas (la bed de vidrio con sus marcas) en panel-paper. Sobre ella, en mono pequeño:

```
CAMA VACÍA.
Todavía no imprimimos nada tuyo.
```

Un botón ámbar: "Mandanos tu primer archivo →"

La bed grid tiene una animación de temperatura muy sutil — un gradiente radial que va de `paper` a `color-mix(in srgb, var(--amber) 5%, var(--paper))` y vuelve, en 4 segundos, como el calentamiento de la cama.

**Estados con temperatura de color**

Cada estado tiene una temperatura visual específica que reemplaza los `blue-50 / purple-50 / emerald-50` genéricos:

| Estado | Color temperatura | Lógica |
|--------|-------------------|--------|
| PENDING_QUOTE | Azul frío `--temp-cold` pulsante | La máquina todavía no se calentó |
| QUOTED | Ámbar templado | Listo para arrancar |
| ACCEPTED | Ámbar + layer base fija | En cola, la cama ya está caliente |
| PRINTING | Filament color, animado | ON |
| FINISHED | Dorado `--temp-done` | Se enfrió, terminó |
| DELIVERED | Dorado sólido, quieto | Completo |
| CANCELLED | Gris frío, opacidad 60% | Apagado |

---

#### Navbar — el display de la máquina

Si hay un pedido activo en PRINTING, en el centro de la navbar:

```
● IMPRIMIENDO  nombre_archivo.stl  [filament dot]
```

El `●` tiene un glow ámbar pulsante suave (2s loop, `opacity 0.6 → 1`). NO es el clásico "ping" de Tailwind — es más lento, como el LED de status de una máquina industrial, no una notificación de app.

**Links de la navbar** — al hacer hover, en lugar de un color change instantáneo, una línea fina se dibuja bajo el link de izquierda a derecha en 200ms (nozzle-draw reducido). Luego al salir, se retrae de derecha a izquierda. Este detalle en un elemento tan pequeño marca la diferencia entre "este site tiene algo" y "es un template".

---

### Principios de timing y motion

| Tipo | Duración | Easing |
|------|----------|--------|
| `nozzle-draw` | 600–900ms | `linear` |
| `layer-press` | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `stepper-tick` | Instantáneo (steps) | `steps(1)` |
| `thermal-glow` (hover) | 300ms in / 500ms out | `ease-out` |
| `perimeter-trace` | 500ms | `linear` |
| `retraction-vanish` | 200ms | `ease-in` |
| Layer-lines background | 45s | `linear infinite` |
| Filament swatch rotate | 2000ms | `linear` |
| MachineStatusBar pulse | 2000ms | `ease-in-out infinite` |

**Regla de reduced motion:** todos los `@keyframes` quedan en su estado final bajo `prefers-reduced-motion: reduce`. El `stepper-tick` (que no usa transición) es el único que puede sobrevivir porque no hay movimiento espacial.

---

### Lo que explícitamente NO se hace

Esto no es una lista de restricciones — es el motivo por el que el resultado no va a parecer un template de Vercel, un shot de Dribbble 2024, o la output default de un AI:

- ❌ **Fade-up en scroll** — el `reveal-up` de V1 queda, pero solo para secciones completas. Ningún elemento individual hace fade-up genérico.
- ❌ **Spring/bounce** — ningún `cubic-bezier` con overshoot pronunciado. La física es de stepper motor, no de gelatina.
- ❌ **Gradient blobs flotantes** — no hay ningún `radial-gradient` animado de colores en el background.
- ❌ **Parallax de velocidades** — no hay capas que scrolleen a distinta velocidad.
- ❌ **Scale hover en cards** — el `thermal-glow` reemplaza el `hover:scale-105` genérico. Nada se mueve de lugar en hover.
- ❌ **Cursor magnético / custom cursor** — son una firma de agencies de diseño europeas de 2022, no de un taller de impresión 3D.
- ❌ **Contadores que cuentan desde 0** — si mostramos números (precio, cantidad), aparecen directamente en su valor final con `stepper-tick`, no con el counter animado de LinkedIn.
- ❌ **Confetti / celebración** — cuando un pedido es DELIVERED, el tono es `--temp-done` quieto y dorado. Calidez, no fiesta.
- ❌ **Page transitions con wipe o slide** — Next.js app router no las necesita y agregarlas rompe la UX de navegación del browser.

---

## Lo que NO hacer

- No agregar más fonts — las tres que hay (Grotesk + Inter + Mono) son suficientes
- No agregar librerías de animación (Framer Motion, etc.) — todo con CSS puro + JS mínimo
- No cambiar la lógica de negocio, las API routes, ni Prisma — solo presentación
- No tocar el panel de admin — funcional, bajo tráfico, no vale el tiempo
- No usar gradientes de colores llamativos — la paleta es cálida y sobria, no vibrante

---

## Reorganización de componentes

`src/components/` tiene todo mezclado en raíz. Organizarlo en subcarpetas antes de empezar el refactor visual evita confusión durante la implementación.

### Estructura objetivo

```
src/components/
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Providers.tsx
├── forms/
│   ├── OrderForm.tsx
│   ├── PaymentAndShippingForm.tsx
│   ├── QuoteForm.tsx
│   └── OrderRatingForm.tsx
├── admin/
│   ├── MaterialManager.tsx
│   ├── QueueManager.tsx
│   └── UserSettings.tsx
├── landing/               ← ya existe (ScrollReveal, ZHeightRail)
│   ├── ScrollReveal.tsx
│   └── ZHeightRail.tsx
└── ThreeDViewer.tsx       ← queda en raíz, lo usan forms/ y landing/
```

### Cómo ejecutarlo sin romper nada

1. Mover los archivos a sus nuevas carpetas
2. Actualizar **todos** los imports que los referencian — buscar con `grep -r "from.*components/"` en `src/`
3. Verificar que `npm run build` termine limpio antes de seguir con el refactor visual

Los archivos que importan componentes actualmente:
- `src/app/layout.tsx` → Navbar, Footer, Providers
- `src/app/(admin)/admin/*/page.tsx` → MaterialManager, QueueManager, UserSettings
- `src/app/orders/new/page.tsx` → OrderForm
- `src/app/orders/[id]/pay/page.tsx` → PaymentAndShippingForm, QuoteForm
- `src/app/orders/page.tsx` → OrderRatingForm

---

## Orden de implementación

0. **Reorganizar componentes** — mover a subcarpetas, actualizar imports, `npm run build` limpio
1. **Tokens y globals** — actualizar `globals.css` con tokens V2, añadir `PrintBedStatus` keyframes
2. **Shared chrome** — Navbar con `MachineStatusBar`, Footer ajuste menor
3. **Auth** — las dos páginas, copy + estilo
4. **Landing** — mejoras sobre V1 (h1 stagger, nozzle-draw, layer-lines respirando)
5. **Formulario de pedido** — layout dos columnas + acento dinámico de filamento
6. **Lista de pedidos** — tarjetas con `PrintBedStatus` + copy V2
7. **Smoke test** — recorrer el flujo completo: landing → auth → pedido → lista → detalle

---

## Verificación

> Esta sección es obligatoria antes de considerar el refactor terminado.  
> El rediseño no vale nada si rompe lo que ya funciona.

### 0. Setup
```bash
npm run dev -- -p 3001   # puerto distinto al server de producción
```
Asegurar que la DB (Prisma) y las variables de entorno estén disponibles — las páginas de landing, orders y admin hacen queries reales.

---

### 1. Build limpio — lo primero
```bash
npm run build
```
El build tiene que terminar sin errores de TypeScript ni de Next.js. Si hay errores de tipo o de imports rotos, se corrigen antes de seguir. El build es la red de seguridad más importante.

```bash
npm run lint
```
Sin warnings nuevos respecto a la rama `main`.

---

### 2. Rutas — ningún 404

Navegar manualmente a cada ruta y confirmar que carga:

| Ruta | Estado esperado |
|------|----------------|
| `/` | Landing carga, materiales y carousel visibles (o secciones vacías si DB vacía, sin error) |
| `/auth/signin` | Formulario de login visible |
| `/auth/signup` | Formulario de registro visible |
| `/orders` | Redirige a `/auth/signin` si no hay sesión |
| `/orders/new` | Redirige a `/auth/signin` si no hay sesión |
| `/profile` | Redirige a `/auth/signin` si no hay sesión |
| `/admin` | 404 o redirect si no es admin |
| `/privacy` | Página de privacidad visible |
| `/terms` | Términos visible |
| `/orders/[id-inexistente]` | No rompe el server — muestra 404 o redirect limpio |

---

### 3. Flujo de usuario completo (smoke test end-to-end)

Hacer este flujo como usuario real, sin saltear pasos:

**3a. Registro**
- Ir a `/auth/signup`
- Registrar una cuenta nueva con email real
- Confirmar redirect a `/auth/signin?msg=registered`
- Ver el mensaje de éxito

**3b. Login**
- Ingresar con las credenciales recién creadas
- Confirmar redirect a `/` (landing)
- Confirmar que el navbar muestra el email y los links correctos (Mis Pedidos, Cotizar Pieza)
- Confirmar que los botones del hero cambian a "Pedir una pieza" / "Mis pedidos"

**3c. Nuevo pedido**
- Ir a `/orders/new`
- Subir un archivo `.stl` o `.obj`
- Confirmar que el visor 3D carga el modelo sin error
- Seleccionar material y color
- Completar el formulario
- Enviar — confirmar que el pedido se crea (redirect o mensaje de confirmación)

**3d. Lista de pedidos**
- Ir a `/orders`
- Confirmar que el pedido recién creado aparece
- Confirmar que el status muestra "En Análisis" (PENDING_QUOTE)
- Confirmar que los datos (archivo, material, color) son correctos

**3e. Logout**
- Hacer logout
- Confirmar redirect a `/`
- Confirmar que el navbar vuelve a mostrar "Entrar" / "Registro"
- Intentar ir a `/orders` — confirmar redirect a login

---

### 4. Flujo de admin (si hay acceso)

- Login como admin
- Confirmar redirect a `/admin` (no a la landing)
- Navegar por `/admin/orders`, `/admin/materials`, `/admin/carousel`, `/admin/users`, `/admin/queue`, `/admin/settings`
- Confirmar que ninguna página tira error 500 ni query rota

---

### 5. Errores de DB — qué buscar

En la consola del servidor (`npm run dev`) no deben aparecer:
- `PrismaClientKnownRequestError`
- `PrismaClientInitializationError`
- `Error: connect ECONNREFUSED` (DB no levantada)
- Stack traces de Next.js en respuestas de página

Si la DB no tiene datos (tablas vacías), las páginas deben mostrar **estados vacíos limpios**, no error 500. Verificar específicamente:
- Landing sin carousel images → sección carousel no renderiza (ya estaba condicionada con `carouselImages.length > 0`)
- Landing sin materials → sección materiales muestra vacío, no rompe
- `/orders` sin pedidos → empty state "CAMA VACÍA" visible, sin error

---

### 6. Verificaciones visuales

| Check | Descripción |
|-------|-------------|
| `mix-blend-multiply` logo | El fondo del logo no se ve como cuadrado sobre el crema |
| Animaciones en desktop | `nozzle-draw`, `thermal-glow`, `perimeter-trace` visibles |
| Reduced motion | Activar en OS → todo estático, sin layout shifts |
| Responsive 375px | Sin scroll horizontal, sin texto cortado |
| Responsive 768px | Layout intermedio correcto |
| Responsive 1024px | Desktop layout activado |
| Responsive 1440px | Nada se estira raro en pantallas anchas |
| Dark mode del OS | La paleta paper/graphite aguanta (no invertir colores) |

---

### 7. Funcionalidad específica que no debe romperse

Estas features existían antes del refactor — confirmar que siguen andando:

- [ ] El carousel de imágenes auto-scrollea (con `prefers-reduced-motion` off)
- [ ] El carousel **no** auto-scrollea con `prefers-reduced-motion` on
- [ ] El visor 3D carga archivos `.stl` y `.obj`
- [ ] El visor 3D muestra OrbitControls (rotar, zoom)
- [ ] Los swatches de color en materiales muestran el `hexCode` correcto
- [ ] El formulario de pedido valida campos obligatorios
- [ ] La sesión persiste al refrescar la página (NextAuth)
- [ ] El link de tracking en pedidos SHIPPED abre en tab nueva
- [ ] El formulario de rating en pedidos DELIVERED guarda y muestra la calificación
- [ ] El admin redirect funciona (admin → `/admin`, user → `/`)

---

### 8. Performance básica

No es un audit completo, pero confirmar:
- La landing no tiene layout shift visible (CLS) — las imágenes del carousel tienen `sizes` correcto
- El logo usa `priority` en el `<Image>` → no bloquea LCP
- No hay imágenes sin `alt` (accesibilidad + SEO)
- Las fuentes (Space Grotesk, Inter, Space Mono) cargan sin FOUT visible
