document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.getElementById('puzzle-board');
    const shuffleButton = document.getElementById('shuffle');
    const puntosDisplay = document.getElementById('puntos');
    const tiempoDisplay = document.getElementById('tiempo');
    
    let puntos = 100;
    let tiempo = 60; // 60 segundos de juego
    let piezas = [];
    
    // Crear el tablero con las piezas
    function createPuzzle() {
        for (let i = 1; i <= 16; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.innerText = i;
            piece.setAttribute('draggable', true); // Permitir arrastrar las piezas
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragover', handleDragOver);
            piece.addEventListener('drop', handleDrop);
            puzzleBoard.appendChild(piece);
            piezas.push(piece);
        }
    }

    // Función para mezclar las piezas del rompecabezas
    function shufflePuzzle() {
        const shuffledPieces = piezas.sort(() => Math.random() - 0.5);
        puzzleBoard.innerHTML = ''; // Limpiar el tablero
        shuffledPieces.forEach(piece => puzzleBoard.appendChild(piece));
    }

    // Lógica para el manejo del arrastre y soltado
    let draggedElement = null;

    function handleDragStart(e) {
        draggedElement = e.target;
        setTimeout(() => draggedElement.classList.add('dragging'), 0);
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        const targetElement = e.target;

        // Intercambiar las posiciones de las piezas
        if (targetElement.classList.contains('puzzle-piece')) {
            const draggedParent = draggedElement.parentNode;
            const targetParent = targetElement.parentNode;

            targetParent.replaceChild(draggedElement, targetElement);
            draggedParent.appendChild(targetElement);
        }

        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }

    // Temporizador del juego
    function startTimer() {
        const timer = setInterval(() => {
            if (tiempo > 0) {
                tiempo--;
                tiempoDisplay.innerText = tiempo;
            } else {
                clearInterval(timer);
                alert('¡Se acabó el tiempo!');
            }
        }, 1000);
    }

    // Evento para mezclar las piezas
    shuffleButton.addEventListener('click', () => {
        shufflePuzzle();
    });

    createPuzzle(); // Crear el rompecabezas cuando cargue la página
    startTimer();   // Iniciar el temporizador cuando cargue la página
});
