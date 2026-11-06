/* ==========================================================
   Carnicería Chapala – js/juegos.js (V07)
   Juego: «ChapalaWare»
   ----------------------------------------------------------
   Es un juego de microjuegos muy cortos (estilo WarioWare):
   - 10 rondas y 3 vidas.
   - Rondas 1 a 9: un microjuego al azar (¡Pesá!, ¡Atrapá!, ¡Cobrá!,
     ¡Entregá! o ¡Armá!). Cada ronda va un poco más rápido.
   - Ronda 10: el jefe ¡YUPI! (batalla contra el camarón).
   - Si se pasan las 10 rondas: pantalla de victoria.
   - Si se pierden las 3 vidas: pantalla de «Intentá de nuevo».

   Este archivo usa el catálogo y las funciones de js/app.js
   (PRODUCTOS, formatearGs, formatearKg), por eso app.js se carga primero.

   El juego NO guarda datos (no usa localStorage ni cookies),
   NO envía nada por internet y NO pide datos personales.
   Los precios que aparecen son ILUSTRATIVOS.

   ÍNDICE
   1. Configuración (constantes)
   2. Texturas (imágenes que pone el grupo en img/texturas/)
   3. Utilidades (y 3b. Sonido)
   4. Estado del juego y director
   5. Microjuegos (uno por función)
   6. Jefe ¡YUPI!
   7. Arranque
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. CONFIGURACIÓN
   Si queremos cambiar una regla del juego, se cambia acá.
   ---------------------------------------------------------- */
const TOTAL_RONDAS = 10;        // la ronda 10 es el jefe
const VIDAS_INICIALES = 3;
const PAUSA_CONSIGNA = 1100;    // milisegundos que se muestra la orden («¡PESÁ!»)
const PAUSA_RESULTADO = 950;    // milisegundos que se muestra «¡BIEN!» o «¡FALLASTE!»
const PUNTOS_MICROJUEGO = 100;
const PUNTOS_JEFE = 500;
const PUNTOS_POR_VIDA = 100;    // bonus por cada vida que sobra al ganar
const VIDA_JEFE = 500;          // vida del camarón

// Aviso «Texturas por colocar…» en la pantalla de inicio. Es solo para quienes están armando
// el juego: dejarlo en false al publicar; poner true mientras se trabaja con las imágenes.
const MOSTRAR_AVISO_TEXTURAS = false;

// Música de fondo (se reproduce solo después de tocar «Comenzar» y se puede silenciar)
const SONIDO_RUTA = "sfx/chomp.m4a";
const SONIDO_VOLUMEN = 0.4;     // 0 = silencio, 1 = volumen máximo

          
         

/* ----------------------------------------------------------
   2. TEXTURAS
   Cada textura tiene una o más rutas posibles (se prueba la primera;
   si el archivo no existe, se prueba la siguiente).
   Si ninguna existe, el juego dibuja un recuadro amarillo con el
   nombre del archivo, para que sepamos qué imagen falta poner.
   Los tamaños de acá son SUGERENCIAS para cuando hagan las imágenes.
   ---------------------------------------------------------- */
const CARPETA_TEXTURAS = "img/texturas/";

const TEXTURAS = {
  cerdito:       { rutas: [CARPETA_TEXTURAS + "cerdito.png"],        ancho: 120, alto: 120, etiqueta: "cerdito.png" },
  casa:          { rutas: [CARPETA_TEXTURAS + "casa.png"],           ancho: 140, alto: 140, etiqueta: "casa.png" },
  bolsa:         { rutas: [CARPETA_TEXTURAS + "bolsa.png"],          ancho: 220, alto: 220, etiqueta: "bolsa.png" },
  balanza:       { rutas: [CARPETA_TEXTURAS + "balanza.png"],        ancho: 560, alto: 140, etiqueta: "balanza.png" },
  aguja:         { rutas: [CARPETA_TEXTURAS + "aguja.png"],          ancho: 24,  alto: 140, etiqueta: "aguja.png", sinTexto: true },
  cerditoCohete: { rutas: [CARPETA_TEXTURAS + "cerdito-cohete.png"], ancho: 96,  alto: 96,  etiqueta: "cerdito-cohete.png" },
  camaron:       { rutas: [CARPETA_TEXTURAS + "camaron.png"],        ancho: 200, alto: 140, etiqueta: "camaron.png" },
  // Disparo del cerdito: usa la imagen del Jamón porcino. Para usar una imagen propia, guardar
  // img/texturas/bala-jamon.png y escribir su ruta ANTES de la otra: rutas: [CARPETA_TEXTURAS + "bala-jamon.png", "img/yupi-de-cerdo.png"]
  balaJamon:     { rutas: ["img/yupi-de-cerdo.png"], ancho: 32, alto: 32, etiqueta: "bala-jamon.png", sinTexto: true, opcional: true },
  balaCamaron:   { rutas: [CARPETA_TEXTURAS + "bala-camaron.png"],   ancho: 24,  alto: 24,  etiqueta: "bala-camaron.png", sinTexto: true },
  // Fondo del combate: opcional (sin imagen se usa un degradado oscuro). Para usar uno propio, guardar
  // img/texturas/fondo-jefe.png y escribir: rutas: [CARPETA_TEXTURAS + "fondo-jefe.png"]
  fondoJefe:     { rutas: [], ancho: 360, alto: 520, etiqueta: "fondo-jefe.png", sinTexto: true, opcional: true }
};

// Acá se guarda el resultado de la carga: clave -> { imagen, ruta }
const texturasListas = {};

// Prueba las rutas de una textura de a una, hasta que una cargue.
function probarRuta(clave, indice, alTerminar) {
  const rutas = TEXTURAS[clave].rutas;
  if (indice >= rutas.length) {
    texturasListas[clave] = { imagen: null, ruta: null };   // no hay ninguna
    alTerminar();
    return;
  }
  const imagen = new Image();
  imagen.onload = function () {
    texturasListas[clave] = { imagen: imagen, ruta: rutas[indice] };
    alTerminar();
  };
  imagen.onerror = function () {
    probarRuta(clave, indice + 1, alTerminar);
  };
  imagen.src = rutas[indice];
}

