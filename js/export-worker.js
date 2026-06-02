// Worker que construye el contenido de los archivos de exportacion

self.onmessage = function (e) {
    const { type, data } = e.data;

    if (type === 'excel') {
        // Construye el CSV que SheetJS convertira a .xlsx
        const encabezado = ['ID', 'Gasto', 'Monto', 'Fecha'];
        const filas = data.map(g => [
            String(g.id),
            g.name,
            `$${g.amount.toFixed(2)}`,
            g.date
        ]);
        self.postMessage({ type: 'excel', encabezado, filas });

    } else if (type === 'pdf') {
        // Construye las filas limpias para la tabla del PDF
        const filas = data.map(g => [
            String(g.id).slice(-6),
            g.name,
            `$${g.amount.toFixed(2)}`,
            g.date
        ]);
        self.postMessage({ type: 'pdf', filas });
    }
};