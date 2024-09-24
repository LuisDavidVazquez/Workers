let tiempoRestante = 30;
let puntos = 0;
let timeWorker;
let pointsWorker;
let winWorker;

const imagenes = [
    'imagen-0', 'imagen-1', 'imagen-2',
    'imagen-3', 'imagen-4', 'imagen-5',
    'imagen-6', 'imagen-7', 'imagen-8'
];

const puzzle = document.getElementById('puzzle');
const piezas = document.getElementById('piezas');

const ventanaGanar = document.getElementById('ventana-ganar');
const ventanaPerder = document.getElementById('ventana-perder');
const mensajeGanar = document.getElementById('mensaje-ganar');
const mensajePerder = document.getElementById('mensaje-perder');

// Botones
document.getElementById('siguiente-nivel').addEventListener('click', () => {
    window.location.href = 'siguiente-nivel.html'; // Cambia la URL según el nivel siguiente
});

document.getElementById('salir').addEventListener('click', () => {
    window.location.href = '../../index.html'; // Cambia la URL de la página de salida
});

// Cargar las piezas de forma aleatoria en el área de piezas
while (imagenes.length) {
    const index = Math.floor(Math.random() * imagenes.length);
    const div = document.createElement('div');
    div.className = 'pieza';
    div.id = imagenes[index];
    div.draggable = true;
    div.style.backgroundImage = `url("../recursos/${imagenes[index]}.jpg")`;
    piezas.appendChild(div);
    imagenes.splice(index, 1);
}

// Crear los contenedores (placeholders) en el área del puzzle
for (let i = 0; i < 9; i++) {
    const div = document.createElement('div');
    div.className = 'placeholder';
    div.dataset.id = i;
    puzzle.appendChild(div);
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
            clearTimeout(timeWorker); // Detenemos el tiempo si ya ganaste
            ventanaGanar.style.display = "block"; // Mostrar ventana de victoria
            if (timeWorker) {
                timeWorker.terminate(); // Termina el worker del tiempo
            }
        }
    };
}

function startTimer() {
    if (typeof Worker !== "undefined") {
        if (typeof timeWorker === "undefined") {
            timeWorker = new Worker("../workers/timeWorker.js");
            timeWorker.postMessage(tiempoRestante);
            timeWorker.onmessage = (e) => {
                tiempoRestante = e.data;
                document.getElementById("tiempo").innerText = tiempoRestante;
                if (tiempoRestante <= 0) {
                    ventanaPerder.style.display = "block"; // Mostrar ventana de derrota
                    clearTimeout(timeWorker);
                    timeWorker.terminate();
                }
            };
        }
    }
}

function calculatePoints(tiempoRestante, puntosActuales) {
    if (typeof Worker !== "undefined") {
        if (typeof pointsWorker === "undefined") {
            pointsWorker = new Worker("../workers/pointsWorker.js");
            pointsWorker.postMessage({ tiempoRestante, puntosActuales });
            pointsWorker.onmessage = (e) => {
                puntos += e.data;
                document.getElementById("puntos").innerText = puntos;
                pointsWorker.terminate();
                pointsWorker = undefined;
            };
        }
    }
}

startTimer();