// Carga todas las texturas y avisa cuando terminó.
function cargarTexturas(alTerminar) {
  const claves = Object.keys(TEXTURAS);
  let pendientes = claves.length;
  let avisado = false;

  function uno() {
    pendientes = pendientes - 1;
    if (pendientes === 0 && !avisado) {
      avisado = true;
      alTerminar();
    }
  }
  claves.forEach(function (clave) {
    probarRuta(clave, 0, uno);
  });

  // Seguro: si algo tarda demasiado, se sigue igual sin esas texturas.
  setTimeout(function () {
    if (!avisado) {
      avisado = true;
      claves.forEach(function (clave) {
        if (!texturasListas[clave]) {
          texturasListas[clave] = { imagen: null, ruta: null };
        }
      });
      alTerminar();
    }
  }, 4000);
}

// Lista las texturas obligatorias que todavía no están en la carpeta
// (las marcadas como "opcional" tienen un respaldo y no se cuentan).
function texturasFaltantes() {
  const faltan = [];
  Object.keys(TEXTURAS).forEach(function (clave) {
    const listo = texturasListas[clave];
    if (!TEXTURAS[clave].opcional && (!listo || !listo.ruta)) {
      faltan.push(TEXTURAS[clave].etiqueta);
    }
  });
  return faltan;
}

// Crea un elemento HTML para una textura: <img> si existe, recuadro si falta.
function crearTextura(clave) {
  const datos = TEXTURAS[clave];
  const listo = texturasListas[clave];
  let elemento;

  if (listo && listo.ruta) {
    elemento = document.createElement("img");
    elemento.src = listo.ruta;
    elemento.alt = "";
    elemento.draggable = false;
  } else {
    elemento = document.createElement("span");
    elemento.className = "textura-falta";
    if (!datos.sinTexto) {
      elemento.textContent = datos.etiqueta;
    }
  }
  elemento.classList.add("tex", "tex-" + clave);
  elemento.setAttribute("aria-hidden", "true");
  return elemento;
}

// Dibuja una textura en el lienzo (canvas), centrada en (x, y).
// colorRespaldo: color del recuadro/círculo si la textura no existe.
function dibujarTextura(ctx, clave, x, y, ancho, alto, colorRespaldo) {
  const listo = texturasListas[clave];
  if (listo && listo.imagen) {
    // Mantiene la proporción de la imagen (no la deforma)
    const escala = Math.min(ancho / listo.imagen.width, alto / listo.imagen.height);
    const w = listo.imagen.width * escala;
    const h = listo.imagen.height * escala;
    ctx.drawImage(listo.imagen, x - w / 2, y - h / 2, w, h);
    return;
  }
  // No hay textura: recuadro de color (o círculo si es chico)
  ctx.fillStyle = colorRespaldo;
  if (ancho < 40) {
    ctx.beginPath();
    ctx.arc(x, y, ancho / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillRect(x - ancho / 2, y - alto / 2, ancho, alto);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(TEXTURAS[clave].etiqueta, x, y);
  }
}

/* ----------------------------------------------------------
   3. UTILIDADES
   ---------------------------------------------------------- */

// Mezcla un arreglo (Fisher-Yates) sin modificar el original.
function mezclar(arreglo) {
  const copia = arreglo.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const guardado = copia[i];
    copia[i] = copia[j];
    copia[j] = guardado;
  }
  return copia;
}

function elegirAlAzar(arreglo) {
  return arreglo[Math.floor(Math.random() * arreglo.length)];
}

// Mantiene un número entre un mínimo y un máximo.
function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

// Crea un elemento HTML con clase y texto.
function nuevoElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) {
    elemento.className = clase;
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}

// Ejecuta "accion" cuando se TOCA el elemento (pointerdown responde más
// rápido que click) o cuando se aprieta Enter o Espacio (teclado).
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

// Texto leído por los lectores de pantalla (no se ve).
function anunciar(texto) {
  document.getElementById("anuncio-juego").textContent = texto;
}

/* ----------------------------------------------------------
   3b. SONIDO (música de fondo)
   Solo suena después de tocar «Comenzar» o «Volver a jugar», se puede silenciar
   en cualquier momento (casilla de la pantalla de inicio o botón del marcador),
   se detiene al terminar la partida y cuando se cambia de pestaña.
   ---------------------------------------------------------- */
let musica = null;                 // el objeto de audio (se crea la primera vez)
let sonidoActivado = true;         // lo decide la persona
let sonidoDisponible = true;       // pasa a false si el navegador no puede reproducirlo

function actualizarBotonSonido() {
  const boton = document.getElementById("btn-sonido");
  boton.textContent = sonidoActivado ? "Sonido: sí" : "Sonido: no";
  boton.setAttribute("aria-pressed", String(sonidoActivado));
  boton.hidden = !sonidoDisponible;
  document.getElementById("sonido-activado").checked = sonidoActivado;
}

function iniciarSonido() {
  if (!sonidoActivado || !sonidoDisponible) {
    return;
  }
  if (musica === null) {
    musica = new Audio(SONIDO_RUTA);
    musica.loop = true;
    musica.volume = SONIDO_VOLUMEN;
    // Si el navegador no puede reproducir el archivo, se juega sin sonido y sin errores
    musica.addEventListener("error", function () {
      sonidoDisponible = false;
      actualizarBotonSonido();
    });
  }
  const promesa = musica.play();
  if (promesa !== undefined) {
    promesa.catch(function () {
      // el navegador no lo permitió: se sigue jugando sin sonido
    });
  }
}

function pausarSonido() {
  if (musica !== null) {
    musica.pause();
  }
}

function detenerSonido() {
  if (musica !== null) {
    musica.pause();
    musica.currentTime = 0;
  }
}

function alternarSonido() {
  sonidoActivado = !sonidoActivado;
  actualizarBotonSonido();
  if (sonidoActivado && estado.fase !== "inicio" && estado.fase !== "fin") {
    iniciarSonido();
  } else {
    pausarSonido();
  }
}

/* ----------------------------------------------------------
   4. ESTADO DEL JUEGO Y DIRECTOR
   El "director" decide qué pasa en cada momento:
   consigna -> microjuego -> resultado -> siguiente ronda ... -> jefe -> final
   ---------------------------------------------------------- */
let estado = {
  fase: "inicio",       // inicio, consigna, juego, resultado, jefe, fin
  ronda: 0,
  vidas: VIDAS_INICIALES,
  puntaje: 0,
  rondasGanadas: 0,
  tranquilo: false,     // modo tranquilo: más tiempo y más lento
  ultimoId: null,       // para no repetir el mismo microjuego dos veces seguidas
  actual: null,         // el microjuego (o el jefe) que se está jugando
  tiempoTotal: 0,
  transcurrido: 0
};

let temporizadores = [];     // setTimeout pendientes (para poder cancelarlos)
let idAnimacion = null;      // número del requestAnimationFrame
let tiempoPrevio = 0;

