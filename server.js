const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(express.static('public'));

// ================================+
// RUTA PRINCIPAL
//===================================

app.get('/', (req, res)=> {
    res.send('API de control de Gastos funcionando');
});

//==================================
// BASE DE DATOS TEMPORAL
//==================================
let gastos = [];

//==================================
//CRUD GASTOS
//==================================

// GET -Listar gastos

app.get('/gastos', (req, res) => {
    res.json(gastos);
});

// POST -agregar gasto
app.post('/gastos', (req, res) =>{

    try {
        const gasto = req.body;

        if (!gasto.id || !gasto.fecha) {

            return res.status(400).json({
                mensaje: " Datos incompletos"
            });

            } 
            
            gastos.push(gasto);

            res.json({
                mensaje: "Gasto agregado correctamente "
            });
        } catch (error){

            res.status(500).json({
                mensaje: "Error al guardar gasto"
            });

        }
});

// GET - buscar gasto por ID
app.get('/gastos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const gasto = gastos.find(g => g.id === id);

    if (!gasto) {

        return res.status(404).json({
            mensaje: "Gastos no encontrado"
        });
    }

    res.json(gasto);
});

// PUT - actualizar gasto
app.put('/gastos/:id', (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const index = gastos.findIndex(g => g.id === id);

        if (index === -1) {

            return res.status(404).json({
                mensaje: "Gastos no encontrado"
            });
        }

        gastos[index] = {
            ...req.body,
            id:id
        };

        res.json({

                mensaje: "Gasto actualizado"
            });
        } catch (error) {

            res.status(500).json({
                mensaje: "Error al actualizar gasto"
            });
        }
        
    
});

// DELETE -eliminar gasto
app.delete('/gastos/:id', (req, res) => {

    const id = parseInt(req.params.id);

    gastos = gastos.filter(g => g.id !== id);

    res.json({
     
   mensaje: "Gasto eliminado"
    });
});
//================================
// SERVIDOR
//===============================

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});