# Guía V07 – ChapalaWare (microjuegos de la Carnicería Chapala)

**Grupo 2 – Feria de Informática 2026**

Esta guía sirve para **entender, usar y defender el código**. Los fragmentos marcados como `js` están copiados del proyecto.

---

## 1. Qué hay en el proyecto

```text
Chapala_V07_AUDITADO/
├── index.html           Inicio
├── productos.html       Tarjetas, tabla de precios y simulador de compras
├── juegos.html          Juego ChapalaWare
├── css/estilos.css      Estilos
├── js/app.js            Catálogo de productos y simulador
├── js/juegos.js         ChapalaWare completo
├── img/                 Logos y fotos de los productos
│   └── texturas/        Imágenes propias del juego (ver sección 3)
├── sfx/chomp.m4a        Música de fondo (se puede silenciar)
├── docs/                Esta guía y el informe de auditoría
├── README.md            Cómo publicar en GitHub Pages
└── .nojekyll            Archivo vacío que pide GitHub Pages (déjenlo)
```

Se abre con doble clic en `index.html`: no necesita servidor, internet ni instalación. Para publicarlo, seguir `README.md`.

**Qué cambió respecto de V06**
- «Desafío Chapala» (las 10 preguntas) se reemplazó por **ChapalaWare**. El código viejo de preguntas ya no está en el proyecto (sigue en el ZIP de la V06).
- Carpeta `img/texturas/` con un `LEEME_TEXTURAS.txt`, y música de fondo en `sfx/`.
- **Auditoría final:** se corrigieron varios problemas (sonido sin control, imágenes pesadas, errores de consola, controles del jefe). El detalle está en `docs/INFORME_AUDITORIA.md`.
- El simulador, las tarjetas, la tabla, el menú y el diseño **no se tocaron** y se volvieron a probar.
- Sigue valiendo todo lo anterior: sin frameworks, sin guardar datos, precios ilustrativos, sin teléfono/correo/mapa publicados.

---

## 2. Cómo se juega

- **10 rondas y 3 vidas.** Rondas 1 a 9: un microjuego al azar (nunca el mismo dos veces seguidas). Cada ronda va un poco más rápida. **Ronda 10: el jefe ¡YUPI!**
- Fallar un microjuego (o quedarse sin tiempo) cuesta **una vida**, pero igual se pasa a la ronda siguiente.
- Si se superan las 10 rondas (se derrota al camarón) → **pantalla de victoria**. Si se pierden las 3 vidas (en cualquier momento, también en el jefe) → **pantalla «¡Intentá de nuevo!»**. En las dos hay un botón «Volver a jugar».
- Hay una casilla **«Modo tranquilo»** en la pantalla de inicio: más tiempo y todo más lento.

| Microjuego | Qué hay que hacer | Se pierde si… |
|---|---|---|
| **¡Pesá!** | Una aguja va y viene sobre una balanza de 0 a 3 kg. Tocar cuando marque el peso pedido (por ejemplo «Pesá 1,5 kg»). Margen: ±0,25 kg. | Se toca lejos del peso, o se acaba el tiempo. |
| **¡Atrapá!** | Caen 4 productos distintos. Tocar solo el pedido (por ejemplo «Atrapá: Alitas»). | Se toca otro producto, o el pedido llega abajo / se acaba el tiempo. |
| **¡Cobrá!** | «1,5 kg de pata de pollo»: hay 3 totales posibles y hay que elegir el correcto (precio por kg × kilos). | Se elige uno incorrecto o se acaba el tiempo. |
| **¡Entregá!** | Tocar 10 veces al cerdito para que avance hasta la casa (que está a la derecha). | No llega a los 10 toques a tiempo. |
| **¡Armá!** | Una lista de 3 productos (por ejemplo alitas, chorizo, carne molida): tocarlos para ponerlos en la bolsa. | Se toca uno que no estaba en la lista, o se acaba el tiempo. |
| **¡YUPI!** (jefe, ronda 10) | El cerdito va sobre un cohete y **dispara solo** jamón. Hay que bajarle la vida al camarón de **500 a 0** esquivando sus balas. | Pierde las vidas que le queden (cada golpe = 1 vida). |