const PANTALLAS = [
  "pantalla-inicio", "pantalla-consigna", "pantalla-micro",
  "pantalla-jefe", "pantalla-victoria", "pantalla-derrota"
];

function mostrarPantalla(id) {
  PANTALLAS.forEach(function (pantalla) {
    document.getElementById(pantalla).hidden = (pantalla !== id);
  });
  const conMarcador = ["pantalla-consigna", "pantalla-micro", "pantalla-jefe"];
  document.getElementById("hud").hidden = !conMarcador.includes(id);
}

// Marcador de arriba: ronda, vidas y puntaje.
function actualizarHUD() {
  const vidas = limitar(estado.vidas, 0, VIDAS_INICIALES);   // nunca menos de 0 ni más de 3 corazones
  const caja = document.getElementById("hud-vidas");
  document.getElementById("hud-ronda").textContent = "Ronda " + estado.ronda + " de " + TOTAL_RONDAS;
  caja.textContent = "♥".repeat(vidas) + "♡".repeat(VIDAS_INICIALES - vidas);
  caja.setAttribute("aria-label", "Vidas: " + vidas + " de " + VIDAS_INICIALES);
  document.getElementById("hud-puntaje").textContent = estado.puntaje;
}

function esperar(milisegundos, accion) {
  temporizadores.push(setTimeout(accion, milisegundos));
}

function limpiarTemporizadores() {
  temporizadores.forEach(function (id) {
    clearTimeout(id);
  });
  temporizadores = [];
}

function detenerActual() {
  if (estado.actual && estado.actual.detener) {
    estado.actual.detener();
  }
  estado.actual = null;
}

/* ----- Reloj del juego: se repite unas 60 veces por segundo ----- */
function iniciarBucle() {
  if (idAnimacion === null) {
    tiempoPrevio = performance.now();
    idAnimacion = requestAnimationFrame(bucle);
  }
}

function detenerBucle() {
  if (idAnimacion !== null) {
    cancelAnimationFrame(idAnimacion);
    idAnimacion = null;
  }
}

function bucle(ahora) {
  idAnimacion = requestAnimationFrame(bucle);

  // dt = segundos que pasaron desde el cuadro anterior (con un tope)
  let dt = (ahora - tiempoPrevio) / 1000;
  tiempoPrevio = ahora;
  dt = limitar(dt, 0, 0.05);

  if (!estado.actual) {
    return;
  }

  if (estado.fase === "juego") {
    estado.transcurrido = estado.transcurrido + dt * 1000;
    const restante = 1 - estado.transcurrido / estado.tiempoTotal;
    const relleno = document.getElementById("tiempo-relleno");
    relleno.style.width = Math.max(restante, 0) * 100 + "%";
    relleno.classList.toggle("poco", restante < 0.3);

    if (estado.transcurrido >= estado.tiempoTotal) {
      resolverMicrojuego(false, "¡Se acabó el tiempo!");
      return;
    }
    if (estado.actual.actualizar) {
      estado.actual.actualizar(dt);
    }
  } else if (estado.fase === "jefe") {
    estado.actual.actualizar(dt);
  }
}

/* ----- Velocidad de cada ronda ----- */
// Ronda 1 -> ritmo 1,0; ronda 9 -> ritmo 1,8. El modo tranquilo lo baja un 25 %.
function calcularRitmo() {
  let ritmo = 1 + (estado.ronda - 1) * 0.1;
  if (estado.tranquilo) {
    ritmo = ritmo * 0.75;
  }
  return ritmo;
}

// Tiempo disponible: cuanto más rápido el ritmo, menos tiempo (pero no tanto).
function calcularTiempo(micro, ritmo) {
  let tiempo = micro.tiempoBase / (1 + (ritmo - 1) * 0.5);
  if (estado.tranquilo) {
    tiempo = tiempo * 1.6;
  }
  return Math.round(tiempo);
}

/* ----- Elegir microjuego (sin repetir el anterior) ----- */
function elegirMicrojuego() {
  const posibles = MICROJUEGOS.filter(function (micro) {
    return micro.id !== estado.ultimoId;
  });
  return elegirAlAzar(posibles);
}

/* ----- Flujo de una ronda ----- */
function empezar() {
  limpiarTemporizadores();
  detenerActual();
  estado.ronda = 0;
  estado.vidas = VIDAS_INICIALES;
  estado.puntaje = 0;
  estado.rondasGanadas = 0;
  estado.ultimoId = null;
  estado.tranquilo = document.getElementById("modo-tranquilo").checked;
  sonidoActivado = document.getElementById("sonido-activado").checked;
  actualizarBotonSonido();
  iniciarSonido();
  iniciarBucle();
  document.getElementById("juego-app").scrollIntoView();
  iniciarRonda();
}

function iniciarRonda() {
  estado.ronda = estado.ronda + 1;
  actualizarHUD();

  if (estado.ronda >= TOTAL_RONDAS) {
    mostrarConsigna("¡YUPI!", "¡Jefe final! Derrotá al camarón", 1800, arrancarJefe);
    return;
  }
  const micro = elegirMicrojuego();
  estado.ultimoId = micro.id;
  mostrarConsigna(micro.consigna, micro.ayuda, PAUSA_CONSIGNA, function () {
    arrancarMicrojuego(micro);
  });
}

function mostrarConsigna(titulo, subtitulo, pausa, alTerminar) {
  estado.fase = "consigna";
  document.getElementById("consigna-titulo").textContent = titulo;
  document.getElementById("consigna-subtitulo").textContent = subtitulo;
  mostrarPantalla("pantalla-consigna");
  anunciar("Ronda " + estado.ronda + " de " + TOTAL_RONDAS + ". " + titulo + " " + subtitulo + ".");
  esperar(pausa, alTerminar);
}

function arrancarMicrojuego(micro) {
  const zona = document.getElementById("zona-micro");
  zona.innerHTML = "";
  document.getElementById("resultado-micro").hidden = true;
  mostrarPantalla("pantalla-micro");

  const ritmo = calcularRitmo();
  estado.tiempoTotal = calcularTiempo(micro, ritmo);
  estado.transcurrido = 0;
  estado.fase = "juego";
  document.getElementById("tiempo-relleno").style.width = "100%";

  estado.actual = micro.iniciar(zona, ritmo, resolverMicrojuego);
  estado.actual.id = micro.id;
  document.getElementById("instruccion").textContent = estado.actual.instruccion;
  anunciar(estado.actual.instruccion);

  // Para quien usa teclado: el foco empieza en el primer botón visible
  const primero = zona.querySelector("button");
  if (primero && primero.style.visibility !== "hidden") {
    primero.focus();
  }
}

