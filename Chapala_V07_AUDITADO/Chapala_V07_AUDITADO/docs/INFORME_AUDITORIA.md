# Informe de auditoría final – Carnicería Chapala (V07 auditado)

**Proyecto escolar – Grupo 2 – Feria de Informática 2026**
Auditor: Claude (revisión independiente, con herramientas automáticas). Este informe dice **qué se encontró, qué se corrigió y qué se probó de verdad**, y deja claro lo que **no** se pudo verificar.

---

## 1. Resultado

# ❌ NO APTO para publicar todavía

**Por qué:** el código y el sitio quedaron en buen estado técnico (ver secciones 3 y 4), pero hay **cuatro problemas de derechos y autorizaciones que no se pueden resolver programando** y que conviene resolver *antes* de poner el sitio en internet:

| # | Bloqueante | Dónde |
|---|---|---|
| **B1** | Tres fotos de productos tienen la **marca de agua «pngtree»** (señal de que se usó la versión de vista previa de ese banco de imágenes): alitas, pata de pollo y carne molida. Salvo que tengan licencia, no se pueden publicar así. | `img/alitas.png`, `img/pata-de-pollo.png`, `img/carne-molida.png` |
| **B2** | La textura del camarón (`camaron.png`) es el **logotipo de «Don Kamarón – Mariscos»**, una marca de otro negocio. Se usa además como «enemigo» del juego. | `img/texturas/camaron.png` |
| **B3** | La textura `bala-camaron.png` **parece una foto de banco de imágenes** (3094 × 2410 px) y no hay forma de saber su origen ni su licencia. Las demás imágenes sin origen conocido (pierna de cerdo, chorizo, yupi, balanza) tampoco se pueden confirmar. | `img/texturas/bala-camaron.png` y otras |
| **B4** | La música `chomp` es un archivo de 65 segundos con **metadatos de un servicio de video** (título «chomp.», «Google»): probablemente se bajó de una plataforma. No hay licencia conocida. | `sfx/chomp.m4a` |

**Cuándo pasa a APTO:** cuando se cumplan las condiciones de la sección 6 (B1 a B4 resueltos y las verificaciones manuales hechas por ustedes). No se declara «completamente probado»: hay verificaciones pendientes (sección 5).

*Criterio usado:* **APTO** = sin bloqueantes técnicos ni de derechos conocidos. **NO APTO** = hay al menos un bloqueante.

---

## 2. Qué se recibió y cómo se auditó

- **Archivo recibido:** `Chapala_v06__preauditoria.zip`. Aunque dice «v06», el código es la V07 de ChapalaWare con cambios del grupo: **8 texturas propias** en `img/texturas/`, música `sfx/chomp.mp4`, un script de audio escrito dentro de `juegos.html` y una guía. Se auditó **ese** contenido.
- **Cómo:** se abrieron las tres páginas en un navegador automatizado (Chromium) **por http, con el sitio dentro de una subcarpeta** (así funciona GitHub Pages) y también en la raíz de un dominio. Se midieron cuatro anchos: **360, 390, 768 y 1366 px**.
- **Qué se revisó:** HTML, CSS (cada declaración se validó con el propio navegador), JavaScript (funcional y de robustez), contraste de color, teclado y foco, navegación, peso de las páginas, datos personales y metadatos de todos los archivos, y los textos que se muestran al público.
- **No se eliminó ninguna funcionalidad válida:** siguen el simulador, las tarjetas, la tabla, el juego completo (5 microjuegos + jefe), las texturas del grupo y la música (ahora con controles).

---

## 3. Problemas encontrados y correcciones

Gravedad: **Alta** = hay que corregirlo para publicar · **Media** = conviene corregirlo · **Baja** = mejora.