**Jefe en detalle**
- Controles: **arrastrar con el dedo** (movimiento relativo, para no tapar al cerdito), **mover el mouse** (el cerdito sigue al puntero), o **flechas / WASD** (con **Shift** más lento).
- Solo el **punto blanco del centro** del cerdito (radio de 5 px) puede recibir balas, como en los juegos tipo Touhou. Cada bala tiene radio 6: se golpea cuando la distancia entre centros es menor que 11 px.
- Cada golpe: –1 vida, se borran todas las balas, 2 segundos de invulnerabilidad (el cerdito titila despacio) y el camarón descansa un momento.
- Cada bala de jamón que le pega al camarón le saca 1 de vida. El cerdito dispara 2 jamones cada 0,1 s.
- **3 fases** según la vida del camarón: más de 340 (anillos de balas + disparos apuntados), de 340 a 171 (espiral + anillos) y 170 o menos (anillos grandes + ráfagas de 3 + espiral). Al cambiar de fase se borran las balas y hay una pausa corta.
- Puntos: 100 por microjuego ganado (+ hasta 50 de bonus por rapidez), y al ganar el jefe 500 + 100 por cada vida que sobra.

---

## 3. Cómo poner las texturas (imágenes propias)

El juego **no genera gráficos**: usa las imágenes que ustedes pongan en `img/texturas/`. Mientras falte una, se ve un **recuadro amarillo con el nombre del archivo** (o un círculo / barra de color en las cosas chicas), para que sepan cuál falta.

Pasos:
1. Hacer la imagen (PNG con fondo transparente es lo mejor).
2. Guardarla en `img/texturas/` con **el nombre exacto** de la tabla, en minúsculas y sin espacios.
3. Recargar `juegos.html`. Para ver en la pantalla de inicio un aviso con las que todavía faltan, poner `MOSTRAR_AVISO_TEXTURAS = true` al comienzo de `js/juegos.js`. **Al publicar hay que dejarlo en `false`** (es el valor actual), para que el público no vea ese aviso.

| Archivo | Tamaño sugerido | Dónde se usa |
|---|---|---|
| `cerdito.png` | 120 × 120 | Mascota de ¡Entregá! |
| `casa.png` | 140 × 140 | Meta de ¡Entregá! |
| `bolsa.png` | 220 × 220 | Bolsa de ¡Armá! (los productos aparecen sobre la parte de abajo) |
| `balanza.png` | 560 × 140 | Fondo del medidor de ¡Pesá! (la escala de 0 a 3 kg y los números los pone el juego) |
| `aguja.png` | 24 × 140 | Aguja de ¡Pesá! (su centro marca el peso) |
| `cerdito-cohete.png` | 96 × 96 | Cerdito en el cohete (jefe). El punto débil está en el centro. |
| `camaron.png` | 200 × 140 | El camarón (jefe) |
| `bala-jamon.png` | 32 × 32 | (**opcional**) Disparo del cerdito. Hoy se usa la imagen del Jamón porcino (`img/yupi-de-cerdo.png`). Para usar una propia, guardarla y escribir su ruta en `TEXTURAS` (hay un ejemplo en el comentario). |
| `bala-camaron.png` | 24 × 24 | Disparo del camarón (mejor redonda) |
| `fondo-jefe.png` | 360 × 520 | (**opcional**) Fondo del combate (vertical). Hoy se usa un degradado oscuro. Para usar uno propio, guardarlo y escribir su ruta en `TEXTURAS`. |

Cosas que conviene saber (las probamos):
- La imagen se **ajusta a su caja sin deformarse**; el tamaño en pantalla lo manda el CSS (por ejemplo `.tex-cerdito { width: 90px; height: 90px; }`), no el archivo. Si quieren cambiarlo, se cambia ahí.
- Si un archivo está roto (por ejemplo, un texto renombrado a `.png`), el juego lo trata como «falta» y sigue funcionando.
- Las imágenes **opcionales** no se piden al navegador mientras no estén escritas en `TEXTURAS`: así no aparecen errores 404 en la consola.
- Las texturas de personajes deben ser PNG **con fondo transparente** (si tienen fondo blanco se ve un cuadrado) y de tamaño parecido al sugerido: una imagen enorme hace lenta la carga (en la auditoría había una de 5,8 MB para una bala de 24 px).
- Las fotos de los productos (`img/alitas.png`, etc.) no son texturas: son las de siempre y se reemplazan sobrescribiendo el archivo.
- Para cambiar un nombre de archivo o agregar una textura nueva hay que tocar el objeto `TEXTURAS` en `js/juegos.js`.