// Se llama cuando se gana o se pierde el microjuego.
function resolverMicrojuego(gano, mensaje) {
  if (estado.fase !== "juego") {
    return;                          // evita resolver dos veces
  }
  estado.fase = "resultado";
  const restante = Math.max(1 - estado.transcurrido / estado.tiempoTotal, 0);
  detenerActual();

  if (gano) {
    estado.puntaje = estado.puntaje + PUNTOS_MICROJUEGO + Math.round(restante * 50);
    estado.rondasGanadas = estado.rondasGanadas + 1;
  } else {
    estado.vidas = estado.vidas - 1;
  }
  actualizarHUD();
  mostrarResultado("resultado-micro", gano, mensaje);

  esperar(PAUSA_RESULTADO, function () {
    if (estado.vidas <= 0) {
      finDelJuego(false);
    } else {
      iniciarRonda();
    }
  });
}

// Muestra el cartel «¡BIEN!» o «¡FALLASTE!» sobre la pantalla.
function mostrarResultado(idCartel, gano, mensaje) {
  const cartel = document.getElementById(idCartel);
  const titulo = gano ? "¡BIEN!" : "¡FALLASTE!";
  cartel.className = "resultado-juego " + (gano ? "bien" : "mal");
  cartel.querySelector(".resultado-titulo").textContent = titulo;
  cartel.querySelector(".resultado-mensaje").textContent = mensaje + (gano ? "" : " Perdés una vida.");
  cartel.hidden = false;
  anunciar(titulo + " " + mensaje);
}

function finDelJuego(victoria) {
  estado.fase = "fin";
  limpiarTemporizadores();
  detenerActual();
  detenerBucle();
  detenerSonido();

  if (victoria) {
    document.getElementById("victoria-puntaje").textContent = "Puntaje final: " + estado.puntaje;
    document.getElementById("victoria-detalle").textContent =
      "Vidas que te quedaron: " + Math.max(estado.vidas, 0) + " de " + VIDAS_INICIALES + ".";
    mostrarPantalla("pantalla-victoria");
    anunciar("¡Victoria! Derrotaste al camarón. Puntaje final: " + estado.puntaje + ".");
    document.getElementById("victoria-titulo").focus();
  } else {
    document.getElementById("derrota-puntaje").textContent = "Puntaje: " + estado.puntaje;
    document.getElementById("derrota-detalle").textContent =
      "Llegaste a la ronda " + estado.ronda + " de " + TOTAL_RONDAS + ".";
    mostrarPantalla("pantalla-derrota");
    anunciar("Perdiste las 3 vidas. Intentá de nuevo. Puntaje: " + estado.puntaje + ".");
    document.getElementById("derrota-titulo").focus();
  }
}

/* ----------------------------------------------------------
   5. MICROJUEGOS
   Cada microjuego es una función que recibe:
     zona     -> el <div> donde se dibuja
     ritmo    -> qué tan rápido va (1,0 al principio, 1,8 al final)
     resolver -> función a la que se avisa si se ganó (true) o perdió (false)
   y devuelve un objeto con:
     instruccion -> el texto grande de arriba
     actualizar  -> (opcional) se llama en cada cuadro, para animar
   ---------------------------------------------------------- */

/* ----- ¡Pesá! -----
   Una aguja va y viene sobre la balanza (de 0 a 3 kg).
   Hay que tocar cuando marque el peso pedido. */
function iniciarPesa(zona, ritmo, resolver) {
  const OBJETIVOS = [0.5, 1, 1.5, 2, 2.5];
  const MAXIMO_KG = 3;
  const TOLERANCIA = 0.25;                 // margen de error en kg
  const objetivo = elegirAlAzar(OBJETIVOS);
  const velocidad = 0.55 * ritmo;          // recorridos completos por segundo
  let posicion = Math.random();            // 0 = izquierda, 1 = derecha
  let direccion = Math.random() < 0.5 ? 1 : -1;

  const medidor = nuevoElemento("div", "medidor");
  medidor.appendChild(crearTextura("balanza"));
  for (let kg = 0; kg <= MAXIMO_KG; kg = kg + 0.5) {
    const marca = nuevoElemento("span", "marca", String(kg).replace(".", ","));
    marca.style.left = (kg / MAXIMO_KG) * 100 + "%";
    medidor.appendChild(marca);
  }
  const aguja = crearTextura("aguja");
  aguja.classList.add("aguja");
  aguja.style.left = posicion * 100 + "%";
  medidor.appendChild(aguja);

  const boton = nuevoElemento("button", "boton boton-rojo boton-grande", "¡PESAR!");
  boton.type = "button";

  // Todo va dentro de una "escena" propia de este microjuego. Los toques se escuchan
  // en la escena y NO en la zona, porque la zona se reutiliza en cada microjuego
  // y las escuchas viejas se acumularían.
  const escena = nuevoElemento("div", "escena-pesa");
  escena.appendChild(medidor);
  escena.appendChild(boton);
  zona.appendChild(escena);

  // Tocar en cualquier parte de la escena (o Enter/Espacio) pesa.
  alPulsar(escena, function () {
    const peso = posicion * MAXIMO_KG;
    const mostrado = formatearKg(Math.round(peso * 10) / 10);
    if (Math.abs(peso - objetivo) <= TOLERANCIA) {
      resolver(true, "¡Marcó " + mostrado + "!");
    } else {
      resolver(false, "Marcó " + mostrado + " y se pedían " + formatearKg(objetivo) + ".");
    }
  });

  return {
    instruccion: "Pesá " + formatearKg(objetivo),
    actualizar: function (dt) {
      posicion = posicion + direccion * velocidad * dt;
      if (posicion >= 1) {
        posicion = 1;
        direccion = -1;
      } else if (posicion <= 0) {
        posicion = 0;
        direccion = 1;
      }
      aguja.style.left = posicion * 100 + "%";
    }
  };
}

/* ----- ¡Atrapá! -----
   Caen cuatro productos. Hay que tocar solo el pedido. */
