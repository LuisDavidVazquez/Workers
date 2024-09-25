let tiempoRestante = 60;
let puntos = 0; // Puntos acumulados
let timeWorker;
let pointsWorker;
let winWorker;
let nivelActual = 0; // Índice del nivel actual del rompecabezas
const tiempoExtraPorNivel = 15; // Tiempo extra que se agregará por cada nivel completado

const rompecabezas = [
    'rompecabezas-0', 'rompecabezas-1', 'rompecabezas-2',
    'rompecabezas-3', 'rompecabezas-4', 'rompecabezas-5',
];

const imagenes = [
    'imagen-0', 'imagen-1', 'imagen-2',
    'imagen-3', 'imagen-4', 'imagen-5',
    'imagen-6', 'imagen-7', 'imagen-8'
];

const puzzle = document.getElementById('puzzle');
const piezas = document.getElementById('piezas');
const ventanaGanar = document.getElementById('ventana-ganar');
const ventanaPerder = document.getElementById('ventana-perder');
const puntosPerdidos = document.getElementById('puntos-perdidos');

// Botones
document.getElementById('siguiente-nivel').addEventListener('click', () => {
    nivelActual++;
    if (nivelActual < rompecabezas.length) {
        cargarRompecabezas();  // Cargar el siguiente rompecabezas
        ventanaGanar.style.display = "none";  // Ocultar la ventana de victoria
        tiempoRestante += tiempoExtraPorNivel;  // Agregar tiempo extra por el nivel completado
        resetTimer();  // Reiniciar el temporizador
    } else {
        alert('¡Has completado todos los niveles!');  // Si no hay más niveles
    }
});

document.getElementById('salir').addEventListener('click', () => {
    window.location.href = '../../index.html'; // Cambia la URL de la página de salida
});

// Función para cargar el rompecabezas correspondiente al nivel actual
function cargarRompecabezas() {
    // Limpiar las piezas y el puzzle actuales
    puzzle.innerHTML = '';
    piezas.innerHTML = '';

    // Cargar las piezas del nuevo rompecabezas
    const rutaRompecabezas = `../assets/images/${rompecabezas[nivelActual]}/`;
    const imagenesTemp = [...imagenes];  // Copiar el array de imágenes

    // Cargar las piezas de forma aleatoria en el área de piezas
    while (imagenesTemp.length) {
        const index = Math.floor(Math.random() * imagenesTemp.length);
        const div = document.createElement('div');
        div.className = 'pieza';
        div.id = imagenesTemp[index];
        div.draggable = true;
        div.style.backgroundImage = `url("${rutaRompecabezas}${imagenesTemp[index]}.jpg")`;
        piezas.appendChild(div);
        imagenesTemp.splice(index, 1);
    }

    // Crear los contenedores (placeholders) en el área del puzzle
    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.className = 'placeholder';
        div.dataset.id = i;
        puzzle.appendChild(div);
    }
}

// Drag & Drop: iniciar el arrastre
document.addEventListener('dragstart', e => {
    if (e.target.classList.contains('pieza')) {
        e.dataTransfer.setData('id', e.target.id);
    }
});

// Permitir el arrastre sobre las áreas del rompecabezas o área de piezas disponibles
document.addEventListener('dragover', e => {
    e.preventDefault();
    if ((e.target.classList.contains('placeholder') && !e.target.firstChild) || e.target.id === 'piezas') {
        e.target.classList.add('hover');
    }
});

// Remover el hover al salir del área de arrastre
document.addEventListener('dragleave', e => {
    e.target.classList.remove('hover');
});

// Soltar la pieza en la zona correspondiente
document.addEventListener('drop', e => {
    e.target.classList.remove('hover');
    const id = e.dataTransfer.getData('id');
    const pieza = document.getElementById(id);

    // Verificar que el lugar esté vacío antes de añadir la pieza
    if ((e.target.classList.contains('placeholder') && !e.target.firstChild) || e.target.id === 'piezas') {
        e.target.appendChild(pieza);
        verificarConWorker(); // Llamamos al winWorker para verificar la victoria
    }
});

// Función que usa el winWorker para verificar si todas las piezas están en su lugar correcto
function verificarConWorker() {
    const placeholders = Array.from(document.querySelectorAll('.placeholder')).map(placeholder => ({
        pieza: placeholder.firstChild ? placeholder.firstChild.id : null
    }));

    // Creamos el worker si no ha sido creado aún
    if (typeof winWorker === "undefined") {
        winWorker = new Worker("../workers/winWorker.js");
    }

    // Enviamos los datos al worker para verificar
    winWorker.postMessage(placeholders);

    // El worker envía de vuelta si el rompecabezas está en la posición correcta
    winWorker.onmessage = function (e) {
        const correcto = e.data;
        if (correcto) {
            calculatePoints(tiempoRestante, puntos);
            detenerTimer(); // Detener el temporizador si ya ganaste
            ventanaGanar.style.display = "block"; // Mostrar ventana de victoria
        }
    };
}

function startTimer() {
    if (typeof Worker !== "undefined") {
        if (typeof timeWorker !== "undefined") {
            detenerTimer(); // Detener el timer anterior antes de iniciar uno nuevo
        }
        timeWorker = new Worker("../workers/timeWorker.js");
        timeWorker.postMessage({ command: 'start', time: tiempoRestante });
        timeWorker.onmessage = (e) => {
            tiempoRestante = e.data;
            document.getElementById("tiempo").innerText = tiempoRestante;
            if (tiempoRestante <= 0) {
                mostrarPantallaDerrota(); // Mostrar ventana de derrota
                detenerTimer();
            }
        };
    }
}

function detenerTimer() {
    if (timeWorker) {
        timeWorker.postMessage({ command: 'stop' });
        clearTimeout(timeWorker);
    }
}

function resetTimer() {
    document.getElementById("tiempo").innerText = tiempoRestante;
    startTimer();  // Reiniciar el temporizador
}

function calculatePoints(tiempoRestante, puntosActuales) {
    if (typeof Worker !== "undefined") {
        if (typeof pointsWorker === "undefined") {
            pointsWorker = new Worker("../workers/pointsWorker.js");
            pointsWorker.postMessage({ tiempoRestante, puntosActuales });
            pointsWorker.onmessage = (e) => {
                puntos += e.data; // Acumular puntos
                document.getElementById("puntos").innerText = puntos;
                pointsWorker.terminate();
                pointsWorker = undefined;
            };
        }
    }
}

function mostrarPantallaDerrota() {
    ventanaPerder.style.display = "block"; // Mostrar la ventana de derrota
    document.getElementById("puntos-perdidos").innerText = puntos; // Mostrar los puntos acumulados
}

startTimer();
cargarRompecabezas();  // Cargar el primer rompecabezas al iniciar el juego