---

## 4. Cómo funciona el código (mapa de `js/juegos.js`)

El archivo tiene 7 bloques numerados:

1. **Configuración**: las constantes (rondas, vidas, puntos, vida del jefe).
2. **Texturas**: carga las imágenes y crea los recuadros de respaldo.
3. **Utilidades**: funciones chicas que se usan en todo el juego.
4. **Estado y director**: el «cerebro» que decide qué pasa y cuándo.
5. **Microjuegos**: una función por microjuego.
6. **Jefe ¡YUPI!**: el combate, dibujado en un `<canvas>`.
7. **Arranque**: conecta los botones y carga las texturas.

### El director (flujo de una partida)
```text
Comenzar → iniciarRonda → mostrarConsigna («¡PESÁ!», 1,1 s)
         → arrancarMicrojuego → (se juega) → resolverMicrojuego(true/false)
         → cartel «¡BIEN!» / «¡FALLASTE!» (0,95 s)
         → ¿quedan vidas?  sí → iniciarRonda (ronda + 1)   no → finDelJuego(false)
Ronda 10 → mostrarConsigna («¡YUPI!») → arrancarJefe → finDelJefe → finDelJuego(true/false)
```

La variable `estado.fase` indica en qué momento está el juego (`inicio`, `consigna`, `juego`, `resultado`, `jefe`, `fin`). Muchas funciones empiezan preguntando por la fase para no ejecutarse a destiempo; por ejemplo, `resolverMicrojuego` ignora todo si la fase ya no es `juego`, y así un microjuego no puede ganarse **y** perderse a la vez.

### El reloj del juego
Una sola función, `bucle`, se repite unas 60 veces por segundo (con `requestAnimationFrame`). En cada vuelta calcula **dt**, los segundos que pasaron desde la vuelta anterior, y se lo pasa a lo que se está jugando para que todo avance al mismo ritmo en cualquier celular:

```js
  let dt = (ahora - tiempoPrevio) / 1000;
  tiempoPrevio = ahora;
  dt = limitar(dt, 0, 0.05);
```
Idea clave: **distancia = velocidad × tiempo**. Si la aguja va a `velocidad` recorridos por segundo, en cada cuadro avanza `velocidad * dt`.

### La forma común de todos los microjuegos
Cada microjuego es una función que recibe `zona` (el `<div>` donde dibuja), `ritmo` (qué tan rápido va) y `resolver` (a quien avisa si ganó o perdió), y devuelve un objeto con la `instruccion` y, si hace falta, una función `actualizar(dt)`. Todos están en el arreglo `MICROJUEGOS`; el director elige uno y lo arranca sin saber cuál es:

```js
const MICROJUEGOS = [
  { id: "pesa",    consigna: "¡PESÁ!",    ayuda: "Tocá cuando la aguja marque el peso pedido", tiempoBase: 5000, iniciar: iniciarPesa },
  { id: "atrapa",  consigna: "¡ATRAPÁ!",  ayuda: "Tocá solo el producto pedido",               tiempoBase: 4500, iniciar: iniciarAtrapa },
```

### Dificultad creciente
```js
function calcularRitmo() {
  let ritmo = 1 + (estado.ronda - 1) * 0.1;
  if (estado.tranquilo) {
    ritmo = ritmo * 0.75;
  }
  return ritmo;
}
```
Ronda 1 → 1,0; ronda 9 → 1,8 (+0,1 por ronda). El tiempo de cada microjuego baja, pero menos que la velocidad, y nunca por debajo de 3 segundos (se comprobó). En modo tranquilo el ritmo se multiplica por 0,75 y el tiempo por 1,6.

### El sonido
La música de fondo (`sfx/chomp.m4a`) se maneja con unas pocas funciones: `iniciarSonido`, `pausarSonido`, `detenerSonido` y `alternarSonido`.
- Solo empieza **después de tocar «Comenzar» o «Volver a jugar»** (los navegadores no permiten sonido sin que la persona toque algo).
- Se puede **silenciar siempre**: con la casilla «Sonido (música de fondo)» de la pantalla de inicio o con el botón «Sonido: sí / no» del marcador (usa `aria-pressed`, así los lectores de pantalla saben si está activado).
- Se detiene al terminar la partida y se pausa si se cambia de pestaña. El volumen es `SONIDO_VOLUMEN` (0,4).
- Si el navegador no puede reproducir el archivo, el juego sigue sin sonido y sin errores, y el botón de sonido se oculta.

