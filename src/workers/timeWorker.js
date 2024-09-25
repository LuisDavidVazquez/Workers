let interval;

self.onmessage = (e) => {
    if (e.data.command === 'start') {
        let tiempoRestante = e.data.time;

        if (interval) {
            clearInterval(interval);
        }

        // Iniciamos el nuevo temporizador
        interval = setInterval(() => {
            if (tiempoRestante > 0) {
                tiempoRestante--;
                self.postMessage(tiempoRestante);
            } else {
                clearInterval(interval);
                self.postMessage(0);
            }
        }, 1000);
    }

    if (e.data.command === 'stop') {
        clearInterval(interval);
    }
};
