self.onmessage = function(e) {

    const gastos = e.data;

    let suma = 0;

    gastos.forEach(gasto => {
        suma +=
             gasto.alimentacion +
             gasto.educacion +
             gasto.gMedicos +
             gasto.gTransporte +
             gasto.gArrendamiento +
             gasto.otrosGastos;

    });

    self.postMessage(suma);
};