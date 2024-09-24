self.onmessage = function (e) {
    const placeholders = e.data;
    let correcto = true;

    placeholders.forEach((placeholder, index) => {
        const pieza = placeholder.pieza;
        if (!pieza || pieza.split('-')[1] != index) {
            correcto = false;  // Si alguna pieza no está en su lugar, no se ha ganado aún
        }
    });

    // Enviamos el resultado de la verificación al script principal
    self.postMessage(correcto);
};