### 3.1 Derechos y autorizaciones (no corregibles por programación → ver sección 6)
| ID | Gravedad | Hallazgo | Estado |
|---|---|---|---|
| P1 | Alta | Marca de agua «pngtree» en 3 fotos de producto (B1). | **Sin corregir** (no se debe quitar una marca de agua: hay que reemplazar la foto o conseguir la licencia). |
| P2 | Alta | Logotipo de «Don Kamarón – Mariscos» usado como jefe (B2). | **Sin corregir** (decisión del grupo). |
| P3 | Alta | Foto que parece de banco de imágenes como bala del camarón y otras imágenes sin origen conocido (B3). | **Imagen optimizada** (de 5,8 MB a 20 KB); **licencia pendiente**. |
| P4 | Alta | Música de origen y licencia desconocidos (B4). | **Convertida a audio simple sin metadatos** (ver P5); **licencia pendiente**. |
| P5b | Info | `Sobre nosotros` afirma que son un emprendimiento; el nombre «Carnicería Chapala» y el logotipo podrían pertenecer a un negocio real (el mapa de la V04 apuntaba a un lugar de Google Maps con ese nombre). | **Pendiente de confirmar** autorización (sección 6). |

### 3.2 Audio
| ID | Gravedad | Hallazgo (original) | Corrección |
|---|---|---|---|
| P5 | **Alta** | La música sonaba en bucle, **al volumen máximo (1,0), sin ningún botón para silenciarla**, y no se detenía al terminar la partida. (Un control para silenciar es una buena práctica de accesibilidad y lo pide el criterio WCAG 1.4.2 cuando el sonido arranca solo; acá arranca al tocar «Comenzar», pero igual conviene poder silenciarlo.) | Casilla «Sonido (música de fondo)» en la pantalla de inicio y botón **«Sonido: sí / no»** en el marcador (con `aria-pressed`). Volumen **0,4**. Se detiene al terminar, se pausa al cambiar de pestaña, y «Volver a jugar» la reinicia. |
| P6 | **Alta** | Si el navegador no podía reproducir el archivo, aparecía un **error de JavaScript sin capturar** («The element has no supported sources»). | `play()` con captura de errores y evento `error`: el juego sigue sin sonido, sin errores, y el botón de sonido se oculta. |
| P7 | Alta | El audio estaba escrito en un **`<script>` dentro de `juegos.html`** y con un `onclick` en el botón «Comenzar» (mezclado con la lógica del juego, difícil de mantener y de proteger con una política de seguridad). | Todo el sonido pasó a `js/juegos.js`; `juegos.html` ya no tiene scripts ni manejadores en línea. |
| P7b | Media | `chomp.mp4` pesaba 1,8 MB porque incluía una **pista de video de 1280×720 que no se usaba**, y conservaba metadatos de origen. | Se extrajo solo el audio **sin pérdida de calidad** (`sfx/chomp.m4a`, 1,0 MB), sin metadatos. El `.mp4` original ya no está en el sitio (queda en el ZIP que ustedes enviaron). |

### 3.3 Peso y formato de imágenes
| ID | Gravedad | Hallazgo (original) | Corrección |
|---|---|---|---|
| P8 | **Alta** | `bala-camaron.png`: **5,8 MB y 3094×2410 px** para una bala que se dibuja de 18 px. Fotos de producto de hasta 2500 px mostradas a 52–349 px. Al abrir el juego se descargaban **8,8 MB** (10,8 MB jugando). | Imágenes reducidas a un tamaño adecuado. Ver tabla de peso más abajo. |
| P8b | Media | `camaron.png` era un **WebP con extensión .png** (funciona por suerte; un servidor o navegador estricto podría fallar). | Convertido a PNG real (400 px). |
| P11 | Media | `bolsa.png`, `casa.png`, `cerdito.png`, `cerdito-cohete.png` y `aguja.png` tenían **fondo blanco opaco**: en el combate, el cohete se veía como un cuadrado blanco sobre fondo oscuro. | Fondo blanco → transparente (solo el fondo conectado con el borde; los blancos interiores, como el cuerpo del cohete, se conservan). Se revisó visualmente sobre fondo oscuro y crema. |