### El jefe
- **Estado en arreglos y objetos:** `jefe` y `jugador` son objetos; `balasJugador` y `balasEnemigas` son arreglos de balas, cada una con posición (`x`, `y`), velocidad (`vx`, `vy`) y radio (`r`).
- En cada cuadro `actualizarJefe(dt)` hace, en orden: mover al camarón y al cerdito → disparar → elegir la fase → ataques del camarón → mover balas del cerdito y ver si pegan → mover balas del camarón → ver si alguna toca el punto débil → dibujar.
- Los ataques usan un «temporizador de recarga» por tipo (`recargaAnillo`, `recargaApuntado`, `recargaEspiral`): se les resta `dt` y cuando llegan a 0 se dispara y se vuelven a cargar.
- Las **balas que salen de la pantalla se eliminan** (así la cantidad no crece sin límite): en las pruebas el máximo fue de entre 24 y 44 balas a la vez, según la fase y la corrida.
- Se **dibuja** en un `<canvas>`: `dibujarJefe()` pinta el fondo, el camarón, las balas, el cerdito y el punto débil, en ese orden (lo último queda arriba).

---

## 5. Conceptos de programación con ejemplos del proyecto

### 5.1 Variables y constantes
`const` guarda algo que **no se vuelve a asignar**; `let`, algo que **va a cambiar**.

```js
const TOTAL_RONDAS = 10;        // la ronda 10 es el jefe
const VIDAS_INICIALES = 3;
```
```js
const VIDA_JEFE = 500;          // vida del camarón
```
```js
let temporizadores = [];     // setTimeout pendientes (para poder cancelarlos)
let idAnimacion = null;      // número del requestAnimationFrame
let tiempoPrevio = 0;
```
El objeto `estado` agrupa las variables que cambian durante la partida (`vidas`, `puntaje`, `ronda`…). **Para defender:** «Las reglas del juego están en constantes, así que para cambiar la cantidad de rondas o de vidas hay que tocar un solo número».

### 5.2 Operadores matemáticos
```js
    estado.puntaje = estado.puntaje + PUNTOS_MICROJUEGO + Math.round(restante * 50);
```
```js
  const restante = Math.max(1 - estado.transcurrido / estado.tiempoTotal, 0);
```
```js
  const correcto = Math.round(producto.precioKg * kilos);
```
```js
  jefe.x = ANCHO_LIENZO / 2 + Math.sin(jefe.tiempo * 0.9) * 95;
```
- `+ - * /` suman, restan, multiplican y dividen. `Math.round` redondea; `Math.max` elige el mayor.
- **Ejemplo con números (bonus de puntos):** si de 5000 ms pasaron 1000, `restante = 1 − 1000/5000 = 0,8` → bonus = `Math.round(0,8 × 50) = 40` → el microjuego da 100 + 40 = 140 puntos.
- **¡Cobrá!:** 1,5 kg de pata de pollo → `16.000 × 1,5 = 24.000 Gs.`
- **El vaivén del camarón:** `Math.sin` da valores entre −1 y 1, y se multiplica por 95 → el camarón se mueve entre 95 px a la izquierda y 95 px a la derecha del centro (180).
- **Golpe al cerdito** (distancia entre dos círculos, sin raíz cuadrada):
```js
      const dx = bala.x - jugador.x;
      const dy = bala.y - jugador.y;
      const suma = bala.r + jugador.radio;
      if (dx * dx + dy * dy < suma * suma) {
```
  Es el teorema de Pitágoras: si la distancia al cuadrado es menor que la suma de los radios al cuadrado, los círculos se tocan. Con radios 6 y 5 la suma es 11 px.