function iniciarAtrapa(zona, ritmo, resolver) {
  const TAMANO = 76;
  const objetivo = elegirAlAzar(PRODUCTOS);
  const otros = mezclar(PRODUCTOS.filter(function (producto) {
    return producto.id !== objetivo.id;
  })).slice(0, 3);
  const productos = mezclar([objetivo].concat(otros));
  const alto = zona.clientHeight;
  const objetos = [];

  productos.forEach(function (producto, columna) {
    const boton = nuevoElemento("button", "cae");
    boton.type = "button";
    boton.setAttribute("aria-label", producto.nombre);

    const foto = document.createElement("img");
    foto.src = producto.imagen;
    foto.alt = "";
    foto.draggable = false;
    boton.appendChild(foto);

    boton.style.left = ((columna + 0.5) / productos.length) * 100 + "%";
    boton.style.visibility = "hidden";          // aparece cuando le toca caer

    const duracion = (2.6 + Math.random() * 0.9) / (1 + (ritmo - 1) * 0.6);
    const objeto = {
      elemento: boton,
      y: -TAMANO,
      velocidad: (alto + TAMANO) / duracion,    // píxeles por segundo
      retraso: Math.random() * 0.6,
      esObjetivo: producto.id === objetivo.id
    };

    alPulsar(boton, function () {
      if (objeto.esObjetivo) {
        resolver(true, "¡Atrapaste " + producto.nombre.toLowerCase() + "!");
      } else {
        resolver(false, "¡Ese no era! Se pedía " + objetivo.nombre.toLowerCase() + ".");
      }
    });

    zona.appendChild(boton);
    objetos.push(objeto);
  });

  return {
    instruccion: "Atrapá: " + objetivo.nombre,
    actualizar: function (dt) {
      for (const objeto of objetos) {
        if (objeto.retraso > 0) {
          objeto.retraso = objeto.retraso - dt;
          if (objeto.retraso > 0) {
            continue;
          }
          objeto.elemento.style.visibility = "visible";
        }
        objeto.y = objeto.y + objeto.velocidad * dt;
        objeto.elemento.style.transform = "translate(-50%, " + objeto.y + "px)";
        if (objeto.esObjetivo && objeto.y >= alto) {
          resolver(false, "¡Se te escapó el pedido!");
        }
      }
    }
  };
}

/* ----- ¡Cobrá! -----
   Un pedido (por ejemplo «2 kg de carne molida») y tres totales posibles.
   Hay que elegir el correcto. Usa los precios del catálogo. */
function iniciarCobra(zona, ritmo, resolver) {
  const producto = elegirAlAzar(PRODUCTOS);
  const kilos = elegirAlAzar([0.5, 1, 1.5, 2, 3]);
  const correcto = Math.round(producto.precioKg * kilos);

  // Posibles errores típicos: no multiplicar, sumar de más, duplicar, etc.
  const candidatos = [
    producto.precioKg,
    Math.round(producto.precioKg * (kilos + 0.5)),
    Math.round(producto.precioKg * (kilos - 0.5)),
    correcto * 2,
    Math.round(correcto / 2),
    correcto + 1000,
    correcto - 1000
  ];
  const incorrectos = [];
  mezclar(candidatos).forEach(function (valor) {
    if (valor > 0 && valor !== correcto && incorrectos.indexOf(valor) === -1 && incorrectos.length < 2) {
      incorrectos.push(valor);
    }
  });
  const opciones = mezclar([
    { monto: correcto, correcta: true },
    { monto: incorrectos[0], correcta: false },
    { monto: incorrectos[1], correcta: false }
  ]);

  const pedido = nuevoElemento("div", "cobra-pedido");
  const foto = document.createElement("img");
  foto.src = producto.imagen;
  foto.alt = "";
  foto.draggable = false;
  foto.className = "tex-producto-grande";
  pedido.appendChild(foto);
  pedido.appendChild(nuevoElemento("p", "cobra-texto", formatearKg(kilos) + " de " + producto.nombre.toLowerCase()));
  pedido.appendChild(nuevoElemento("p", "cobra-precio", formatearGs(producto.precioKg) + " por kg (precio ilustrativo)"));
  zona.appendChild(pedido);

  const caja = nuevoElemento("div", "cobra-opciones");
  opciones.forEach(function (opcion) {
    const boton = nuevoElemento("button", "boton boton-amarillo boton-total", formatearGs(opcion.monto));
    boton.type = "button";
    alPulsar(boton, function () {
      if (opcion.correcta) {
        resolver(true, "¡Total correcto: " + formatearGs(correcto) + "!");
      } else {
        resolver(false, "El total era " + formatearGs(correcto) + ".");
      }
    });
    caja.appendChild(boton);
  });
  zona.appendChild(caja);

  return {
    instruccion: "Cobrá: " + formatearKg(kilos) + " de " + producto.nombre.toLowerCase()
  };
}

/* ----- ¡Entregá! -----
   Hay que tocar al cerdito varias veces para que avance hasta la casa. */
function iniciarEntrega(zona, ritmo, resolver) {
  const TOQUES_NECESARIOS = 10;
  let toques = 0;

  const pista = nuevoElemento("div", "pista");
  pista.style.setProperty("--avance", 0);

  const casa = crearTextura("casa");
  casa.classList.add("casa");
  pista.appendChild(casa);

  const cerdito = nuevoElemento("button", "cerdito");
  cerdito.type = "button";
  cerdito.setAttribute("aria-label", "Cerdito: tocalo para que avance");
  cerdito.appendChild(crearTextura("cerdito"));
  pista.appendChild(cerdito);

  const contador = nuevoElemento("p", "contador", "Toques: 0 de " + TOQUES_NECESARIOS);
  zona.appendChild(pista);
  zona.appendChild(contador);

  alPulsar(cerdito, function () {
    toques = toques + 1;
    pista.style.setProperty("--avance", Math.min(toques / TOQUES_NECESARIOS, 1));
    contador.textContent = "Toques: " + Math.min(toques, TOQUES_NECESARIOS) + " de " + TOQUES_NECESARIOS;
    if (toques >= TOQUES_NECESARIOS) {
      resolver(true, "¡Pedido entregado!");
    }
  });

  return {
    instruccion: "Tocá al cerdito para llegar a la casa"
  };
}

/* ----- ¡Armá! -----
   Una lista de tres productos: hay que ponerlos en la bolsa.
   Si se pone uno que no está en la lista, se pierde. */