**Peso medido (primera visita, sin caché, ancho 390):**

| Página | Antes | Después |
|---|---|---|
| `index.html` | 0,65 MB | 0,45 MB |
| `productos.html` | 3,06 MB | 1,27 MB |
| `juegos.html` (al abrir) | 8,78 MB | 0,95 MB |
| `juegos.html` (jugando hasta el jefe, con música) | 10,84 MB | 2,52 MB |
| Sitio completo | 10,8 MB | 2,7 MB |

### 3.4 Errores de consola y avisos
| ID | Gravedad | Hallazgo (original) | Corrección |
|---|---|---|---|
| P9 | Media | El aviso para quienes arman el juego («Texturas por colocar… se ven recuadros amarillos») **se mostraba al público**. | Ahora depende de `MOSTRAR_AVISO_TEXTURAS` (por defecto `false`). `bala-jamon.png` y `fondo-jefe.png` pasaron a ser **opcionales** (tienen respaldo) y no se cuentan como faltantes. |
| P10 | Media | **Dos errores 404 en la consola en cada visita** al juego (se pedían `bala-jamon.png` y `fondo-jefe.png`, que no existen). | Las opcionales no se piden mientras no estén indicadas en `TEXTURAS`. Consola limpia (sin errores ni advertencias). |

### 3.5 Controles del jefe
| ID | Gravedad | Hallazgo (original, reproducido con pruebas) | Corrección |
|---|---|---|---|
| P12 | Media | **Teclas «pegadas»:** si la ventana perdía el foco con una flecha apretada, el cerdito seguía moviéndose solo (≈117 px en 1 segundo). | Se sueltan las teclas al perder el foco o cambiar de pestaña. |
| P13 | Media | **Dos dedos sobre el lienzo:** al apoyar un segundo dedo el cerdito **saltaba 159 px**. | Solo manda el primer dedo (se identifica por `pointerId`) y se ignora el segundo. |

### 3.6 HTML, CSS, accesibilidad y textos
| ID | Gravedad | Hallazgo | Corrección |
|---|---|---|---|
| P14 | Media | «Sobre nosotros» decía que el sitio sirve «para facilitar la venta» y para reunir capital, **como si fuera una tienda real**, cuando no permite comprar. | Ahora dice «con la idea de, más adelante, facilitar la venta…» y agrega en negrita: **«Por ahora es solo una demostración: no se pueden hacer pedidos reales»**. |
| P15 | Baja | En celular el **encabezado fijo ocupaba unos 140 px** de la pantalla (y tapaba parte del juego). | En pantallas de hasta 600 px el encabezado no es fijo. |
| P16 | Baja | Tamaños táctiles: enlaces del menú de 42 px, casillas de 20–22 px, botón «Vaciar pedido» de 39 px, «Saltar al contenido» de 42 px. | Todos llevados a 44 px (casillas a 24 px, con la tarjeta entera como zona de toque). |
| P17 | Baja | `-webkit-touch-callout` (propiedad solo de iPhone/iPad) figuraba como declaración no reconocida por otros navegadores. | Se movió dentro de `@supports (-webkit-touch-callout: none)`. |
| P18 | Baja | Un **comentario HTML interno** (que mencionaba «si son menores») quedaba visible en el código fuente de las tres páginas. | Eliminado de las páginas. |
| P19 | Baja | El destino de «Saltar al contenido» (`<main>`) no recibía el foco en algunos navegadores. | `tabindex="-1"` en `<main>`. |
| P20 | Baja | La guía se llamaba `GUIA_V06.md` pero decía «V07», y quedaban datos desactualizados. | `docs/GUIA_V07.md` actualizada (sonido, aviso, texturas opcionales). Se agregaron `README.md` (cómo publicar), `.nojekyll` y este informe. |