### 5.3 Condicionales
```js
  if (gano) {
    estado.puntaje = estado.puntaje + PUNTOS_MICROJUEGO + Math.round(restante * 50);
    estado.rondasGanadas = estado.rondasGanadas + 1;
  } else {
    estado.vidas = estado.vidas - 1;
  }
```
```js
  let fase = 3;
  if (jefe.vida > 340) {
    fase = 1;
  } else if (jefe.vida > 170) {
    fase = 2;
  }
```
**Para defender:** «Se evalúa de arriba hacia abajo y se entra al primer `if` verdadero. Con 200 de vida: no es mayor que 340, pero sí mayor que 170 → fase 2».
Otros condicionales: `if (estado.fase !== "juego") { return; }` (ignorar acciones fuera de tiempo) y `if (estado.vidas <= 0)` (terminar la partida).

### 5.4 Arreglos (y objetos)
```js
  const lista = mezclar(PRODUCTOS).slice(0, 3);
```
Mezcla los 6 productos y se queda con los 3 primeros: es la lista de ¡Armá!.
```js
    balasJugador.push({ x: jugador.x - 10, y: jugador.y - 30, r: 6 });
```
`push` agrega un elemento (una bala, que es un objeto) al final del arreglo.
```js
  balasEnemigas = balasEnemigas.filter(function (bala) {
    bala.x = bala.x + bala.vx * dt;
    bala.y = bala.y + bala.vy * dt;
    return bala.x > -20 && bala.x < ANCHO_LIENZO + 20 && bala.y > -20 && bala.y < ALTO_LIENZO + 20;
  });
```
`filter` recorre todas las balas, **las mueve** y se queda solo con las que siguen en pantalla (devuelven `true`). Otros arreglos: `PRODUCTOS`, `MICROJUEGOS`, `PANTALLAS`, las opciones de cada ¡Cobrá!. `for (const bala of balasEnemigas)` recorre uno elemento por elemento.

### 5.5 Funciones
Una función es un bloque con nombre que hace una tarea y se puede reutilizar.
```js
function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}
```
`limitar(300, 20, 340)` → 300; `limitar(5, 20, 340)` → 20. Se usa para que el cerdito no salga de la pantalla.
```js
function dispararAnillo(cantidad, velocidad, desfase) {
  for (let i = 0; i < cantidad; i++) {
    dispararEnAngulo(desfase + (i * 2 * Math.PI) / cantidad, velocidad);
  }
}
```
Un anillo de 14 balas = 14 llamadas a `dispararEnAngulo`, cada una con un ángulo distinto: `2π / 14` entre bala y bala (una vuelta completa dividida en 14).

Funciones principales:

| Función | Para qué sirve |
|---|---|
| `empezar`, `iniciarRonda`, `arrancarMicrojuego`, `resolverMicrojuego`, `finDelJuego` | Manejan el flujo de la partida |
| `iniciarPesa`, `iniciarAtrapa`, `iniciarCobra`, `iniciarEntrega`, `iniciarArma` | Un microjuego cada una |
| `actualizarJefe(dt)` / `dibujarJefe()` | Avanzar y dibujar el combate |
| `dispararAnillo`, `dispararApuntado`, `dispararEnAngulo` | Ataques del camarón |
| `golpearJugador`, `finDelJefe` | Qué pasa cuando te pegan / se termina el combate |
| `mezclar`, `elegirAlAzar`, `limitar`, `nuevoElemento`, `alPulsar` | Utilidades |
| `crearTextura`, `dibujarTextura`, `cargarTexturas` | Imágenes y recuadros de respaldo |

### 5.6 Eventos
Un evento es algo que pasa en la página (un toque, una tecla). `addEventListener` dice «cuando pase esto, ejecutá esta función».
```js
  botonComenzar.addEventListener("click", empezar);
```
Los toques de los microjuegos usan una función propia, `alPulsar`, que sirve para **tocar** (`pointerdown`, responde más rápido que `click`) y también para **teclado** (Enter o Espacio):
```js
function alPulsar(elemento, accion) {
  elemento.addEventListener("pointerdown", function (evento) {
    if (evento.button > 0) {
      return;                       // ignora el botón derecho del mouse
    }
    accion(evento);
  });
  elemento.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      accion(evento);
    }
  });
}
```
En el jefe se usan eventos del puntero y del teclado:
```js
  lienzo.addEventListener("pointermove", function (evento) {
```
```js
  document.addEventListener("keydown", function (evento) {
```
### 5.7 Manipulación del DOM
El DOM es la página vista como un árbol de elementos que JavaScript puede leer y modificar.
```js
    const marca = nuevoElemento("span", "marca", String(kg).replace(".", ","));
    marca.style.left = (kg / MAXIMO_KG) * 100 + "%";
```
Crea cada número de la balanza (0; 0,5; 1…) y lo ubica con `left`: 1,5 kg de 3 → 50 %.
```js
  document.getElementById("hud").hidden = !conMarcador.includes(id);
```
Muestra u oculta el marcador según la pantalla. Y esta línea mueve al cerdito de ¡Entregá! con una **variable CSS**:
```js
  pista.style.setProperty("--avance", 0);
```
En el CSS: `left: calc((100% - 180px) * var(--avance));`; con `--avance` entre 0 y 1, JavaScript solo cambia ese número y el navegador mueve al cerdito.

