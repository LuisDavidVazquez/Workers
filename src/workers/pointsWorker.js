self.onmessage = function (e) {
    const { tiempoRestante, puntosActuales } = e.data;
    let puntos = ((tiempoRestante * 2) + 5) * 5;
    puntos = puntos + puntosActuales;
    self.postMessage(puntos);
};