### 3.7 Observaciones que **no se cambiaron** (decisión del grupo)
- **`cerdito.png` es un auto rojo**, pero el texto del juego dice «Tocá al cerdito» y el lector de pantalla lo anuncia como «Cerdito». Conviene cambiar la imagen o el texto.
- **Lema «Los mejores yupis»:** es una afirmación de superioridad que nadie verificó. Riesgo bajo, pero es una información comercial que se presenta como un hecho.
- **«yupi-de-cerdo.png»** es una imagen pixelada (720 px ampliada) y no se ve como jamón. Sigue pendiente confirmar que corresponda al producto «Jamón porcino».
- **Nombre «ChapalaWare»:** recuerda a «WarioWare» (marca de Nintendo). Riesgo bajo; conviene saberlo.
- **Publicación del nombre del colegio y del grupo** («1.º BTI – Grupo 2 – Colegio Nacional de Villarrica») en el pie: no hay nombres de personas, pero los integrantes son menores; confirmar la autorización del colegio y de las familias.
- `img/logo-chapala.jpg` no se usa en ninguna página (se dejó: es el logotipo original).
- Los **precios y categorías siguen siendo ilustrativos**, sujetos a confirmación con la carnicería, y así figuran en el sitio.

### 3.8 Lo que se revisó y estaba **bien** (sin cambios)
- HTML: etiquetas bien cerradas, un `<h1>` por página, títulos sin saltos, `header/nav/main/footer`, tablas con `caption` y `th scope`, todos los `alt`, ids únicos, `aria-*` que apuntan a ids existentes.
- Enlaces, rutas y anclas: todos correctos y **relativos**, con las mayúsculas/minúsculas exactas (GitHub Pages las distingue).
- CSS: sin propiedades inválidas, sin selectores inválidos; usa Flexbox (20 reglas), Grid (8) y media queries (900 px, 600 px, movimiento reducido).
- **Sin desborde horizontal** en ningún ancho ni pantalla. Texto de 13,6 px o más.
- **Contraste:** 467 textos medidos, **ninguno por debajo de 4,5:1** (el más bajo es 6,54:1).
- **Datos personales:** ningún correo, teléfono, dirección ni enlace externo; ninguna imagen con EXIF o ubicación GPS; ningún campo de datos; sin cookies ni almacenamiento del navegador; ningún pedido a internet.
- Teclado: todas las páginas se recorren con Tab, con indicador de foco visible y nombre accesible en cada control.

---

## 4. Pruebas efectivamente ejecutadas

Todas se corrieron **sobre el contenido del ZIP ya empaquetado** (se comprobó que era idéntico a la carpeta de trabajo), por http, dentro de una subcarpeta. Resultado final: **todo correcto en lo que se probó**.