### 5.8 Dos ideas nuevas
- **Tiempo y animación:** `requestAnimationFrame` + `dt` (ver sección 4). Los `setTimeout` (en la función `esperar`) se usan para las pausas cortas: mostrar la consigna y el cartel de resultado.
- **Canvas:** un lienzo de píxeles. `ctx.drawImage(...)` dibuja una imagen; `ctx.arc(...)` un círculo. En cada cuadro se **borra y se vuelve a dibujar todo**.

---

## 6. Un error real que encontramos probando (para contar en la defensa)

En una primera versión, ¡Pesá! escuchaba los toques sobre la zona compartida (`zona`), que se **reutiliza** en todos los microjuegos. Esa escucha **nunca se quitaba**, así que después de jugar ¡Pesá! una o dos veces, tocar en cualquier otro microjuego también activaba la aguja vieja, que podía dar por ganada o perdida una ronda que no era la suya.

Las pruebas lo detectaron (resultados incoherentes en ¡Pesá!). La solución: cada ¡Pesá! crea su propia «escena» (`escena-pesa`) y escucha ahí; al empezar el siguiente microjuego, la escena vieja se descarta con todo lo que tenía. Hay una prueba específica («REGRESIÓN») para que no vuelva a pasar.

**Lección:** cuando algo se reutiliza (como `zona`), todo lo que se le agrega hay que quitarlo, o mejor, agregarlo a elementos que se crean y se descartan en cada uso.

---

## 7. Preguntas que pueden hacerles (y cómo responder)

1. **¿Cómo elige el microjuego?** `elegirMicrojuego` filtra el arreglo `MICROJUEGOS` sacando el último que se jugó y sortea entre los que quedan con `elegirAlAzar`.
2. **¿Cómo sabe si ganaste ¡Pesá!?** Compara el peso que marca la aguja con el pedido: gana si la diferencia (`Math.abs`) es de 0,25 kg o menos.
3. **¿Cómo se arman los tres totales de ¡Cobrá!?** El correcto es precio × kilos. Los incorrectos salen de errores típicos (olvidar los kilos, sumar medio kilo de más o de menos, duplicar, sumar o restar 1.000), se descartan los repetidos y los que no sean positivos, y se mezclan las tres opciones.
4. **¿Por qué no se repite una respuesta al azar siempre en el mismo lugar?** Porque se usa `mezclar` (Fisher-Yates).
5. **¿Qué es `dt` y para qué sirve?** Los segundos entre un cuadro y otro. Con él, todo se mueve igual de rápido en un celular lento o en una computadora rápida.
6. **¿Cómo pierde una vida el cerdito en el jefe?** Cuando la distancia entre una bala y el punto débil es menor que la suma de sus radios (11 px). Pierde 1 vida, se borran las balas y tiene 2 segundos de invulnerabilidad.
7. **¿Cómo se sabe en qué fase está el camarón?** Con `if / else if` sobre su vida: más de 340 → fase 1; más de 170 → fase 2; si no → fase 3.
8. **¿Cómo funcionan las texturas?** `TEXTURAS` lista las imágenes; `cargarTexturas` prueba cada ruta con `new Image()`; si carga, se usa; si falla, se prueba la siguiente o se muestra el recuadro amarillo.
9. **¿Cómo se juega con el dedo en el jefe?** El evento `pointermove` calcula cuánto se movió el dedo y lo suma a la posición del cerdito (movimiento relativo), ajustando por el tamaño real del lienzo en pantalla.
10. **¿Por qué no guarda nada?** No usa `localStorage`, cookies ni ningún pedido a internet (se comprobó leyendo el código y midiendo en el navegador), y no tiene formularios.
11. **¿Qué pasa si falta una textura?** El juego sigue funcionando con recuadros amarillos de respaldo (y, si activan `MOSTRAR_AVISO_TEXTURAS`, avisa cuáles faltan).