function iniciarArma(zona, ritmo, resolver) {
  const lista = mezclar(PRODUCTOS).slice(0, 3);
  const enBolsa = [];

  // Lista de pedido
  const cajaLista = nuevoElemento("ul", "lista-arma");
  const itemsLista = {};
  lista.forEach(function (producto) {
    const item = nuevoElemento("li", "", producto.nombre);
    itemsLista[producto.id] = item;
    cajaLista.appendChild(item);
  });
  zona.appendChild(cajaLista);

  // Estante con los seis productos
  const estante = nuevoElemento("div", "estante");
  const contenidoBolsa = nuevoElemento("div", "contenido-bolsa");

  mezclar(PRODUCTOS).forEach(function (producto) {
    const boton = nuevoElemento("button", "producto-estante");
    boton.type = "button";

    const foto = document.createElement("img");
    foto.src = producto.imagen;
    foto.alt = "";
    foto.draggable = false;
    boton.appendChild(foto);
    boton.appendChild(nuevoElemento("span", "", producto.nombre));

    alPulsar(boton, function () {
      const estaEnLista = lista.some(function (p) {
        return p.id === producto.id;
      });
      if (!estaEnLista) {
        resolver(false, producto.nombre + " no estaba en la lista.");
        return;
      }
      if (enBolsa.indexOf(producto.id) !== -1) {
        return;                              // ya está en la bolsa
      }
      enBolsa.push(producto.id);
      boton.classList.add("en-bolsa");
      boton.setAttribute("aria-disabled", "true");
      itemsLista[producto.id].classList.add("listo");
      itemsLista[producto.id].textContent = "✔ " + producto.nombre;

      const mini = document.createElement("img");
      mini.src = producto.imagen;
      mini.alt = "";
      contenidoBolsa.appendChild(mini);

      if (enBolsa.length === lista.length) {
        resolver(true, "¡Pedido armado!");
      }
    });
    estante.appendChild(boton);
  });
  zona.appendChild(estante);

  // Bolsa
  const bolsa = nuevoElemento("div", "bolsa");
  bolsa.appendChild(crearTextura("bolsa"));
  bolsa.appendChild(contenidoBolsa);
  zona.appendChild(bolsa);

  const nombres = lista.map(function (producto) {
    return producto.nombre.toLowerCase();
  });
  return {
    instruccion: "Poné en la bolsa: " + nombres.join(", ")
  };
}

// Catálogo de microjuegos: un arreglo de objetos.
const MICROJUEGOS = [
  { id: "pesa",    consigna: "¡PESÁ!",    ayuda: "Tocá cuando la aguja marque el peso pedido", tiempoBase: 5000, iniciar: iniciarPesa },
  { id: "atrapa",  consigna: "¡ATRAPÁ!",  ayuda: "Tocá solo el producto pedido",               tiempoBase: 4500, iniciar: iniciarAtrapa },
  { id: "cobra",   consigna: "¡COBRÁ!",   ayuda: "Elegí el total correcto",                    tiempoBase: 6000, iniciar: iniciarCobra },
  { id: "entrega", consigna: "¡ENTREGÁ!", ayuda: "Tocá al cerdito para que llegue a la casa",  tiempoBase: 5000, iniciar: iniciarEntrega },
  { id: "arma",    consigna: "¡ARMÁ!",    ayuda: "Poné en la bolsa los productos de la lista", tiempoBase: 7000, iniciar: iniciarArma }
];

/* ----------------------------------------------------------
   6. JEFE ¡YUPI!
   El cerdito va en un cohete y dispara jamón. Enfrente está el camarón
   (500 de vida) que lanza muchas balas. Se dibuja en un <canvas>.
   Controles: arrastrar con el dedo, mover el mouse o usar las flechas / WASD
   (con Shift se mueve más lento). El cerdito dispara solo.
   ---------------------------------------------------------- */
const ANCHO_LIENZO = 360;
const ALTO_LIENZO = 520;
const Y_MINIMA_JUGADOR = 150;          // el cerdito no puede subir hasta el camarón

let lienzoJefe = null;
let ctx = null;
let jefe = null;
let jugador = null;
let balasJugador = [];
let balasEnemigas = [];
let arrastre = null;                   // datos del dedo mientras se arrastra
const teclas = {};                     // teclas apretadas

// Suelta todas las teclas y el dedo (por ejemplo, si la ventana pierde el foco con una tecla apretada)
function soltarControles() {
  Object.keys(teclas).forEach(function (tecla) {
    teclas[tecla] = false;
  });
  arrastre = null;
}

function arrancarJefe() {
  estado.fase = "jefe";
  reiniciarJefe();
  mostrarPantalla("pantalla-jefe");
  estado.actual = {
    id: "jefe",
    instruccion: "¡YUPI! Derrotá al camarón",
    actualizar: actualizarJefe
  };
  anunciar("Combate contra el camarón. Tiene " + VIDA_JEFE + " de vida.");
}

function reiniciarJefe() {
  lienzoJefe = document.getElementById("lienzo-jefe");
  ctx = lienzoJefe.getContext("2d");

  jefe = {
    x: ANCHO_LIENZO / 2, y: 85, ancho: 140, alto: 100,
    vida: VIDA_JEFE, vidaMostrada: -1,
    tiempo: 0, fase: 1, espera: 1.2,
    recargaAnillo: 1, recargaApuntado: 0.5, recargaEspiral: 0, angulo: 0
  };
  jugador = {
    x: ANCHO_LIENZO / 2, y: ALTO_LIENZO - 80, ancho: 64, alto: 64,
    radio: 5,                           // radio del "punto débil" (muy chico a propósito)
    invulnerable: 0, recarga: 0
  };
  balasJugador = [];
  balasEnemigas = [];
  soltarControles();
  document.getElementById("resultado-jefe").hidden = true;
  actualizarBarraJefe();
  dibujarJefe();
}

function actualizarBarraJefe() {
  if (jefe.vidaMostrada === jefe.vida) {
    return;                             // no hay cambios
  }
  jefe.vidaMostrada = jefe.vida;
  document.getElementById("jefe-vida-texto").textContent = "Camarón: " + jefe.vida + " / " + VIDA_JEFE;
  document.getElementById("jefe-barra-relleno").style.width = (jefe.vida / VIDA_JEFE) * 100 + "%";
}

/* ----- Disparos del camarón ----- */
function factorBalas() {
  return estado.tranquilo ? 0.75 : 1;   // en modo tranquilo las balas van más lento
}

// Una bala que sale del camarón en la dirección "angulo".
function dispararEnAngulo(angulo, velocidad) {
  balasEnemigas.push({
    x: jefe.x, y: jefe.y + 20, r: 6,
    vx: Math.cos(angulo) * velocidad * factorBalas(),
    vy: Math.sin(angulo) * velocidad * factorBalas()
  });
}

// Un círculo de balas que sale en todas direcciones.
function dispararAnillo(cantidad, velocidad, desfase) {
  for (let i = 0; i < cantidad; i++) {
    dispararEnAngulo(desfase + (i * 2 * Math.PI) / cantidad, velocidad);
  }
}

