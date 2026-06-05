// Maneja la exportacion de gastos a Excel y PDF

//Excel
export function iniciarExportaciones(currentUser) {

    const exportExcelBtn = document.getElementById('export-excel');
    const exportPdfBtn = document.getElementById('export-pdf');

    exportExcelBtn.addEventListener('click', () => {
        if (!currentUser.gastos || currentUser.gastos.length === 0) {
            Swal.fire('Sin datos', 'No hay gastos para exportar.', 'info');
            return;
        }

        const worker = new Worker('../js/export-worker.js');
        worker.postMessage({ type: 'excel', data: currentUser.gastos });

        worker.onmessage = function (e) {
            const { encabezado, filas } = e.data;

            // Armar filas como objetos usando el encabezado del worker
            const datos = filas.map(fila => ({
                [encabezado[0]]: fila[0],
                [encabezado[1]]: fila[1],
                [encabezado[2]]: fila[2],
                [encabezado[3]]: fila[3]
            }));

            const hoja = XLSX.utils.json_to_sheet(datos);

            // Estilo y texto de los encabezados
            encabezado.forEach((titulo, i) => {
                const celda = XLSX.utils.encode_cell({ r: 0, c: i });
                hoja[celda].v = titulo.toUpperCase();
                hoja[celda].s = {
                    font: { bold: true, color: { rgb: '555555' } },
                    fill: { fgColor: { rgb: 'F5F5F5' } },
                    border: {
                        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } }
                    }
                };
            });

            // Ancho de columnas
            hoja['!cols'] = [
                { wch: 18 },
                { wch: 28 },
                { wch: 14 },
                { wch: 24 }
            ];

            // Altura de filas
            hoja['!rows'] = filas.map(() => ({ hpt: 18 }));
            hoja['!rows'].unshift({ hpt: 22 }); // encabezado un poco mas alto

            // Rango con nombre para que Excel lo reconozca como tabla
            hoja['!autofilter'] = { ref: hoja['!ref'] };

            const libro = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(libro, hoja, 'Gastos');
            if (currentUser.budget) {
                XLSX.utils.sheet_add_aoa(hoja, [
                    [],
                    ['', 'Total Gastado', `$${currentUser.gastos.reduce((t, g) => t + g.amount, 0).toFixed(2)}`, ''],
                    ['', 'Presupuesto', `$${parseFloat(currentUser.budget).toFixed(2)}`, '']
                ], { origin: -1 });
            }
            XLSX.writeFile(libro, 'gastos.xlsx');
            worker.terminate();
        };
    });


    //PDF
    exportPdfBtn.addEventListener('click', () => {
        if (!currentUser.gastos || currentUser.gastos.length === 0) {
            Swal.fire('Sin datos', 'No hay gastos para exportar.', 'info');
            return;
        }

        const worker = new Worker('../js/export-worker.js');
        worker.postMessage({ type: 'pdf', data: currentUser.gastos, budget: currentUser.budget || null });

        worker.onmessage = function (e) {
            const { filas } = e.data;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Titulo
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(30, 30, 30);
            doc.text('Reporte de Gastos', 14, 20);

            // Fecha de generacion
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(160, 160, 160);
            doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 27);

            // Agregar esta línea:
            if (e.data.budget) {
                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80);
                doc.text(`Presupuesto: $${parseFloat(e.data.budget).toFixed(2)}`, 14, 33);
            }

            // Tabla
            doc.autoTable({
                startY: 40,
                head: [['ID', 'Gasto', 'Monto', 'Fecha']],
                body: filas,
                styles: {
                    fontSize: 10,
                    cellPadding: 6,
                    textColor: [50, 50, 50],
                    lineColor: [220, 220, 220],
                    lineWidth: 0.2,
                },
                headStyles: {
                    fillColor: [245, 245, 245],
                    textColor: [80, 80, 80],
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [250, 250, 250],
                },
                columnStyles: {
                    2: { halign: 'right' },
                }
            });

            doc.save('gastos.pdf');
            worker.terminate();
        };
    });
}