---

## 8. Cómo modificar el juego

| Quiero… | Dónde |
|---|---|
| Cambiar la cantidad de vidas o de rondas | `VIDAS_INICIALES` y `TOTAL_RONDAS` (arriba de `juegos.js`). Ojo: la ronda del jefe es la última. El texto «10 rondas» de `juegos.html` hay que cambiarlo a mano. |
| Hacer más fácil o difícil | Ritmo: `calcularRitmo` (el `0.1` es cuánto sube por ronda). Tiempos: `tiempoBase` en `MICROJUEGOS`. Margen de ¡Pesá!: `TOLERANCIA`. Toques de ¡Entregá!: `TOQUES_NECESARIOS`. |
| Cambiar la vida del camarón | `VIDA_JEFE`. Los cortes de fase (340 y 170) están en `actualizarJefe`: conviene mantenerlos a 2/3 y 1/3 de la vida. |
| Hacer el jefe más fácil o difícil | Velocidad y cantidad de balas en `actualizarJefe` (por ejemplo `dispararAnillo(14, 85, …)`: 14 balas a 85 px/s) y el radio del punto débil (`radio: 5`). |
| Cambiar el volumen de la música | `SONIDO_VOLUMEN` (de 0 a 1). Para cambiar la música: reemplazar `sfx/chomp.m4a` por otro archivo con el **mismo nombre** (y con los permisos de uso al día). |
| Cambiar puntos | `PUNTOS_MICROJUEGO`, `PUNTOS_JEFE`, `PUNTOS_POR_VIDA`. |
| Cambiar los nombres de las órdenes | `consigna` en `MICROJUEGOS`. En el proyecto están en voseo («¡ENTREGÁ!», «¡ARMÁ!»); si prefieren «¡ENTREGA!» y «¡ARMA!», es cambiar ahí el texto. |
| Agregar un microjuego | Escribir una función `iniciarXxx(zona, ritmo, resolver)` que devuelva `{ instruccion: "..." }` (y `actualizar(dt)` si anima), y sumar una línea a `MICROJUEGOS`. **Cuidado:** agregar escuchas solo a elementos que cree esa función, nunca a `zona`. |
| Cambiar un precio | Es el del catálogo (`js/app.js`, tarjetas y tabla de `productos.html`): ¡Cobrá! lo toma solo del catálogo. |

---

## 9. Pruebas

Las pruebas de la versión auditada (qué se ejecutó, con qué resultados y qué quedó **sin verificar**) están en **`docs/INFORME_AUDITORIA.md`**. Dos cosas que conviene saber para la defensa:
- Las pruebas se hicieron con un navegador automatizado, **no con personas ni con celulares reales**.
- **No se pudo comprobar que el sonido se escuche**: el navegador de pruebas no reproduce este tipo de audio. Prueben el sonido ustedes, en la página publicada, en computadora y en celular.

---

## 10. Cosas para tener en cuenta
- **Antes de publicar:** hay **condiciones pendientes** que no son de programación (licencias de imágenes y sonido, autorización para usar el nombre y el logotipo de una marca, datos de contacto). Están en `docs/INFORME_AUDITORIA.md`, sección «Condiciones para publicar».
- **Aviso de texturas:** `MOSTRAR_AVISO_TEXTURAS` debe quedar en `false` al publicar.
- **Imagen del jamón:** los disparos del cerdito usan `img/yupi-de-cerdo.png`. Esa foto se llama «yupi de cerdo» y sigue pendiente confirmar si corresponde al «Jamón porcino».
- **Precios:** los de ¡Cobrá! son los mismos precios ilustrativos de siempre, sujetos a confirmación. Ningún precio nuevo.
- **Nombres de las órdenes:** en el juego están como «¡ENTREGÁ!» y «¡ARMÁ!» (voseo, igual que «¡PESÁ!», «¡ATRAPÁ!» y «¡COBRÁ!»).
- **Cerdito y auto:** en ¡Entregá! la textura `cerdito.png` es un auto rojo, pero el texto del juego dice «cerdito». Conviene cambiar la imagen o el texto para que coincidan.
