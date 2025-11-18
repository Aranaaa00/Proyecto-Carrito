// Vaciando el carrito

//  *** Variables *** 
const carrito = document.querySelector('#carrito')
const contenedorCarrito = document.querySelector('#lista-carrito tbody')
const vaciarCarritoBtn = document.querySelector('#vaciar-carrito')
const listaCursos = document.querySelector('#lista-cursos')
let articulosCarrito = []

// Campos del formulario de búsqueda  
const formularioBusqueda = document.querySelector('#busqueda')
const inputBusqueda = document.querySelector('#buscador')

// Drag & Drop − Zona del carrito
const zonaDrop = document.querySelector('#carrito')

//  *** Listeners *** 
cargarEventListeners()
function cargarEventListeners () {
    listaCursos.addEventListener('click', añadirCurso)
    carrito.addEventListener('click', eliminarCurso)

    // Vaciar el carrito
    vaciarCarritoBtn.addEventListener('click', () => {
        articulosCarrito = []   // Vaciamos el array
        limpiarHTML()           // Limpiamos el HTML
        localStorage.removeItem('carrito')
    })

    formularioBusqueda.addEventListener('submit', validarBusqueda)

    // Al cargar el documento, cargamos el carrito desde localStorage
    document.addEventListener('DOMContentLoaded', () => {
        const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || []
        articulosCarrito = carritoGuardado
        carritoHTML()
    })

    // Activar Drag & Drop
    activarDragAndDrop()
}


//  *** Funciones *** 

// Función para validar el formulario de búsqueda
function validarBusqueda(e) {
    e.preventDefault()

    const texto = inputBusqueda.value.trim()

    // Campo vacío
    if (texto === "") {
        mostrarError("El campo de búsqueda no puede estar vacío")
        return
    }

    // Longitud mínima
    if (texto.length < 3) {
        mostrarError("Escribe al menos 3 caracteres para buscar")
        return
    }

    // Evitar código o XSS
    const regexInvalido = /<script>|<\/script>|javascript:/i
    if (regexInvalido.test(texto)) {
        mostrarError("Se han detectado caracteres no permitidos")
        inputBusqueda.value = ""
        return
    }

    // Caracteres permitidos
    const regexSeguro = /^[a-zA-Z0-9 áéíóúñÑ.-]+$/
    if (!regexSeguro.test(texto)) {
        mostrarError("Solo se permiten letras, números y signos básicos")
        return
    }

    // Si llega aquí → búsqueda válida
    console.log("🔎 Búsqueda válida:", texto)
}

// Función para mostrar errores visualmente
function mostrarError(mensaje) {
    const alerta = document.createElement("p")
    alerta.textContent = mensaje
    alerta.classList.add("error")

    formularioBusqueda.appendChild(alerta)

    setTimeout(() => alerta.remove(), 3000)
}

// Función para añadir cursos al carrito
function añadirCurso(e) {
    e.preventDefault()  
    if (e.target.classList.contains('agregar-carrito')) {  
        const curso = e.target.parentElement.parentElement 
        leerDatosCurso(curso)
    }
}

// Elimina cursos del carrito
function eliminarCurso(e) {
    if (e.target.classList.contains('borrar-curso')){
        const cursoId = e.target.getAttribute('data-id')
        articulosCarrito = articulosCarrito.filter((curso) => curso.id !== cursoId)
        carritoHTML(articulosCarrito)
    }
}

// Lee la información del curso seleccionado.
function leerDatosCurso(curso) {
    const infoCurso = {
        imagen:curso.querySelector('img').src,
        titulo:curso.querySelector('h4').textContent,
        precio:curso.querySelector('.precio span').textContent,
        id: curso.querySelector('a').getAttribute('data-id'),
        cantidad: 1
    }
    
    const existe = articulosCarrito.some(curso => curso.id === infoCurso.id)
    if (existe) {
        const cursos = articulosCarrito.map((curso) => {
            if (curso.id === infoCurso.id) {
                curso.cantidad ++
                return curso 
            } else {
                return curso
            }
        })
        articulosCarrito = [...cursos]
    } else {
        articulosCarrito = [...articulosCarrito, infoCurso]
    }
    carritoHTML(articulosCarrito)
}

// Muestra el carrito de compras en el HTML
function carritoHTML() {
    limpiarHTML()
    articulosCarrito.forEach((curso) => {
        const {imagen, titulo, precio, cantidad, id} = curso
        const row = document.createElement('tr')
        row.innerHTML = `
            <td> 
                <img src="${curso.imagen}" width="100">
            </td>
            <td>${titulo}</td>
            <td>${precio}</td>
            <td>${cantidad}</td>
            <td>
                <a href="#" class="borrar-curso" data-id="${id}">X</a>
            </td>
            `
        contenedorCarrito.appendChild(row)
    })

    // Cada vez que se actualiza el HTML, guardamos en localStorage
    sincronizarStorage()
}

// Guarda el carrito en localStorage
function sincronizarStorage() {
    localStorage.setItem('carrito', JSON.stringify(articulosCarrito))
}

// Función para limpiar el HTML (elimina los cursos del tbody)
function limpiarHTML() {
    while (contenedorCarrito.firstChild) {
        contenedorCarrito.firstChild.remove()
    }
}


function activarDragAndDrop() {

    // Hacer cada curso arrastrable
    document.querySelectorAll('.card').forEach(card => {
        card.setAttribute('draggable', 'true')

        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('curso-id', 
                card.querySelector('a').getAttribute('data-id'))

            // Efecto visual mientras arrastras
            e.dataTransfer.effectAllowed = "move"
        })
    })

    // Seleccionar la zona de drop correcta
    const zonaDrop = document.querySelector('#zona-drop-flotante')

    // Permitir soltar en la zonaDrop
    zonaDrop.addEventListener('dragover', e => {
        e.preventDefault()
        zonaDrop.classList.add('over')
    })

    zonaDrop.addEventListener('dragleave', e => {
        zonaDrop.classList.remove('over')
    })

    zonaDrop.addEventListener('drop', e => {
        e.preventDefault()
        zonaDrop.classList.remove('over')

        const id = e.dataTransfer.getData('curso-id')

        // Buscar el curso según su data-id
        const cursoSeleccionado = document.querySelector(
            `.card a[data-id="${id}"]`
        ).parentElement.parentElement

        leerDatosCurso(cursoSeleccionado)
    })
}