| Área | Qué se ejecutó | Resultado |
|---|---|---|
| HTML | Revisión automática de estructura, accesibilidad, enlaces, rutas, mayúsculas, scripts en línea, archivos pesados | 0 hallazgos de gravedad alta; 2 avisos menores (la música de 1,0 MB; `logo-chapala.jpg` sin uso) |
| CSS | 762 declaraciones y todos los selectores validados con el navegador | 0 declaraciones inválidas en uso (la de iOS está protegida con `@supports`) |
| Pantallas | **52 combinaciones**: 4 anchos (360, 390, 768, 1366) × (2 páginas + 11 estados del juego: inicio, consigna, 5 microjuegos, resultado, jefe, victoria, derrota); desborde, tamaño de texto, imágenes rotas, tamaño táctil | 0 desbordes; 0 problemas |
| Contraste | 467 textos de las 3 páginas y 11 estados del juego | 0 por debajo del mínimo |
| Teclado y navegación | Tab en las 3 páginas (10, 18 y 9 paradas), «Saltar al contenido», 12 enlaces del menú y 4 botones de la portada | Todo correcto |
| Simulador | Subtotales, total general, cantidades (0,5, 1, 1,5, 2 kg y otras), eliminar, vaciar, 25 pedidos al azar contra un cálculo independiente, entradas raras (1e3, 0, −1, vacío…) | Correcto |
| Microjuegos | Los 5: ganar, perder por error, perder por tiempo, teclado; ¡Pesá! contra un cálculo independiente (40 toques); ¡Cobrá! (30 pedidos) | Correcto |
| Puntaje | Fórmula exacta: 100 + bonus por tiempo (150, 140, 125, 100), fallo sin puntos y −1 vida, jefe 500 + 100 por vida (1800, 1700, 1600) | Correcto |
| Flujo y reinicio | Partida perfecta hasta el jefe, perder 3 vidas, fallar 2 y seguir, tiempo agotado, «Volver a jugar», reinicios repetidos, modo tranquilo | Correcto |
| Jefe | Disparos, daño, fases, golpes (bordes a 10,5 y 11,5 px), invulnerabilidad, victoria, derrota, teclado, mouse, **toques reales** | Correcto |
| Sonido | Lógica del sonido (iniciar, silenciar, reanudar, detener, pestaña oculta, sin sonido) **con reproducción simulada** | Correcto (ver sección 5: no se pudo oír) |
| Robustez | Teclas pegadas, dos dedos, doble clic, reinicios rápidos, entradas raras, rendimiento con CPU 4× más lenta | 6 de 6 |
| Publicación | Mismo sitio en la raíz y en una subcarpeta profunda: Inicio → Productos → simulador → Juego → empieza el juego | Sin errores ni archivos faltantes |
| Privacidad | Búsqueda de correos, teléfonos, direcciones, URLs externas y metadatos en todos los archivos | Nada encontrado |
| Batería funcional total | 7 conjuntos de pruebas | **270 comprobaciones, 270 correctas** |

**Mediciones (no son pruebas de dificultad):** el jefe tarda unos 42 s en perder los 500 de vida con el cerdito quieto y unos 26 s siguiéndolo; hasta 44 balas a la vez; un piloto automático que esquiva ganó las 6 partidas sin perder vidas (eso muestra que se puede ganar, **no** que sea fácil o difícil para una persona).

**Línea de base (proyecto original, antes de corregir):** las pruebas de estructura y de microjuegos mostraron el error de JavaScript del audio; la comprobación «juegos.html carga solo app.js y juegos.js» falló por el script en línea; el audio no se podía silenciar; había 2 errores 404 por visita y el aviso para desarrolladores se veía.

---

## 5. Verificaciones PENDIENTES (no se hicieron)

El sitio **no está completamente probado**. Faltan:

1. **No se pudo comprobar que el sonido se escuche.** El navegador de pruebas no decodifica este tipo de audio. Solo se probó la lógica (con reproducción simulada) y que, sin soporte, el juego no falla.
2. **Dispositivos y navegadores reales:** no se probó en iPhone/Safari, en Android, en Firefox ni en Edge; los toques se probaron con eventos reales del navegador de pruebas, no con dedos.
3. **Lector de pantalla** (NVDA, TalkBack, VoiceOver): se agregaron etiquetas y avisos, pero su efecto real no está verificado.
4. **Validador oficial del W3C, Lighthouse y herramientas de accesibilidad** (WAVE, axe): no se usaron (necesitan internet o instalación).
5. **Publicación real en GitHub Pages** (con https): se simuló con un servidor local en raíz y subcarpeta.
6. **Persona jugando:** nadie probó si la dificultad es adecuada.
7. **Ancho menor a 360 px, zoom del navegador al 200 % y modos de alto contraste** del sistema: no se probaron.
8. **Contraste de elementos que no son texto** (bordes, íconos) e imágenes: solo se midió el texto.
9. **Licencias, autorizaciones y origen** de imágenes, logotipos y sonido: no se pueden verificar desde el código (ver sección 6).

---

## 6. Condiciones para publicar (lista para el grupo)