// Una bala dirigida hacia donde está el cerdito (con un desvío opcional).
function dispararApuntado(velocidad, desvio) {
  const angulo = Math.atan2(jugador.y - jefe.y, jugador.x - jefe.x) + desvio;
  dispararEnAngulo(angulo, velocidad);
}

/* ----- Cuando golpean al cerdito ----- */
function golpearJugador() {
  estado.vidas = estado.vidas - 1;
  actualizarHUD();
  balasEnemigas = [];                   // se limpian las balas
  jugador.invulnerable = 2;             // 2 segundos sin poder ser golpeado
  jefe.espera = 0.8;                    // el camarón descansa un momento
  anunciar("¡Te golpearon! Vidas: " + Math.max(estado.vidas, 0) + ".");
  if (estado.vidas <= 0) {
    finDelJefe(false);
  }
}

function finDelJefe(gano) {
  estado.fase = "resultado";
  if (gano) {
    estado.puntaje = estado.puntaje + PUNTOS_JEFE + estado.vidas * PUNTOS_POR_VIDA;
    actualizarHUD();
    mostrarResultado("resultado-jefe", true, "¡Derrotaste al camarón!");
    esperar(1600, function () {
      finDelJuego(true);
    });
  } else {
    mostrarResultado("resultado-jefe", false, "El camarón te ganó.");
    esperar(1300, function () {
      finDelJuego(false);
    });
  }
}

/* ----- Actualización: se llama en cada cuadro (dt = segundos) ----- */
function actualizarJefe(dt) {
  if (estado.fase !== "jefe") {
    return;
  }
  jefe.tiempo = jefe.tiempo + dt;

  // El camarón se mueve de lado a lado (movimiento de vaivén con seno)
  jefe.x = ANCHO_LIENZO / 2 + Math.sin(jefe.tiempo * 0.9) * 95;

  // Movimiento del cerdito con el teclado
  const velocidadJugador = teclas["shift"] ? 130 : 260;
  if (teclas["arrowleft"] || teclas["a"]) {
    jugador.x = jugador.x - velocidadJugador * dt;
  }
  if (teclas["arrowright"] || teclas["d"]) {
    jugador.x = jugador.x + velocidadJugador * dt;
  }
  if (teclas["arrowup"] || teclas["w"]) {
    jugador.y = jugador.y - velocidadJugador * dt;
  }
  if (teclas["arrowdown"] || teclas["s"]) {
    jugador.y = jugador.y + velocidadJugador * dt;
  }
  jugador.x = limitar(jugador.x, 20, ANCHO_LIENZO - 20);
  jugador.y = limitar(jugador.y, Y_MINIMA_JUGADOR, ALTO_LIENZO - 25);

  // El cerdito dispara solo: dos jamones cada 0,1 segundos
  jugador.recarga = jugador.recarga - dt;
  if (jugador.recarga <= 0) {
    jugador.recarga = jugador.recarga + 0.1;
    balasJugador.push({ x: jugador.x - 10, y: jugador.y - 30, r: 6 });
    balasJugador.push({ x: jugador.x + 10, y: jugador.y - 30, r: 6 });
  }

  // Fase del combate según la vida que le queda al camarón
  let fase = 3;
  if (jefe.vida > 340) {
    fase = 1;
  } else if (jefe.vida > 170) {
    fase = 2;
  }
  if (fase !== jefe.fase) {
    jefe.fase = fase;
    balasEnemigas = [];
    jefe.espera = 1.2;
    anunciar("Fase " + fase + " del combate.");
  }

  // Ataques del camarón (cada uno con su "recarga")
  if (jefe.espera > 0) {
    jefe.espera = jefe.espera - dt;
  } else {
    jefe.recargaAnillo = jefe.recargaAnillo - dt;
    jefe.recargaApuntado = jefe.recargaApuntado - dt;
    jefe.recargaEspiral = jefe.recargaEspiral - dt;

    if (jefe.fase === 1) {
      if (jefe.recargaAnillo <= 0) {
        dispararAnillo(14, 85, Math.random() * Math.PI);
        jefe.recargaAnillo = 1.8;
      }
      if (jefe.recargaApuntado <= 0) {
        dispararApuntado(130, 0);
        jefe.recargaApuntado = 1.0;
      }
    } else if (jefe.fase === 2) {
      if (jefe.recargaEspiral <= 0) {
        dispararEnAngulo(jefe.angulo, 95);
        dispararEnAngulo(jefe.angulo + Math.PI, 95);
        jefe.angulo = jefe.angulo + 0.42;
        jefe.recargaEspiral = 0.16;
      }
      if (jefe.recargaAnillo <= 0) {
        dispararAnillo(10, 80, Math.random() * Math.PI);
        jefe.recargaAnillo = 3.0;
      }
    } else {
      if (jefe.recargaAnillo <= 0) {
        dispararAnillo(18, 90, Math.random() * Math.PI);
        jefe.recargaAnillo = 2.0;
      }
      if (jefe.recargaApuntado <= 0) {
        dispararApuntado(140, -0.28);
        dispararApuntado(140, 0);
        dispararApuntado(140, 0.28);
        jefe.recargaApuntado = 1.1;
      }
      if (jefe.recargaEspiral <= 0) {
        dispararEnAngulo(jefe.angulo, 90);
        jefe.angulo = jefe.angulo + 0.5;
        jefe.recargaEspiral = 0.22;
      }
    }
  }

  // Mover las balas del cerdito (suben) y ver si le pegan al camarón
  balasJugador = balasJugador.filter(function (bala) {
    bala.y = bala.y - 540 * dt;
    const pegaEnX = Math.abs(bala.x - jefe.x) < jefe.ancho / 2 + bala.r;
    const pegaEnY = Math.abs(bala.y - jefe.y) < jefe.alto / 2 + bala.r;
    if (pegaEnX && pegaEnY) {
      jefe.vida = jefe.vida - 1;
      return false;                     // la bala desaparece
    }
    return bala.y > -20;                // se queda mientras esté en pantalla
  });

  if (jefe.vida <= 0) {
    jefe.vida = 0;
    balasEnemigas = [];
    actualizarBarraJefe();
    dibujarJefe();
    finDelJefe(true);
    return;
  }

  // Mover las balas del camarón y quitar las que salieron de la pantalla
  balasEnemigas = balasEnemigas.filter(function (bala) {
    bala.x = bala.x + bala.vx * dt;
    bala.y = bala.y + bala.vy * dt;
    return bala.x > -20 && bala.x < ANCHO_LIENZO + 20 && bala.y > -20 && bala.y < ALTO_LIENZO + 20;
  });

  // ¿Alguna bala toca el punto débil del cerdito? (distancia entre círculos)
  if (jugador.invulnerable > 0) {
    jugador.invulnerable = jugador.invulnerable - dt;
  } else {
    for (const bala of balasEnemigas) {
      const dx = bala.x - jugador.x;
      const dy = bala.y - jugador.y;
      const suma = bala.r + jugador.radio;
      if (dx * dx + dy * dy < suma * suma) {
        golpearJugador();
        break;
      }
    }
  }

  if (estado.fase === "jefe") {
    actualizarBarraJefe();
    dibujarJefe();
  }
}

