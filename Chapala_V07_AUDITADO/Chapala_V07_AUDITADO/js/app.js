/* ==========================================================
   Carnicería Chapala – js/app.js (V06)
   Proyecto escolar – 1.º BTI – Colegio Nacional de Villarrica
   ----------------------------------------------------------
   Este archivo tiene tres partes:
   1. DATOS: el catálogo con los seis productos y sus precios
      (precios ILUSTRATIVOS, sujetos a confirmación).
   2. UTILIDADES: funciones chicas que usan el simulador y el juego.
   3. SIMULADOR DE COMPRAS: solo se activa en la página que lo tiene.

   Este programa NO guarda datos (no usa localStorage ni cookies),
   NO envía nada por internet y NO pide datos personales.
   ========================================================== */

"use strict";   /* modo estricto: JavaScript avisa de errores comunes */

/* ----------------------------------------------------------
   1. DATOS
   ---------------------------------------------------------- */

// Arreglo (array) de objetos: cada producto tiene sus propiedades.
// Los precios son los mismos que ya estaban en la tabla de la página.
const PRODUCTOS = [
  { id: "jamon-porcino",   nombre: "Jamón porcino",   categoria: "Cerdo",     precioKg: 30000, imagen: "img/yupi-de-cerdo.png",   alt: "Yupi de cerdo" },
  { id: "chorizo",         nombre: "Chorizo",         categoria: "Embutidos", precioKg: 20000, imagen: "img/chorizo.png",         alt: "Chorizo entero y en rodajas" },
  { id: "carne-molida",    nombre: "Carne molida",    categoria: "Molidos",   precioKg: 18000, imagen: "img/carne-molida.png",    alt: "Carne molida cruda" },
  { id: "alitas",          nombre: "Alitas",          categoria: "Pollo",     precioKg: 15000, imagen: "img/alitas.png",          alt: "Alitas de pollo crudas" },
  { id: "pata-de-pollo",   nombre: "Pata de pollo",   categoria: "Pollo",     precioKg: 16000, imagen: "img/pata-de-pollo.png",   alt: "Patas de pollo crudas" },
  { id: "pierna-de-cerdo", nombre: "Pierna de cerdo", categoria: "Cerdo",     precioKg: 30000, imagen: "img/pierna-de-cerdo.png", alt: "Pierna de cerdo cruda" }
];

// Constantes (valores que no cambian) para las cantidades del simulador.
const CANTIDAD_MINIMA = 0.5;   // kg
const CANTIDAD_MAXIMA = 20;    // kg
const PASO = 0.5;              // las cantidades van de a medio kilo

/* ----------------------------------------------------------
   2. UTILIDADES (funciones reutilizables)
   ---------------------------------------------------------- */

// Busca un producto por su id. Devuelve el objeto o undefined.
function buscarProducto(id) {
  return PRODUCTOS.find(function (producto) {
    return producto.id === id;
  });
}

// Devuelve solo el precio por kg de un producto.
function precioDe(id) {
  return buscarProducto(id).precioKg;
}

// 18000 -> "18.000 Gs."  (puntos de miles, como se escribe en Paraguay)
function formatearGs(monto) {
  const entero = String(Math.round(monto));
  return entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " Gs.";
}

// 1.5 -> "1,5 kg"  (coma decimal)
function formatearKg(kg) {
  return String(kg).replace(".", ",") + " kg";
}

/* ----------------------------------------------------------
   3. SIMULADOR DE COMPRAS
   Se activa solo si la página tiene un elemento con id="simulador".
   ---------------------------------------------------------- */

