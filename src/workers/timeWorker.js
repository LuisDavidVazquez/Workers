self.onmessage = (e) => {
    let tiempoRestante = e.data;

    const interval = setInterval(() => {
        if (tiempoRestante > 0) {
            tiempoRestante--;
            self.postMessage(tiempoRestante);
        } else {
            clearInterval(interval);
            self.postMessage(0);
        }
    }, 1000);
};