Cuando estén los 4 puntos de arriba resueltos y las pruebas manuales hechas, la clasificación pasa a **APTO**.

**Derechos y autorizaciones**
- [ ] **B1.** Reemplazar las fotos de alitas, pata de pollo y carne molida por fotos **propias** o con licencia que permita publicarlas (y poner la atribución si la licencia la pide). No quitar la marca de agua.
- [ ] **B2.** Reemplazar `camaron.png` por un dibujo propio, o conseguir **autorización escrita** de quien tenga la marca «Don Kamarón».
- [ ] **B3.** Confirmar el origen y la licencia de `bala-camaron.png`, `pierna-de-cerdo.png`, `chorizo.png`, `yupi-de-cerdo.png` y `balanza.png`; reemplazar las que no se puedan justificar.
- [ ] **B4.** Reemplazar `sfx/chomp.m4a` por un sonido **propio** o de licencia libre (con el mismo nombre de archivo). Si no se consigue, borrar el archivo y la casilla de sonido.
- [ ] Confirmar que el nombre «Carnicería Chapala» y el logotipo se pueden usar (¿son suyos, o de un negocio real? ¿hay autorización?).
- [ ] Pedir la **autorización del colegio, del docente y de las familias** para publicar «1.º BTI – Grupo 2 – Colegio Nacional de Villarrica».

**Contenido**
- [ ] Confirmar con la carnicería los **precios, categorías y descripciones** (siguen como «ilustrativos»).
- [ ] Decidir sobre el lema «Los mejores yupis» y sobre el «cerdito» que es un auto.
- [ ] Mantener `MOSTRAR_AVISO_TEXTURAS = false` al publicar.

**Pruebas manuales (unos 15 minutos), en la dirección publicada**
- [ ] Abrir las 3 páginas en un **celular Android** y en un **iPhone** (si hay), y en la computadora.
- [ ] En `productos.html`: elegir 3 productos, cambiar cantidades, quitar uno, vaciar. Controlar que el total sea correcto y que se lea «Simulación educativa. No constituye una compra real».
- [ ] En `juegos.html`: jugar una partida completa (con sonido). Probar **silenciar**, y que **se detenga** al terminar.
- [ ] Llegar al jefe y moverse con el dedo; probar también con un solo dedo y con dos.
- [ ] Abrir la consola del navegador (F12): no debería haber errores rojos.
- [ ] Pedirle a 2 compañeros que jueguen y anotar si el juego les resultó muy fácil o muy difícil.

---

## 7. Cómo publicar en GitHub Pages
Está explicado paso a paso en `README.md`. Resumen: subir el **contenido** de esta carpeta a un repositorio (que `index.html` quede en la raíz), activar **Settings → Pages → Deploy from a branch → main / (root)** y probar en la dirección que entrega GitHub. Las rutas son relativas, así que funcionan en una subcarpeta. No renombrar archivos sin actualizar las rutas (GitHub Pages distingue mayúsculas de minúsculas).

---

## 8. Cambios que se hicieron sobre archivos del grupo (para que no haya sorpresas)
- **Imágenes reducidas y recomprimidas** (se ven igual en pantalla): fotos de producto a 640 px como máximo, logotipo a 640 px, `camaron.png` a 400 px, `bala-camaron.png` a 128 px. Los originales siguen en el ZIP que ustedes enviaron.
- **Fondos blancos pasados a transparentes** en 5 texturas.
- **`chomp.mp4` → `chomp.m4a`** (solo audio, sin metadatos, sin pérdida de calidad).
- **Textos:** el segundo párrafo de «Sobre nosotros» (P14).
- **Archivos movidos o agregados:** `GUIA_V06.md` → `docs/GUIA_V07.md`; nuevos `README.md`, `.nojekyll` y `docs/INFORME_AUDITORIA.md`.
- No se tocaron: el catálogo y los precios, los cálculos del simulador, las reglas del juego, el logotipo (más que su tamaño), los textos de productos ni el diseño general.