function iniciarSimulador() {

  /* ----- Estado: la "memoria" del simulador -----
     "pedido" es un arreglo. Cada elemento es { id: "chorizo", kg: 1.5 }.
     Todo lo que se ve en pantalla se dibuja a partir de este arreglo. */
  let pedido = [];

  /* ----- Elementos de la página (DOM) ----- */
  const contenedorOpciones = document.getElementById("selector-productos");
  const listaPedido = document.getElementById("lista-pedido");
  const mensajeVacio = document.getElementById("pedido-vacio");
  const textoTotal = document.getElementById("total-pedido");
  const textoCantidad = document.getElementById("cantidad-items");
  const botonVaciar = document.getElementById("btn-vaciar");
  const estado = document.getElementById("estado-sim");

  /* ----- Funciones de datos (no tocan la pantalla) ----- */

  // Convierte lo que escribió la persona en una cantidad válida.
  // Acepta "1,5" o "1.5"; redondea a múltiplos de 0,5; respeta mínimo y máximo.
  function normalizarCantidad(valor) {
    let kg = parseFloat(String(valor).replace(",", "."));
    if (Number.isNaN(kg)) {
      kg = CANTIDAD_MINIMA;
    }
    kg = Math.round(kg / PASO) * PASO;
    if (kg < CANTIDAD_MINIMA) {
      kg = CANTIDAD_MINIMA;
    }
    if (kg > CANTIDAD_MAXIMA) {
      kg = CANTIDAD_MAXIMA;
    }
    return kg;
  }

  function buscarEnPedido(id) {
    return pedido.find(function (item) {
      return item.id === id;
    });
  }

  function agregarProducto(id) {
    if (!buscarEnPedido(id)) {
      pedido.push({ id: id, kg: 1 });   // empieza con 1 kg
    }
  }

  function quitarProducto(id) {
    pedido = pedido.filter(function (item) {
      return item.id !== id;
    });
  }

  // Subtotal = precio por kilo × cantidad de kilos
  function calcularSubtotal(item) {
    return Math.round(precioDe(item.id) * item.kg);
  }

  // Total = suma de todos los subtotales
  function calcularTotal() {
    let total = 0;
    for (const item of pedido) {
      total = total + calcularSubtotal(item);
    }
    return total;
  }

  /* ----- Funciones de pantalla (DOM) ----- */

  function avisar(texto) {
    estado.textContent = texto;   // lo leen también los lectores de pantalla
  }

  // Crea un elemento HTML con clase y texto (evita repetir código).
  function crear(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) {
      elemento.className = clase;
    }
    if (texto !== undefined) {
      elemento.textContent = texto;
    }
    return elemento;
  }

  // Dibuja las seis tarjetas con casilla, a partir del arreglo PRODUCTOS.
  function crearOpciones() {
    for (const producto of PRODUCTOS) {
      const caja = crear("div", "opcion");

      const casilla = document.createElement("input");
      casilla.type = "checkbox";
      casilla.id = "sim-" + producto.id;
      casilla.value = producto.id;

      const etiqueta = document.createElement("label");
      etiqueta.htmlFor = casilla.id;

      const foto = document.createElement("img");
      foto.src = producto.imagen;
      foto.alt = "";                       // el nombre ya está escrito al lado
      foto.width = 90;
      foto.height = 90;

      etiqueta.appendChild(foto);
      etiqueta.appendChild(crear("span", "nombre", producto.nombre));
      etiqueta.appendChild(crear("span", "precio-opcion", formatearGs(producto.precioKg) + " por kg"));

      caja.appendChild(casilla);
      caja.appendChild(etiqueta);
      contenedorOpciones.appendChild(caja);
    }
  }

  // Crea un botoncito (+, − o Quitar) que sabe a qué producto pertenece.
  function crearBoton(texto, accion, id, descripcion) {
    const boton = crear("button", "", texto);
    boton.type = "button";
    boton.dataset.accion = accion;         // data-accion="mas", "menos" o "quitar"
    boton.dataset.id = id;
    boton.setAttribute("aria-label", descripcion);
    return boton;
  }

  // Crea la fila de un producto dentro del pedido.
  function crearFila(item) {
    const producto = buscarProducto(item.id);
    const fila = crear("li", "fila-pedido");

    // Nombre y precio por kg
    const info = crear("div", "fila-info");
    info.appendChild(crear("strong", "", producto.nombre));
    info.appendChild(crear("span", "", formatearGs(producto.precioKg) + " por kg"));

    // Control de cantidad: [−] [ 1.5 ] kg [+]
    const control = crear("div", "cantidad");
    control.appendChild(crearBoton("−", "menos", item.id, "Disminuir cantidad de " + producto.nombre));

    const campo = document.createElement("input");
    campo.type = "number";
    campo.min = CANTIDAD_MINIMA;
    campo.max = CANTIDAD_MAXIMA;
    campo.step = PASO;
    campo.value = item.kg;
    campo.dataset.accion = "cantidad";
    campo.dataset.id = item.id;
    campo.setAttribute("aria-label", "Cantidad en kilogramos de " + producto.nombre);
    control.appendChild(campo);

    control.appendChild(crear("span", "unidad", "kg"));
    control.appendChild(crearBoton("+", "mas", item.id, "Aumentar cantidad de " + producto.nombre));

    // Subtotal
    const subtotal = crear("p", "subtotal", "Subtotal: ");
    subtotal.appendChild(crear("strong", "", formatearGs(calcularSubtotal(item))));

    // Quitar
    const quitar = crearBoton("Quitar", "quitar", item.id, "Quitar " + producto.nombre + " del pedido");
    quitar.className = "quitar";

    fila.appendChild(info);
    fila.appendChild(subtotal);
    fila.appendChild(control);
    fila.appendChild(quitar);
    return fila;
  }

  // Vuelve a dibujar todo según el estado actual del pedido.
  function dibujar() {
    // 1) Sincroniza las casillas con el pedido
    const casillas = contenedorOpciones.querySelectorAll("input[type='checkbox']");
    for (const casilla of casillas) {
      casilla.checked = Boolean(buscarEnPedido(casilla.value));
    }

    // 2) Reconstruye la lista del pedido
    listaPedido.innerHTML = "";            // vacía la lista (no hay datos de personas)
    for (const item of pedido) {
      listaPedido.appendChild(crearFila(item));
    }

    // 3) Muestra u oculta el mensaje de "pedido vacío"
    const hayProductos = pedido.length > 0;
    mensajeVacio.hidden = hayProductos;
    listaPedido.hidden = !hayProductos;

    // 4) Actualiza total, cantidad de productos y botón de vaciar
    textoTotal.textContent = formatearGs(calcularTotal());
    textoCantidad.textContent = pedido.length;
    botonVaciar.disabled = !hayProductos;
  }

  // Después de redibujar, devuelve el foco al control que se estaba usando
  // (así quien usa el teclado no se "pierde").
  function devolverFoco(id, accion) {
    const selector = "[data-id='" + id + "'][data-accion='" + accion + "']";
    const elemento = listaPedido.querySelector(selector);
    if (elemento) {
      elemento.focus();
    }
  }

  /* ----- Cambiar una cantidad (lo usan +, − y el campo numérico) ----- */
  function cambiarCantidad(id, valorNuevo, accion) {
    const item = buscarEnPedido(id);
    if (!item) {
      return;
    }
    const nueva = normalizarCantidad(valorNuevo);
    const producto = buscarProducto(id);
    item.kg = nueva;
    dibujar();
    devolverFoco(id, accion);

    if (nueva === CANTIDAD_MINIMA && Number(valorNuevo) < CANTIDAD_MINIMA) {
      avisar("La cantidad mínima es " + formatearKg(CANTIDAD_MINIMA) + ".");
    } else if (nueva === CANTIDAD_MAXIMA && Number(valorNuevo) > CANTIDAD_MAXIMA) {
      avisar("La cantidad máxima del simulador es " + formatearKg(CANTIDAD_MAXIMA) + ".");
    } else {
      avisar(producto.nombre + ": " + formatearKg(nueva) + ". Total: " + formatearGs(calcularTotal()));
    }
  }

  /* ----- EVENTOS ----- */

  // Marcar o desmarcar una casilla agrega o quita el producto.
  contenedorOpciones.addEventListener("change", function (evento) {
    const casilla = evento.target;
    if (casilla.type !== "checkbox") {
      return;
    }
    const producto = buscarProducto(casilla.value);
    if (casilla.checked) {
      agregarProducto(casilla.value);
      dibujar();
      avisar(producto.nombre + " agregado (1 kg). Total: " + formatearGs(calcularTotal()));
    } else {
      quitarProducto(casilla.value);
      dibujar();
      avisar(producto.nombre + " quitado. Total: " + formatearGs(calcularTotal()));
    }
  });

  // Botones +, − y Quitar (un solo "oyente" para toda la lista).
  listaPedido.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button");
    if (!boton) {
      return;
    }
    const id = boton.dataset.id;
    const item = buscarEnPedido(id);
    if (!item) {
      return;
    }

    if (boton.dataset.accion === "mas") {
      cambiarCantidad(id, item.kg + PASO, "mas");
    } else if (boton.dataset.accion === "menos") {
      cambiarCantidad(id, item.kg - PASO, "menos");
    } else if (boton.dataset.accion === "quitar") {
      const nombre = buscarProducto(id).nombre;
      quitarProducto(id);
      dibujar();
      document.getElementById("sim-" + id).focus();   // el foco vuelve a la casilla
      avisar(nombre + " quitado. Total: " + formatearGs(calcularTotal()));
    }
  });

  // Cuando la persona termina de escribir una cantidad en el campo.
  listaPedido.addEventListener("change", function (evento) {
    const campo = evento.target;
    if (campo.dataset.accion === "cantidad") {
      cambiarCantidad(campo.dataset.id, campo.value, "cantidad");
    }
  });

  // Botón "Vaciar pedido".
  botonVaciar.addEventListener("click", function () {
    pedido = [];
    dibujar();
    contenedorOpciones.querySelector("input").focus();
    avisar("Pedido vaciado. Puede empezar de nuevo. Total: " + formatearGs(0));
  });

  /* ----- Arranque ----- */
  crearOpciones();
  dibujar();
}

/* ----------------------------------------------------------
   Arranque del archivo: se ejecuta cuando la página ya cargó.
   ---------------------------------------------------------- */
if (document.getElementById("simulador")) {
  iniciarSimulador();
}