/* ----- Dibujo del combate ----- */
function dibujarJefe() {
  // Fondo
  const fondo = texturasListas.fondoJefe;
  if (fondo && fondo.imagen) {
    ctx.drawImage(fondo.imagen, 0, 0, ANCHO_LIENZO, ALTO_LIENZO);
  } else {
    const degradado = ctx.createLinearGradient(0, 0, 0, ALTO_LIENZO);
    degradado.addColorStop(0, "#1b0f2e");
    degradado.addColorStop(1, "#4a1d3f");
    ctx.fillStyle = degradado;
    ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);
  }

  // Camarón
  dibujarTextura(ctx, "camaron", jefe.x, jefe.y, jefe.ancho, jefe.alto, "#e8613a");

  // Balas del cerdito (jamones)
  balasJugador.forEach(function (bala) {
    dibujarTextura(ctx, "balaJamon", bala.x, bala.y, 24, 24, "#f4a6b8");
  });

  // Balas del camarón
  balasEnemigas.forEach(function (bala) {
    dibujarTextura(ctx, "balaCamaron", bala.x, bala.y, 18, 18, "#ff3b3b");
  });

  // Cerdito en el cohete (titila despacio mientras es invulnerable)
  const titila = jugador.invulnerable > 0 && Math.floor(jugador.invulnerable * 5) % 2 === 0;
  ctx.globalAlpha = titila ? 0.4 : 1;
  dibujarTextura(ctx, "cerditoCohete", jugador.x, jugador.y, jugador.ancho, jugador.alto, "#e0568a");
  ctx.globalAlpha = 1;

  // Punto débil: es lo único que las balas pueden tocar
  ctx.beginPath();
  ctx.arc(jugador.x, jugador.y, jugador.radio, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff3b3b";
  ctx.stroke();
}

/* ----- Controles del jefe (se configuran una sola vez) ----- */
function configurarControlesJefe() {
  const lienzo = document.getElementById("lienzo-jefe");

  // Dedo o lápiz: se arrastra (movimiento relativo, para no tapar al cerdito).
  // Mouse: el cerdito sigue al puntero.
  lienzo.addEventListener("pointerdown", function (evento) {
    if (estado.fase !== "jefe" || !jugador) {
      return;
    }
    if (arrastre !== null) {
      return;                                       // ya hay un dedo guiando: se ignora el segundo
    }
    arrastre = { id: evento.pointerId, x: evento.clientX, y: evento.clientY, jx: jugador.x, jy: jugador.y };
    lienzo.setPointerCapture(evento.pointerId);
  });

  lienzo.addEventListener("pointermove", function (evento) {
    if (estado.fase !== "jefe" || !jugador) {
      return;
    }
    const caja = lienzo.getBoundingClientRect();
    const escala = ANCHO_LIENZO / caja.width;     // de píxeles de pantalla a píxeles del juego
    if (evento.pointerType === "mouse") {
      jugador.x = limitar((evento.clientX - caja.left) * escala, 20, ANCHO_LIENZO - 20);
      jugador.y = limitar((evento.clientY - caja.top) * escala, Y_MINIMA_JUGADOR, ALTO_LIENZO - 25);
    } else if (arrastre !== null && evento.pointerId === arrastre.id) {
      jugador.x = limitar(arrastre.jx + (evento.clientX - arrastre.x) * escala, 20, ANCHO_LIENZO - 20);
      jugador.y = limitar(arrastre.jy + (evento.clientY - arrastre.y) * escala, Y_MINIMA_JUGADOR, ALTO_LIENZO - 25);
    }
  });

  function soltar(evento) {
    if (arrastre !== null && evento.pointerId === arrastre.id) {
      arrastre = null;
    }
  }
  lienzo.addEventListener("pointerup", soltar);
  lienzo.addEventListener("pointercancel", soltar);

  // Teclado
  const TECLAS_JUEGO = ["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", "shift"];
  document.addEventListener("keydown", function (evento) {
    const tecla = evento.key.toLowerCase();
    if (estado.fase === "jefe" && TECLAS_JUEGO.includes(tecla)) {
      teclas[tecla] = true;
      if (tecla.startsWith("arrow")) {
        evento.preventDefault();                  // que la página no se desplace
      }
    }
  });
  document.addEventListener("keyup", function (evento) {
    teclas[evento.key.toLowerCase()] = false;
  });

  // Si la ventana pierde el foco o se cambia de pestaña, se sueltan las teclas
  // (si no, el cerdito podría quedar "pegado" moviéndose solo).
  window.addEventListener("blur", soltarControles);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      soltarControles();
      pausarSonido();
    } else if (estado.fase !== "inicio" && estado.fase !== "fin") {
      iniciarSonido();
    }
  });
}

/* ----------------------------------------------------------
   7. ARRANQUE
   ---------------------------------------------------------- */
function iniciarJuego() {
  const botonComenzar = document.getElementById("btn-comenzar");
  botonComenzar.disabled = true;
  botonComenzar.textContent = "Cargando…";

  configurarControlesJefe();
  mostrarPantalla("pantalla-inicio");

  botonComenzar.addEventListener("click", empezar);
  document.getElementById("btn-sonido").addEventListener("click", alternarSonido);
  document.getElementById("btn-volver-victoria").addEventListener("click", empezar);
  document.getElementById("btn-volver-derrota").addEventListener("click", empezar);

  cargarTexturas(function () {
    botonComenzar.disabled = false;
    botonComenzar.textContent = "Comenzar";

    // Aviso para el grupo: qué texturas todavía no están puestas
    const faltan = texturasFaltantes();
    const aviso = document.getElementById("aviso-texturas");
    if (MOSTRAR_AVISO_TEXTURAS && faltan.length > 0) {
      aviso.textContent = "Texturas por colocar en img/texturas/: " + faltan.join(", ") +
        ". Mientras tanto se ven recuadros amarillos.";
      aviso.hidden = false;
    }
  });
}

if (document.getElementById("juego-app")) {
  iniciarJuego();
}
